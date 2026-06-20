/**
 * MatchUp LAB - 공통 헤더 (GNB + 종목/리그 탭)
 * 모든 페이지에서 재사용
 */

const MatchUpTabs = (function () {
  'use strict';

  let currentSport = 'football';
  let currentLeague = 'kLeague';
  let onChangeCallback = null;

  const sportTabsEl = () => document.getElementById('sport-tabs');
  const leagueSubtabsEl = () => document.getElementById('league-subtabs');
  const gnbToggle = () => document.getElementById('gnb-toggle');
  const gnbMenu = () => document.getElementById('gnb-menu');

  function notifyChange() {
    if (onChangeCallback) {
      onChangeCallback(currentSport, currentLeague);
    }
  }

  function initGnb() {
    const toggle = gnbToggle();
    const menu = gnbMenu();
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
      });
    });
  }

  function renderSportTabs() {
    const el = sportTabsEl();
    if (!el) return;

    el.innerHTML = SPORT_TABS.map(
      (tab) =>
        `<button class="sport-tab${tab.id === currentSport ? ' active' : ''}" data-sport="${tab.id}">${tab.label}</button>`
    ).join('');

    el.querySelectorAll('.sport-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectSport(btn.dataset.sport);
      });
    });
  }

  function selectSport(sportId) {
    currentSport = sportId;
    const tabMeta = SPORT_TABS.find((t) => t.id === sportId);
    currentLeague = tabMeta
      ? tabMeta.defaultLeague
      : Object.keys(SPORTS_DATA[sportId].leagues)[0];

    renderSportTabs();
    renderLeagueSubtabs();
    notifyChange();
  }

  function renderLeagueSubtabs() {
    const el = leagueSubtabsEl();
    if (!el) return;

    const sportData = SPORTS_DATA[currentSport];
    const leagues = sportData.leagues;
    const leagueKeys = Object.keys(leagues);

    el.classList.remove('hidden');

    el.innerHTML = leagueKeys
      .map((key) => {
        const league = leagues[key];
        return `<button class="league-tab${key === currentLeague ? ' active' : ''}" data-league="${key}">${league.name}</button>`;
      })
      .join('');

    el.querySelectorAll('.league-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentLeague = btn.dataset.league;
        renderLeagueSubtabs();
        notifyChange();
      });
    });
  }

  function init(options) {
    onChangeCallback = options && options.onChange ? options.onChange : null;
    initGnb();
    renderSportTabs();
    renderLeagueSubtabs();
    notifyChange();
  }

  function getState() {
    return { sport: currentSport, league: currentLeague };
  }

  function getLeagueName() {
    const league = SPORTS_DATA[currentSport].leagues[currentLeague];
    return league ? league.name : '';
  }

  function hasDraw() {
    return SPORTS_DATA[currentSport].hasDraw;
  }

  return {
    init,
    getState,
    getLeagueName,
    hasDraw,
  };
})();
