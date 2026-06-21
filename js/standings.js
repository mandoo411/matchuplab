/**
 * MatchUp LAB - 리그순위 페이지
 */

(function () {
  'use strict';

  const standingsTableWrap = document.getElementById('standings-table-wrap');

  function usesPointsColumns(sport) {
    return sport === 'football' || sport === 'volleyball';
  }

  function buildFormIcons(form) {
    return form
      .map((r) => {
        const cls = r === 'W' ? 'win' : r === 'D' ? 'draw' : 'loss';
        const label = r === 'W' ? '승' : r === 'D' ? '무' : '패';
        return `<span class="form-badge ${cls}" title="${label}">${r}</span>`;
      })
      .join('');
  }

  function buildPointsRow(team) {
    const diffClass = team.goalDiff > 0 ? 'diff-plus' : team.goalDiff < 0 ? 'diff-minus' : '';
    return `
      <tr>
        <td class="col-sticky col-sticky-rank">${team.rank}</td>
        <td class="col-sticky col-sticky-team team-name">${team.name}</td>
        <td>${team.played}</td>
        <td>${team.win}</td>
        <td>${team.draw}</td>
        <td>${team.loss}</td>
        <td>${team.scored}</td>
        <td>${team.conceded}</td>
        <td class="${diffClass}">${formatGoalDiff(team.goalDiff)}</td>
        <td><strong>${team.points}</strong></td>
        <td><div class="form-row">${buildFormIcons(team.form)}</div></td>
        <td class="next-match">vs ${team.nextOpponent}</td>
      </tr>`;
  }

  function buildWinRateRow(team) {
    const diffClass = team.goalDiff > 0 ? 'diff-plus' : team.goalDiff < 0 ? 'diff-minus' : '';
    return `
      <tr>
        <td class="col-sticky col-sticky-rank">${team.rank}</td>
        <td class="col-sticky col-sticky-team team-name">${team.name}</td>
        <td>${team.played}</td>
        <td>${team.win}</td>
        <td>${team.loss}</td>
        <td>${team.scored}</td>
        <td>${team.conceded}</td>
        <td class="${diffClass}">${formatGoalDiff(team.goalDiff)}</td>
        <td><strong>${team.winRate}</strong></td>
        <td><div class="form-row">${buildFormIcons(team.form)}</div></td>
        <td class="next-match">vs ${team.nextOpponent}</td>
      </tr>`;
  }

  function renderStandingsTable() {
    if (!standingsTableWrap) return;

    const { sport, league } = MatchUpTabs.getState();
    const leagueName = MatchUpTabs.getLeagueName();
    const teams = (STANDINGS_DATA[sport] && STANDINGS_DATA[sport][league]) || [];
    const withPoints = usesPointsColumns(sport);

    if (teams.length === 0) {
      standingsTableWrap.innerHTML = `
        <div class="empty-matches">
          <p>순위 데이터가 없습니다.</p>
        </div>`;
      return;
    }

    const headPoints = `
      <th class="col-sticky col-sticky-rank">순위</th>
      <th class="col-sticky col-sticky-team">팀</th>
      <th>경기</th>
      <th>승</th>
      <th>무</th>
      <th>패</th>
      <th>득점</th>
      <th>실점</th>
      <th>득실</th>
      <th>승점</th>
      <th>최근5</th>
      <th>다음경기</th>`;

    const headWinRate = `
      <th class="col-sticky col-sticky-rank">순위</th>
      <th class="col-sticky col-sticky-team">팀</th>
      <th>경기</th>
      <th>승</th>
      <th>패</th>
      <th>득점</th>
      <th>실점</th>
      <th>득실</th>
      <th>승률</th>
      <th>최근5</th>
      <th>다음경기</th>`;

    standingsTableWrap.innerHTML = `
      <table class="standings-table">
        <caption class="sr-only">${leagueName} 순위표 (${teams.length}팀)</caption>
        <thead>
          <tr>${withPoints ? headPoints : headWinRate}</tr>
        </thead>
        <tbody>
          ${teams.map((t) => (withPoints ? buildPointsRow(t) : buildWinRateRow(t))).join('')}
        </tbody>
      </table>`;
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
