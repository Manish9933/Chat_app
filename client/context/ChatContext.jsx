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
  const [typingUsers, setTypingUsers] = useState({}); // { userId: boolean }

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
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      const messageData = {
        text: msgBody.text || "",
        file: msgBody.file || null,
        fileType: msgBody.fileType || "text",
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
 
  // ---------------- DELETE MESSAGE ----------------
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

  // ---------------- SOCKET RECEIVE ----------------
  useEffect(() => {
    if (!socket || !authUser) return;

    const receiveMessage = (msg) => {
      const senderId = msg.senderId?._id || msg.senderId || msg.senderId;

      // If we're chatting with this user, add message to chat
      if (selectedUser && senderId === selectedUser._id) {
        setMessages((prev) => [...prev, msg]);
        
        // Mark as seen
        socket.emit("markAsSeen", { senderId: authUser._id, receiverId: senderId });
      } else {
        // Otherwise, add to unseen count
        setUnseenMessages((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    };

    // Listen for new messages
    socket.on("receiveMessage", receiveMessage);
    socket.on("newMessage", receiveMessage);

    // Listen for profile updates
    socket.on("profileUpdated", (updatedUser) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );
      if (selectedUser?._id === updatedUser._id) {
        setSelectedUser(updatedUser);
      }
    });

    // Listen for messages seen
    socket.on("messagesSeen", ({ by }) => {
      if (selectedUser?._id === by) {
        setMessages((prev) =>
          prev.map((m) => (m.receiverId === by ? { ...m, seen: true } : m))
        );
      }
    });

    // Listen for typing events
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
    };
  }, [socket, selectedUser, authUser]);

  // Mark messages as seen when selecting a user
  useEffect(() => {
    if (selectedUser && socket) {
      // Clear unseen count for this user
      setUnseenMessages(prev => ({
        ...prev,
        [selectedUser._id]: 0
      }));
      
      // Emit to server that messages are seen
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

