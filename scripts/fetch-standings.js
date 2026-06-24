/* eslint-disable no-console */
/**
 * Fetch real standings data from free sources and persist to /data as static JSON.
 *
 * Sources used (all free tier, current season):
 *  - football-data.org  : EPL / Bundesliga / LaLiga / SerieA / Ligue1   (needs FOOTBALL_DATA_KEY)
 *  - statsapi.mlb.com    : MLB                                          (no key needed)
 *  - balldontlie.io      : NBA                                          (needs BALLDONTLIE_KEY)
 *
 * NBA note: balldontlie.io's /nba/v1/standings endpoint requires a paid
 * "GOAT" tier subscription ($39.99/mo) — confirmed via their official docs
 * (Free tier only includes Teams/Players/Games, "Team Standings" = GOAT only).
 * The Free tier DOES include the Games endpoint, so we fetch all regular-season
 * games for the season and calculate win/loss standings ourselves. This stays
 * fully free and does not depend on any paid upgrade.
 *
 * No working free real-data source exists for: K리그, KBO, NPB, KBL, WKBL, V리그(남/여).
 * Those are intentionally left null/empty so the existing frontend fallback
 * logic (js/sports-data.js dummy data) kicks in automatically — this is by design,
 * not a bug.
 */

const fs = require('fs/promises');
const path = require('path');

const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_KEY;
const BALLDONTLIE_KEY = process.env.BALLDONTLIE_KEY;

