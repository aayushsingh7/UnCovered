import { marked } from "../../libs/marked.esm.js";
import { handleNewChatBtnClick } from "../../panel.js";
import { deleteChat, fetchAllChats, fetchMessages } from "../api/api.js";
import { generateRandomId, replaceWithClickableLink } from "../utils.js";

export function handleAdjustHeight(searchTextarea) {
  searchTextarea.style.height = "50px";
  const scrollHeight = searchTextarea.scrollHeight;
  const newHeight = Math.min(Math.max(50, scrollHeight), 200);
  searchTextarea.style.height = newHeight + "px";
}

export function handleMenuBarClick(sideNavbar) {
  sideNavbar.classList.add("show-sidenav");
}

export function handleCloseMenuBarClick(sideNavbar) {
  sideNavbar.classList.remove("show-sidenav");
}

export function handleRemoveSelectedContent(
  contentBox,
  removeSelectedContent,
  newMessageDetails,
  UPLOADED_DOCUMENTS,
  imageContainer
) {
  newMessageDetails.selectedText = "";
  UPLOADED_DOCUMENTS.length = 0;
  contentBox.style.display = "none";
  removeSelectedContent.style.display = "none";
  imageContainer.innerHTML = "";
  imageContainer.style.display = "none";
}

export function handleSettingsBtnClick(sideNavbar, settingsContainer) {
  sideNavbar.classList.remove("show-sidenav");
  settingsContainer.style.display = "flex";
}

export function handleSettingsContainerClick(settingsContainer) {
  settingsContainer.style.display = "none";
}

export function updateToggle(element, status) {
  element.innerText = status ? "ON" : "OFF";
  element.classList.toggle("on", status);
}

export function handleContentBoxDisplay(
  type,
  searchTextarea,
  prevCustomInput,
  contentBox,
  removeSelectedContent
) {
  if (type === "show") {
    searchTextarea.value = prevCustomInput ? prevCustomInput : "";
    handleShowContentBox(contentBox, removeSelectedContent);
  } else {
    searchTextarea.value = "";
    contentBox.classList.remove("show-content-box");
    contentBox.style.display = "none";
    removeSelectedContent.style.display = "none";
  }
}

export function handleShowContentBox(contentBox, removeSelectedContent) {
  contentBox.style.display = "block";
  removeSelectedContent.style.display = "block";
  contentBox.classList.add("show-content-box");
}

export function removeListeners(
  {
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
  },
  handlers
) {
  if (chatsContainer)
    chatsContainer.removeEventListener("click", handlers.handleChatBoxClick);

  if (uploadFileBtn)
    uploadFileBtn.removeEventListener("click", handlers.handleUploadFile);
  if (uploadFileInput)
    uploadFileInput.removeEventListener("change", handlers.handleUploadFile);
  queryTypes.forEach((span) =>
    span.removeEventListener("click", handlers.handleQueryTypeClick)
  );
  if (searchTextarea) {
    searchTextarea.removeEventListener("input", handlers.handleAdjustHeight);
    searchTextarea.removeEventListener("focus", handlers.handleAdjustHeight);
  }
  if (menuBar)
    menuBar.removeEventListener("click", handlers.handleMenuBarClick);
  if (closeMenuBar)
    closeMenuBar.removeEventListener("click", handlers.handleCloseMenuBarClick);
  if (sendBtn)
    sendBtn.removeEventListener("click", handlers.handleSendBtnClick);
  if (removeSelectedContent)
    removeSelectedContent.removeEventListener(
      "click",
      handlers.handleRemoveSelectedContent
    );
  if (newChatBtn)
    newChatBtn.removeEventListener("click", handlers.handleNewChatBtnClick);
  if (deepResearch)
    deepResearch.removeEventListener("click", handlers.handleDeepResearchClick);
  if (quickSearch)
    quickSearch.removeEventListener("click", handlers.handleQuickSearchClick);
  if (factCheck)
    factCheck.removeEventListener("click", handlers.handleFactCheckClick);
  if (settingsBtn)
    settingsBtn.removeEventListener("click", handlers.handleSettingsBtnClick);
  if (settingsContainer)
    settingsContainer.removeEventListener(
      "click",
      handlers.handleSettingsContainerClick
    );
  if (analyzeScreenBtn)
    analyzeScreenBtn.removeEventListener("click", handlers.analyzeScreen);
}

