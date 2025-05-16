// Set up the context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Parent menu for text selection with submenu
  chrome.contextMenus.create({
    id: "factSnapTextParent",
    title: "FactSnap",
    contexts: ["selection"],
  });

  // Child menu items for text selection
  chrome.contextMenus.create({
    id: "factSnapTextQuickSearch",
    parentId: "factSnapTextParent",
    title: "Quick Search - Instant answers",
    contexts: ["selection", "link"],
  });

  chrome.contextMenus.create({
    id: "factSnapTextCheckFacts",
    parentId: "factSnapTextParent",
    title: "Check Facts - Verify information",
    contexts: ["selection", "link"],
  });

  chrome.contextMenus.create({
    id: "factSnapTextDeepResearch",
    parentId: "factSnapTextParent",
    title: "Deep Research - Comprehensive analysis",
    contexts: ["selection", "link"],
  });

  // Context menu for images
  chrome.contextMenus.create({
    id: "factSnapImage",
    title: "FactSnap: Analyze image",
    contexts: ["image"],
  });
});

// Handle the context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Handle text selection options
  if (
    info.menuItemId === "factSnapTextCheckFacts" ||
    info.menuItemId === "factSnapTextDeepResearch" ||
    info.menuItemId === "factSnapTextQuickSearch"
  ) {
    // Get the selected text
    const selectedText = info.selectionText;
    
    // Determine the action type based on which menu item was clicked
    let actionType;
    if (info.menuItemId === "factSnapTextCheckFacts") {
      actionType = "fact-check";
    } else if (info.menuItemId === "factSnapTextQuickSearch") {
      actionType = "quick-search";
    } else if (info.menuItemId === "factSnapTextDeepResearch") {
      actionType = "deep-research";
    }

    console.log("background.js", info.menuItemId, actionType);

    // Store the selected text and action type so the side panel can access it
    chrome.storage.local.set(
      {
        selectedText: selectedText,
        contentType: "text",
        actionType: actionType,
        selectedImage: null,
      },
      () => {
        // Open the side panel
        chrome.sidePanel.open({ tabId: tab.id }).then(() => {
          console.log("chrome,sidePanel.open()", actionType)
          // Notify the panel that there's new text available
          chrome.runtime.sendMessage({
            action: "contentUpdated",
            type: "text",
            actionType: actionType,
          });
        });
      }
    );
  }
  // Handle image selection
  else if (info.menuItemId === "factSnapImage") {
    // Get the image URL
    const imageUrl = info.srcUrl;

    // Store the image URL so the side panel can access it
    chrome.storage.local.set(
      {
        selectedImage: imageUrl,
        contentType: "image",
        actionType: "analyzeImage",
        selectedText: null,
      },
      () => {
        // Open the side panel
        chrome.sidePanel.open({ tabId: tab.id }).then(() => {
          // Notify the panel that there's new image available
          chrome.runtime.sendMessage({
            action: "contentUpdated",
            type: "image",
            actionType: "analyzeImage",
          });
        });
      }
    );
  }
});

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getSelectedText") {
    // Retrieve the selected text from storage and send it back
    console.log("get selected text", message.action, actionType)
    chrome.storage.local.get(
      ["selectedText", "contentType", "actionType"],
      (data) => {
        sendResponse({
          text: data.selectedText || "No text selected",
          contentType: data.contentType || "text",
          actionType: data.actionType || "quick-search",
        });
      }
    );
    return true; // Required for asynchronous sendResponse
  }

  if (message.action === "getSelectedImage") {
    // Retrieve the selected image from storage and send it back
    chrome.storage.local.get(
      ["selectedImage", "contentType", "actionType"],
      (data) => {
        sendResponse({
          imageUrl: data.selectedImage || null,
          contentType: data.contentType || "text",
          actionType: data.actionType || "analyzeImage",
        });
      }
    );
    return true; // Required for asynchronous sendResponse
  }

  if (message.action === "getContent") {
    // Retrieve all content data
    chrome.storage.local.get(
      ["selectedText", "selectedImage", "contentType", "actionType"],
      (data) => {
        console.log("get content final", data)
        sendResponse({
          text: data.selectedText || null,
          imageUrl: data.selectedImage || null,
          contentType: data.contentType || "text",
          actionType: data.actionType || "quick-search",
        });
      }
    );

    return true; // Required for asynchronous sendResponse
  }
});