import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfile from './pages/UserProfile.jsx'; 


import { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext.jsx";

import CallUI from "./components/call/CallUI"; 
import CallPopup from "./components/call/CallPopup"// ✅ FIXED IMPORT

import SettingsPage from "./pages/SettingsPage";

const App = () => {
  const { authUser } = useContext(AuthContext);

  return (
    <div className="relative min-h-screen w-full bg-mesh overflow-hidden flex flex-col">
      {/* Noise Overlay */}
      <div className="noise" />

      {/* Animated Glowing Blobs - Optimized for all screens */}
      <div className="absolute top-0 -left-4 w-48 h-48 sm:w-72 sm:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-48 h-48 sm:w-72 sm:h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-48 h-48 sm:w-72 sm:h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      <div className="absolute -bottom-8 right-20 w-48 h-48 sm:w-72 sm:h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />

      <div className="relative z-10 min-h-screen w-full flex flex-col">
        <Toaster />
        
        <CallPopup />
        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />

          <Route
            path="/profile"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />

          <Route
            path="/settings"
            element={authUser ? <SettingsPage /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
