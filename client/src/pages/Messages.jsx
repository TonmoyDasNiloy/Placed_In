import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TopBar } from "../components";
import { NoProfile } from "../assets";
import { apiRequest } from "../utils";
import {
  SetConversations,
  SetCurrentConversation,
  SetMessages,
  AddMessage,
} from "../redux/messageSlice";
import { useSocket } from "../context/SocketContext";
import moment from "moment";

const Messages = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { user } = useSelector((state) => state.user);
  const { conversations, currentConversation, messages, onlineUsers } =
    useSelector((state) => state.message);

  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch all conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      const res = await apiRequest({
        url: "/messages/conversations",
        token: user?.token,
        method: "POST",
      });
      if (res?.success) dispatch(SetConversations(res.data));
    };
    fetchConversations();
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!currentConversation?._id) return;
    const fetchMessages = async () => {
      const res = await apiRequest({
        url: `/messages/${currentConversation._id}`,
        token: user?.token,
        method: "GET",
      });
      if (res?.success) dispatch(SetMessages(res.data));

      // Mark as read
      await apiRequest({
        url: `/messages/read/${currentConversation._id}`,
        token: user?.token,
        method: "PUT",
      });
    };
    fetchMessages();
  }, [currentConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator listeners
  useEffect(() => {
    if (!socket?.current) return;
    socket.current.on("typing", () => setIsTyping(true));
    socket.current.on("stopTyping", () => setIsTyping(false));
    return () => {
      socket.current.off("typing");
      socket.current.off("stopTyping");
    };
  }, [socket]);

  const getReceiver = (conversation) => {
    return conversation?.members?.find((m) => m._id !== user._id);
  };

  const isOnline = (userId) => {
    return onlineUsers.some((u) => u.userId === userId);
  };

  const handleSelectConversation = (conversation) => {
    dispatch(SetCurrentConversation(conversation));
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    const receiver = getReceiver(currentConversation);
    if (!typing) {
      setTyping(true);
      socket.current.emit("typing", {
        senderId: user._id,
        receiverId: receiver?._id,
      });
    }
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.current.emit("stopTyping", {
        senderId: user._id,
        receiverId: receiver?._id,
      });
      setTyping(false);
    }, 1500);
  };

  const handleSend = async () => {
    if (!text.trim() || !currentConversation) return;

    const receiver = getReceiver(currentConversation);

    // Save to DB
    const res = await apiRequest({
      url: "/messages/send",
      token: user?.token,
      method: "POST",
      data: { conversationId: currentConversation._id, text },
    });

    if (res?.success) {
      const newMessage = res.data;

      // Add to local state immediately
      dispatch(AddMessage(newMessage));

      // Emit to receiver via socket
      socket.current.emit("sendMessage", {
        senderId: user._id,
        receiverId: receiver?._id,
        message: newMessage,
      });

      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full px-0 lg:px-10 pb-5 2xl:px-40 bg-bgColor h-screen overflow-hidden">
      <TopBar />
      <div className="w-full flex gap-3 lg:gap-5 pt-5 h-[calc(100vh-70px)]">

        {/* LEFT — Conversations list */}
        <div className="w-1/3 lg:w-1/4 h-full glass rounded-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/20">
            <h2 className="font-semibold text-ascent-1">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-1 p-2">
            {conversations?.length === 0 && (
              <p className="text-center text-ascent-2 text-sm mt-6">
                No conversations yet
              </p>
            )}
            {conversations?.map((conv) => {
              const receiver = getReceiver(conv);
              const online = isOnline(receiver?._id);
              return (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition w-full
                    ${currentConversation?._id === conv._id
                      ? "bg-blue/20 border border-blue/30"
                      : "hover:bg-white/10"
                    }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={receiver?.profileUrl ?? NoProfile}
                      alt={receiver?.firstName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                    />
                    {online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ascent-1 truncate">
                      {receiver?.firstName} {receiver?.lastName}
                    </p>
                    <p className="text-xs text-ascent-2 truncate">
                      {receiver?.profession ?? "No Profession"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Chat window */}
        <div className="flex-1 h-full glass rounded-2xl flex flex-col overflow-hidden">
          {!currentConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-ascent-2 text-sm">
                Select a conversation to start messaging
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              {(() => {
                const receiver = getReceiver(currentConversation);
                const online = isOnline(receiver?._id);
                return (
                  <div className="px-5 py-3 border-b border-white/20 flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={receiver?.profileUrl ?? NoProfile}
                        alt={receiver?.firstName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white/20"
                      />
                      {online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white/30" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ascent-1">
                        {receiver?.firstName} {receiver?.lastName}
                      </p>
                      <p className="text-xs text-ascent-2">
                        {online ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {messages?.map((msg, i) => {
                  const isMine = msg?.sender?._id === user._id ||
                    msg?.sender === user._id;
                  return (
                    <div
                      key={i}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[65%] px-4 py-2 rounded-2xl text-sm
                          ${isMine
                            ? "bg-blue text-white rounded-br-sm"
                            : "bg-white/20 text-ascent-1 rounded-bl-sm"
                          }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-ascent-2"}`}>
                          {moment(msg.createdAt).format("h:mm A")}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/20 px-4 py-2 rounded-2xl rounded-bl-sm">
                      <div className="dots-container">
                        <div className="dot" />
                        <div className="dot" />
                        <div className="dot" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-white/20 flex gap-2 items-center">
                <input
                  type="text"
                  value={text}
                  onChange={handleTyping}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-ascent-1 placeholder:text-ascent-2 outline-none focus:border-blue transition"
                />
                <button
                  onClick={handleSend}
                  disabled={!text.trim()}
                  className="bg-blue text-white px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;