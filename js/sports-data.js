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
          {
            id: 'fb-k2',
            teamA: '포항 스틸러스',
            teamB: 'FC서울',
            time: '16:00',
            probWin: 48,
            probDraw: 26,
            probLoss: 26,
            confidence: 71,
            conclusion: '포항 홈 강세, FC서울 원정 수비 조직력 주목',
            reason: '포항 홈 6승 2무 1패. FC서울 원정 4승 3무 3패. 양팀 득점력 비슷하나 포항이 홈 xG 우세.',
          },
          {
            id: 'fb-k3',
            teamA: '수원 FC',
            teamB: '대구 FC',
            time: '19:00',
            probWin: 44,
            probDraw: 30,
            probLoss: 26,
            confidence: 67,
            conclusion: '양팀 최근 무승부 많아 접전 예상',
            reason: '수원 최근 5경기 2무 3경기. 대구 원정 2승 2무 1패. 양팀 수비형 전술로 저득점 가능성.',
          },
          {
            id: 'fb-k4',
            teamA: '강원 FC',
            teamB: '제주 유나이티드',
            time: '14:00',
            probWin: 51,
            probDraw: 24,
            probLoss: 25,
            confidence: 69,
            conclusion: '강원 홈에서 공격 가동률 상승',
            reason: '강원 홈 5연속 득점. 제주 원정 3연패. 강원 윙어 복귀가 공격 옵션 확대.',
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
          {
            id: 'fb-epl2',
            teamA: '맨체스터 시티',
            teamB: '토트넘',
            time: '23:00',
            probWin: 58,
            probDraw: 22,
            probLoss: 20,
            confidence: 79,
            conclusion: '맨체스터 시티 홈 압도적 전적',
            reason: '맨체스터 시티 홈 12승 1무. 토트넘 원정 5승 4패. 홈 xG 2.1 vs 원정 1.4.',
          },
          {
            id: 'fb-epl3',
            teamA: '뉴캐슬',
            teamB: '첼시',
            time: '22:00',
            probWin: 40,
            probDraw: 28,
            probLoss: 32,
            confidence: 70,
            conclusion: '뉴캐슬 홈 분위기, 첼시 전력 열세',
            reason: '뉴캐슬 홈 8승 3패. 첼시 원정 4승 5패. 첼시는 중원 부상자 다수.',
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
          {
            id: 'fb-bl2',
            teamA: 'RB 라이프치히',
            teamB: '바이어 레버쿠젠',
            time: '22:30',
            probWin: 46,
            probDraw: 25,
            probLoss: 29,
            confidence: 73,
            conclusion: '레버쿠젠 공격력, 라이프치히 홈 수비가 변수',
            reason: '레버쿠젠 시즌 득점 1위. 라이프치히 홈 7승 2무. 양팀 공격 전개 속도가 빨라 득점전 예상.',
          },
          {
            id: 'fb-bl3',
            teamA: '프라이부르크',
            teamB: '볼프스부르크',
            time: '21:30',
            probWin: 43,
            probDraw: 29,
            probLoss: 28,
            confidence: 66,
            conclusion: '프라이부르크 홈 안정적, 볼프스부르크 원정 약세',
            reason: '프라이부르크 홈 6승 3무 2패. 볼프스부르크 원정 3승 6패. 홈 어드밴티지가 분명.',
          },
        ],
      },
      ligue1: {
        id: 'ligue1',
        name: '리그앙',
        matches: [
          {
            id: 'fb-l1',
            teamA: '파리 생제르맹',
            teamB: '마르세유',
            time: '04:00',
            probWin: 62,
            probDraw: 20,
            probLoss: 18,
            confidence: 80,
            conclusion: '파리 생제르맹 홈 압도, 마르세유 원정 수비 취약',
            reason: 'PSG 홈 10승 1무. 마르세유 원정 4승 5패. PSG xG 2.3으로 리그 1위.',
          },
          {
            id: 'fb-l2',
            teamA: 'AS 모나코',
            teamB: 'OGC 니스',
            time: '23:00',
            probWin: 47,
            probDraw: 26,
            probLoss: 27,
            confidence: 71,
            conclusion: '모나코 공격력, 니스 원정 조직력 대응',
            reason: '모나코 홈 7승 3패. 니스 원정 5승 4패. 양팀 최근 4경기 H2H 2승 2패.',
          },
          {
            id: 'fb-l3',
            teamA: '릴 OSC',
            teamB: '올랭픽 리옹',
            time: '01:00',
            probWin: 45,
            probDraw: 28,
            probLoss: 27,
            confidence: 68,
            conclusion: '릴 홈 연승, 리옹 원정 득점력 저조',
            reason: '릴 홈 5연승. 리옹 원정 평균 0.9득점. 릴 수비 조직력 우세.',
          },
        ],
      },
      serieA: {
        id: 'serieA',
        name: '세리에A',
        matches: [
          {
            id: 'fb-s1',
            teamA: '인터 밀란',
            teamB: '유벤투스',
            time: '03:45',
            probWin: 44,
            probDraw: 28,
            probLoss: 28,
            confidence: 74,
            conclusion: '인터 홈 강세, 유벤투스 원정 회복세',
            reason: '인터 홈 9승 2패. 유벤투스 원정 3연승. 양팀 수비 라인 강화로 저득점 예상.',
          },
          {
            id: 'fb-s2',
            teamA: 'AC 밀란',
            teamB: '나폴리',
            time: '03:45',
            probWin: 41,
            probDraw: 27,
            probLoss: 32,
            confidence: 72,
            conclusion: '나폴리 공격력, AC밀란 홈 수비가 관건',
            reason: '나폴리 시즌 득점 2위. AC밀란 홈 6승 4무. 홈팀 무실점 경기 40%.',
          },
          {
            id: 'fb-s3',
            teamA: '아탈란타',
            teamB: 'AS 로마',
            time: '01:00',
            probWin: 50,
            probDraw: 24,
            probLoss: 26,
            confidence: 70,
            conclusion: '아탈란타 홈 고득점, 로마 원정 불안',
            reason: '아탈란타 홈 평균 2.1득점. 로마 원정 3승 6패. 아탈란타 전환 공격 우세.',
          },
        ],
      },
      laLiga: {
        id: 'laLiga',
        name: '라리가',
        matches: [
          {
            id: 'fb-ll1',
            teamA: '레알 마드리드',
            teamB: 'FC바르셀로나',
            time: '04:00',
            probWin: 46,
            probDraw: 26,
            probLoss: 28,
            confidence: 82,
            conclusion: '엘 클라시코, 양팀 공격력 최상위',
            reason: '레알 홈 11승 1무. 바르사 원정 7승 3패. 양팀 득점력 1·2위로 고득점 예상.',
          },
          {
            id: 'fb-ll2',
            teamA: '아틀레티코 마드리드',
            teamB: '레알 소시에다드',
            time: '23:00',
            probWin: 52,
            probDraw: 25,
            probLoss: 23,
            confidence: 75,
            conclusion: '아틀레티코 수비 조직력, 소시에다드 원정 약세',
            reason: '아틀레티코 홈 8승 2무. 소시에다드 원정 4승 5패. 홈팀 xGA 리그 1위.',
          },
          {
            id: 'fb-ll3',
            teamA: '지로나',
            teamB: '비야레알',
            time: '22:00',
            probWin: 48,
            probDraw: 24,
            probLoss: 28,
            confidence: 69,
            conclusion: '지로나 홈 공격 가동, 비야레알 전력 열세',
            reason: '지로나 홈 7승 3패. 비야레알 원정 3승 7패. 지로나 홈 득점 2위.',
          },
        ],
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
          {
            id: 'bb-kbo2',
            teamA: 'KIA 타이거즈',
            teamB: 'SSG 랜더스',
            time: '18:30',
            probWin: 54,
            probDraw: 0,
            probLoss: 46,
            confidence: 72,
            conclusion: 'KIA 홈 타선 강세, SSG 불펜 약세',
            reason: 'KIA 홈 OPS .812. SSG 불펜 ERA 4.85. KIA 선발 최근 3연속 QS.',
          },
          {
            id: 'bb-kbo3',
            teamA: 'NC 다이노스',
            teamB: '삼성 라이온즈',
            time: '18:30',
            probWin: 49,
            probDraw: 0,
            probLoss: 51,
            confidence: 68,
            conclusion: '삼성 원정 반등, NC 홈 투수전 예상',
            reason: '삼성 원정 4연승. NC 홈 6승 7패. 양팀 선발 FIP 3.5대로 접전.',
          },
          {
            id: 'bb-kbo4',
            teamA: 'KT 위즈',
            teamB: '롯데 자이언츠',
            time: '18:30',
            probWin: 56,
            probDraw: 0,
            probLoss: 44,
            confidence: 70,
            conclusion: 'KT 홈 연승, 롯데 원정 타율 하위',
            reason: 'KT 홈 5연승. 롯데 원정 타율 .238. KT 불펜 ERA 3.2로 리그 2위.',
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
          {
            id: 'bb-mlb2',
            teamA: 'LA 다저스',
            teamB: '샌프란시스코 자이언츠',
            time: '11:10',
            probWin: 61,
            probDraw: 0,
            probLoss: 39,
            confidence: 76,
            conclusion: 'LA 다저스 홈 타선 압도',
            reason: 'LA 다저스 홈 OPS .820. 자이언츠 원정 8승 14패. 다저스 선발 ERA 2.8.',
          },
          {
            id: 'bb-mlb3',
            teamA: '애틀랜타 브레이브스',
            teamB: '필라델피아 필리스',
            time: '08:20',
            probWin: 55,
            probDraw: 0,
            probLoss: 45,
            confidence: 71,
            conclusion: '브레이브스 홈 강세, 필리스 원정 불펜 약세',
            reason: '브레이브스 홈 18-8. 필리스 불펜 ERA 4.5. 홈팀 최근 6연승.',
          },
        ],
      },
      npb: {
        id: 'npb',
        name: 'NPB',
        matches: [
          {
            id: 'bb-npb1',
            teamA: '오릭스 버팔로스',
            teamB: '요미우리 자이언츠',
            time: '18:00',
            probWin: 53,
            probDraw: 0,
            probLoss: 47,
            confidence: 70,
            conclusion: '오릭스 홈 전적 우세, 자이언츠 원정 약세',
            reason: '오릭스 홈 12승 5패. 자이언츠 원정 7승 10패. 오릭스 불펜 ERA 3.1.',
          },
          {
            id: 'bb-npb2',
            teamA: '한신 타이거스',
            teamB: '치바 롯데 마린스',
            time: '18:00',
            probWin: 48,
            probDraw: 0,
            probLoss: 52,
            confidence: 67,
            conclusion: '마린스 원정 반등, 한신 홈 투수전',
            reason: '마린스 원정 3연승. 한신 홈 8승 9패. 양팀 선발 WHIP 1.3대.',
          },
          {
            id: 'bb-npb3',
            teamA: '소프트뱅크 호크스',
            teamB: '세이부 라이온스',
            time: '18:00',
            probWin: 57,
            probDraw: 0,
            probLoss: 43,
            confidence: 72,
            conclusion: '소프트뱅크 홈 타선 강세',
            reason: '소프트뱅크 홈 OPS .795. 세이부 원정 6승 11패. 호크스 4번 타자 타율 .310.',
          },
        ],
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
          {
            id: 'vb-vm2',
            teamA: '삼성화재',
            teamB: 'OK금융그룹',
            time: '19:00',
            probWin: 52,
            probDraw: 0,
            probLoss: 48,
            confidence: 68,
            conclusion: '삼성화재 홈 블로킹 우세',
            reason: '삼성화재 홈 6승 2패. OK금융 원정 4승 4패. 삼성 블로킹 세트당 2.8개.',
          },
          {
            id: 'vb-vm3',
            teamA: 'KB손해보험',
            teamB: '한국전력',
            time: '14:00',
            probWin: 58,
            probDraw: 0,
            probLoss: 42,
            confidence: 71,
            conclusion: 'KB손해보험 홈 연승, 한국전력 원정 약세',
            reason: 'KB손해보험 홈 5연승. 한국전력 원정 2승 6패. KB 공격 성공률 47%.',
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
          {
            id: 'vb-vw2',
            teamA: 'GS칼텍스',
            teamB: 'IBK기업은행',
            time: '16:00',
            probWin: 49,
            probDraw: 0,
            probLoss: 51,
            confidence: 69,
            conclusion: 'GS칼텍스 홈, IBK 원정 득점력 열세',
            reason: 'GS칼텍스 홈 5승 3패. IBK 원정 3승 5패. GS 리시브 효율 52%.',
          },
          {
            id: 'vb-vw3',
            teamA: '한국도로공사',
            teamB: '정관장',
            time: '19:00',
            probWin: 55,
            probDraw: 0,
            probLoss: 45,
            confidence: 70,
            conclusion: '한국도로공사 홈 강세, 정관장 원정 부진',
            reason: '한국도로공사 홈 7승 2패. 정관장 원정 2승 6패. 도로공사 세트 득실 +0.4.',
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
        name: 'KBL',
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
          {
            id: 'bk-kbl2',
            teamA: '고양 소노',
            teamB: '창원 LG',
            time: '19:00',
            probWin: 47,
            probDraw: 0,
            probLoss: 53,
            confidence: 72,
            conclusion: '창원 LG 원정 강세, 소노 홈 수비 변수',
            reason: 'LG 원정 8승 4패. 소노 홈 6승 6패. LG NetRtg +5.2.',
          },
          {
            id: 'bk-kbl3',
            teamA: '울산 현대모비스',
            teamB: '수원 KT',
            time: '14:00',
            probWin: 54,
            probDraw: 0,
            probLoss: 46,
            confidence: 70,
            conclusion: '울산 홈 방어 효율, KT 원정 득점력 주목',
            reason: '울산 홈 수비 효율 1위. KT 원정 7승 5패. 양팀 최근 H2H 2승 2패.',
          },
        ],
      },
      wkbl: {
        id: 'wkbl',
        name: 'WKBL',
        matches: [
          {
            id: 'bk-wkbl1',
            teamA: '청주 KB스타즈',
            teamB: '부천 하나원큐',
            time: '19:00',
            probWin: 54,
            probDraw: 0,
            probLoss: 46,
            confidence: 71,
            conclusion: 'KB스타즈 홈 강세, 하나원큐 원정 득점력 저조',
            reason: 'KB스타즈 홈 8승 2패. 하나원큐 원정 3승 7패. KB스타즈 3점슛 성공률 36.8%로 리그 1위. 하나원큐는 원정 평균 득점 58.2점으로 하위권.',
          },
          {
            id: 'bk-wkbl2',
            teamA: '용인 삼성생명',
            teamB: '아산 우리은행',
            time: '16:00',
            probWin: 51,
            probDraw: 0,
            probLoss: 49,
            confidence: 68,
            conclusion: '삼성생명 홈, 우리은행 원정 수비 조직력',
            reason: '삼성생명 홈 6승 4패. 우리은행 원정 5승 5패. 접전 예상.',
          },
          {
            id: 'bk-wkbl3',
            teamA: '부산 BNK',
            teamB: '인천 신한',
            time: '19:00',
            probWin: 56,
            probDraw: 0,
            probLoss: 44,
            confidence: 69,
            conclusion: 'BNK 홈 연승, 신한 원정 약세',
            reason: 'BNK 홈 4연승. 신한 원정 2승 8패. BNK 리바운드 우세.',
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
          {
            id: 'bk-nba2',
            teamA: 'LA 레이커스',
            teamB: '골든스테이트 워리어스',
            time: '12:30',
            probWin: 45,
            probDraw: 0,
            probLoss: 55,
            confidence: 73,
            conclusion: '워리어스 원정 공격력, 레이커스 홈 득점력',
            reason: '워리어스 원정 14-8. 레이커스 홈 12-10. 양팀 페이스 빠른 고득점 예상.',
          },
          {
            id: 'bk-nba3',
            teamA: '덴버 너게츠',
            teamB: '피닉스 선즈',
            time: '11:00',
            probWin: 57,
            probDraw: 0,
            probLoss: 43,
            confidence: 75,
            conclusion: '덴버 고지대 홈 어드밴티지',
            reason: '덴버 홈 16-4. 피닉스 원정 10-10. 덴버 홈 NetRtg +8.1.',
          },
          {
            id: 'bk-nba4',
            teamA: '뉴욕 닉스',
            teamB: '필라델피아 76ers',
            time: '09:30',
            probWin: 50,
            probDraw: 0,
            probLoss: 50,
            confidence: 70,
            conclusion: '동부 rivalry, 양팀 전력 팽팽',
            reason: '닉스 홈 11-9. 76ers 원정 10-10. 양팀 최근 H2H 3승 3패.',
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

// ============================================
// 순위표 더미 생성 헬퍼
// ============================================
const FORM_PATTERNS = [
  ['W', 'W', 'D', 'L', 'W'],
  ['W', 'L', 'W', 'W', 'D'],
  ['D', 'W', 'W', 'L', 'W'],
  ['L', 'W', 'D', 'W', 'W'],
  ['W', 'W', 'W', 'D', 'L'],
  ['D', 'D', 'W', 'L', 'W'],
  ['L', 'L', 'W', 'W', 'D'],
  ['W', 'D', 'L', 'W', 'L'],
];

const STANDINGS_TEAM_NAMES = {
  football: {
    kLeague: ['울산 HD', '전북 현대', '포항 스틸러스', 'FC서울', '강원 FC', '수원 FC', '대구 FC', '제주 유나이티드', '김천 상무', '광주 FC', 'FC안양', '대전 FC'],
    epl: ['아스널', '리버풀', '맨체스터 시티', '아스톤 빌라', '토트넘', '맨체스터 유나이티드', '뉴캐슬', '첼시', '웨스트햄', '울버햄튼', '브라이턴', '본머스', '풀럼', '크리스털 팰리스', '에버턴', '노팅엄 포레스트', '브렌트퍼드', '입스위치 타운', '레스터 시티', '사우샘프턴'],
    bundesliga: ['바이에른 뮌헨', '바이어 레버쿠젠', '슈투트가르트', 'RB 라이프치히', '보루시아 도르트문트', '프라이부르크', '아인트라흐트 프랑크푸르트', '볼프스부르크', '헤르타 베를린', '마인츠', '아우크스부르크', 'Union 베를린', '브레멘', '보쿰', '하이덴하임', '쾰른', '달르스타트', '보루시아 문헨글라드바흐'],
    ligue1: ['파리 생제르맹', 'AS 모나코', '브레스트', '릴 OSC', 'RC 랑스', 'OGC 니스', '마르세유', '올랭픽 리옹', '스타드 렌', '스트라스부르', '몽펠리에', '툴루즈', '랭스', '낭트', '메스', '르 아브르', '로리앙', '클레몽'],
    serieA: ['인터 밀란', 'AC 밀란', '유벤투스', '아탈란타', 'AS 로마', 'SS 라치오', '나폴리', '피오렌티나', '볼로냐', '토리노', '몬차', '제노아', '레체', '우디네세', '엠폴리', '베로나', '칼리아리', '프로시노네', '사수올로', '살레르니타나'],
    laLiga: ['레알 마드리드', 'FC바르셀로나', '지로나', '아틀레티코 마드리드', '아틀레틱 빌바오', '레알 소시에다드', '레알 베티스', '발렌시아', '비야레알', '게타페', '세비야', '오사수나', '라스팔마스', '라요바에카노', '마요르카', '알라베스', '셀타 비고', '카디스', '그라나다', '알메리아'],
  },
  baseball: {
    kbo: ['LG 트윈스', 'KIA 타이거즈', 'SSG 랜더스', 'NC 다이노스', 'KT 위즈', '두산 베어스', '삼성 라이온즈', '롯데 자이언츠', '한화 이글스', '키움 히어로즈'],
    mlb: ['뉴욕 양키스', '보스턴 레드삭스', '토론토 블루제이스', '볼티모어 오리올스', '탬파베이 레이스', '클리블랜드 가디언스', '미네소타 트윈스', '디트로이트 타이거스', '시카고 화이트삭스', '캔자스시티 로열스', '휴스턴 애스트로스', '시애틀 매리너스', '텍사스 레인저스', 'LA 에인절스', '오클랜드 애슬레틱스', '애틀랜타 브레이브스', '필라델피아 필리스', '뉴욕 메츠', '마이애미 말린스', '워싱턴 내셔널스', '밀워키 브루어스', '시카고 커스', '세인트루이스 카디널스', '피츠버그 파이렛스', '신시내티', 'LA 다저스', '샌디에이고 파드레스', '샌프란시스코 자이언츠', '애리조나 다이아몬드백스', '콜로라도 로키스'],
    npb: ['오릭스 버팔로스', '후쿠오카 소프트뱅크', '동북 라쿠텐', '치바 롯데', '세이부 라이온스', '홋카이도 니혼햄', '요미우리 자이언츠', '도쿄 야쿠르트', '한신 타이거스', '히로시마 카프', '요코하마 디에NA', '중일 드래곤스'],
  },
  volleyball: {
    vLeagueMen: ['현대캐피탈', '대한항공', '삼성화재', 'OK금융그룹', 'KB손해보험', '한국전력', '우리카드'],
    vLeagueWomen: ['흥국생명', '현대건설', 'GS칼텍스', 'IBK기업은행', '한국도로공사', '정관장', 'KGC인삼공사'],
  },
  basketball: {
    kbl: ['서울 SK', '창원 LG', '고양 소노', '원주 DB', '울산 현대모비스', '수원 KT', '대구 한국가스공사', '안양 정관장', '서울 삼성', '전주 KCC'],
    wkbl: ['청주 KB스타즈', '부천 하나원큐', '용인 삼성생명', '아산 우리은행', '부산 BNK 썸', '인천 신한은행', 'IBK기업은행', '국민은행'],
    nba: [
      '보스턴 셀틱스', '덴버 너게츠', '오클라호마시티 썬더', '미네소타 팀버울브스', 'LA 레이커스',
      '밀워키 벅스', '클리블랜드 캐벌리어스', '뉴욕 닉스', '필라델피아 76ers', '골든스테이트 워리어스',
      '마이애미 히트', '휴스턴 로키츠', '인디애나 페이서스', 'LA 클리퍼스', '올랜도 매직',
      '애틀랜타 호크스', '시카고 불스', '샬럿 호넷츠', '브루클린 네츠', '토론토 랩터스',
      '유타 재즈', '피닉스 선즈', '댈러스 매버릭스', '워싱턴 위저즈', '멤피스 그리즐리스',
      '새크라멘토 킹스', '포틀랜드 트레일블레이저스', '디트로이트 피스턴스', '뉴올리언스 펠리컨스', '샌안토니오 스퍼스',
    ],
  },
};

/** NBA 동부/서부 컨퍼런스 팀 (리그순위 필터용) */
const NBA_CONFERENCES = {
  east: [
    '보스턴 셀틱스', '뉴욕 닉스', '브루클린 네츠', '필라델피아 76ers', '토론토 랩터스',
    '밀워키 벅스', '클리블랜드 캐벌리어스', '시카고 불스', '인디애나 페이서스', '디트로이트 피스턴스',
    '마이애미 히트', '올랜도 매직', '애틀랜타 호크스', '워싱턴 위저즈', '샬럿 호넷츠',
  ],
  west: [
    '덴버 너게츠', '미네소타 팀버울브스', '오클라호마시티 썬더', '포틀랜드 트레일블레이저스', '유타 재즈',
    'LA 레이커스', 'LA 클리퍼스', '골든스테이트 워리어스', '피닉스 선즈', '새크라멘토 킹스',
    '댈러스 매버릭스', '휴스턴 로키츠', '멤피스 그리즐리스', '뉴올리언스 펠리컨스', '샌안토니오 스퍼스',
  ],
};

/** NBA 디비전 매핑 (리그순위 NBA 전용 컬럼) */
const NBA_DIVISION_TEAMS = {
  '대서양': ['보스턴 셀틱스', '뉴욕 닉스', '브루클린 네츠', '필라델피아 76ers', '토론토 랩터스'],
  '중부': ['밀워키 벅스', '클리블랜드 캐벌리어스', '시카고 불스', '인디애나 페이서스', '디트로이트 피스턴스'],
  '남동부': ['마이애미 히트', '올랜도 매직', '애틀랜타 호크스', '워싱턴 위저즈', '샬럿 호넷츠'],
  '노스웨스트': ['덴버 너게츠', '미네소타 팀버울브스', '오클라호마시티 썬더', '포틀랜드 트레일블레이저스', '유타 재즈'],
  '퍼시픽': ['LA 레이커스', 'LA 클리퍼스', '골든스테이트 워리어스', '피닉스 선즈', '새크라멘토 킹스'],
  '사우스웨스트': ['댈러스 매버릭스', '휴스턴 로키츠', '멤피스 그리즐리스', '뉴올리언스 펠리컨스', '샌안토니오 스퍼스'],
};

function getNbaDivisionName(teamName) {
  const entries = Object.entries(NBA_DIVISION_TEAMS);
  for (let d = 0; d < entries.length; d += 1) {
    if (entries[d][1].includes(teamName)) return entries[d][0];
  }
  return '';
}

const BASKETBALL_STREAKS = ['2승', '1승', '1패', '3승', '2패', '1승', '1패', '2승', '3패', '2승'];

function formatGoalDiff(diff) {
  if (diff > 0) return `+${diff}`;
  return String(diff);
}

/** 축구: 승점 기준, 무승부 포함 */
function buildFootballStandings(teamNames) {
  const total = teamNames.length;
  return teamNames.map((name, i) => {
    const ratio = total > 1 ? i / (total - 1) : 0;
    const played = Math.round(22 + ratio * 14);
    const win = Math.max(Math.round(played * (0.62 - ratio * 0.42)), 1);
    const draw = Math.max(Math.round(played * (0.22 - ratio * 0.08)), 0);
    let loss = Math.max(played - win - draw, 0);
    if (win + draw + loss !== played) loss = played - win - draw;

    const points = win * 3 + draw;
    const scored = Math.round(42 + (total - i) * 2.8 - i * 1.5);
    const conceded = Math.round(28 + i * 2.2 + ratio * 8);
    const nextIdx = (i + 2) % total;

    return {
      rank: i + 1,
      name,
      played,
      win,
      draw,
      loss,
      points,
      scored,
      conceded,
      goalDiff: scored - conceded,
      form: FORM_PATTERNS[i % FORM_PATTERNS.length],
      nextOpponent: teamNames[nextIdx],
    };
  });
}

/** 배구 V리그: 승점·세트/점수 득실률 기준 */
function buildVolleyballStandings(teamNames) {
  const played = 36;
  const total = teamNames.length;

  return teamNames.map((name, i) => {
    const ratio = total > 1 ? i / (total - 1) : 0;
    const win = Math.max(Math.round(played * (0.75 - ratio * 0.42)), 1);
    const loss = played - win;
    const points = win * 3 + Math.max(Math.round(win * 0.15), 0);

    const setsWon = Math.round(win * 3.15 + loss * 1.1);
    const setsLost = Math.max(Math.round(loss * 2.95 + win * 0.85), 1);
    const setRatio = (setsWon / setsLost).toFixed(3);

    const scoreFor = Math.round(played * (78 - ratio * 9));
    const scoreAgainst = Math.max(Math.round(played * (72 + ratio * 7)), 1);
    const pointRatio = (scoreFor / scoreAgainst).toFixed(3);

    const form = FORM_PATTERNS[i % FORM_PATTERNS.length].filter((r) => r !== 'D');
    while (form.length < 5) form.push(form.length % 2 === 0 ? 'W' : 'L');

    return {
      rank: i + 1,
      name,
      points,
      played,
      win,
      loss,
      setRatio,
      pointRatio,
      form: form.slice(0, 5),
    };
  });
}

function buildFormNoDraw(index) {
  const form = FORM_PATTERNS[index % FORM_PATTERNS.length].filter((r) => r !== 'D');
  while (form.length < 5) form.push(form.length % 2 === 0 ? 'W' : 'L');
  return form.slice(0, 5);
}

function calcGamesBack(leaderWins, teamWins, index) {
  if (index === 0) return '0.0';
  return Math.max((leaderWins - teamWins) / 2, 0).toFixed(1);
}

/** KBL/WKBL: 국내 농구 순위 (통일 경기수) */
function buildKoreanBasketballStandings(teamNames, playedTotal) {
  const total = teamNames.length;
  const rows = teamNames.map((name, i) => {
    const ratio = total > 1 ? i / (total - 1) : 0;
    const win = Math.max(Math.round(playedTotal * (0.68 - ratio * 0.38)), 1);
    const loss = playedTotal - win;
    const winRate = (win / playedTotal).toFixed(3);

    return {
      name,
      played: playedTotal,
      win,
      loss,
      winRate,
      streak: BASKETBALL_STREAKS[i % BASKETBALL_STREAKS.length],
      form: buildFormNoDraw(i),
    };
  });

  const leaderWins = rows[0].win;
  return rows.map((row, i) => ({
    rank: i + 1,
    ...row,
    gamesBack: calcGamesBack(leaderWins, row.win, i),
  }));
}

function splitHomeAwayRecord(played, win, loss) {
  const homeGames = Math.floor(played / 2);
  const awayGames = played - homeGames;
  const winRate = win / played;

  let homeWin = Math.round(homeGames * winRate);
  if (homeWin > win) homeWin = win;
  if (homeWin > homeGames) homeWin = homeGames;
  let homeLoss = homeGames - homeWin;

  let awayWin = win - homeWin;
  let awayLoss = loss - homeLoss;

  if (awayWin < 0) {
    homeWin += awayWin;
    awayWin = 0;
    homeLoss = homeGames - homeWin;
  }
  if (awayLoss < 0) {
    awayLoss = 0;
    awayWin = awayGames;
  }
  if (awayWin + awayLoss !== awayGames) {
    awayLoss = awayGames - awayWin;
  }

  return {
    homeRecord: `${homeWin}승${homeLoss}패`,
    awayRecord: `${awayWin}승${awayLoss}패`,
  };
}

/** NBA: 디비전·홈/원정 성적 포함 */
function buildNbaStandings(teamNames) {
  const total = teamNames.length;
  const playedTotal = 78;

  const rows = teamNames.map((name, i) => {
    const ratio = total > 1 ? i / (total - 1) : 0;
    const win = Math.max(Math.round(playedTotal * (0.72 - ratio * 0.46)), 1);
    const loss = playedTotal - win;
    const winRate = (win / playedTotal).toFixed(3);
    const { homeRecord, awayRecord } = splitHomeAwayRecord(playedTotal, win, loss);

    const divisionGames = 16;
    const divWinRate = Math.min(winRate * 1.08, 0.92);
    let divWin = Math.round(divisionGames * divWinRate);
    divWin = Math.max(Math.min(divWin, divisionGames - 1), 1);
    const divLoss = divisionGames - divWin;

    return {
      name,
      played: playedTotal,
      win,
      loss,
      winRate,
      streak: BASKETBALL_STREAKS[i % BASKETBALL_STREAKS.length],
      homeRecord,
      awayRecord,
      division: getNbaDivisionName(name),
      divisionRecord: `${divWin}승${divLoss}패`,
      form: buildFormNoDraw(i),
    };
  });

  const leaderWins = rows[0].win;
  return rows.map((row, i) => ({
    rank: i + 1,
    ...row,
    gamesBack: calcGamesBack(leaderWins, row.win, i),
  }));
}

/** 농구: 리그별 전용 순위 생성 */
function buildBasketballStandings(teamNames, leagueKey) {
  if (leagueKey === 'nba') {
    return buildNbaStandings(teamNames);
  }
  if (leagueKey === 'wkbl') {
    return buildKoreanBasketballStandings(teamNames, 30);
  }
  return buildKoreanBasketballStandings(teamNames, 54);
}

/** 야구·농구(구): 승률 기준 — 야구 전용 레거시, 농구는 buildBasketballStandings 사용 */
function buildWinRateStandings(teamNames, sport) {
  const total = teamNames.length;
  return teamNames.map((name, i) => {
    const ratio = total > 1 ? i / (total - 1) : 0;
    const played = Math.round(40 + ratio * 100);
    const win = Math.max(Math.round(played * (0.62 - ratio * 0.45)), 1);
    const loss = Math.max(played - win, 0);
    const winRate = played > 0 ? (win / played).toFixed(3) : '0.000';

    let scored;
    let conceded;
    if (sport === 'baseball') {
      scored = Math.round(520 - i * 18 + (total - i) * 4);
      conceded = Math.round(380 + i * 16 + ratio * 40);
    } else {
      scored = Math.round(8800 - i * 120 + (total - i) * 30);
      conceded = Math.round(8200 + i * 110 + ratio * 200);
    }

    const nextIdx = (i + 2) % total;
    const form = FORM_PATTERNS[i % FORM_PATTERNS.length].filter((r) => r !== 'D');
    while (form.length < 5) form.push(form.length % 2 === 0 ? 'W' : 'L');

    return {
      rank: i + 1,
      name,
      played,
      win,
      loss,
      winRate,
      scored,
      conceded,
      goalDiff: scored - conceded,
      form: form.slice(0, 5),
      nextOpponent: teamNames[nextIdx],
    };
  });
}

function buildStandingsForSport(sport, leagueKey) {
  const names = STANDINGS_TEAM_NAMES[sport] && STANDINGS_TEAM_NAMES[sport][leagueKey];
  if (!names || names.length === 0) return [];
  if (sport === 'football') {
    return buildFootballStandings(names);
  }
  if (sport === 'volleyball') {
    return buildVolleyballStandings(names);
  }
  if (sport === 'baseball') {
    return [];
  }
  if (sport === 'basketball') {
    return buildBasketballStandings(names, leagueKey);
  }
  return buildWinRateStandings(names, sport);
}

// ============================================
// 야구 리그순위 — 서브탭 설정 (MLB 디비전 / NPB 리그)
// ============================================
const STANDINGS_SUB_TABS = {
  baseball: {
    mlb: [
      { id: 'american', label: '아메리칸리그', default: true },
      { id: 'national', label: '내셔널리그' },
    ],
    npb: [
      { id: 'central', label: '센트럴리그' },
      { id: 'pacific', label: '퍼시픽리그' },
    ],
  },
  basketball: {
    nba: [
      { id: 'east', label: '동부', default: true },
      { id: 'west', label: '서부' },
    ],
  },
};

/** MLB 리그별 지구·와일드카드 통합 뷰 섹션 */
const MLB_STANDINGS_SECTIONS = {
  american: [
    { id: 'alEast', title: '아메리칸리그 동부지구' },
    { id: 'alCentral', title: '아메리칸리그 중부지구' },
    { id: 'alWest', title: '아메리칸리그 서부지구' },
    { id: 'alWildCard', title: '아메리칸리그 와일드카드' },
  ],
  national: [
    { id: 'nlEast', title: '내셔널리그 동부지구' },
    { id: 'nlCentral', title: '내셔널리그 중부지구' },
    { id: 'nlWest', title: '내셔널리그 서부지구' },
    { id: 'nlWildCard', title: '내셔널리그 와일드카드' },
  ],
};

function bbTeam(rank, name, winRate, gamesBack, win, draw, loss, played, streak, battingAvg, era, nextOpponent, options) {
  const opts = options || {};
  const form = opts.form || FORM_PATTERNS[(rank - 1) % FORM_PATTERNS.length].filter((r) => r !== 'D');
  while (form.length < 5) form.push(form.length % 2 === 0 ? 'W' : 'L');
  return {
    rank,
    name,
    winRate,
    gamesBack,
    win,
    draw: draw || 0,
    loss,
    played,
    streak,
    battingAvg,
    era,
    form: form.slice(0, 5),
    nextOpponent,
    nextMatchPending: !!opts.nextMatchPending,
    isWildCard: !!opts.isWildCard,
  };
}

// MLB 디비전별 원본 (와일드카드 탭에서 재사용)
const MLB_DIVISION_DATA = {
  alEast: [
    bbTeam(1, '뉴욕 양키스', '.613', '0.0', 46, 0, 29, 75, '1패', '.246', '3.34', '신시내티'),
    bbTeam(2, '탬파베이', '.575', '3.0', 42, 0, 31, 73, '1패', '.256', '3.92', '워싱턴'),
    bbTeam(3, '토론토', '.494', '9.0', 38, 0, 39, 77, '1승', '.249', '4.13', '시카고 컵스'),
    bbTeam(4, '볼티모어', '.462', '11.5', 36, 0, 42, 78, '1승', '.239', '4.50', 'LA 다저스'),
    bbTeam(5, '보스턴', '.419', '14.5', 31, 0, 43, 74, '2승', '.244', '3.86', '시애틀'),
  ],
  alCentral: [
    bbTeam(1, '클리블랜드', '.532', '0.0', 41, 0, 36, 77, '1승', '.229', '3.81', '휴스턴'),
    bbTeam(2, '시카고 화이트삭스', '.520', '1.0', 39, 0, 36, 75, '2패', '.238', '4.41', '디트로이트'),
    bbTeam(3, '미네소타', '.474', '4.5', 37, 0, 41, 78, '1승', '.246', '4.83', '애리조나'),
    bbTeam(4, '디트로이트', '.421', '8.5', 32, 0, 44, 76, '2승', '.233', '3.85', '시카고 화이트삭스'),
    bbTeam(5, '캔자스시티', '.416', '9.0', 32, 0, 45, 77, '3승', '.247', '4.48', '세인트루이스'),
  ],
  alWest: [
    bbTeam(1, '시애틀', '.500', '0.0', 39, 0, 39, 78, '2패', '.232', '3.66', '보스턴'),
    bbTeam(2, '애슬레틱스', '.494', '0.5', 38, 0, 39, 77, '1패', '.250', '4.95', 'LA 에인절스'),
    bbTeam(3, '텍사스', '.474', '2.0', 36, 0, 40, 76, '1패', '.241', '3.96', '샌디에이고'),
    bbTeam(4, '휴스턴', '.462', '3.0', 36, 0, 42, 78, '1패', '.243', '4.89', '클리블랜드'),
    bbTeam(5, 'LA 에인절스', '.397', '8.0', 31, 0, 47, 78, '1승', '.239', '4.63', '애슬레틱스'),
  ],
  nlEast: [
    bbTeam(1, '애틀랜타', '.640', '0.0', 48, 0, 27, 75, '2승', '.253', '3.34', '밀워키'),
    bbTeam(2, '필라델피아', '.539', '7.5', 41, 0, 35, 76, '1승', '.232', '4.09', '뉴욕 메츠'),
    bbTeam(3, '워싱턴', '.519', '9.0', 40, 0, 37, 77, '1승', '.247', '4.64', '탬파베이'),
    bbTeam(4, '마이애미', '.506', '10.0', 39, 0, 38, 77, '3승', '.246', '4.11', '샌프란시스코'),
    bbTeam(5, '뉴욕 메츠', '.447', '14.5', 34, 0, 42, 76, '1패', '.233', '4.07', '필라델피아'),
  ],
  nlCentral: [
    bbTeam(1, '밀워키', '.608', '0.0', 45, 0, 29, 74, '3패', '.255', '3.44', '애틀랜타'),
    bbTeam(2, '세인트루이스', '.541', '5.0', 40, 0, 34, 74, '3패', '.247', '4.22', '캔자스시티'),
    bbTeam(3, '시카고 컵스', '.519', '6.5', 40, 0, 37, 77, '1패', '.244', '4.28', '토론토'),
    bbTeam(4, '피츠버그', '.494', '8.5', 38, 0, 39, 77, '2패', '.254', '4.20', '콜로라도'),
    bbTeam(5, '신시내티', '.480', '9.5', 36, 0, 39, 75, '1승', '.229', '4.63', '뉴욕 양키스'),
  ],
  nlWest: [
    bbTeam(1, 'LA 다저스', '.636', '0.0', 49, 0, 28, 77, '1패', '.261', '3.34', '볼티모어'),
    bbTeam(2, '샌디에이고', '.520', '9.0', 39, 0, 36, 75, '1승', '.219', '3.90', '텍사스'),
    bbTeam(3, '애리조나', '.513', '9.5', 39, 0, 37, 76, '1패', '.239', '4.32', '미네소타'),
    bbTeam(4, '샌프란시스코', '.408', '17.5', 31, 0, 45, 76, '2패', '.259', '4.49', '마이애미'),
    bbTeam(5, '콜로라도', '.390', '19.0', 30, 0, 47, 77, '2승', '.252', '5.49', '피츠버그'),
  ],
};

function cloneWithWildCardGb(team, gamesBack) {
  return { ...team, rank: team.rank, gamesBack, isWildCard: true };
}

function buildMlbWildCard(alTeams, gbList) {
  return alTeams.map((team, i) => cloneWithWildCardGb(team, gbList[i]));
}

const BASEBALL_STANDINGS_DATA = {
  kbo: [
    bbTeam(1, 'LG 트윈스', '.598', '0.0', 42, 1, 29, 72, '2승', '.272', '3.45', 'KIA 타이거즈'),
    bbTeam(2, 'KIA 타이거즈', '.581', '1.5', 41, 0, 30, 71, '1승', '.268', '3.52', 'LG 트윈스'),
    bbTeam(3, 'SSG 랜더스', '.556', '3.5', 39, 1, 31, 71, '1패', '.265', '3.68', 'NC 다이노스'),
    bbTeam(4, 'NC 다이노스', '.534', '5.0', 37, 2, 32, 71, '2승', '.258', '3.81', 'KT 위즈'),
    bbTeam(5, 'KT 위즈', '.521', '6.0', 36, 1, 33, 70, '1승', '.251', '3.92', '두산 베어스'),
    bbTeam(6, '두산 베어스', '.507', '7.0', 35, 2, 34, 71, '1패', '.249', '4.05', '삼성 라이온즈'),
    bbTeam(7, '삼성 라이온즈', '.486', '8.5', 33, 1, 35, 69, '2패', '.243', '4.18', '롯데 자이언츠'),
    bbTeam(8, '롯데 자이언츠', '.465', '10.0', 32, 0, 37, 69, '1승', '.241', '4.35', '한화 이글스'),
    bbTeam(9, '한화 이글스', '.438', '12.0', 30, 1, 38, 69, '3패', '.235', '4.52', '키움 히어로즈'),
    bbTeam(10, '키움 히어로즈', '.412', '14.0', 28, 2, 40, 70, '1패', '.228', '4.71', '한화 이글스'),
  ],
  mlb: {
    alEast: MLB_DIVISION_DATA.alEast,
    alCentral: MLB_DIVISION_DATA.alCentral,
    alWest: MLB_DIVISION_DATA.alWest,
    alWildCard: buildMlbWildCard(
      [
        MLB_DIVISION_DATA.alEast[1],
        MLB_DIVISION_DATA.alCentral[1],
        MLB_DIVISION_DATA.alEast[2],
        MLB_DIVISION_DATA.alWest[1],
        MLB_DIVISION_DATA.alCentral[2],
        MLB_DIVISION_DATA.alWest[2],
      ],
      ['+6.0', '+2.0', '0.0', '0.0', '-1.5', '-1.5']
    ).map((t, i) => ({ ...t, rank: i + 1 })),
    nlEast: MLB_DIVISION_DATA.nlEast,
    nlCentral: MLB_DIVISION_DATA.nlCentral,
    nlWest: MLB_DIVISION_DATA.nlWest,
    nlWildCard: buildMlbWildCard(
      [
        MLB_DIVISION_DATA.nlCentral[1],
        MLB_DIVISION_DATA.nlEast[1],
        MLB_DIVISION_DATA.nlWest[1],
        MLB_DIVISION_DATA.nlEast[2],
        MLB_DIVISION_DATA.nlCentral[2],
        MLB_DIVISION_DATA.nlWest[2],
      ],
      ['+1.5', '+1.5', '0.0', '0.0', '0.0', '0.5']
    ).map((t, i) => ({ ...t, rank: i + 1 })),
  },
  npb: {
    central: [
      bbTeam(1, '요미우리', '.547', '0.0', 35, 2, 29, 66, '1승', '.229', '2.94', null, { nextMatchPending: true }),
      bbTeam(1, '한신', '.547', '0.0', 35, 1, 29, 65, '2승', '.250', '3.06', null, { nextMatchPending: true }),
      bbTeam(3, '야쿠르트', '.538', '0.5', 35, 1, 30, 66, '1패', '.237', '3.22', null, { nextMatchPending: true }),
      bbTeam(4, '요코하마', '.413', '8.5', 26, 2, 37, 65, '2패', '.244', '3.73', null, { nextMatchPending: true }),
      bbTeam(5, '히로시마', '.393', '9.5', 24, 3, 37, 64, '1승', '.215', '3.03', null, { nextMatchPending: true }),
      bbTeam(6, '주니치', '.354', '12.5', 23, 1, 42, 66, '1패', '.230', '3.45', null, { nextMatchPending: true }),
    ],
    pacific: [
      bbTeam(1, '세이부', '.636', '0.0', 42, 2, 24, 68, '1승', '.249', '2.40', null, { nextMatchPending: true }),
      bbTeam(2, '소프트뱅크', '.585', '3.5', 38, 0, 27, 65, '1승', '.249', '3.23', null, { nextMatchPending: true }),
      bbTeam(3, '오릭스', '.554', '5.5', 36, 1, 29, 66, '1패', '.247', '3.29', null, { nextMatchPending: true }),
      bbTeam(4, '닛폰햄', '.551', '5.5', 38, 0, 31, 69, '1패', '.244', '3.40', null, { nextMatchPending: true }),
      bbTeam(5, '지바롯데', '.508', '8.5', 32, 2, 31, 65, '2승', '.237', '3.51', null, { nextMatchPending: true }),
      bbTeam(6, '라쿠텐', '.359', '18.0', 23, 1, 41, 65, '4패', '.236', '3.73', null, { nextMatchPending: true }),
    ],
  },
};

function buildAllStandingsData() {
  const data = {};
  Object.keys(STANDINGS_TEAM_NAMES).forEach((sport) => {
    data[sport] = {};
    Object.keys(STANDINGS_TEAM_NAMES[sport]).forEach((leagueKey) => {
      if (sport === 'baseball') return;
      data[sport][leagueKey] = buildStandingsForSport(sport, leagueKey);
    });
  });
  data.baseball = BASEBALL_STANDINGS_DATA;
  return data;
}

// ============================================
// 경기일정 더미 데이터 (dateOffset: 0=오늘 ~ 6)
// ============================================
const SCHEDULE_DATA = {
  football: {
    kLeague: [
      { id: 'sch-fb-k1', dateOffset: 0, teamA: '울산 HD', teamB: '전북 현대', time: '19:30', confidence: 78 },
      { id: 'sch-fb-k2', dateOffset: 0, teamA: '포항 스틸러스', teamB: 'FC서울', time: '16:00', confidence: 71 },
      { id: 'sch-fb-k3', dateOffset: 0, teamA: '강원 FC', teamB: '제주 유나이티드', time: '14:00', confidence: 69 },
      { id: 'sch-fb-k4', dateOffset: 1, teamA: '수원 FC', teamB: '대구 FC', time: '19:00', confidence: 67 },
      { id: 'sch-fb-k5', dateOffset: 2, teamA: '전북 현대', teamB: '포항 스틸러스', time: '19:30', confidence: 74 },
      { id: 'sch-fb-k6', dateOffset: 3, teamA: 'FC서울', teamB: '울산 HD', time: '19:00', confidence: 72 },
    ],
    epl: [
      { id: 'sch-fb-e1', dateOffset: 0, teamA: '아스널', teamB: '리버풀', time: '01:30', confidence: 72 },
      { id: 'sch-fb-e2', dateOffset: 0, teamA: '뉴캐슬', teamB: '첼시', time: '22:00', confidence: 70 },
      { id: 'sch-fb-e3', dateOffset: 1, teamA: '맨체스터 시티', teamB: '토트넘', time: '23:00', confidence: 79 },
      { id: 'sch-fb-e4', dateOffset: 3, teamA: '맨체스터 시티', teamB: '맨체스터 유나이티드', time: '23:00', confidence: 75 },
    ],
    bundesliga: [
      { id: 'sch-fb-b1', dateOffset: 0, teamA: '프라이부르크', teamB: '볼프스부르크', time: '21:30', confidence: 66 },
      { id: 'sch-fb-b2', dateOffset: 1, teamA: '바이에른 뮌헨', teamB: '보루시아 도르트문트', time: '23:30', confidence: 81 },
      { id: 'sch-fb-b3', dateOffset: 2, teamA: 'RB 라이프치히', teamB: '바이어 레버쿠젠', time: '22:30', confidence: 68 },
    ],
    ligue1: [
      { id: 'sch-fb-l1', dateOffset: 0, teamA: '릴 OSC', teamB: '올랭픽 리옹', time: '01:00', confidence: 68 },
      { id: 'sch-fb-l2', dateOffset: 2, teamA: '파리 생제르맹', teamB: '마르세유', time: '04:00', confidence: 77 },
      { id: 'sch-fb-l3', dateOffset: 4, teamA: 'AS 모나코', teamB: 'OGC 니스', time: '23:00', confidence: 71 },
    ],
    serieA: [
      { id: 'sch-fb-s1', dateOffset: 0, teamA: '아탈란타', teamB: 'AS 로마', time: '01:00', confidence: 70 },
      { id: 'sch-fb-s2', dateOffset: 2, teamA: 'AC 밀란', teamB: '나폴리', time: '03:45', confidence: 72 },
      { id: 'sch-fb-s3', dateOffset: 3, teamA: '인터 밀란', teamB: '유벤투스', time: '03:45', confidence: 74 },
    ],
    laLiga: [
      { id: 'sch-fb-ll1', dateOffset: 0, teamA: '지로나', teamB: '비야레알', time: '22:00', confidence: 69 },
      { id: 'sch-fb-ll2', dateOffset: 1, teamA: '레알 마드리드', teamB: 'FC바르셀로나', time: '04:00', confidence: 80 },
      { id: 'sch-fb-ll3', dateOffset: 3, teamA: '아틀레티코 마드리드', teamB: '레알 소시에다드', time: '23:00', confidence: 75 },
    ],
  },
  baseball: {
    kbo: [
      { id: 'sch-bb-k1', dateOffset: 0, teamA: 'LG 트윈스', teamB: '두산 베어스', time: '18:30', confidence: 75 },
      { id: 'sch-bb-k2', dateOffset: 0, teamA: 'KIA 타이거즈', teamB: 'SSG 랜더스', time: '18:30', confidence: 72 },
      { id: 'sch-bb-k3', dateOffset: 1, teamA: 'NC 다이노스', teamB: '삼성 라이온즈', time: '18:30', confidence: 66 },
      { id: 'sch-bb-k4', dateOffset: 2, teamA: 'KT 위즈', teamB: '롯데 자이언츠', time: '18:30', confidence: 70 },
    ],
    mlb: [
      { id: 'sch-bb-m1', dateOffset: 0, teamA: '뉴욕 양키스', teamB: '보스턴 레드삭스', time: '08:05', confidence: 68 },
      { id: 'sch-bb-m2', dateOffset: 0, teamA: '애틀랜타 브레이브스', teamB: '필라델피아 필리스', time: '08:20', confidence: 71 },
      { id: 'sch-bb-m3', dateOffset: 1, teamA: 'LA 다저스', teamB: '샌프란시스코 자이언츠', time: '11:10', confidence: 72 },
    ],
    npb: [
      { id: 'sch-bb-n1', dateOffset: 0, teamA: '오릭스 버팔로스', teamB: '요미우리 자이언츠', time: '18:00', confidence: 70 },
      { id: 'sch-bb-n2', dateOffset: 1, teamA: '소프트뱅크 호크스', teamB: '세이부 라이온스', time: '18:00', confidence: 72 },
      { id: 'sch-bb-n3', dateOffset: 4, teamA: '한신 타이거스', teamB: '치바 롯데 마린스', time: '18:00', confidence: 67 },
    ],
  },
  volleyball: {
    vLeagueMen: [
      { id: 'sch-vb-m1', dateOffset: 0, teamA: '대한항공', teamB: '현대캐피탈', time: '19:00', confidence: 70 },
      { id: 'sch-vb-m2', dateOffset: 0, teamA: 'KB손해보험', teamB: '한국전력', time: '14:00', confidence: 71 },
      { id: 'sch-vb-m3', dateOffset: 2, teamA: '삼성화재', teamB: 'OK금융그룹', time: '19:00', confidence: 68 },
    ],
    vLeagueWomen: [
      { id: 'sch-vb-w1', dateOffset: 0, teamA: '흥국생명', teamB: '현대건설', time: '19:00', confidence: 73 },
      { id: 'sch-vb-w2', dateOffset: 1, teamA: 'GS칼텍스', teamB: 'IBK기업은행', time: '19:00', confidence: 71 },
      { id: 'sch-vb-w3', dateOffset: 3, teamA: '한국도로공사', teamB: '정관장', time: '19:00', confidence: 70 },
    ],
  },
  basketball: {
    kbl: [
      { id: 'sch-bk-k1', dateOffset: 0, teamA: '서울 SK', teamB: '원주 DB', time: '19:00', confidence: 76 },
      { id: 'sch-bk-k2', dateOffset: 0, teamA: '울산 현대모비스', teamB: '수원 KT', time: '14:00', confidence: 70 },
      { id: 'sch-bk-k3', dateOffset: 2, teamA: '고양 소노', teamB: '창원 LG', time: '19:00', confidence: 70 },
    ],
    wkbl: [
      { id: 'sch-bk-w1', dateOffset: 0, teamA: '청주 KB스타즈', teamB: '부천 하나원큐', time: '19:00', confidence: 71 },
      { id: 'sch-bk-w2', dateOffset: 1, teamA: '부산 BNK', teamB: '인천 신한', time: '19:00', confidence: 69 },
      { id: 'sch-bk-w3', dateOffset: 4, teamA: '용인 삼성생명', teamB: '아산 우리은행', time: '16:00', confidence: 68 },
    ],
    nba: [
      { id: 'sch-bk-n1', dateOffset: 0, teamA: '보스턴 셀틱스', teamB: '밀워키 벅스', time: '09:00', confidence: 74 },
      { id: 'sch-bk-n2', dateOffset: 0, teamA: '뉴욕 닉스', teamB: '필라델피아 76ers', time: '09:30', confidence: 70 },
      { id: 'sch-bk-n3', dateOffset: 1, teamA: 'LA 레이커스', teamB: '골든스테이트 워리어스', time: '12:30', confidence: 73 },
    ],
  },
};

// ============================================
// 리그순위 더미 데이터 (API JSON fallback용)
// ============================================
const STANDINGS_DUMMY_DATA = buildAllStandingsData();
/** 활성 순위 데이터 — standings-loader.js가 JSON fetch 후 갱신 */
var STANDINGS_DATA = STANDINGS_DUMMY_DATA;

// ============================================
// 라이브스코어 더미 데이터
// ============================================
const LIVESCORE_DATA = {
  football: {
    kLeague: [
      { id: 'live-fb-k1', teamA: '울산 HD', teamB: '전북 현대', status: 'live', scoreA: 1, scoreB: 0, display: "65'" },
      { id: 'live-fb-k2', teamA: '포항 스틸러스', teamB: 'FC서울', status: 'upcoming', scoreA: null, scoreB: null, display: '19:00' },
      { id: 'live-fb-k3', teamA: '수원 FC', teamB: '대구 FC', status: 'finished', scoreA: 2, scoreB: 1, display: '종료' },
    ],
    epl: [
      { id: 'live-fb-e1', teamA: '아스널', teamB: '리버풀', status: 'live', scoreA: 2, scoreB: 2, display: "78'" },
      { id: 'live-fb-e2', teamA: '맨체스터 시티', teamB: '첼시', status: 'finished', scoreA: 3, scoreB: 0, display: '종료' },
    ],
    bundesliga: [
      { id: 'live-fb-b1', teamA: '바이에른 뮌헨', teamB: '보루시아 도르트문트', status: 'upcoming', scoreA: null, scoreB: null, display: '23:30' },
    ],
    ligue1: [],
    serieA: [],
    laLiga: [
      { id: 'live-fb-ll1', teamA: '레알 마드리드', teamB: 'FC바르셀로나', status: 'finished', scoreA: 1, scoreB: 1, display: '종료' },
    ],
  },
  baseball: {
    kbo: [
      { id: 'live-bb-k1', teamA: 'LG 트윈스', teamB: '두산 베어스', status: 'live', scoreA: 4, scoreB: 3, display: '7회' },
      { id: 'live-bb-k2', teamA: 'KIA 타이거즈', teamB: 'SSG 랜더스', status: 'upcoming', scoreA: null, scoreB: null, display: '18:30' },
    ],
    mlb: [
      { id: 'live-bb-m1', teamA: '뉴욕 양키스', teamB: '보스턴 레드삭스', status: 'live', scoreA: 2, scoreB: 1, display: '5회' },
      { id: 'live-bb-m2', teamA: 'LA 다저스', teamB: '샌프란시스코 자이언츠', status: 'finished', scoreA: 5, scoreB: 2, display: '종료' },
    ],
    npb: [],
  },
  volleyball: {
    vLeagueMen: [
      { id: 'live-vb-m1', teamA: '대한항공', teamB: '현대캐피탈', status: 'live', scoreA: 2, scoreB: 1, display: '4세트' },
      { id: 'live-vb-m2', teamA: '삼성화재', teamB: 'OK금융그룹', status: 'finished', scoreA: 3, scoreB: 0, display: '종료' },
    ],
    vLeagueWomen: [
      { id: 'live-vb-w1', teamA: '흥국생명', teamB: '현대건설', status: 'upcoming', scoreA: null, scoreB: null, display: '19:00' },
    ],
  },
  basketball: {
    kbl: [
      { id: 'live-bk-k1', teamA: '서울 SK', teamB: '원주 DB', status: 'finished', scoreA: 88, scoreB: 82, display: '종료' },
    ],
    wkbl: [
      { id: 'live-bk-w1', teamA: '청주 KB스타즈', teamB: '부천 하나원큐', status: 'upcoming', scoreA: null, scoreB: null, display: '19:00' },
    ],
    nba: [
      { id: 'live-bk-n1', teamA: '보스턴 셀틱스', teamB: '밀워키 벅스', status: 'live', scoreA: 98, scoreB: 95, display: 'Q4 05:32' },
      { id: 'live-bk-n2', teamA: 'LA 레이커스', teamB: '골든스테이트 워리어스', status: 'upcoming', scoreA: null, scoreB: null, display: '12:30' },
    ],
  },
};
