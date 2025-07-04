document.addEventListener('DOMContentLoaded', async () => {
  const contentInput = document.getElementById('content');
  const targetUrlInput = document.getElementById('targetUrl');
  const targetParamsInput = document.getElementById('targetParams');
  const closeButton = document.getElementById('close');
  const submitButton = document.getElementById('submit');

  targetUrlInput.value = "http://localhost:5000/api/execute";
  targetParamsInput.value = "command=create_entities";

  // Werte aus chrome.storage laden
  chrome.storage.local.get(['targetUrl', 'targetParams'], (result) => {
    if (result.targetUrl) targetUrlInput.value = result.targetUrl?.trim() || targetUrlInput.value; ;
    if (result.targetParams) targetParamsInput.value = result.targetParams?.trim() || targetParamsInput.value;
  });

  // read clipboard
  try {
    const text = await navigator.clipboard.readText();

    contentInput.value = text;
  } 
  catch (err) {
    console.error('Clipboard could not be read:', err);
  }

  // close command
  closeButton.addEventListener('click', () => {
    window.close();
  });

  // Nur bei Button-Klick senden
  submitButton.addEventListener('click', () => {
    const content = contentInput.value;
    const targetUrl = targetUrlInput.value;
    const targetParams = targetParamsInput.value;

    chrome.runtime.sendMessage(
      { action: 'customSubmit', content, targetUrl, targetParams },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError.message);
          alert('Error: ' + chrome.runtime.lastError.message);
          return;
        }
        window.close();
      }
    );
  });
});
