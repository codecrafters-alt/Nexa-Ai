import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    sender: {
      type: String,
      enum: ["user", "model"],
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "pdf"],
      default: "text",
    },

    // 💬 text content
    content: {
      type: String,
      default: "",
    },

    // 📎 for image/pdf
    fileUrl: {
      type: String,
      default: "",
    },

    // 📄 optional (useful for UI)
    fileName: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const messageModel = mongoose.model("Message", messageSchema);
export default messageModel;
