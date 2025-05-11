import { marked } from "./libs/marked.esm.js";
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
console.log({ marked, hljs });
marked.setOptions({
  highlight: function (code, lang) {
    return hljs.highlightAuto(code).value;
  },
  langPrefix: "hljs language-",
});
// Function to fetch and display the selected content
function updateContent() {
  const textElement = document.getElementById("selected-text");
  const imageContainer = document.getElementById("selected-image-container");
  const imageElement = document.getElementById("selected-image");
  const noContentElement = document.getElementById("no-content");
  const actionTagElement = document.getElementById("action-tag");
  const messagesContainer = document.getElementById("messages-container");
  const searchInput = document.getElementById("search-input");
  const contentBox = document.getElementById("content-box");

  let newMessageDetails = {
    selectedText: "",
    actionType: "",
  };

  // let currentSourcesTab, currentTasksTab, currentAnswerTab;
  let resultContainer = {
    tab1: null,
    tab2: null,
    tab3: null,
    panel1: null,
    panel2: null,
    panel3: null,
  };

  searchInput.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      addNewMessage(e.target.value);
    }
  });

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
    const messageBoxes =
      messagesContainer.getElementsByClassName("new-message");
    if (messageBoxes.length > 0) {
      console.log(
        "inside the messageBoxes.length > 0",
        messageBoxes[messageBoxes.length - 1]
      );
      messageBoxes[messageBoxes.length - 1].classList.remove("new-message");
    }

    try {
      let newMessage = createContentBox(customPrompt);
      messagesContainer.appendChild(newMessage);

      searchInput.value = "";
      contentBox.classList.remove("show-content-box");
      requestAnimationFrame(() => {
        messagesContainer.scrollTop = newMessage.offsetTop;
      });

      const { followUps, markdown, sources, tasks, thinking } =
        await formatAiResponse(output);
      // console.log(resultContainer);
      setTimeout(() => {
        // Try multiple approaches to hide
        resultContainer.tab2.style.display = "block";
        resultContainer.tab3.style.display = "block";

        sources.forEach((source) => {
          const sourceBox = createSourceBox(source);
          resultContainer.panel2.appendChild(sourceBox);
        });

        // resultContainer.panel1.innerText =
        //   "This is an example response of the perplexity API and this is in very details output.";
        //  console.log(marked)
        const htmlContent = marked(markdown);
        resultContainer.panel1.innerHTML = htmlContent;

        newMessageDetails = {
          selectedText: "",
          actionType: "",
        };

        resultContainer = {
          tab1: null,
          tab2: null,
          tab3: null,
          panel1: null,
          panel2: null,
          panel3: null,
        };
      }, 3000);
    } catch (err) {
      console.log(err);
      alert("Oops! something went wrong");
    }
  }

  function createSourceBox(fetchLinkDetails) {
    const sourceBox = document.createElement("div");
    sourceBox.className = "source-box";

    const sourceHeader = document.createElement("div");
    sourceHeader.className = "source-header";

    const img = document.createElement("img");
    img.src = fetchLinkDetails.fevicon;
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
    sourceBox.appendChild(sourceInfo);

    return sourceBox;
  }

  function fetchAIResponse(actionType) {
    try {
    } catch (err) {
      console.log(err);
    }
  }

  async function formatAiResponse(response) {
    const thinking = output
      .slice(output.indexOf("<think>") + 7, output.lastIndexOf("</think>"))
      .trim()
      .split("\n")
      .filter((pera) => pera != "")
      .map((pera) => "> " + pera)
      .join("\n\n");
    let mainBody = JSON.parse(output.slice(output.indexOf("</think>") + 9));
    const sources = mainBody[1].sources;
    const tasks = mainBody[2].tasks;
    const followUps = mainBody[3].followUp;

    const formatted = mainBody[0].replace(/\[(\d+)\]/g, (match, num) => {
      const index = parseInt(num, 10);
      const source = sources[index - 1];
      if (source && source.url) {
        return `[${match}](${source.url})`;
      } else {
        return match;
      }
    });

    let detailedSources = [];
    for (let i = 0; i < sources.length; i++) {
      let fetchLinkDetails;
      try {
        fetchLinkDetails = await fetchSourceDetails(sources[i].url);
      } catch (err) {
        fetchLinkDetails = {
          title: "",
          image:
            "https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg",
          description: "",
          url: fetchLinkDetails.url,
          date: fetchLinkDetails.date,
          fevicon:
            "https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg",
          publisher: getReadableDomain(sources[i].url),
        };
      }

      detailedSources.push({
        title: fetchLinkDetails.title,
        image: fetchLinkDetails.image.url,
        description: fetchLinkDetails.description,
        url: fetchLinkDetails.url,
        date: fetchLinkDetails.date,
        fevicon: fetchLinkDetails.logo.url,
        publisher: fetchLinkDetails.publisher,
      });
    }

    return {
      thinking,
      markdown: formatted,
      tasks,
      sources: detailedSources,
      followUps,
    };
  }

  function getReadableDomain(url) {
    try {
      const { hostname } = new URL(url);
      const filteredHost = hostname
        .replace(/^www\d*\./, "") // remove www, www1, etc.
        .replace(/^m\./, "") // remove m. for mobile
        .replace(/^en\./, ""); // optionally remove language subdomains

      // Split by . and - to separate words
      const words = filteredHost
        .split(/[.\-]/) // split by dot or dash
        .filter(Boolean); // remove empty strings

      // Capitalize each word
      const readableName = words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return readableName;
    } catch (e) {
      return "Unknown Source";
    }
  }

  async function fetchSourceDetails(url) {
    const res = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}`
    );
    const data = await res.json();
    console.log(data);
    return data.data;
  }

  function generateRandomId() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for (let i = 0; i < 16; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  function createContentBox(customPrompt) {
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
    actionTag.className =
      newMessageDetails.actionType == "Fact Check"
        ? "action-tag"
        : "action-tag research";
    actionTag.innerText = newMessageDetails.actionType;
    console.log(newMessageDetails);

    contentType.appendChild(actionTag);
    contentBox.appendChild(contentType);

    // Custom prompt paragraph
    const prompt = document.createElement("p");
    prompt.className = "custom-prompt";
    prompt.textContent = customPrompt;
    contentBox.appendChild(prompt);

    // Content container
    const contentContainer = document.createElement("div");
    contentContainer.className = "content-container";

    if (newMessageDetails.actionType.startsWith("Image")) {
      const selectedImageContainer = document.createElement("div");
      selectedImageContainer.className = "selected-image-container";

      const selectedImage = document.createElement("img");
      selectedImage.className = "selected-image";
      selectedImage.src = "";
      selectedImage.alt = "Selected image";

      selectedImageContainer.appendChild(selectedImage);
      contentContainer.appendChild(selectedImageContainer);
    } else if (
      newMessageDetails.actionType.startsWith("Fact") ||
      newMessageDetails.actionType.startsWith("Deep")
    ) {
      const selectedText = document.createElement("div");
      console.log(
        "Selected Text is not woking ------------- ",
        newMessageDetails.selectedText,
        selectedText
      );
      selectedText.className = "selected-text";
      selectedText.innerText = newMessageDetails.selectedText;
      contentContainer.appendChild(selectedText);
    } else {
      const noContent = document.createElement("div");
      noContent.className = "no-selection";
      noContent.textContent =
        "No content selected. Please select text or an image on a webpage, right-click, and choose a FactSnap option.";
      contentContainer.appendChild(noContent);
    }

    contentBox.appendChild(contentContainer);

    // Results container
    const resultsContainer = document.createElement("div");
    resultsContainer.className = "results-container markdown-body";

    // Tabs
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

    const tab3 = document.createElement("span");
    tab3.className = "tab";
    tab3.textContent = "Tasks";
    tab3.dataset.tab = "tasks";
    tab3.style.display = "none";

    resultTabs.appendChild(tab1);
    resultTabs.appendChild(tab2);
    resultTabs.appendChild(tab3);

    // Content panels
    const resultsContent = document.createElement("div");
    resultsContent.className = "results-content";

    const panel1 = document.createElement("div");
    panel1.className = "tab-panel";
    panel1.dataset.tab = "answer";
    panel1.textContent = "Generating response..."; // default content
    panel1.style.display = "block"; // only this is visible initially

    const panel2 = document.createElement("div");
    panel2.className = "tab-panel";
    panel2.dataset.tab = "sources";
    panel2.style.display = "none";

    const panel3 = document.createElement("div");
    panel3.className = "tab-panel";
    panel3.dataset.tab = "tasks";
    panel3.style.display = "none";
    panel3.textContent = "Tasks will be listed here.";

    resultsContent.appendChild(panel1);
    resultsContent.appendChild(panel2);
    resultsContent.appendChild(panel3);

    // Combine everything
    resultsContainer.appendChild(resultTabs);
    resultsContainer.appendChild(resultsContent);
    contentBox.appendChild(resultsContainer);
    mainBox.appendChild(contentBox);

    resultContainer.tab1 = tab1;
    resultContainer.tab2 = tab2;
    resultContainer.tab3 = tab3;
    resultContainer.panel1 = panel1;
    resultContainer.panel2 = panel2;
    resultContainer.panel3 = panel3;

    return mainBox;
  }

  // Hide all content elements initially
  textElement.style.display = "none";
  imageContainer.style.display = "none";
  noContentElement.style.display = "none";
  // resultsContainer.style.display = 'none';

  // Request the content from the background script
  chrome.runtime.sendMessage({ action: "getContent" }, (response) => {
    if (chrome.runtime.lastError) {
      noContentElement.style.display = "block";
      noContentElement.textContent = "Error retrieving content.";
      return;
    }

    // Update UI based on content type and action type
    if (response.contentType === "text" && response.text) {
      contentBox.classList.add("show-content-box");
      // Display text content
      // contentLabelElement.textContent = "Selected Content:";
      textElement.style.display = "block";
      newMessageDetails.selectedText = response.text;
      textElement.textContent = response.text;

      console.log(response.actionType);
      // Set the action tag and button text based on action type
      if (response.actionType === "deepResearch") {
        actionTagElement.textContent = "Deep Research";
        actionTagElement.className = "action-tag research";
        // analyzeButton.textContent = "Research Deeply";
        newMessageDetails.actionType = "Deep Research";
        console.log(newMessageDetails, "actionType is setting here");
        // resultsTitle.textContent = "Research Results:";
      } else {
        actionTagElement.textContent = "Fact Check";
        actionTagElement.className = "action-tag";
        // analyzeButton.textContent = "Check Facts";
        newMessageDetails.actionType = "Fact Check";
        // resultsTitle.textContent = "Fact Check Results:";
      }
    } else if (response.contentType === "image" && response.imageUrl) {
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

// Function to simulate processing (in a real app, this would call your API)
function processContent(contentType, actionType, content) {
  return new Promise((resolve) => {
    // This is a placeholder for your actual processing logic
    setTimeout(() => {
      if (contentType === "text") {
        if (actionType === "deepResearch") {
          resolve(
            `Deep research results for: "${content.substring(0, 50)}${
              content.length > 50 ? "..." : ""
            }"\n\n` +
              `This is a simulated in-depth analysis that would normally include:\n` +
              `• Comprehensive background information\n` +
              `• Multiple credible sources analysis\n` +
              `• Historical context and developments\n` +
              `• Expert opinions and relevant citations\n` +
              `• Related perspectives and implications`
          );
        } else {
          resolve(
            `Fact check results for: "${content.substring(0, 50)}${
              content.length > 50 ? "..." : ""
            }"\n\n` +
              `This is a simulated fact check that would normally include:\n` +
              `• Verification status: Mostly accurate\n` +
              `• Source verification: 3 reliable sources\n` +
              `• Notable discrepancies: Minor date inconsistency\n` +
              `• Context analysis: Complete`
          );
        }
      } else if (contentType === "image") {
        resolve(
          `Image analysis results:\n\n` +
            `This is a simulated image analysis that would normally include:\n` +
            `• Content description\n` +
            `• Detected objects and entities\n` +
            `• Authenticity verification\n` +
            `• Related image search results\n` +
            `• Metadata analysis`
        );
      }
    }, 1000); // Simulate 1 second processing time
  });
}

