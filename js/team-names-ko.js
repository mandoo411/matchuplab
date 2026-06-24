/**
 * MatchUp LAB - 팀명 한글 변환 · 정규화 · 표시용 축약
 */
const TEAM_NAMES_KO = {
  kLeague: {
    'Ulsan HD': '울산 HD',
    'Jeonbuk Hyundai Motors': '전북 현대',
    'Pohang Steelers': '포항 스틸러스',
    'FC Seoul': 'FC서울',
    'Gangwon FC': '강원 FC',
    'Suwon FC': '수원 FC',
    'Daegu FC': '대구 FC',
    'Jeju United': '제주 유나이티드',
    'Gimcheon Sangmu': '김천 상무',
    'Gwangju FC': '광주 FC',
    'FC Anyang': 'FC안양',
    'Daejeon Citizen': '대전 FC',
  },
  epl: {
    'Man City': '맨체스터 시티',
    'Man United': '맨체스터 유나이티드',
    'Brighton Hove': '브라이턴',
    'Nottingham': '노팅엄 포레스트',
    'Leeds United': '리즈 유나이티드',
    'Hull City': '헐 시티',
    'Coventry City': '코번트리 시티',
    Arsenal: '아스널',
    'Manchester City': '맨체스터 시티',
    Liverpool: '리버풀',
    Chelsea: '첼시',
    Tottenham: '토트넘',
    'Tottenham Hotspur': '토트넘',
    'Manchester United': '맨체스터 유나이티드',
    Newcastle: '뉴캐슬',
    'Newcastle United': '뉴캐슬',
    'Aston Villa': '아스톤 빌라',
    'West Ham': '웨스트햄',
    'West Ham United': '웨스트햄',
    Brighton: '브라이턴',
    'Brighton and Hove Albion': '브라이턴',
    Brentford: '브렌트포드',
    Fulham: '풀럼',
    'Crystal Palace': '크리스탈 팰리스',
    Wolves: '울버햄튼',
    'Wolverhampton Wanderers': '울버햄튼',
    'Nottingham Forest': '노팅엄 포레스트',
    Everton: '에버턴',
    Burnley: '번리',
    'Sheffield Utd': '셰필드 유나이티드',
    Luton: '루턴',
    Bournemouth: '본머스',
    Ipswich: '입스위치',
    Leicester: '레스터',
    Southampton: '사우샘프턴',
    Sunderland: '선덜랜드',
    'Leeds United': '리즈 유나이티드',
  },
  bundesliga: {
    'Dortmund': '보루시아 도르트문트',
    'Leverkusen': '바이어 레버쿠젠',
    'Frankfurt': '아인트라흐트 프랑크푸르트',
    'Wolfsburg': '볼프스부르크',
    'Freiburg': '프라이부르크',
    "M'gladbach": '보루시아 묀헨글라드바흐',
    'Stuttgart': '슈투트가르트',
    'HSV': '함부르크 SV',
    'St. Pauli': 'FC 장크트파울리',
    'Bayern Munich': '바이에른 뮌헨',
    'Borussia Dortmund': '보루시아 도르트문트',
    'RB Leipzig': 'RB 라이프치히',
    'Bayer Leverkusen': '바이어 레버쿠젠',
    'Eintracht Frankfurt': '아인트라흐트 프랑크푸르트',
    'VfL Wolfsburg': '볼프스부르크',
    'SC Freiburg': '프라이부르크',
    'Union Berlin': '우니온 베를린',
    'Borussia Mönchengladbach': '보루시아 묀헨글라드바흐',
    'VfB Stuttgart': '슈투트가르트',
    Hoffenheim: '호펜하임',
    Mainz: '마인츠',
    Augsburg: '아우크스부르크',
    'Werder Bremen': '베르더 브레멘',
    Köln: '쾰른',
    'Hertha Berlin': '헤르타 베를린',
    Darmstadt: '다름슈타트',
    Heidenheim: '하이덴하임',
    Bochum: '보쿰',
  },
  laLiga: {
    'Barça': '바르셀로나',
    'Athletic': '아틀레틱 클럽',
    'Sevilla FC': '세비야',
    'Celta': '셀타 비고',
    'Alavés': '알라베스',
    'Real Oviedo': '레알 오비에도',
    'Elche': '엘체',
    'Levante': '레반테',
    'Real Madrid': '레알 마드리드',
    Barcelona: 'FC바르셀로나',
    'Atletico Madrid': '아틀레티코 마드리드',
    Sevilla: '세비야',
    'Real Sociedad': '레알 소시에다드',
    'Real Betis': '레알 베티스',
    Villarreal: '비야레알',
    'Athletic Club': '아틀레틱 빌바오',
    Valencia: '발렌시아',
    Osasuna: '오사수나',
    'Celta Vigo': '셀타 비고',
    'Rayo Vallecano': '라요 바예카노',
    Getafe: '헤타페',
    Cadiz: '카디스',
    Almeria: '알메리아',
    Mallorca: '마요르카',
    Granada: '그라나다',
    'Las Palmas': '라스 팔마스',
    Girona: '지로나',
    Alaves: '알라베스',
  },
  serieA: {
    'Roma': 'AS 로마',
    'Milan': 'AC 밀란',
    'Hellas Verona': '엘라스 베로나',
    'Verona': '엘라스 베로나',
    'Como 1907': '코모 1907',
    'Parma': '파르마',
    'Cremonese': '크레모네세',
    'AC Pisa': '피사',
    Inter: '인터 밀란',
    'AC Milan': 'AC 밀란',
    Juventus: '유벤투스',
    Napoli: '나폴리',
    'AS Roma': 'AS 로마',
    Lazio: '라치오',
    Atalanta: '아탈란타',
    Fiorentina: '피오렌티나',
    Bologna: '볼로냐',
    Torino: '토리노',
    Monza: '몬자',
    Udinese: '우디네세',
    Sassuolo: '사수올로',
    Lecce: '레체',
    'Hellas Verona': '엘라스 베로나',
    Empoli: '엠폴리',
    Frosinone: '프로시노네',
    Genoa: '제노아',
    Cagliari: '칼리아리',
    Salernitana: '살레르니타나',
  },
  ligue1: {
    'Angers SCO': '앙제',
    'Paris FC': '파리 FC',
    'Auxerre': '오세르',
    'Troyes': '트루아',
    'Le Mans': '르망',
    'Paris Saint Germain': '파리 생제르맹',
    Monaco: '모나코',
    Marseille: '마르세유',
    Lille: '릴',
    Lyon: '리옹',
    Lens: '랑스',
    Nice: '니스',
    Rennes: '렌',
    Toulouse: '툴루즈',
    Montpellier: '몽펠리에',
    Brest: '브레스트',
    Nantes: '낭트',
    Strasbourg: '스트라스부르',
    Reims: '랭스',
    Lorient: '로리앙',
    'Le Havre': '르아브르',
    Metz: '메스',
    'Clermont Foot': '클레르몽',
  },
  mlb: {
    'New York Yankees': '뉴욕 양키스',
    Yankees: '뉴욕 양키스',
    양키스: '뉴욕 양키스',
    'Boston Red Sox': '보스턴 레드삭스',
    레드삭스: '보스턴 레드삭스',
    'Tampa Bay Rays': '탬파베이 레이스',
    레이스: '탬파베이 레이스',
    'Toronto Blue Jays': '토론토 블루제이스',
    블루제이스: '토론토 블루제이스',
    'Baltimore Orioles': '볼티모어 오리올스',
    오리올스: '볼티모어 오리올스',
    'Cleveland Guardians': '클리블랜드 가디언스',
    가디언스: '클리블랜드 가디언스',
    'Chicago White Sox': '시카고 화이트삭스',
    화이트삭스: '시카고 화이트삭스',
    'Minnesota Twins': '미네소타 트윈스',
    트윈스: '미네소타 트윈스',
    'Detroit Tigers': '디트로이트 타이거스',
    타이거스: '디트로이트 타이거스',
    'Kansas City Royals': '캔자스시티 로열스',
    로열스: '캔자스시티 로열스',
    'Houston Astros': '휴스턴 애스트로스',
    애스트로스: '휴스턴 애스트로스',
    'Seattle Mariners': '시애틀 매리너스',
    매리너스: '시애틀 매리너스',
    'Texas Rangers': '텍사스 레인저스',
    레인저스: '텍사스 레인저스',
    'Los Angeles Angels': 'LA 에인절스',
    에인절스: 'LA 에인절스',
    'Oakland Athletics': '애슬레틱스',
    'Los Angeles Dodgers': 'LA 다저스',
    다저스: 'LA 다저스',
    'San Francisco Giants': '샌프란시스코 자이언츠',
    자이언츠: '샌프란시스코 자이언츠',
    'San Diego Padres': '샌디에이고 파드레스',
    파드리스: '샌디에이고 파드레스',
    'Arizona Diamondbacks': '애리조나 다이아몬드백스',
    다이아몬드백스: '애리조나 다이아몬드백스',
    'Colorado Rockies': '콜로라도 로키스',
    로키스: '콜로라도 로키스',
    'Atlanta Braves': '애틀랜타 브레이브스',
    브레이브스: '애틀랜타 브레이브스',
    'New York Mets': '뉴욕 메츠',
    메츠: '뉴욕 메츠',
    'Philadelphia Phillies': '필라델피아 필리스',
    필리스: '필라델피아 필리스',
    'Miami Marlins': '마이애미 말린스',
    마린스: '마이애미 말린스',
    'Washington Nationals': '워싱턴 내셔널스',
    내셔널스: '워싱턴 내셔널스',
    'Milwaukee Brewers': '밀워키 브루어스',
    브루어스: '밀워키 브루어스',
    'Chicago Cubs': '시카고 컵스',
    컵스: '시카고 컵스',
    'St. Louis Cardinals': '세인트루이스 카디널스',
    카디널스: '세인트루이스 카디널스',
    'Pittsburgh Pirates': '피츠버그 파이리츠',
    파이리츠: '피츠버그 파이리츠',
    'Cincinnati Reds': '신시내티 레즈',
    레즈: '신시내티 레즈',
  },
  kbo: {
    'LG Twins': 'LG 트윈스',
    'KT Wiz': 'KT 위즈',
    'SSG Landers': 'SSG 랜더스',
    'NC Dinos': 'NC 다이노스',
    'Doosan Bears': '두산 베어스',
    'KIA Tigers': 'KIA 타이거즈',
    'Lotte Giants': '롯데 자이언츠',
    'Samsung Lions': '삼성 라이온즈',
    'Hanwha Eagles': '한화 이글스',
    'Kiwoom Heroes': '키움 히어로즈',
  },
  npb: {
    'Yomiuri Giants': '요미우리 자이언츠',
    'Hanshin Tigers': '한신 타이거스',
    'Tokyo Yakult Swallows': '야쿠르트 스왈로스',
    'Yokohama DeNA BayStars': '요코하마 베이스타스',
    'Hiroshima Toyo Carp': '히로시마 도요 카프',
    'Chunichi Dragons': '주니치 드래곤스',
    'Fukuoka SoftBank Hawks': '소프트뱅크 호크스',
    'Saitama Seibu Lions': '세이부 라이온스',
    'Orix Buffaloes': '오릭스 버팔로스',
    'Hokkaido Nippon-Ham Fighters': '닛폰햄 파이터스',
    'Chiba Lotte Marines': '지바 롯데 마린스',
    'Tohoku Rakuten Golden Eagles': '라쿠텐 이글스',
  },
  nba: {
    'Boston Celtics': '보스턴 셀틱스',
    'New York Knicks': '뉴욕 닉스',
    'Brooklyn Nets': '브루클린 네츠',
    'Philadelphia 76ers': '필라델피아 76ers',
    'Toronto Raptors': '토론토 랩터스',
    'Milwaukee Bucks': '밀워키 벅스',
    'Cleveland Cavaliers': '클리블랜드 캐벌리어스',
    'Chicago Bulls': '시카고 불스',
    'Indiana Pacers': '인디애나 페이서스',
    'Detroit Pistons': '디트로이트 피스턴스',
    'Miami Heat': '마이애미 히트',
    'Orlando Magic': '올랜도 매직',
    'Atlanta Hawks': '애틀랜타 호크스',
    'Washington Wizards': '워싱턴 위저즈',
    'Charlotte Hornets': '샬럿 호넷츠',
    'Denver Nuggets': '덴버 너게츠',
    'Minnesota Timberwolves': '미네소타 팀버울브스',
    'Oklahoma City Thunder': '오클라호마시티 썬더',
    'Portland Trail Blazers': '포틀랜드 트레일블레이저스',
    'Utah Jazz': '유타 재즈',
    'Los Angeles Lakers': 'LA 레이커스',
    'Los Angeles Clippers': 'LA 클리퍼스',
    'Golden State Warriors': '골든스테이트 워리어스',
    'Phoenix Suns': '피닉스 선즈',
    'Sacramento Kings': '새크라멘토 킹스',
    'Dallas Mavericks': '댈러스 매버릭스',
    'Houston Rockets': '휴스턴 로키츠',
    'Memphis Grizzlies': '멤피스 그리즐리스',
    'New Orleans Pelicans': '뉴올리언스 펠리컨스',
    'San Antonio Spurs': '샌안토니오 스퍼스',
  },
};

