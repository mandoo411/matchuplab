/* eslint-disable no-console */
/**
 * Fetch live football scores (K리그 + EPL/분데스리가/라리가/세리에A/리그앙) and
 * persist to data/livescore-football.json as a static JSON snapshot.
 *
 * 이 스크립트는 GitHub Actions cron(.github/workflows/fetch-livescore.yml)으로
 * 짧은 주기(예: 5분)마다 실행된다. Vercel 서버리스(api/livescore.js)가 아니라
 * cron 방식을 쓰는 이유: football-data.org API 키(FOOTBALL_DATA_KEY)가 이미
 * GitHub Secrets에만 등록되어 있고, Vercel에 새 환경변수로 추가하려면 비밀값을
 * Vercel 대시보드 웹 폼에 직접 입력해야 하는데 이는 보안 정책상 자동화 도구가
 * 대신 수행할 수 없는 작업이라, 기존 키를 그대로 재사용할 수 있는 cron 방식을 쓴다.
 *
 * K리그는 공식 일정 API(getScheduleList.do)가 SPA 내부 POST 호출이라 정확한 요청
 * 파라미터를 브라우저 자동화로 확인하지 못했다 (응답이 보안 필터에 의해 차단되어
 * 직접 들여다볼 수 없었음). 아래 fetchKLeagueLive()는 best-effort로 몇 가지
 * 그럴듯한 파라미터 조합을 시도하고, 실패 시 빈 배열로 안전하게 폴백한다.
 * GitHub Actions는 이 샌드박스와 달리 네트워크 제한이 없으므로, 실행 로그를 보고
 * 추후 파라미터를 다시 조정할 수 있다.
 */

const fs = require('fs/promises');
const path = require('path');

const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_KEY;
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUT_FILE = path.join(DATA_DIR, 'livescore-football.json');

async function fetchJson(url, opts = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url}: ${text.slice(0, 200)}`);
    }
    return json;
  } finally {
    clearTimeout(timer);
  }
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

function formatKickoff(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

// -----------------------
// 팀명 보정 (scripts/fetch-standings.js의 koreanizableFootballName과 동일 로직 복제 —
// 이 프로젝트는 스크립트 간 공유 모듈이 없는 단일 파일 구조 컨벤션을 따른다)
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
// EU 5대 리그 (football-data.org)
// -----------------------

const FOOTBALL_DATA_HOST = 'https://api.football-data.org/v4';
const EU_LEAGUES = [
  { key: 'epl', code: 'PL' },
  { key: 'bundesliga', code: 'BL1' },
  { key: 'laLiga', code: 'PD' },
  { key: 'serieA', code: 'SA' },
  { key: 'ligue1', code: 'FL1' },
];

function mapMatchStatus(m) {
  const s = m.status;
  const home = m.score?.fullTime?.home ?? null;
  const away = m.score?.fullTime?.away ?? null;

  if (s === 'IN_PLAY' || s === 'PAUSED') {
    return {
      status: 'live',
      scoreA: home ?? 0,
      scoreB: away ?? 0,
      display: s === 'PAUSED' ? 'HT' : m.minute ? `${m.minute}'` : '진행중',
    };
  }
  if (s === 'FINISHED') {
    return { status: 'finished', scoreA: home ?? 0, scoreB: away ?? 0, display: '종료' };
  }
  if (s === 'POSTPONED') {
    return { status: 'finished', scoreA: null, scoreB: null, display: '연기' };
  }
  if (s === 'SUSPENDED') {
    return { status: 'finished', scoreA: home, scoreB: away, display: '중단' };
  }
  if (s === 'CANCELLED' || s === 'AWARDED') {
    return { status: 'finished', scoreA: home, scoreB: away, display: '취소' };
  }
  // SCHEDULED / TIMED
  return { status: 'upcoming', scoreA: null, scoreB: null, display: formatKickoff(m.utcDate) };
}

async function fetchEuLeagueLive(code, headers) {
  const now = new Date();
  const from = new Date(now);
  from.setUTCDate(from.getUTCDate() - 1);
  const to = new Date(now);
  to.setUTCDate(to.getUTCDate() + 1);

  const url = `${FOOTBALL_DATA_HOST}/competitions/${code}/matches?dateFrom=${fmtDate(from)}&dateTo=${fmtDate(to)}`;
  const json = await fetchJson(url, { headers });
  const matches = safeArray(json?.matches);

  return matches
    .map((m) => {
      const mapped = mapMatchStatus(m);
      return {
        id: `live-fb-${code}-${m.id}`,
        teamA: koreanizableFootballName(m.homeTeam?.name, m.homeTeam?.shortName) || m.homeTeam?.name || '',
        teamB: koreanizableFootballName(m.awayTeam?.name, m.awayTeam?.shortName) || m.awayTeam?.name || '',
        ...mapped,
      };
    })
    .filter((m) => m.teamA && m.teamB);
}

