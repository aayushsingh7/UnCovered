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

export async function fetchAIResponse(
  userID,
  chatID,
  prompt,
  actionType,
  imageURL
) {
  try {
    const response = await fetch(`http://localhost:4000/api/v1/ai/generate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: {
        userID,
        chatID,
        prompt,
        actionType,
        imageURL,
      },
    });
    let data = await response.json();
    console.log("AI GENERATED CODE", data)
    return data;
  } catch (err) {
    console.log(err);
    return { formattedData: {}, status: false };
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
