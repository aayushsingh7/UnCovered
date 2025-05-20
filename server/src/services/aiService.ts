import { response } from "express";
import CustomError from "../../utils/customError";
import formatAiResponse from "../../utils/formatAiResponse";
import ChatService from "./chatService";
import dotenv from "dotenv";
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

class AIService {
  private chatService: any;
  private model: any;

  constructor() {
    this.chatService = new ChatService();
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
          max_tokens: 4096, // Ensure sufficient tokens for complete responses
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

          // if (done) {
          //   // Process any remaining data in buffer
          //   if (buffer.trim()) {
          //     const lines = buffer.split("\n").filter(line => line.trim().startsWith("data: "));
          //     for (const line of lines) {
          //       const jsonString = line.replace("data: ", "").trim();
          //       if (jsonString && jsonString !== "[DONE]") {
          //         try {
          //           const data = JSON.parse(jsonString);
          //           const content = data?.choices?.[0]?.delta?.content || data?.choices?.[0]?.message?.content;
          //           if (content) {
          //             yield `data: ${JSON.stringify({
          //               choices: [{ delta: { content: content } }],
          //             })}\n\n`;
          //           }
          //         } catch (err) {
          //           console.warn("Failed to parse final buffer chunk:", jsonString);
          //         }
          //       }
          //     }
          //   }
          //   yield `data: [DONE]\n\n`;
          //   break;
          // }

          // Decode the chunk and add to buffer
          const text = decoder.decode(value, { stream: true });
          buffer += text;

          // Process complete lines
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep the last potentially incomplete line

          for (const line of lines) {
            if (line.trim().startsWith("data: ")) {
              const jsonString = line.replace("data: ", "").trim();

              // if (jsonString === "[DONE]") {
              //   yield `data: [DONE]\n\n`;
              //   return;
              // }

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

                // Handle finish reason
                if (data?.choices?.[0]?.finish_reason === "stop") {
                  yield `data: [DONE]\n\n`;
                  return;
                }
              } catch (err) {
                console.warn("Failed to parse chunk:", jsonString, err);
                // Continue processing other chunks
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
}

export default AIService;
