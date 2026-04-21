import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";

// Create or get existing conversation between two users
export const createConversation = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.body.user.userId;

  try {
    // Check if conversation already exists
    const existing = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (existing) return res.status(200).json({ success: true, data: existing });

    const newConversation = await Conversation.create({
      members: [senderId, receiverId],
    });

    res.status(201).json({ success: true, data: newConversation });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all conversations for the logged-in user
export const getUserConversations = async (req, res) => {
  const userId = req.body.user.userId;

  try {
    const conversations = await Conversation.find({
      members: { $in: [userId] },
    }).populate("members", "firstName lastName profileUrl profession");

    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  const { conversationId, text } = req.body;
  const senderId = req.body.user.userId;

  try {
    const message = await Message.create({
      conversationId,
      sender: senderId,
      text,
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all messages in a conversation
export const getMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await Message.find({ conversationId })
      .populate("sender", "firstName lastName profileUrl")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.body.user.userId;

  try {
    await Message.updateMany(
      { conversationId, sender: { $ne: userId }, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};