export function addListeners(
  {
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
  },
  handlers
) {
  if (searchChatsAndMessagesInput)
    searchChatsAndMessagesInput.addEventListener(
      "keydown",
      handlers.searchChatsAndMessages
    );

  if (chatsContainer)
    chatsContainer.addEventListener("click", handlers.handleChatBoxClick);

  if (uploadFileBtn)
    uploadFileBtn.addEventListener("click", handlers.openDailogBox);
  if (uploadFileInput)
    uploadFileInput.addEventListener("change", handlers.handleUploadFile);
  if (analyzeScreenBtn) {
    analyzeScreenBtn.addEventListener("click", handlers.analyzeScreen);
  }

  queryTypes.forEach((span) => {
    span.addEventListener("click", handlers.handleQueryTypeClick);
  });

  if (searchTextarea) {
    searchTextarea.addEventListener("input", handlers.handleAdjustHeight);
    searchTextarea.addEventListener("focus", handlers.handleAdjustHeight);
  }
  if (menuBar) menuBar.addEventListener("click", handlers.handleMenuBarClick);
  if (closeMenuBar)
    closeMenuBar.addEventListener("click", handlers.handleCloseMenuBarClick);
  if (sendBtn) sendBtn.addEventListener("click", handlers.handleSendBtnClick);
  if (removeSelectedContent)
    removeSelectedContent.addEventListener(
      "click",
      handlers.handleRemoveSelectedContent
    );
  if (newChatBtn)
    newChatBtn.addEventListener("click", handlers.handleNewChatBtnClick);
  if (deepResearch)
    deepResearch.addEventListener("click", handlers.handleDeepResearchClick);
  if (quickSearch)
    quickSearch.addEventListener("click", handlers.handleQuickSearchClick);
  if (factCheck)
    factCheck.addEventListener("click", handlers.handleFactCheckClick);
  if (settingsBtn)
    settingsBtn.addEventListener("click", handlers.handleSettingsBtnClick);
  if (settingsContainer)
    settingsContainer.addEventListener(
      "click",
      handlers.handleSettingsContainerClick
    );
}

