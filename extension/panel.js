import { marked } from "./libs/marked.esm.js";
import {
  createContentBox,
  createSourceBox,
  fetchSourceDetails,
  formatAiResponse,
  generateRandomId,
  getReadableDomain,
  newChatLayout,
  replaceWithClickableLink,
} from "./utils/helpers.js";
import {
  fetchAIResponse,
  fetchAllChats,
  fetchChat,
  fetchMessages,
  searchChat,
  verifyOrCreateUser,
} from "./utils/api.js";

marked.setOptions({
  highlight: function (code, lang) {
    return hljs.highlightAuto(code).value;
  },
  langPrefix: "hljs language-",
});

function renderSourceBox(source) {
  return `
    <div class="source-box">
      <div class="source-header">
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500" alt="" />
        <div class="source-title">
          <span class="title">${getReadableDomain(source.url)}</span>
          <a href="${source.url}" class="source-link">
           ${source.url}
          </a>
        </div>
      </div>
      <div class="source-info">
        ${source.heading ? '<a href="#">Headline Placeholder</a>' : ""}
        ${
          source.description
            ? "<p>Description text placeholder goes here.</p>"
            : ""
        }
      </div>
    </div>
  `;
}

// Declare variables outside the function
let textElement,
  imageContainer,
  imageElement,
  noContentElement,
  actionTagElement,
  messagesContainer,
  contentBox,
  sideNavbar,
  menuBar,
  closeMenuBar,
  searchBox,
  searchTextarea,
  removeSelectedText,
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
  sendBtn;


function handleQueryTypeClick(e) {
  if (e.target.tagName === "SPAN") {
    queryTypes.forEach((s) => s.classList.remove("active-query-type"));
    newMessageDetails.actionType = e.target.dataset.name;
    e.target.classList.add("active-query-type");
  } else if (e.target.tagName === "IMG") {
    queryTypes.forEach((s) => s.classList.remove("active-query-type"));
    const parent = e.target.closest("span");
    newMessageDetails.actionType = parent.dataset.name;
    if (parent) {
      parent.classList.add("active-query-type");
    }
  }
}

function handleAdjustHeight() {
  searchTextarea.style.height = "50px";
  const scrollHeight = searchTextarea.scrollHeight;
  const newHeight = Math.min(Math.max(50, scrollHeight), 200);
  searchTextarea.style.height = newHeight + "px";
}

function handleMenuBarClick() {
  sideNavbar.classList.add("show-sidenav");
}

function handleCloseMenuBarClick() {
  sideNavbar.classList.remove("show-sidenav");
}

function handleSendBtnClick(e) {
  addNewMessage(searchTextarea.value);
  searchTextarea.style.height = "50px";
}

