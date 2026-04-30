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
    <div className="w-full h-[100dvh] sm:px-[2%] sm:py-[1%] lg:px-[5%] lg:py-[3%] xl:px-[10%] xl:py-[5%] flex flex-col">
      <div
        className={`w-full backdrop-blur-2xl bg-white/5 border-white/10 sm:border sm:rounded-[2.5rem] overflow-hidden flex-1 grid relative shadow-2xl shadow-black/50
        ${
          selectedUser
            ? "grid-cols-1 md:grid-cols-[350px_1fr] xl:grid-cols-[350px_1fr_300px]"
            : "grid-cols-1 md:grid-cols-[350px_1fr]"
        }`}
      >
        <Sidebar />
        
        {/* MOBILE VIEW: Only show ChatContainer if a user is selected */}
        {selectedUser && (
          <div className="flex w-full h-full md:hidden absolute inset-0 z-50 animate-slide-in">
            <ChatContainer />
          </div>
        )}

        {/* DESKTOP VIEW: Always show ChatContainer (shows Welcome screen if no user selected) */}
        <div className="hidden md:flex h-full w-full">
          <ChatContainer />
        </div>

        {selectedUser && (
          <div className="hidden xl:block h-full border-l border-white/5">
            <RightSidebar />
          </div>
        )}
        
        <CallUI />
      </div>
    </div>
  );
};

export default HomePage;

