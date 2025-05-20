import { Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    chatID: { type: String, required: true },
    responseModel: {
      type: String,
      enum: ["sonar-pro", "sonar-reasoning-pro","gemini-2.0-flash"],
      required: true,
    },
    prompt: { type: String, default: null },
    selectedText: { type: String, default: null },
    actionType: {
      type: String,
      enum: ["deep-research", "quick-search", "fact-check", "user-query"],
    },
    answer: { type: String, required: true },
    sources: [],
    verdict: { type: String, enum: ["true", "false", "not-confirmed"] },
    responseRawJSON: { type: String },
  },
  { timestamps: true }
);

MessageSchema.index({ chatID: 1, createdAt: 1 });

const Message = model("Messages", MessageSchema);

export default Message;
