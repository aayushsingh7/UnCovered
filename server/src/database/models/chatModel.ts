import { Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    chatID: { type: String, required: true },
  },
  { timestamps: true }
);

chatSchema.index({ user: 1, title: "text" },{default_language: 'none'});

const Chat = model("Chat", chatSchema);

export default Chat;
