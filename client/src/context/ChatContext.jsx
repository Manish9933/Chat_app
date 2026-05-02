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
  const [typingUsers, setTypingUsers] = useState({});

  // Fetch contacts list with unseen counts
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

  // Fetch chat messages (clears old messages first to prevent flash)
  const getMessages = async (id) => {
    try {
      setMessages([]);
      const { data } = await axios.get(`/api/messages/${id}`);
      if (data.success) setMessages(data.messages);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Send message with optimistic update
  const sendMessage = async (msgBody) => {
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      const tempId = "temp-" + Date.now();
      const optimisticMsg = {
        _id: tempId,
        senderId: authUser._id,
        receiverId: selectedUser._id,
        text: msgBody.text || "",
        file: msgBody.file || null,
        fileType: msgBody.fileType || "text",
        replyTo: msgBody.replyTo ? { _id: msgBody.replyTo, text: "Replying..." } : null,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      const messageData = {
        text: msgBody.text || "",
        file: msgBody.file || null,
        fileType: msgBody.fileType || "text",
        replyTo: msgBody.replyTo || null,
      };

      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);

      if (data.success) {
        const newMessage = {
          ...data.newMessage,
          senderId: authUser._id,
        };
        
        setMessages((prev) => 
          prev.map(m => m._id === tempId ? newMessage : m)
        );
        
        if (socket) {
          socket.emit("sendMessage", {
            receiverId: selectedUser._id,
            message: newMessage
          });
        }
      } else {
        setMessages((prev) => prev.filter(m => m._id !== tempId));
        toast.error(data.message || "Failed to send message");
      }
    } catch (err) {
      setMessages((prev) => prev.filter(m => !m._id.toString().startsWith("temp-")));
      console.error("SendMessage Error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to send message");
    }
  };
 
  // Delete message
  const deleteMessage = async (msgId) => {
    try {
      const { data } = await axios.delete(`/api/messages/${msgId}`);
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== msgId));
        toast.success("Message deleted");
      } else {
        toast.error(data.message || "Failed to delete message");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete message");
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket || !authUser) return;

    const receiveMessage = (msg) => {
      const senderId = msg.senderId?._id || msg.senderId;

      if (selectedUser && senderId === selectedUser._id) {
        setMessages((prev) => [...prev, msg]);
        socket.emit("markAsSeen", { senderId, receiverId: authUser._id });
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    };

    socket.on("receiveMessage", receiveMessage);
    socket.on("newMessage", receiveMessage);

    socket.on("profileUpdated", (updatedUser) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );
      if (selectedUser?._id === updatedUser._id) {
        setSelectedUser(updatedUser);
      }
    });

    socket.on("messagesSeen", ({ by }) => {
      if (selectedUser?._id === by) {
        setMessages((prev) =>
          prev.map((m) => (m.receiverId === by ? { ...m, seen: true } : m))
        );
      }
    });

    socket.on("userTyping", ({ userId }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: true }));
    });

    socket.on("userStopTyping", ({ userId }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: false }));
    });

    return () => {
      socket.off("receiveMessage", receiveMessage);
      socket.off("newMessage", receiveMessage);
      socket.off("profileUpdated");
      socket.off("messagesSeen");
      socket.off("userTyping");
      socket.off("userStopTyping");
    };
  }, [socket, selectedUser, authUser]);

  // Mark messages as seen when selecting a user
  useEffect(() => {
    if (selectedUser && socket) {
      setUnseenMessages(prev => ({
        ...prev,
        [selectedUser._id]: 0
      }));
      
      socket.emit("markAsSeen", { 
        senderId: selectedUser._id, 
        receiverId: authUser._id 
      });
    }
  }, [selectedUser, socket, authUser]);

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
        deleteMessage,
        setSelectedUser,
        setUnseenMessages,
        setMessages,
        typingUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
