# FactSnap
One-click, real-time AI fact-checking and deep research for everything you see on the web.

- [Chrome extension DOCS](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world)
- [chrome.contextMenu](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
- [chrome.sidePanel](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)
- [chrome.runtime](https://developer.chrome.com/docs/extensions/reference/api/runtime#description)


## Table of Contents
- [About The Project](#about-the-project)
- [Problem Statement](#problem-statement)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How Perplexity Sonar API is Used](#how-perplexity-sonar-api-is-used)
- Getting Started
- Usage
- Contributing
- License

## About The Project
FactSnap is a **browser extension** that empowers users to **instantly fact-check any text they encounter online**. By leveraging the Perplexity Sonar API, FactSnap **provides real-time, citation-backed verification of claims found on social media, news articles, and more**. Highlight text, right-click, and let FactSnap do the rest-delivering concise verdicts and trustworthy sources in seconds.

## Problem Statement
**Misinformation** and **unverified claims** are **widespread across the internet**, especially on **social media** and **news platforms**. Users often **lack the tools or time to verify what they read, leading to the rapid spread of false information**. There is a critical need for a seamless, user-friendly solution that enables anyone to fact-check content in real time, directly within their browsing experience.

## Features
- **Right-Click Fact-Checking**: Highlight any text and use the browser's context menu to trigger FactSnap.

- **Real-Time Verification** : Instantly checks claims against authoritative sources using the Perplexity Sonar API.

- **Citation-Backed Results**: Presents clear verdicts (True, False, Unverified) with links to supporting evidence.

- **Source Transparency**: Displays direct citations and allows users to explore the underlying sources.



## Tech Stack

- Frontend: React (for web app and extension UI)

- Browser Extension: JavaScript/TypeScript, WebExtension APIs (Chrome, Firefox)

- Backend: Node.js (API integration, user management)

- Database: MongoDB

- Authentication: NextAuth.js or Firebase Auth

- Styling: CSS3

- AI Search: Perplexity Sonar API


## How Perplexity Sonar API is Used

FactSnap integrates the Perplexity Sonar API to perform real-time, AI-powered claim verification:

- When a user highlights text and activates FactSnap, the extension sends the selected text to the backend.

- The backend queries the Perplexity Sonar API with the claim or statement.

- Sonar analyzes the claim, searches the web for relevant, up-to-date sources, and returns a concise answer with citations.

- FactSnap displays the verdict (True, False, Unverified) along with source links and brief explanations, all powered by Sonar's real-time, citation-backed results.

This seamless integration ensures that users receive trustworthy, transparent, and up-to-date fact-checking directly in their browser.