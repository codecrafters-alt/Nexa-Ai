import app from "./src/app.js";
import dotenv from "dotenv";
import connectToDB from "./src/db/db.js";
import cors from "cors";
import express from "express";
import userRouter from "./src/routes/user.routes.js";
import chatRouter from "./src/routes/chat.routes.js";
import messageRouter from "./src/routes/message.routes.js";
import cookieParser from "cookie-parser";
import { limiter } from "./src/middlewares/ratelimiter.js";
dotenv.config();
connectToDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/user", limiter, userRouter);
app.use("/api/chat", limiter, chatRouter);
app.use("/api/message", limiter, messageRouter);
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
