import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import toast from "react-hot-toast";

// Toggle Switch Component
const Toggle = ({ enabled, onChange, label }) => (
  <div className="flex items-center justify-between py-4 px-2">
    <span className="text-sm font-medium text-slate-300">{label}</span>
    <button onClick={() => onChange(!enabled)} className={`relative w-12 h-6 rounded-full transition-all ${enabled ? "bg-violet-600" : "bg-white/10"}`}>
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-all ${enabled ? "left-[26px]" : "left-0.5"}`} />
    </button>
  </div>
);

// Select Dropdown Component
const SelectOption = ({ value, onChange, label, options }) => (
  <div className="flex items-center justify-between py-4 px-2">
    <span className="text-sm font-medium text-slate-300">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-violet-500/50 appearance-none cursor-pointer">
      {options.map(opt => <option key={opt.value} value={opt.value} className="bg-[#1a1625]">{opt.label}</option>)}
    </select>
  </div>
);

// Section Card Component
const SectionCard = ({ title, subtitle, icon, children }) => (
  <section className="p-6 md:p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-1000">{icon}</div>
    <div className="relative z-10">
      <h3 className="text-lg font-black tracking-tight mb-1">{title}</h3>
      <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-8">{subtitle}</p>
      {children}
    </div>
  </section>
);

const NAV_ITEMS = ["Account", "Privacy", "Security", "Visuals", "Storage", "Legal"];
const NAV_ICONS = ["👤", "🔒", "🛡️", "🎨", "💾", "📜"];

const SettingsPage = () => {
  const { authUser, updateProfile, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState(0);
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Privacy State (synced from DB)
  const [privacy, setPrivacy] = useState({
    lastSeenVisible: authUser?.privacy?.lastSeenVisible || "everyone",
    profilePhotoVisible: authUser?.privacy?.profilePhotoVisible || "everyone",
    readReceipts: authUser?.privacy?.readReceipts !== false,
    onlineStatus: authUser?.privacy?.onlineStatus !== false,
  });

  // Visuals State (localStorage)
  const [chatWallpaper, setChatWallpaper] = useState(localStorage.getItem("chatWallpaper") || "default");
  const [fontSize, setFontSize] = useState(localStorage.getItem("fontSize") || "medium");
  const [messageDensity, setMessageDensity] = useState(localStorage.getItem("messageDensity") || "comfortable");

  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName || "");
      setBio(authUser.bio || "");
      setPrivacy({
        lastSeenVisible: authUser?.privacy?.lastSeenVisible || "everyone",
        profilePhotoVisible: authUser?.privacy?.profilePhotoVisible || "everyone",
        readReceipts: authUser?.privacy?.readReceipts !== false,
        onlineStatus: authUser?.privacy?.onlineStatus !== false,
      });
    }
  }, [authUser]);

  // Image Upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setIsUploadingImage(true);
      const res = await updateProfile({ profilePic: reader.result });
      if (res.success) toast.success("Profile Image Updated");
      setIsUploadingImage(false);
    };
  };

  // Save Profile
  const handleSave = async () => {
    if (!fullName.trim()) return toast.error("Name cannot be empty");
    setIsUpdating(true);
    const res = await updateProfile({ fullName, bio });
    if (res.success) toast.success("Profile Updated");
    setIsUpdating(false);
  };

  // Change Password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return toast.error("Fill all fields");
    if (newPassword.length < 6) return toast.error("Min 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords don't match");
    setIsChangingPassword(true);
    try {
      const { data } = await api.put("/api/auth/change-password", { currentPassword, newPassword });
      if (data.success) { toast.success(data.message); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
      else toast.error(data.message);
    } catch (err) { toast.error(err.message); }
    finally { setIsChangingPassword(false); }
  };

  // Update Privacy
  const handlePrivacyChange = async (key, value) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    try {
      const { data } = await api.put("/api/auth/update-privacy", { [key]: value });
      if (!data.success) toast.error("Failed to save");
    } catch { toast.error("Network error"); }
  };

  // Save Visuals to localStorage
  const saveVisual = (key, value, setter) => {
    setter(value);
    localStorage.setItem(key, value);
    toast.success("Visual preference saved");
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (!deletePassword) return toast.error("Enter your password");
    try {
      const { data } = await api.delete("/api/auth/delete-account", { data: { password: deletePassword } });
      if (data.success) { toast.success("Account deleted"); logout(); navigate("/login"); }
      else toast.error(data.message);
    } catch (err) { toast.error(err.message); }
  };

  // Storage calc
  const storageUsed = JSON.stringify(localStorage).length;
  const storagePercent = Math.min((storageUsed / 5242880) * 100, 100);

  const visibilityOptions = [
    { value: "everyone", label: "Everyone" },
    { value: "contacts", label: "Contacts Only" },
    { value: "nobody", label: "Nobody" },
  ];

  const iconSvg = (d) => <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-violet-500"><path d={d}/></svg>;

  // ─── TAB CONTENT ───
  const renderContent = () => {
    switch (activeTab) {
      case 0: // Account
        return (
          <SectionCard title="Core Identity" subtitle="Update your digital signature and personal details" icon={iconSvg("M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z")}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Public Full Name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-violet-500/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Signature Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-slate-200 outline-none focus:border-violet-500/50 transition-all resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Email Address</label>
                <input value={authUser?.email || ""} disabled className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white/40 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Member Since</label>
                <input value={authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"} disabled className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white/40 cursor-not-allowed" />
              </div>
              <button onClick={handleSave} disabled={isUpdating} className="w-full md:w-auto px-10 py-4 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-violet-900/50 hover:scale-105 active:scale-95 transition-all">
                {isUpdating ? "Syncing..." : "Update Profile"}
              </button>
            </div>
          </SectionCard>
        );

      case 1: // Privacy
        return (
          <SectionCard title="Privacy Controls" subtitle="Manage who can see your information" icon={iconSvg("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z")}>
            <div className="divide-y divide-white/5">
              <SelectOption label="Last Seen & Online" value={privacy.lastSeenVisible} onChange={(v) => handlePrivacyChange("lastSeenVisible", v)} options={visibilityOptions} />
              <SelectOption label="Profile Photo" value={privacy.profilePhotoVisible} onChange={(v) => handlePrivacyChange("profilePhotoVisible", v)} options={visibilityOptions} />
              <Toggle label="Read Receipts (Blue Ticks)" enabled={privacy.readReceipts} onChange={(v) => handlePrivacyChange("readReceipts", v)} />
              <Toggle label="Show Online Status" enabled={privacy.onlineStatus} onChange={(v) => handlePrivacyChange("onlineStatus", v)} />
            </div>
            <p className="text-[10px] text-white/20 mt-6 px-2">Changes are saved automatically and synced across all your devices.</p>
          </SectionCard>
        );

      case 2: // Security
        return (
          <div className="space-y-6">
            <SectionCard title="Change Password" subtitle="Update your account credentials" icon={iconSvg("M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5z")}>
              <div className="space-y-4">
                <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-violet-500/50 transition-all placeholder:text-white/20" />
                <input type="password" placeholder="New Password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-violet-500/50 transition-all placeholder:text-white/20" />
                <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-violet-500/50 transition-all placeholder:text-white/20" />
                <button onClick={handleChangePassword} disabled={isChangingPassword} className="w-full md:w-auto px-10 py-4 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-violet-900/50 hover:scale-105 active:scale-95 transition-all">
                  {isChangingPassword ? "Updating..." : "Change Password"}
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Danger Zone" subtitle="Irreversible account actions" icon={iconSvg("M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6")}>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} className="px-8 py-3 bg-red-600/20 border border-red-500/30 text-red-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-600/30 transition-all">
                  Delete My Account
                </button>
              ) : (
                <div className="space-y-4 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                  <p className="text-sm text-red-300">This action is permanent. Enter your password to confirm.</p>
                  <input type="password" placeholder="Enter your password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="w-full bg-white/5 border border-red-500/30 rounded-xl p-3 text-sm text-white outline-none placeholder:text-white/20" />
                  <div className="flex gap-3">
                    <button onClick={handleDeleteAccount} className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase">Confirm Delete</button>
                    <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); }} className="px-6 py-3 bg-white/5 text-white/60 rounded-xl text-xs font-black uppercase">Cancel</button>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        );

      case 3: // Visuals
        return (
          <SectionCard title="Visual Preferences" subtitle="Customize the look and feel" icon={iconSvg("M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z")}>
            <div className="divide-y divide-white/5">
              <SelectOption label="Chat Wallpaper" value={chatWallpaper} onChange={(v) => saveVisual("chatWallpaper", v, setChatWallpaper)} options={[
                { value: "default", label: "Default Dark" },
                { value: "gradient", label: "Gradient" },
                { value: "minimal", label: "Minimal" },
                { value: "stars", label: "Starfield" },
              ]} />
              <SelectOption label="Font Size" value={fontSize} onChange={(v) => saveVisual("fontSize", v, setFontSize)} options={[
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
              ]} />
              <SelectOption label="Message Density" value={messageDensity} onChange={(v) => saveVisual("messageDensity", v, setMessageDensity)} options={[
                { value: "compact", label: "Compact" },
                { value: "comfortable", label: "Comfortable" },
                { value: "spacious", label: "Spacious" },
              ]} />
            </div>
            <p className="text-[10px] text-white/20 mt-6 px-2">Visual preferences are saved locally on this device.</p>
          </SectionCard>
        );

      case 4: // Storage
        return (
          <SectionCard title="Storage Management" subtitle="Manage local data and cache" icon={iconSvg("M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z")}>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-white/50">Local Storage Usage</span>
                  <span className="text-xs font-bold text-violet-400">{(storageUsed / 1024).toFixed(1)} KB / 5 MB</span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all" style={{ width: `${storagePercent}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-2xl font-black text-white">{Object.keys(localStorage).length}</p>
                  <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Cached Items</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-2xl font-black text-white">{(storageUsed / 1024).toFixed(1)}</p>
                  <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1">KB Used</p>
                </div>
              </div>
              <button onClick={() => {
                const token = localStorage.getItem("token");
                localStorage.clear();
                if (token) localStorage.setItem("token", token);
                toast.success("Cache cleared (auth preserved)");
              }} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all">
                Clear Cache
              </button>
            </div>
          </SectionCard>
        );

      case 5: // Legal
        return (
          <div className="space-y-6">
            <SectionCard title="About Signature Chat" subtitle="Application information" icon={iconSvg("M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01")}>
              <div className="space-y-4">
                {[
                  ["Application", "Signature Chat"],
                  ["Version", "2.0.0"],
                  ["Platform", "MERN + WebRTC + Socket.IO"],
                  ["License", "Private / Commercial"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-3 px-2 border-b border-white/5">
                    <span className="text-xs text-white/40">{k}</span>
                    <span className="text-xs font-bold text-white">{v}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Legal Documents" subtitle="Terms, privacy, and policies" icon={iconSvg("M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z")}>
              <div className="space-y-3">
                {["Terms of Service", "Privacy Policy", "Cookie Policy", "Open Source Licenses"].map(doc => (
                  <button key={doc} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{doc}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="h-full w-full bg-[#030014] text-white flex flex-col items-center overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between p-6 md:p-10 gap-6 animate-fade-in">
        <button onClick={() => navigate("/")} className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group active:scale-95 shadow-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Chat</span>
        </button>
        <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic opacity-30 text-center md:text-right w-full md:w-auto">System Control Hub</h1>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 px-4 md:px-10 pb-20">
        {/* Side Nav */}
        <div className="lg:col-span-4 space-y-4 animate-slide-right">
          <div className="p-6 md:p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 mb-8 relative z-10">
              <div className="relative shrink-0 cursor-pointer group/avatar" onClick={() => fileInputRef.current.click()}>
                <div className="absolute -inset-1 bg-violet-500/50 blur-md rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                <img src={authUser?.profilePic || assets.avatar_icon} className={`relative w-16 h-16 md:w-20 md:h-20 rounded-[1.8rem] object-cover border-2 border-white/20 shadow-2xl transition-all ${isUploadingImage ? "opacity-40" : "group-hover/avatar:scale-105"}`} alt="" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white drop-shadow-lg"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
                {isUploadingImage && <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" hidden />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-black truncate tracking-tight text-white">{authUser?.fullName}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-violet-400 mt-1">Profile View</p>
              </div>
            </div>

            <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
              {NAV_ITEMS.map((item, i) => (
                <button key={i} onClick={() => setActiveTab(i)} className={`shrink-0 lg:w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3
                  ${activeTab === i ? "bg-violet-500/20 text-white border border-violet-500/30 shadow-lg" : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"}`}>
                  <span className="text-sm">{NAV_ICONS[i]}</span> {item}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div key={activeTab} className="lg:col-span-8 space-y-6 animate-slide-left">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
