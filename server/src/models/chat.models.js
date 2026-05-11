import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "New Chat",
    },

    // 🔥 PDF attached to this chat
    pdfUrl: {
      type: String,
      default: "",
    },

    // 🔥 Track processing status (very useful)
    isPdfProcessed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const chatModel = mongoose.model("Chat", chatSchema);
export default chatModel;
