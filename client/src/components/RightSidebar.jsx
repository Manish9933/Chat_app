import React, { useContext, useMemo } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const RightSidebar = ({ isOpen, onClose, isMobile }) => {
  const { selectedUser, messages } = useContext(ChatContext);
  const navigate = useNavigate();

  // 📸 Intelligent Media Collection
  const mediaFiles = useMemo(() => {
    if (!messages) return [];
    return messages.filter((m) => (m.file && m.fileType === "image") || m.image);
  }, [messages]);

  // 📄 Intelligent Document Collection
  const docFiles = useMemo(() => {
    if (!messages) return [];
    return messages.filter((m) => m.fileType === "document");
  }, [messages]);

  if (!selectedUser && !isMobile) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full p-8 text-center bg-[#030014]/20 border-l border-white/5 animate-fade-in">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full scale-150"></div>
          <div className="relative w-20 h-20 rounded-[2rem] border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-3xl shadow-2xl">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30">Intelligence Hub</p>
      </div>
    );
  }

  const containerClasses = isMobile 
    ? `fixed inset-0 z-[200] bg-[#1a1625]/95 backdrop-blur-[100px] flex flex-col transition-all duration-500 ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}`
    : "hidden lg:flex flex-col w-[320px] xl:w-[380px] h-full bg-[#1a1625]/60 backdrop-blur-[80px] border-l border-white/10 animate-slide-left overflow-y-auto custom-scrollbar relative z-30";

  const { onlineUsers } = useContext(AuthContext);
  const isOnline = onlineUsers.includes(selectedUser?._id);

  return (
    <div className={containerClasses}>
      
      {/* 🔝 MOBILE HEADER */}
      {isMobile && (
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Intelligence Hub</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-white text-xl">✕</button>
        </div>
      )}

      {/* 💎 USER PROFILE HEADER */}
      <div className="p-8 pb-6 flex flex-col items-center text-center">
        <div className="relative mb-6 group cursor-pointer" onClick={() => navigate(`/profile/${selectedUser?._id}`)}>
          <div className="absolute -inset-2 bg-gradient-to-tr from-violet-500 to-indigo-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            className={`relative w-28 h-28 rounded-full object-cover border-4 ${isOnline ? "border-green-500/50" : "border-white/20"} shadow-2xl transition-transform duration-500 group-hover:scale-105`}
            alt="Profile"
          />
          {isOnline && (
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-400 border-4 border-[#1a1625] rounded-full shadow-[0_0_15px_rgba(74,222,128,0.5)] z-10"></div>
          )}
        </div>
        
        <h2 className="text-xl font-black text-white tracking-tight leading-none mb-1">{selectedUser?.fullName}</h2>
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isOnline ? "text-green-400" : "text-white/20"}`}>
          {isOnline ? "Live Now" : "Currently Offline"}
        </p>
        <p className="text-xs font-medium text-slate-300 leading-relaxed max-w-[240px]">
          {selectedUser?.bio || "Crafting professional connections through seamless communication."}
        </p>
      </div>

      <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-8" />

      {/* 📸 SHARED MEDIA GALLERY */}
      <div className="p-8 pt-6">
        <div className="flex justify-between items-center mb-5 px-1">
          <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/50">Shared Gallery</h3>
          <span className="text-[9px] font-black bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white/40">{mediaFiles.length}</span>
        </div>

        {mediaFiles.length === 0 ? (
          <div className="p-10 rounded-[2rem] bg-white/5 border border-dashed border-white/10 flex flex-col items-center gap-3">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/10"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
             <p className="text-[10px] font-black uppercase tracking-widest text-white/10">No Shared Media</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {mediaFiles.slice(0, 9).map((msg, i) => (
              <a key={i} href={msg.file || msg.image} target="_blank" rel="noreferrer" className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 hover:border-white/30 transition-all shadow-xl">
                <img src={msg.file || msg.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125 group-hover:rotate-3" alt="media" />
                <div className="absolute inset-0 bg-violet-600/0 group-hover:bg-violet-600/20 transition-colors"></div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* 📄 SHARED DOCUMENTS */}
      <div className="p-8 pt-0 pb-10">
        <div className="flex justify-between items-center mb-5 px-1">
          <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/50">Documents</h3>
          <span className="text-[9px] font-black bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white/40">{docFiles.length}</span>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] custom-scrollbar">
          {docFiles.map((msg, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/20 transition-all group-hover:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black text-slate-200 truncate group-hover:text-white transition-colors">{msg.fileName || "Unnamed Document"}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mt-1">Shared Asset</p>
              </div>
            </div>
          ))}
          {docFiles.length === 0 && <p className="text-[10px] font-bold text-white/10 text-center py-4 uppercase tracking-[0.2em]">No Documents Shared</p>}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