export function handleQueryTypeClick(e, queryTypes, newMessageDetails) {
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

export function handleSelectedActionType(queryTypes, response) {
  queryTypes.forEach((span) => {
    if (span.dataset.name === response.actionType) {
      span.classList.add("active-query-type");
    } else {
      span.classList.remove("active-query-type");
    }
  });
}

export function createSourceBox(fetchLinkDetails) {
  const sourceBox = document.createElement("div");
  sourceBox.className = "source-box";

  const sourceHeader = document.createElement("div");
  sourceHeader.className = "source-header";

  const img = document.createElement("img");
  img.src = fetchLinkDetails.logo.url;
  img.alt = "";

  const sourceTitle = document.createElement("div");
  sourceTitle.className = "source-title";

  const titleSpan = document.createElement("span");
  titleSpan.className = "title";
  titleSpan.textContent = fetchLinkDetails.publisher;

  const sourceLink = document.createElement("a");
  sourceLink.href = fetchLinkDetails.url;
  sourceLink.className = "source-link";
  sourceLink.textContent = fetchLinkDetails.url;

  sourceTitle.appendChild(titleSpan);
  sourceTitle.appendChild(sourceLink);

  sourceHeader.appendChild(img);
  sourceHeader.appendChild(sourceTitle);

  const sourceInfo = document.createElement("div");
  sourceInfo.className = "source-info";

  const headline = document.createElement("a");
  headline.textContent = fetchLinkDetails.title;

  const description = document.createElement("p");
  description.textContent = fetchLinkDetails.description;

  sourceInfo.appendChild(headline);
  sourceInfo.appendChild(description);

  sourceBox.appendChild(sourceHeader);
  if (fetchLinkDetails.title || fetchLinkDetails.description)
    sourceBox.appendChild(sourceInfo);

  return sourceBox;
}

export function createContentBox(
  customPrompt,
  newMessageDetails,
  resultsContainerObj,
  UPLOADED_DOCUMENTS
) {
  const randomId = generateRandomId();
  const mainBox = document.createElement("div");
  mainBox.className = "new-message";

  const contentBox = document.createElement("div");
  contentBox.id = `${randomId}`;
  contentBox.className = "content-box";
  contentBox.classList.add("message-box");

  // Content type section
  const contentType = document.createElement("div");
  contentType.className = "content-type";

  const actionTag = document.createElement("span");
  actionTag.className = "action-tag";
  const actionTagArr = newMessageDetails.actionType.split("-");
  const capitalize = (word) =>
    word[0].toUpperCase() + word.slice(1).toLowerCase();
  actionTag.innerText =
    capitalize(actionTagArr[0]) + " " + capitalize(actionTagArr[1]);

  contentType.appendChild(actionTag);
  if (newMessageDetails.actionType !== "user-query") {
    contentBox.appendChild(contentType);
  }

  const prompt = document.createElement("p");
  prompt.className = "custom-prompt";
  prompt.textContent = customPrompt;
  contentBox.appendChild(prompt);

  const contentContainer = document.createElement("div");
  contentContainer.className = "content-container";
  if (newMessageDetails.selectedText) {
    const selectedText = document.createElement("div");
    selectedText.className = "selected-text";
    selectedText.innerText = newMessageDetails.selectedText;
    contentContainer.appendChild(selectedText);
  }

  contentBox.appendChild(contentContainer);
  const resultsContainer = document.createElement("div");
  resultsContainer.className = "results-container markdown-body";
  const resultTabs = document.createElement("div");
  resultTabs.className = "result-tabs";

  const tab1 = document.createElement("span");
  tab1.className = "tab active";
  tab1.textContent = "Answer";
  tab1.dataset.tab = "answer";

  const tab2 = document.createElement("span");
  tab2.className = "tab";
  tab2.textContent = "Sources";
  tab2.dataset.tab = "sources";
  tab2.style.display = "none";

  resultTabs.appendChild(tab1);
  const resultsContent = document.createElement("div");
  resultsContent.className = "results-content";

  const panel1 = document.createElement("div");
  panel1.className = "tab-panel";
  panel1.dataset.tab = "answer";
  panel1.textContent = newMessageDetails.actionType.startsWith("Deep")
    ? "Deep research may take 3 to 5 minutes..."
    : "Generating response...";
  panel1.style.display = "block";

  const panel2 = document.createElement("div");
  panel2.className = "tab-panel";
  panel2.dataset.tab = "sources";
  panel2.style.display = "none";

  resultsContent.appendChild(panel1);
  resultsContent.appendChild(panel2);

  resultsContainer.appendChild(resultTabs);
  resultsContainer.appendChild(resultsContent);
  contentBox.appendChild(resultsContainer);
  mainBox.appendChild(contentBox);

  if (UPLOADED_DOCUMENTS.length > 0) {
    const tab3 = document.createElement("span");
    tab3.className = "tab";
    tab3.textContent = "Attachments";
    tab3.dataset.tab = "attachments";
    resultTabs.appendChild(tab3);

    const panel3 = document.createElement("div");
    panel3.className = "tab-panel attachments";
    panel3.dataset.tab = "attachments";
    UPLOADED_DOCUMENTS.map((image, index) => {
      const img = document.createElement("img");
      img.src = image;
      img.alt = "uploaded image " + (index + 1);
      panel3.appendChild(img);
    });
    panel3.style.display = "none";
    resultsContent.appendChild(panel3);
  }
  resultTabs.appendChild(tab2);
  resultsContainerObj.tab1 = tab1;
  resultsContainerObj.tab2 = tab2;
  resultsContainerObj.panel1 = panel1;
  resultsContainerObj.panel2 = panel2;

  return { mainBox, contentType };
}

export function createChatBox(newChat) {
  const chatDiv = document.createElement("div");
  chatDiv.className = "chat";
  chatDiv.id = newChat.chatID;
  const h4 = document.createElement("h4");
  h4.innerText = newChat.title;
  chatDiv.appendChild(h4);
  const deleteButton = document.createElement("button");
  deleteButton.classList = "delete-btn";
  deleteButton.innerText = "Delete";
  chatDiv.appendChild(deleteButton);
  return chatDiv;
}

export function newChatLayout(userInfo) {
  return `
   <div class="toast-container" id="toastContainer"></div>
    <header class="header">
      <nav>
        <img src="./assets/menu.svg" alt="" id="menu" />
        <h3>FactSnap</h3>
        <div>
        <img src="./assets/capture-ss.svg" title="Capture Screen" alt="ss" id="captureBtn" />
        </div>
      </nav>
    </header>

    <div class="settings-contanier" id="settings-contanier"">
      <div class="settings-box">
        <h2>Settings</h2>
        <div class="options-container">
          <h3>Auto Send Query</h3>
          <p>
            When enabled, your query will be automatically submitted to the AI
            without any additional prompts or instructions. This feature is
            ideal for fast, instant responses.
          </p>
          <div class="options">
            <div>
              <h4>Deep Research</h4>
              <button  id="deep-research-settings-btn">OFF</button>
            </div>

            <div>
              <h4>Fact-Checking</h4>
              <button  id="fact-check-settings-btn">OFF</button>
            </div>

            <div>
              <h4>Quick Search</h4>
              <button id="quick-search-settings-btn">OFF</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sidenav" id="sidenav">
      <div class="header">
        <input type="text" placeholder="Search Any Chat" id="search-chats-and-messages"/>
        <img src="./assets/close.svg" alt="" id="close-btn" />
      </div>

      <button class="create-new-chat-button" id="new-chat">
        <img src="./assets/new-chat.svg"/>
        <h4>New Chat</h4>
      </button>

      <div class="chats" id="chats-container"></div>

      <div class="settings" id="settings-btn">
      <img src="./assets/settings.svg"/>
      <h4>Settings</h4>
      </div>
    </div>

    <div class="messages" id="messages-container">
      <div class="intro" id="intro">
  <h3>Hey there, ${userInfo?.name?.split(" ")[0]}! 👋</h3>
  <p>It's so lovely to see you here. 💫 How can I make your day better today? 😊</p>
</div>

    </div>

    <div class="search-box" id="search-box">
    <button class="remove-selected-text" id="remove-selected-text"><img src="./assets/close.svg" alt="close"/></button>
      <div class="content-box" id="content-box">
        <div id="content-type" class="content-type">
          <span id="content-label" class="content-label"
            >Selected Content:</span
          >
        </div>

        <div id="content-container" class="content-container">
          <div id="selected-text" class="selected-text"></div>
          <div id="selected-image-container" class="selected-image-container">
          </div>
          <div id="no-content" class="no-selection">
            No content selected. Please select text or an image on a webpage,
            right-click, and choose a FactSnap option.
          </div>
        </div>
      </div>

     <div class="input-container">
      <textarea id="search-input" style="overflow-y: auto; max-height: 150px; resize: none;" placeholder="Ask Anything..."></textarea>
      <div class="input-container-options">
      <div class="query-types">
  
  <input type="file" id="upload-input" style="display: none;" />
<span data-name="upload-file" title="Upload File" id="upload-btn">
  <img src="./assets/add.svg" alt=""/>
</span>

      <span data-name="quick-search" title="Quick Search" ><img src="./assets/quick.svg" alt=""/></span>
      <span data-name="fact-check" title="Fact Check"><img src="./assets/fact.svg" alt=""/></span>
      <span data-name="deep-research" title="Deep Research" id="deep-research-option"><img src="./assets/deep.svg" alt=""/></span>
      </div>
      <button id="send-btn"><img src="./assets/send.svg" alt="send"/></button>
      </div>
    </div>
    `;
}

function renderMessages(messages) {
  return messages
    .map((message) => {
      let factVerdict =
        message.actionType === "fact-check"
          ? message.verdict === "true"
            ? "Fact is True"
            : message.verdict === "false"
            ? "Fact is False"
            : "Not Confirmed"
          : "";
      let rawHTML = replaceWithClickableLink(message.answer, message.sources);
      rawHTML = marked.parse(rawHTML);
      return `
    <div>
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
            ${
              message.documents.length > 0
                ? `<span class="tab" data-tab="attachments">Attachments</span>`
                : ""
            }
            <span class="tab" data-tab="sources" >Sources</span>
          </div>
          <div class="results-content">
            <div class="tab-panel" data-tab="answer" style="display: block;">
              ${rawHTML}
            </div> 
                 <div
                   class="tab-panel attachments"
                   data-tab="attachments"
                   style="display:none;"
                 >
                  ${message?.documents
                    ?.map((image, index) => {
                      return `<img src="${image}" alt="uploaded image ${
                        index + 1
                      }" />`;
                    })
                    .join("")}
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
}

