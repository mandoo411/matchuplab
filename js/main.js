/**
 * MatchUp LAB - 메인 인터랙션 로직
 * 종목/리그 탭 전환, 경기 카드 렌더링, 분석 근거 블러 처리
 */

(function () {
  'use strict';

  // 현재 선택 상태
  let currentSport = 'football';
  let currentLeague = 'kLeague';

  // DOM 참조
  const sportTabsEl = document.getElementById('sport-tabs');
  const leagueSubtabsEl = document.getElementById('league-subtabs');
  const matchesGridEl = document.getElementById('matches-grid');
  const transparencyTableBody = document.getElementById('transparency-tbody');
  const gnbToggle = document.getElementById('gnb-toggle');
  const gnbMenu = document.getElementById('gnb-menu');

  /**
   * GNB 모바일 메뉴 토글
   */
  function initGnb() {
    if (!gnbToggle || !gnbMenu) return;

    gnbToggle.addEventListener('click', () => {
      gnbMenu.classList.toggle('open');
    });

    gnbMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        gnbMenu.classList.remove('open');
      });
    });
  }

  /**
   * 종목 탭 렌더링
   */
  function renderSportTabs() {
    if (!sportTabsEl) return;

    sportTabsEl.innerHTML = SPORT_TABS.map(
      (tab) =>
        `<button class="sport-tab${tab.id === currentSport ? ' active' : ''}" data-sport="${tab.id}">${tab.label}</button>`
    ).join('');

    sportTabsEl.querySelectorAll('.sport-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sportId = btn.dataset.sport;
        selectSport(sportId);
      });
    });
  }

  /**
   * 종목 선택 → 리그 서브탭 갱신
   */
  function selectSport(sportId) {
    currentSport = sportId;
    const tabMeta = SPORT_TABS.find((t) => t.id === sportId);
    currentLeague = tabMeta ? tabMeta.defaultLeague : Object.keys(SPORTS_DATA[sportId].leagues)[0];

    renderSportTabs();
    renderLeagueSubtabs();
    renderMatches();
  }

  /**
   * 리그 서브탭 렌더링
   */
  function renderLeagueSubtabs() {
    if (!leagueSubtabsEl) return;

    const sportData = SPORTS_DATA[currentSport];
    const leagues = sportData.leagues;
    const leagueKeys = Object.keys(leagues);

    leagueSubtabsEl.classList.remove('hidden');

    leagueSubtabsEl.innerHTML = leagueKeys
      .map((key) => {
        const league = leagues[key];
        return `<button class="league-tab${key === currentLeague ? ' active' : ''}" data-league="${key}">${league.name}</button>`;
      })
      .join('');

    leagueSubtabsEl.querySelectorAll('.league-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentLeague = btn.dataset.league;
        renderLeagueSubtabs();
        renderMatches();
      });
    });
  }

  /**
   * 확률 막대바 HTML 생성
   */
  function buildProbBar(match, hasDraw) {
    if (hasDraw) {
      return `
        <div class="prob-bar-wrap">
          <div class="prob-bar">
            <div class="prob-segment win" style="width:${match.probWin}%"></div>
            <div class="prob-segment draw" style="width:${match.probDraw}%"></div>
            <div class="prob-segment loss" style="width:${match.probLoss}%"></div>
          </div>
          <div class="prob-labels">
            <span class="label-win">승 <strong>${match.probWin}%</strong></span>
            <span class="label-draw">무 <strong>${match.probDraw}%</strong></span>
            <span class="label-loss">패 <strong>${match.probLoss}%</strong></span>
          </div>
        </div>`;
    }

    return `
      <div class="prob-bar-wrap">
        <div class="prob-bar two-way">
          <div class="prob-segment win" style="width:${match.probWin}%"></div>
          <div class="prob-segment loss" style="width:${match.probLoss}%"></div>
        </div>
        <div class="prob-labels">
          <span class="label-win">${match.teamA} <strong>${match.probWin}%</strong></span>
          <span class="label-loss">${match.teamB} <strong>${match.probLoss}%</strong></span>
        </div>
      </div>`;
  }

  /**
   * 경기 카드 HTML 생성
   */
  function buildMatchCard(match, leagueName, hasDraw) {
    return `
      <article class="match-card" data-match-id="${match.id}">
        <div class="match-card-header">
          <span class="league-label">${leagueName}</span>
          <span class="match-time">${match.time}</span>
        </div>
        <div class="match-teams">
          ${match.teamA}<span class="vs">vs</span>${match.teamB}
        </div>
        ${buildProbBar(match, hasDraw)}
        <div class="match-meta">
          <span class="confidence-badge">신뢰도 ${match.confidence}%</span>
        </div>
        <p class="ai-conclusion">${match.conclusion}</p>
        <div class="reason-block">
          <button class="reason-toggle" aria-expanded="false">분석 근거 보기</button>
          <div class="reason-content hidden">
            <div class="reason-text blurred">${match.reason}</div>
            <div class="reason-overlay">로그인 후 상세 근거를 확인하세요</div>
          </div>
        </div>
      </article>`;
  }

  /**
   * 오늘의 주요 경기 렌더링
   */
  function renderMatches() {
    if (!matchesGridEl) return;

    const sportData = SPORTS_DATA[currentSport];
    const league = sportData.leagues[currentLeague];
    const hasDraw = sportData.hasDraw;

    if (!league || league.matches.length === 0) {
      matchesGridEl.innerHTML = `
        <div class="empty-matches">
          <p>해당 리그의 예정 경기가 없습니다.</p>
          <p style="margin-top:8px;font-size:0.8125rem;">다른 리그 탭을 선택해 보세요.</p>
        </div>`;
      return;
    }

    matchesGridEl.innerHTML = league.matches
      .map((match) => buildMatchCard(match, league.name, hasDraw))
      .join('');

    bindReasonToggles();
  }

  /**
   * 분석 근거 토글 + 블러 처리
   * 확률·신뢰도는 항상 공개, 근거 텍스트만 블러
   */
  function bindReasonToggles() {
    matchesGridEl.querySelectorAll('.reason-block').forEach((block) => {
      const toggle = block.querySelector('.reason-toggle');
      const content = block.querySelector('.reason-content');

      toggle.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');
        content.classList.toggle('hidden');
        toggle.setAttribute('aria-expanded', String(!isOpen));
        toggle.textContent = isOpen ? '분석 근거 보기' : '분석 근거 닫기';
      });
    });
  }

  /**
   * 투명성 테이블 렌더링
   */
  function renderTransparencyTable() {
    if (!transparencyTableBody) return;

    transparencyTableBody.innerHTML = TRANSPARENCY_RECORDS.map((row) => {
      const iconClass = row.hit ? 'success' : 'fail';
      const iconChar = row.hit ? '✓' : '✗';
      return `
        <tr>
          <td>${row.date}</td>
          <td>${row.sport}</td>
          <td>${row.match}</td>
          <td>${row.prediction}</td>
          <td>${row.result}</td>
          <td><span class="hit-icon ${iconClass}" aria-label="${row.hit ? '적중' : '미적중'}">${iconChar}</span></td>
        </tr>`;
    }).join('');
  }

  /**
   * 초기화
   */
  function init() {
    initGnb();
    renderSportTabs();
    renderLeagueSubtabs();
    renderMatches();
    renderTransparencyTable();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
