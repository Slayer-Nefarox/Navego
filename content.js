const FORM_KEYWORDS = [
  'visa',
  'mastercard',
  'amex',
  'card',
  'cc',
  'cvv',
  'cvc',
  'payment',
  'billing',
  'checkout'
];

function fieldMatchesKeyword(field) {
  const text = [
    field.name,
    field.id,
    field.type,
    field.placeholder,
    field.title,
    field.getAttribute('aria-label'),
    field.className
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (FORM_KEYWORDS.some(keyword => text.includes(keyword))) {
    return true;
  }

  const label = document.querySelector(`label[for="${CSS.escape(field.id || '')}"]`);
  if (label && FORM_KEYWORDS.some(keyword => label.textContent.toLowerCase().includes(keyword))) {
    return true;
  }

  const parentLabel = field.closest('label');
  return parentLabel && FORM_KEYWORDS.some(keyword => parentLabel.textContent.toLowerCase().includes(keyword));
}

function matchesForm(form) {
  const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
  return inputs.some(field => fieldMatchesKeyword(field));
}

function disableForm(form) {
  const rect = form.getBoundingClientRect();
  form.querySelectorAll('input, select, textarea, button, a').forEach(el => {
    el.disabled = true;
    el.tabIndex = -1;
    el.style.pointerEvents = 'none';
  });

  form.style.filter = 'grayscale(100%) opacity(0.6)';
  form.style.position = form.style.position || 'relative';

  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(240,240,240,0.95)';
  overlay.style.color = '#333';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.textAlign = 'center';
  overlay.style.padding = '20px';
  overlay.style.zIndex = '9999';
  overlay.style.fontFamily = 'sans-serif';
  overlay.style.lineHeight = '1.5';

  const message = document.createElement('div');
  message.textContent = 'bloqueado por navego';
  message.style.fontSize = '18px';
  message.style.fontWeight = '700';
  message.style.marginBottom = '10px';

  const link = document.createElement('a');
  link.textContent = 'Voltar à página anterior';
  link.href = '#';
  link.style.color = '#1E88E5';
  link.style.textDecoration = 'underline';
  link.style.fontSize = '15px';
  link.addEventListener('click', (event) => {
    event.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
    } else if (document.referrer) {
      window.location.href = document.referrer;
    } else {
      window.location.href = 'about:blank';
    }
  });

  overlay.appendChild(message);
  overlay.appendChild(link);
  form.appendChild(overlay);
}

function blockPaymentForms() {
  const forms = Array.from(document.querySelectorAll('form'));
  forms.forEach(form => {
    if (matchesForm(form)) {
      disableForm(form);
    }
  });
}

function blockAllForms() {
  const forms = Array.from(document.querySelectorAll('form'));
  forms.forEach(form => {
    disableForm(form);
  });
}

browser.storage.local.get({ blockForms: true, strictMode: false }).then(res => {
  if (res.strictMode) {
    blockAllForms();
    return;
  }

  if (res.blockForms) {
    blockPaymentForms();
  }
});