// When the panel is loaded, request the selected content from the background script
document.addEventListener("DOMContentLoaded", () => {
  // Initial content fetch
  updateContent();

  // Listen for content updates from the background script
  chrome.runtime.onMessage.addListener((message) => {
    if (
      message.action === "contentUpdated" ||
      message.action === "textUpdated"
    ) {
      updateContent();

      // Hide the results container when new content is loaded
      // document.getElementById('results-container').style.display = 'none';
    }
  });

  // Add event listener for the analyze button
  // document.getElementById("analyze-btn").addEventListener("click", () => {
  //   // const resultsContainer = document.getElementById('results-container');
  //   // const resultsContent = document.getElementById('results-content');
  //   // const analyzeButton = document.getElementById('analyze-btn');

  //   // Show loading state
  //   // analyzeButton.disabled = true;
  //   // analyzeButton.textContent = "Processing...";
  //   // resultsContainer.style.display = 'block';
  //   // resultsContent.textContent = "Analyzing content...";

  //   chrome.runtime.sendMessage({ action: "getContent" }, async (response) => {
  //     if (response.contentType === "text" && response.text) {
  //       // Process text based on action type
  //       try {
  //         const result = await processContent(
  //           "text",
  //           response.actionType,
  //           response.text
  //         );
  //         // resultsContent.textContent = result;
  //       } catch (error) {
  //         // resultsContent.textContent = "Error processing content: " + error.message;
  //       }
  //     } else if (response.contentType === "image" && response.imageUrl) {
  //       // Process image
  //       try {
  //         const result = await processContent(
  //           "image",
  //           "analyzeImage",
  //           response.imageUrl
  //         );
  //         // resultsContent.textContent = result;
  //       } catch (error) {
  //         // resultsContent.textContent = "Error analyzing image: " + error.message;
  //       }
  //     } else {
  //       // resultsContent.textContent = "Please select content on a webpage first.";
  //     }

  //     // Reset button state
  //   //   analyzeButton.disabled = false;
  //   //   analyzeButton.textContent =
  //   //     response.actionType === "deepResearch"
  //   //       ? "Research Deeply"
  //   //       : response.contentType === "image"
  //   //       ? "Analyze Image"
  //   //       : "Check Facts";
  //   });
  // });

  // Add event listener for the copy button
  // document.getElementById("copy-btn").addEventListener("click", () => {
  //   chrome.runtime.sendMessage({ action: "getContent" }, (response) => {
  //     if (response.contentType === "text" && response.text) {
  //       // Copy text to clipboard
  //       navigator.clipboard
  //         .writeText(response.text)
  //         .then(() => {
  //           alert("Text copied to clipboard!");
  //         })
  //         .catch((err) => {
  //           alert("Failed to copy text: " + err);
  //         });
  //     } else if (response.contentType === "image" && response.imageUrl) {
  //       // Copy image URL to clipboard
  //       navigator.clipboard
  //         .writeText(response.imageUrl)
  //         .then(() => {
  //           alert("Image URL copied to clipboard!");
  //         })
  //         .catch((err) => {
  //           alert("Failed to copy image URL: " + err);
  //         });
  //     } else {
  //       alert("No content to copy.");
  //     }
  //   });
  // });
});

// Listen for visibility changes - when the panel becomes visible again, refresh content
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    updateContent();
  }
});
