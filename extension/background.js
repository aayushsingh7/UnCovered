// // Set up the context menu item when the extension is installed
// chrome.runtime.onInstalled.addListener(() => {
//   // Context menu for text selection
//   chrome.contextMenus.create({
//     id: "factSnap",
//     title: "FactSnap: Check facts",
//     contexts: ["selection"]
//   });
  
//   // Context menu for images
//   chrome.contextMenus.create({
//     id: "factSnapImage",
//     title: "FactSnap: Analyze image",
//     contexts: ["image"]
//   });

//   chrome.contextMenus.create({
//     id: "factSnapImage",
//     title: "FactSnap: Deep Research",
//     contexts: ["selection"]
//   });
// });

// // Handle the context menu click
// chrome.contextMenus.onClicked.addListener((info, tab) => {
//   if (info.menuItemId === "factSnap") {
//     // Get the selected text
//     const selectedText = info.selectionText;
    
//     // Store the selected text so the side panel can access it
//     chrome.storage.local.set({ 
//       selectedText: selectedText,
//       contentType: "text",
//       selectedImage: null
//     }, () => {
//       // Open the side panel
//       chrome.sidePanel.open({ tabId: tab.id }).then(() => {
//         // Notify the panel that there's new text available
//         chrome.runtime.sendMessage({ action: "contentUpdated", type: "text" });
//       });
//     });
//   }
//   else if (info.menuItemId === "factSnapImage") {
//     // Get the image URL
//     const imageUrl = info.srcUrl;
    
//     // Store the image URL so the side panel can access it
//     chrome.storage.local.set({ 
//       selectedImage: imageUrl,
//       contentType: "image",
//       selectedText: null
//     }, () => {
//       // Open the side panel
//       chrome.sidePanel.open({ tabId: tab.id }).then(() => {
//         // Notify the panel that there's new image available
//         chrome.runtime.sendMessage({ action: "contentUpdated", type: "image" });
//       });
//     });
//   }
// });

// // Listen for messages from the side panel
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "getSelectedText") {
//     // Retrieve the selected text from storage and send it back
//     chrome.storage.local.get(["selectedText", "contentType"], (data) => {
//       sendResponse({ 
//         text: data.selectedText || "No text selected",
//         contentType: data.contentType || "text"
//       });
//     });
//     return true; // Required for asynchronous sendResponse
//   }
  
//   if (message.action === "getSelectedImage") {
//     // Retrieve the selected image from storage and send it back
//     chrome.storage.local.get(["selectedImage", "contentType"], (data) => {
//       sendResponse({ 
//         imageUrl: data.selectedImage || null,
//         contentType: data.contentType || "text"
//       });
//     });
//     return true; // Required for asynchronous sendResponse
//   }
  
//   if (message.action === "getContent") {
//     // Retrieve all content data
//     chrome.storage.local.get(["selectedText", "selectedImage", "contentType"], (data) => {
//       sendResponse({
//         text: data.selectedText || null,
//         imageUrl: data.selectedImage || null,
//         contentType: data.contentType || "text"
//       });
//     });
//     return true; // Required for asynchronous sendResponse
//   }
// });

// Set up the context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Parent menu for text selection with submenu
  chrome.contextMenus.create({
    id: "factSnapTextParent",
    title: "FactSnap",
    contexts: ["selection"]
  });
  
  // Child menu items for text selection
  chrome.contextMenus.create({
    id: "factSnapTextCheckFacts",
    parentId: "factSnapTextParent",
    title: "Check facts",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "factSnapTextDeepResearch",
    parentId: "factSnapTextParent",
    title: "Deep research",
    contexts: ["selection"]
  });
  
  // Context menu for images
  chrome.contextMenus.create({
    id: "factSnapImage",
    title: "FactSnap: Analyze image",
    contexts: ["image"]
  });
});

// Handle the context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Handle text selection options
  if (info.menuItemId === "factSnapTextCheckFacts" || info.menuItemId === "factSnapTextDeepResearch") {
    // Get the selected text
    const selectedText = info.selectionText;
    const actionType = info.menuItemId === "factSnapTextCheckFacts" ? "checkFacts" : "deepResearch";
    
    // Store the selected text and action type so the side panel can access it
    chrome.storage.local.set({ 
      selectedText: selectedText,
      contentType: "text",
      actionType: actionType,
      selectedImage: null
    }, () => {
      // Open the side panel
      chrome.sidePanel.open({ tabId: tab.id }).then(() => {
        // Notify the panel that there's new text available
        chrome.runtime.sendMessage({ 
          action: "contentUpdated", 
          type: "text",
          actionType: actionType
        });
      });
    });
  }
  // Handle image selection
  else if (info.menuItemId === "factSnapImage") {
    // Get the image URL
    const imageUrl = info.srcUrl;
    
    // Store the image URL so the side panel can access it
    chrome.storage.local.set({ 
      selectedImage: imageUrl,
      contentType: "image",
      actionType: "analyzeImage",
      selectedText: null
    }, () => {
      // Open the side panel
      chrome.sidePanel.open({ tabId: tab.id }).then(() => {
        // Notify the panel that there's new image available
        chrome.runtime.sendMessage({ 
          action: "contentUpdated", 
          type: "image",
          actionType: "analyzeImage"
        });
      });
    });
  }
});

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getSelectedText") {
    // Retrieve the selected text from storage and send it back
    chrome.storage.local.get(["selectedText", "contentType", "actionType"], (data) => {
      sendResponse({ 
        text: data.selectedText || "No text selected",
        contentType: data.contentType || "text",
        actionType: data.actionType || "checkFacts"
      });
    });
    return true; // Required for asynchronous sendResponse
  }
  
  if (message.action === "getSelectedImage") {
    // Retrieve the selected image from storage and send it back
    chrome.storage.local.get(["selectedImage", "contentType", "actionType"], (data) => {
      sendResponse({ 
        imageUrl: data.selectedImage || null,
        contentType: data.contentType || "text",
        actionType: data.actionType || "analyzeImage"
      });
    });
    return true; // Required for asynchronous sendResponse
  }
  
  if (message.action === "getContent") {
    // Retrieve all content data
    chrome.storage.local.get(["selectedText", "selectedImage", "contentType", "actionType"], (data) => {
      sendResponse({
        text: data.selectedText || null,
        imageUrl: data.selectedImage || null,
        contentType: data.contentType || "text",
        actionType: data.actionType || "checkFacts"
      });
    });
    return true; // Required for asynchronous sendResponse
  }
});