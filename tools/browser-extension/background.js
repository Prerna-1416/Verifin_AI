// VeriFin AI Investor Alert - background service worker.
// Adds right-click "Scan with VeriFin" actions for links and selected text.

const OPEN = "scan";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "verifin-link",
      title: 'Scan link with VeriFin (risk check)',
      contexts: ["link"],
    });
    chrome.contextMenus.create({
      id: "verifin-text",
      title: 'Scan selection with VeriFin (risk check)',
      contexts: ["selection"],
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  let target = "";
  let type = "text";
  if (info.menuItemId === "verifin-link") {
    target = info.linkUrl || "";
    type = "url";
  } else if (info.menuItemId === "verifin-text") {
    target = info.selectionText || "";
    type = "text";
  }
  if (!target) return;

  const url = `${chrome.runtime.getURL("popup/scan.html")}?type=${type}&target=${encodeURIComponent(target)}`;
  chrome.tabs.create({ url });
});