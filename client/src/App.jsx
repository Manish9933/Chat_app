import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfile from './pages/UserProfile.jsx';

import { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext.jsx";

import CallUI from "./components/call/CallUI";
import CallPopup from "./components/call/CallPopup";

import SettingsPage from "./pages/SettingsPage";

const App = () => {
  const { authUser } = useContext(AuthContext);

  return (
    <div className="fixed inset-0 bg-mesh overflow-hidden">
      {/* ── Decorative layer (pointer-events-none, never affects layout) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="noise" />
        <div className="absolute top-0 -left-4 w-48 h-48 sm:w-72 sm:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-48 h-48 sm:w-72 sm:h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-48 h-48 sm:w-72 sm:h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        <div className="absolute -bottom-8 right-20 w-48 h-48 sm:w-72 sm:h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      </div>

      {/*
        ── Overlay portals (Toaster, CallPopup, CallUI) ──
        Placed in an absolute layer so they are COMPLETELY OUTSIDE
        the flex column. They will never steal height from the routes.
        pointer-events-none on container, re-enabled on children as needed.
      */}
      <div className="absolute inset-0 z-[9999] pointer-events-none">
        <div className="pointer-events-auto">
          <Toaster />
        </div>
        <CallPopup />
        <CallUI />
      </div>

      {/*
        ── Main content layer ──
        This is the ONLY flex child. It gets 100% of the fixed container.
        No siblings means no height theft → no layout jumping on refresh.
      */}
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden">
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
