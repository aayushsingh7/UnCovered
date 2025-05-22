import { Router } from "express";
import ChatController from "../controllers/chatController";

const controller = new ChatController();
const chatRouter = Router();

chatRouter.get('/user/:userID', controller.fetchAllChats.bind(controller));
chatRouter.get('/:chatID/messages/:offset', controller.fetchMessages.bind(controller));
chatRouter.get('/search', controller.searchChat.bind(controller));
chatRouter.post('/messages/create', controller.addNewMessage.bind(controller));
chatRouter.delete('/:chatID', controller.deleteChat.bind(controller));

export default chatRouter;