// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToMcp",
    title: "➜ Send selection to MCP",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "openOptionsPage",
    title: "⚙️ MCP Options",
    contexts: ["all"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openOptionsPage") {
      chrome.windows.create({
      url: chrome.runtime.getURL("options.html"),
      type: "popup",
      width: 400,
      height: 300
    });
    return;
  }
  if (info.menuItemId !== "sendToMcp") return;

  const selectedText = info.selectionText || "";
  const currentTabUrl = tab.url || "";

  chrome.storage.local.get(["targetUrl", "targetParams"], (data) => {
    const targetUrl = data.targetUrl?.trim() || "";
    const targetParams = data.targetParams?.trim() || "";

    // Validate target URL
    if (!targetUrl || !/^https?:\/\//.test(targetUrl)) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Missing or Invalid Target URL",
        message: "Please set a valid target URL in the extension settings."
      });
      return;
    }

    // Prepare JSON payload
    const payload = {
      SourceUrl: currentTabUrl,
      Params: targetParams,
      Payload: {
        type: "selectedText",
        data: selectedText,
        description: "Send selected text"
      }
    };

    // Send POST request to REST server
    fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      return response.json();
    })
    .then(() => {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Transfer successful",
        message: `The selection has been sent to ${targetUrl}`
      });
    })
    .catch(error => {
      console.error("Transmission error:", error);
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Transmission error",
        message: `Failed to send data: ${error.message}`
      });
    });
  });
});
