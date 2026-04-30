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
        {/* DESKTOP VIEW: Sidebar + ChatContainer */}
        <div className="hidden md:flex w-full h-full">
           <Sidebar />
           <div className="flex-1 min-w-0 border-l border-white/5">
             <ChatContainer />
           </div>
           {selectedUser && (
             <div className="hidden xl:block w-[300px] border-l border-white/5 bg-black/10">
               <RightSidebar />
             </div>
           )}
        </div>

        {/* MOBILE VIEW: Either Sidebar OR ChatContainer */}
        <div className="flex md:hidden w-full h-full relative">
           {!selectedUser ? (
             <Sidebar />
           ) : (
             <div className="fixed inset-0 z-[100] animate-slide-in bg-transparent">
               <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl"></div>
               <div className="relative h-full w-full">
                 <ChatContainer />
               </div>
             </div>
           )}
        </div>
        
        <CallUI />
      </div>
    </div>
  );
};

export default HomePage;

