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
    <div className="w-full h-[100dvh] md:h-screen flex items-center justify-center p-0 md:p-4 lg:p-6 xl:p-8 bg-black/5">
      <div
        className={`w-full h-full max-w-[1600px] mx-auto relative overflow-hidden flex 
        bg-[#0b0a1a]/40 backdrop-blur-3xl
        md:rounded-[2rem] md:border md:border-white/10 md:shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}
      >
        {/* DESKTOP VIEW: Sidebar + ChatContainer */}
        <div className="hidden md:flex w-full h-full">
           <Sidebar />
           <div className="flex-1 min-w-0 border-l border-white/5">
             <ChatContainer />
           </div>
           {selectedUser && (
             <div className="hidden xl:block w-[350px] border-l border-white/5 bg-white/[0.02]">
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

