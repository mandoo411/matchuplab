/**
 * MatchUp LAB - 리그순위 JSON fetch + API → 렌더 포맷 변환 + 더미 fallback
 */
const MatchUpStandingsLoader = (function () {
  'use strict';

  const DATA_URLS = {
    football: 'data/standings-football.json',
    baseball: 'data/standings-baseball.json',
    basketball: 'data/standings-basketball.json',
    volleyball: 'data/standings-volleyball.json',
  };

  const MLB_GROUP_TO_ID = {
    AL동부: 'alEast',
    AL중부: 'alCentral',
    AL서부: 'alWest',
    AL와일드카드: 'alWildCard',
    NL동부: 'nlEast',
    NL중부: 'nlCentral',
    NL서부: 'nlWest',
    NL와일드카드: 'nlWildCard',
  };

  const FORM_PATTERNS_LOADER = [
    ['W', 'W', 'D', 'L', 'W'],
    ['W', 'L', 'W', 'W', 'D'],
    ['L', 'W', 'W', 'D', 'W'],
    ['W', 'D', 'W', 'L', 'W'],
    ['D', 'W', 'W', 'W', 'L'],
  ];

  function isEmptyData(val) {
    if (val == null) return true;
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === 'object') {
      return Object.values(val).every(isEmptyData);
    }
    return false;
  }

  function pickData(apiVal, fallbackVal) {
    return isEmptyData(apiVal) ? fallbackVal : apiVal;
  }

  function parseFormString(form) {
    if (!form || typeof form !== 'string') return ['W', 'W', 'L', 'W', 'L'];
    const arr = form.split('').filter((c) => c === 'W' || c === 'D' || c === 'L');
    while (arr.length < 5) arr.push(arr.length % 2 === 0 ? 'W' : 'L');
    return arr.slice(0, 5);
  }

  function buildFormNoDraw(index) {
    const form = FORM_PATTERNS_LOADER[index % FORM_PATTERNS_LOADER.length].filter((r) => r !== 'D');
    while (form.length < 5) form.push(form.length % 2 === 0 ? 'W' : 'L');
    return form.slice(0, 5);
  }

  function formatBaseballWinRate(pct) {
    if (pct == null) return '.000';
    let n = parseFloat(pct);
    if (Number.isNaN(n)) return '.000';
    if (n > 1) n /= 100;
    const fixed = n.toFixed(3);
    return fixed.startsWith('0') ? fixed.slice(1) : fixed;
  }

  function formatBasketballWinRate(pct) {
    if (pct == null) return '0.000';
    let n = parseFloat(pct);
    if (Number.isNaN(n)) return '0.000';
    if (n > 1) n /= 100;
    return n.toFixed(3);
  }

  function calcGamesBack(leaderWins, teamWins) {
    const gb = (leaderWins - teamWins) / 2;
    return gb <= 0 ? '0.0' : gb.toFixed(1);
  }

  function formatBasketballRecord(val) {
    if (val == null) return '-';
    if (typeof val === 'string') {
      if (val.includes('승')) return val;
      const m = val.match(/(\d+)\s*[-–]\s*(\d+)/);
      if (m) return `${m[1]}승${m[2]}패`;
      return val;
    }
    if (typeof val === 'object') {
      const w = val.win ?? val.wins ?? val.total ?? 0;
      const l = val.lose ?? val.loss ?? val.losses ?? 0;
      return `${w}승${l}패`;
    }
    return String(val);
  }

  function formatStreak(streak) {
    if (streak == null) return '-';
    if (typeof streak === 'number') return streak > 0 ? `${streak}승` : `${Math.abs(streak)}패`;
    return String(streak);
  }

  function formatRatio(val) {
    if (val == null) return '-';
    const n = parseFloat(val);
    if (Number.isNaN(n)) return String(val);
    return n.toFixed(3);
  }

  // --- Football ---
  function transformFootballLeague(rows, leagueKey) {
    return rows.map((row, i) => {
      const name = translateTeamName(row.team?.name, leagueKey);
      const scored = row.goals?.for ?? (row.goalsDiff != null ? Math.max(30 + (rows.length - i) * 2, 0) : 0);
      const conceded = row.goals?.against ?? (row.goalsDiff != null ? Math.max(scored - row.goalsDiff, 0) : 0);
      return {
        rank: row.rank,
        name,
        played: row.all?.played ?? 0,
        win: row.all?.win ?? 0,
        draw: row.all?.draw ?? 0,
        loss: row.all?.lose ?? 0,
        scored,
        conceded,
        goalDiff: row.goalsDiff ?? scored - conceded,
        points: row.points ?? 0,
        form: parseFormString(row.form),
        nextOpponent: '-',
        nextMatchPending: true,
      };
    });
  }

  // --- Baseball ---
  function transformBaseballRow(row, leagueKey, index, leaderWins, options) {
    const opts = options || {};
    const win = row.wins?.total ?? 0;
    const loss = row.loses?.total ?? 0;
    const played = row.games?.played ?? win + loss;
    const gamesBack = opts.isWildCard
      ? row.gamesBack ?? `+${calcGamesBack(leaderWins, win)}`
      : index === 0
        ? '0.0'
        : calcGamesBack(leaderWins, win);

    return {
      rank: row.position ?? index + 1,
      name: translateTeamName(row.team?.name, leagueKey),
      winRate: formatBaseballWinRate(row.wins?.percentage),
      gamesBack,
      win,
      draw: 0,
      loss,
      played,
      streak: formatStreak(row.streak),
      battingAvg: row.batting?.average != null ? String(row.batting.average) : '-',
      era: row.pitching?.era != null ? String(row.pitching.era) : '-',
      form: buildFormNoDraw(index),
      nextOpponent: null,
      nextMatchPending: true,
      isWildCard: !!opts.isWildCard,
    };
  }

  function transformKbo(rows) {
    const leaderWins = rows[0]?.wins?.total ?? 0;
    return rows.map((row, i) => transformBaseballRow(row, 'kbo', i, leaderWins));
  }

  function transformMlbGroups(mlbGroups) {
    const out = {};
    for (const [groupKey, id] of Object.entries(MLB_GROUP_TO_ID)) {
      const rows = safeRows(mlbGroups?.[groupKey]);
      if (!rows.length) {
        out[id] = [];
        continue;
      }
      const leaderWins = rows[0]?.wins?.total ?? 0;
      const isWildCard = groupKey.includes('와일드카드');
      out[id] = rows.map((row, i) =>
        transformBaseballRow(row, 'mlb', i, leaderWins, { isWildCard })
      );
    }
    return out;
  }

  function transformNpbGroups(npbGroups) {
    const out = { central: [], pacific: [] };
    const centralRows = safeRows(npbGroups?.센트럴);
    const pacificRows = safeRows(npbGroups?.퍼시픽);
    const leaderCentral = centralRows[0]?.wins?.total ?? 0;
    const leaderPacific = pacificRows[0]?.wins?.total ?? 0;
    out.central = centralRows.map((row, i) => transformBaseballRow(row, 'npb', i, leaderCentral));
    out.pacific = pacificRows.map((row, i) => transformBaseballRow(row, 'npb', i, leaderPacific));
    return out;
  }

  function safeRows(val) {
    return Array.isArray(val) ? val : [];
  }

  // --- Basketball ---
  function transformKoreanBasketball(rows, leagueKey) {
    const leaderWins = rows[0]?.win ?? rows[0]?.games?.win?.total ?? 0;
    return rows.map((row, i) => {
      const win = row.win ?? 0;
      const loss = row.loss ?? 0;
      const played = row.games?.played ?? win + loss;
      return {
        rank: row.rank ?? i + 1,
        name: translateTeamName(row.team?.name, leagueKey),
        winRate: formatBasketballWinRate(row.winRate),
        played,
        win,
        loss,
        gamesBack: row.gamesBack != null ? String(row.gamesBack) : calcGamesBack(leaderWins, win),
        streak: formatStreak(row.streak),
        form: buildFormNoDraw(i),
      };
    });
  }

  function transformNba(apiNba) {
    const all = [];
    const conferences = [
      { key: '동부', id: 'east' },
      { key: '서부', id: 'west' },
    ];

    for (const conf of conferences) {
      const rows = safeRows(apiNba?.[conf.key]);
      if (!rows.length) continue;
      const sorted = [...rows].sort((a, b) => (b.win?.total ?? 0) - (a.win?.total ?? 0));
      const leaderWins = sorted[0]?.win?.total ?? 0;

      sorted.forEach((row, i) => {
        const win = row.win?.total ?? 0;
        const loss = row.loss?.total ?? 0;
        const played = win + loss;
        const koName = translateTeamName(row.team?.name, 'nba');
        all.push({
          rank: row.rank ?? i + 1,
          name: koName,
          winRate: formatBasketballWinRate(row.win?.percentage),
          played,
          win,
          loss,
          gamesBack: calcGamesBack(leaderWins, win),
          streak: formatStreak(row.streak),
          homeRecord: formatBasketballRecord(row.home),
          awayRecord: formatBasketballRecord(row.away),
          division: typeof getNbaDivisionName === 'function' ? getNbaDivisionName(koName) : row.division || '-',
          divisionRecord: formatBasketballRecord(row.divisionRecord),
          form: buildFormNoDraw(i),
          conference: conf.id,
        });
      });
    }

    return all;
  }

  // --- Volleyball ---
  function transformVolleyball(rows) {
    return rows.map((row, i) => ({
      rank: row.rank ?? i + 1,
      name: translateTeamName(row.team?.name),
      points: row.points ?? 0,
      played: row.played ?? 0,
      win: row.win ?? 0,
      loss: row.loss ?? 0,
      setRatio: formatRatio(row.setRatio),
      pointRatio: formatRatio(row.pointRatio),
      form: buildFormNoDraw(i),
    }));
  }

  function mergeFootball(api, fallback) {
    const out = {};
    const keys = ['kLeague', 'epl', 'bundesliga', 'ligue1', 'serieA', 'laLiga'];
    keys.forEach((key) => {
      const apiRows = api?.[key];
      if (isEmptyData(apiRows)) {
        out[key] = fallback.football[key];
      } else {
        out[key] = transformFootballLeague(apiRows, key);
      }
    });
    return out;
  }

  function mergeBaseball(api, fallback) {
    const out = {};

    if (isEmptyData(api?.kbo)) {
      out.kbo = fallback.baseball.kbo;
    } else {
      out.kbo = transformKbo(api.kbo);
    }

    if (isEmptyData(api?.mlb)) {
      out.mlb = fallback.baseball.mlb;
    } else if (typeof api.mlb === 'object' && !Array.isArray(api.mlb)) {
      const transformed = transformMlbGroups(api.mlb);
      const hasAny = Object.values(transformed).some((g) => g.length > 0);
      out.mlb = hasAny ? transformed : fallback.baseball.mlb;
    } else {
      out.mlb = fallback.baseball.mlb;
    }

    if (isEmptyData(api?.npb)) {
      out.npb = fallback.baseball.npb;
    } else if (typeof api.npb === 'object' && !Array.isArray(api.npb)) {
      const transformed = transformNpbGroups(api.npb);
      const hasAny = transformed.central.length || transformed.pacific.length;
      out.npb = hasAny ? transformed : fallback.baseball.npb;
    } else {
      out.npb = fallback.baseball.npb;
    }

    return out;
  }

  function mergeBasketball(api, fallback) {
    const out = {};

    if (isEmptyData(api?.nba) || (isEmptyData(api.nba?.동부) && isEmptyData(api.nba?.서부))) {
      out.nba = fallback.basketball.nba;
    } else {
      const teams = transformNba(api.nba);
      out.nba = teams.length ? teams : fallback.basketball.nba;
    }

    if (isEmptyData(api?.kbl)) {
      out.kbl = fallback.basketball.kbl;
    } else {
      out.kbl = transformKoreanBasketball(api.kbl, 'kbl');
    }

    if (isEmptyData(api?.wkbl)) {
      out.wkbl = fallback.basketball.wkbl;
    } else {
      out.wkbl = transformKoreanBasketball(api.wkbl, 'wkbl');
    }

    return out;
  }

  function mergeVolleyball(api, fallback) {
    const out = {};
    if (isEmptyData(api?.vLeagueMen)) {
      out.vLeagueMen = fallback.volleyball.vLeagueMen;
    } else {
      out.vLeagueMen = transformVolleyball(api.vLeagueMen);
    }
    if (isEmptyData(api?.vLeagueWomen)) {
      out.vLeagueWomen = fallback.volleyball.vLeagueWomen;
    } else {
      out.vLeagueWomen = transformVolleyball(api.vLeagueWomen);
    }
    return out;
  }

  async function fetchJsonSafe(url) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`[standings] fetch failed: ${url}`, e);
      return null;
    }
  }

  async function load() {
    const fallback = typeof STANDINGS_DUMMY_DATA !== 'undefined' ? STANDINGS_DUMMY_DATA : STANDINGS_DATA;

    const [footballApi, baseballApi, basketballApi, volleyballApi] = await Promise.all([
      fetchJsonSafe(DATA_URLS.football),
      fetchJsonSafe(DATA_URLS.baseball),
      fetchJsonSafe(DATA_URLS.basketball),
      fetchJsonSafe(DATA_URLS.volleyball),
    ]);

    if (!footballApi && !baseballApi && !basketballApi && !volleyballApi) {
      STANDINGS_DATA = fallback;
      return STANDINGS_DATA;
    }

    STANDINGS_DATA = {
      football: footballApi ? mergeFootball(footballApi, fallback) : fallback.football,
      baseball: baseballApi ? mergeBaseball(baseballApi, fallback) : fallback.baseball,
      basketball: basketballApi ? mergeBasketball(basketballApi, fallback) : fallback.basketball,
      volleyball: volleyballApi ? mergeVolleyball(volleyballApi, fallback) : fallback.volleyball,
    };

    return STANDINGS_DATA;
  }

  return { load };
})();
