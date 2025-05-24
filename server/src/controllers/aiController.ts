import { Request, Response } from "express";
import AIService from "../services/aiService";


export class AIController {
  private aiService: AIService;
  constructor() {
    this.aiService = new AIService();
  }

  public async generateAIResponse(req: Request, res: Response) {
    const {
      userID,
      chatID,
      prompt,
      actionType,
      selectedText,
      LINKS,
      CHAT_HISTORY,
    } = req.body;

    try {
      // Set headers for SSE streaming
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Cache-Control");

      let hasError = false;

      try {
        for await (const chunk of this.aiService.askPerplexity(
          userID,
          chatID,
          selectedText,
          prompt,
          actionType,
          CHAT_HISTORY
        )) {
          if (!res.writableEnded) {
            res.write(chunk);
          }
        }
      } catch (streamError) {
        console.error("Streaming error:", streamError);
        hasError = true;
        if (!res.writableEnded) {
          res.write(
            `data: ${JSON.stringify({ error: "Streaming failed" })}\n\n`
          );
          res.write(`data: [DONE]\n\n`);
        }
      } finally {
        if (!res.writableEnded) {
          if (!hasError) {
            res.write(`data: [DONE]\n\n`);
          }
          res.end();
        }
      }
    } catch (err: any) {
      if (!res.writableEnded) {
        res.status(err.statusCode || 500).json({
          success: false,
          message: err.message || "something went wrong",
        });
      }
    }
  }
}

export default AIController;