// MLB는 칼린더 연도 기준 시즌, NBA는 8월 기준으로 시즌 연도가 바뀜
// (예: 2026년 6월 → MLB season=2026, NBA season=2025(2025-26 시즌))
// 매년 코드를 직접 고치지 않아도 되도록 현재 날짜 기준으로 자동 계산.
const NOW = new Date();
const MLB_SEASON = NOW.getFullYear();
const NBA_SEASON = NOW.getMonth() >= 7 ? NOW.getFullYear() : NOW.getFullYear() - 1;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url, { headers } = {}) {
  const res = await fetch(url, { headers });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON (${res.status}) from ${url}: ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}: ${JSON.stringify(json).slice(0, 200)}`);
  }
  return json;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

// -----------------------
// 팀명 보정 (football-data.org 표기 → 기존 team-names-ko.js 키와 최대한 맞춤)
// 100% 일치를 보장할 수 없어 best-effort. 매칭 실패 시 프론트엔드가 영문명을
// 그대로 보여주는 방식으로 안전하게 동작함 (사이트 동작에는 영향 없음).
// -----------------------

const FOOTBALL_NAME_ALIASES = {
  'FC Bayern München': 'Bayern Munich',
  'Bayern München': 'Bayern Munich',
  'Club Atlético de Madrid': 'Atletico Madrid',
  'Atlético de Madrid': 'Atletico Madrid',
  'Atlético Madrid': 'Atletico Madrid',
  'Paris Saint-Germain FC': 'Paris Saint Germain',
  'Paris Saint-Germain': 'Paris Saint Germain',
  'TSG 1899 Hoffenheim': 'Hoffenheim',
  'TSG Hoffenheim': 'Hoffenheim',
  '1. FSV Mainz 05': 'Mainz',
  'Mainz 05': 'Mainz',
  '1. FC Köln': 'Köln',
  'FC Köln': 'Köln',
  '1. FC Union Berlin': 'Union Berlin',
  'Hertha BSC': 'Hertha Berlin',
  'FC Augsburg': 'Augsburg',
  'VfL Bochum 1848': 'Bochum',
  'VfL Bochum': 'Bochum',
  'SV Werder Bremen': 'Werder Bremen',
  'SV Darmstadt 98': 'Darmstadt',
  '1. FC Heidenheim 1846': 'Heidenheim',
  'Internazionale Milano': 'Inter',
  'FC Internazionale Milano': 'Inter',
  'AS Monaco FC': 'Monaco',
  'Olympique de Marseille': 'Marseille',
  'Olympique Lyonnais': 'Lyon',
  'Stade Rennais FC 1901': 'Rennes',
  'OGC Nice': 'Nice',
  'RC Lens': 'Lens',
  'Stade Brestois 29': 'Brest',
  'FC Nantes': 'Nantes',
  'RC Strasbourg Alsace': 'Strasbourg',
  'Stade de Reims': 'Reims',
  'FC Lorient': 'Lorient',
  'Le Havre AC': 'Le Havre',
  'FC Metz': 'Metz',
  'Clermont Foot 63': 'Clermont Foot',
  'Toulouse FC': 'Toulouse',
  'Montpellier HSC': 'Montpellier',
};

function stripClubSuffix(name) {
  if (!name) return name;
  return name
    .replace(/^(FC|CF|AS|AC|SC|SV|RC|VfL|VfB)\s+/i, '')
    .replace(/\s+(FC|CF|AFC|SAD)\.?$/i, '')
    .trim();
}

function koreanizableFootballName(rawName, shortName) {
  const candidates = [shortName, rawName, stripClubSuffix(shortName), stripClubSuffix(rawName)].filter(Boolean);
  for (const c of candidates) {
    if (FOOTBALL_NAME_ALIASES[c]) return FOOTBALL_NAME_ALIASES[c];
  }
  return shortName || rawName || null;
}

// -----------------------
// Football (football-data.org)
// -----------------------

const FOOTBALL_DATA = {
  host: 'https://api.football-data.org/v4',
  leagues: [
    { key: 'epl', code: 'PL' },
    { key: 'bundesliga', code: 'BL1' },
    { key: 'laLiga', code: 'PD' },
    { key: 'serieA', code: 'SA' },
    { key: 'ligue1', code: 'FL1' },
  ],
};

function extractFootballDataTable(payload) {
  const groups = safeArray(payload?.standings);
  const total = groups.find((g) => g?.type === 'TOTAL') || groups[0];
  return safeArray(total?.table);
}

async function fetchFootball() {
  const out = { kLeague: null, epl: null, bundesliga: null, ligue1: null, serieA: null, laLiga: null };

  if (!FOOTBALL_DATA_KEY) {
    console.warn('[warn] football: FOOTBALL_DATA_KEY not set, skipping (will fall back to dummy)');
    return out;
  }

  const headers = { 'X-Auth-Token': FOOTBALL_DATA_KEY };

  for (const league of FOOTBALL_DATA.leagues) {
    const url = `${FOOTBALL_DATA.host}/competitions/${league.code}/standings`;
    try {
      const json = await fetchJson(url, { headers });
      const rows = extractFootballDataTable(json)
        .map((row) => ({
          rank: row?.position ?? null,
          team: { name: koreanizableFootballName(row?.team?.name, row?.team?.shortName) },
          all: {
            played: row?.playedGames ?? null,
            win: row?.won ?? null,
            draw: row?.draw ?? null,
            lose: row?.lost ?? null,
          },
          goals: { for: row?.goalsFor ?? null, against: row?.goalsAgainst ?? null },
          goalsDiff: row?.goalDifference ?? null,
          points: row?.points ?? null,
          form: row?.form ?? null,
        }))
        .filter((t) => t.rank && t.team?.name);

      out[league.key] = rows.length ? rows : null;
      if (!rows.length) console.warn(`[warn] football ${league.key}: empty table`);
    } catch (e) {
      console.warn(`[warn] football ${league.key}: ${e.message}`);
      out[league.key] = null;
    }
    // football-data.org 무료 플랜 레이트리밋(10req/min) 여유 확보
    await sleep(7000);
  }

  return out;
}

// -----------------------
// Baseball (MLB: statsapi.mlb.com / KBO·NPB: 무료 소스 없음)
// -----------------------

function emptyMlbGroups() {
  return {
    AL동부: [],
    AL중부: [],
    AL서부: [],
    AL와일드카드: [],
    NL동부: [],
    NL중부: [],
    NL서부: [],
    NL와일드카드: [],
  };
}

function emptyNpbGroups() {
  return { 센트럴: [], 퍼시픽: [] };
}

// MLB 디비전 id → 그룹 키 (statsapi.mlb.com은 division 객체에 id만 주고 name은 안 줌)
const MLB_DIVISION_ID_TO_KEY = {
  200: 'AL서부',
  201: 'AL동부',
  202: 'AL중부',
  203: 'NL서부',
  204: 'NL동부',
  205: 'NL중부',
};

async function fetchMlb() {
  const out = emptyMlbGroups();
  try {
    const url = `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${MLB_SEASON}&standingsTypes=regularSeason`;
    const json = await fetchJson(url);
    const records = safeArray(json?.records);

    if (!records.length) {
      console.warn('[warn] mlb: empty records');
      return out;
    }

    for (const record of records) {
      const divisionId = record?.division?.id;
      const key = MLB_DIVISION_ID_TO_KEY[divisionId];
      if (!key) continue;

      for (const tr of safeArray(record?.teamRecords)) {
        out[key].push({
          position: tr?.divisionRank ? Number(tr.divisionRank) : null,
          team: { name: tr?.team?.name ?? null },
          games: { played: tr?.gamesPlayed ?? null },
          wins: { total: tr?.wins ?? null, percentage: tr?.winningPercentage ?? null },
          loses: { total: tr?.losses ?? null },
          streak: tr?.streak?.streakCode ?? null,
          gamesBack: tr?.gamesBack ?? null,
        });
      }
    }

    for (const key of Object.keys(out)) {
      out[key].sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
    }
  } catch (e) {
    console.warn(`[warn] mlb: ${e.message}`);
    return emptyMlbGroups();
  }
  return out;
}

async function fetchBaseball() {
  const mlb = await fetchMlb();
  // KBO/NPB: 무료 실데이터 소스 없음 (확인됨) → null, 프론트엔드 더미 fallback 사용
  return { kbo: null, mlb, npb: emptyNpbGroups() };
}

// -----------------------
// NBA (balldontlie.io) — Games 결과를 직접 집계해서 순위 계산
// (Standings 엔드포인트는 무료 플랜에서 401 → GOAT 유료 플랜 전용으로 확인됨)
// -----------------------

function emptyNbaGroups() {
  return { 동부: [], 서부: [] };
}

async function fetchAllNbaGames(season, headers) {
  const games = [];
  let cursor;
  // 안전장치: 한 시즌 최대 페이지 수를 넘지 않도록 상한선
  for (let page = 0; page < 25; page += 1) {
    const params = new URLSearchParams();
    params.append('seasons[]', String(season));
    params.set('per_page', '100');
    params.set('postseason', 'false');
    if (cursor) params.set('cursor', String(cursor));

    const url = `https://api.balldontlie.io/nba/v1/games?${params.toString()}`;
    const json = await fetchJson(url, { headers });
    const batch = safeArray(json?.data);
    games.push(...batch);

    cursor = json?.meta?.next_cursor || null;
    if (!cursor || batch.length === 0) break;
    // balldontlie 무료 플랜 레이트리밋(5 req/min) 여유 확보
    await sleep(13000);
  }
  return games;
}

