//create chat
import chatModel from "../models/chat.models.js";
/**
 * 🔹 Create Chat
 * POST /api/chat
 */
export const createChat = async (req, res) => {
  try {
    const { title } = req.body;

    // assuming user is coming from auth middleware
    const userId = req.user._id;

    const chat = await chatModel.create({
      userId,
      title: title || "New Chat",
    });

    return res.status(201).json({
      success: true,
      message: "Chat created successfully",
      data: chat,
    });
  } catch (error) {
    console.error("Create Chat Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create chat",
    });
  }
};

/**
 * 🔹 Get All Chats of Logged-in User
 * GET /api/chat
 */
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await chatModel.find({ userId }).sort({ updatedAt: -1 }); // latest first

    return res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    console.error("Get Chats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
    });
  }
};

/**
 * 🔹 Delete Chat
 * DELETE /api/chat/:chatId
 */
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await chatModel.findOneAndDelete({
      _id: chatId,
      userId, // 🔥 ensures user can delete only their own chat
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Delete Chat Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete chat",
    });
  }
};
