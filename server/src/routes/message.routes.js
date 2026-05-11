import messageModel from "../models/message.models.js";
import chatModel from "../models/chat.models.js";
import express from "express";
import { authenticateUser } from "../middlewares/auth.middlewares.js";
import {
  sendMessage,
  getMessages,
  uploadPdf,
  sendEmail,
} from "../controllers/message.controllers.js";
import { upload } from "../middlewares/multer.js";
const messageRouter = express.Router();
messageRouter.post("/send", authenticateUser, sendMessage);
messageRouter.get("/get/:chatId", authenticateUser, getMessages);
messageRouter.post(
  "/upload-pdf",
  authenticateUser,
  upload.single("file"),
  uploadPdf,
);
messageRouter.post("/send-email", authenticateUser, sendEmail);
export default messageRouter;
