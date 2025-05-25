import { marked } from "./libs/marked.esm.js";
export const API_URL = "http://localhost:4000/api/v1";

import {
  addNewMessageToDB,
  fetchAIResponse,
  fetchAllChats,
  searchChatsAndMessages,
} from "./utils/api/api.js";
import { getUserInfo } from "./utils/api/authApi.js";
import {
  addListeners,
  createChatBox,
  createContentBox,
  createSourceBox,
  handleAdjustHeight,
  handleChatBoxClick,
  handleCloseMenuBarClick,
  handleContentBoxDisplay,
  handleMenuBarClick,
  handleQueryTypeClick,
  handleRemoveSelectedContent,
  handleSelectedActionType,
  handleSettingsBtnClick,
  handleSettingsContainerClick,
  handleShowContentBox,
  highlightSelectedChat,
  removeListeners,
  renderChats,
  updateToggle,
} from "./utils/helpers/domHelpers.js";
import {
  analyzeScreen,
  handleUploadFile,
  uploadToCloudinary,
} from "./utils/helpers/fileHelpers.js";
import {
  fetchSourceDetails,
  replaceWithClickableLink,
  showToast,
} from "./utils/utils.js";

let textElement,
  imageContainer,
  noContentElement,
  messagesContainer,
  contentBox,
  sideNavbar,
  menuBar,
  closeMenuBar,
  searchTextarea,
  removeSelectedContent,
  settingsBtn,
  settingsContainer,
  deepResearch,
  quickSearch,
  factCheck,
  deepResearchStatus,
  quickSearchStatus,
  factCheckStatus,
  newChatBtn,
  chatsContainer,
  queryTypes,
  sendBtn,
  analyzeScreenBtn,
  uploadFileInput,
  uploadFileBtn,
  searchChatsAndMessagesInput;

let userDetails = {};
let selectedChat = {};
let prevCustomInput = null;
let loadingAiResponse = false;
export let stopResponseStreaming = false;
let responseStreamingStatus = false;

let newMessageDetails = {
  selectedText: "",
  actionType: "",
};

let resultsContainerObj = {
  tab1: null,
  tab2: null,
  tab3: null,
  panel1: null,
  panel2: null,
  panel3: null,
};

let chatsMap = new Map();
let CHAT_HISTORY = [];
let UPLOADED_DOCUMENTS = [];

marked.setOptions({
  highlight: function (code, lang) {
    return hljs.highlightAuto(code).value;
  },
  langPrefix: "hljs language-",
});

function handleSendBtnClick(e) {
  if (responseStreamingStatus) {
    stopResponseStreaming = true;
    return;
  }
  if (
    (!loadingAiResponse && newMessageDetails.selectedText.trim()) ||
    (!loadingAiResponse && UPLOADED_DOCUMENTS.length > 0) ||
    (!loadingAiResponse && searchTextarea.value.trim())
  ) {
    addNewMessage(searchTextarea.value);
    searchTextarea.style.height = "50px";
  }
}

export function handleNewChatBtnClick({
  messagesContainer,
  refreshElements,
  newMessageDetails,
  contentBox,
  removeSelectedContent,
  UPLOADED_DOCUMENTS,
  imageContainer,
  chatsContainer,
  searchTextarea,
  selectedChat,
  queryTypes,
  sideNavbar,
}) {
  messagesContainer.innerHTML = `
    <div class="intro" id="intro">
      <h3>Hey there, ${userDetails?.name?.split(" ")[0]}! 👋</h3>
      <p>
        It's so lovely to see you here. 💫 How can I make your day better today?
        😊
      </p>
    </div>
  `;
  sideNavbar.classList.remove("show-sidenav");
  CHAT_HISTORY.length = 0;
  newMessageDetails.actionType = "quick-search";
  handleRemoveSelectedContent(
    contentBox,
    removeSelectedContent,
    newMessageDetails,
    UPLOADED_DOCUMENTS,
    imageContainer
  );
  highlightSelectedChat("new-chat", chatsContainer);
  searchTextarea.value = "";
  selectedChat.chatID = null;
  selectedChat.title = ""
  handleSelectedActionType(queryTypes, { actionType: "quick-search" });
}

