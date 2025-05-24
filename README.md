# FactSnap - Because truth shouldn't be hard to find.

**Stop misinformation in its tracks — three clicks, instant truth for anything you see on the web**

FactSnap is a revolutionary Chrome extension that brings real-time fact-checking, quick search, and deep research directly to your browsing experience. No copy-pasting. No new tabs. Just right-click — and know the truth.

---

## 🎯 The Problem I'm Solving

In today’s digital age, misinformation spreads faster than ever — not just during major events like conflicts or elections, but **every single day**.

From AI-generated images and deepfakes to fake headlines and out-of-context quotes, our feeds are flooded with misleading content. It’s becoming harder and harder to tell what’s real.

I saw this firsthand during the recent India-Pakistan tensions — my social media was filled with AI-generated visuals, fake news clips, and viral claims. But even outside of that, I still encounter suspicious content on a daily basis.

It’s not just me. These problems are everywhere:

- **AI-generated content** makes it hard to separate fact from fiction
- **Verified tools exist** (like ChatGPT, Perplexity) — but using them breaks your flow:  
  pause what you're doing → copy the claim → open a new tab → find the right tool → paste → run the search → scroll through a long response → decide what’s true
- **People want instant verification** without leaving the page or losing focus

**The result?** Misinformation spreads because fact-checking is just too slow and inconvenient.

That’s why I built **FactSnap** — select text → right-click → verify.  
No tab-switching, no effort. Just truth, instantly.

### 📈 Some Stats

