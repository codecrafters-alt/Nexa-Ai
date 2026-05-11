import express from "express";
import {
  registerUser,
  loginUser,
  getUser,
} from "../controllers/auth.controllers.js";
import { authenticateUser } from "../middlewares/auth.middlewares.js";
const userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/data", authenticateUser, getUser);
export default userRouter;
