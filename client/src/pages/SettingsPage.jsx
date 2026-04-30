import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName || "");
      setBio(authUser.bio || "");
    }
  }, [authUser]);

  // 📸 HANDLE IMAGE UPLOAD
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setIsUploadingImage(true);
      try {
        await updateProfile({ profilePic: base64Image });
        toast.success("Profile Image Synchronized");
      } catch (err) {
        toast.error("Image Upload Failed");
      } finally {
        setIsUploadingImage(false);
      }
    };
  };

  const handleSave = async () => {
    if (!fullName.trim()) return toast.error("Name cannot be empty");
    setIsUpdating(true);
    try {
      await updateProfile({ fullName, bio });
      toast.success("Settings Synchronized", {
        style: { background: "#1a1625", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }
      });
    } catch (err) {
      toast.error("Update Failed");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030014] text-white flex flex-col items-center overflow-y-auto custom-scrollbar">
      
      {/* 🚀 ELITE HEADER */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between p-6 md:p-10 gap-6 animate-fade-in">
        <button 
          onClick={() => navigate("/")} 
          className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group active:scale-95 shadow-lg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Chat</span>
        </button>
        <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic opacity-30 text-center md:text-right w-full md:w-auto">System Control Hub</h1>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 px-4 md:px-10 pb-20">
        
        {/* 📋 SIDE NAVIGATION */}
        <div className="lg:col-span-4 space-y-4 animate-slide-right">
          <div className="p-6 md:p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 mb-8 relative z-10">
              <div 
                className="relative shrink-0 cursor-pointer group/avatar"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="absolute -inset-1 bg-violet-500/50 blur-md rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
                <img 
                  src={authUser?.profilePic || assets.avatar_icon} 
                  className={`relative w-16 h-16 md:w-20 md:h-20 rounded-[1.8rem] object-cover border-2 border-white/20 shadow-2xl transition-all ${isUploadingImage ? "opacity-40" : "group-hover/avatar:scale-105"}`} 
                  alt="" 
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-lg"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
                {isUploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" hidden />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-black truncate tracking-tight text-white">{authUser?.fullName}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-violet-400 mt-1">Profile View</p>
              </div>
            </div>

            <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
              {["Account", "Privacy", "Security", "Visuals", "Storage", "Legal"].map((item, i) => (
                <button 
                  key={i} 
                  className={`shrink-0 lg:w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${i === 0 ? "bg-violet-500/20 text-white border border-violet-500/30 shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"}`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* ⚡ CONTENT AREA */}
        <div className="lg:col-span-8 space-y-6 md:y-10 animate-slide-left">
          <section className="p-8 md:p-12 rounded-[3rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-1000">
              <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-black tracking-tight mb-2">Core Identity</h3>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-10">Update your digital signature and personal details</p>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Public Full Name</label>
                  <input 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-black text-white outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all shadow-inner" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Signature Bio</label>
                  <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-medium text-slate-200 outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all resize-none shadow-inner" 
                  />
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="w-full md:w-auto px-12 py-4 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-violet-900/50 hover:scale-105 active:scale-95 transition-all"
                  >
                    {isUpdating ? "Syncing..." : "Update Profile"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
