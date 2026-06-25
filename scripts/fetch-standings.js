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
 * No working free real-data source exists for: K리그.
 * It is intentionally left null/empty so the existing frontend fallback
 * logic (js/sports-data.js dummy data) kicks in automatically — this is by design,
 * not a bug.
 *
 * KBO / WKBL / V리그(KOVO) / NPB are scraped directly from the official sites:
 *  - KBO   : koreabaseball.com 팀 순위 페이지 (서버사이드 렌더링 HTML 테이블, 인증 불필요)
 *  - WKBL  : wkbl.or.kr 내부 AJAX 엔드포인트 (POST, 인증 불필요)
 *  - KOVO  : kovo.co.kr 메인페이지가 쓰는 공개 JSON API (인증 불필요)
 *  - KBL   : api.kbl.or.kr 팀순위 API (Channel/TeamCode/lang 정적 헤더 필요 — 비밀값
 *            아님, kbl.or.kr 사이트 JS가 모든 방문자에게 동일하게 보내는 값)
 *  - NPB   : npb.jp 공식 영문 순위 페이지 (서버사이드 렌더링 HTML 테이블, 인증 불필요)
 *
 * 시즌 전(경기 0개) 처리: football-data.org는 새 시즌이 생성되면 전 팀 played=0인
 * 테이블을 반환하는데, 이 경우 그대로 보여주면 전부 0으로 보여 의미가 없으므로
 * 직전 시즌 최종 순위를 ?season= 파라미터로 재조회해 대체한다 (fetchFootball 참고).
 * NPB도 동일한 이유로 오프시즌엔 직전 연도 페이지로 자동 폴백한다 (fetchNpb 참고).
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

function mapFootballTable(table) {
  return table
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
}

async function fetchFootballStandings(code, headers, seasonYear) {
  const url = seasonYear
    ? `${FOOTBALL_DATA.host}/competitions/${code}/standings?season=${seasonYear}`
    : `${FOOTBALL_DATA.host}/competitions/${code}/standings`;
  const json = await fetchJson(url, { headers });
  return { json, rows: mapFootballTable(extractFootballDataTable(json)) };
}

async function fetchFootball() {
  const out = { kLeague: null, epl: null, bundesliga: null, ligue1: null, serieA: null, laLiga: null };

  if (!FOOTBALL_DATA_KEY) {
    console.warn('[warn] football: FOOTBALL_DATA_KEY not set, skipping (will fall back to dummy)');
    return out;
  }

  const headers = { 'X-Auth-Token': FOOTBALL_DATA_KEY };

  for (const league of FOOTBALL_DATA.leagues) {
    try {
      let { json, rows } = await fetchFootballStandings(league.code, headers);
      const totalPlayed = rows.reduce((sum, r) => sum + (r.all.played || 0), 0);

      // 새 시즌이 막 생성되어 전 팀 played=0인 경우(시즌 시작 전) → 직전 시즌
      // 최종 순위로 대체. 그렇지 않으면 사이트에 의미 없는 전부-0 테이블이 노출됨.
      if (rows.length && totalPlayed === 0) {
        const startYear = json?.season?.startDate ? Number(String(json.season.startDate).slice(0, 4)) : null;
        if (startYear) {
          console.warn(
            `[warn] football ${league.key}: season ${startYear} not started yet (played=0), falling back to ${startYear - 1} final standings`
          );
          await sleep(7000);
          try {
            const prev = await fetchFootballStandings(league.code, headers, startYear - 1);
            if (prev.rows.length) rows = prev.rows;
          } catch (e2) {
            console.warn(`[warn] football ${league.key}: prev-season fallback failed: ${e2.message}`);
          }
        }
      }

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

// -----------------------
// KBO (koreabaseball.com 팀 순위 - 서버사이드 렌더링 HTML 테이블, 인증/키 불필요)
// -----------------------

const KBO_TEAM_FULL_NAME = {
  LG: 'LG 트윈스',
  KT: 'KT 위즈',
  삼성: '삼성 라이온즈',
  KIA: 'KIA 타이거즈',
  두산: '두산 베어스',
  한화: '한화 이글스',
  NC: 'NC 다이노스',
  롯데: '롯데 자이언츠',
  SSG: 'SSG 랜더스',
  키움: '키움 히어로즈',
};

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
}

// 범용 HTML 테이블 파서: class에 classHint가 포함된 첫 번째 <table>을 찾아
// 각 행을 셀 텍스트 배열로 반환 (중첩 마크업은 제거한 순수 텍스트만 추출).
function parseHtmlTableRows(html, classHint) {
  const tableRegex = new RegExp(`<table[^>]*class="[^"]*${classHint}[^"]*"[^>]*>([\\s\\S]*?)<\\/table>`, 'i');
  const tableMatch = html.match(tableRegex);
  if (!tableMatch) return [];

  const rows = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(tableMatch[1]))) {
    const cells = [];
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowMatch[1]))) {
      cells.push(stripTags(cellMatch[1]));
    }
    if (cells.length) rows.push(cells);
  }
  return rows;
}

