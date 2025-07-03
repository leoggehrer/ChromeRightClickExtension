document.addEventListener('DOMContentLoaded', () => {
  const targetUrlInput = document.getElementById('targetUrl');
  const targetParamsInput = document.getElementById('targetParams');
  const saveButton = document.getElementById('save');
  const closeButton = document.getElementById('close');

  // Werte aus chrome.storage laden
  chrome.storage.local.get(['targetUrl', 'targetParams'], (result) => {
    if (result.targetUrl) targetUrlInput.value = result.targetUrl?.trim() || "http://localhost:5000/api/execute";
    if (result.targetParams) targetParamsInput.value = result.targetParams?.trim() || "command=create_entities";
  });

  // Speichern-Button-Handler
  saveButton.addEventListener('click', () => {
    const targetUrl = targetUrlInput.value;
    const targetParams = targetParamsInput.value;

    chrome.storage.local.set({ targetUrl, targetParams }, () => {
      console.log('Configuration saved');
      window.close();
    });
  });

  closeButton.addEventListener('click', () => {
    window.close();
  });
});
