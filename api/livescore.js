/**
 * GET /api/livescore
 *
 * 실시간 라이브스코어 Vercel 서버리스 API.
 * 키 없이 무료로 접근 가능한 소스만 사용한다:
 *  - MLB : statsapi.mlb.com (공식, 무료, 인증 불필요)
 *  - KBO : koreabaseball.com 스코어보드 페이지 (서버사이드 렌더링 HTML, 인증 불필요)
 *  - NBA : cdn.nba.com 공개 라이브 스코어보드 JSON (best-effort; 차단/오프시즌 시 빈 배열)
 *
 * K리그 및 유럽 5대 리그(EPL/분데스리가/라리가/세리에A/리그앙)는 이 API가 아니라
 * GitHub Actions cron(scripts/fetch-livescore-football.js)이 주기적으로 갱신하는
 * data/livescore-football.json 정적 파일로 제공한다. football-data.org API 키를
 * Vercel 환경변수로 새로 등록하려면 Vercel 대시보드 폼에 비밀값을 직접 입력해야 하는데,
 * 이는 보안 정책상 자동화 도구가 대신 수행할 수 없는 작업이라 기존에 이미 GitHub Secrets에
 * 등록되어 있는 동일한 키를 그대로 재사용하는 cron 방식으로 처리한다.
 */

