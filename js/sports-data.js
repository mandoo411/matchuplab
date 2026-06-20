/**
 * MatchUp LAB - 종목별 더미 경기 데이터
 * 추후 Supabase + API-Sports.io 연동 시 이 객체를 API 응답으로 교체
 */

const SPORTS_DATA = {
  // ⚽ 축구 (무승부 있음)
  football: {
    hasDraw: true,
    leagues: {
      kLeague: {
        id: 'kLeague',
        name: 'K리그',
        matches: [
          {
            id: 'fb-k1',
            teamA: '울산 HD',
            teamB: '전북 현대',
            time: '19:30',
            probWin: 42,
            probDraw: 28,
            probLoss: 30,
            confidence: 78,
            conclusion: '최근 5경기 무패, 핵심 수비수 복귀로 우세 전망',
            reason: '울산은 홈에서 최근 5경기 4승 1무. 전북은 원정 3연패 중이나 공격력은 유지. 홈 어드밴티지와 수비 조직력이 승부를 가를 것으로 분석됩니다.',
          },
        ],
      },
      epl: {
        id: 'epl',
        name: 'EPL',
        matches: [
          {
            id: 'fb-epl1',
            teamA: '아스널',
            teamB: '리버풀',
            time: '01:30',
            probWin: 38,
            probDraw: 27,
            probLoss: 35,
            confidence: 72,
            conclusion: '양팀 모두 공격력 최상위, 무승부 가능성 주목',
            reason: '최근 3시즌 H2H 2승 2무 2패로 팽팽. 양팀 모두 부상자 있으나 핵심 공격수 출전 예정. 오픈 플레이 득점력이 비슷해 접전 예상.',
          },
        ],
      },
      bundesliga: {
        id: 'bundesliga',
        name: '분데스리가',
        matches: [
          {
            id: 'fb-bl1',
            teamA: '바이에른 뮌헨',
            teamB: '보루시아 도르트문트',
            time: '23:30',
            probWin: 55,
            probDraw: 22,
            probLoss: 23,
            confidence: 81,
            conclusion: '홈 전적 우세, 최근 폼도 바이에른 뮌헨이 앞서',
            reason: '바이에른 뮌헨 홈 8연승 중. 보루시아 도르트문트 원정 3경기 1승 2패. xG 기준 바이에른 뮌헨이 0.4 더 높음. Der Klassiker 역사상 홈팀 승률 62%.',
          },
        ],
      },
      ligue1: {
        id: 'ligue1',
        name: '리그앙',
        matches: [],
      },
      serieA: {
        id: 'serieA',
        name: '세리에A',
        matches: [],
      },
      laLiga: {
        id: 'laLiga',
        name: '라리가',
        matches: [],
      },
    },
  },

  // ⚾ 야구 (무승부 없음)
  baseball: {
    hasDraw: false,
    leagues: {
      kbo: {
        id: 'kbo',
        name: 'KBO',
        matches: [
          {
            id: 'bb-kbo1',
            teamA: 'LG 트윈스',
            teamB: '두산 베어스',
            time: '18:30',
            probWin: 58,
            probDraw: 0,
            probLoss: 42,
            confidence: 75,
            conclusion: '선발 ERA 차이, LG 홈 구장에서 우세',
            reason: 'LG 선발 WHIP 1.12 vs 두산 1.38. LG 홈 12승 5패. 두산은 원정 타율 .245로 하위권. 불펜 ERA도 LG가 0.6 낮음.',
          },
        ],
      },
      mlb: {
        id: 'mlb',
        name: 'MLB',
        matches: [
          {
            id: 'bb-mlb1',
            teamA: '뉴욕 양키스',
            teamB: '보스턴 레드삭스',
            time: '08:05',
            probWin: 52,
            probDraw: 0,
            probLoss: 48,
            confidence: 68,
            conclusion: 'rivalry 경기, 투수전 예상으로 접전',
            reason: '양팀 시즌 OPS 비슷. 뉴욕 양키스 홈 15-10, 보스턴 레드삭스 원정 12-13. 선발 FIP 차이 0.2로 미미. 최근 10경기 H2H 5-5.',
          },
        ],
      },
      npb: {
        id: 'npb',
        name: 'NPB',
        matches: [],
      },
    },
  },

  // 🏐 배구 (무승부 없음)
  volleyball: {
    hasDraw: false,
    leagues: {
      vLeagueMen: {
        id: 'vLeagueMen',
        name: 'V리그 남자부',
        matches: [
          {
            id: 'vb-vm1',
            teamA: '대한항공',
            teamB: '현대캐피탈',
            time: '19:00',
            probWin: 45,
            probDraw: 0,
            probLoss: 55,
            confidence: 70,
            conclusion: '현대캐피탈 최근 4연승, 원정에서도 강세',
            reason: '현대캐피탈 시즌 승률 68%. 대한항공 홈이나 최근 3경기 1승 2패. 블로킹 성공률 현대캐피탈 8.2 vs 6.5. 세트 득실도 현대 우세.',
          },
        ],
      },
      vLeagueWomen: {
        id: 'vLeagueWomen',
        name: 'V리그 여자부',
        matches: [
          {
            id: 'vb-vw1',
            teamA: '흥국생명',
            teamB: '현대건설',
            time: '19:00',
            probWin: 52,
            probDraw: 0,
            probLoss: 48,
            confidence: 73,
            conclusion: '흥국생명 홈 연승, 현대건설 원정 수비 약세',
            reason: '흥국생명 홈 6연승. 현대건설 원정 4승 5패. 흥국생명 공격 성공률 48.2%로 리그 2위. 현대건설은 리시브 효율 하위권.',
          },
        ],
      },
    },
  },

  // 🏀 농구 (무승부 없음)
  basketball: {
    hasDraw: false,
    leagues: {
      kbl: {
        id: 'kbl',
        name: 'KBL · WKBL',
        matches: [
          {
            id: 'bk-kbl1',
            teamA: '서울 SK',
            teamB: '원주 DB',
            time: '19:00',
            probWin: 61,
            probDraw: 0,
            probLoss: 39,
            confidence: 76,
            conclusion: 'SK 홈 연승 중, DB 원정 약세',
            reason: 'SK 홈 10연승. DB 원정 5승 8패. SK eFG% 54.2% vs DB 48.1%. DB는 센터 부상으로 리바운드 열세 예상.',
          },
        ],
      },
      nba: {
        id: 'nba',
        name: 'NBA',
        matches: [
          {
            id: 'bk-nba1',
            teamA: '보스턴 셀틱스',
            teamB: '밀워키 벅스',
            time: '09:00',
            probWin: 48,
            probDraw: 0,
            probLoss: 52,
            confidence: 74,
            conclusion: '밀워키 벅스 원정 강세, 보스턴 셀틱스 홈 방어가 변수',
            reason: '밀워키 벅스 원정 NetRtg +4.2. 보스턴 셀틱스 홈 방어 효율 1위. Giannis 출전 예정. 최근 5경기 H2H 밀워키 벅스 3승. 페이스 차이로 고득점 예상.',
          },
        ],
      },
    },
  },
};