function formatGamesBackNum(v) {
  if (v == null || v === '') return '0.0';
  const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
  return Number.isNaN(n) ? String(v) : n.toFixed(1);
}

async function fetchKbo() {
  try {
    const res = await fetch('https://www.koreabaseball.com/Record/TeamRank/TeamRank.aspx', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MatchUpLabBot/1.0; +https://matchuplab-six.vercel.app)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const rows = parseHtmlTableRows(html, 'tData');
    // 첫 행은 헤더(순위/팀명/경기/승/패/무/승률/게임차/최근10경기/연속/홈/방문)
    const dataRows = rows.slice(1).filter((r) => r.length >= 10);
    if (!dataRows.length) throw new Error('no data rows parsed');

    const teams = dataRows
      .map((cells) => {
        const [rank, teamRaw, games, win, loss, draw, winRate, gamesBack, , streak] = cells;
        const rankNum = Number(rank);
        if (!rankNum || !teamRaw) return null;
        return {
          rank: rankNum,
          team: { name: KBO_TEAM_FULL_NAME[teamRaw] || teamRaw },
          win: Number(win) || 0,
          loss: Number(loss) || 0,
          draw: Number(draw) || 0,
          played: Number(games) || 0,
          win_rate: winRate,
          gamesBack: formatGamesBackNum(gamesBack),
          streak: streak || null,
        };
      })
      .filter(Boolean);

    if (!teams.length) throw new Error('teams empty after parsing');
    return teams;
  } catch (e) {
    console.warn(`[warn] kbo: ${e.message}`);
    return null;
  }
}

// -----------------------
// NPB (npb.jp 공식 영문 순위 페이지 - 서버사이드 렌더링 HTML 테이블, 인증/키 불필요)
// 오프시즌(다음 시즌 페이지가 아직 없음)에는 직전 연도 페이지로 자동 폴백한다.
// -----------------------

const NPB_LEAGUE_CODES = { 센트럴: 'c', 퍼시픽: 'p' };

async function fetchNpbLeagueTable(year, code) {
  const url = `https://npb.jp/bis/eng/${year}/stats/std_${code}.html`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MatchUpLabBot/1.0; +https://matchuplab-six.vercel.app)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const html = await res.text();

  // npb.jp 순위 테이블은 class="tablefix2" (첫 번째 매치 = 정규시즌 순위표,
  // 두 번째는 교류전 표 — parseHtmlTableRows는 첫 매치만 사용하므로 안전함)
  const rows = parseHtmlTableRows(html, 'tablefix2');
  const dataRows = rows.filter((r) => r.length >= 6 && r[0] && !Number.isNaN(Number(r[1])) && Number(r[1]) > 0);
  if (!dataRows.length) throw new Error('no data rows parsed');

  return dataRows.map((cells, i) => {
    // [팀명, G, W, L, T, PCT, GB, ...(리그마다 다른 상대전적 컬럼들)]
    const [teamName, g, w, l] = cells;
    const win = Number(w) || 0;
    const loss = Number(l) || 0;
    return {
      position: i + 1,
      team: { name: teamName.trim() },
      games: { played: Number(g) || win + loss },
      wins: { total: win, percentage: cells[5] ?? null },
      loses: { total: loss },
      streak: null,
    };
  });
}

async function fetchNpb() {
  const out = emptyNpbGroups();
  const year = NOW.getFullYear();

  for (const [groupKey, code] of Object.entries(NPB_LEAGUE_CODES)) {
    try {
      out[groupKey] = await fetchNpbLeagueTable(year, code);
    } catch (e) {
      console.warn(`[warn] npb ${groupKey} (${year}): ${e.message}`);
      // 오프시즌이라 해당 연도 페이지가 아직 없는 경우 직전 연도 최종 순위로 대체
      try {
        out[groupKey] = await fetchNpbLeagueTable(year - 1, code);
      } catch (e2) {
        console.warn(`[warn] npb ${groupKey} (${year - 1} fallback): ${e2.message}`);
      }
    }
    await sleep(2000);
  }

  return out;
}

async function fetchBaseball() {
  const mlb = await fetchMlb();
  const kbo = await fetchKbo();
  const npb = await fetchNpb();
  return { kbo, mlb, npb };
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
// Basketball KBL (api.kbl.or.kr) — 사이트 JS가 쓰는 공개 JSON API
// Channel/TeamCode/lang 헤더가 없으면 "필수 헤더 정보가 누락되었습니다" 에러가 나는데,
// 이 값들은 비밀 토큰/쿠키가 아니라 kbl.or.kr 프론트엔드 코드에 고정으로 박혀있는 정적
// 값(모든 방문자가 동일하게 보냄) — Chrome 네트워크 탭에서 실제 요청을 확인해서 알아냄.
// -----------------------

async function fetchKbl() {
  try {
    const json = await fetchJson('https://api.kbl.or.kr/league/rank/team?', {
      headers: {
        Accept: 'application/json, text/plain, */*',
        Channel: 'WEB',
        TeamCode: 'XX',
        lang: 'ko',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (compatible; MatchUpLabBot/1.0; +https://matchuplab-six.vercel.app)',
      },
    });
    const rows = safeArray(json);
    if (!rows.length) throw new Error('empty team rank list');

    const teams = rows
      .map((row) => {
        const rankNum = Number(row?.rank);
        const teamName = row?.tname;
        if (!rankNum || !teamName) return null;
        const win = Number(row?.win) || 0;
        const loss = Number(row?.loss) || 0;
        const contiWin = Number(row?.contiWin) || 0;
        const contiLoss = Number(row?.contiLoss) || 0;
        const streak = contiWin > 0 ? `${contiWin}승` : contiLoss > 0 ? `${contiLoss}패` : null;
        return {
          rank: rankNum,
          team: { name: teamName },
          win,
          loss,
          played: win + loss,
          win_rate: win + loss ? Number((win / (win + loss)).toFixed(3)) : 0,
          gamesBack: formatGamesBackNum(row?.winDiff),
          streak,
        };
      })
      .filter(Boolean);

    if (!teams.length) throw new Error('teams empty after parsing');
    return teams;
  } catch (e) {
    console.warn(`[warn] kbl: ${e.message}`);
    return [];
  }
}

// -----------------------
// Basketball WKBL (wkbl.or.kr 내부 AJAX, 인증/키 불필요)
// -----------------------

async function fetchWkbl() {
  try {
    const res = await fetch('https://www.wkbl.or.kr/game/ajax/ajax_team_rank.asp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (compatible; MatchUpLabBot/1.0; +https://matchuplab-six.vercel.app)',
      },
      body: 'gun=1',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const rows = [];
    const rowRegex = /<tr class="team_rnak_table">([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(html))) {
      const cells = [];
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[1]))) {
        cells.push(stripTags(cellMatch[1]));
      }
      if (cells.length) rows.push(cells);
    }

    const teams = rows
      .map((cells) => {
        // [순위, 팀명, 경기, "21승 9패", 승률(0-100), 게임차, 홈, 원정, 중립, 최근5, 연속]
        const [rank, teamName, games, record, winRate, gamesBack, , , , , streak] = cells;
        const rankNum = Number(rank);
        if (!rankNum || !teamName) return null;
        const m = String(record || '').match(/(\d+)\s*승\s*(\d+)\s*패/);
        const win = m ? Number(m[1]) : 0;
        const loss = m ? Number(m[2]) : 0;
        return {
          rank: rankNum,
          team: { name: teamName },
          win,
          loss,
          played: Number(games) || win + loss,
          win_rate: winRate,
          gamesBack: formatGamesBackNum(gamesBack),
          streak: streak || null,
        };
      })
      .filter(Boolean);

    if (!teams.length) throw new Error('no teams parsed');
    return teams;
  } catch (e) {
    console.warn(`[warn] wkbl: ${e.message}`);
    return [];
  }
}

