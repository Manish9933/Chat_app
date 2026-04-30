import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";
import CallPopup from "../components/call/CallPopup";
import VideoCall from "../components/VideoCall";
import CallUI from "../components/call/CallUI";





const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="w-full h-[100dvh] sm:p-2 md:p-4 lg:p-8 xl:p-12 flex flex-col bg-black/10 sm:bg-transparent">
      <div
        className={`w-full h-full flex-1 relative overflow-hidden flex
        ${
          selectedUser
            ? "sm:bg-white/5 sm:backdrop-blur-2xl sm:border sm:border-white/10 sm:rounded-[2.5rem] sm:shadow-2xl sm:shadow-black/50"
            : "sm:bg-white/5 sm:backdrop-blur-2xl sm:border sm:border-white/10 sm:rounded-[2.5rem] sm:shadow-2xl sm:shadow-black/50"
        }`}
      >
        {/* SIDEBAR: Always rendered, but hidden on mobile when a user is selected */}
        <Sidebar />
        
        {/* Animated Glowing Blobs - Desktop Only */}
        <div className="hidden sm:block absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="hidden sm:block absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="hidden sm:block absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        <div className="hidden sm:block absolute -bottom-8 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        
        {/* MOBILE CHAT VIEW: Absolute overlay with slide-in animation */}
        {selectedUser && (
          <div className="fixed inset-0 z-[100] md:hidden animate-slide-in bg-[#030014]">
            <ChatContainer />
          </div>
        )}

        {/* DESKTOP CHAT VIEW: Grid part */}
        <div className="hidden md:flex flex-1 min-w-0 border-l border-white/5">
          <ChatContainer />
        </div>

        {/* DESKTOP RIGHT SIDEBAR */}
        {selectedUser && (
          <div className="hidden xl:block w-[300px] h-full border-l border-white/5 bg-black/10">
            <RightSidebar />
          </div>
        )}
        
        <CallUI />
      </div>
    </div>
  );
};

export default HomePage;

