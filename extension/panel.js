import { marked } from "./libs/marked.esm.js";
import {
  createContentBox,
  createSourceBox,
  fetchSourceDetails,
  formatAiResponse,
  generateRandomId,
  getReadableDomain,
  newChatLayout,
} from "./utils/helpers.js";
import {
  fetchAIResponse,
  fetchAllChats,
  fetchChat,
  searchChat,
} from "./utils/api.js";

const output =
  "<think>\n" +
  "Okay, let's tackle this query about the current and latest status of the India-Pakistan war-like situations. The user wants an up-to-date summary, so I need to focus on the most recent developments from the provided search results.\n" +
  "\n" +
  "First, looking at the search results, the ceasefire announced on May 10, 2025, seems central. Result [1] mentions that India accused Pakistan of violating the ceasefire hours after the agreement. Both sides are blaming each other, which indicates the situation remains tense. The U.S. involvement in brokering the deal is also a key point from [2] and [4].\n" +
  "\n" +
  "Next, the recent escalation started with the Pahalgam attack in April 2025, as per [3]. This attack led to skirmishes along the Line of Control. The Wikipedia entry [3] notes that the ceasefire was later violated by Pakistan, according to Indian claims. However, Pakistan denies this and claims India violated it first. This mutual accusation is crucial to highlight because it shows the fragility of the ceasefire.\n" +
  "\n" +
  "Result [4] from the Atlantic Council provides expert analysis, emphasizing the risk of escalation given both nations are nuclear-armed. Experts like Alex" +
  "Plitsas and Shuja Nawaz suggest steps for a more lasting peace, which adds depth to the answer. The mention of non-nuclear states in South Asia being affected is another layer to consider.\n" +
  "\n" +
  "I need to structure the answer to first summarize the current status, then detail the recent developments, the role of international mediation (especially the U.S.), and the ongoing risks. Including expert opinions will provide context on the potential future scenarios. Citations should be properly placed after each relevant fact, using the respective search result numbers.\n" +
  "\n" +
  "I should avoid any markdown headers as per the format rules and start with a brief summary. Then break down the sections into ceasefire developments, recent triggers, international mediation, and expert insights. Each section should have concise points with citations. Making sure to mention the mutual accusations and the nuclear aspect is vital for the user to understand the gravity.\n" +
  "\n" +
  "Also, checking the dates, all sources are from May 10 or 11, 2025, so the information is current. The ceasefire's fragility is a recurring theme across sources, so that's a key point. Lastly, the follow-up questions should prompt further exploration into specific aspects like U.S. mediation success chances or economic impacts.\n" +
  "</think>\n" +
  "\n" +
  "[\n" +
  '  "## Current Status of India-Pakistan Tensions\\n\\nAs of May 11, 2025, India and Pakistan remain locked in a fragile ceasefire brokered by the United States, with both sides accusing each other of violations hours after agreeing to de-escalate[1][2]. The situation remains precarious, marked by:\\n\\n- **Mutual ceasefire violations**: India claims Pakistan conducted border intrusions and fired missiles near Kashmir, while Pakistan denies violations and accuses India of initiating attacks[1][3].\\n- **Ongoing military readiness**: Both nations maintain heightened alert levels along their shared border and the Line of Control in Kashmir[4].\\n- **Diplomatic stalemate**: Communication channels remain strained despite U.S. mediation efforts, with no substantive dialogue initiated since the ceasefire announcement[2][4].\\n\\n## Key Recent Developments\\n**Immediate trigger**:\\n- The April 2025 Pahalgam attack killed 27 people in Indian-administered Kashmir,' +
  'with India blaming Pakistan-based militants[3].\\n- Subsequent cross-border shelling caused civilian casualties and military losses on both sides[3][4].\\n\\n**Ceasefire breakdown**:\\n- Within hours of the May 10 ceasefire announcement, India reported explosions in Kashmir Valley and retaliated[1].\\n- Pakistan claims 33 civilian deaths and 58 injuries from Indian strikes in Punjab province[3].\\n\\n## International Mediation\\n- The U.S. State Department confirmed **active negotiations** to prevent full-scale war[2][4].\\n- Experts warn the conflict risks becoming a **nuclear flashpoint**, with both nations possessing atomic weapons[2][4].\\n\\n## Expert Assessments\\n- **Alex Plitsas** (Atlantic Council): Emphasizes urgent need for third-party monitoring to prevent escalation[4].\\n- **Shuja Nawaz** (Security Analyst): Proposes focusing on water rights and trade to build lasting peace[4].\\n- **Rudabeh Shahid** (Geopolitical Researcher): Highlights collateral damage to Afghanistan and Bangladesh from economic fallout[4].",\n' +
  "  {\n" +
  '    "sources": [\n' +
  "      {\n" +
  '        "url": "https://www.cbsnews.com/news/pakistan-says-india-has-fired-missiles-on-its-air-bases/",\n' +
  '        "reference": "India accused Pakistan of violating ceasefire hours after agreement, with both sides exchanging fire in Kashmir region."\n' +
  "      },\n" +
  "       {\n" +
  '        "url": "https://en.wikipedia.org/wiki/2025_India%E2%80%93Pakistan_standoff",\n' +
  '        "reference": "Casualty figures and timeline of military engagements since April 2025 standoff."\n' +
  "      },\n" +
  "      {\n" +
  '        "url": "https://abcnews.go.com/International/india-pakistan-kashmir-conflict-threat/story?id=121656628",\n' +
  '        "reference": "U.S.-brokered ceasefire announced May 10, 2025 following weeks of escalating tensions after Pahalgam attack."\n' +
  "      },\n" +
  "      {\n" +
  '        "url": "https://www.atlanticcouncil.org/blogs/new-atlanticist/experts-react/india-pakistan-cease-fire-experts/",\n' +
  '        "reference": "Expert analyses on nuclear risks and recommendations for sustainable conflict resolution."\n' +
  "      }\n" +
  "    ]\n" +
  "  },\n" +
  "  {\n" +
  '    "tasks": [\n' +
  '      { "task": "Verified ceasefire timelines from multiple sources", "timeTaken": 1.8 },\n' +
  '      { "task": "Cross-referenced casualty claims between Indian/Pakistani reports", "timeTaken": 2.1 },\n' +
  '      { "task": "Analyzed expert recommendations for conflict resolution", "timeTaken": 1.5 }\n' +
  "    ]\n" +
  "  },\n" +
  "  {\n" +
  '    "followUp": [\n' +
  '      "What specific conditions would make the current ceasefire more sustainable?",\n' +
  `      "How might China's regional interests influence India-Pakistan negotiations?",\n` +
  '      "What economic impacts have neighboring countries experienced from this conflict?"\n' +
  "    ]\n" +
  "  }\n" +
  "]";

