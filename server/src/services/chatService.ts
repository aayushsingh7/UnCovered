import CustomError from "../../utils/customError";
import { generateRandomId } from "../../utils/generateRandomId";
import Chat from "../database/models/chatModel";
import Message from "../database/models/messageModel";

class ChatService {
  private chat: any;
  private message: any;
  constructor() {
    this.chat = Chat;
    this.message = Message;
  }
  public async fetchAllChats(userID: string) {
    try {
      let getUserChats = await this.chat
        .find({ user: userID })
        .select("title chatID createdAt updatedAt");
      if (getUserChats.length == 0)
        throw new CustomError("No Chats Found", 404);
      return getUserChats;
    } catch (err: any) {
      throw new CustomError(err.message, 500);
    }
  }

  public async fetchMessages(chatID: string, offset:number) {
    try {
      let chat = await this.chat.findOne({ chatID: chatID });
      if (!chat) throw new CustomError("Chat does not exists", 404);
      let messages = await this.message.find({chatID:chatID}).skip(offset).limit(5).sort({createdAt:1})
      return messages;
    } catch (err: any) {
      throw new CustomError(err.message, 500);
    }
  }

  public async searchChat(query: string, userID:string) {
    try {
    } catch (err: any) {
      throw new CustomError(err.message, 500);
    }
  }

  public async addNewMessage(userID:string, chatID:string, title:string, newMsg:any) {
    try {
      if (chatID) {
        // Insert message into existing chat
        const newMessage = await this.message.insertOne({
          ...newMsg,
          chatID,
        });

        return {
          newMessage,
          success: true,
          newChat:null,
          status: 200,
          message: "Message saved successfully",
        };
      } else {
        // Create new chat
        const newChatID = generateRandomId();
        const newChat = await this.chat.insertOne({
          chatID: newChatID,
          user: userID,
          title,
        });

        // Create and save first message
        const newMessage = await this.message.insertOne({
          ...newMsg,
          chatID: newChatID,
          createdAt: new Date(),
        });

        return {
          title,
          newMessage,
          newChat:{
            chatID:newChatID,
            title:title,
            createdAt:new Date().toISOString()
          },
          success: true,
          status: 201,
          message: "New Chat Created And Message saved successfully",
        };
      }
    } catch (err: any) {
      throw new CustomError(err.message, 500);
    }
  }
}

export default ChatService;
