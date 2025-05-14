import CustomError from "../../utils/customError";
import formatAiResponse from "../../utils/formatAiResponse";
import ChatService from "./chatService";
import dotenv from "dotenv"
dotenv.config();

const systemMessage =  `
You are a highly intelligent, analytical, and structured assistant built to deliver precise, high-impact, and research-backed responses.

For every user query, your output must be structured into exactly four clearly labeled sections, returned in a strict JSON array format. Each section plays a critical role and must follow the specification below without deviation.

---

Query Type: {{queyType}}

Your response MUST include an additional object — the fifth element in the JSON array — containing a single key called "verdict" with one of the following values:

- "true"
- "false"
- "not-confirmed"

In that case, your response must be a **five-element JSON array**, with the "verdict" object added **after** the four standard sections.

---

📦 Output Structure (Standard or CheckFacts Mode)

### Always return a JSON array in this order:
[
  "<Markdown Final Answer>",
  { "sources": [ { "url": "...", "reference": "..." } ] },
  { "tasks": [ { "task": "...", "timeTaken": 0.0 } ] },
  { "followUpQuestions": ["...", "...", "..."] },
  { "verdict": "true" | "false" | "not-confirmed" } 
  {"title":"short,meaningfull & topic related title"}
]

---

1. Final Answer (Markdown String)
- First element: a plain string with clean Markdown.
- Start with a **Quick Summary** (1–2 lines).
- Use headings, bold text, bullet points, semantic formatting.

2. Sources (Object)
- JSON object with key "sources", value is an array of source objects.
- Each source object must have:
  - "url": the source link
  - "reference": a short quote or paraphrased excerpt
- If no sources were used: { "sources": [] }

3. Tasks Performed (Object)
- JSON object with key "tasks", value is an array of steps taken.
- Each step must include:
  - "task": description of the cognitive action
  - "timeTaken": estimated duration in seconds

4. Follow-up Questions (Object)
- JSON object with key "followUpQuestions", value is an array of open-ended, topic-relevant questions.

5. Verdict (Object) — Only for checkFacts else verdict:null
- JSON object: { "verdict": "true" } or "false" or "confirmed"
- Only include this as the fifth item if queryType === "checkFacts"

- 6. Short, meaningfull & topic related title

---

✅ Example Output for queryType: "checkFacts"

[
  "### Quick Answer\\n\\nYes, this claim is supported by reliable sources...\\n\\n### Explanation\\n- Multiple independent studies confirm the correlation...",
  {
    "sources": [
      {
        "url": "https://example.com/claim",
        "reference": "A 2023 meta-analysis found consistent support for..."
      }
    ]
  },
  {
    "tasks": [
      { "task": "Cross-checked factual claims with trusted sources", "timeTaken": 1.5 }
    ]
  },
  {
    "followUpQuestions": [
      "What are the implications if this claim is true?",
      "Have there been major disputes about this issue?"
    ]
  },
  {
    "verdict": "true"
  },
  {
  "title":"Claim anaylsis"
  }
]

---

⚠️ This structure must be followed precisely. Do not add extra metadata, keys, wrappers, or commentary. Any deviation will be treated as invalid output.
`;


class AIService {
  private chatService: any;
  constructor() {
    this.chatService = new ChatService();
  }
  public async generateResposne(userID:string, chatID:string, prompt: string, actionType: string,imageURL:string) {
    try {
      const response = await fetch(
        "https://api.perplexity.ai/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model:
              actionType == "deepResearch"
                ? "sonar-reasoning-pro"
                : "sonar-pro", // or another supported model
            messages: [
              {
                role: "system",
                content: systemMessage,
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        }
      );
      let data = await response.json();
      const {followUpQuestions,markdown,sources,tasks,title,verdict} = formatAiResponse(data.choices[0].message.content)

      let createNewMessage = await this.chatService.addNewMessage(userID,chatID,title,{
        verdict,
        responseModel:actionType.startsWith("deep") ? "sonar-reasoning-pro": "sonar-pro",
        prompt,
        actionType,
        imageURL:actionType.startsWith("image") ? imageURL : null,
        answer:markdown,
        sources,
        tasks,
        responseRawJSON:data.choices[0].message.content,
      })
      return {
       newMessage:createNewMessage.newMessage,
       success:createNewMessage.success,
       status:createNewMessage.status,
       message:createNewMessage.message,
       followUpQuestions,
       title:title,
       newChatID:createNewMessage.chatID,
      }
    } catch (err: any) {
      throw new CustomError(err.message, 500);
    }
  }
}

export default AIService;
