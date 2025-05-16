import { Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    chatID: { type: String, required: true },
    responseModel: {
      type: String,
      enum: ["sonar-pro", "sonar-reasoning-pro"],
      required: true,
    },
    prompt: { type: String, default: null },
    selectedText: { type: String, default: null },
    actionType: {
      type: String,
      enum: ["deep-research", "quick-search", "fact-check", "user-query"],
    },
    imageURL: { type: String, default: null },
    answer: { type: String, required: true },
    sources: [{ type: String }],
    verdict: { type: String, enum: ["true", "false", "not-confirmed"] },
    responseRawJSON: { type: String },
  },
  { timestamps: true }
);

MessageSchema.index({ chatID: 1, createdAt: 1 });

const Message = model("Messages", MessageSchema);

export default Message;
