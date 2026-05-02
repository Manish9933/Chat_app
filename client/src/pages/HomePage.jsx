import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="w-full h-full flex overflow-hidden bg-[#0b0a1a]/40 backdrop-blur-3xl">

      {/* ── DESKTOP VIEW (md+): Sidebar + Chat + RightSidebar side by side ── */}
      <div className="hidden md:flex w-full h-full">
        <Sidebar />
        <div className="flex-1 min-w-0 min-h-0 h-full border-l border-white/5">
          <ChatContainer />
        </div>
        {selectedUser && (
          <div className="hidden xl:flex w-[350px] shrink-0 border-l border-white/5 bg-white/[0.02] h-full">
            <RightSidebar />
          </div>
        )}
      </div>

      {/* ── MOBILE VIEW (<md): Show Sidebar OR Chat, never both ── */}
      <div className="flex md:hidden w-full h-full overflow-hidden">
        {!selectedUser ? (
          <div className="w-full h-full">
            <Sidebar />
          </div>
        ) : (
          <div className="w-full h-full animate-slide-in overflow-hidden">
            <ChatContainer />
          </div>
        )}
      </div>

    </div>
  );
};

export default HomePage;
