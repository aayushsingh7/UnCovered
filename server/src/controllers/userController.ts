import { Request, Response } from "express";
import UserSerivce from "../services/userService";

class UserController {
  private userService: UserSerivce;
  constructor() {
    this.userService = new UserSerivce();
  }
  public async verifyOrCreateUser(req: Request, res: Response) {
    try {
      const { success, message, statusCode, user } =
        await this.userService.verifyOrCreateUser(req.body);
      res.status(statusCode).send({ success, message, data: user });
    } catch (err: any) {
      res.status(err.statusCode || 500).send({ success: false, message: err.message });
    }
  }
  public async getUserData(req: Request, res: Response) {
    try {
      const user = await this.userService.getUserData(`${req.params.email}`);
      res.status(200).send({
        success: true,
        message: "User Fetched Successfully",
        data: user,
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).send({ success: false, message: err.message });
    }
  }
}

export default UserController;
