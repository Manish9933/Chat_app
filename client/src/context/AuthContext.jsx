import { createContext, useState, useEffect } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Check authentication on load
  const checkAuth = async () => {
    try {
      const { data } = await api.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (err) {
      // User not authenticated or session expired
    }
  };

  // Login or Signup
  const login = async (state, body) => {
    try {
      const { data } = await api.post(`/api/auth/${state}`, body);

      if (!data.success) return toast.error(data.message);

      toast.success(data.message);

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setAuthUser(data.userData);
      connectSocket(data.userData);

    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Update Profile
  const updateProfile = async (body) => {
    try {
      const { data } = await api.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        socket?.emit("profileUpdate", data.user);
        return { success: true };
      } else {
        toast.error(data.message || "Update failed");
        return { success: false, message: data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Network error";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);

    socket?.disconnect();
    toast.success("Logged out");
  };

  // Socket Connection
  const connectSocket = (user) => {
    if (!user) return;
    if (socket?.connected) return;

    socket?.disconnect();

    const newSocket = io(backendUrl, {
      query: { userId: user._id },
      transports: ["websocket"],
    });

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);
  };

  // Initialize on mount
  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        socket,
        onlineUsers,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
