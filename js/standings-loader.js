/**
 * MatchUp LAB - 리그순위 JSON fetch + 렌더 포맷 변환 + 더미 fallback
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

  function safeRows(val) {
    return Array.isArray(val) ? val : [];
  }

  function getTeamRaw(row) {
    if (!row) return '';
    if (typeof row.team === 'string') return row.team;
    return row.team?.name ?? '';
  }

  function isFlatRow(row) {
    return row && typeof row.team === 'string';
  }

  function parseFormString(form) {
    if (!form || typeof form !== 'string') return ['W', 'W', 'L', 'W', 'L'];
    const arr = form.split('').filter((c) => c === 'W' || c === 'D' || c === 'L');
    while (arr.length < 5) arr.push(arr.length % 2 === 0 ? 'W' : 'L');
    return arr.slice(0, 5);
  }

  function parseRecent5(recent5) {
    if (!Array.isArray(recent5) || recent5.length === 0) {
      return ['W', 'W', 'L', 'W', 'L'];
    }
    return recent5
      .map((r) => String(r).toUpperCase().charAt(0))
      .filter((c) => c === 'W' || c === 'D' || c === 'L')
      .slice(0, 5);
  }

  function buildFormNoDraw(index) {
    const form = FORM_PATTERNS_LOADER[index % FORM_PATTERNS_LOADER.length].filter((r) => r !== 'D');
    while (form.length < 5) form.push(form.length % 2 === 0 ? 'W' : 'L');
    return form.slice(0, 5);
  }

  function formatBaseballWinRate(pct) {
    if (pct == null || pct === '') return '.000';
    let n = parseFloat(pct);
    if (Number.isNaN(n)) return '.000';
    if (n > 1) n /= 100;
    const fixed = n.toFixed(3);
    return fixed.startsWith('0') ? fixed.slice(1) : fixed;
  }

  function formatBasketballWinRate(pct) {
    if (pct == null || pct === '') return '0.000';
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
    if (val == null || val === '') return '-';
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
    if (streak == null || streak === '') return '-';
    if (typeof streak === 'number') return streak > 0 ? `${streak}승` : `${Math.abs(streak)}패`;
    return String(streak);
  }

  function formatRatio(val) {
    if (val == null || val === '') return '-';
    const n = parseFloat(val);
    if (Number.isNaN(n)) return String(val);
    return n.toFixed(3);
  }

  // --- Football ---
  function transformFootballLeague(rows, leagueKey) {
    if (!rows.length) return [];

    if (isFlatRow(rows[0])) {
      return rows.map((row, i) => ({
        rank: row.rank ?? i + 1,
        name: normalizeTeamName(getTeamRaw(row), leagueKey),
        played: row.played ?? 0,
        win: row.win ?? 0,
        draw: row.draw ?? 0,
        loss: row.lose ?? row.loss ?? 0,
        scored: row.goals_for ?? 0,
        conceded: row.goals_against ?? 0,
        goalDiff: row.goal_diff ?? 0,
        points: row.points ?? 0,
        form: parseRecent5(row.recent5),
        nextOpponent: '-',
        nextMatchPending: true,
      }));
    }

    return rows.map((row, i) => {
      const scored = row.goals?.for ?? row.goals_for ?? 0;
      const conceded = row.goals?.against ?? row.goals_against ?? 0;
      return {
        rank: row.rank ?? i + 1,
        name: normalizeTeamName(getTeamRaw(row), leagueKey),
        played: row.all?.played ?? row.played ?? 0,
        win: row.all?.win ?? row.win ?? 0,
        draw: row.all?.draw ?? row.draw ?? 0,
        loss: row.all?.lose ?? row.loss ?? 0,
        scored,
        conceded,
        goalDiff: row.goalsDiff ?? row.goal_diff ?? scored - conceded,
        points: row.points ?? 0,
        form: parseFormString(row.form) || parseRecent5(row.recent5),
        nextOpponent: '-',
        nextMatchPending: true,
      };
    });
  }

  // --- Baseball ---
  function transformBaseballRow(row, leagueKey, index, leaderWins, options) {
    const opts = options || {};
    const win = row.win ?? row.wins?.total ?? 0;
    const loss = row.lose ?? row.loses?.total ?? row.loss ?? 0;
    const played = row.played ?? row.games?.played ?? win + (row.draw ?? 0) + loss;
    const gamesBack = opts.isWildCard
      ? row.game_behind ?? row.gamesBack ?? `+${calcGamesBack(leaderWins, win)}`
      : index === 0
        ? '0.0'
        : row.game_behind ?? row.gamesBack ?? calcGamesBack(leaderWins, win);

    return {
      rank: row.rank ?? row.position ?? index + 1,
      name: normalizeTeamName(getTeamRaw(row), leagueKey),
      winRate: formatBaseballWinRate(row.win_rate ?? row.wins?.percentage),
      gamesBack: gamesBack === '-' ? '0.0' : String(gamesBack),
      win,
      draw: row.draw ?? 0,
      loss,
      played,
      streak: formatStreak(row.streak),
      battingAvg: row.avg ?? row.batting?.average ?? '-',
      era: row.era ?? row.pitching?.era ?? '-',
      form: parseRecent5(row.recent5) || buildFormNoDraw(index),
      nextOpponent: null,
      nextMatchPending: true,
      isWildCard: !!opts.isWildCard,
    };
  }

  function transformKbo(rows) {
    const leaderWins = rows[0]?.win ?? rows[0]?.wins?.total ?? 0;
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
      const leaderWins = rows[0]?.win ?? rows[0]?.wins?.total ?? 0;
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
    const leaderCentral = centralRows[0]?.win ?? centralRows[0]?.wins?.total ?? 0;
    const leaderPacific = pacificRows[0]?.win ?? pacificRows[0]?.wins?.total ?? 0;
    out.central = centralRows.map((row, i) => transformBaseballRow(row, 'npb', i, leaderCentral));
    out.pacific = pacificRows.map((row, i) => transformBaseballRow(row, 'npb', i, leaderPacific));
    return out;
  }

  // --- Basketball ---
  function transformKoreanBasketball(rows, leagueKey) {
    const leaderWins = rows[0]?.win ?? rows[0]?.games?.win?.total ?? 0;
    return rows.map((row, i) => {
      const win = row.win ?? 0;
      const loss = row.lose ?? row.loss ?? 0;
      const played = row.played ?? row.games?.played ?? win + loss;
      return {
        rank: row.rank ?? i + 1,
        name: normalizeTeamName(getTeamRaw(row), leagueKey),
        winRate: formatBasketballWinRate(row.win_rate ?? row.winRate ?? row.games?.win?.percentage),
        played,
        win,
        loss,
        gamesBack:
          row.game_behind != null && row.game_behind !== '-'
            ? String(row.game_behind)
            : row.gamesBack != null
              ? String(row.gamesBack)
              : calcGamesBack(leaderWins, win),
        streak: formatStreak(row.streak),
        form: parseRecent5(row.recent5) || buildFormNoDraw(i),
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

      const isFlat = isFlatRow(rows[0]);
      const sorted = isFlat
        ? [...rows]
        : [...rows].sort((a, b) => (b.win?.total ?? 0) - (a.win?.total ?? 0));
      const leaderWins = isFlat
        ? sorted[0]?.win ?? 0
        : sorted[0]?.win?.total ?? 0;

      sorted.forEach((row, i) => {
        const win = isFlat ? row.win ?? 0 : row.win?.total ?? 0;
        const loss = isFlat ? row.lose ?? row.loss ?? 0 : row.loss?.total ?? 0;
        const played = isFlat ? row.played ?? win + loss : win + loss;
        const koName = normalizeTeamName(getTeamRaw(row), 'nba');

        all.push({
          rank: row.rank ?? i + 1,
          name: koName,
          winRate: formatBasketballWinRate(
            isFlat ? row.win_rate : row.win?.percentage
          ),
          played,
          win,
          loss,
          gamesBack:
            row.game_behind != null && row.game_behind !== '-'
              ? String(row.game_behind)
              : calcGamesBack(leaderWins, win),
          streak: formatStreak(row.streak),
          homeRecord: formatBasketballRecord(isFlat ? row.home : row.home ?? row.homeRecord),
          awayRecord: formatBasketballRecord(isFlat ? row.away : row.away ?? row.awayRecord),
          division: row.division || (typeof getNbaDivisionName === 'function' ? getNbaDivisionName(koName) : '-'),
          divisionRecord: formatBasketballRecord(isFlat ? row.div_record : row.divisionRecord),
          form: parseRecent5(row.recent5) || buildFormNoDraw(i),
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
      name: normalizeTeamName(getTeamRaw(row)),
      points: row.points ?? 0,
      played: row.played ?? 0,
      win: row.win ?? 0,
      loss: row.lose ?? row.loss ?? 0,
      setRatio: formatRatio(row.set_ratio ?? row.setRatio),
      pointRatio: formatRatio(row.score_ratio ?? row.pointRatio),
      form: parseRecent5(row.recent5) || buildFormNoDraw(i),
    }));
  }

  const FOOTBALL_LEAGUE_API_KEYS = {
    laLiga: ['laLiga', 'laliga'],
  };

  function getFootballLeagueRows(api, key) {
    const aliases = FOOTBALL_LEAGUE_API_KEYS[key];
    if (aliases) {
      for (const alias of aliases) {
        if (api?.[alias] != null) return api[alias];
      }
      return null;
    }
    return api?.[key] ?? null;
  }

  function mergeFootball(api, fallback) {
    const out = {};
    const keys = ['kLeague', 'epl', 'bundesliga', 'ligue1', 'serieA', 'laLiga'];
    keys.forEach((key) => {
      const apiRows = getFootballLeagueRows(api, key);
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
