chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "fontscope",
      title: "Inspect font",
      contexts: ["all"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "fontscope") {
      chrome.tabs.sendMessage(tab.id, { action: "inspectFont" });
    }
  });