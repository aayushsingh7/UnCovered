export function getReadableDomain(url) {
  try {
    const { hostname } = new URL(url);
    const filteredHost = hostname
      .replace(/^www\d*\./, "")
      .replace(/^m\./, "")
      .replace(/^en\./, "");

    const words = filteredHost.split(/[.\-]/).filter(Boolean);

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
    return {
      title: "",
      image: {
        url: DEFAULT_IMAGE,
      },
      description: "",
      url: url,
      date: new Date().toISOString(),
      logo: {
        url: DEFAULT_IMAGE,
      },
      publisher: getReadableDomain(url),
    };
  }
}

export function replaceWithClickableLink(body, sources) {
  body = body
    .replace(/<think>/g, '<div class="ai-thinking" id="ai-thinking">')
    .replace(/<\/think>/g, '</div>');

  return body.replace(/\[(\d+)\]/g, (match, num) => {
    const index = parseInt(num, 10);
    const source = sources[index - 1]?.url
      ? sources[index - 1]?.url
      : sources[index - 1];
    if (source) {
      return `[${match}](${source})`;
    } else {
      return match;
    }
  });
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

export function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5000);
}
