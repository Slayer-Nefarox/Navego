/* Palavras-chave usadas para detectar formulários de pagamento */
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

/* Palavras-chave usadas para detectar anúncios e banners */
const AD_KEYWORDS_REGEX = /\b(?:ad|ads|advert|advertising|banner|sponsor|sponsors|promo|promoc|publicidade|patrocinado|patrocinada|patrocinio)\b/i;
const AD_ELEMENT_SELECTORS = ['img', 'iframe', 'video', 'picture', 'div', 'section', 'aside', 'span', 'a'];

const extensionApi = typeof browser === 'object' ? browser : typeof chrome === 'object' ? chrome : null;
const storage = extensionApi?.storage?.local ?? null;

/* Verifica se um campo contém termos que sugerem formulário de pagamento */
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

/* Verifica se o formulário contém qualquer campo com palavras-chave de pagamento */
function matchesForm(form) {
  const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
  return inputs.some(field => fieldMatchesKeyword(field));
}

/* Desativa visualmente e funcionalmente o formulário detectado */
function disableForm(form) {
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

/* Bloqueia apenas formulários que parecem ser de pagamento */
function blockPaymentForms() {
  const forms = Array.from(document.querySelectorAll('form'));
  forms.forEach(form => {
    if (matchesForm(form)) {
      disableForm(form);
    }
  });
}

/* Bloqueia todos os formulários quando o modo rigoroso está ativo */
function blockAllForms() {
  const forms = Array.from(document.querySelectorAll('form'));
  forms.forEach(form => {
    disableForm(form);
  });
}

/* Retorna uma string com atributos relevantes do elemento para análise */
function getElementAttributesText(element) {
  const attributes = [
    element.id,
    element.className,
    element.getAttribute('alt'),
    element.getAttribute('title'),
    element.getAttribute('placeholder'),
    element.getAttribute('aria-label'),
    element.getAttribute('data-src'),
    element.getAttribute('data-image'),
    element.getAttribute('src'),
    element.getAttribute('srcset'),
    element.getAttribute('href')
  ].filter(Boolean);

  return attributes.join(' ').toLowerCase();
}

/* Determina se um elemento aparenta ser anúncio/banners */
function isAdElement(element) {
  if (!element || !element.tagName || element.dataset.navegoBlocked === 'true') {
    return false;
  }

  const elementText = getElementAttributesText(element);
  if (AD_KEYWORDS_REGEX.test(elementText)) {
    return true;
  }

  const visibleText = (element.textContent || '').toLowerCase();
  if (AD_KEYWORDS_REGEX.test(visibleText)) {
    return true;
  }

  const computedStyle = window.getComputedStyle(element);
  const backgroundImage = computedStyle.backgroundImage || '';
  if (backgroundImage && AD_KEYWORDS_REGEX.test(backgroundImage)) {
    return true;
  }

  if (['IMG', 'IFRAME', 'VIDEO', 'PICTURE'].includes(element.tagName)) {
    const src = (element.src || element.currentSrc || element.getAttribute('src') || '').toLowerCase();
    if (AD_KEYWORDS_REGEX.test(src) || src.includes('banner') || src.includes('.gif')) {
      return true;
    }
  }

  return false;
}

/* Oculta o elemento detectado como anúncio */
function hideAdElement(element) {
  element.dataset.navegoBlocked = 'true';
  element.style.setProperty('display', 'none', 'important');
  element.style.setProperty('visibility', 'hidden', 'important');
  element.style.setProperty('opacity', '0', 'important');
  element.style.setProperty('pointer-events', 'none', 'important');
}

/* Varre e oculta elementos que correspondem a anúncios */
function blockAdElements(root = document) {
  const elements = Array.from(root.querySelectorAll(AD_ELEMENT_SELECTORS.join(',')));
  elements.forEach(element => {
    if (isAdElement(element)) {
      hideAdElement(element);
    }
  });
}

/* Observa a página para bloquear anúncios carregados dinamicamente */
function observeAdMutations() {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }

        const element = node;
        if (isAdElement(element)) {
          hideAdElement(element);
        }

        blockAdElements(element);
      });
    });
  });

  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true
  });
}

/* Executa os bloqueios configurados */
function applyBlocking(res) {
  if (res.enabled === false) {
    return;
  }

  if (res.blockNative) {
    blockAdElements();
    observeAdMutations();
  }

  if (res.strictMode) {
    blockAllForms();
    return;
  }

  if (res.blockForms) {
    blockPaymentForms();
  }
}

const defaultSettings = { enabled: true, blockNative: true, blockForms: true, strictMode: false };

function initializeContentScript() {
  if (!storage?.get) {
    applyBlocking(defaultSettings);
    return;
  }

  storage.get(defaultSettings).then(res => applyBlocking(res)).catch(() => {
    applyBlocking(defaultSettings);
  });
}

initializeContentScript();

if (storage?.onChanged) {
  storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !('enabled' in changes)) {
      return;
    }

    const newValue = changes.enabled.newValue;
    if (newValue === false) {
      window.location.reload();
      return;
    }

    initializeContentScript();
  });
}