// -----------------------
// Volleyball V-League(남/여) — kovo.co.kr 메인페이지가 쓰는 공개 JSON API
// (인증/키 불필요, leagueCode=201은 정규시즌 고정 코드로 추정 — 시즌은 서버가 자동 최신화)
// -----------------------

async function fetchKovoTeamRank(teamType) {
  const url = `https://user-api.kovo.co.kr/main/game/league/team-rank?teamType=${teamType}&page=0&size=30&leagueCode=201`;
  const json = await fetchJson(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MatchUpLabBot/1.0; +https://matchuplab-six.vercel.app)' },
  });
  const payload = safeArray(json?.payload);

  return payload
    .map((t) => {
      if (!t?.rank || !t?.tsname) return null;
      return {
        rank: t.rank,
        team: { name: t.tsname },
        win: t.win ?? 0,
        loss: t.lost ?? 0,
        played: (t.win ?? 0) + (t.lost ?? 0),
        points: t.winp ?? 0, // KOVO API의 winp는 승률(%)이 아니라 실제 승점(누적)
        setRatio: t.slost ? Number((t.swin / t.slost).toFixed(3)) : t.swin || 0,
        pointRatio: t.lpoint ? Number((t.point / t.lpoint).toFixed(3)) : t.point || 0,
      };
    })
    .filter(Boolean);
}

async function fetchVolleyball() {
  const out = { vLeagueMen: [], vLeagueWomen: [] };
  try {
    out.vLeagueMen = await fetchKovoTeamRank('MEN');
  } catch (e) {
    console.warn(`[warn] vLeagueMen(kovo): ${e.message}`);
  }
  try {
    out.vLeagueWomen = await fetchKovoTeamRank('WOMEN');
  } catch (e) {
    console.warn(`[warn] vLeagueWomen(kovo): ${e.message}`);
  }
  return out;
}

async function main() {
  const dataDir = path.resolve('data');
  await ensureDir(dataDir);

  const football = await fetchFootball();
  const baseball = await fetchBaseball();
  const nba = await fetchNba();
  const kbl = await fetchKbl();
  const wkbl = await fetchWkbl();
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