marked.setOptions({
  highlight: function (code, lang) {
    return hljs.highlightAuto(code).value;
  },
  langPrefix: "hljs language-",
});
// Function to fetch and display the selected content

// Declare variables outside the function
let textElement;
let imageContainer;
let imageElement;
let noContentElement;
let actionTagElement;
let messagesContainer;
let contentBox;
let sideNavbar;
let menuBar;
let closeMenuBar;
let searchBox;
let searchInput;
let removeSelectedText;
let settingsBtn;
let settingsContainer;
let deepResearch;
let quickSearch;
let factCheck;
let deepResearchStatus, quickSearchStatus, factCheckStatus;
let newChatBtn;

// Refresh DOM references
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
  searchInput = document.getElementById("search-input") || null;
  removeSelectedText = document.getElementById("remove-selected-text");
  settingsBtn = document.getElementById("settings-btn");
  settingsContainer = document.getElementById("settings-contanier");
  deepResearch = document.getElementById("deep-research");
  quickSearch = document.getElementById("quick-search");
  factCheck = document.getElementById("fact-check");
  newChatBtn = document.getElementById("new-chat");

  if (userDetails.email) {
    actionTagElement.addEventListener("click", () => {
      let key = actionTagElement.innerText.split(" ").join("").toLowerCase();
      actionTagElement.classList.add("animate-change-tag");

      setTimeout(() => {
        if (key == "deepresearch") {
          actionTagElement.innerText = "Fact Check";
          newMessageDetails.actionType = "Fact Check";
        } else if (key == "quicksearch") {
          actionTagElement.innerText = "Deep Research";
          newMessageDetails.actionType = "Deep Research";
        } else {
          actionTagElement.innerText = "Quick Search";
          newMessageDetails.actionType = "Quick Search";
        }
        actionTagElement.classList.remove("animate-change-tag");
      }, 200);
    });

    // document.getElementById("login").addEventListener("click", () => {
    //   chrome.identity.getAuthToken({ interactive: true }, (token) => {
    //     if (chrome.runtime.lastError) {
    //       console.error("Auth Error:", chrome.runtime.lastError);
    //       return;
    //     }

    //     console.log("Got token:", token);

    //     // Now fetch user profile info
    //     fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    //       headers: {
    //         Authorization: "Bearer " + token,
    //       },
    //     })
    //       .then((response) => response.json())
    //       .then((userInfo) => {
    //         console.log("User info:", userInfo);
    //         // Example: userInfo.name, userInfo.email, userInfo.picture
    //       })
    //       .catch((err) => console.error("Fetch error:", err));
    //   });
    // });

    menuBar.addEventListener("click", () => {
      sideNavbar.classList.add("show-sidenav");
    });

    closeMenuBar.addEventListener("click", () => {
      sideNavbar.classList.remove("show-sidenav");
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key == "Enter" && !loadingAiResponse) {
        console.log("hello nigga", e.target.value)
        if (!newMessageDetails.actionType && e.target.value) {
          console.log("hello nigga part 2")
          newMessageDetails.actionType = "user-query";
          newMessageDetails.selectedText = null;
          addNewMessage(e.target.value);
        } else {
          addNewMessage(e.target.value);
        }
      }
    });

    removeSelectedText.addEventListener("click", () => {
      newMessageDetails.actionType = "";
      newMessageDetails.selectedText = "";
      contentBox.style.display = "none";
      removeSelectedText.style.display = "none";
    });

    // Attach event listeners just once
    deepResearch.addEventListener("click", (e) => {
      e.stopPropagation();
      deepResearchStatus = !deepResearchStatus;
      updateToggle(deepResearch, deepResearchStatus);
      chrome.storage.local.set({ deepResearch: deepResearchStatus });
    });

    quickSearch.addEventListener("click", (e) => {
      e.stopPropagation();
      quickSearchStatus = !quickSearchStatus;
      updateToggle(quickSearch, quickSearchStatus);
      chrome.storage.local.set({ quickSearch: quickSearchStatus });
    });

    factCheck.addEventListener("click", (e) => {
      e.stopPropagation();
      factCheckStatus = !factCheckStatus;
      updateToggle(factCheck, factCheckStatus);
      chrome.storage.local.set({ factCheck: factCheckStatus });
    });

    settingsBtn.addEventListener("click", () => {
      // Show settings UI
      sideNavbar.classList.remove("show-sidenav");
      settingsContainer.style.display = "flex";

      // Update button visuals based on current status
      updateToggle(factCheck, factCheckStatus);
      updateToggle(quickSearch, quickSearchStatus);
      updateToggle(deepResearch, deepResearchStatus);
    });

    // Helper function to update toggle status
    function updateToggle(element, status) {
      element.innerText = status ? "ON" : "OFF";
      element.classList.toggle("on", status);
    }

    settingsContainer.addEventListener("click", () => {
      settingsContainer.style.display = "none";
    });

    newChatBtn.addEventListener("click", () => {
      document.body.innerHTML = newChatLayout(userDetails);
      refreshElements()
      newMessageDetails.actionType = "";
      newMessageDetails.selectedText = "";
      searchInput.value = "";
      contentBox.style.display = "none"
      removeSelectedText.style.display ="none"
    });
  }
}

