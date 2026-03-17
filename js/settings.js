(function () {
  'use strict';

  const app = window.AdShieldApp;
  if (!app) return;

  const form = document.getElementById('settingsForm');
  if (!form) return;

  const fields = {
    language: document.getElementById('language'),
    voice: document.getElementById('voice'),
    volume: document.getElementById('volume'),
    fontFamily: document.getElementById('fontFamily'),
    fontColor: document.getElementById('fontColor'),
    fontSize: document.getElementById('fontSize'),
    bgColor: document.getElementById('bgColor'),
    highContrast: document.getElementById('highContrast'),
    push: document.getElementById('push'),
    tracking: document.getElementById('tracking'),
    socialIcons: document.getElementById('socialIcons'),
    distractions: document.getElementById('distractions'),
    email: document.getElementById('email'),
    facebook: document.getElementById('facebook'),
    twitter: document.getElementById('twitter')
  };

  const outputs = {
    volume: document.getElementById('volumeValue'),
    fontSize: document.getElementById('fontSizeValue')
  };

  const errors = {
    email: document.getElementById('emailError'),
    facebook: document.getElementById('facebookError'),
    twitter: document.getElementById('twitterError')
  };

  function setOutputValues() {
    outputs.volume.textContent = `${fields.volume.value}%`;
    outputs.fontSize.textContent = `${fields.fontSize.value}px`;
  }

  function populateForm() {
    const settings = app.loadSettings();
    fields.language.value = settings.language;
    fields.voice.value = settings.voice;
    fields.volume.value = String(settings.volume);
    fields.fontFamily.value = settings.fontFamily;
    fields.fontColor.value = settings.fontColor;
    fields.fontSize.value = String(settings.fontSize);
    fields.bgColor.value = settings.bgColor;
    fields.highContrast.checked = Boolean(settings.highContrast);
    fields.push.checked = Boolean(settings.push);
    fields.tracking.checked = Boolean(settings.tracking);
    fields.socialIcons.checked = Boolean(settings.socialIcons);
    fields.distractions.checked = Boolean(settings.distractions);
    fields.email.value = settings.email || '';
    fields.facebook.value = settings.facebook || '';
    fields.twitter.value = settings.twitter || '';
    setOutputValues();
  }

  function getFormData() {
    return {
      language: fields.language.value,
      voice: fields.voice.value,
      volume: Number(fields.volume.value),
      fontFamily: fields.fontFamily.value,
      fontColor: fields.fontColor.value,
      fontSize: Number(fields.fontSize.value),
      bgColor: fields.bgColor.value,
      highContrast: fields.highContrast.checked,
      push: fields.push.checked,
      tracking: fields.tracking.checked,
      socialIcons: fields.socialIcons.checked,
      distractions: fields.distractions.checked,
      email: fields.email.value.trim(),
      facebook: fields.facebook.value.trim(),
      twitter: fields.twitter.value.trim()
    };
  }

  function showError(field, node, message) {
    field.classList.add('input-invalid');
    field.setAttribute('aria-invalid', 'true');
    node.hidden = false;
    node.textContent = message;
  }

  function clearError(field, node) {
    field.classList.remove('input-invalid');
    field.removeAttribute('aria-invalid');
    node.hidden = true;
    node.textContent = '';
  }

  function isValidUrl(value) {
    if (!value) return true;
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  function validate() {
    let valid = true;

    if (fields.email.value && !fields.email.validity.valid) {
      showError(fields.email, errors.email, 'Informe um e-mail válido para contato.');
      valid = false;
    } else {
      clearError(fields.email, errors.email);
    }

    if (!isValidUrl(fields.facebook.value)) {
      showError(fields.facebook, errors.facebook, 'Informe uma URL válida iniciando com http:// ou https://.');
      valid = false;
    } else {
      clearError(fields.facebook, errors.facebook);
    }

    if (!isValidUrl(fields.twitter.value)) {
      showError(fields.twitter, errors.twitter, 'Informe uma URL válida iniciando com http:// ou https://.');
      valid = false;
    } else {
      clearError(fields.twitter, errors.twitter);
    }

    return valid;
  }

  function persistAndApply(announceMessage = false) {
    const data = getFormData();
    app.saveSettings(data);
    app.applySettings(data);
    if (announceMessage) {
      app.announce('Configurações salvas com sucesso.');
    }
  }

  function bindLivePreview() {
    ['language', 'voice', 'fontFamily', 'fontColor', 'bgColor'].forEach((key) => {
      fields[key].addEventListener('change', persistAndApply);
    });

    ['push', 'tracking', 'socialIcons', 'distractions', 'highContrast'].forEach((key) => {
      fields[key].addEventListener('change', () => {
        persistAndApply();
        if (key === 'highContrast') {
          app.announce(fields.highContrast.checked ? 'Modo de alto contraste ativado.' : 'Modo de alto contraste desativado.');
        }
      });
    });

    ['volume', 'fontSize'].forEach((key) => {
      fields[key].addEventListener('input', () => {
        setOutputValues();
        persistAndApply();
      });
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!validate()) {
      app.announce('Existem erros no formulário. Revise os campos destacados.', 'alert');
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    persistAndApply(true);
  });

  populateForm();
  bindLivePreview();
})();