/** API/데이터 변형명 → 표준 한글명 */
const TEAM_ALIASES = {
  울산HD: '울산 HD',
  전북현대모터스: '전북 현대',
  포항스틸러스: '포항 스틸러스',
  강원FC: '강원 FC',
  인천유나이티드: '인천 유나이티드',
  대전하나시티즌: '대전 FC',
  김천상무: '김천 상무',
  부천FC1995: '부천 FC',
  제주SK: '제주 유나이티드',
  '뉴캐슬 유나이티드': '뉴캐슬',
  '웨스트햄 유나이티드': '웨스트햄',
  '토트넘 핫스퍼': '토트넘',
  '울버햄튼 원더러스': '울버햄튼',
  브라이튼: '브라이턴',
  'RB라이프치히': 'RB 라이프치히',
  'VfB슈투트가르트': '슈투트가르트',
  'TSG호펜하임': '호펜하임',
  'SC프라이부르크': '프라이부르크',
  'FC아우크스부르크': '아우크스부르크',
  'FSV마인츠05': '마인츠',
  'VfL볼프스부르크': '볼프스부르크',
  'FC쾰른': '쾰른',
  'FC하이덴하임': '하이덴하임',
  'FC상파울리': '상파울리',
  '함부르크SV': '함부르크',
  AS로마: 'AS 로마',
  AC밀란: 'AC 밀란',
  '필라델피아 세븐티식서스': '필라델피아 76ers',
  '디트로이트 피스톤스': '디트로이트 피스턴스',
  '샬럿 호네츠': '샬럿 호넷츠',
  '덴버 너기츠': '덴버 너게츠',
  '산안토니오 스퍼스': '샌안토니오 스퍼스',
  '로스앤젤레스 레이커스': 'LA 레이커스',
  '로스앤젤레스 클리퍼스': 'LA 클리퍼스',
};

