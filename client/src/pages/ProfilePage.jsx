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
    <div className="min-h-screen flex justify-center items-center text-white">
      <div className="relative bg-[#1a1a1a]/80 p-10 rounded-xl border border-gray-600 w-[350px]">

        {/* 🔙 BACK ARROW */}
        <img
          src={assets.arrow_icon}
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-6 cursor-pointer opacity-80 hover:opacity-100 transition"
          alt="Back"
        />

        <h2 className="text-xl mb-4 text-center">Edit Profile User</h2>

        <label className="flex items-center gap-4 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files[0])}
          />

          <img
            src={
              image
                ? URL.createObjectURL(image)
                : authUser.profilePic || assets.avatar_icon
            }
            className="w-16 h-16 rounded-full"
          />

          <span>Change Photo</span>
        </label>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 bg-gray-700 rounded outline-none"
            placeholder="Full Name"
          />

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="p-2 bg-gray-700 rounded outline-none"
            rows="3"
            placeholder="Bio..."
          />

          <button className="bg-purple-600 p-2 rounded">Save</button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
