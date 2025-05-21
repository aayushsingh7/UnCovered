import { marked } from "./libs/marked.esm.js";
import {
  addNewMessageToDB,
  fetchAIResponse,
  fetchAllChats,
  fetchMessages,
  verifyOrCreateUser,
} from "./utils/api.js";
import {
  createContentBox,
  createSourceBox,
  fetchSourceDetails,
  fileToBase64,
  getReadableDomain,
  newChatLayout,
  replaceWithClickableLink,
  uploadToCloudinary,
} from "./utils/helpers.js";

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

function handleQueryTypeClick(e) {
  if (e.target.tagName === "SPAN" && !e.target.dataset.name == "upload-file") {
    queryTypes.forEach((s) => s.classList.remove("active-query-type"));
    newMessageDetails.actionType = e.target.dataset.name;
    e.target.classList.add("active-query-type");
  } else if (e.target.tagName === "IMG") {
    const parent = e.target.closest("span");
    if (parent.dataset.name == "upload-file") return;
    queryTypes.forEach((s) => s.classList.remove("active-query-type"));
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
  if (!loadingAiResponse) {
    addNewMessage(searchTextarea.value);
    searchTextarea.style.height = "50px";
  }
}

function handleRemoveSelectedContent() {
  newMessageDetails.selectedText = "";
  UPLOADED_DOCUMENTS = [];
  contentBox.style.display = "none";
  removeSelectedContent.style.display = "none";
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
  handleRemoveSelectedContent();
  // newMessageDetails.selectedText = "";
  // UPLOADED_DOCUMENTS = [];
  searchTextarea.value = "";
  // contentBox.style.display = "none";
  // removeSelectedContent.style.display = "none";
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

async function analyzeScreen() {
  chrome.runtime.sendMessage({ action: "captureScreen" }, async (response) => {
    if (response && response.screenshotUrl) {
      handleShowContentBox();
      imageContainer.style.display = "flex";
      newMessageDetails.selectedText = "";
      textElement.style.display = "none";
      let div = document.createElement("div");
      let imgTag = document.createElement("img");
      imgTag.src = response.screenshotUrl;
      imgTag.alt = "image";
      div.appendChild(imgTag);
      imageContainer.appendChild(div);
      const { secureURL } = await uploadToCloudinary(response.screenshotUrl);
      console.log(secureURL);
      imgTag.src = secureURL;
      UPLOADED_DOCUMENTS.push(secureURL);
    }
  });
}

async function openDailogBox() {
  uploadFileInput.click();
}

async function handleUploadFile(e) {
  handleShowContentBox();
  imageContainer.style.display = "flex";
  newMessageDetails.selectedText = "";
  textElement.style.display = "none";
  const base64 = await fileToBase64(e.target.files[0]);
  const extension = e.target.files[0].name.slice(
    e.target.files[0].name.lastIndexOf(".")
  );
  if (
    extension == ".PNG" ||
    extension == ".JPG" ||
    extension == ".WEBP" ||
    extension == ".JPEG"
  ) {
    let div = document.createElement("div");
    let imgTag = document.createElement("img");
    imgTag.src = base64;
    imgTag.alt = "image";
    div.appendChild(imgTag);
    imageContainer.appendChild(div);
    const { secureURL } = await uploadToCloudinary(base64);
    imgTag.src = secureURL;
    UPLOADED_DOCUMENTS.push(secureURL);
  } else {
    alert("Only images upload are supported for now");
  }
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
    // Remove old listeners
    if (uploadFileBtn)
      uploadFileBtn.removeEventListener("click", handleUploadFile);

    if (uploadFileInput)
      uploadFileInput.removeEventListener("change", handleUploadFile);

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
    if (removeSelectedContent)
      removeSelectedContent.removeEventListener(
        "click",
        handleRemoveSelectedContent
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
    if (analyzeScreenBtn)
      analyzeScreenBtn.removeEventListener("click", analyzeScreen);

    // Add listeners

    if (uploadFileBtn) uploadFileBtn.addEventListener("click", openDailogBox);
    if (uploadFileInput)
      uploadFileInput.addEventListener("change", handleUploadFile);
    if (analyzeScreenBtn)
      analyzeScreenBtn.addEventListener("click", analyzeScreen);

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
    if (removeSelectedContent)
      removeSelectedContent.addEventListener(
        "click",
        handleRemoveSelectedContent
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
    handleShowContentBox();
  } else {
    searchTextarea.value = "";
    contentBox.classList.remove("show-content-box");
    contentBox.style.display = "none";
    removeSelectedContent.style.display = "none";
  }
}

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
    handleContentBoxDisplay("hide");
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
            console.log("Verdict: ", data.verdict, contentType);
            contentType.innerHTML += `<div class="final-fact-verdict ${data.verdict}">${
              data.verdict == "true"
                ? "Fact is True"
                : data.verdict == "false"
                ? "Fact is False"
                : "Not Confirmed"
            }</div>`;
          }
          if (
            data.citations.length > 0 &&
            resultsContainerObj.panel2.childNodes.length == 0
          ) {
            resultsContainerObj.tab2.style.display = "block";
            resultsContainerObj.panel2.innerHTML += `<div class="loading-sources"><div class="loader"></div></div>`;
            resultsContainerObj.tab2.style.display = "block";
            data.citations.map(async (source, index) => {
              if (index < 2) {
                const populatedSource = await fetchSourceDetails(source);
                resultsContainerObj.panel2.appendChild(
                  createSourceBox(populatedSource)
                );
                populatedSources.push(populatedSource);
              }
              resultsContainerObj.panel2.innerHTML += `<a href="${source}">${source}</a>`;
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
            handleContentBoxDisplay("show");
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
        } catch (err) {
          console.warn("Error while completing the message process");
          console.error(err.message);
        }
      }
    );
  } catch (err) {
    handleContentBoxDisplay("show");
    console.log(err);
    alert("Oops! something went wrong");
  }
}

function handleShowContentBox() {
  contentBox.style.display = "block";
  removeSelectedContent.style.display = "block";
  contentBox.classList.add("show-content-box");
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
      handleShowContentBox();
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
      handleShowContentBox();
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
              ${message.sources.map(createSourceBox).join("")}
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
