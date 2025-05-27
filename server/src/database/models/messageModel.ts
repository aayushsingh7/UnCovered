import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    chatID: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
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
    plainAnswer: { type: String },
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

messageSchema.index({ plainAnswer: "text" });
messageSchema.index({ sender: 1 });

const Message = model("Messages", messageSchema);
export default Message;
