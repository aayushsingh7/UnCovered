import { API_URL, stopResponseStreaming } from "../../panel.js";
import { createChatBox, renderChats } from "../helpers/domHelpers.js";
import { showToast } from "../utils.js";

function extractAndCleanContent(content, verdict) {
  let cleanContent = content;
  let extractedVerdict = verdict;

  if (extractedVerdict === null) {
    const verdictMatch = cleanContent.match(/\{verdict:\s*"?([^}"]*)"?\s*\}/);
    if (verdictMatch) {
      extractedVerdict = verdictMatch[1];
    }
  }

  const verdictRemovalMatch = cleanContent.match(
    /\{verdict:\s*"?[^}"]*"?\s*\}/
  );
  if (verdictRemovalMatch) {
    const startIndex = verdictRemovalMatch.index;
    const endIndex = startIndex + verdictRemovalMatch[0].length;
    cleanContent =
      cleanContent.slice(0, startIndex) + cleanContent.slice(endIndex);
  }

  // Clean up extra newlines
  cleanContent = cleanContent.replace(/\n{3,}/g, "\n\n").trim();

  return {
    cleanContent,
    verdict: extractedVerdict,
  };
}

export async function fetchAllChats(userID) {
  try {
    const response = await fetch(`${API_URL}/chats/user/${userID}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    let chats = await response.json();
    return chats.data;
  } catch (err) {
    showToast("Oops! something went wrong while fetching the chats", "error");
    showToast(
      "(For Organizers) Make sure the server is up and running.",
      "warning"
    );
  }
}

export async function fetchMessages(chatID, offset = 0) {
  try {
    const response = await fetch(
      `${API_URL}/chats/${chatID}/messages/${offset}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );
    let messages = await response.json();
    return messages.data;
  } catch (err) {
    showToast("Oops! something went wrong while fetching messages", "error");
  }
}

export async function fetchAIResponse(
  userID,
  chatID,
  selectedText,
  prompt,
  actionType,
  CHAT_HISTORY,
  onMessage = null,
  onComplete = null
) {
  let abortController = new AbortController();
  let buffer = "";
  let citations = null;
  let accumulatedContent = "";
  let verdict = null;
  let isComplete = false;

  try {
    const response = await fetch(`${API_URL}/ai/generate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userID,
        chatID,
        prompt,
        selectedText,
        actionType,
        CHAT_HISTORY,
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (response.headers.get("content-type")?.includes("application/json")) {
      const data = await response.json();
      return data;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          isComplete = true;
          break;
        }

        // Process the chunk
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim().startsWith("data: ")) {
            const jsonString = line.replace("data: ", "").trim();

            if (jsonString === "[DONE]") {
              isComplete = true;
              break;
            }

            if (!jsonString) continue;

            try {
              const data = JSON.parse(jsonString);
              if (data?.error) {
                throw new Error(data.error);
              }
              if (data?.citations && !citations) {
                citations = data.citations;
              }

              const content = data?.choices?.[0]?.delta?.content;
              if (content) {
                if (accumulatedContent === content) continue;
                accumulatedContent += content;
                const extracted = extractAndCleanContent(
                  accumulatedContent,
                  verdict
                );

                if (extracted.verdict !== null && verdict === null) {
                  verdict = extracted.verdict;
                }

                if (onMessage) {
                  onMessage({
                    content: content,
                    accumulatedContent: accumulatedContent,
                    cleanContent: extracted.cleanContent,
                    citations: citations,
                    verdict: verdict,
                  });
                }

                if (stopResponseStreaming) {
                  abortController.abort();
                  isComplete = true;
                  break;
                }
              }
            } catch (err) {
              // ignore
            }
          }
        }

        // Break if we got [DONE] signal
        if (isComplete) break;
      }

      const finalExtracted = extractAndCleanContent(
        accumulatedContent,
        verdict
      );

      if (onComplete) {
        onComplete({
          content: accumulatedContent,
          cleanContent: finalExtracted.cleanContent,
          citations: citations,
          verdict: verdict,
        });
      }

      return {
        newMessage: {
          answer: accumulatedContent,
          sources: citations,
          verdict: verdict,
        },
      };
    } finally {
      try {
        reader.releaseLock();
      } catch (e) {
        // ignore if already released
      }
    }
  } catch (err) {
    if (err.name === "AbortError") {
      const finalExtracted = extractAndCleanContent(
        accumulatedContent,
        verdict
      );

      if (onComplete) {
        onComplete({
          content: accumulatedContent,
          cleanContent: finalExtracted.cleanContent,
          citations: citations,
          verdict: verdict,
        });
      }
    } else {
      showToast(
        "(For Organizers) Make sure the server is up and running.",
        "warning"
      );

      if (onComplete) {
        onComplete({
          content: null,
          cleanContent: null,
          citations: null,
          verdict: null,
        });
      }

      return {
        newMessage: {
          content: "",
          citations: null,
          verdict: null,
        },
        error: err.message,
      };
    }
  }
}

export async function addNewMessageToDB(
  verdict,
  userID,
  chatID,
  title,
  answer,
  rawJSON,
  sources,
  documents,
  selectedText,
  prompt,
  actionType
) {
  try {
    const response = await fetch(`${API_URL}/chats/messages/create`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userID,
        chatID,
        title,
        newMsg: {
          verdict: verdict,
          responseModel: actionType.startsWith("deep")
            ? "sonar-deep-research"
            : "sonar-pro",
          prompt,
          selectedText,
          actionType,
          documents,
          answer: answer,
          sources: sources,
          responseRawJSON: rawJSON,
        },
      }),
    });
    const data = await response.json();
    return {
      newMessage: data.newMessage,
      newChat: data.newChat,
    };
  } catch (err) {
    showToast("Oops! something went wrong while saving the message😥", "error");
  }
}

export async function deleteChat(chatID, sideNavbar) {
  try {
    const response = await fetch(`${API_URL}/chats/${chatID}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    let data = await response.json();
    sideNavbar.classList.remove("show-sidenav");
    showToast("Chat deleted successfully!", "success");
  } catch (err) {
    showToast("Cannot delete the chat at this momemt😥", "error");
  }
}

export async function searchChatsAndMessages(
  e,
  userDetails,
  chatsContainer,
  chatsMap
) {
  if (e.key !== "Enter") return;
  const query = e.target.value.trim();
  if (query === "") {
    chatsContainer.innerHTML = "";
    chatsMap = new Map();
    renderChats(chatsContainer, userDetails, chatsMap);
    return;
  }

  chatsContainer.innerHTML = `<div class="loading-sources"><div class="loader"></div></div>`;
  try {
    const response = await fetch(
      `${API_URL}/chats/search?searchQuery=${encodeURIComponent(
        query
      )}&userID=${userDetails._id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    const data = await response.json();
    const { chats, messages } = data.data;
    chatsContainer.innerHTML = "";
    if (chats.length == 0) {
      chatsContainer.innerHTML = `<div class="no-chats-found"><img src="./assets/no-chats.svg" alt="no chat"/> <h4>No Results Found</h4></div>`;
    } else {
      chats.forEach((chat) => {
        chatsContainer.appendChild(createChatBox(chat));
      });
    }
  } catch (err) {
    chatsContainer.innerHTML = `<p class="d">Error loading search results. Please try again.</p>`;
  }
}

export async function generateReply(messageID) {
  try {
    const response = await fetch(`${API_URL}/ai/genereate-reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageID }),
    });
    let data = await response.json();
    return data.data;
  } catch (err) {
    showToast("Oops! something went wrong while generating reply");
  }
}
