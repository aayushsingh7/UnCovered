import { showToast } from "../utils.js";
import { handleShowContentBox } from "./domHelpers.js";

export async function analyzeScreen(
  contentBox,
  removeSelectedContent,
  imageContainer,
  newMessageDetails,
  textElement,
  UPLOADED_DOCUMENTS,
  sendBtn
) {
  chrome.runtime.sendMessage({ action: "captureScreen" }, async (response) => {
    if (response && response.screenshotUrl) {
      handleShowContentBox(contentBox, removeSelectedContent);
      imageContainer.style.display = "flex";
      newMessageDetails.selectedText = "";
      textElement.style.display = "none";
      let div = document.createElement("div");
      let imgTag = document.createElement("img");
      imgTag.src = response.screenshotUrl;
      imgTag.alt = "image";
      div.appendChild(imgTag);
      imageContainer.appendChild(div);
      try {
        const { secureURL } = await uploadToCloudinary(
          response.screenshotUrl,
          {},
          sendBtn
        );
        imgTag.src = secureURL;
        UPLOADED_DOCUMENTS.push(secureURL);
      } catch (err) {
        div.remove();
        showToast("Cannot upload image at this moment!", "error");
        contentBox.style.display = "none";
        removeSelectedContent.style.display = "none";
      }
    }
  });
}

export async function handleUploadFile(
  e,
  contentBox,
  removeSelectedContent,
  imageContainer,
  newMessageDetails,
  textElement,
  UPLOADED_DOCUMENTS,
  sendBtn
) {
  handleShowContentBox(contentBox, removeSelectedContent);
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
    try {
      const { secureURL } = await uploadToCloudinary(base64, {}, sendBtn);
      imgTag.src = secureURL;
      UPLOADED_DOCUMENTS.push(secureURL);
    } catch (err) {
      div.remove();
      showToast("Cannot upload image at this moment!", "error");
      contentBox.style.display = "none";
      removeSelectedContent.style.display = "none";
    }
  } else {
    showToast("Only PNG, JPG, JPEG & WEBP are supported", "info");
    contentBox.style.display = "none";
    removeSelectedContent.style.display = "none";
  }
}

export async function uploadToCloudinary(base64Data, options = {}, sendBtn) {
  sendBtn.disabled = true;
  sendBtn.innerHTML = `<div class="loader-1 loader-btn"></div>`;
  const {
    cloudName = "dvk80x6fi",
    uploadPreset = "factsnap",
    folder = "",
    resourceType = "auto",
  } = options;

  if (!cloudName) throw new Error("cloudName is required");
  if (!uploadPreset) throw new Error("uploadPreset is required");
  if (!base64Data) throw new Error("base64Data is required");

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
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerHTML = `<img alt="send" src="./assets/send.svg" />`;
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
