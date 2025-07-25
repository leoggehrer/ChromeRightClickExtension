
function sendToServer({ content, targetUrl, targetParams, sourceUrl = "" }) {
  if (!targetUrl || !/^https?:\/\//.test(targetUrl)) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Invalid Target URL",
      message: "Please provide a valid target URL."
    });
    return;
  }

  const payload = {
    SourceUrl: sourceUrl,
    TargetParams: targetParams,
    Payload: {
      type: "clipboard",
      data: content,
      description: "Send clipboard text"
    }
  };

  fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  }).then(response => {
    if (!response.ok)
      throw new Error(`Server responded with ${response.status}`);

    return response.json();
  }).then(() => {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Transfer successful",
      message: `Clipboard content sent to ${targetUrl}`
    });
  }).catch(error => {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Error sending data",
      message: `Error: ${error.message}`
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendClipboardToServer",
    title: "➡️ Send Clipboard to TemplateTools",
    contexts: ["all"]
  });

  chrome.contextMenus.create({
    id: "openTemplateToolsCustom",
    title: "➡️ Customized send Clipboard to TemplateTools",
    contexts: ["all"]
  });

  chrome.contextMenus.create({
    id: "openTemplateToolsOptions",
    title: "⚙️ TemplateTools Options",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openTemplateToolsOptions") {
    chrome.windows.create({
      url: chrome.runtime.getURL("templatetoolsoptions.html"),
      type: "popup",
      width: 500,
      height: 330
    });
  }

  else if (info.menuItemId === "sendClipboardToServer") {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => navigator.clipboard.readText()
      },
      (injectionResults) => {

        if (
          chrome.runtime.lastError ||
          !injectionResults ||
          !injectionResults[0] ||
          !injectionResults[0].result) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Clipboard Error",
            message: chrome.runtime.lastError?.message || "Failed to read clipboard."
          });
          return;
        }

        const clipboardText = injectionResults[0].result;

        if (!clipboardText.trim()) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Clipboard is empty",
            message: "Please copy something before using this option."
          });
          return;
        }

        chrome.storage.local.get(["targetUrl", "targetParams"], (data) => {
          const targetUrl = data.targetUrl?.trim() || "http://localhost:5000/api/execute";
          const targetParams = data.targetParams?.trim() || "command=create_entities";

          sendToServer({
            content: clipboardText,
            targetUrl,
            targetParams,
            sourceUrl: tab.url || ""
          });
        });
      }
    );
  }

  else if (info.menuItemId === "openTemplateToolsCustom") {
    chrome.windows.create({
      url: "templatetoolscustom.html",
      type: "popup",
      width: 500,
      height: 550
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "templateToolsCustomSubmit") {
    sendToServer({
      content: message.content,
      targetUrl: message.targetUrl,
      targetParams: message.targetParams,
      sourceUrl: sender?.url || ""
    });
    sendResponse({ status: "submitted" });
    return true;
  }
});
