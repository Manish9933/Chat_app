import React, { useContext } from "react";
import assets from "../../assets/assets";
import { ChatContext } from "../../../context/ChatContext";
import { AuthContext } from "../../../context/AuthContext";
import { CallContext } from "../../../context/CallContext";

const LuxuryIcons = {
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  )
};

const ChatHeader = ({ isSearching, setIsSearching, searchTerm, setSearchTerm, setShowMobileSidebar }) => {
  const { selectedUser, setSelectedUser, typingUsers } = useContext(ChatContext);
  const { onlineUsers } = useContext(AuthContext);
  const { startAudioCall, startVideoCall } = useContext(CallContext);

  return (
    <div className="flex items-center gap-2 md:gap-3 py-3 px-3 md:py-4 md:px-6 border-b border-white/10 bg-[#120f26]/80 backdrop-blur-3xl z-40 relative w-full overflow-hidden shrink-0">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-400/40 to-transparent"></div>
      
      <button onClick={() => setSelectedUser(null)} className="flex items-center justify-center w-10 h-10 bg-violet-500/20 hover:bg-violet-500/40 border border-violet-400/30 rounded-full md:hidden active:scale-90 shadow-lg">
        <img src={assets.arrow_icon} className="w-5 brightness-200" alt="back" />
      </button>

      {isSearching ? (
        <div className="flex-1 flex items-center gap-4 animate-slide-right">
          <input 
            autoFocus 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Search messages..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-full py-2.5 px-5 text-sm text-white outline-none focus:border-violet-400/30 transition-all font-bold" 
          />
          <button onClick={() => { setIsSearching(false); setSearchTerm(""); }} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Cancel</button>
        </div>
      ) : (
        <>
          {/* 💎 CLICKABLE USER INFO (WHATSAPP STYLE) */}
          <div 
            onClick={() => setShowMobileSidebar(true)} 
            className="flex-1 min-w-0 flex items-center gap-3 cursor-pointer group active:scale-95 transition-all"
          >
            <div className="relative shrink-0">
              <div className="absolute -inset-1 bg-violet-400/30 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img src={selectedUser?.profilePic || assets.avatar_icon} className="relative w-11 h-11 rounded-full object-cover border-2 border-white/30 shadow-2xl" alt="" />
              {onlineUsers?.includes(selectedUser?._id) && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-[#0b0a1a] rounded-full z-10 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>}
            </div>
            
            <div className="flex flex-col justify-center overflow-hidden">
              <p className="text-lg text-white font-black truncate tracking-tight drop-shadow-md group-hover:text-violet-300 transition-colors">{selectedUser?.fullName || "Chat"}</p>
              <div className="flex items-center gap-2">
                {typingUsers?.[selectedUser?._id] ? (
                  <span className="text-violet-300 text-[10px] animate-pulse font-black uppercase tracking-widest">typing...</span>
                ) : (
                  <span className={onlineUsers?.includes(selectedUser?._id) ? "text-green-300 uppercase tracking-widest text-[10px] font-black" : "text-slate-400 uppercase tracking-widest text-[10px] font-black"}>
                    {onlineUsers?.includes(selectedUser?._id) ? "Online Now" : "Offline"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
            <button onClick={() => setIsSearching(true)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 bg-white/5 border border-white/10 rounded-full shadow-2xl group transition-all">
              <LuxuryIcons.Search />
            </button>
            <button onClick={() => startAudioCall(selectedUser)} className="w-10 h-10 flex items-center justify-center hover:bg-violet-500/30 bg-white/10 border border-white/20 rounded-full shadow-2xl group transition-all">
              <img src={assets.call_icon} className="w-5 brightness-200 group-hover:scale-110" alt="call" />
            </button>
            <button onClick={() => startVideoCall(selectedUser)} className="w-10 h-10 flex items-center justify-center hover:bg-violet-500/30 bg-white/10 border border-white/20 rounded-full shadow-2xl group transition-all">
              <img src={assets.video_icon} className="w-6 brightness-200 group-hover:scale-110" alt="video" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatHeader;
