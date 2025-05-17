import { Request, Response } from "express";
import AIService from "../services/aiService";

class AIController {
  private aiService: AIService;
  constructor() {
    this.aiService = new AIService();
  }
  public async generateAIResponse(req: Request, res: Response) {
    const { userID, chatID, prompt, actionType, imageURL,selectedText,CHAT_HISTORY } = req.body;
    try {
      const generatedResponse = await this.aiService.generateResposne(userID,chatID,selectedText,prompt,actionType,imageURL,CHAT_HISTORY)
      res.status(generatedResponse.status).send(generatedResponse)
    } catch (err: any) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }
}

export default AIController;
