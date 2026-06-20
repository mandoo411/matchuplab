/**
 * MatchUp LAB - 리그순위 페이지
 */

(function () {
  'use strict';

  const standingsTableWrap = document.getElementById('standings-table-wrap');

  function buildFormIcons(form) {
    return form
      .map((r) => {
        const cls = r === 'W' ? 'win' : r === 'D' ? 'draw' : 'loss';
        const label = r === 'W' ? '승' : r === 'D' ? '무' : '패';
        return `<span class="form-badge ${cls}" title="${label}">${r}</span>`;
      })
      .join('');
  }

  function renderStandingsTable() {
    if (!standingsTableWrap) return;

    const { sport, league } = MatchUpTabs.getState();
    const hasDraw = MatchUpTabs.hasDraw();
    const leagueName = MatchUpTabs.getLeagueName();
    const teams = (STANDINGS_DATA[sport] && STANDINGS_DATA[sport][league]) || [];

    if (teams.length === 0) {
      standingsTableWrap.innerHTML = `
        <div class="empty-matches">
          <p>순위 데이터가 없습니다.</p>
        </div>`;
      return;
    }

    if (hasDraw) {
      standingsTableWrap.innerHTML = `
        <table class="standings-table">
          <caption class="sr-only">${leagueName} 순위표</caption>
          <thead>
            <tr>
              <th>순위</th>
              <th>팀</th>
              <th>경기</th>
              <th>승</th>
              <th>무</th>
              <th>패</th>
              <th>승점</th>
              <th>최근5</th>
            </tr>
          </thead>
          <tbody>
            ${teams
              .map(
                (t) => `
              <tr>
                <td>${t.rank}</td>
                <td class="team-name">${t.name}</td>
                <td>${t.played}</td>
                <td>${t.win}</td>
                <td>${t.draw}</td>
                <td>${t.loss}</td>
                <td><strong>${t.points}</strong></td>
                <td><div class="form-row">${buildFormIcons(t.form)}</div></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>`;
    } else {
      standingsTableWrap.innerHTML = `
        <table class="standings-table">
          <caption class="sr-only">${leagueName} 순위표</caption>
          <thead>
            <tr>
              <th>순위</th>
              <th>팀</th>
              <th>경기</th>
              <th>승</th>
              <th>패</th>
              <th>승률</th>
              <th>승차</th>
              <th>최근5</th>
            </tr>
          </thead>
          <tbody>
            ${teams
              .map(
                (t) => `
              <tr>
                <td>${t.rank}</td>
                <td class="team-name">${t.name}</td>
                <td>${t.played}</td>
                <td>${t.win}</td>
                <td>${t.loss}</td>
                <td>${t.winRate}%</td>
                <td>${t.gamesBack}</td>
                <td><div class="form-row">${buildFormIcons(t.form)}</div></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>`;
    }
  }

  function init() {
    MatchUpTabs.init({
      onChange: () => {
        renderStandingsTable();
      },
    });
    renderStandingsTable();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
