/* Palavras-chave usadas para detectar formulários de pagamento */
const FORM_KEYWORDS = [
  'visa', 'mastercard', 'amex', 'card', 'cc', 'cvv', 'cvc', 'payment', 'billing', 'checkout'
];

/* Regex para strings genéricas de anúncio limitadas por fronteiras exatas (classes, IDs, ou caminhos de URL) */
const AD_KEYWORDS_REGEX = /(^|[-_/])(ads?|banners?|advertising|sponsor(ed)?|promo|publicidade|patrocinado)([-_/\.]|$)/i;

/* Regex para domínios de redes de anúncios conhecidos */
const AD_NETWORKS_REGEX = /(doubleclick\.net|adservice\.google|googlesyndication|taboola|outbrain|amazon-adsystem)/i;

const extensionApi = typeof browser === 'object' ? browser : typeof chrome === 'object' ? chrome : null;
const storage = extensionApi?.storage?.local ?? null;

function incrementAdCounter() {
  if (!storage) return;

  storage.get({ adsBlockedThisPage: 0, adsBlockedTotal: 0 }).then(res => {
    storage.set({
      adsBlockedThisPage: res.adsBlockedThisPage + 1,
      adsBlockedTotal: res.adsBlockedTotal + 1
    }).catch(() => {});
  }).catch(() => {});
}

function fieldMatchesKeyword(field) {
  const text = [
    field.name, field.id, field.type, field.placeholder, field.title, field.className
  ].filter(Boolean).join(' ').toLowerCase();

  if (FORM_KEYWORDS.some(keyword => text.includes(keyword))) return true;

  const label = document.querySelector(`label[for="${CSS.escape(field.id || '')}"]`);
  if (label && FORM_KEYWORDS.some(keyword => label.textContent.toLowerCase().includes(keyword))) return true;

  const parentLabel = field.closest('label');
  return parentLabel && FORM_KEYWORDS.some(keyword => parentLabel.textContent.toLowerCase().includes(keyword));
}

function matchesForm(form) {
  const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
  return inputs.some(field => fieldMatchesKeyword(field));
}

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
  overlay.style.zIndex = '9999';

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
    if (window.history.length > 1) window.history.back();
    else if (document.referrer) window.location.href = document.referrer;
    else window.location.href = 'about:blank';
  });

  overlay.appendChild(message);
  overlay.appendChild(link);
  form.appendChild(overlay);
}

function blockPaymentForms() {
  document.querySelectorAll('form').forEach(form => {
    if (matchesForm(form)) disableForm(form);
  });
}

function blockAllForms() {
  document.querySelectorAll('form').forEach(form => disableForm(form));
}

/* Identifica estruturas de anúncios omitindo avaliação nociva de texto de conteúdo */
function isAdElement(element) {
  if (!element || !element.tagName || element.dataset.navegoBlocked === 'true') {
    return false;
  }

  const tagName = element.tagName.toUpperCase();
  const id = element.id || '';
  const className = typeof element.className === 'string' ? element.className : '';

  // 1. Bloqueio por Classes e IDs
  if (AD_KEYWORDS_REGEX.test(id) || AD_KEYWORDS_REGEX.test(className)) {
    if (!className.toLowerCase().includes('header') && !className.toLowerCase().includes('nav')) {
      return true;
    }
  }

  // 2. Bloqueio por atributos de mídia (src/href)
  if (['IFRAME', 'IMG', 'PICTURE', 'VIDEO', 'A'].includes(tagName)) {
    const src = element.src || element.getAttribute('src') || element.href || '';
    
    // Captura tanto domínios externos de tracker quanto caminhos relativos nomeados como anúncio
    if (AD_NETWORKS_REGEX.test(src) || AD_KEYWORDS_REGEX.test(src)) {
      return true;
    }
  }

  return false;
}

function hideAdElement(element) {
  element.dataset.navegoBlocked = 'true';
  element.style.setProperty('display', 'none', 'important');
  element.style.setProperty('visibility', 'hidden', 'important');
  element.style.setProperty('opacity', '0', 'important');
  element.style.setProperty('pointer-events', 'none', 'important');
  incrementAdCounter();
}

/* Otimizado: Foco em nós estruturais propensos a anúncios */
function blockAdElements(root = document) {
  const elements = Array.from(root.querySelectorAll('iframe, img, div[class], div[id], aside, section'));
  elements.forEach(element => {
    if (isAdElement(element)) hideAdElement(element);
  });
}

function observeAdMutations() {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (isAdElement(node)) {
            hideAdElement(node);
          }
          blockAdElements(node);
        }
      });
    });
  });

  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
}

function applyBlocking(res) {
  if (res.enabled === false) return;

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
  if (storage) {
    storage.set({ adsBlockedThisPage: 0 }).catch(() => {});
  }

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
    if (area === 'local' && 'enabled' in changes) {
      if (changes.enabled.newValue === false) {
        window.location.reload();
      } else {
        initializeContentScript();
      }
    }
  });
}