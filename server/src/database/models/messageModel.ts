import { Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    chatID: { type: String, required: true },
    responseModel: {
      type: String,
      enum: ["sonar-pro", "sonar-deep-research"],
      required: true,
    },
    prompt: { type: String, default: null },
    selectedText: { type: String, default: null },
    actionType: {
      type: String,
      enum: ["deep-research", "quick-search", "fact-check", "user-query"],
    },
    answer: { type: String, required: true },
    sources: [
      {
        title: { type: String },
        image: {
          url: { type: String },
        },
        description: { type: String },
        url: { type: String },
        date: { type: Date, default: new Date().toISOString() },
        logo: {
          url: { type: String, default: "" },
        },
        publisher: { type: String },
      },
    ],
    documents: [{ type: String }],
    verdict: { type: String, enum: ["true", "false", "not-confirmed"] },
    responseRawJSON: { type: String },
  },
  { timestamps: true }
);

MessageSchema.index({ chatID: 1, createdAt: 1 });

const Message = model("Messages", MessageSchema);

export default Message;