- Over **62%** of people see misleading information online each week. [Source](https://www.poynter.org/fact-checking/media-literacy/2022/survey-says-large-majority-think-they-see-misinformation-online-every-week/)

- Around **37%** of people say they don't fact-check because it takes too much time.

- **76%** (on average across 29 countries) think **artificial intelligence** is making it easier to generate very **realistic fake news**, **stories**, and **images**. [Source](https://www.ipsos.com/en-in/data-dive-fake-news-age-ai)

- Many users say **they would fact-check more often if the process were quicker**. [Source](https://www.lmu.de/en/newsroom/news-overview/news/artificial-intelligence-stemming-the-tide-of-fake-facts.html)

- A significant portion of people have **believed fake news was real** at least once. [Source](https://www.ipsos.com/en-in/data-dive-fake-news-age-ai)

<img height="300px" src="https://res.cloudinary.com/dvk80x6fi/image/upload/v1747983183/kk_fd28so.png" alt="stat">

> _Source: World Economic Forum, based on 1,490 expert opinions collected Sep 4 – Oct 9, 2023_

---

## 💡 The Solution

FactSnap eliminates friction from fact-checking with **3-click verification**:

### For Text & Website Analysis 📝

1. **Select** any text/link on any webpage
2. **Right-click** → **FactSnap** → Choose from 3 options:
   - 🔍 **Quick Search** - Get instant context and information
   - ✅ **Fact-Check** - Get clear verdict: True/False/Unconfirmed
   - 🔬 **Deep Research** - Comprehensive analysis with citations

### For Images 🖼️

1. **Right-click** on any image
2. **FactSnap** → Choose from 2 options:
   - 🔍 **Quick Search** - AI-powered image analysis and context
   - ✅ **Fact-Check** - Image verification and misinformation detection

### Screen Capture 📸

1. **Click FactSnap extension icon** in toolbar
2. **Select "Capture Screen"** button
3. **Analyze** visual content for misinformation instantly

### Customization 🎛️

- **Auto-mode**: 3-click instant results
- **Custom prompt**: Add your own context for enhanced precision

<img src="https://res.cloudinary.com/dvk80x6fi/image/upload/v1748000389/file_2025-05-23_11.39.22_cdqxbv.png" alt="user-flow"/>

---

## 🚀 Key Features

| Feature                        | Description                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| **⚡ 3-Click Verification**    | Select text/link → Right-click → FactSnap → Choose mode                                |
| **🎯 Multiple Search Modes**   | Quick Search, Fact-Check, Deep Research for text; Quick Search & Fact-Check for images |
| **🖼️ Image Analysis**          | Right-click any image → FactSnap → Instant verification                                |
| **📸 Screen Capture**          | Extension toolbar → Capture Screen → Analyze content                                   |
| **🌐 Website Analysis**        | Paste any URL → Get summary or fact-check entire pages (right click also works)        |
| **📚 Citation-Backed Results** | All answers powered by Perplexity's reliable sources                                   |
| **🎨 Clean Interface**         | Non-intrusive, seamless browsing experience                                            |

---

## ✨ Sonar Models & APIs Used

- `sonar-pro`: Used for Quick Search and Fact-Checking
- `sonar-deep-research`: Used for Deep Research
- [Microlink.io](https://microlink.io/): Used to fetch source metadata (title, heading, description, logo)

### 🔐 Google OAuth Scopes

This app requests the following Google OAuth scopes:

- `https://www.googleapis.com/auth/userinfo.profile` – To access the user’s basic profile info (name, picture)
- `https://www.googleapis.com/auth/userinfo.email` – To access the user’s email address

---

## 🔧 Tech Stack

- **Frontend**: HTML + JavaScript (vanilla) + Chrome Extension APIs + CSS for styling.
- **Backend**: Node.js + Express
- **AI Power**: Perplexity Sonar API
- **Database**: MongoDB
- **Authentication**: Secure token-based auth

---

## 🎪 Live Demo

[Here's the live demo of FactSnap](https://youtu.be/mBQtaIPVOTs)

---

## 🚀 Quick Setup

### Prerequisites

- Node.js (v22+)
- Chrome Browser
- Git

### Installation (5 minutes)

1. **Clone the repository**

   ```bash
   git clone https://github.com/aayushsingh7/FactSnap.git
   cd FactSnap
   ```

2. **Install dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables**
   Create `.env` inside **server** folder:

   ```env
   PORT=4000
   PERPLEXITY_API_KEY=your_perplexity_api_key_here
   MONGODB_URI=your_mongodb_connection_string_here
   ```

4. **Load Chrome Extension**

   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" → Select the `client` folder

5. **Start the server**
   ```bash
   npm run dev
   ```

**That's it!** FactSnap is now running in your browser.

---

## 🎯 Target Audience

**Everyone suffers from misinformation.** FactSnap is built for:

- 📱 **Social Media Users** - Verify viral posts instantly
- 📰 **News Readers** - Check article claims in real-time
- 🎓 **Students & Researchers** - Quick fact-checking while studying
- 👥 **General Public** - Anyone who wants to stay informed with truth

---

## 🔮 Future Roadmap

- **📰 Personalized News Feed** - Curated, fact-checked content based on your interests
- **📄 Document Upload Support** - Fact-check PDFs, documents, and files
- **🤖 AI Content Detection** - Identify AI-generated text and images
- **📊 Misinformation Analytics** - Track and visualize misinformation trends

---

## 🧠 How Perplexity Powers FactSnap

FactSnap leverages **Perplexity Sonar API** (`sonar-pro` for quick-search & fact-check And `sonar-deep-research` for deep-research) to revolutionize real-time searching &fact-checking and make the world a better place:

### 🔄 **The Magic Behind Every Click**

1. **User Interaction**: When you select text/image or paste a URL, FactSnap captures your query
2. **Smart Query Processing**: Our backend intelligently formats your request for optimal Perplexity analysis
3. **Perplexity Sonar API**:
   - **For Text**: Analyzes claims against real-time, authoritative sources
   - **For Images**: Uses multimodal AI to understand visual content and verify claims
   - **For URLs**: Crawls and analyzes entire webpage content
4. **Citation-Rich Results**: Perplexity returns comprehensive answers with credible source links
5. **Intelligent Formatting**: FactSnap presents results in digestible formats (True/False/Unconfirmed verdicts)

### 🌍 **Making the World Better Through AI**

- **Combat Misinformation**: Every fact-check helps reduce the spread of false information
- **Promote Media Literacy**: Users learn to verify claims, creating more informed citizens
- **Real-Time Truth**: Perplexity's up-to-date search ensures users get current, accurate information
- **Source Transparency**: Direct access to credible sources builds trust in factual information
- **Accessibility**: Making professional-grade fact-checking available to everyone, everywhere

**By combining Perplexity's powerful AI with our seamless UX, we're democratizing truth verification and fighting misinformation at scale.**

---

## 🏆 Why FactSnap Will Win

### 🎯 **Solves a Real Problem**

Misinformation is a global crisis. We make verification effortless.

### ⚡ **Revolutionary UX**

First solution to make fact-checking as simple as right-click → FactSnap → verify.

### 🔬 **Powered by Perplexity**

Leverages the most reliable AI search engine with citations.

### 🌍 **Universal Impact**

Works on any website, any content, any language.

### 📈 **Scalable & Practical**

Ready for millions of users, easy to deploy and maintain.

---

<!--
## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

--- -->

## 📧 Contact & Support

- **GitHub**: [aayushsingh7/FactSnap](https://github.com/aayushsingh7/FactSnap)
- **Issues**: Report bugs or request features in our [Issues](https://github.com/aayushsingh7/FactSnap/issues) section

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 🌟 Built with ❤️ for a misinformation-free world

**FactSnap - Because truth shouldn't be hard to find.**

</div>
