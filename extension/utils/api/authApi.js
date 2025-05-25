import { API_URL } from "../../panel.js";
import { newChatLayout } from "../helpers/domHelpers.js";
import { showToast } from "../utils.js";

export async function fetchUserInfo(token) {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    const userInfo = await response.json();
    const dbUser = await verifyOrCreateUser(userInfo);

    await chrome.storage.local.set({
      loggedInUser: {
        name: dbUser.data.name,
        _id: dbUser.data._id,
        email: dbUser.data.email,
        lastLoggedInDate: new Date().toISOString(),
      },
    });

    chrome.storage.local.get(["loggedInUser"], (result) => {
      document.body.innerHTML = newChatLayout(result.loggedInUser);
      return result.loggedInUser;
    });
  } catch (err) {
    showToast("Oops! something went wrong while fetching user info", "error");
    return null;
  }
}

export async function getUserInfo() {
  try {
    const result = await new Promise((resolve) =>
      chrome.storage.local.get(["loggedInUser"], resolve)
    );
    const user = result.loggedInUser;
    if (user && user._id && user.lastLoggedInDate) {
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const lastLogin = new Date(user.lastLoggedInDate).getTime();
      if (now - lastLogin < THIRTY_DAYS_MS) {
        document.body.innerHTML = newChatLayout(user);
        return user;
      }
    }
    document.body.innerHTML = `
    <div class="toast-container" id="toastContainer"></div>
    <div class="login" id="login">
      <h2>FactSnap Authentication</h2>
      <p>Please Wait, while we verify you...</p>
    </div>`;
    const token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError || !token) {
          return reject(chrome.runtime.lastError);
        }
        resolve(token);
      });
    });
    return await fetchUserInfo(token);
  } catch (error) {
    showToast("User authentication failed, try again", "error");
    console.error("Authentication failed:", error);
    return null;
  }
}

export async function verifyOrCreateUser(userInfo) {
  try {
    const response = await fetch(`${API_URL}/users/verifyOrCreateUser`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userInfo),
    });
    const user = await response.json();
    return user;
  } catch (err) {
    showToast("(For Organizers) Make sure the server is up and running.","warning")
    let span = document.createElement("span")
    span.innerText = "After verifying the server is up and runnig, please close the extension and restart"
    document.getElementById("login").appendChild(span)
  }
}
