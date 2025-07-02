document.addEventListener('DOMContentLoaded', () => {
  const targetUrlInput = document.getElementById('targetUrl');
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('save');
  const closeButton = document.getElementById('close');

  // Werte aus chrome.storage laden
  chrome.storage.local.get(['targetUrl', 'apiKey'], (result) => {
    if (result.targetUrl) targetUrlInput.value = result.targetUrl;
    if (result.apiKey) apiKeyInput.value = result.apiKey;
  });

  // Speichern-Button-Handler
  saveButton.addEventListener('click', () => {
    const targetUrl = targetUrlInput.value;
    const apiKey = apiKeyInput.value;

    chrome.storage.local.set({ targetUrl, apiKey }, () => {
      console.log('Configuration saved');
      window.close();
    });
  });

  closeButton.addEventListener('click', () => {
    window.close();
  });
});
