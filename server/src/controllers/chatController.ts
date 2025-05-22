import { Request, Response } from "express";
import ChatService from "../services/chatService";

class ChatController {
  private chatService: ChatService;
  constructor() {
    this.chatService = new ChatService();
  }
  public async fetchAllChats(req: Request, res: Response) {
    try {
      const chats = await this.chatService.fetchAllChats(
        `${req.params.userID}`
      );
      res.status(200).send({
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
      const messages = await this.chatService.fetchMessages(
        `${req.params.chatID}`,
        parseInt(`${req.params.offset}`) || 0
      );
      res.status(200).send({
        success: true,
        message: "Messages Fetched Successfully",
        data: messages,
      });
    } catch (err: any) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }
  public async searchChatsAndMessages(req: Request, res: Response) {
    try {
      const searchResults = await this.chatService.searchChatsAndMessages(
        `${req.query.searchQuery}`,
        `${req.query.userID}`
      );
      res.status(200).send({
        success: true,
        message: "Search Results Fetched Successfully",
        data: searchResults,
      });
    } catch (err: any) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }
  public async deleteChat(req: Request, res: Response) {
    try {
      await this.chatService.deleteChat(req.params.chatID);
      res
        .status(200)
        .send({ success: true, message: "Chat Deleted Successfully" });
    } catch (err: any) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }
  public async addNewMessage(req: Request, res: Response) {
    try {
      const { userID, chatID, title, newMsg } = req.body;
      const response = await this.chatService.addNewMessage(
        userID,
        chatID,
        title,
        newMsg
      );
      res.status(response.status).send({
        success: response.success,
        message: response.message,
        newMessage: response.newMessage,
        newChat: response.newChat,
      });
    } catch (err: any) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }
}

export default ChatController;
