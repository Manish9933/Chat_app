import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Check authentication on load
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Login or Signup
  const login = async (state, body) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, body);

      if (!data.success) return toast.error(data.message);

      toast.success(data.message);

      localStorage.setItem("token", data.token);
      axios.defaults.headers.common["token"] = data.token;

      setToken(data.token);
      setAuthUser(data.userData);
      connectSocket(data.userData);

    } catch (err) {
      toast.error(err.message);
    }
  };

  // Update Profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        socket?.emit("profileUpdate", data.user);
        toast.success("Profile updated!");
      }
    } catch (err) {
      toast.error(err.message);
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
      axios.defaults.headers.common["token"] = token;
      checkAuth();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        axios,
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
