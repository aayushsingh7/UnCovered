import { Request, Response } from "express";
import ChatService from "../services/chatService";

class ChatController {
  private chatService: ChatService;
  constructor() {
    this.chatService = new ChatService();
  }
  public async fetchAllChats(req: Request, res: Response) {
    try {
      const chats = await this.chatService.fetchAllChats(`${req.params.userID}`);
      res
        .status(200)
        .send({
          success: true,
          message: "Chats Fetched Successfully",
          data: chats,
        });
    } catch (err: any) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }
  public async fetchMessages(req: Request, res: Response) {
     try {
      const messages = await this.chatService.fetchMessages(`${req.params.chatID}`,parseInt(`${req.params.offset}`) || 0);
      res
        .status(200)
        .send({
          success: true,
          message: "Messages Fetched Successfully",
          data: messages,
        });
    } catch (err: any) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }
  public async searchChat(req: Request, res: Response) {
     try {
      const searchResults = await this.chatService.searchChat(`${req.query.searchQuery}`,`${req.params.userID}`);
      res
        .status(200)
        .send({
          success: true,
          message: "Search Results Fetched Successfully",
          data: searchResults,
        });
    } catch (err: any) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }
  // NOTE: addNewMessage will be triggered by generateAIResponse (AIService.js)
}

export default ChatController;