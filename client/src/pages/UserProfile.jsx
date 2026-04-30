import { useParams, useNavigate } from "react-router-dom";
import { useContext, useMemo, useState, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { selectedUser, messages, getMessages, setSelectedUser } = useContext(ChatContext);
  const { axios } = useContext(AuthContext);

  const [loading, setLoading] = useState(!selectedUser || selectedUser._id !== userId);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`/api/auth/user/${userId}`);
        if (data.success) {
          setSelectedUser(data.user);
          getMessages(userId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!selectedUser || selectedUser._id !== userId) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [userId, axios, setSelectedUser, getMessages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        User not found
      </div>
    );
  }

  // 📸 Collect media
  const mediaFiles = useMemo(() => {
    return messages?.filter((m) => m.fileType === "image" || m.image) || [];
  }, [messages]);

  return (
    /* 🌌 PAGE BACKGROUND */
    <div className="min-h-screen w-full flex flex-col bg-black/40 backdrop-blur-3xl sm:items-center sm:justify-center sm:p-4 text-white">
        

      {/* 🧊 GLASS CARD (same feel as chat UI) */}
      <div className="w-full sm:w-[85%] lg:w-[60%] flex-1 sm:flex-none sm:rounded-[2.5rem] sm:border border-white/10 backdrop-blur-xl bg-white/5 shadow-2xl overflow-hidden p-6 sm:p-10 relative flex flex-col">
        {/* 🔙 HEADER */}
        <div className="flex items-center gap-4 mb-8 relative z-20">
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/70 active:scale-90">
            <img src={assets.arrow_icon} className="w-6" alt="Back" />
          </button>
          <h2 className="text-xl font-bold tracking-tight">Profile</h2>
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
                href={msg.file || msg.image}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={msg.file || msg.image}
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