function handleRemoveSelectedTextClick() {
  newMessageDetails.selectedText = "";
  contentBox.style.display = "none";
  removeSelectedText.style.display = "none";
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
  newMessageDetails.selectedText = "";
  searchTextarea.value = "";
  contentBox.style.display = "none";
  removeSelectedText.style.display = "none";
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

function handleSettingsBtnClick() {
  sideNavbar.classList.remove("show-sidenav");
  settingsContainer.style.display = "flex";
  updateToggle(factCheck, factCheckStatus);
  updateToggle(quickSearch, quickSearchStatus);
  updateToggle(deepResearch, deepResearchStatus);
}

function handleSettingsContainerClick() {
  settingsContainer.style.display = "none";
}

function refreshElements() {
  textElement = document.getElementById("selected-text");
  imageContainer = document.getElementById("selected-image-container");
  imageElement = document.getElementById("selected-image");
  noContentElement = document.getElementById("no-content");
  actionTagElement = document.getElementById("action-tag");
  messagesContainer = document.getElementById("messages-container");
  contentBox = document.getElementById("content-box");
  sideNavbar = document.getElementById("sidenav");
  menuBar = document.getElementById("menu");
  closeMenuBar = document.getElementById("close-btn");
  searchBox = document.getElementById("search-box");
  searchTextarea = document.getElementById("search-input") || null;
  removeSelectedText = document.getElementById("remove-selected-text");
  settingsBtn = document.getElementById("settings-btn");
  settingsContainer = document.getElementById("settings-contanier");
  deepResearch = document.getElementById("deep-research");
  quickSearch = document.getElementById("quick-search");
  factCheck = document.getElementById("fact-check");
  newChatBtn = document.getElementById("new-chat");
  chatsContainer = document.getElementById("chats-container");
  queryTypes = document.querySelectorAll(".query-types span");
  sendBtn = document.getElementById("send-btn");

  if (userDetails.email) {
    // Remove old listeners
    queryTypes.forEach((span) => {
      span.removeEventListener("click", handleQueryTypeClick);
    });
    if (searchTextarea) {
      searchTextarea.removeEventListener("input", handleAdjustHeight);
      searchTextarea.removeEventListener("focus", handleAdjustHeight);
    }
    if (menuBar) menuBar.removeEventListener("click", handleMenuBarClick);
    if (closeMenuBar)
      closeMenuBar.removeEventListener("click", handleCloseMenuBarClick);
    if (sendBtn) sendBtn.removeEventListener("click", handleSendBtnClick);
    if (removeSelectedText)
      removeSelectedText.removeEventListener(
        "click",
        handleRemoveSelectedTextClick
      );
    if (newChatBtn)
      newChatBtn.removeEventListener("click", handleNewChatBtnClick);
    if (deepResearch)
      deepResearch.removeEventListener("click", handleDeepResearchClick);
    if (quickSearch)
      quickSearch.removeEventListener("click", handleQuickSearchClick);
    if (factCheck) factCheck.removeEventListener("click", handleFactCheckClick);
    if (settingsBtn)
      settingsBtn.removeEventListener("click", handleSettingsBtnClick);
    if (settingsContainer)
      settingsContainer.removeEventListener(
        "click",
        handleSettingsContainerClick
      );

    // Add listeners
    queryTypes.forEach((span) => {
      span.addEventListener("click", handleQueryTypeClick);
    });
    if (searchTextarea) {
      searchTextarea.addEventListener("input", handleAdjustHeight);
      searchTextarea.addEventListener("focus", handleAdjustHeight);
    }
    if (menuBar) menuBar.addEventListener("click", handleMenuBarClick);
    if (closeMenuBar)
      closeMenuBar.addEventListener("click", handleCloseMenuBarClick);
    if (sendBtn) sendBtn.addEventListener("click", handleSendBtnClick);
    if (removeSelectedText)
      removeSelectedText.addEventListener(
        "click",
        handleRemoveSelectedTextClick
      );
    if (newChatBtn) newChatBtn.addEventListener("click", handleNewChatBtnClick);
    if (deepResearch)
      deepResearch.addEventListener("click", handleDeepResearchClick);
    if (quickSearch)
      quickSearch.addEventListener("click", handleQuickSearchClick);
    if (factCheck) factCheck.addEventListener("click", handleFactCheckClick);
    if (settingsBtn)
      settingsBtn.addEventListener("click", handleSettingsBtnClick);
    if (settingsContainer)
      settingsContainer.addEventListener("click", handleSettingsContainerClick);

    // Initial height adjustment
    if (searchTextarea) handleAdjustHeight();
  }
}

// Helper function to update toggle status
function updateToggle(element, status) {
  element.innerText = status ? "ON" : "OFF";
  element.classList.toggle("on", status);
}

function handleSelectedActionType(queryTypes, response) {
  queryTypes.forEach((span) => {
    if (span.dataset.name === response.actionType) {
      span.classList.add("active-query-type");
    } else {
      span.classList.remove("active-query-type");
    }
  });
}

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

function handleContentBoxDisplay(type = "show") {
  if (type == "show") {
    searchTextarea.value = prevCustomInput ? prevCustomInput : "";
    contentBox.classList.add("show-content-box");
    contentBox.style.display = "block";
    removeSelectedText.style.display = "block";
  } else {
    searchTextarea.value = "";
    contentBox.classList.remove("show-content-box");
    contentBox.style.display = "none";
    removeSelectedText.style.display = "none";
  }
}

async function addNewMessage(customPrompt) {
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
      resultsContainerObj
    );
    messagesContainer.appendChild(newMessageBox);
    prevCustomInput = searchTextarea.value;
    handleContentBoxDisplay("hide");
    messagesContainer.scrollTo({
      top: newMessageBox.offsetTop - 70,
      behavior: "smooth",
    });

    const { newMessage, followUpQuestions, newChat } = await fetchAIResponse(
      userDetails._id,
      selectedChat.chatID,
      newMessageDetails.selectedText,
      customPrompt,
      newMessageDetails.actionType,
      null
    );
    if (newChat != null) selectedChat = newChat;
    if (!newMessage || !followUpQuestions) {
      handleContentBoxDisplay("show");
      alert("Oops! looks like something went wrong🤦‍♀️");
      return;
    }
    const { answer: markdown, sources } = newMessage;
    resultsContainerObj.tab2.style.display = "block";

    resultsContainerObj.panel2.innerHTML += sources
      ?.map(renderSourceBox)
      .join("");

    const editedHTML = replaceWithClickableLink(markdown, sources);
    const htmlContent = marked.parse(editedHTML);
    resultsContainerObj.panel1.innerHTML = htmlContent;

    if (newMessageDetails.actionType.startsWith("fact")) {
      contentType.innerHTML += `<div class='final-fact-verdict true'>${
        newMessage.verdict === "true"
          ? "Fact is True"
          : newMessage.verdict === "false"
          ? "Fact is False"
          : "Not Confirmed"
      }</div>`;
    }

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

    requestAnimationFrame(() => {
      messagesContainer.scrollTop = newMessage.offsetTop - 70;
    });
    loadingAiResponse = false;
  } catch (err) {
    handleContentBoxDisplay("show");
    console.log(err);
    alert("Oops! something went wrong");
  }
}

