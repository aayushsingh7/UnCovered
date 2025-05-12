export async function fetchAllChats(userID) {
  try {
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

export async function fetchAIResponse(actionType, customPrompt) {
  try {
    const response = await fetch(
      `http://localhost:4000/api/v1/ai/generate-response`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: {
          actionType,
          customPrompt,
        },
      }
    );
    let jsonData = await response.text();
    let formattedData = await formatAiResponse(jsonData);
    return { formattedData, status: true };
  } catch (err) {
    console.log(err);
    return { formattedData: {}, status: false };
  }
}