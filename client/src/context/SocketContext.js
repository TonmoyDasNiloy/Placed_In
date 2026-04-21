import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { SetOnlineUsers, AddMessage } from "../redux/messageSlice";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { currentConversation } = useSelector((state) => state.message);

  useEffect(() => {
    if (!user?.token) return;

    socket.current = io("http://localhost:8800");

    // Register this user as online
    socket.current.emit("addUser", user._id);

    // Listen for online users list
    socket.current.on("getOnlineUsers", (users) => {
      dispatch(SetOnlineUsers(users));
    });

    // Listen for incoming messages
    socket.current.on("getMessage", ({ senderId, message }) => {
      dispatch(AddMessage({
        sender: { _id: senderId },
        text: message.text,
        createdAt: message.createdAt || new Date().toISOString(),
        conversationId: message.conversationId,
      }));
    });

    return () => {
      socket.current.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};