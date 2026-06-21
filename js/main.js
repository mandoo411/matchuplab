/**
 * MatchUp LAB - 메인(index) 페이지 전용 로직
 */

(function () {
  'use strict';

  const matchesGridEl = document.getElementById('matches-grid');
  const transparencyTableBody = document.getElementById('transparency-tbody');

  const REASON_LOCK_ICON =
    '<svg class="reason-lock-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

  function reasonToggleLabel(isOpen) {
    return isOpen ? '분석 근거 닫기' : `${REASON_LOCK_ICON} 분석 근거 보기`;
  }

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
          <button class="reason-toggle" aria-expanded="false">${REASON_LOCK_ICON} 분석 근거 보기</button>
          <div class="reason-content hidden">
            <div class="reason-text blurred">${match.reason}</div>
            <div class="reason-overlay">로그인 후 상세 근거를 확인하세요</div>
          </div>
        </div>
      </article>`;
  }

  function bindReasonToggles() {
    if (!matchesGridEl) return;

    matchesGridEl.querySelectorAll('.reason-block').forEach((block) => {
      const toggle = block.querySelector('.reason-toggle');
      const content = block.querySelector('.reason-content');

      toggle.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');
        content.classList.toggle('hidden');
        toggle.setAttribute('aria-expanded', String(!isOpen));
        toggle.innerHTML = reasonToggleLabel(!isOpen);
      });
    });
  }

  function renderMatches() {
    if (!matchesGridEl) return;

    const { sport, league } = MatchUpTabs.getState();
    const sportData = SPORTS_DATA[sport];
    const leagueData = sportData.leagues[league];
    const hasDraw = sportData.hasDraw;

    if (!leagueData || leagueData.matches.length === 0) {
      matchesGridEl.innerHTML = `
        <div class="empty-matches">
          <p>해당 리그의 예정 경기가 없습니다.</p>
          <p style="margin-top:8px;font-size:0.8125rem;">다른 리그 탭을 선택해 보세요.</p>
        </div>`;
      return;
    }

    matchesGridEl.innerHTML = leagueData.matches
      .map((match) => buildMatchCard(match, leagueData.name, hasDraw))
      .join('');

    bindReasonToggles();
  }

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

  function init() {
    MatchUpTabs.init({
      onChange: () => {
        renderMatches();
      },
    });
    renderTransparencyTable();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
