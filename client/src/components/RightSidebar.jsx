import React, { useContext, useMemo } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // 📸 Collect media from chat messages
  const mediaFiles = useMemo(() => {
    if (!messages) return [];
    return messages.filter((m) => (m.file && m.fileType === "image") || m.image);
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center h-full p-8 text-center text-white/20 border-l border-white/5">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center mb-4">
          <span className="text-2xl">👤</span>
        </div>
        <p className="text-xs uppercase tracking-widest font-medium">Select a contact</p>
        <p className="text-[10px] mt-1">to view their profile details</p>
      </div>
    );
  }

  return (
    <div className="relative text-white px-4 pt-6 border-l border-white/10 bg-white/5 backdrop-blur-md h-full">
      
      {/* USER PROFILE */}
      <div className="flex flex-col items-center">
        {/* ✅ Clickable profile picture (FIXED) */}
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          onClick={() => navigate(`/profile/${selectedUser._id}`)}
          title="View Profile"
          className="
            w-24 h-24 rounded-full mb-3 
            border-2 border-white/20 
            cursor-pointer hover:opacity-90 transition
          "
        />

        {/* Separator */}
        <div className="w-full h-[1px] bg-white/20 my-3" />

        <h2 className="text-lg font-semibold">{selectedUser.fullName}</h2>
        <p className="text-sm text-gray-300 mt-1 text-center">
          {selectedUser.bio || "Available"}
        </p>
      </div>

      {/* Separator */}
      <div className="w-full h-[1px] bg-white/20 my-5" />

      {/* MEDIA SECTION */}
      <h3 className="mb-3 text-white/80 text-sm">Media</h3>

      {mediaFiles.length === 0 ? (
        <p className="text-xs text-gray-400">No media shared</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-[260px] overflow-y-auto pr-1">
          {mediaFiles.map((msg, i) => (
            <a
              key={i}
              href={msg.file || msg.image}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={msg.file || msg.image}
                alt="media"
                className="
                  w-full h-20 object-cover rounded-lg 
                  border border-white/20 
                  hover:opacity-90 transition
                "
              />
            </a>
          ))}
        </div>
      )}

      {/* LOGOUT BUTTON */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <button
          onClick={logout}
          className="
            px-6 py-2 rounded-full 
            bg-gradient-to-r from-purple-600 to-indigo-500 
            text-white font-medium 
            shadow-lg hover:opacity-90 transition-all
          "
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;

