document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('click', (e) => {
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    const targetItem = e.currentTarget;
    targetItem.classList.add('active');
    document.getElementById(targetItem.dataset.target).classList.add('active');
  });
});

const extensionApi = typeof browser === 'object' ? browser : typeof chrome === 'object' ? chrome : null;
const storage = extensionApi?.storage?.local ?? null;
const runtime = extensionApi?.runtime ?? null;
const saveButton = document.getElementById('saveBtn');
const toggleButtons = document.querySelectorAll('.toggle-button');
const settings = ['blockNative', 'blockTrackers', 'blockEasyList', 'blockEasyPrivacy', 'blockForms', 'strictMode', 'fontSize', 'darkMode', 'highContrast'];
const defaultSettings = { blockNative: false, blockTrackers: false, blockEasyList: true, blockEasyPrivacy: true, blockForms: true, strictMode: false, fontSize: 3, darkMode: false, highContrast: false };
let pendingSettings = { ...defaultSettings };

function setToggleUI(setting, value) {
  document.querySelectorAll(`.toggle-button[data-setting="${setting}"]`).forEach(btn => {
    const buttonValue = btn.dataset.value;
    const isMatch = setting === 'fontSize'
      ? buttonValue === String(value)
      : buttonValue === 'true'
        ? value === true
        : buttonValue === 'false'
          ? value === false
          : false;
    btn.classList.toggle('active', isMatch);
    btn.classList.toggle('on', setting !== 'fontSize' && buttonValue === 'true' && value === true);
    btn.classList.toggle('off', setting !== 'fontSize' && buttonValue === 'false' && value === false);
  });
}

function applyAccessibility(settingsValues) {
  document.body.classList.remove('font-size-1', 'font-size-2', 'font-size-3', 'font-size-4', 'font-size-5', 'dark-mode', 'high-contrast');
  document.body.classList.add(`font-size-${settingsValues.fontSize}`);
  document.body.classList.toggle('dark-mode', settingsValues.darkMode);
  document.body.classList.toggle('high-contrast', settingsValues.highContrast);
}

function applyPendingUI() {
  settings.forEach(setting => setToggleUI(setting, pendingSettings[setting]));
  applyAccessibility(pendingSettings);
}

function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s ease forwards';
  }, 2200);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

function setSaveButtonState(enabled) {
  saveButton.disabled = !enabled;
  saveButton.classList.toggle('active', enabled);
  saveButton.textContent = enabled ? 'Salvar alterações' : 'Alterações salvas';
}

storage.get(defaultSettings).then(res => {
  pendingSettings = { ...res };
  applyPendingUI();
  setSaveButtonState(false);
}).catch(() => {
  console.error('Não foi possível acessar storage.local');
});

toggleButtons.forEach(button => {
  button.addEventListener('click', () => {
    const setting = button.dataset.setting;
    const value = setting === 'fontSize' ? Number(button.dataset.value) : button.dataset.value === 'true';
    pendingSettings[setting] = value;
    setToggleUI(setting, value);

    if (['fontSize', 'darkMode', 'highContrast'].includes(setting)) {
      applyAccessibility(pendingSettings);
    }

    setSaveButtonState(true);
    showToast(`Opção '${setting}' alterada`, 'warning');
  });
});

saveButton.addEventListener('click', () => {
  storage.set(pendingSettings).then(() => {
    setSaveButtonState(false);
    showToast('Alterações salvas com sucesso', 'success');
  }).catch(() => {
    console.error('Falha ao salvar configurações');
    showToast('Erro ao salvar configurações', 'warning');
  });
});