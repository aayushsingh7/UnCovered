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
  // try {
  // const res = await fetch(
  //   `https://api.microlink.io/?url=${encodeURIComponent(url)}`
  // );
  // let data = await res.json();
  // const sourceData = data.data;
  // return {
  //   title: sourceData.title,
  //   image: {
  //     url: sourceData.image.url || DEFAULT_IMAGE,
  //   },
  //   description: sourceData.description,
  //   url: url,
  //   date: sourceData.date,
  //   logo: {
  //     url: sourceData.logo.url || DEFAULT_IMAGE,
  //   },
  //   publisher: sourceData.publisher,
  // };
  // } catch (err) {
  console.warn("Cannot retrieve source details");
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
  // }
}

export function replaceWithClickableLink(body, sources) {
  return body.replace(/\[(\d+)\]/g, (match, num) => {
    const index = parseInt(num, 10);
    // handle populated & non-populated sources
    const source = sources[index - 1].url
      ? sources[index - 1].url
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
