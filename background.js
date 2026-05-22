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