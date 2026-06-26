/**
 * MatchUp LAB - 라이브스코어 실데이터 fetch + LIVESCORE_DATA 갱신
 *
 * 라이브스코어는 "지금 이 순간"을 보여주는 페이지이므로, 리그순위(standings)와는
 * 폴백 정책이 다르다:
 *  - API fetch 자체가 실패하면(네트워크 오류 등) 더미 데이터로 폴백한다 (완전 빈 화면보다 낫다).
 *  - API fetch는 성공했지만 해당 리그에 경기가 없으면 빈 배열을 그대로 보여준다
 *    (가짜 더미 경기를 LIVE처럼 보여주는 것은 사용자를 오도할 수 있어 지양한다).
 *  - 실시간 소스가 아예 없는 리그(NPB, KBL, WKBL, V리그)는 항상 빈 배열로 둔다.
 */
const MatchUpLivescoreLoader = (function () {
  'use strict';

  const LIVE_API_URL = '/api/livescore'; // Vercel 서버리스: MLB / KBO / NBA
  const FOOTBALL_JSON_URL = 'data/livescore-football.json'; // GitHub Actions cron: K리그 + EU 5대 리그

  const NO_LIVE_SOURCE_KEYS = {
    baseball: ['npb'],
    basketball: ['kbl', 'wkbl'],
    volleyball: ['vLeagueMen', 'vLeagueWomen'],
  };

  function normalize(name, leagueKey) {
    if (typeof normalizeTeamName === 'function') {
      return normalizeTeamName(name, leagueKey) || name;
    }
    return name;
  }

  function mapMatches(rows, leagueKey) {
    if (!Array.isArray(rows)) return [];
    return rows.map((m) => ({
      id: m.id,
      teamA: normalize(m.teamA, leagueKey),
      teamB: normalize(m.teamB, leagueKey),
      status: m.status,
      scoreA: m.scoreA,
      scoreB: m.scoreB,
      display: m.display,
    }));
  }

  async function fetchJsonSafe(url) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`[livescore] fetch failed: ${url}`, e);
      return null;
    }
  }

  async function load() {
    const fallback = typeof LIVESCORE_DUMMY_DATA !== 'undefined' ? LIVESCORE_DUMMY_DATA : LIVESCORE_DATA;

    const [liveApi, footballApi] = await Promise.all([
      fetchJsonSafe(LIVE_API_URL),
      fetchJsonSafe(FOOTBALL_JSON_URL),
    ]);

    const football = {};
    const footballKeys = ['kLeague', 'epl', 'bundesliga', 'ligue1', 'serieA', 'laLiga'];
    footballKeys.forEach((key) => {
      if (footballApi) {
        football[key] = mapMatches(footballApi[key], key);
      } else {
        football[key] = fallback.football?.[key] || [];
      }
    });

    const baseball = {};
    if (liveApi) {
      baseball.kbo = mapMatches(liveApi.kbo, 'kbo');
      baseball.mlb = mapMatches(liveApi.mlb, 'mlb');
    } else {
      baseball.kbo = fallback.baseball?.kbo || [];
      baseball.mlb = fallback.baseball?.mlb || [];
    }
    NO_LIVE_SOURCE_KEYS.baseball.forEach((key) => {
      baseball[key] = [];
    });

    const basketball = {};
    if (liveApi) {
      basketball.nba = mapMatches(liveApi.nba, 'nba');
    } else {
      basketball.nba = fallback.basketball?.nba || [];
    }
    NO_LIVE_SOURCE_KEYS.basketball.forEach((key) => {
      basketball[key] = [];
    });

    const volleyball = {};
    NO_LIVE_SOURCE_KEYS.volleyball.forEach((key) => {
      volleyball[key] = [];
    });

    LIVESCORE_DATA = { football, baseball, basketball, volleyball };
    return LIVESCORE_DATA;
  }

  return { load };
})();
