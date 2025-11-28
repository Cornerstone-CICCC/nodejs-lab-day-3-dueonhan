import express from "express";
import chatController from "../controllers/chat.controller";

const chatRouter = express.Router();

// Get all chat messages
chatRouter.get("/", chatController.getAllChats);
chatRouter.get("/chat/:room", chatController.getRoomChats);
//chatRouter.post("/chats", chatController.addChats);

export default chatRouter;