// 투명성 섹션: 최근 7일 예측-결과 더미 데이터
const TRANSPARENCY_RECORDS = [
  {
    date: '06-19',
    sport: '축구',
    match: '울산 HD vs 전북 현대',
    prediction: '홈 승',
    result: '홈 승 (2-1)',
    hit: true,
  },
  {
    date: '06-18',
    sport: '야구',
    match: 'LG 트윈스 vs 두산 베어스',
    prediction: '홈 승',
    result: '원정 승 (3-5)',
    hit: false,
  },
  {
    date: '06-17',
    sport: '농구',
    match: '보스턴 셀틱스 vs 밀워키 벅스',
    prediction: '원정 승',
    result: '원정 승 (98-102)',
    hit: true,
  },
  {
    date: '06-16',
    sport: '축구',
    match: '아스널 vs 리버풀',
    prediction: '무승부',
    result: '홈 승 (3-1)',
    hit: false,
  },
  {
    date: '06-15',
    sport: '배구',
    match: '대한항공 vs 현대캐피탈',
    prediction: '원정 승',
    result: '원정 승 (2-3)',
    hit: true,
  },
  {
    date: '06-14',
    sport: '야구',
    match: '뉴욕 양키스 vs 보스턴 레드삭스',
    prediction: '홈 승',
    result: '홈 승 (4-2)',
    hit: true,
  },
  {
    date: '06-13',
    sport: '축구',
    match: '바이에른 뮌헨 vs 보루시아 도르트문트',
    prediction: '홈 승',
    result: '무승부 (1-1)',
    hit: false,
  },
];

// 종목 탭 메타 정보
const SPORT_TABS = [
  { id: 'football', label: '⚽ 축구', defaultLeague: 'kLeague' },
  { id: 'baseball', label: '⚾ 야구', defaultLeague: 'kbo' },
  { id: 'volleyball', label: '🏐 배구', defaultLeague: 'vLeagueMen' },
  { id: 'basketball', label: '🏀 농구', defaultLeague: 'kbl' },
];
