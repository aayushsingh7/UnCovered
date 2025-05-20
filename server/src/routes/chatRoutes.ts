import { Router } from "express";
import ChatController from "../controllers/chatController";

const controller = new ChatController();
const chatRouter = Router();

chatRouter.get("/:userID", controller.fetchAllChats.bind(controller))
chatRouter.get("/:chatID/messages/:offset", controller.fetchMessages.bind(controller))
chatRouter.get("/:userID", controller.searchChat.bind(controller))
chatRouter.post("/messages/create",controller.addNewMessage.bind(controller))

export default chatRouter;