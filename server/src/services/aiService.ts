import dotenv from "dotenv";
import ChatService from "./chatService";
import CustomError from "../../utils/customError";
import Message from "../database/models/messageModel";
import generateUserContext from "../../utils/userContext";
dotenv.config();

const SYSTEM_PROMPT = `**ALAWAYS RETURN RESPONSE IN MARKDOWN FORMAT USING HEADINGS, BULLET POINTS, TABLES, HIGHLIGHTING, ETC**.

## Final Answer Rules:

- Start with a {verdict: "true" | "false" | "not-confirmed"} based on your analysis.

- ## Short Answer and ## Detailed Answer must always follow the instructions for the given queryType:
  - deep-research: shortAnswer is a brief summary (1–2 sentences), detailedAnswer is a full, structured analysis with sections and headings.
  - fact-check: shortAnswer is a short conclusive summary (e.g., "This claim is mostly false."), detailedAnswer includes evidence, breakdown, counterpoints, and limitations.
  - quick-search: shortAnswer is a concise factual answer (1–3 sentences), use can give very detailed detailedAnswer if needed.

Remember: For **general, emotional, or social queries** (e.g., "how are you?", "I'm feeling down", "tell me a joke"):
  - Responds **normally and empathetically**
  - **No JSON output or formatting** required

## IMPORTANT: ALWAYS FOLLOW THE ABOVE FORMAT NO MATTER WHAT.
`;

const GENERATE_HUMAN_ANSWER = `You will be given a detailed fact-checking response (README-style, possibly with sources and images).

Your task:
- Write a short, human-like reply in natural, conversational language — like a thoughtful social media comment.
- Be concise, clear, and respectful — avoid long paragraphs or overly technical language.
- Focus on calmly correcting the main false or misleading claim with **just the key facts**.
- Avoid aggressive words like “entirely false” — prefer softer phrasing like “inaccurate” or “not supported by evidence.”
- Do NOT include inline references like [1], [2], or citation numbers.
- Include source links ONLY IF essential to clarify or back up disputed facts.
- If the image/text alone makes the truth obvious, you can skip sources.
- If sources are needed, place them at the end under:
  Sources:
  - https://example.com/...
- Do NOT invent or guess links — only use verified ones.
- Always sound like a calm, informed person debunking misinformation — not robotic, sarcastic, or preachy.`;


class AIService {
  private chatService: ChatService;
  private model: any;
  private message: any;

  constructor() {
    this.chatService = new ChatService();
    this.message = Message;
  }

  public async *askPerplexity(
    userID: string,
    chatID: string,
    selectedText: string,
    prompt: string,
    actionType: string,
    CHAT_HISTORY: any[]
  ) {
    let response: Response | null = null;
    let accumulatedContent: string = "";

    try {
      response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model:
            actionType === "deep-research"
              ? "sonar-deep-research"
              : "sonar-pro",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            ...CHAT_HISTORY,
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 5000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Perplexity API error: ${response.status} - ${errorText}`
        );
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let citationsSent = false;

      try {
        while (true) {
          const { value, done } = await reader.read();
          if(done) break;
          // Decode the chunk and add to buffer
          const text = decoder.decode(value, { stream: true });
          buffer += text;

          // Process complete lines
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim().startsWith("data: ")) {
              const jsonString = line.replace("data: ", "").trim();

              if (!jsonString) continue;

              try {
                const data = JSON.parse(jsonString);

                // Send citations once at the beginning
                if (data?.citations && !citationsSent) {
                  yield `data: ${JSON.stringify({
                    citations: data.citations,
                  })}\n\n`;
                  citationsSent = true;
                }

                // Send content chunks
                const content = data?.choices?.[0]?.delta?.content;

                if (content) {
                  accumulatedContent += content;
                  yield `data: ${JSON.stringify({
                    choices: [{ delta: { content: content } }],
                  })}\n\n`;
                }

                if (data?.choices?.[0]?.finish_reason === "stop") {
                  yield `data: [DONE]\n\n`;
                  return;
                }
              } catch (err) {
                console.warn("Failed to parse chunk:", jsonString, err);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error: any) {
      console.error("askPerplexity error:", error.message);
      yield `data: ${JSON.stringify({ error: error.message })}\n\n`;
      yield `data: [DONE]\n\n`;
      throw error;
    }
  }
  public async generateHumanReply(messageID: string) {
    try {
      const message = await this.message.findOne({ _id: messageID });
      if (!message)
        throw new CustomError("No message exists with the given ID", 404);
      const response = await fetch(
        "https://api.perplexity.ai/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [
              {
                role: "system",
                content: GENERATE_HUMAN_ANSWER,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `User Prompt: ${message.prompt}
User Context: ${generateUserContext(message.selectedText, message.documents)}
ANSWER: ${message.responseRawJSON}\n\n${message.sources
                      .map(
                        (source: any, index: number) =>
                          `${index + 1}` + source.url
                      )
                      .join("\n")}`,
                  },
                  ...message.documents.map((imageLink: string) => ({
                    type: "image_url",
                    image_url: { url: imageLink },
                  })),
                ],
              },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        }
      );
      const data = await response.json();
      return data?.choices?.[0]?.message?.content;
    } catch (err) {
      throw new CustomError(
        "Oops! something went wrng while generating human-like reply",
        500
      );
    }
  }
}

export default AIService;
