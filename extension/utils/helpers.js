export function getReadableDomain(url) {
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
    const readableName = words[0].charAt(0).toUpperCase() + words[0].slice(1);

    return readableName;
  } catch (e) {
    return "Unknown Source";
  }
}

export async function fetchSourceDetails(url) {
  const DEFAULT_IMAGE =
    "https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg";
  try {
    const res = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}`
    );
    let data = await res.json();
    const sourceData = data.data;
    return {
      title: sourceData.title,
      image: {
        url: sourceData.image.url || DEFAULT_IMAGE,
      },
      description: sourceData.description,
      url: url,
      date: sourceData.date,
      logo: {
        url: sourceData.logo.url || DEFAULT_IMAGE,
      },
      publisher: sourceData.publisher,
    };
  } catch (err) {
    console.warn("Cannot retrieve source details");
    return {
      title: "",
      image: {
        url: "https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg",
      },
      description: "",
      url: url,
      date: new Date().toISOString(),
      logo: {
        url: "https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg",
      },
      publisher: getReadableDomain(url),
    };
  }
}

export async function formatAiResponse(response) {
  const thinking = response
    .slice(response.indexOf("<think>") + 7, response.lastIndexOf("</think>"))
    .trim()
    .split("\n")
    .filter((pera) => pera != "")
    .map((pera) => "> " + pera)
    .join("\n\n");
  let mainBody = JSON.parse(response.slice(response.indexOf("</think>") + 9));
  const sources = mainBody[1].sources;
  const tasks = mainBody[2].tasks;
  const followUps = mainBody[3].followUp;

  const formatted = replaceWithClickableLink(mainBody[0], sources);

  const detailedSources = [],
    images = [];
  for (let i = 0; i < sources.length; i++) {
    let fetchLinkDetails;
    try {
      // fetchLinkDetails = await fetchSourceDetails(sources[i].url);
      fetchLinkDetails = {
        title: "",
        image: {
          url: "https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg",
        },
        description: "",
        url: sources[i].url,
        date: sources[i].date,
        logo: {
          url: "https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg",
        },
        publisher: getReadableDomain(sources[i].url),
      };
    } catch (err) {
      fetchLinkDetails = {
        title: "",
        image: {
          url: "https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg",
        },
        description: "",
        url: sources[i].url,
        date: sources[i].date,
        logo: {
          url: "https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg",
        },
        publisher: getReadableDomain(sources[i].url),
      };
    }

    images.push(fetchLinkDetails.image.url);
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
    images,
  };
}

export function replaceWithClickableLink(body, sources) {
  // console.log(sources);
  return body.replace(/\[(\d+)\]/g, (match, num) => {
    const index = parseInt(num, 10);
    const source = sources[index - 1];
    if (source) {
      return `[${match}](${source})`;
    } else {
      return match;
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

export function generateRandomId() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 16; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export function createContentBox(
  customPrompt,
  newMessageDetails,
  resultsContainerObj,
  UPLOADED_DOCUMENTS
) {
  console.log("This is the final stage: newMessageDetails", newMessageDetails);
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
  const actionTagArr = newMessageDetails.actionType.split("-");
  const capitalize = (word) =>
    word[0].toUpperCase() + word.slice(1).toLowerCase();
  actionTag.innerText =
    capitalize(actionTagArr[0]) + " " + capitalize(actionTagArr[1]);

  contentType.appendChild(actionTag);
  console.log(newMessageDetails);
  if (newMessageDetails.actionType !== "user-query") {
    console.log("passed and success-----------");
    contentBox.appendChild(contentType);
  }

  // Custom prompt paragraph
  const prompt = document.createElement("p");
  prompt.className = "custom-prompt";
  prompt.textContent = customPrompt;
  contentBox.appendChild(prompt);

  // Content container
  const contentContainer = document.createElement("div");
  contentContainer.className = "content-container";
  console.log({ UPLOADED_DOCUMENTS });
  if (newMessageDetails.selectedText) {
    console.log("newMessageDetails.selectedText");
    const selectedText = document.createElement("div");
    selectedText.className = "selected-text";
    selectedText.innerText = newMessageDetails.selectedText;
    contentContainer.appendChild(selectedText);
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

  resultTabs.appendChild(tab1);

  // Content panels
  const resultsContent = document.createElement("div");
  resultsContent.className = "results-content";

  const panel1 = document.createElement("div");
  panel1.className = "tab-panel";
  panel1.dataset.tab = "answer";
  panel1.textContent = newMessageDetails.actionType.startsWith("Deep")
    ? "Deep research may take 3 to 5 minutes..."
    : "Generating response..."; // default content
  panel1.style.display = "block"; // only this is visible initially

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
    console.log("entered inside the uploaded_documents");
    const tab3 = document.createElement("span");
    tab3.className = "tab";
    tab3.textContent = "Attachments";
    tab3.dataset.tab = "attachments";
    // tab3.style.display = "none";
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

    console.log({ tab3, panel3 });
  }
  // append sources after attachments
  resultTabs.appendChild(tab2);
  resultsContainerObj.tab1 = tab1;
  resultsContainerObj.tab2 = tab2;
  resultsContainerObj.panel1 = panel1;
  resultsContainerObj.panel2 = panel2;

  return { mainBox, contentType };
}

export function newChatLayout(userInfo) {
  return `
    <header class="header">
      <nav>
        <img src="./assets/menu.svg" alt="" id="menu" />
        <h3>FactSnap</h3>
        <img src="./assets/new-chat.svg" alt="" id="new-chat" />
      </nav>
    </header>

     <button id="captureBtn">Capture Screenshot</button>
  <img id="preview" alt="Screenshot preview">

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
              <button  id="deep-research">OFF</button>
            </div>

            <div>
              <h4>Fact-Checking</h4>
              <button  id="fact-check">OFF</button>
            </div>

            <div>
              <h4>Quick Search</h4>
              <button id="quick-search">ON</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sidenav" id="sidenav">
      <div class="header">
        <input type="text" placeholder="Search Any Chat" />
        <img src="./assets/close.svg" alt="" id="close-btn" />
      </div>

      <div class="chats" id="chats-container"></div>

      <div class="settings" id="settings-btn">
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
      <span data-name="deep-research" title="Deep Research"><img src="./assets/deep.svg" alt=""/></span>
      </div>
      <button id="send-btn"><img src="./assets/send.svg" alt="send"/></button>
      </div>
    </div>
    `;
}

export async function uploadToCloudinary(base64Data, options = {}) {
  const {
    cloudName = "dvk80x6fi",
    uploadPreset = "factsnap",
    folder = "",
    resourceType = "auto",
  } = options;

  if (!cloudName) throw new Error("cloudName is required");
  if (!uploadPreset) throw new Error("uploadPreset is required");
  if (!base64Data) throw new Error("base64Data is required");

  const base64Content = base64Data.split(",")[1];

  // Prepare the form data
  const formData = new FormData();
  formData.append("file", base64Data);
  formData.append("upload_preset", uploadPreset);

  if (folder) {
    formData.append("folder", folder);
  }

  // Make the API request to Cloudinary
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Cloudinary upload failed: ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();

    return {
      secureURL: data.secure_url,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
