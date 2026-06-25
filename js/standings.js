/**
 * MatchUp LAB - 리그순위 페이지
 */

(function () {
  'use strict';

  const standingsTableWrap = document.getElementById('standings-table-wrap');
  let currentLeagueKey = null;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getDisplayTeamName(name) {
    const full =
      typeof normalizeTeamName === 'function'
        ? normalizeTeamName(name, currentLeagueKey)
        : name;
    const short = typeof shortenTeamName === 'function' ? shortenTeamName(full) : full;
    return { full, short };
  }

  function buildTeamNameCell(name) {
    const { full, short } = getDisplayTeamName(name);
    const titleAttr = full !== short ? ` title="${escapeHtml(full)}"` : '';
    return `<td class="col-sticky col-sticky-team team-name"${titleAttr}>${escapeHtml(short)}</td>`;
  }

  function usesFootballColumns(sport) {
    return sport === 'football';
  }

  function isBasketball(sport) {
    return sport === 'basketball';
  }

  function isVolleyball(sport) {
    return sport === 'volleyball';
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
      if (league === 'mlb') return [];
      if (subLeague && leagueData[subLeague]) return leagueData[subLeague];
      return [];
    }

    if (sport === 'basketball' && league === 'nba') {
      const allTeams = STANDINGS_DATA.basketball.nba || [];
      if (!subLeague || !NBA_CONFERENCES[subLeague]) {
        return [];
      }
      const confNames = NBA_CONFERENCES[subLeague];
      const filtered = allTeams
        .filter((t) => confNames.includes(t.name))
        .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
      return filtered.map((t, i) => ({ ...t, rank: i + 1 }));
    }

    return STANDINGS_DATA[sport][league] || [];
  }

  function getMlbStandingsSections(subLeague) {
    if (typeof MLB_STANDINGS_SECTIONS === 'undefined' || !subLeague) return [];
    return MLB_STANDINGS_SECTIONS[subLeague] || [];
  }

  function buildBaseballTableHtml(teams, showDraw, caption) {
    const tableClass = showDraw
      ? 'standings-table standings-table--baseball'
      : 'standings-table standings-table--baseball standings-table--mlb';

    return `
      <table class="${tableClass}">
        <caption class="sr-only">${caption}</caption>
        <thead>
          <tr>${buildBaseballHead(showDraw)}</tr>
        </thead>
        <tbody>
          ${teams.map((t) => buildBaseballRow(t, showDraw)).join('')}
        </tbody>
      </table>`;
  }

  function renderMlbStackedStandings(subLeague, leagueName) {
    const sections = getMlbStandingsSections(subLeague);
    const leagueData = STANDINGS_DATA.baseball.mlb;
    if (!sections.length || !leagueData) {
      return '';
    }

    return sections
      .map((section) => {
        const teams = leagueData[section.id] || [];
        if (teams.length === 0) return '';

        return `
          <section class="standings-division-section">
            <div class="standings-division-card">
              <h3 class="standings-division-title">${section.title}</h3>
              <div class="standings-table-wrap standings-table-wrap--nested">
                ${buildBaseballTableHtml(teams, false, `${leagueName} ${section.title} (${teams.length}팀)`)}
              </div>
            </div>
          </section>`;
      })
      .join('');
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
        ${buildTeamNameCell(team.name)}
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
        ${buildTeamNameCell(team.name)}
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

  function buildKoreanBasketballHead() {
    return `
      <th class="col-sticky col-sticky-rank">순위</th>
      <th class="col-sticky col-sticky-team">팀</th>
      <th>승률</th>
      <th>경기</th>
      <th>승</th>
      <th>패</th>
      <th>게임차</th>
      <th>연속</th>
      <th>최근5</th>`;
  }

  function buildKoreanBasketballRow(team) {
    return `
      <tr>
        <td class="col-sticky col-sticky-rank">${team.rank}</td>
        ${buildTeamNameCell(team.name)}
        <td><strong>${team.winRate}</strong></td>
        <td>${team.played}</td>
        <td>${team.win}</td>
        <td>${team.loss}</td>
        <td>${formatGamesBack(team)}</td>
        <td>${team.streak}</td>
        <td><div class="form-row">${buildFormIcons(team.form)}</div></td>
      </tr>`;
  }

  function buildNbaBasketballHead() {
    return `
      <th class="col-sticky col-sticky-rank">순위</th>
      <th class="col-sticky col-sticky-team">팀</th>
      <th>승률</th>
      <th>경기</th>
      <th>승</th>
      <th>패</th>
      <th>게임차</th>
      <th>연속</th>
      <th>홈성적</th>
      <th>원정성적</th>
      <th>디비전</th>
      <th>디비전성적</th>
      <th>최근5</th>`;
  }

  function buildNbaBasketballRow(team) {
    return `
      <tr>
        <td class="col-sticky col-sticky-rank">${team.rank}</td>
        ${buildTeamNameCell(team.name)}
        <td><strong>${team.winRate}</strong></td>
        <td>${team.played}</td>
        <td>${team.win}</td>
        <td>${team.loss}</td>
        <td>${formatGamesBack(team)}</td>
        <td>${team.streak}</td>
        <td>${team.homeRecord}</td>
        <td>${team.awayRecord}</td>
        <td>${team.division}</td>
        <td>${team.divisionRecord}</td>
        <td><div class="form-row">${buildFormIcons(team.form)}</div></td>
      </tr>`;
  }

  function buildVolleyballHead() {
    return `
      <th class="col-sticky col-sticky-rank">순위</th>
      <th class="col-sticky col-sticky-team">팀</th>
      <th>승점</th>
      <th>경기</th>
      <th>승</th>
      <th>패</th>
      <th>세트득실률</th>
      <th>점수득실률</th>
      <th>최근5</th>`;
  }

  function buildVolleyballRow(team) {
    return `
      <tr>
        <td class="col-sticky col-sticky-rank">${team.rank}</td>
        ${buildTeamNameCell(team.name)}
        <td><strong>${team.points}</strong></td>
        <td>${team.played}</td>
        <td>${team.win}</td>
        <td>${team.loss}</td>
        <td>${team.setRatio}</td>
        <td>${team.pointRatio}</td>
        <td><div class="form-row">${buildFormIcons(team.form)}</div></td>
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
        ${buildTeamNameCell(team.name)}
        <td>${team.winRate}</td>
        <td class="${gbClass}">${formatGamesBack(team)}</td>
        <td>${team.win}</td>
        ${drawCell}
        <td>${team.loss}</td>
        <td>${team.played}</td>
        <td>${team.streak}</td>
        <td><div class="form-row">${buildFormIcons(team.form)}</div></td>
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
      <th>최근5</th>`;
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
    currentLeagueKey = league;
    const leagueName = MatchUpTabs.getLeagueName();
    const teams = getStandingsTeams(sport, league, subLeague);
    const football = usesFootballColumns(sport);
    const baseball = isBaseball(sport);
    const basketball = isBasketball(sport);
    const volleyball = isVolleyball(sport);

    if (baseball && league === 'mlb') {
      const mlbHtml = renderMlbStackedStandings(subLeague, leagueName);
      if (!mlbHtml) {
        standingsTableWrap.innerHTML = `
          <div class="empty-matches">
            <p>순위 데이터가 없습니다.</p>
          </div>`;
        return;
      }

      standingsTableWrap.innerHTML = `<div class="standings-mlb-stack">${mlbHtml}</div>`;
      return;
    }

    if (teams.length === 0) {
      standingsTableWrap.innerHTML = `
        <div class="empty-matches">
          <p>순위 데이터가 없습니다.</p>
        </div>`;
      return;
    }

    if (baseball) {
      const showDraw = league !== 'mlb';
      const npbLegend = league === 'npb' ? buildNpbLegend() : '';

      standingsTableWrap.innerHTML = `
        ${npbLegend}
        <div class="standings-table-wrap">
          ${buildBaseballTableHtml(teams, showDraw, `${leagueName} 순위표 (${teams.length}팀)`)}
        </div>`;
      return;
    }

    if (volleyball) {
      standingsTableWrap.innerHTML = `
        <table class="standings-table standings-table--volleyball">
          <caption class="sr-only">${leagueName} 순위표 (${teams.length}팀)</caption>
          <thead>
            <tr>${buildVolleyballHead()}</tr>
          </thead>
          <tbody>
            ${teams.map((t) => buildVolleyballRow(t)).join('')}
          </tbody>
        </table>`;
      return;
    }

    if (basketball) {
      const isNba = league === 'nba';
      const tableClass = isNba
        ? 'standings-table standings-table--basketball-nba'
        : 'standings-table standings-table--basketball-kor';
      const head = isNba ? buildNbaBasketballHead() : buildKoreanBasketballHead();
      const rowBuilder = isNba ? buildNbaBasketballRow : buildKoreanBasketballRow;

      standingsTableWrap.innerHTML = `
        <table class="${tableClass}">
          <caption class="sr-only">${leagueName} 순위표 (${teams.length}팀)</caption>
          <thead>
            <tr>${head}</tr>
          </thead>
          <tbody>
            ${teams.map((t) => rowBuilder(t)).join('')}
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
      <table class="standings-table standings-table--football">
        <caption class="sr-only">${leagueName} 순위표 (${teams.length}팀)</caption>
        <thead>
          <tr>${football ? headPoints : headWinRate}</tr>
        </thead>
        <tbody>
          ${teams.map((t) => (football ? buildPointsRow(t) : buildWinRateRow(t))).join('')}
        </tbody>
      </table>`;
  }

  function showLoading() {
    if (!standingsTableWrap) return;
    standingsTableWrap.innerHTML = `
      <div class="standings-loading" role="status" aria-live="polite">
        <p>데이터를 불러오는 중...</p>
      </div>`;
  }

  async function init() {
    showLoading();

    if (typeof MatchUpStandingsLoader !== 'undefined') {
      await MatchUpStandingsLoader.load();
    }

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