function handleDeepResearchClick(e) {
  e.stopPropagation();
  deepResearchStatus = !deepResearchStatus;
  showToast("Changes saved successfully!", "success");
  updateToggle(deepResearch, deepResearchStatus);
  chrome.storage.local.set({ deepResearch: deepResearchStatus });
}

function handleQuickSearchClick(e) {
  e.stopPropagation();
  quickSearchStatus = !quickSearchStatus;
  updateToggle(quickSearch, quickSearchStatus);
  showToast("Changes saved successfully!", "success");
  chrome.storage.local.set({ quickSearch: quickSearchStatus });
}

function handleFactCheckClick(e) {
  e.stopPropagation();
  factCheckStatus = !factCheckStatus;
  updateToggle(factCheck, factCheckStatus);
  showToast("Changes saved successfully!", "success");
  chrome.storage.local.set({ factCheck: factCheckStatus });
}

async function openDailogBox() {
  uploadFileInput.click();
}

function refreshElements() {
  textElement = document.getElementById("selected-text");
  imageContainer = document.getElementById("selected-image-container");
  noContentElement = document.getElementById("no-content");
  messagesContainer = document.getElementById("messages-container");
  contentBox = document.getElementById("content-box");
  sideNavbar = document.getElementById("sidenav");
  menuBar = document.getElementById("menu");
  closeMenuBar = document.getElementById("close-btn");
  searchTextarea = document.getElementById("search-input") || null;
  searchChatsAndMessagesInput = document.getElementById(
    "search-chats-and-messages"
  );
  removeSelectedContent = document.getElementById("remove-selected-text");
  settingsBtn = document.getElementById("settings-btn");
  settingsContainer = document.getElementById("settings-contanier");
  deepResearch = document.getElementById("deep-research-settings-btn");
  quickSearch = document.getElementById("quick-search-settings-btn");
  factCheck = document.getElementById("fact-check-settings-btn");
  newChatBtn = document.getElementById("new-chat");
  chatsContainer = document.getElementById("chats-container");
  queryTypes = document.querySelectorAll(".query-types span");
  sendBtn = document.getElementById("send-btn");
  analyzeScreenBtn = document.getElementById("captureBtn");
  uploadFileInput = document.getElementById("upload-input");
  uploadFileBtn = document.getElementById("upload-btn");

  UPLOADED_DOCUMENTS.length = 0;
  imageContainer.innerHTML = "";

  if (userDetails.email) {
    const elements = {
      uploadFileBtn,
      uploadFileInput,
      queryTypes,
      searchTextarea,
      menuBar,
      closeMenuBar,
      sendBtn,
      removeSelectedContent,
      newChatBtn,
      deepResearch,
      quickSearch,
      factCheck,
      settingsBtn,
      settingsContainer,
      analyzeScreenBtn,
      chatsContainer,
      searchChatsAndMessagesInput,
    };

    updateToggle(factCheck, factCheckStatus);
    updateToggle(quickSearch, quickSearchStatus);
    updateToggle(deepResearch, deepResearchStatus);

    const handlers = {
      handleQueryTypeClick: (e) =>
        handleQueryTypeClick(e, queryTypes, newMessageDetails),
      handleAdjustHeight: () => handleAdjustHeight(searchTextarea),
      handleMenuBarClick: () => handleMenuBarClick(sideNavbar),
      handleCloseMenuBarClick: () => handleCloseMenuBarClick(sideNavbar),
      handleSendBtnClick,
      handleRemoveSelectedContent: () =>
        handleRemoveSelectedContent(
          contentBox,
          removeSelectedContent,
          newMessageDetails,
          UPLOADED_DOCUMENTS,
          imageContainer
        ),
      handleNewChatBtnClick: () =>
        handleNewChatBtnClick({
          messagesContainer,
          refreshElements,
          newMessageDetails,
          contentBox,
          removeSelectedContent,
          UPLOADED_DOCUMENTS,
          imageContainer,
          chatsContainer,
          searchTextarea,
          selectedChat,
          queryTypes,
          sideNavbar,
        }),
      handleDeepResearchClick,
      handleQuickSearchClick,
      handleFactCheckClick,
      handleSettingsBtnClick: () =>
        handleSettingsBtnClick(sideNavbar, settingsContainer),
      handleSettingsContainerClick: () =>
        handleSettingsContainerClick(settingsContainer),
      analyzeScreen: (e) =>
        analyzeScreen(
          contentBox,
          removeSelectedContent,
          imageContainer,
          newMessageDetails,
          textElement,
          UPLOADED_DOCUMENTS,
          sendBtn
        ),
      openDailogBox,
      handleUploadFile: (e) =>
        handleUploadFile(
          e,
          contentBox,
          removeSelectedContent,
          imageContainer,
          newMessageDetails,
          textElement,
          UPLOADED_DOCUMENTS,
          sendBtn
        ),
      handleChatBoxClick: (e) =>
        handleChatBoxClick(
          e,
          selectedChat,
          newMessageDetails,
          messagesContainer,
          searchTextarea,
          prevCustomInput,
          contentBox,
          removeSelectedContent,
          chatsMap,
          chatsContainer,
          sideNavbar,
          refreshElements,
          UPLOADED_DOCUMENTS,
          imageContainer,
          queryTypes,
          CHAT_HISTORY
        ),
      searchChatsAndMessages: (e) =>
        searchChatsAndMessages(e, userDetails, chatsContainer, chatsMap),
    };

    removeListeners(elements, handlers);
    addListeners(elements, handlers);
    if (searchTextarea) handleAdjustHeight(searchTextarea);
  }
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("tab")) {
    const clickedTab = event.target;
    const tabName = clickedTab.dataset.tab;
    const contentBox = clickedTab.closest(".content-box");
    if (contentBox) {
      const allTabs = contentBox.querySelectorAll(".tab");
      const allPanels = contentBox.querySelectorAll(".tab-panel");
      allTabs.forEach((tab) => tab.classList.remove("active"));
      clickedTab.classList.add("active");
      allPanels.forEach((panel) => (panel.style.display = "none"));
      const activePanel = contentBox.querySelector(
        `.tab-panel[data-tab="${tabName}"]`
      );
      if (activePanel) activePanel.style.display = "block";
    }
  }
});

