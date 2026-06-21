/**
 * MatchUp LAB - 리그순위 페이지
 */

(function () {
  'use strict';

  const standingsTableWrap = document.getElementById('standings-table-wrap');

  function usesPointsColumns(sport) {
    return sport === 'football' || sport === 'volleyball';
  }

  function isBaseball(sport) {
    return sport === 'baseball';
  }

  function getStandingsTeams(sport, league, subLeague) {
    if (!STANDINGS_DATA[sport]) return [];

    if (sport === 'baseball') {
      const leagueData = STANDINGS_DATA.baseball[league];
      if (!leagueData) return [];
      if (league === 'kbo') return leagueData;
      if (subLeague && leagueData[subLeague]) return leagueData[subLeague];
      return [];
    }

    if (sport === 'basketball' && league === 'nba') {
      const allTeams = STANDINGS_DATA.basketball.nba || [];
      if (!subLeague || subLeague === 'all') return allTeams;
      if (typeof NBA_CONFERENCES === 'undefined' || !NBA_CONFERENCES[subLeague]) {
        return allTeams;
      }
      const confNames = NBA_CONFERENCES[subLeague];
      const filtered = allTeams
        .filter((t) => confNames.includes(t.name))
        .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
      return filtered.map((t, i) => ({ ...t, rank: i + 1 }));
    }

    return STANDINGS_DATA[sport][league] || [];
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

  function formatGamesBack(team) {
    const gb = team.gamesBack;
    if (gb === '0.0' || gb === 0 || gb === '0') return '0.0';
    if (typeof gb === 'string' && (gb.startsWith('+') || gb.startsWith('-'))) return gb;
    const num = parseFloat(gb);
    if (team.isWildCard && num > 0) return `+${num.toFixed(1)}`;
    return num.toFixed(1);
  }

  function formatNextMatch(team) {
    if (team.nextMatchPending) return '추후 연동';
    if (!team.nextOpponent) return '-';
    return `vs ${team.nextOpponent}`;
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
        <td class="next-match">${formatNextMatch(team)}</td>
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
        <td class="next-match">${formatNextMatch(team)}</td>
      </tr>`;
  }

  function buildBaseballRow(team, showDraw) {
    const gbClass =
      team.isWildCard && typeof team.gamesBack === 'string' && team.gamesBack.startsWith('+')
        ? 'gb-plus'
        : team.isWildCard && typeof team.gamesBack === 'string' && team.gamesBack.startsWith('-')
          ? 'gb-minus'
          : '';
    const drawCell = showDraw ? `<td>${team.draw}</td>` : '';

    return `
      <tr>
        <td class="col-sticky col-sticky-rank">${team.rank}</td>
        <td class="col-sticky col-sticky-team team-name">${team.name}</td>
        <td>${team.winRate}</td>
        <td class="${gbClass}">${formatGamesBack(team)}</td>
        <td>${team.win}</td>
        ${drawCell}
        <td>${team.loss}</td>
        <td>${team.played}</td>
        <td>${team.streak}</td>
        <td>${team.battingAvg}</td>
        <td>${team.era}</td>
        <td><div class="form-row">${buildFormIcons(team.form)}</div></td>
        <td class="next-match">${formatNextMatch(team)}</td>
      </tr>`;
  }

  function buildBaseballHead(showDraw) {
    const drawCol = showDraw ? '<th>무</th>' : '';
    return `
      <th class="col-sticky col-sticky-rank">순위</th>
      <th class="col-sticky col-sticky-team">팀</th>
      <th>승률</th>
      <th>게임차</th>
      <th>승</th>
      ${drawCol}
      <th>패</th>
      <th>경기</th>
      <th>연속</th>
      <th>타율</th>
      <th>평균자책</th>
      <th>최근5</th>
      <th>다음경기</th>`;
  }

  function buildNpbLegend() {
    return `
      <div class="npb-standings-legend">
        <span class="npb-legend-item npb-legend-final">클라이맥스시리즈 파이널 스테이지 진출</span>
        <span class="npb-legend-item npb-legend-first">클라이맥스시리즈 퍼스트 스테이지 진출</span>
      </div>`;
  }

  function renderStandingsTable() {
    if (!standingsTableWrap) return;

    const { sport, league, subLeague } = MatchUpTabs.getState();
    const leagueName = MatchUpTabs.getLeagueName();
    const teams = getStandingsTeams(sport, league, subLeague);
    const withPoints = usesPointsColumns(sport);
    const baseball = isBaseball(sport);

    if (teams.length === 0) {
      standingsTableWrap.innerHTML = `
        <div class="empty-matches">
          <p>순위 데이터가 없습니다.</p>
        </div>`;
      return;
    }

    if (baseball) {
      const showDraw = league !== 'mlb';
      const tableClass = showDraw ? 'standings-table standings-table--baseball' : 'standings-table standings-table--baseball standings-table--mlb';
      const npbLegend = league === 'npb' ? buildNpbLegend() : '';

      standingsTableWrap.innerHTML = `
        ${npbLegend}
        <table class="${tableClass}">
          <caption class="sr-only">${leagueName} 순위표 (${teams.length}팀)</caption>
          <thead>
            <tr>${buildBaseballHead(showDraw)}</tr>
          </thead>
          <tbody>
            ${teams.map((t) => buildBaseballRow(t, showDraw)).join('')}
          </tbody>
        </table>`;
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
