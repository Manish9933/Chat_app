import React, { useContext, useState, useEffect, useRef } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const Sidebar = () => {
  const {
    users,
    getUsers,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);

  const { onlineUsers, logout } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navigate = useNavigate();

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.fullName.toLowerCase().includes(search.toLowerCase());
    const isOnline = onlineUsers.includes(u._id);
    return showOnlineOnly ? matchesSearch && isOnline : matchesSearch;
  });

  useEffect(() => {
    getUsers();
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    window.addEventListener("click", handleOutside);
    return () => window.removeEventListener("click", handleOutside);
  }, [onlineUsers]);

  return (
    <div
      className={`h-full flex flex-col text-white border-r border-white/10 transition-all duration-300
        ${selectedUser ? "max-md:hidden" : "w-full"}
        md:w-[320px] lg:w-[380px] shrink-0 bg-white/[0.02] relative z-40`}
    >
      {/* Header */}
      <div className="p-5 md:p-6 pb-2">
        <div className="flex justify-between items-center px-1">
          <img src={assets.logo} alt="logo" className="max-w-[140px] md:max-w-40 drop-shadow-2xl" />

          {/* 💎 ELITE SIDEBAR MENU */}
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-500 
                ${menuOpen ? "bg-violet-500/30 rotate-90 border-violet-400/40" : "bg-white/5 hover:bg-white/10 border-white/10"} 
                border backdrop-blur-xl shadow-2xl active:scale-90`}
            >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>

            {menuOpen && (
              <div className="absolute top-full right-0 mt-3 z-[100] w-64 p-3 rounded-[2.5rem] bg-[#1a1625]/95 backdrop-blur-[60px] border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.8)] animate-pop overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 pointer-events-none"></div>
                
                <button
                  onClick={() => { setMenuOpen(false); navigate("/profile"); }}
                  className="relative w-full flex items-center gap-4 px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 rounded-[1.8rem] transition-all group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-violet-500/20 flex items-center justify-center border border-violet-400/30 group-hover:scale-110 group-hover:rotate-3 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  My Profile
                </button>

                <button
                  onClick={() => { setMenuOpen(false); navigate("/settings"); }}
                  className="relative w-full flex items-center gap-4 px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 rounded-[1.8rem] transition-all group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30 group-hover:scale-110 group-hover:-rotate-3 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  </div>
                  System Settings
                </button>

                <div className="h-[1px] bg-white/10 my-2 mx-4" />

                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="relative w-full flex items-center gap-4 px-5 py-4 text-xs font-black uppercase tracking-widest text-red-400/80 hover:text-red-300 hover:bg-red-500/10 rounded-[1.8rem] transition-all group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-400/20 group-hover:scale-110 group-hover:-rotate-3 transition-all">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  </div>
                  Logout Session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 py-3 px-4 mt-5 focus-within:bg-white/10 focus-within:border-white/20 transition-all shadow-xl">
          <img src={assets.search_icon} alt="search" className="w-4 opacity-40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-sm placeholder:text-white/30 flex-1 font-medium"
            placeholder="Search contacts..."
          />
          {search && <button onClick={() => setSearch("")} className="text-white/40 hover:text-white transition-colors">✕</button>}
        </div>

        {/* Separator Line */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4" />

        {/* Special Functionality: Online Filter */}
        <div className="flex items-center justify-between px-1 mt-6 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Live Contacts</span>
            <span className="text-[9px] bg-violet-500/20 border border-violet-500/20 px-2 py-0.5 rounded-full text-violet-300 font-bold">{filteredUsers.length}</span>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer group">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/50 transition-colors">Online Only</span>
            <div className="relative">
              <input type="checkbox" className="sr-only peer" checked={showOnlineOnly} onChange={(e) => setShowOnlineOnly(e.target.checked)} />
              <div className="w-8 h-4.5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-white/40 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500/50 peer-checked:after:bg-white"></div>
            </div>
          </label>
        </div>
      </div>

      {/* Users */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 flex flex-col gap-1.5 mt-2 custom-scrollbar">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => { setSelectedUser(user); setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 })); }}
            className={`group relative flex items-center gap-2.5 md:gap-3 p-3.5 rounded-[1.8rem] cursor-pointer transition-all duration-500 
              ${selectedUser?._id === user._id 
                ? "bg-violet-600/10 border border-violet-500/20 shadow-[0_15px_40px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/20" 
                : "hover:bg-white/5 border border-transparent hover:border-white/10"}`}
          >
            {selectedUser?._id === user._id && (
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-violet-500 rounded-r-full shadow-[0_0_15px_rgba(139,92,246,0.8)]"></div>
            )}

            <div className="relative shrink-0">
              <div className={`absolute -inset-1 rounded-full bg-violet-500/20 blur-md transition-opacity duration-500 ${selectedUser?._id === user._id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}></div>
              <img
                src={user.profilePic || assets.avatar_icon}
                alt=""
                className={`relative w-12 h-12 rounded-full object-cover border-2 transition-all duration-500
                  ${selectedUser?._id === user._id ? "border-violet-500/50 scale-105" : "border-white/10"}`}
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-[#0b0a1a] rounded-full shadow-[0_0_12px_rgba(74,222,128,0.7)] z-10"></span>
              )}
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className={`font-black text-[14px] tracking-tight transition-colors duration-300 ${selectedUser?._id === user._id ? "text-white" : "text-white/80 group-hover:text-white"}`}>
                  {user.fullName}
                </p>
                {unseenMessages[user._id] > 0 && (
                  <span className="bg-gradient-to-tr from-violet-500 to-indigo-600 text-[10px] font-black text-white px-2.5 py-1 rounded-full shadow-xl shadow-violet-900/40 animate-pop border border-white/20">
                    {unseenMessages[user._id]}
                  </span>
                )}
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 mt-1 ${onlineUsers.includes(user._id) ? "text-green-300/80" : "text-white/20"}`}>
                {onlineUsers.includes(user._id) ? "Live Now" : "Offline"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
