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

  function buildScoreDisplay(match) {
    if (match.status === 'upcoming') {
      return `<span class="livescore-time">${match.display}</span>`;
    }
    return `
      <div class="livescore-score">
        <span>${match.scoreA}</span>
        <span class="score-sep">:</span>
        <span>${match.scoreB}</span>
      </div>`;
  }

  function buildLivescoreCard(match, leagueName) {
    return `
      <article class="livescore-card" data-status="${match.status}">
        <div class="livescore-card-header">
          <span class="league-label">${leagueName}</span>
          ${buildStatusBadge(match.status, match.display)}
        </div>
        <div class="livescore-teams">
          <span class="livescore-team">${match.teamA}</span>
          ${buildScoreDisplay(match)}
          <span class="livescore-team">${match.teamB}</span>
        </div>
        ${match.status === 'live' ? `<p class="livescore-period">${match.display}</p>` : ''}
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