/** 순위표 표시용 축약명 (10글자 초과 팀만) */
const TEAM_SHORT_NAMES = {
  '포틀랜드 트레일블레이저스': '포틀랜드',
  '아인트라흐트 프랑크푸르트': '프랑크푸르트',
  '보루시아 묀헨글라드바흐': '묀헨글라드바흐',
  '보루시아 도르트문트': '도르트문트',
  '맨체스터 유나이티드': '맨유',
  '울버햄튼 원더러스': '울버햄튼',
  '웨스트햄 유나이티드': '웨스트햄',
  '아틀레티코 마드리드': '아틀레티코',
  '클리블랜드 캐벌리어스': '클리블랜드',
  '오클라호마시티 썬더': 'OKC',
  '미네소타 팀버울브스': '미네소타',
  '골든스테이트 워리어스': '골든스테이트',
  '필라델피아 76ers': '필라델피아',
  '세인트루이스 카디널스': '세인트루이스',
  '애리조나 다이아몬드백스': '애리조나',
};

const TEAM_NAME_SHORTEN_THRESHOLD = 10;

function shortenTeamName(name) {
  if (!name || name.length <= TEAM_NAME_SHORTEN_THRESHOLD) return name;

  if (TEAM_SHORT_NAMES[name]) return TEAM_SHORT_NAMES[name];

  const parts = name.split(/\s+/);
  if (parts.length <= 1) return name;

  const skipPrefixes = ['보루시아', '바이어', '아인트라흐트', 'FC', 'SC', 'VfB', 'VfL', 'TSG', 'RB', 'AC', 'AS'];
  if (skipPrefixes.includes(parts[0])) {
    return parts.slice(1).join(' ');
  }

  return parts[0];
}

