const toggleButton = document.getElementById('toggleBtn');
const toggleIcon = toggleButton.querySelector('img');
const settingsBtn = document.getElementById('settingsBtn');
const confirmationOverlay = document.getElementById('confirmationOverlay');
const confirmDisableBtn = document.getElementById('confirmDisableBtn');
const cancelDisableBtn = document.getElementById('cancelDisableBtn');
const images = {
  on: '../Images/ligado.png',
  off: '../Images/desligado.png'
};
const extensionApi = typeof browser === 'object' ? browser : typeof chrome === 'object' ? chrome : null;
const storage = extensionApi?.storage?.local ?? null;
const runtime = extensionApi?.runtime ?? null;

function updateToggle(enabled) {
  toggleIcon.src = enabled ? images.on : images.off;
  toggleIcon.alt = enabled ? 'Proteção ligada' : 'Proteção desligada';
  toggleButton.dataset.state = enabled ? 'on' : 'off';
  toggleButton.classList.toggle('state-on', enabled);
  toggleButton.classList.toggle('state-off', !enabled);
}

function applyAccessibility({ fontSize, darkMode, highContrast }) {
  document.body.classList.remove('font-size-1', 'font-size-2', 'font-size-3', 'font-size-4', 'font-size-5', 'dark-mode', 'high-contrast');
  document.body.classList.add(`font-size-${fontSize}`);
  document.body.classList.toggle('dark-mode', darkMode);
  document.body.classList.toggle('high-contrast', highContrast);
}

function closeConfirmation() {
  confirmationOverlay.classList.add('hidden');
  confirmationOverlay.setAttribute('aria-hidden', 'true');
}

function openConfirmation() {
  confirmationOverlay.classList.remove('hidden');
  confirmationOverlay.setAttribute('aria-hidden', 'false');
}

function setEnabled(enabled) {
  if (storage) {
    storage.set({ enabled }).catch(() => {
      console.error('Falha ao salvar estado do toggle');
    });
  }
  updateToggle(enabled);
  closeConfirmation();
}

if (storage) {
  storage.get({ enabled: true, fontSize: 3, darkMode: false, highContrast: false }).then(res => {
    updateToggle(res.enabled);
    applyAccessibility(res);
  }).catch(() => {
    console.error('Storage API não disponível');
  });
}

toggleButton.addEventListener('click', () => {
  if (toggleButton.dataset.state === 'on') {
    openConfirmation();
    return;
  }

  setEnabled(true);
});

confirmDisableBtn.addEventListener('click', () => {
  setEnabled(false);
});

cancelDisableBtn.addEventListener('click', () => {
  closeConfirmation();
});

settingsBtn.addEventListener('click', () => {
  if (runtime?.openOptionsPage) {
    runtime.openOptionsPage();
  } else if (runtime?.getURL) {
    window.open(runtime.getURL('options/options.html'));
  }
});