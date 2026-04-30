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
    // close menu on outside click
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    window.addEventListener("click", handleOutside);
    return () => window.removeEventListener("click", handleOutside);
  }, [onlineUsers]);

  return (
    <div
      className={`bg-white/5 backdrop-blur-md h-full px-5 py-4 md:px-6 md:py-6 text-white overflow-y-scroll border-r border-white/10
        ${selectedUser ? "max-md:hidden" : "w-full"}`}
    >
      {/* Header */}
      <div className="pb-5">
        <div className="flex justify-between items-center px-1">
          <img src={assets.logo} alt="logo" className="max-w-[140px] md:max-w-40" />

          {/* Menu (click to open) */}
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              aria-label="menu"
              className="p-1 rounded hover:bg-white/5"
            >
              <img src={assets.menu_icon} alt="menu" className="max-h-5" />
            </button>

            {menuOpen && (
              <div className="absolute top-full right-0 mt-2 z-50 w-48 p-2 rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/10 shadow-2xl animate-pop">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <span className="text-lg">👤</span>
                  My Profile
                </button>

                <div className="h-[1px] bg-white/5 my-1 mx-2" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <span className="text-lg">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 py-3 px-4 mt-5 focus-within:bg-white/10 focus-within:border-white/20 transition-all">
          <img src={assets.search_icon} alt="search" className="w-4 opacity-40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-sm placeholder-white/20 flex-1"
            placeholder="Search contacts..."
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="text-white/40 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Separator Line */}
        <div className="h-[1px] bg-white/10 mx-2 mt-4" />

        {/* Special Functionality: Online Filter */}
        <div className="flex items-center justify-between px-1 mt-6 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Contacts</span>
            <span className="text-[9px] bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-white/30">{filteredUsers.length}</span>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer group">
            <span className="text-[10px] text-white/30 group-hover:text-white/50 transition-colors">Online only</span>
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
              />
              <div className="w-7 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500/40 peer-checked:after:bg-white"></div>
            </div>
          </label>
        </div>
      </div>

      {/* Users */}
      <div className="flex flex-col gap-1 mt-2">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
              setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
            }}
            className={`group relative flex items-center gap-2.5 md:gap-3 p-2.5 md:p-3 rounded-2xl cursor-pointer transition-all duration-300 
              ${selectedUser?._id === user._id 
                ? "bg-white/10 border border-white/10 shadow-lg" 
                : "hover:bg-white/5 border border-transparent hover:border-white/5"}`}
          >
            <div className="relative">
              <img
                src={user.profilePic || assets.avatar_icon}
                alt=""
                className="w-11 h-11 rounded-full object-cover border border-white/10 shadow-md group-hover:scale-105 transition-transform"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#121212] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              )}
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-white truncate">{user.fullName}</p>
                {unseenMessages[user._id] > 0 && (
                  <span className="bg-violet-600 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full animate-pop">
                    {unseenMessages[user._id]}
                  </span>
                )}
              </div>
              <p className={`text-xs truncate ${onlineUsers.includes(user._id) ? "text-green-400/70" : "text-white/30"}`}>
                {onlineUsers.includes(user._id) ? "Active now" : "Offline"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
