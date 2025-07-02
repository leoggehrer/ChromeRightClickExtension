chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToMcp",
    title: "➜ Send selection to Mcp",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sendToMcp") {
    chrome.storage.local.get(["targetUrl", "apiKey"], (data) => {
      const selectedText = info.selectionText;
      const currentTabUrl = tab.url || "";
      const targetUrl = data.targetUrl || "";
      const apiKey = data.apiKey || "";

      fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          SourceUrl: currentTabUrl,
          ApiKey: apiKey,
          Payload: {
            type: "selectedText",
            data: selectedText,
            description: "Send selected text",
          }
        })
      })
      .then(result => {
        console.log("Transfer successful:", result);
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "Transfer successful",
          message: "The selection has been successfully transferred to ‘" + targetUrl + "’."
        });
      })
      .catch(error => {
        console.error("Transmission error:", error);
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "Transmission error",
          message: "Error during transmission to ‘" + targetUrl + "’."
        });
      });
    });
  }
});
