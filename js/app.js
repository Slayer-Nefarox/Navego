(function () {
  'use strict';

  const STORAGE_KEY = 'adshieldSettings';
  const COUNT_KEY = 'adshieldBlockedCount';
  const defaults = {
    language: 'pt-BR',
    voice: 'padrao',
    volume: 70,
    fontFamily: 'system-ui',
    fontColor: '#1d1d1f',
    fontSize: 18,
    bgColor: '#f4f4f4',
    highContrast: false,
    push: true,
    tracking: true,
    socialIcons: true,
    distractions: true,
    email: '',
    facebook: '',
    twitter: ''
  };

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return { ...defaults, ...saved };
    } catch (error) {
      return { ...defaults };
    }
  }

  function saveSettings(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getCount() {
    const stored = Number(localStorage.getItem(COUNT_KEY));
    return Number.isFinite(stored) && stored >= 0 ? stored : 0;
  }

  function setCount(value) {
    localStorage.setItem(COUNT_KEY, String(value));
  }

  function announce(message, type = 'status') {
    const node = document.getElementById(type === 'alert' ? 'liveAlert' : 'liveStatus');
    if (!node) return;
    node.textContent = '';
    window.setTimeout(() => {
      node.textContent = message;
    }, 50);
  }

  function applySettings(settings) {
    const root = document.documentElement;
    root.lang = settings.language || 'pt-BR';
    root.style.setProperty('--font-family-base', settings.fontFamily);
    root.style.setProperty('--font-size-base', `${settings.fontSize}px`);
    root.style.setProperty('--text', settings.fontColor);
    root.style.setProperty('--bg', settings.bgColor);
    document.body.classList.toggle('high-contrast', Boolean(settings.highContrast));
  }

  function updateHomeCount() {
    const counter = document.getElementById('blockedCount');
    if (counter) {
      counter.value = String(getCount());
      counter.textContent = String(getCount());
    }
  }

  function incrementCount(step = 1) {
    const value = getCount() + step;
    setCount(value);
    updateHomeCount();
    announce(`Contador atualizado. ${value} anúncios bloqueados.`);
  }

  function resetCount() {
    setCount(0);
    updateHomeCount();
    announce('Contador reiniciado para zero.', 'alert');
  }

  function bindHomeActions() {
    const simulateButton = document.getElementById('simulateBlock');
    const resetButton = document.getElementById('resetCounter');

    if (simulateButton) {
      simulateButton.addEventListener('click', () => incrementCount(1));
    }

    if (resetButton) {
      resetButton.addEventListener('click', resetCount);
    }
  }

  function bindGlobalShortcuts() {
    document.addEventListener('keydown', (event) => {
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      const isTyping = /INPUT|TEXTAREA|SELECT/.test(tag);
      if (!event.altKey || isTyping) return;

      const key = event.key.toLowerCase();
      if (key === '1') {
        window.location.href = 'index.html';
      } else if (key === '2') {
        window.location.href = 'settings.html';
      } else if (document.body.dataset.page === 'home' && key === 'b') {
        event.preventDefault();
        incrementCount(1);
      } else if (document.body.dataset.page === 'home' && key === 'r') {
        event.preventDefault();
        resetCount();
      }
    });
  }

  function init() {
    applySettings(loadSettings());
    updateHomeCount();
    bindHomeActions();
    bindGlobalShortcuts();

    window.AdShieldApp = {
      loadSettings,
      saveSettings,
      applySettings,
      announce,
      getCount,
      setCount,
      updateHomeCount
    };
  }

  init();
})();
