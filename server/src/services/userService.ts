import CustomError from "../../utils/customError";
import User from "../database/models/userModel";

class UserSerivce {
  private user: any;
  constructor() {
    this.user = User;
  }
  public async verifyOrCreateUser(userData: any) {
    console.log({userData})
    try {
      let isUserAlreadyExists = await this.user.findOne({
        email: userData.email,
      });
      console.log({isUserAlreadyExists})
      if (isUserAlreadyExists) {
        return {
          success: true,
          message: "User already exists",
          statusCode: 200,
          user: isUserAlreadyExists,
        };
      } else {
        let newUser = new User(userData);
        await newUser.save();
        return {
          success: true,
          message: "New User Created Successfully",
          statusCode: 201,
          user: newUser,
        };
      }
    } catch (err: any) {
      console.log(err)
      throw new CustomError(err.message, 500);
    }
  }
  public async getUserData(email: string) {
    try {
      let user = await this.user.findOne({ email });
      if (!user)
        throw new CustomError("No User Exists with the given Email", 404);
      return user;
    } catch (err: any) {
      throw new CustomError(err.message, 500);
    }
  }
}

export default UserSerivce;
