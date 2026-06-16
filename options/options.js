/* Inicializa a navegação das abas de opções */
const menuItems = document.querySelectorAll('.menu-item');
const sections = document.querySelectorAll('.section');

function activateSection(sectionId, persist = true) {
  menuItems.forEach(item => item.classList.toggle('active', item.dataset.target === sectionId));
  sections.forEach(section => section.classList.toggle('active', section.id === sectionId));

  if (persist && storage) {
    storage.set({ lastOptionsSection: sectionId, hasOpenedOptions: true }).catch(() => {
      console.error('Falha ao salvar a última seção aberta');
    });
  }
}

menuItems.forEach(item => {
  item.addEventListener('click', (e) => {
    activateSection(e.currentTarget.dataset.target);
  });
});

/* Detecta a API de extensão correta para Chrome ou Firefox */
const extensionApi = typeof browser === 'object' ? browser : typeof chrome === 'object' ? chrome : null;
const storage = extensionApi?.storage?.local ?? null;
const runtime = extensionApi?.runtime ?? null;
const saveButton = document.getElementById('saveBtn');
const toggleButtons = document.querySelectorAll('.toggle-button');
const settings = ['blockNative', 'blockTrackers', 'blockEasyList', 'blockEasyPrivacy', 'blockForms', 'strictMode', 'fontSize', 'darkMode', 'highContrast'];
const defaultSettings = { blockNative: true, blockTrackers: true, blockEasyList: false, blockEasyPrivacy: false, blockForms: true, strictMode: false, fontSize: 2, darkMode: false, highContrast: false };
const settingLabels = {
  blockNative: 'Bloquear anúncios nativos',
  blockTrackers: 'Bloquear rastreadores',
  blockEasyList: 'Bloquear listas de filtros online EasyList',
  blockEasyPrivacy: 'Bloquear listas de privacidade online EasyPrivacy',
  blockForms: 'Bloquear formulários de pagamento',
  strictMode: 'Modo rigoroso',
  fontSize: 'Tamanho da fonte',
  darkMode: 'Modo escuro',
  highContrast: 'Alto contraste'
};
let pendingSettings = { ...defaultSettings };

/* Atualiza o estado visual dos botões de toggle conforme o valor atual */
function getButtonLabel(setting, buttonValue) {
  const label = settingLabels[setting] ?? setting;

  if (setting === 'fontSize') {
    return `Selecionar ${label} ${buttonValue}`;
  }

  return `${buttonValue === 'true' ? 'Ligar' : 'Desligar'} ${label}`;
}

function getStateAnnouncement(setting, value) {
  const label = settingLabels[setting] ?? setting;

  if (setting === 'fontSize') {
    return `${label} alterado para ${value}.`;
  }

  return `${label} ${value ? 'ligado' : 'desligado'}.`;
}

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
    btn.setAttribute('aria-pressed', String(isMatch));
    btn.setAttribute('aria-label', getButtonLabel(setting, buttonValue));
  });
}

/* Aplica classes de acessibilidade para fonte, modo escuro e alto contraste */
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

/* Mostra notificações rápidas ao usuário sobre mudanças ou salvamentos */
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

/* Controla o estado habilitado/desabilitado do botão salvar */
function setSaveButtonState(enabled) {
  saveButton.disabled = !enabled;
  saveButton.classList.toggle('active', enabled);
  saveButton.textContent = enabled ? 'Salvar alterações' : 'Alterações salvas';
}

storage.get({ ...defaultSettings, hasOpenedOptions: false, lastOptionsSection: 'geral' }).then(res => {
  pendingSettings = { ...res };
  applyPendingUI();
  const firstOpenSection = res.hasOpenedOptions ? res.lastOptionsSection : 'acessibilidade';
  activateSection(firstOpenSection, false);
  if (!res.hasOpenedOptions) {
    storage.set({ hasOpenedOptions: true, lastOptionsSection: firstOpenSection }).catch(() => {
      console.error('Falha ao registrar a primeira abertura das opções');
    });
  }
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
    showToast(getStateAnnouncement(setting, value), 'warning');
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
