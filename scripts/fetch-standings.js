/* eslint-disable no-console */
/**
 * Fetch standings from API-Sports and persist to /data as static JSON.
 */

const fs = require('fs/promises');
const path = require('path');

const API_KEY = process.env.API_SPORTS_KEY;

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
  if (json?.errors && Object.keys(json.errors).length) {
    console.warn('[warn] API returned errors:', json.errors);
    throw new Error(`API errors: ${JSON.stringify(json.errors)}`);
  }
  return json;
}

function requireKey() {
  if (!API_KEY) {
    throw new Error('Missing API_SPORTS_KEY env var.');
  }
  return { 'x-apisports-key': API_KEY };
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
// Football
// -----------------------

const FOOTBALL = {
  host: 'https://v3.football.api-sports.io',
  leagues: [
    { key: 'kLeague', id: 292, season: 2026 },
    { key: 'epl', id: 39, season: 2025 },
    { key: 'bundesliga', id: 78, season: 2025 },
    { key: 'ligue1', id: 61, season: 2025 },
    { key: 'serieA', id: 135, season: 2025 },
    { key: 'laliga', id: 140, season: 2025 },
  ],
};

function extractFootballTeams(payload) {
  const resp0 = safeArray(payload?.response)[0];
  const standings = safeArray(resp0?.league?.standings)[0];
  return safeArray(standings)
    .map((row) => {
      const all = row?.all || {};
      const goals = row?.goals || {};
      return {
        rank: row?.rank ?? null,
        team: { name: row?.team?.name ?? null },
        all: {
          played: all.played ?? null,
          win: all.win ?? null,
          draw: all.draw ?? null,
          lose: all.lose ?? null,
        },
        goals: { for: goals.for ?? null, against: goals.against ?? null },
        goalsDiff: row?.goalsDiff ?? null,
        points: row?.points ?? null,
        form: row?.form ?? null,
      };
    })
    .filter((t) => t.rank && t.team?.name);
}

async function fetchFootball() {
  const headers = requireKey();
  const out = {
    kLeague: null,
    epl: null,
    bundesliga: null,
    ligue1: null,
    serieA: null,
    laliga: null,
  };

  for (const league of FOOTBALL.leagues) {
    const url = `${FOOTBALL.host}/standings?league=${league.id}&season=${league.season}`;
    try {
      const json = await fetchJson(url, { headers });
      const teams = extractFootballTeams(json);
      if (!teams.length || !safeArray(json?.response).length) {
        console.warn(`[warn] football ${league.key}: empty response`);
        out[league.key] = null;
      } else {
        out[league.key] = teams;
      }
    } catch (e) {
      console.warn(`[warn] football ${league.key}: ${e.message}`);
      out[league.key] = null;
    }
    await sleep(500);
  }

  return out;
}

// -----------------------
// Baseball
// -----------------------

const BASEBALL = {
  host: 'https://v1.baseball.api-sports.io',
  leagues: [
    { key: 'kbo', id: 6, season: 2026 },
    { key: 'mlb', id: 1, season: 2026 },
    { key: 'npb', id: 7, season: 2026 },
  ],
};

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

function extractBaseballRows(payload) {
  const resp0 = safeArray(payload?.response)[0];
  const standings = safeArray(resp0?.league?.standings);
  const flat = [];
  for (const group of standings) {
    if (Array.isArray(group)) {
      for (const row of group) flat.push(row);
    } else if (group && typeof group === 'object' && Array.isArray(group.standings)) {
      for (const row of group.standings) {
        flat.push({ ...row, group: group.group || group.name || row.group });
      }
    } else if (group && typeof group === 'object') {
      flat.push(group);
    }
  }
  return flat.length ? flat : safeArray(standings);
}

function normalizeBaseballTeam(row) {
  const games = row?.games || {};
  const wins = row?.wins || {};
  const loses = row?.loses || {};
  return {
    position: row?.position ?? row?.rank ?? null,
    team: { name: row?.team?.name ?? null },
    games: { played: games.played ?? null },
    wins: { total: wins.total ?? null, percentage: wins.percentage ?? null },
    loses: { total: loses.total ?? null },
    streak: row?.streak ?? null,
    batting: { average: row?.batting?.average ?? null },
    pitching: { era: row?.pitching?.era ?? null },
    group: row?.group ?? row?.conference ?? row?.division ?? row?.stage ?? null,
  };
}

function groupKeyFromMlbGroupName(name) {
  if (!name) return null;
  const s = String(name).toLowerCase();
  if (s.includes('american') && s.includes('east')) return 'AL동부';
  if (s.includes('american') && s.includes('central')) return 'AL중부';
  if (s.includes('american') && s.includes('west')) return 'AL서부';
  if (s.includes('american') && s.includes('wild')) return 'AL와일드카드';
  if (s.includes('national') && s.includes('east')) return 'NL동부';
  if (s.includes('national') && s.includes('central')) return 'NL중부';
  if (s.includes('national') && s.includes('west')) return 'NL서부';
  if (s.includes('national') && s.includes('wild')) return 'NL와일드카드';
  return null;
}

function groupKeyFromNpbGroupName(name) {
  if (!name) return null;
  const s = String(name).toLowerCase();
  if (s.includes('central')) return '센트럴';
  if (s.includes('pacific')) return '퍼시픽';
  return null;
}

async function fetchBaseball() {
  const headers = requireKey();
  const out = { kbo: null, mlb: emptyMlbGroups(), npb: emptyNpbGroups() };

  for (const league of BASEBALL.leagues) {
    const url = `${BASEBALL.host}/standings?league=${league.id}&season=${league.season}`;
    try {
      const json = await fetchJson(url, { headers });
      const rows = extractBaseballRows(json)
        .map(normalizeBaseballTeam)
        .filter((r) => r.position && r.team?.name);

      if (!rows.length || !safeArray(json?.response).length) {
        console.warn(`[warn] baseball ${league.key}: empty response`);
        if (league.key === 'kbo') out.kbo = null;
        if (league.key === 'mlb') out.mlb = emptyMlbGroups();
        if (league.key === 'npb') out.npb = emptyNpbGroups();
      } else if (league.key === 'kbo') {
        out.kbo = rows;
      } else if (league.key === 'mlb') {
        const grouped = emptyMlbGroups();
        for (const r of rows) {
          const key = groupKeyFromMlbGroupName(r.group);
          if (key) grouped[key].push(r);
        }
        out.mlb = grouped;
      } else if (league.key === 'npb') {
        const grouped = emptyNpbGroups();
        for (const r of rows) {
          const key = groupKeyFromNpbGroupName(r.group);
          if (key) grouped[key].push(r);
        }
        out.npb = grouped;
      }
    } catch (e) {
      console.warn(`[warn] baseball ${league.key}: ${e.message}`);
      if (league.key === 'kbo') out.kbo = null;
      if (league.key === 'mlb') out.mlb = emptyMlbGroups();
      if (league.key === 'npb') out.npb = emptyNpbGroups();
    }
    await sleep(500);
  }

  return out;
}

// -----------------------
// NBA
// -----------------------

const NBA = {
  host: 'https://v2.nba.api-sports.io',
  league: 'standard',
  season: 2025,
};

function extractNbaTeams(payload) {
  return safeArray(payload?.response)
    .map((row) => ({
      team: { name: row?.team?.name ?? null },
      conference: row?.conference?.name ?? row?.conference ?? null,
      division: row?.division?.name ?? row?.division ?? null,
      win: { total: row?.win?.total ?? null, percentage: row?.win?.percentage ?? null },
      loss: { total: row?.loss?.total ?? null },
      streak: row?.streak ?? null,
      winStreak: row?.winStreak ?? null,
      home: row?.home ?? null,
      away: row?.away ?? null,
      divisionRecord: row?.divisionRecord ?? null,
      rank: row?.conference?.rank ?? row?.rank ?? null,
    }))
    .filter((r) => r.team?.name);
}

async function fetchNba() {
  const headers = requireKey();
  const url = `${NBA.host}/standings?league=${NBA.league}&season=${NBA.season}`;
  try {
    const json = await fetchJson(url, { headers });
    const rows = extractNbaTeams(json);
    if (!rows.length || !safeArray(json?.response).length) {
      console.warn('[warn] nba: empty response');
      return { 동부: [], 서부: [] };
    }

    const east = [];
    const west = [];
    for (const r of rows) {
      const conf = String(r.conference || '').toLowerCase();
      if (conf.includes('east')) east.push(r);
      else if (conf.includes('west')) west.push(r);
    }
    return { 동부: east, 서부: west };
  } catch (e) {
    console.warn(`[warn] nba: ${e.message}`);
    return { 동부: [], 서부: [] };
  } finally {
    await sleep(500);
  }
}

// -----------------------
// Basketball KBL/WKBL
// -----------------------

const BASKETBALL = {
  host: 'https://v1.basketball.api-sports.io',
  season: '2025-2026',
};

async function findBasketballLeagueId(name, country) {
  const headers = requireKey();
  const url = `${BASKETBALL.host}/leagues?name=${encodeURIComponent(name)}&country=${encodeURIComponent(country)}`;
  const json = await fetchJson(url, { headers });
  const league = safeArray(json?.response)[0];
  return league?.id ?? league?.league?.id ?? null;
}

function extractBasketballStandings(payload) {
  const resp0 = safeArray(payload?.response)[0];
  const standings = safeArray(resp0?.standings);
  const rows = standings.length ? standings : safeArray(payload?.response);
  return rows
    .map((row) => ({
      rank: row?.rank ?? row?.position ?? null,
      team: { name: row?.team?.name ?? null },
      games: { played: row?.games?.played ?? null },
      win: row?.games?.win?.total ?? row?.win?.total ?? null,
      loss: row?.games?.lose?.total ?? row?.loss?.total ?? null,
      winRate: row?.games?.win?.percentage ?? row?.win?.percentage ?? null,
      gamesBack: row?.gamesBack ?? row?.gb ?? null,
      streak: row?.streak ?? null,
    }))
    .filter((r) => r.rank && r.team?.name);
}

async function fetchKoreanBasketballLeague(name) {
  const headers = requireKey();
  try {
    const id = await findBasketballLeagueId(name, 'South Korea');
    await sleep(500);
    if (!id) {
      console.warn(`[warn] basketball ${name}: league id not found`);
      return [];
    }
    const url = `${BASKETBALL.host}/standings?league=${id}&season=${encodeURIComponent(BASKETBALL.season)}`;
    const json = await fetchJson(url, { headers });
    const rows = extractBasketballStandings(json);
    if (!rows.length || !safeArray(json?.response).length) {
      console.warn(`[warn] basketball ${name}: empty standings`);
      return [];
    }
    return rows;
  } catch (e) {
    console.warn(`[warn] basketball ${name}: ${e.message}`);
    return [];
  } finally {
    await sleep(500);
  }
}

// -----------------------
// Volleyball V-League
// -----------------------

const VOLLEYBALL = {
  host: 'https://v1.volleyball.api-sports.io',
  season: '2025-2026',
};

function extractVolleyballStandings(payload) {
  const resp0 = safeArray(payload?.response)[0];
  const standings = safeArray(resp0?.standings);
  const rows = standings.length ? standings : safeArray(payload?.response);
  return rows
    .map((row) => ({
      rank: row?.rank ?? row?.position ?? null,
      team: { name: row?.team?.name ?? null },
      points: row?.points ?? null,
      played: row?.games?.played ?? row?.played ?? null,
      win: row?.games?.win?.total ?? row?.win?.total ?? null,
      loss: row?.games?.lose?.total ?? row?.loss?.total ?? null,
      setRatio: row?.sets?.ratio ?? row?.setRatio ?? null,
      pointRatio: row?.pointsRatio ?? row?.pointRatio ?? null,
    }))
    .filter((r) => r.rank && r.team?.name);
}

async function fetchVolleyballStandingsByLeagueId(id) {
  const headers = requireKey();
  const url = `${VOLLEYBALL.host}/standings?league=${id}&season=${encodeURIComponent(VOLLEYBALL.season)}`;
  const json = await fetchJson(url, { headers });
  return extractVolleyballStandings(json);
}

async function fetchVolleyball() {
  const headers = requireKey();
  const out = { vLeagueMen: [], vLeagueWomen: [] };

  try {
    const url = `${VOLLEYBALL.host}/leagues?country=${encodeURIComponent('South Korea')}`;
    const json = await fetchJson(url, { headers });
    await sleep(500);

    const leagues = safeArray(json?.response).filter((l) => {
      const name = String(l?.name ?? l?.league?.name ?? '');
      return /v-?league/i.test(name);
    });

    if (!leagues.length) {
      console.warn('[warn] volleyball: V-League not found');
      return out;
    }

    for (const league of leagues) {
      const id = league?.id ?? league?.league?.id;
      const name = String(league?.name ?? league?.league?.name ?? '').toLowerCase();
      if (!id) continue;

      try {
        const rows = await fetchVolleyballStandingsByLeagueId(id);
        if (!rows.length) {
          console.warn(`[warn] volleyball league ${name}: empty standings`);
          continue;
        }
        if (name.includes('women') || name.includes('woman') || name.includes('여자') || name.includes('female')) {
          out.vLeagueWomen = rows;
        } else {
          out.vLeagueMen = rows;
        }
      } catch (e) {
        console.warn(`[warn] volleyball league ${name}: ${e.message}`);
      }
      await sleep(500);
    }
  } catch (e) {
    console.warn(`[warn] volleyball: ${e.message}`);
  }

  return out;
}

async function main() {
  const dataDir = path.resolve('data');
  await ensureDir(dataDir);

  const football = await fetchFootball();
  const baseball = await fetchBaseball();
  const nba = await fetchNba();
  const kbl = await fetchKoreanBasketballLeague('KBL');
  const wkbl = await fetchKoreanBasketballLeague('WKBL');
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
