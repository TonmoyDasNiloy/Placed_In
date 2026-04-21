import express from "express";
import {
  createConversation,
  getUserConversations,
  sendMessage,
  getMessages,
  markAsRead,
} from "../controllers/messageController.js";
import userAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/conversation", userAuth, createConversation);
router.post("/conversations", userAuth, getUserConversations);
router.post("/send", userAuth, sendMessage);
router.get("/:conversationId", userAuth, getMessages);
router.put("/read/:conversationId", userAuth, markAsRead);

export default router;