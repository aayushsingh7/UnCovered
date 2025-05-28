import { startSession } from "mongoose";
import CustomError from "../../utils/customError";
import { generateRandomId } from "../../utils/generateRandomId";
import Chat from "../database/models/chatModel";
import Message from "../database/models/messageModel";
import { marked } from "marked"; // or use a Markdown stripper
import striptags from "striptags";

async function processMessage(newMsg: { answer?: string }) {
  const markdown = newMsg.answer || "";
  const html = await marked(markdown);
  const plainText = striptags(html);

  return {
    plainAnswer: plainText,
  };
}

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
        .select("title chatID createdAt updatedAt")
        .sort({ updatedAt: -1 });
      if (getUserChats.length == 0)
        throw new CustomError("No Chats Found", 204);
      return getUserChats;
    } catch (err: any) {
      throw new CustomError(err.message, 500);
    }
  }

  public async fetchMessages(chatID: string, offset: number) {
    try {
      let chat = await this.chat.findOne({ chatID: chatID });
      if (!chat) throw new CustomError("Chat does not exists", 404);
      let messages = await this.message
        .find({ chatID: chatID })
        .skip(offset)
        .limit(5)
        .sort({ createdAt: 1 });
      return messages;
    } catch (err: any) {
      throw new CustomError(err.message, 500);
    }
  }

  public async searchChatsAndMessages(query: string, userID: string) {
    try {
      const chats = await this.chat.find({
        user: userID,
        $text: { $search: `${query}` },
      });

      const messages = await this.message.find({
        sender: userID,
        $text: { $search: query },
      });

      return {
        chats,
        messages,
      };
    } catch (err: any) {
      throw new CustomError(err.message, 500);
    }
  }

  public async deleteChat(chatID: string) {
    const session = await startSession();
    session.startTransaction();
    try {
      let removeChat = await this.chat.deleteOne({ chatID }, { session });
      if (removeChat.deletedCount === 0) {
        throw new CustomError("Chat not found", 404);
      }
      await this.message.deleteMany({ chatID }, { session });
      await session.commitTransaction();
    } catch (err: any) {
      await session.abortTransaction();
      throw new CustomError(
        "Oops! something went wrong while deleting this chat",
        500
      );
    } finally {
      session.endSession();
    }
  }

  public async addNewMessage(
    userID: string,
    chatID: string,
    title: string,
    newMsg: any
  ) {
    const session = await startSession();
    session.startTransaction();
    try {
      const { plainAnswer } = await processMessage(newMsg);
      if (chatID) {
        const newMessage = await this.message.insertOne(
          {
            ...newMsg,
            sender: userID,
            plainAnswer: plainAnswer,
            chatID,
          },
          { session }
        );

        await session.commitTransaction();
        return {
          newMessage,
          success: true,
          newChat: null,
          status: 200,
          message: "Message saved successfully",
        };
      } else {
        const newChatID = generateRandomId();
        const newChat = await this.chat.insertOne(
          {
            chatID: newChatID,
            user: userID,
            title,
          },
          { session }
        );

        const newMessage = await this.message.insertOne(
          {
            ...newMsg,
            sender: userID,
            plainAnswer: plainAnswer,
            chatID: newChatID,
            createdAt: new Date(),
          },
          { session }
        );

        await session.commitTransaction();
        return {
          title,
          newMessage,
          newChat: {
            chatID: newChatID,
            title: title,
            createdAt: new Date().toISOString(),
          },
          success: true,
          status: 201,
          message: "New Chat Created And Message saved successfully",
        };
      }
    } catch (err: any) {
      await session.abortTransaction();
      throw new CustomError(err.message, 500);
    } finally {
      session.endSession();
    }
  }
}

export default ChatService;