let userDetails = {};

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
  // Check if the clicked element is a tab
  if (event.target.classList.contains("tab")) {
    const clickedTab = event.target;
    const tabName = clickedTab.dataset.tab;

    // Find the parent content box of this tab
    const contentBox = clickedTab.closest(".content-box");

    if (contentBox) {
      // Get all tabs and panels within THIS content box only
      const allTabs = contentBox.querySelectorAll(".tab");
      const allPanels = contentBox.querySelectorAll(".tab-panel");

      // Remove active class from all tabs in this content box
      allTabs.forEach((tab) => {
        tab.classList.remove("active");
      });

      // Add active class to clicked tab
      clickedTab.classList.add("active");

      // Hide all panels in this content box
      allPanels.forEach((panel) => {
        panel.style.display = "none";
      });

      // Show the panel that corresponds to the clicked tab
      const activePanel = contentBox.querySelector(
        `.tab-panel[data-tab="${tabName}"]`
      );
      if (activePanel) {
        activePanel.style.display = "block";
      }
    }
  }
});

async function addNewMessage(customPrompt) {
  const introTemplate = document.getElementById("intro");
  if (window.getComputedStyle(introTemplate).display == "flex")
    introTemplate.style.display = "none";
  if (!newMessageDetails.actionType) {
    console.log("Invalid Message");
    return;
  }
  console.log("inside addNewMessage", newMessageDetails);
  loadingAiResponse = true;

  const messageBoxes = messagesContainer.getElementsByClassName("new-message");
  if (messageBoxes.length > 0) {
    messageBoxes[messageBoxes.length - 1].classList.remove("new-message");
  }

  try {
    let { contentType, mainBox: newMessage } = createContentBox(
      customPrompt,
      newMessageDetails,
      resultsContainerObj
    );
    messagesContainer.appendChild(newMessage);

    searchInput.value = "";
    contentBox.classList.remove("show-content-box");
    contentBox.style.display = "none";
    removeSelectedText.style.display = "none";
    // requestAnimationFrame(() => {
    //   messagesContainer.scrollTop = newMessage.offsetTop - 60;
    // });
    messagesContainer.scrollTo({
      top: newMessage.offsetTop - 70,
      behavior: "smooth",
    });

    const { followUps, markdown, sources, tasks, thinking, images } =
      await formatAiResponse(output);
    setTimeout(() => {
      // Try multiple approaches to hide
      resultsContainerObj.tab2.style.display = "block";
      resultsContainerObj.tab3.style.display = "block";

      sources.forEach((source) => {
        const sourceBox = createSourceBox(source);
        resultsContainerObj.panel2.appendChild(sourceBox);
      });

      resultsContainerObj.panel3.innerHTML = tasks
        .map((task, index) => {
          return `
          <div class="task ${index == tasks.length - 1 ? "last-task" : ""}">
          <span class="task-num">${index + 1}</span>
          <div class="details">
            <p>${task.task}</p>
            <span>Time Taken: ${task.timeTaken}s</span>
          </div>
        </div>
        `;
        })
        .join("");

      // resultsContainerObj.panel1.innerText =
      //   "This is an example response of the perplexity API and this is in very details output.";
      //  console.log(marked)
      const htmlContent = marked(markdown);
      resultsContainerObj.panel1.innerHTML = htmlContent;

      if (newMessageDetails.actionType.startsWith("Fact")) {
        contentType.innerHTML +=
          "<div class='final-fact-verdict true'>Fact is true</div>";
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
    }, 3000);
  } catch (err) {
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

    // Update UI based on content type and action type
    if (response.contentType === "text" && response.text) {
      contentBox.style.display = "block";
      removeSelectedText.style.display = "block";
      contentBox.classList.add("show-content-box");
      textElement.style.display = "block";
      newMessageDetails.selectedText = response.text;
      textElement.textContent = response.text;

      // Set the action tag and button text based on action type
      if (response.actionType === "deepResearch") {
        actionTagElement.textContent = "Deep Research";
        actionTagElement.className = "action-tag research";
        // analyzeButton.textContent = "Research Deeply";
        newMessageDetails.actionType = "Deep Research";
        if (deepResearchStatus) {
          addNewMessage();
        }
      } else if (response.actionType === "checkFacts") {
        actionTagElement.textContent = "Fact Check";
        actionTagElement.className = "action-tag";
        newMessageDetails.actionType = "Fact Check";
        if (factCheckStatus) {
          addNewMessage();
        }
      } else {
        actionTagElement.textContent = "Quick Search";
        actionTagElement.className = "action-tag";
        // analyzeButton.textContent = "Check Facts";
        newMessageDetails.actionType = "Quick Search";
        if (quickSearchStatus) {
          addNewMessage();
        }
      }
    } else if (response.contentType === "image" && response.imageUrl) {
      contentBox.style.display = "flex";
      removeSelectedText.style.display = "block";
      contentBox.classList.add("show-content-box");
      // Display image content
      // contentLabelElement.textContent = "Selected Image:";
      imageContainer.style.display = "block";
      imageElement.src = response.imageUrl;

      // Set the action tag and button text for image analysis
      actionTagElement.textContent = "Image Analysis";
      actionTagElement.className = "action-tag image";
      // analyzeButton.textContent = "Analyze Image";
      newMessageDetails.actionType = "Image Analysis";
      // resultsTitle.textContent = "Image Analysis Results:";
    } else {
      // No content or unknown type
      noContentElement.style.display = "block";
      noContentElement.textContent =
        "No content selected. Please select text or an image on a webpage, right-click, and choose a FactSnap option.";

      // Reset the action tag
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
    await chrome.storage.local.set({ userInfo });
    document.body.innerHTML = newChatLayout(userInfo);
    return userInfo;
  } catch (err) {
    console.error("Failed to fetch user info:", err);
    return null;
  }
}

async function getUserInfo() {
  try {
    // Try silent login
    let token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (chrome.runtime.lastError || !token)
          return reject(chrome.runtime.lastError);
        resolve(token);
      });
    });

    return await fetchUserInfo(token);
  } catch (silentError) {
    console.warn("Silent login failed:", silentError);

    // Try interactive login
    try {
      document.body.innerHTML = `<div class="login">
      <h2>FactSnap Authentication</h2>
      <p>Please Wait, while we verify you...</p>
    </div>`;
      let token = await new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError || !token)
            return reject(chrome.runtime.lastError);
          resolve(token);
        });
      });

      return await fetchUserInfo(token);
    } catch (interactiveError) {
      console.error("Interactive login failed:", interactiveError);
      return null;
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
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

  // Listen for content updates from the background script
  chrome.runtime.onMessage.addListener((message) => {
    if (
      message.action === "contentUpdated" ||
      message.action === "textUpdated"
    ) {
      // console.log("------?/--------------------------------------new message received--------------------------------------------", message);
      chrome.storage.local.get(
        ["selectedText", "selectedImage", "contentType", "actionType"],
        (data) => {
          // console.log("data", data);
        }
      );
      searchInput.value = "";
      updateContent();
    }
  });
});
