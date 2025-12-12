import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { onlineUsers } = useContext(AuthContext);

  const [media, setMedia] = useState([]);

  useEffect(() => {
    setMedia(messages.filter((m) => m.image).map((m) => m.image));
  }, [messages]);

  if (!selectedUser) return null;

  return (
    <div className="bg-[#8185B2]/10 text-white p-5 rounded-l-xl overflow-y-scroll max-md:hidden">
      <div className="text-center mt-8">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          className="w-20 h-20 rounded-full mx-auto"
        />

        <h2 className="text-xl mt-2 flex justify-center items-center gap-2">
          {selectedUser.fullName}

          {onlineUsers.includes(selectedUser._id) ? (
            <span className="w-2 h-2 rounded-full bg-green-500" />
          ) : (
            <span className="text-xs text-gray-400">Last seen recently</span>
          )}
        </h2>

        <p className="opacity-70 mt-1">{selectedUser.bio || "No bio provided"}</p>
      </div>

      <hr className="border-gray-600 my-4" />

      <p className="font-medium">Media</p>
      <div className="grid grid-cols-2 gap-3 mt-3 max-h-[220px] overflow-y-scroll">
        {media.map((m, i) => (
          <img
            key={i}
            src={m}
            className="rounded cursor-pointer"
            onClick={() => window.open(m)}
          />
        ))}
      </div>
    </div>
  );
};

export default RightSidebar;
