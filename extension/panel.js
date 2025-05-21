import { marked } from "./libs/marked.esm.js";
import {
  addNewMessageToDB,
  fetchAIResponse,
  fetchAllChats,
  fetchMessages,
} from "./utils/api/api.js";
import { getUserInfo } from "./utils/api/authApi.js";
import {
  addListeners,
  createContentBox,
  createSourceBox,
  handleAdjustHeight,
  handleCloseMenuBarClick,
  handleContentBoxDisplay,
  handleMenuBarClick,
  handleQueryTypeClick,
  handleRemoveSelectedContent,
  handleSelectedActionType,
  handleSettingsBtnClick,
  handleSettingsContainerClick,
  handleShowContentBox,
  removeListeners,
  updateToggle,
} from "./utils/helpers/domHelpers.js";
import {
  analyzeScreen,
  handleUploadFile,
  uploadToCloudinary,
} from "./utils/helpers/fileHelpers.js";
import { fetchSourceDetails, replaceWithClickableLink } from "./utils/utils.js";

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
  uploadFileBtn;

let userDetails = {};
let selectedChat = {};
let prevCustomInput = null;
let loadingAiResponse = false;

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

let CHAT_HISTORY = [];
let UPLOADED_DOCUMENTS = [];

marked.setOptions({
  highlight: function (code, lang) {
    return hljs.highlightAuto(code).value;
  },
  langPrefix: "hljs language-",
});

function handleSendBtnClick(e) {
  if (!loadingAiResponse) {
    addNewMessage(searchTextarea.value);
    searchTextarea.style.height = "50px";
  }
}

function handleNewChatBtnClick() {
  messagesContainer.innerHTML = `
    <div class="intro" id="intro">
      <h3>Hey there, ${userDetails?.name?.split(" ")[0]}! 👋</h3>
      <p>
        It's so lovely to see you here. 💫 How can I make your day better today?
        😊
      </p>
    </div>
  `;
  refreshElements();
  newMessageDetails.actionType = "quick-search";
  handleRemoveSelectedContent(
    contentBox,
    removeSelectedContent,
    newMessageDetails,
    UPLOADED_DOCUMENTS,
    imageContainer
  );
  searchTextarea.value = "";
  selectedChat = {};
  handleSelectedActionType(queryTypes, { actionType: "quick-search" });
}

function handleDeepResearchClick(e) {
  e.stopPropagation();
  deepResearchStatus = !deepResearchStatus;
  updateToggle(deepResearch, deepResearchStatus);
  chrome.storage.local.set({ deepResearch: deepResearchStatus });
}

function handleQuickSearchClick(e) {
  e.stopPropagation();
  quickSearchStatus = !quickSearchStatus;
  updateToggle(quickSearch, quickSearchStatus);
  chrome.storage.local.set({ quickSearch: quickSearchStatus });
}

