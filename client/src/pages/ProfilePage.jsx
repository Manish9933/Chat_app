import React, { useState, useContext } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio || "");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let body = { fullName: name, bio };

    if (image) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        body.profilePic = reader.result;
        await updateProfile(body);
        navigate("/");
      };
      reader.readAsDataURL(image);
    } else {
      await updateProfile(body);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center sm:p-4">
      <div className="relative w-full h-full sm:h-auto max-w-md bg-white/5 backdrop-blur-3xl p-8 sm:p-10 sm:rounded-[2rem] sm:border border-white/10 shadow-2xl shadow-black/50 animate-pop overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>

        {/* 🔙 BACK ARROW */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/70"
          title="Go Back"
        >
          <img
            src={assets.arrow_icon}
            className="w-5"
            alt="Back"
          />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          <p className="text-white/40 text-sm mt-1">Update your personal information</p>
        </div>

        <div className="flex flex-col items-center mb-8">
          <label className="relative group cursor-pointer">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
            <div className="w-28 h-28 rounded-full border-2 border-white/10 p-1 group-hover:border-violet-500/50 transition-all">
              <img
                src={
                  image
                    ? URL.createObjectURL(image)
                    : authUser.profilePic || assets.avatar_icon
                }
                className="w-full h-full rounded-full object-cover shadow-xl"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center border-4 border-[#121212] group-hover:scale-110 transition-transform shadow-lg">
              <span className="text-white text-xs">✎</span>
            </div>
          </label>
          <p className="text-white/60 text-xs mt-3 uppercase tracking-widest font-semibold">Change Photo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 ml-1 uppercase tracking-wider">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
              placeholder="Full Name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 ml-1 uppercase tracking-wider">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all placeholder:text-white/20 resize-none"
              rows="4"
              placeholder="Tell us about yourself..."
            />
          </div>

          <button className="w-full py-4 mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-violet-900/20 transform active:scale-[0.98] transition-all">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