function computeNbaStandingsFromGames(games) {
  const teams = new Map();

  function ensureTeam(t) {
    if (!t?.id) return null;
    if (!teams.has(t.id)) {
      teams.set(t.id, {
        name: t.full_name || t.name || null,
        conference: t.conference || null,
        division: t.division || null,
        win: 0,
        loss: 0,
        homeWin: 0,
        homeLoss: 0,
        awayWin: 0,
        awayLoss: 0,
        divWin: 0,
        divLoss: 0,
        log: [],
      });
    }
    return teams.get(t.id);
  }

  const finals = games
    .filter((g) => g?.status === 'Final' && g?.home_team && g?.visitor_team)
    .sort((a, b) => new Date(a.datetime || a.date) - new Date(b.datetime || b.date));

  for (const g of finals) {
    const home = ensureTeam(g.home_team);
    const away = ensureTeam(g.visitor_team);
    if (!home || !away) continue;

    const homeScore = g.home_team_score ?? 0;
    const awayScore = g.visitor_team_score ?? 0;
    if (homeScore === awayScore) continue; // NBA에는 무승부 없음(데이터 이상치 방어)

    const homeWon = homeScore > awayScore;
    const sameDivision =
      g.home_team.division && g.home_team.division === g.visitor_team.division &&
      g.home_team.conference === g.visitor_team.conference;

    if (homeWon) {
      home.win += 1; home.homeWin += 1; home.log.push('W');
      away.loss += 1; away.awayLoss += 1; away.log.push('L');
      if (sameDivision) { home.divWin += 1; away.divLoss += 1; }
    } else {
      home.loss += 1; home.homeLoss += 1; home.log.push('L');
      away.win += 1; away.awayWin += 1; away.log.push('W');
      if (sameDivision) { home.divLoss += 1; away.divWin += 1; }
    }
  }

  function calcStreak(log) {
    if (!log.length) return 0;
    const last = log[log.length - 1];
    let n = 0;
    for (let i = log.length - 1; i >= 0 && log[i] === last; i -= 1) n += 1;
    return last === 'W' ? n : -n;
  }

  const out = emptyNbaGroups();

  for (const t of teams.values()) {
    const played = t.win + t.loss;
    if (!played || !t.name) continue;

    const row = {
      team: { name: t.name },
      conference: t.conference,
      division: t.division,
      win: { total: t.win, percentage: Number((t.win / played).toFixed(3)) },
      loss: { total: t.loss },
      streak: calcStreak(t.log),
      home: `${t.homeWin}-${t.homeLoss}`,
      away: `${t.awayWin}-${t.awayLoss}`,
      divisionRecord: `${t.divWin}-${t.divLoss}`,
      rank: null,
    };

    const conf = String(t.conference).toLowerCase();
    if (conf === 'east') out.동부.push(row);
    else if (conf === 'west') out.서부.push(row);
  }

  out.동부.sort((a, b) => b.win.percentage - a.win.percentage);
  out.서부.sort((a, b) => b.win.percentage - a.win.percentage);
  out.동부.forEach((r, i) => { r.rank = i + 1; });
  out.서부.forEach((r, i) => { r.rank = i + 1; });

  return out;
}