function updateContent() {
  if (!userDetails.email) return;
  textElement.style.display = "none";
  imageContainer.style.display = "none";
  noContentElement.style.display = "none";

  chrome.runtime.sendMessage({ action: "getContent" }, (response) => {
    if (chrome.runtime.lastError) {
      noContentElement.style.display = "block";
      noContentElement.textContent = "Error retrieving content.";
      return;
    }

    if (!response.contentType) return;

    if (response.contentType === "text" && response.text) {
      contentBox.style.display = "block";
      removeSelectedText.style.display = "block";
      contentBox.classList.add("show-content-box");
      textElement.style.display = "block";
      newMessageDetails.selectedText = response.text;
      textElement.textContent = response.text;
      handleSelectedActionType(queryTypes, response);

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
      contentBox.style.display = "block";
      removeSelectedText.style.display = "block";
      contentBox.classList.add("show-content-box");
      imageContainer.style.display = "block";
      imageElement.src = response.imageUrl;
      actionTagElement.textContent = "Image Analysis";
      actionTagElement.className = "action-tag image";
      newMessageDetails.actionType = "Image Analysis";
    } else {
      noContentElement.style.display = "block";
      noContentElement.textContent =
        "No content selected. Please select text or an image on a webpage, right-click, and choose a FactSnap option.";
      actionTagElement.textContent = "No Action";
      actionTagElement.className = "action-tag";
      newMessageDetails.actionType = "No Action";
    }
  });
}

async function fetchUserInfo(token) {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    const userInfo = await response.json();
    const dbUser = await verifyOrCreateUser(userInfo);

    await chrome.storage.local.set({
      loggedInUser: {
        name: dbUser.data.name,
        _id: dbUser.data._id,
        email: dbUser.data.email,
        lastLoggedInDate: new Date().toISOString(),
      },
    });

    chrome.storage.local.get(["loggedInUser"], (result) => {
      document.body.innerHTML = newChatLayout(result.loggedInUser);
      return result.loggedInUser;
    });
  } catch (err) {
    console.error("Failed to fetch user info:", err);
    return null;
  }
}

async function getUserInfo() {
  try {
    const result = await new Promise((resolve) =>
      chrome.storage.local.get(["loggedInUser"], resolve)
    );
    const user = result.loggedInUser;
    if (user && user._id && user.lastLoggedInDate) {
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const lastLogin = new Date(user.lastLoggedInDate).getTime();
      if (now - lastLogin < THIRTY_DAYS_MS) {
        document.body.innerHTML = newChatLayout(user);
        return user;
      }
    }
    document.body.innerHTML = `<div class="login">
      <h2>FactSnap Authentication</h2>
      <p>Please Wait, while we verify you...</p>
    </div>`;
    const token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError || !token) {
          return reject(chrome.runtime.lastError);
        }
        resolve(token);
      });
    });
    return await fetchUserInfo(token);
  } catch (error) {
    console.error("Authentication failed:", error);
    return null;
  }
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
              ${message.sources.map(renderSourceBox).join("")}
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
      handleContentBoxDisplay("hide");

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
