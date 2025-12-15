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
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      // Create message object with proper structure
      const messageData = {
        text: msgBody.text || "",
        ...(msgBody.image && { image: msgBody.image }),
        createdAt: new Date().toISOString(),
      };

      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);

      if (data.success) {
        // Add the new message to local state
        const newMessage = {
          ...data.newMessage,
          senderId: authUser._id,
          createdAt: new Date().toISOString(),
        };
        
        setMessages((prev) => [...prev, newMessage]);
        
        // Emit socket event for real-time update
        if (socket) {
          socket.emit("sendMessage", {
            receiverId: selectedUser._id,
            message: newMessage
          });
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to send message");
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
    
    // Also listen for the newMessage event (for backward compatibility)
    socket.on("newMessage", receiveMessage);

    return () => {
      socket.off("receiveMessage", receiveMessage);
      socket.off("newMessage", receiveMessage);
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
        setSelectedUser,
        setUnseenMessages,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