function extractLinks(body) {
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
  const matches = body.match(urlPattern);
  if (!matches) {
    return [];
  }
  const cleanedLinks = matches.map((url) => {
    return url.replace(/[.,;:!?]+$/, "");
  });

  return [...new Set(cleanedLinks)];
}

async function addNewMessage(customPrompt) {
  let prevSelectedActionType = newMessageDetails.actionType;
  responseStreamingStatus = true;
  let populatingSourcesLoading = false;
  sendBtn.innerHTML = `<img alt="pause" src="./assets/pause.svg" />`;
  const populatedSources = [];
  const LINKS = extractLinks(
    customPrompt + " " + newMessageDetails.selectedText
  );

  const introTemplate = document.getElementById("intro");
  if (introTemplate && window.getComputedStyle(introTemplate).display == "flex")
    introTemplate.style.display = "none";
  if (!newMessageDetails.actionType) {
    return;
  }
  loadingAiResponse = true;

  const messageBoxes = messagesContainer.getElementsByClassName("new-message");
  if (messageBoxes.length > 0) {
    messageBoxes[messageBoxes.length - 1].classList.remove("new-message");
  }

  try {
    let { contentType, mainBox: newMessageBox } = createContentBox(
      customPrompt,
      newMessageDetails,
      resultsContainerObj,
      UPLOADED_DOCUMENTS
    );
    messagesContainer.appendChild(newMessageBox);
    prevCustomInput = searchTextarea.value;
    handleContentBoxDisplay(
      "hide",
      searchTextarea,
      prevCustomInput,
      contentBox,
      removeSelectedContent
    );
    messagesContainer.scrollTo({
      top: newMessageBox.offsetTop - 80,
      behavior: "smooth",
    });

    const USER_MESSAGE = {
      role: "user",
      content: [
        {
          type: "text",
          text: `Query Type: ${newMessageDetails.actionType}
User Prompt: ${customPrompt}
User Context: ${
            newMessageDetails.selectedText || "No Additional Context Provided"
          }`,
        },
        ...LINKS.map((link) => ({
          type: "text",
          text: link,
        })),
        ...UPLOADED_DOCUMENTS.map((imageLink) => ({
          type: "image_url",
          image_url: { url: imageLink },
        })),
      ],
    };

    CHAT_HISTORY.push(USER_MESSAGE);

    const response = await fetchAIResponse(
      userDetails._id,
      selectedChat.chatID,
      newMessageDetails.selectedText,
      customPrompt,
      newMessageDetails.actionType,
      CHAT_HISTORY,
      (data) => {
        try {
          loadingAiResponse = false;
          let replaceWithLink = replaceWithClickableLink(
            data.cleanContent,
            data.citations
          );
          let markedHTML = marked(replaceWithLink);
          resultsContainerObj.panel1.innerHTML = markedHTML;
          resultsContainerObj.panel1
            .querySelectorAll("pre code")
            .forEach((block) => {
              hljs.highlightElement(block);
            });
          if (
            data.verdict &&
            contentType.childNodes.length == 1 &&
            newMessageDetails.actionType == "fact-check"
          ) {
            contentType.innerHTML += `<div class="final-fact-verdict ${
              data.verdict
            }">${
              data.verdict == "true"
                ? "Fact is True"
                : data.verdict == "false"
                ? "Fact is False"
                : "Not Confirmed"
            }</div>`;
          }
          if (data.citations.length > 0 && !populatingSourcesLoading) {
            populatingSourcesLoading = true;
            resultsContainerObj.tab2.style.display = "block";
            resultsContainerObj.panel2.innerHTML += `<div class="loading-sources"><div class="loader-1"></div></div>`;
            resultsContainerObj.tab2.style.display = "block";
            data.citations.map(async (source, index) => {
              const populatedSource = await fetchSourceDetails(source);
              resultsContainerObj.panel2.appendChild(
                createSourceBox(populatedSource)
              );
              populatedSources.push(populatedSource);
            });
            const loadingElem =
              resultsContainerObj.panel2.querySelector(".loading-sources");
            if (loadingElem) {
              resultsContainerObj.panel2.removeChild(loadingElem);
            }
          }
        } catch (err) {
          showToast("Oops! something went wrong while generating answer", "error")
        }
      },
      async (completeData) => {
        if (!completeData.content) {
          handleContentBoxDisplay(
            "show",
            searchTextarea,
            prevCustomInput,
            contentBox,
            removeSelectedContent
          );
          messagesContainer.removeChild(newMessageBox);
          showToast(
            "Oops! cannot process your request at this moment😥",
            "error"
          );
          return;
        }
        try {
          newMessageBox.classList.remove("new-message");
          const { newChat, newMessage } = await addNewMessageToDB(
            completeData.verdict,
            userDetails._id,
            selectedChat.chatID,
            customPrompt || newMessageDetails.selectedText || "Image analysis",
            completeData.cleanContent,
            completeData.content,
            populatedSources,
            UPLOADED_DOCUMENTS,
            newMessageDetails.selectedText,
            customPrompt,
            newMessageDetails.actionType
          );
          if (newChat != null) {
            selectedChat = newChat;
            chatsContainer.prepend(createChatBox(newChat));
            highlightSelectedChat(newChat.chatID, chatsContainer);
          }
          if (!newMessage) {
            handleContentBoxDisplay(
              "show",
              searchTextarea,
              prevCustomInput,
              contentBox,
              removeSelectedContent
            );
            return;
          }

          const { responseRawJSON } = newMessage;
          const ASSISTANT_MESSAGE = {
            role: "assistant",
            content: `Answer: ${responseRawJSON}`,
          };
          CHAT_HISTORY.push(ASSISTANT_MESSAGE);

          if (CHAT_HISTORY.length > 6) {
            CHAT_HISTORY.splice(0, CHAT_HISTORY.length - 6);
          }

          newMessageDetails = {
            selectedText: "",
            actionType: prevSelectedActionType,
          };

          resultsContainerObj = {
            tab1: null,
            tab2: null,
            tab3: null,
            panel1: null,
            panel2: null,
            panel3: null,
          };
          imageContainer.innerHTML = "";
        } catch (err) {
          showToast("Cannot save message at this moment", "error")
        }
      }
    );
  } catch (err) {
    handleContentBoxDisplay(
      "show",
      searchTextarea,
      prevCustomInput,
      contentBox,
      removeSelectedContent
    );
  } finally {
    UPLOADED_DOCUMENTS.length = 0;
    loadingAiResponse = false;
    populatingSourcesLoading = false;
    sendBtn.innerHTML = `<img alt="send" src="./assets/send.svg" />`;
    stopResponseStreaming = false;
    responseStreamingStatus = false;
  }
}

