import { useParams, useNavigate } from "react-router-dom";
import { useContext, useMemo } from "react";
import { ChatContext } from "../../context/ChatContext";
import assets from "../assets/assets";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { selectedUser, messages } = useContext(ChatContext);

  if (!selectedUser || selectedUser._id !== userId) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        User not found
      </div>
    );
  }

  // 📸 Collect media
  const mediaFiles = useMemo(() => {
    return messages?.filter((m) => m.image) || [];
  }, [messages]);

  return (
    /* 🌌 PAGE BACKGROUND */
    <div className="min-h-screen flex items-center justify-center bg-black/40 text-white">
        

      {/* 🧊 GLASS CARD (same feel as chat UI) */}
      <div
        className="
          w-[95%] md:w-[85%] lg:w-[75%]
          h-[90vh]
          rounded-2xl
          border border-white/20
          backdrop-blur-xl
          bg-white/5
          shadow-2xl
          overflow-hidden
          p-6
        "
      >
        {/* 🔙 HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src={assets.arrow_icon}
            onClick={() => navigate(-1)}
            className="w-7 cursor-pointer"
          />
          <h2 className="text-lg font-semibold">Profile</h2>
        </div>

        {/* 👤 PROFILE INFO */}
        <div className="flex flex-col items-center mt-4">
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            className="
              w-28 h-28 rounded-full 
              border-2 border-white/20
            "
          />

          <h2 className="text-xl font-semibold mt-4">
            {selectedUser.fullName}
          </h2>

          <p className="text-gray-300 mt-1 text-center">
            {selectedUser.bio || "Available"}
          </p>
        </div>

        {/* Separator */}
        <div className="w-full h-[1px] bg-white/20 my-6" />

        {/* 🖼 MEDIA */}
        <h3 className="mb-3 text-white/80 text-sm">Media</h3>

        {mediaFiles.length === 0 ? (
          <p className="text-xs text-gray-400">No media shared</p>
        ) : (
          <div
            className="
              grid grid-cols-2 md:grid-cols-3 gap-3
              max-h-[45vh] overflow-y-auto pr-2
            "
          >
            {mediaFiles.map((msg, i) => (
              <a
                key={i}
                href={msg.image}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={msg.image}
                  className="
                    w-full h-32 object-cover
                    rounded-xl
                    border border-white/20
                    hover:opacity-90 transition
                  "
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