async function fetchEuFootball() {
  if (!FOOTBALL_DATA_KEY) {
    console.warn('[warn] football: FOOTBALL_DATA_KEY not set, skipping EU leagues');
    return { epl: [], bundesliga: [], laLiga: [], serieA: [], ligue1: [] };
  }
  const headers = { 'X-Auth-Token': FOOTBALL_DATA_KEY };
  const out = {};
  for (const league of EU_LEAGUES) {
    try {
      out[league.key] = await fetchEuLeagueLive(league.code, headers);
    } catch (e) {
      console.warn(`[warn] football live ${league.key}: ${e.message}`);
      out[league.key] = [];
    }
    // football-data.org 무료 플랜 레이트리밋(10req/min) 여유 확보
    await new Promise((r) => setTimeout(r, 1500));
  }
  return out;
}

// -----------------------
// K리그 (kleague.com) — best-effort
// -----------------------

const KLEAGUE_TEAM_NAMES = {
  K09: 'FC서울',
  K01: '울산 HD',
  K05: '전북 현대',
  K21: '강원 FC',
  K03: '포항 스틸러스',
  K18: '인천 유나이티드',
  K27: 'FC안양',
  K04: '제주SK FC',
  K26: '부천 FC',
  K10: '대전 하나 시티즌',
  K35: '김천 상무',
  K22: '광주 FC',
};

const KLEAGUE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; MatchUpLabBot/1.0; +https://matchuplab-six.vercel.app)',
  Referer: 'https://www.kleague.com/schedule.do',
};

function resolveKLeagueTeamName(raw) {
  if (!raw) return '';
  return KLEAGUE_TEAM_NAMES[raw] || raw;
}

async function tryGetScheduleList(body, contentType) {
  const opts = { method: 'POST', headers: { ...KLEAGUE_HEADERS } };
  if (contentType === 'json') {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else {
    opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    opts.body = new URLSearchParams(body).toString();
  }
  const json = await fetchJson('https://www.kleague.com/getScheduleList.do', opts, 8000);
  return json;
}

async function fetchKLeagueLive() {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const attempts = [
    [{ leagueId: 1, year, month }, 'json'],
    [{ leagueId: '1', year, month }, 'form'],
    [{ leagueId: 1, years: year, months: month }, 'json'],
  ];

  for (const [body, type] of attempts) {
    try {
      const json = await tryGetScheduleList(body, type);
      const rows = safeArray(json?.data?.scheduleList || json?.data || json?.scheduleList);
      if (!rows.length) continue;

      console.warn(`[debug] kleague getScheduleList.do succeeded with body=${JSON.stringify(body)} type=${type}, sample=${JSON.stringify(rows[0]).slice(0, 300)}`);

      const todayStr = `${year}${month}${String(now.getDate()).padStart(2, '0')}`;
      const games = rows
        .filter((r) => {
          const d = String(r.gameDate || r.matchDate || '').replace(/-/g, '');
          return d === todayStr;
        })
        .map((r, idx) => {
          const teamA = resolveKLeagueTeamName(r.homeTeamName || r.team1Name || r.homeTeamId);
          const teamB = resolveKLeagueTeamName(r.awayTeamName || r.team2Name || r.awayTeamId);
          const scoreA = r.homeScore ?? r.score1 ?? null;
          const scoreB = r.awayScore ?? r.score2 ?? null;
          const statusRaw = String(r.gameStatus || r.status || '');

          let status = 'upcoming';
          let display = r.gameTime || r.matchTime || '';
          if (/종료|END|FINISH/i.test(statusRaw)) {
            status = 'finished';
            display = '종료';
          } else if (scoreA != null || scoreB != null) {
            status = 'live';
            display = statusRaw || '진행중';
          }

          return {
            id: `live-fb-kleague-${idx}`,
            teamA,
            teamB,
            status,
            scoreA: scoreA != null ? Number(scoreA) : null,
            scoreB: scoreB != null ? Number(scoreB) : null,
            display,
          };
        })
        .filter((g) => g.teamA && g.teamB);

      if (games.length) return games;
    } catch (e) {
      console.warn(`[warn] kleague live attempt (${type}) failed: ${e.message}`);
    }
  }

  console.warn('[warn] kleague live: no working request shape found, falling back to empty list');
  return [];
}

async function main() {
  const [kLeague, eu] = await Promise.all([fetchKLeagueLive(), fetchEuFootball()]);

  const out = {
    kLeague,
    epl: eu.epl || [],
    bundesliga: eu.bundesliga || [],
    laLiga: eu.laLiga || [],
    serieA: eu.serieA || [],
    ligue1: eu.ligue1 || [],
    updatedAt: new Date().toISOString(),
  };

  await ensureDir(DATA_DIR);
  await writeJson(OUT_FILE, out);
  console.log(`[ok] wrote ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
