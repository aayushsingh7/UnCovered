chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "factSnapTextParent",
    title: "FactSnap",
    contexts: ["selection", "link", "image"],
  });

  chrome.contextMenus.create({
    id: "factSnapTextQuickSearch",
    parentId: "factSnapTextParent",
    title: "Quick Search - Instant answers",
    contexts: ["selection", "link", "image"],
  });

  chrome.contextMenus.create({
    id: "factSnapTextCheckFacts",
    parentId: "factSnapTextParent",
    title: "Check Facts - Verify information",
    contexts: ["selection", "link", "image"],
  });

  chrome.contextMenus.create({
    id: "factSnapTextDeepResearch",
    parentId: "factSnapTextParent",
    title: "Deep Research - Comprehensive analysis",
    contexts: ["selection", "link"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (
    info.menuItemId === "factSnapTextCheckFacts" ||
    info.menuItemId === "factSnapTextDeepResearch" ||
    info.menuItemId === "factSnapTextQuickSearch"
  ) {
    let contentToAnalyze;
    let contentSourceType;
    let imageUrl;

    if (info.selectionText) {
      contentToAnalyze = info.selectionText;
      contentSourceType = "text";
    } else if (info.linkUrl) {
      contentToAnalyze = info.linkUrl;
      contentSourceType = "link";
    } else if (info.srcUrl) {
      imageUrl = info.srcUrl;
      contentToAnalyze = info.srcUrl;
      contentSourceType = "image";
    }

    let actionType;
    if (info.menuItemId === "factSnapTextCheckFacts") {
      actionType = "fact-check";
    } else if (info.menuItemId === "factSnapTextQuickSearch") {
      actionType = "quick-search";
    } else if (info.menuItemId === "factSnapTextDeepResearch") {
      actionType = "deep-research";
    }

    chrome.storage.local.set(
      {
        selectedText: contentToAnalyze,
        contentType: contentSourceType,
        actionType: actionType,
        selectedImage: imageUrl,
      },
      () => {
        chrome.sidePanel.open({ tabId: tab.id }).then(() => {
          chrome.runtime
            .sendMessage({
              action: "contentUpdated",
              type: contentSourceType,
              actionType: actionType,
            })
            .catch(() => {
              // Ignore errors if receiver doesn't exist yet
            });
        });
      }
    );
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getContent") {
    chrome.storage.local.get(
      ["selectedText", "selectedImage", "contentType", "actionType"],
      (data) => {
        sendResponse({
          text: data.selectedText || null,
          imageUrl: data.selectedImage || null,
          contentType: data.contentType || "text",
          actionType: data.actionType || "quick-search",
        });
      }
    );

    chrome.storage.local.set({
      selectedText: null,
      contentType: null,
      actionType: null,
      selectedImage: null,
    });
    return true;
  }

  if (message.action === "captureScreen") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      sendResponse({ screenshotUrl: dataUrl });
    });
    return true;
  }
});