async function fetchNba() {
  if (!BALLDONTLIE_KEY) {
    console.warn('[warn] nba: BALLDONTLIE_KEY not set, skipping (will fall back to dummy)');
    return emptyNbaGroups();
  }

  const headers = { Authorization: BALLDONTLIE_KEY };

  try {
    const games = await fetchAllNbaGames(NBA_SEASON, headers);
    if (!games.length) {
      console.warn(`[warn] nba: no games returned for season ${NBA_SEASON}`);
      return emptyNbaGroups();
    }

    const standings = computeNbaStandingsFromGames(games);
    if (!standings.동부.length && !standings.서부.length) {
      console.warn('[warn] nba: computed standings empty (no Final games yet?)');
      return emptyNbaGroups();
    }

    return standings;
  } catch (e) {
    console.warn(`[warn] nba: ${e.message}`);
    return emptyNbaGroups();
  }
}

// -----------------------
// Basketball KBL/WKBL — 무료 실데이터 소스 없음 (확인됨)
// -----------------------

async function fetchKoreanBasketballLeague() {
  return [];
}

// -----------------------
// Volleyball V-League(남/여) — 무료 실데이터 소스 없음 (확인됨)
// -----------------------

async function fetchVolleyball() {
  return { vLeagueMen: [], vLeagueWomen: [] };
}

async function main() {
  const dataDir = path.resolve('data');
  await ensureDir(dataDir);

  const football = await fetchFootball();
  const baseball = await fetchBaseball();
  const nba = await fetchNba();
  const kbl = await fetchKoreanBasketballLeague();
  const wkbl = await fetchKoreanBasketballLeague();
  const volleyball = await fetchVolleyball();

  const basketball = { nba, kbl, wkbl };

  await writeJson(path.join(dataDir, 'standings-football.json'), football);
  await writeJson(path.join(dataDir, 'standings-baseball.json'), baseball);
  await writeJson(path.join(dataDir, 'standings-basketball.json'), basketball);
  await writeJson(path.join(dataDir, 'standings-volleyball.json'), volleyball);

  console.log('[ok] standings saved to /data');
}

main().catch((e) => {
  console.error('[fatal]', e);
  process.exitCode = 1;
});
