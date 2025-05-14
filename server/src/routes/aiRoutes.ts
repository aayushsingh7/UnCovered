import { Router } from "express";
import AIController from "../controllers/aiController";

const controller = new AIController();
const aiRouter = Router();

aiRouter.post("/generate", controller.generateAIResponse.bind(controller))

export default aiRouter;