import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

import { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext.jsx";

import CallUI from "./components/call/CallUI"; 
import CallPopup from "./components/call/CallPopup"// ✅ FIXED IMPORT

const App = () => {
  const { authUser } = useContext(AuthContext);

  return (
    <div className="bg-[url('./src/assets/bgImage.svg')] bg-cover min-h-screen">
      <Toaster />
      <video/>
      {/* <CallUI />  */}
      <CallPopup />

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />

        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
};

export default App;
