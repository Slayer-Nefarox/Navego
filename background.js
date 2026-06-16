/* Atualiza o ruleset do bloqueador quando a opção de habilitar é alterada */
browser.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    browser.storage.local.set({ hasOpenedOptions: false, lastOptionsSection: 'acessibilidade' }).catch(() => {
      console.error('Falha ao inicializar estado da primeira abertura das opções');
    });
  }
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.enabled) {
    const isEnabled = changes.enabled.newValue;
    if (isEnabled) {
      browser.declarativeNetRequest.updateEnabledRulesets({ enableRulesetIds: ["ruleset_1"] });
    } else {
      browser.declarativeNetRequest.updateEnabledRulesets({ disableRulesetIds: ["ruleset_1"] });
    }
  }
});