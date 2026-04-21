/**
 * service-worker.js - Background service worker (minimal)
 * Apenas abre abas quando solicitado pelo content script.
 */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'openTab') {
    chrome.tabs.create({ url: msg.url, active: false });
    sendResponse({ success: true });
  }

  if (msg.action === 'openTabs') {
    const urls = msg.urls || [];
    urls.forEach((url, i) => {
      setTimeout(() => {
        chrome.tabs.create({ url, active: false });
      }, i * 200); // pequeno delay para não sobrecarregar
    });
    sendResponse({ success: true, count: urls.length });
  }

  return true;
});
