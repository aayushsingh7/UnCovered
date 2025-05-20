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
    // Get the selected text or link URL
    let contentToAnalyze;
    let contentSourceType;
    let imageUrl;

    console.log({ info });
    if (info.selectionText) {
      // Handle selected text
      contentToAnalyze = info.selectionText;
      contentSourceType = "text";
    } else if (info.linkUrl) {
      // Handle link URL
      contentToAnalyze = info.linkUrl;
      contentSourceType = "link";
    } else {
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

    console.log(
      "background.js",
      info.menuItemId,
      actionType,
      contentSourceType
    );

    // Store the content and action type so the side panel can access it
    chrome.storage.local.set(
      {
        selectedText: contentToAnalyze,
        contentType: contentSourceType,
        actionType: actionType,
        selectedImage: imageUrl,
      },
      () => {
        // Open the side panel
        chrome.sidePanel.open({ tabId: tab.id }).then(() => {
          console.log("chrome.sidePanel.open()", actionType);
          // Notify the panel that there's new content available
          chrome.runtime.sendMessage({
            action: "contentUpdated",
            type: contentSourceType,
            actionType: actionType,
          });
        });
      }
    );
  }
  // // Handle image selectionh
  // else if (info.menuItemId === "factSnapImage") {
  //   // Get the image URL
  //   const imageUrl = info.srcUrl;

  //   // Store the image URL so the side panel can access it
  //   chrome.storage.local.set(
  //     {
  //       selectedImage: imageUrl,
  //       contentType: "image",
  //       actionType: "analyzeImage",
  //       selectedText: null,
  //     },
  //     () => {
  //       // Open the side panel
  //       chrome.sidePanel.open({ tabId: tab.id }).then(() => {
  //         // Notify the panel that there's new image available
  //         chrome.runtime.sendMessage({
  //           action: "contentUpdated",
  //           type: "image",
  //           actionType: "analyzeImage",
  //         });
  //       });
  //     }
  //   );
  // }
});

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // if (message.action === "getSelectedText") {
  //   // Retrieve the selected text from storage and send it back
  //   chrome.storage.local.get(
  //     ["selectedText", "contentType", "actionType"],
  //     (data) => {
  //       sendResponse({
  //         text: data.selectedText || "No text selected",
  //         contentType: data.contentType || "text",
  //         actionType: data.actionType || "quick-search",
  //       });
  //     }
  //   );
  //   return true; // Required for asynchronous sendResponse
  // }

  // if (message.action === "getSelectedImage") {
  //   // Retrieve the selected image from storage and send it back
  //   chrome.storage.local.get(
  //     ["selectedImage", "contentType", "actionType"],
  //     (data) => {
  //       sendResponse({
  //         imageUrl: data.selectedImage || null,
  //         contentType: data.contentType || "text",
  //         actionType: data.actionType || "analyzeImage",
  //       });
  //     }
  //   );
  //   return true; // Required for asynchronous sendResponse
  // }

  if (message.action === "getContent") {
    chrome.storage.local.get(
      ["selectedText", "selectedImage", "contentType", "actionType"],
      (data) => {
        console.log("get content final", data);
        sendResponse({
          text: data.selectedText || null,
          imageUrl: data.selectedImage || null,
          contentType: data.contentType || "text",
          actionType: data.actionType || "quick-search",
        });
      }
    );

    return true;
  }

  if (message.action === "captureScreen") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      sendResponse({ screenshotUrl: dataUrl });
    });
    return true; // Required for async sendResponse
  }
});
