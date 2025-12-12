import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { socket, axios, authUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  // ---------------- SIDE USERS LIST ----------------
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ---------------- GET CHAT MESSAGES ----------------
  const getMessages = async (id) => {
    try {
      const { data } = await axios.get(`/api/messages/${id}`);
      if (data.success) setMessages(data.messages);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = async (msgBody) => {
    try {
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, msgBody);

      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ---------------- SOCKET RECEIVE ----------------
  useEffect(() => {
    if (!socket || !authUser) return;

    const receive = (msg) => {
      const senderId = msg.senderId._id || msg.senderId;

      if (selectedUser && senderId === selectedUser._id) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", receive);
    return () => socket.off("newMessage", receive);
  }, [socket, selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        users,
        messages,
        selectedUser,
        unseenMessages,

        getUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        setUnseenMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
