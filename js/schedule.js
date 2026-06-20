/**
 * MatchUp LAB - 경기일정 페이지
 */

(function () {
  'use strict';

  let selectedDateOffset = 0;
  const dateChipsEl = document.getElementById('date-chips');
  const scheduleListEl = document.getElementById('schedule-list');

  const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

  function formatChipDate(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dow = DAY_LABELS[date.getDay()];
    return `${month}/${day}(${dow})`;
  }

  function renderDateChips() {
    if (!dateChipsEl) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    dateChipsEl.innerHTML = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isToday = i === 0;
      const isActive = i === selectedDateOffset;
      const label = isToday ? `오늘 · ${formatChipDate(d)}` : formatChipDate(d);
      return `<button class="date-chip${isActive ? ' active' : ''}${isToday ? ' today' : ''}" data-offset="${i}">${label}</button>`;
    }).join('');

    dateChipsEl.querySelectorAll('.date-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        selectedDateOffset = Number(chip.dataset.offset);
        renderDateChips();
        renderScheduleList();
      });
    });
  }

  function buildScheduleCard(match, leagueName) {
    return `
      <article class="schedule-card">
        <div class="schedule-card-header">
          <span class="league-label">${leagueName}</span>
          <span class="match-time">${match.time}</span>
        </div>
        <div class="match-teams">${match.teamA}<span class="vs">vs</span>${match.teamB}</div>
        <div class="schedule-card-footer">
          <span class="confidence-badge">신뢰도 ${match.confidence}%</span>
          <span class="schedule-card-hint">상세보기 예정</span>
        </div>
      </article>`;
  }

  function renderScheduleList() {
    if (!scheduleListEl) return;

    const { sport, league } = MatchUpTabs.getState();
    const leagueName = MatchUpTabs.getLeagueName();
    const leagueSchedule = (SCHEDULE_DATA[sport] && SCHEDULE_DATA[sport][league]) || [];

    const filtered = leagueSchedule.filter((m) => m.dateOffset === selectedDateOffset);

    if (filtered.length === 0) {
      scheduleListEl.innerHTML = `
        <div class="empty-matches">
          <p>예정된 경기가 없습니다.</p>
          <p style="margin-top:8px;font-size:0.8125rem;">다른 날짜 또는 리그를 선택해 보세요.</p>
        </div>`;
      return;
    }

    scheduleListEl.innerHTML = filtered
      .map((match) => buildScheduleCard(match, leagueName))
      .join('');
  }

  function init() {
    MatchUpTabs.init({
      onChange: () => {
        renderScheduleList();
      },
    });
    renderDateChips();
    renderScheduleList();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