function timeoutFetch(url, opts, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function todayInTZ(timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function formatScheduledTime(iso, timeZone) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

// -----------------------
// MLB (statsapi.mlb.com)
// -----------------------
async function fetchMlbLive() {
  try {
    const date = todayInTZ('America/New_York');
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&hydrate=linescore,team`;
    const res = await timeoutFetch(url, {}, 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const games = (json?.dates || []).flatMap((d) => d.games || []);

    return games.map((g) => {
      const away = g?.teams?.away;
      const home = g?.teams?.home;
      const abstract = g?.status?.abstractGameState; // Preview | Live | Final
      const detailed = g?.status?.detailedState || '';
      const line = g?.linescore;

      let status = 'upcoming';
      let display = formatScheduledTime(g?.gameDate, 'America/New_York');
      let scoreA = null;
      let scoreB = null;

      if (abstract === 'Live') {
        status = 'live';
        scoreA = line?.teams?.away?.runs ?? 0;
        scoreB = line?.teams?.home?.runs ?? 0;
        const inning = line?.currentInning;
        const half = line?.inningHalf === 'Top' ? '초' : line?.inningHalf === 'Bottom' ? '말' : '';
        display = inning ? `${inning}회${half}` : detailed || '진행중';
      } else if (abstract === 'Final') {
        status = 'finished';
        scoreA = line?.teams?.away?.runs ?? 0;
        scoreB = line?.teams?.home?.runs ?? 0;
        display = '종료';
      } else if (detailed && /postpon|suspend|cancel/i.test(detailed)) {
        status = 'finished';
        display = '취소';
      }

      return {
        id: `live-bb-mlb-${g.gamePk}`,
        teamA: away?.team?.name ?? '',
        teamB: home?.team?.name ?? '',
        status,
        scoreA,
        scoreB,
        display,
      };
    });
  } catch (e) {
    console.warn(`[warn] mlb live: ${e.message}`);
    return [];
  }
}

// -----------------------
// KBO (koreabaseball.com 스코어보드 - 서버사이드 렌더링 HTML)
//
// 확인된 카드 구조 (Chrome DOM 검증 완료):
// <div class="smsScore">
//   <p class="leftTeam">...<strong class="teamT">AWAY</strong></p>
//   <div class="score_wrap">
//     <em class="score"><span>AWAY_SCORE</span></em>
//     <strong class="flag"><span>STATUS</span></strong>   // 경기전 | 경기종료 | (진행중 표시문구)
//     <em class="score"><span>HOME_SCORE</span></em>
//   </div>
//   <p class="rightTeam"><strong class="teamT">HOME</strong>...</p>
//   ...
//   <p class="place"><span>TIME</span></p>
// </div>
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

function extractFirst(html, regex) {
  const m = html.match(regex);
  return m ? stripTags(m[1]) : '';
}

async function fetchKboLive() {
  try {
    const res = await timeoutFetch(
      'https://www.koreabaseball.com/Schedule/ScoreBoard.aspx',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MatchUpLabBot/1.0; +https://matchuplab-six.vercel.app)' } },
      8000
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const blocks = html.split(/<div[^>]*class="[^"]*\bsmsScore\b[^"]*"[^>]*>/i).slice(1);
    const games = [];

    blocks.forEach((rest, idx) => {
      const block = rest.split(/<div[^>]*class="[^"]*\bsmsScore\b[^"]*"[^>]*>/i)[0];

      const leftTeamHtml = block.match(/<p[^>]*class="[^"]*\bleftTeam\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i)?.[1] || '';
      const rightTeamHtml = block.match(/<p[^>]*class="[^"]*\brightTeam\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i)?.[1] || '';
      const scoreWrapHtml = block.match(/<div[^>]*class="[^"]*\bscore_wrap\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1] || '';
      const placeHtml = block.match(/<p[^>]*class="[^"]*\bplace\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i)?.[1] || '';

      const rawA = extractFirst(leftTeamHtml, /<strong[^>]*class="[^"]*\bteamT\b[^"]*"[^>]*>([\s\S]*?)<\/strong>/i);
      const rawB = extractFirst(rightTeamHtml, /<strong[^>]*class="[^"]*\bteamT\b[^"]*"[^>]*>([\s\S]*?)<\/strong>/i);
      if (!rawA || !rawB) return;

      const scoreMatches = [...scoreWrapHtml.matchAll(/<em[^>]*class="[^"]*\bscore\b[^"]*"[^>]*>([\s\S]*?)<\/em>/gi)].map((m) =>
        stripTags(m[1])
      );
      const flagText = extractFirst(scoreWrapHtml, /<strong[^>]*class="[^"]*\bflag\b[^"]*"[^>]*>([\s\S]*?)<\/strong>/i);
      const timeText = stripTags(placeHtml);

      const teamA = KBO_TEAM_FULL_NAME[rawA] || rawA;
      const teamB = KBO_TEAM_FULL_NAME[rawB] || rawB;
      const awayScoreRaw = scoreMatches[0] || '';
      const homeScoreRaw = scoreMatches[1] || '';

      let status = 'upcoming';
      let display = timeText;
      let scoreA = null;
      let scoreB = null;

      if (/종료/.test(flagText)) {
        status = 'finished';
        display = '종료';
        scoreA = Number(awayScoreRaw) || 0;
        scoreB = Number(homeScoreRaw) || 0;
      } else if (/취소|연기|중지/.test(flagText)) {
        status = 'finished';
        display = flagText;
      } else if (awayScoreRaw !== '' || homeScoreRaw !== '') {
        status = 'live';
        display = flagText || '진행중';
        scoreA = Number(awayScoreRaw) || 0;
        scoreB = Number(homeScoreRaw) || 0;
      } else {
        status = 'upcoming';
        display = timeText || flagText || '경기전';
      }

      games.push({ id: `live-bb-kbo-${idx}`, teamA, teamB, status, scoreA, scoreB, display });
    });

    return games;
  } catch (e) {
    console.warn(`[warn] kbo live: ${e.message}`);
    return [];
  }
}

// -----------------------
// NBA (cdn.nba.com 공개 라이브 스코어보드 - best-effort, 차단/오프시즌 시 빈 배열)
// -----------------------
async function fetchNbaLive() {
  try {
    const res = await timeoutFetch(
      'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          Referer: 'https://www.nba.com/',
          Accept: 'application/json',
        },
      },
      6000
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const games = json?.scoreboard?.games || [];

    return games.map((g) => {
      const statusNum = g.gameStatus; // 1=upcoming, 2=live, 3=final
      let status = 'upcoming';
      let display = g.gameStatusText || '';
      let scoreA = null;
      let scoreB = null;

      if (statusNum === 2) {
        status = 'live';
        scoreA = g.awayTeam?.score ?? 0;
        scoreB = g.homeTeam?.score ?? 0;
        display = g.gameStatusText || `Q${g.period} ${g.gameClock || ''}`.trim();
      } else if (statusNum === 3) {
        status = 'finished';
        scoreA = g.awayTeam?.score ?? 0;
        scoreB = g.homeTeam?.score ?? 0;
        display = '종료';
      }

      return {
        id: `live-bk-nba-${g.gameId}`,
        teamA: `${g.awayTeam?.teamCity ?? ''} ${g.awayTeam?.teamName ?? ''}`.trim(),
        teamB: `${g.homeTeam?.teamCity ?? ''} ${g.homeTeam?.teamName ?? ''}`.trim(),
        status,
        scoreA,
        scoreB,
        display,
      };
    });
  } catch (e) {
    console.warn(`[warn] nba live: ${e.message}`);
    return [];
  }
}

module.exports = async function handler(req, res) {
  const [mlb, kbo, nba] = await Promise.all([fetchMlbLive(), fetchKboLive(), fetchNbaLive()]);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ mlb, kbo, nba, updatedAt: new Date().toISOString() });
};
