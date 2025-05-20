import { fetchSourceDetails, replaceWithClickableLink } from "./helpers.js";
import { marked } from "../libs/marked.esm.js";

marked.setOptions({
  highlight: function (code, lang) {
    return hljs.highlightAuto(code).value;
  },
  langPrefix: "hljs language-",
});

export async function fetchAllChats(userID) {
  try {
    const response = await fetch(
      `http://localhost:4000/api/v1/chats/${userID}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );
    let chats = await response.json();
    return chats.data;
  } catch (err) {
    console.log(err);
  }
}

export async function fetchMessages(chatID, offset = 0) {
  try {
    const response = await fetch(
      `http://localhost:4000/api/v1/chats/${chatID}/messages/${offset}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );
    let messages = await response.json();
    return messages.data;
  } catch (err) {
    console.log(err);
  }
}

export async function fetchChat(chatID) {
  try {
  } catch (err) {
    console.log(err);
  }
}

export async function searchChat(query) {
  try {
  } catch (err) {
    console.log(err);
  }
}

function extractAndCleanContent(content, verdict) {
  let cleanContent = content;
  let extractedVerdict = verdict;

  if (extractedVerdict === null) {
    const verdictMatch = cleanContent.match(/\{verdict:\s*"?([^}"]*)"?\s*\}/);
    if (verdictMatch) {
      extractedVerdict = verdictMatch[1];
      console.log("Verdict extracted:", extractedVerdict);
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

  try {
    const response = await fetch(`http://localhost:4000/api/v1/ai/generate`, {
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
    let buffer = "";
    let citations = null;
    let accumulatedContent = "";
    let verdict = null;
    let isComplete = false;

    try {
      while (!isComplete) {
        const { value, done } = await reader.read();

        // Check if stream is actually done
        if (done) {
          console.log("Stream ended naturally");
          isComplete = true;
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim().startsWith("data: ")) {
            const jsonString = line.replace("data: ", "").trim();

            if (jsonString === "[DONE]") {
              console.log("Stream complete.");
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
                console.log({ citations });
              }

              const content = data?.choices?.[0]?.delta?.content;
              if (content) {
                if (accumulatedContent == content) continue;
                accumulatedContent += content;
                const extracted = extractAndCleanContent(
                  accumulatedContent,
                  verdict
                );

                // Update verdict and followUpQuestions as they become available
                if (extracted.verdict !== null && verdict === null) {
                  verdict = extracted.verdict;
                  console.log("Verdict extracted:", verdict);
                }

                // Update container with cleaned formatted content
                // if (answerContainer) {
                //   let replaceWithLink = replaceWithClickableLink(
                //     extracted.cleanContent,
                //     citations
                //   );
                //   let markedHTML = marked(replaceWithLink);
                //   answerContainer.innerHTML = markedHTML;
                // }

                if (onMessage) {
                  onMessage({
                    content: content,
                    accumulatedContent: accumulatedContent,
                    cleanContent: extracted.cleanContent,
                    citations: citations,
                    verdict: verdict,
                  });
                }
              }
            } catch (err) {
              console.warn("Failed to parse SSE chunk:", jsonString, err);
            }
          }
        }
      }

      const finalExtracted = extractAndCleanContent(
        accumulatedContent,
        verdict
      );
      console.log("Stream processing completed successfully");

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete({
          content: accumulatedContent,
          cleanContent: finalExtracted.cleanContent,
          citations: citations,
          verdict: verdict,
        });
      }

      // Return the final result
      return {
        newMessage: {
          answer: accumulatedContent,
          sources: citations,
          verdict: verdict,
        },
      };
    } finally {
      reader.releaseLock();
    }
  } catch (err) {
    console.error("Fetch error:", err);

    // Cleanup on error
    if (abortController) {
      abortController.abort();
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
    const response = await fetch(
      `http://localhost:4000/api/v1/chats/messages/create`,
      {
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
              ? "sonar-reasoning-pro"
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
      }
    );
    const data = await response.json();
    return {
      newMessage: data.newMessage,
      newChat: data.newChat,
    };
  } catch (err) {
    console.log(err);
  }
}

export async function verifyOrCreateUser(userInfo) {
  try {
    const response = await fetch(
      `http://localhost:4000/api/v1/users/verifyOrCreateUser`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfo),
      }
    );
    const user = await response.json();
    return user;
  } catch (err) {
    console.log(err);
  }
}
