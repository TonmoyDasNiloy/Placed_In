import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  onlineUsers: [],
  unreadCount: 0,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    SetConversations(state, action) {
      state.conversations = action.payload;
    },
    SetCurrentConversation(state, action) {
      state.currentConversation = action.payload;
    },
    SetMessages(state, action) {
      state.messages = action.payload;
    },
    AddMessage(state, action) {
      state.messages.push(action.payload);
    },
    SetOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
    SetUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
  },
});

export const {
  SetConversations,
  SetCurrentConversation,
  SetMessages,
  AddMessage,
  SetOnlineUsers,
  SetUnreadCount,
} = messageSlice.actions;

export default messageSlice.reducer;