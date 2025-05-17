import { response } from "express";
import CustomError from "../../utils/customError";
import formatAiResponse from "../../utils/formatAiResponse";
import ChatService from "./chatService";
import dotenv from "dotenv";
dotenv.config();

const SYSTEM_PROMPT = `You are a precise, structured, and intelligent assistant. Always return answers in a strict JSON object format with exactly these 5 fields in this order: shortAnswer, detailedAnswer, followUpQuestions, verdict, and title. Do not include a sources field. Do not use code blocks, markdown wrappers, or any extra text.\n\n📦 Output Format:\n{\n  "shortAnswer": "## Short Answer\\nYour answer here",\n  "detailedAnswer": "## Detailed Answer\\nDetailed analysis using tables, bullet points, etc.",\n  "followUpQuestions": [\n    "Follow-up question 1?",\n    "Follow-up question 2?",\n    "Follow-up question 3?"\n  ],\n  "verdict": "not-confirmed | true | false",\n  "title": "Descriptive, concise title"\n}\n\n---\n\n📝 Final Answer Rules:\n\n- shortAnswer and detailedAnswer must always follow the instructions for the given queryType:\n  - deep-research: shortAnswer is a brief summary (1–2 sentences), detailedAnswer is a full, structured analysis with sections and headings.\n  - fact-check: shortAnswer is a short conclusive summary (e.g., "This claim is mostly false."), detailedAnswer includes evidence, breakdown, counterpoints, and limitations.\n  - quick-search: shortAnswer is a concise factual answer (1–3 sentences), use can give very detailed detailedAnswer if needed.\n\n- followUpQuestions should be 2–4 relevant, thoughtful questions.\n- verdict should be a concise status (e.g., "true","false", "not-confirmed",).\n- title should be a clear, descriptive headline.\n\nRemember: For **general, emotional, or social queries** (e.g., "how are you?", "I'm feeling down", "tell me a joke"):\n  - Responds **normally and empathetically**\n  - **No JSON output or formatting** required`

class AIService {
  private chatService: any;
  constructor() {
    this.chatService = new ChatService();
  }
  public async generateResposne(
    userID: string,
    chatID: string,
    selectedText: string,
    prompt: string,
    actionType: string,
    imageURL: string,
    CHAT_HISTORY:any[],
  ) {
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
              actionType == "deep-research"
                ? "sonar-deep-research"
                : "sonar-reasoning",
            messages: [
              {
                role: "system",
                content:SYSTEM_PROMPT
              },
              ...CHAT_HISTORY
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                schema: {
                  type: "object",
                  properties: {
                    shortAnswer: { type: "string" },
                    detailedAnswer: { type: "string" },
                    followUpQuestions: {
                      type: "array",
                      items: { type: "string" },
                    },
                    verdict: {
                      type: "string",
                      enum: ["true", "false", "not-confirmed"],
                    },
                    title: { type: "string" },
                  },
                  required: [
                    "shortAnswer",
                    "detailedAnswer",
                    "followUpQuestions",
                    "verdict",
                    "title",
                  ],
                },
              },
            },
          }),
        }
      );
      let data = await response.json();
      // return {
      //   success: true,
      //   message: "b",
      //   status: 200,
      //   data: data,
      //   sources:data.citations,
      //   finally:formatAiResponse(data.choices[0].message.content)
      // };

      // console.log({output})
      //
      const { followUpQuestions, markdown, title, verdict } = formatAiResponse(
        data.choices[0].message.content
      );

      // console.log(".....chat id inside the server.....")

      let createNewMessage = await this.chatService.addNewMessage(
        userID,
        chatID,
        title,
        {
          verdict,
          responseModel: actionType.startsWith("deep")
            ? "sonar-reasoning-pro"
            : "sonar-pro",
          prompt,
          selectedText,
          actionType,
          imageURL: actionType.startsWith("image") ? imageURL : null,
          answer: markdown,
          sources: data.citations,
          responseRawJSON: data.choices[0].message.content,
        }
      );
      return {
        newMessage: createNewMessage.newMessage,
        success: createNewMessage.success,
        status: createNewMessage.status,
        message: createNewMessage.message,
        followUpQuestions,
        title: title,
        newChatID: createNewMessage.chatID,
      };
    } catch (err: any) {
      console.log(err);
      throw new CustomError(err.message, 500);
    }
  }
}

export default AIService;

function escapeSpecialChars(jsonStr: string) {
  return jsonStr.replace(/\n/g, "\\n");
}
