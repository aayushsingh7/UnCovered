import { Router } from "express";
import UserController from "../controllers/userController";

const controller = new UserController();
const userRouter = Router();

userRouter.get("/:email", controller.getUserData.bind(controller))
userRouter.post("/verifyOrCreateUser", controller.verifyOrCreateUser.bind(controller))


export default userRouter;