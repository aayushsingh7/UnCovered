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
    const readableName = words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return readableName;
  } catch (e) {
    return "Unknown Source";
  }
}

export async function fetchSourceDetails(url) {
  const res = await fetch(
    `https://api.microlink.io/?url=${encodeURIComponent(url)}`
  );
  const data = await res.json();
  return data.data;
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

  const formatted = mainBody[0].replace(/\[(\d+)\]/g, (match, num) => {
    const index = parseInt(num, 10);
    const source = sources[index - 1];
    if (source && source.url) {
      return `[${match}](${source.url})`;
    } else {
      return match;
    }
  });

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

export function createSourceBox(fetchLinkDetails) {
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

export function createContentBox(customPrompt, newMessageDetails, resultsContainerObj) {
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
  actionTag.innerText = newMessageDetails.actionType;
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

  resultsContainerObj.tab1 = tab1;
  resultsContainerObj.tab2 = tab2;
  resultsContainerObj.tab3 = tab3;
  resultsContainerObj.panel1 = panel1;
  resultsContainerObj.panel2 = panel2;
  resultsContainerObj.panel3 = panel3;

  return { mainBox, contentType };
}


async function authenticateUser() {
  try {
  } catch (err) {
    console.log(err);
  }
}