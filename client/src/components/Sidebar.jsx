import React, { useContext, useState, useEffect } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  const filtered = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 text-white overflow-y-scroll rounded-r-xl 
      ${selectedUser ? "max-md:hidden" : ""}`}
    >
      {/* -------- HEADER -------- */}
      <div className="flex justify-between items-center pb-5">
        <img src={assets.logo} className="max-w-40" />

        <div className="relative group cursor-pointer">
          <img src={assets.menu_icon} className="w-6" />

          <div className="absolute right-0 top-8 hidden group-hover:block bg-[#282142] border border-gray-600 rounded-md p-5 w-32 z-20">
            <p className="cursor-pointer text-sm" onClick={() => navigate("/profile")}>
              Edit Profile
            </p>
            <hr className="border-gray-500 my-2" />
            <p className="cursor-pointer text-sm" onClick={logout}>
              Logout
            </p>
          </div>
        </div>
      </div>

      {/* -------- SEARCH -------- */}
      <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mb-4">
        <img src={assets.search_icon} className="w-4" />
        <input
          placeholder="Search user..."
          className="bg-transparent outline-none w-full text-sm"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* -------- USERS LIST -------- */}
      <div className="flex flex-col gap-2">
        {filtered.map((u) => (
          <div
            key={u._id}
            className={`flex items-center gap-3 p-2 rounded cursor-pointer 
          ${
            selectedUser?._id === u._id
              ? "bg-[#282142]/50"
              : "hover:bg-[#282142]/40"
          }`}
            onClick={() => {
              setSelectedUser(u);
              setUnseenMessages((prev) => ({ ...prev, [u._id]: 0 }));
            }}
          >
            <img
              src={u.profilePic || assets.avatar_icon}
              className="w-10 h-10 rounded-full"
            />

            <div className="flex-1">
              <p className="font-medium">{u.fullName}</p>

              {onlineUsers.includes(u._id) ? (
                <p className="text-green-400 text-xs">Online</p>
              ) : (
                <p className="text-gray-400 text-xs">Last seen recently</p>
              )}
            </div>

            {unseenMessages[u._id] > 0 && (
              <span className="bg-violet-500/70 text-xs px-2 py-1 rounded-full">
                {unseenMessages[u._id]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
