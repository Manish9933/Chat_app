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
    <div className="w-full h-[100dvh] sm:px-[5%] sm:py-[2%] lg:px-[10%] lg:py-[5%]">
      <div
        className={`backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden h-full grid relative shadow-2xl shadow-black/50
        ${
          selectedUser
            ? "grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
            : "grid-cols-1 md:grid-cols-[1fr_2fr]"
        }`}
      >
        <Sidebar />
        
        {/* On mobile, ONLY show the Sidebar if no user is selected. 
            On desktop, always show the Chat area (Welcome screen). */}
        <div className={`h-full ${!selectedUser ? "hidden md:flex" : "flex"}`}>
          <ChatContainer />
        </div>

        {selectedUser && (
          <div className="max-xl:hidden">
            <RightSidebar />
          </div>
        )}
        
        <CallUI />
      </div>
    </div>
  );
};

export default HomePage;

