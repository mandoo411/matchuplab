/**
 * MatchUp LAB - 라이브스코어 페이지
 */

(function () {
  'use strict';

  let statusFilter = 'all';
  const statusFilterEl = document.getElementById('status-filter');
  const livescoreListEl = document.getElementById('livescore-list');

  function buildStatusBadge(status, display) {
    if (status === 'live') {
      return `<span class="status-badge live"><span class="live-dot"></span>LIVE</span>`;
    }
    if (status === 'finished') {
      return `<span class="status-badge finished">${display}</span>`;
    }
    return `<span class="status-badge upcoming">${display}</span>`;
  }

  /** LIVE / 예정 / 종료 공통 중앙 영역 */
  function buildLivescoreCenter(match) {
    if (match.status === 'upcoming') {
      return `
        <div class="livescore-center-inner">
          <span class="livescore-vs-text">VS</span>
          <span class="livescore-sub">${match.display}</span>
        </div>`;
    }

    const sub = match.status === 'live' ? match.display : '';
    return `
      <div class="livescore-center-inner">
        <div class="livescore-score">
          <span>${match.scoreA}</span>
          <span class="score-sep">:</span>
          <span>${match.scoreB}</span>
        </div>
        ${sub ? `<span class="livescore-sub">${sub}</span>` : ''}
      </div>`;
  }

  function buildLivescoreCard(match, leagueName) {
    return `
      <article class="livescore-card livescore-card--${match.status}" data-status="${match.status}">
        <div class="livescore-card-header">
          <span class="league-label">${leagueName}</span>
          ${buildStatusBadge(match.status, match.display)}
        </div>
        <div class="livescore-body">
          <span class="livescore-team livescore-team--home">${match.teamA}</span>
          ${buildLivescoreCenter(match)}
          <span class="livescore-team livescore-team--away">${match.teamB}</span>
        </div>
      </article>`;
  }

  function renderStatusFilter() {
    if (!statusFilterEl) return;

    const filters = [
      { id: 'all', label: '전체' },
      { id: 'live', label: '진행중' },
      { id: 'finished', label: '종료' },
    ];

    statusFilterEl.innerHTML = filters
      .map(
        (f) =>
          `<button class="status-filter-btn${statusFilter === f.id ? ' active' : ''}" data-filter="${f.id}">${f.label}</button>`
      )
      .join('');

    statusFilterEl.querySelectorAll('.status-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        statusFilter = btn.dataset.filter;
        renderStatusFilter();
        renderLivescoreList();
      });
    });
  }

  function renderLivescoreList() {
    if (!livescoreListEl) return;

    const { sport, league } = MatchUpTabs.getState();
    const leagueName = MatchUpTabs.getLeagueName();
    const matches = (LIVESCORE_DATA[sport] && LIVESCORE_DATA[sport][league]) || [];

    let filtered = matches;
    if (statusFilter === 'live') {
      filtered = matches.filter((m) => m.status === 'live');
    } else if (statusFilter === 'finished') {
      filtered = matches.filter((m) => m.status === 'finished');
    }

    if (filtered.length === 0) {
      livescoreListEl.innerHTML = `
        <div class="empty-matches">
          <p>표시할 경기가 없습니다.</p>
          <p style="margin-top:8px;font-size:0.8125rem;">다른 필터 또는 리그를 선택해 보세요.</p>
        </div>`;
      return;
    }

    livescoreListEl.innerHTML = filtered
      .map((match) => buildLivescoreCard(match, leagueName))
      .join('');
  }

  function init() {
    MatchUpTabs.init({
      onChange: () => {
        renderLivescoreList();
      },
    });
    renderStatusFilter();
    renderLivescoreList();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