/** 한글 포함 여부 */
function hasHangul(str) {
  return /[\uAC00-\uD7A3]/.test(str);
}

/** 이미 정규화된 한글 팀명이면 그대로 반환 */
function isCanonicalTeamName(name) {
  for (const map of Object.values(TEAM_NAMES_KO)) {
    if (Object.values(map).includes(name)) return true;
  }
  return false;
}

/** 리그 키별 매핑 + 전체 통합 검색 (+ 부분일치 보조 매칭) */
function translateTeamName(name, leagueKey) {
  if (!name) return name;
  if (TEAM_ALIASES[name]) return TEAM_ALIASES[name];
  if (isCanonicalTeamName(name)) return name;
  if (leagueKey && TEAM_NAMES_KO[leagueKey] && TEAM_NAMES_KO[leagueKey][name]) {
    return TEAM_NAMES_KO[leagueKey][name];
  }
  for (const map of Object.values(TEAM_NAMES_KO)) {
    if (map[name]) return map[name];
  }
  const tryPartial = (map) => {
    const lower = name.toLowerCase();
    const inputHasHangul = hasHangul(name);
    for (const key of Object.keys(map)) {
      const keyLower = key.toLowerCase();
      if (lower === keyLower) return map[key];
      // 한글 팀명이 MLB/NPB 접미사(트윈스·자이언츠 등)에 잘못 매칭되는 것 방지
      if (inputHasHangul && hasHangul(key)) continue;
      if (lower.includes(keyLower) || keyLower.includes(lower)) {
        return map[key];
      }
    }
    return null;
  };
  if (leagueKey && TEAM_NAMES_KO[leagueKey]) {
    const hit = tryPartial(TEAM_NAMES_KO[leagueKey]);
    if (hit) return hit;
  }
  for (const map of Object.values(TEAM_NAMES_KO)) {
    const hit = tryPartial(map);
    if (hit) return hit;
  }
  return name;
}

function normalizeTeamName(name, leagueKey) {
  return translateTeamName(String(name).trim(), leagueKey);
}