export async function renderChats(chatsContainer, userDetails, chatsMap) {
  chatsContainer.innerHTML += `<div class="loading-sources"><div class="loader"></div></div>`;
  let chats = await fetchAllChats(userDetails._id);
  chatsContainer.innerHTML = "";
  if (chats?.length == 0) {
    chatsContainer.innerHTML = `<div class="no-chats-found"><img src="./assets/no-chats.svg" alt="no chat"/> <h4>No Chats Found</h4></div>`;
  } else {
    chats?.map((chat) => {
      chatsMap.set(chat.chatID, chat);
      chatsContainer.appendChild(createChatBox(chat));
    });
  }
}

export async function handleChatBoxClick(
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
) {
  const chatElement = e.target.closest(".chat");
  if (!chatElement) return;

  const chatID = chatElement.id;
  const chat = chatsMap.get(chatID);
  messagesContainer.innerHTML = `<div class="loading-sources"><div class="loader"></div></div>`;
  if (e.target.closest(".delete-btn")) {
    e.stopPropagation();
    deleteChat(chatID, sideNavbar);
    chatsContainer.removeChild(chatElement);
    selectedChat.chatID = null;
    selectedChat.title = ""
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
    });
    return;
  }
  sideNavbar.classList.remove("show-sidenav");
  selectedChat.chatID = chat.chatID;
  selectedChat.title = chat.title;
  highlightSelectedChat(chatID, chatsContainer);
  const messages = await fetchMessages(chatID);

  messages.forEach((message) => {
    const USER_MESSAGE = {
      role: "user",
      content: [
        {
          type: "text",
          text: `Query Type: ${message.actionType}
User Prompt: ${message.prompt}
User Context: ${message.selectedText || "No Additional Context Provided"}`,
        },
        ...message.documents.map((imageLink) => ({
          type: "image_url",
          image_url: { url: imageLink },
        })),
      ],
    };

    const ASSISTANT_MESSAGE = {
      role: "assistant",
      content: `Answer: ${message.responseRawJSON}`,
    };

    CHAT_HISTORY.push(USER_MESSAGE, ASSISTANT_MESSAGE);
  });

  if (CHAT_HISTORY.length > 6) {
    CHAT_HISTORY.splice(0, CHAT_HISTORY.length - 6);
  }

  messagesContainer.innerHTML = "";
  messagesContainer.innerHTML = renderMessages(messages);
  messagesContainer.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
  });
  newMessageDetails.actionType = "quick-search";
  newMessageDetails.selectedText = "";
  handleContentBoxDisplay(
    "hide",
    searchTextarea,
    prevCustomInput,
    contentBox,
    removeSelectedContent
  );
  selectedChat = chat;
}

export function highlightSelectedChat(chatID, chatsContainer) {
  chatsContainer.querySelectorAll(".chat").forEach((chat) => {
    if (chat.id === chatID) {
      chat.classList.add("active-chat");
    } else {
      chat.classList.remove("active-chat");
    }
  });
}
