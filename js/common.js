/**
 * MatchUp LAB - 공통 헤더 (GNB + 종목/리그 탭)
 * 모든 페이지에서 재사용
 */

const MatchUpTabs = (function () {
  'use strict';

  let currentSport = 'football';
  let currentLeague = 'kLeague';
  let currentSubLeague = null;
  let onChangeCallback = null;

  const sportTabsEl = () => document.getElementById('sport-tabs');
  const leagueSubtabsEl = () => document.getElementById('league-subtabs');
  const divisionSubtabsEl = () => document.getElementById('division-subtabs');
  const gnbToggle = () => document.getElementById('gnb-toggle');
  const gnbMenu = () => document.getElementById('gnb-menu');

  function notifyChange() {
    if (onChangeCallback) {
      onChangeCallback(currentSport, currentLeague, currentSubLeague);
    }
  }

  function getSubTabsConfig() {
    if (typeof STANDINGS_SUB_TABS === 'undefined') return null;
    const sportTabs = STANDINGS_SUB_TABS[currentSport];
    if (!sportTabs) return null;
    return sportTabs[currentLeague] || null;
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
    currentSubLeague = null;

    renderSportTabs();
    renderLeagueSubtabs();
    renderDivisionSubtabs();
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
        currentSubLeague = null;
        renderLeagueSubtabs();
        renderDivisionSubtabs();
        notifyChange();
      });
    });
  }

  function renderDivisionSubtabs() {
    const el = divisionSubtabsEl();
    if (!el) return;

    const tabs = getSubTabsConfig();
    if (!tabs || tabs.length === 0) {
      el.classList.add('hidden');
      el.innerHTML = '';
      currentSubLeague = null;
      return;
    }

    el.classList.remove('hidden');

    if (!currentSubLeague || !tabs.some((t) => t.id === currentSubLeague)) {
      currentSubLeague = tabs[0].id;
    }

    el.innerHTML = tabs
      .map(
        (tab) =>
          `<button class="division-tab${tab.id === currentSubLeague ? ' active' : ''}" data-sub-league="${tab.id}">${tab.label}</button>`
      )
      .join('');

    el.querySelectorAll('.division-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentSubLeague = btn.dataset.subLeague;
        renderDivisionSubtabs();
        notifyChange();
      });
    });
  }

  function init(options) {
    onChangeCallback = options && options.onChange ? options.onChange : null;
    initGnb();
    renderSportTabs();
    renderLeagueSubtabs();
    renderDivisionSubtabs();
    notifyChange();
  }

  function getState() {
    return { sport: currentSport, league: currentLeague, subLeague: currentSubLeague };
  }

  function getLeagueName() {
    const league = SPORTS_DATA[currentSport].leagues[currentLeague];
    let name = league ? league.name : '';

    const subTabs = getSubTabsConfig();
    if (subTabs && currentSubLeague) {
      const sub = subTabs.find((t) => t.id === currentSubLeague);
      if (sub) name = `${name} ${sub.label}`;
    }

    return name;
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
