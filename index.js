import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createServer } from "http";
import userRouter from "./routers/user.router.js";
import postRouter from "./routers/post.router.js";
import followerRouter from "./routers/follower.router.js";
import rateLimit from "express-rate-limit";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" assert { type: "json" };

dotenv.config();

const app = express();

// Define a rate limit middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});

// Apply the rate limiter to all requests
app.use(limiter);

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  try {
    res.status(200).json({ message: "Welcome to Social media API" });
  } catch (error) {
    res.status(404).json({ message: "Test Failed" });
  }
});

app.use("/api/user/", userRouter);
app.use("/api/post/", postRouter);
app.use("/api/follower/", followerRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const server = createServer(app);
export { app, server };
export default app;
