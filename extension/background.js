chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "uncoveredTextParent",
    title: "UnCovered",
    contexts: ["selection", "link", "image"],
  });

  chrome.contextMenus.create({
    id: "uncoveredTextQuickSearch",
    parentId: "uncoveredTextParent",
    title: "Quick Search - Instant answers",
    contexts: ["selection", "link", "image"],
  });

  chrome.contextMenus.create({
    id: "uncoveredTextCheckFacts",
    parentId: "uncoveredTextParent",
    title: "Check Facts - Verify information",
    contexts: ["selection", "link", "image"],
  });

  chrome.contextMenus.create({
    id: "uncoveredTextDeepResearch",
    parentId: "uncoveredTextParent",
    title: "Deep Research - Comprehensive analysis",
    contexts: ["selection", "link"],
  });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.set(
    {
      selectedText: null,
      contentType: "default",
      actionType: "quick-search",
      selectedImage: null,
    },
    () => {
      chrome.sidePanel.open({ tabId: tab.id }).then(() => {
        chrome.runtime
          .sendMessage({
            action: "contentUpdated",
            type: "default",
            actionType: "quick-search",
          })
          .catch(() => {
            // Ignore errors if receiver doesn't exist yet
          });
      });
    }
  );
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (
    info.menuItemId === "uncoveredTextCheckFacts" ||
    info.menuItemId === "uncoveredTextDeepResearch" ||
    info.menuItemId === "uncoveredTextQuickSearch"
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
    if (info.menuItemId === "uncoveredTextCheckFacts") {
      actionType = "fact-check";
    } else if (info.menuItemId === "uncoveredTextQuickSearch") {
      actionType = "quick-search";
    } else if (info.menuItemId === "uncoveredTextDeepResearch") {
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
          contentType: data.contentType || "default",
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