function handleFactCheckClick(e) {
  e.stopPropagation();
  factCheckStatus = !factCheckStatus;
  updateToggle(factCheck, factCheckStatus);
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
  removeSelectedContent = document.getElementById("remove-selected-text");
  settingsBtn = document.getElementById("settings-btn");
  settingsContainer = document.getElementById("settings-contanier");
  deepResearch = document.getElementById("deep-research");
  quickSearch = document.getElementById("quick-search");
  factCheck = document.getElementById("fact-check");
  newChatBtn = document.getElementById("new-chat");
  chatsContainer = document.getElementById("chats-container");
  queryTypes = document.querySelectorAll(".query-types span");
  sendBtn = document.getElementById("send-btn");
  analyzeScreenBtn = document.getElementById("captureBtn");
  uploadFileInput = document.getElementById("upload-input");
  uploadFileBtn = document.getElementById("upload-btn");

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
    };

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
      handleNewChatBtnClick,
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
          UPLOADED_DOCUMENTS
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
          UPLOADED_DOCUMENTS
        ),
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
  let populatingSourcesLoading = false;
  sendBtn.innerHTML = `<img alt="pause" src="./assets/pause.svg" />`;
  const populatedSources = [];
  const LINKS = extractLinks(
    customPrompt + " " + newMessageDetails.selectedText
  );

  if (CHAT_HISTORY.length > 5) {
    CHAT_HISTORY = CHAT_HISTORY.slice(2);
  }
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
      top: newMessageBox.offsetTop - 70,
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
          sendBtn.innerHTML = "Send";
          let replaceWithLink = replaceWithClickableLink(
            data.cleanContent,
            data.citations
          );
          let markedHTML = marked(replaceWithLink);
          resultsContainerObj.panel1.innerHTML = markedHTML;
          if (data.verdict && contentType.childNodes.length == 1) {
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
            console.log("============================================");
            resultsContainerObj.tab2.style.display = "block";
            resultsContainerObj.panel2.innerHTML += `<div class="loading-sources"><div class="loader"></div></div>`;
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
          console.warn("Error while streamining");
          console.error(err.message);
        }
      },
      async (completeData) => {
        try {
          const { newChat, newMessage } = await addNewMessageToDB(
            completeData.verdict,
            userDetails._id,
            selectedChat.chatID,
            customPrompt,
            completeData.cleanContent,
            completeData.content,
            populatedSources,
            UPLOADED_DOCUMENTS,
            newMessageDetails.selectedText,
            customPrompt,
            newMessageDetails.actionType
          );
          if (newChat != null) selectedChat = newChat;
          if (!newMessage) {
            handleContentBoxDisplay(
              "show",
              searchTextarea,
              prevCustomInput,
              contentBox,
              removeSelectedContent
            );
            alert("Oops! looks like something went wrong🤦‍♀️");
            return;
          }

          const { responseRawJSON } = newMessage;
          const ASSISTANT_MESSAGE = {
            role: "assistant",
            content: `Answer: ${responseRawJSON}`,
          };
          CHAT_HISTORY.push(ASSISTANT_MESSAGE);

          newMessageDetails = {
            selectedText: "",
            actionType: "",
          };

          resultsContainerObj = {
            tab1: null,
            tab2: null,
            tab3: null,
            panel1: null,
            panel2: null,
            panel3: null,
          };

          messagesContainer.scrollTo({
            top: newMessageBox.offsetTop - 70,
            behavior: "smooth",
          });

          loadingAiResponse = false;
          populatingSourcesLoading = false;
          sendBtn.innerHTML = `<img alt="send" src="./assets/send.svg" />`;
        } catch (err) {
          console.warn("Error while completing the message process");
          console.error(err.message);
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
    console.log(err);
    alert("Oops! something went wrong");
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
      const { secureURL } = await uploadToCloudinary(response.imageUrl);
      imgTag.src = secureURL;
      UPLOADED_DOCUMENTS.push(secureURL);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  hljs.configure({
    tabReplace: "  ",
    classPrefix: "hljs-",
  });
  hljs.highlightAll();

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
    }
  );

  chrome.runtime.onMessage.addListener((message) => {
    if (
      message.action === "contentUpdated" ||
      message.action === "textUpdated"
    ) {
      chrome.storage.local.get(
        ["selectedText", "selectedImage", "contentType", "actionType"],
        (data) => {}
      );
      searchTextarea.value = "";
      updateContent();
    }
  });

  let chats = await fetchAllChats(userDetails._id);
  chatsContainer.innerHTML += chats
    .map(
      (chat) => `
    <div class="chat" id="${chat.chatID}">
      <h4>${chat.title}</h4>
      <button class="delete-btn">Delete</button>
    </div>
  `
    )
    .join("");

  chats.forEach((chat) => {
    const chatElement = document.getElementById(chat.chatID);
    chatElement.addEventListener("click", async () => {
      selectedChat = chat;
      const messages = await fetchMessages(chat.chatID);
      messagesContainer.innerHTML = messages
        .map((message) => {
          let factVerdict =
            message.actionType === "fact-check"
              ? message.verdict === "true"
                ? "Fact is True"
                : message.verdict === "false"
                ? "Fact is False"
                : "Not Confirmed"
              : "";
          let rawHTML = replaceWithClickableLink(
            message.answer,
            message.sources
          );
          rawHTML = marked.parse(rawHTML);
          return `
    <div class="new-message">
      <div id="random-id-placeholder" class="content-box message-box">
        <div class="content-type">
        ${
          message.actionType != "user-query"
            ? `<span class="action-tag">${
                message.actionType == "fact-check"
                  ? "Fact Check"
                  : message.actionType == "deep-research"
                  ? "Deep Research"
                  : "Quick Search"
              }</span>`
            : ""
        }
        ${
          message.actionType == "fact-check"
            ? `<span class="final-fact-verdict ${message.verdict}">${factVerdict} </span>`
            : ""
        }
        </div>
        ${
          message.prompt ? `<p class="custom-prompt">${message.prompt}</p>` : ""
        }
        <div class="content-container">
          ${
            message.imageURL
              ? `
          <div class="selected-image-container">
            <img class="selected-image" src="" alt="Selected image" />
          </div>`
              : ""
          }
          ${
            message.selectedText?.trim()
              ? `<div class="selected-text">${message.selectedText?.trim()}</div>`
              : ""
          }
        </div>
        <div class="results-container markdown-body">
          <div class="result-tabs">
            <span class="tab active" data-tab="answer">Answer</span>
            <span class="tab" data-tab="sources" >Sources</span>
          </div>
          <div class="results-content">
            <div class="tab-panel" data-tab="answer" style="display: block;">
              ${rawHTML}
            </div>
            <div class="tab-panel" data-tab="sources" style="display:none;">
              ${message.sources
                .map(createSourceBox)
                .map((el) => el.outerHTML)
                .join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
        })
        .join("");

      newMessageDetails.actionType = "quick-search";
      newMessageDetails.selectedText = "";
      handleContentBoxDisplay(
        "hide",
        searchTextarea,
        prevCustomInput,
        contentBox,
        removeSelectedContent
      );

      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
      });
    });

    const deleteBtn = chatElement.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // deleteChat(chat.chatID);
    });
  });
});
