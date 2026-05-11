import express from "express";
import { authenticateUser } from "../middlewares/auth.middlewares.js";
import {
  createChat,
  getUserChats,
  deleteChat,
} from "../controllers/chat.controllers.js";

const chatRouter = express.Router();
chatRouter.post("/create", authenticateUser, createChat);
chatRouter.get("/get", authenticateUser, getUserChats);
chatRouter.post("/delete/:chatId", authenticateUser, deleteChat);
export default chatRouter;