async function updateContent() {
  if (!userDetails.email) return;
  textElement.style.display = "none";
  noContentElement.style.display = "none";

  chrome.runtime.sendMessage({ action: "getContent" }, async (response) => {
    if (chrome.runtime.lastError) {
      noContentElement.style.display = "block";
      noContentElement.textContent = "Error retrieving content.";
      return;
    }

    if (!response.contentType) return;
    handleSelectedActionType(queryTypes, response);

    if (
      (response.contentType === "text" || response.contentType === "link") &&
      response.text
    ) {
      handleShowContentBox(contentBox, removeSelectedContent);
      textElement.style.display = "block";
      newMessageDetails.selectedText = response.text;
      textElement.textContent = response.text;

      if (response.contentType === "link") {
        textElement.classList.add("link-content");
        textElement.textContent = `Link: ${response.text}`;
      } else {
        textElement.classList.remove("link-content");
      }

      if (response.actionType === "deep-research") {
        newMessageDetails.actionType = "deep-research";
        if (deepResearchStatus) addNewMessage();
      } else if (response.actionType === "fact-check") {
        newMessageDetails.actionType = "fact-check";
        if (factCheckStatus) addNewMessage();
      } else {
        newMessageDetails.actionType = "quick-search";
        if (quickSearchStatus) addNewMessage();
      }
    } else if (response.contentType === "image" && response.imageUrl) {
      newMessageDetails.actionType = response.actionType;
      handleShowContentBox(contentBox, removeSelectedContent);
      imageContainer.style.display = "flex";
      let div = document.createElement("div");
      let imgTag = document.createElement("img");
      imgTag.src = response.imageUrl;
      imgTag.alt = "image";
      div.appendChild(imgTag);
      imageContainer.appendChild(div);
      const { secureURL } = await uploadToCloudinary(
        response.imageUrl,
        {},
        sendBtn
      );
      imgTag.src = secureURL;
      UPLOADED_DOCUMENTS.push(secureURL);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // await chrome.storage.local.set({loggedInUser: {}});
  const user = await getUserInfo();
  userDetails = user;

  chrome.storage.local.get(
    ["deepResearch", "factCheck", "quickSearch"],
    (result) => {
      if (
        result.deepResearch == null ||
        result.quickSearch == null ||
        result.factCheck == null
      ) {
        chrome.storage.local.set(
          { deepResearch: false, quickSearch: true, factCheck: false },
          (newRes) => {
            deepResearchStatus = newRes.deepResearch;
            quickSearchStatus = newRes.quickSearch;
            factCheckStatus = newRes.factCheck;
          }
        );
      } else {
        deepResearchStatus = result.deepResearch;
        quickSearchStatus = result.quickSearch;
        factCheckStatus = result.factCheck;
      }
      refreshElements();
      updateContent();
      renderChats(chatsContainer, userDetails, chatsMap);
    }
  );

  chrome.runtime.onMessage.addListener((message) => {
    if (
      message.action === "contentUpdated" 
    ) {
      searchTextarea.value = "";
      updateContent();
    }
  });
});
