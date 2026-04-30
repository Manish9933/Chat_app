import { useEffect, useRef, useContext, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { CallContext } from "../../context/CallContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages, typingUsers } =
    useContext(ChatContext);

  const { authUser, onlineUsers, socket } = useContext(AuthContext);
  const { startAudioCall, startVideoCall } = useContext(CallContext);

  const scrollRef = useRef(null);
  const [input, setInput] = useState("");
  const typingTimeoutRef = useRef(null);

  // ---------------- TYPING LOGIC ----------------
  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    if (socket && selectedUser) {
      socket.emit("typing", { to: selectedUser._id });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { to: selectedUser._id });
      }, 2000);
    }
  };

  // ---------------- SEND TEXT ----------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage({ text: input.trim() });
    setInput("");
  };

  // ---------------- SEND FILE ----------------
  const handleSendFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let type = "file";
    if (file.type.startsWith("image/")) type = "image";
    else if (file.type.startsWith("video/")) type = "video";

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ file: reader.result, fileType: type });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  // ---------------- LOAD MESSAGES ----------------
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="relative mb-8">
          {/* Decorative background glow for logo */}
          <div className="absolute inset-0 bg-violet-600/20 blur-3xl rounded-full scale-150"></div>
          <div className="relative w-24 h-24 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl">
            <img src={assets.logo_icon} className="w-12 animate-pulse" alt="Logo" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3">Welcome to QuickChat</h2>
        <p className="text-white/40 max-w-sm leading-relaxed mb-8">
          Select a conversation from the sidebar to start messaging your friends in real-time.
        </p>
        
        <div className="grid grid-cols-2 gap-4 max-w-md w-full">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm text-left">
            <span className="text-xl mb-2 block">💬</span>
            <p className="text-white font-medium text-sm">Instant Messaging</p>
            <p className="text-white/30 text-xs">Lightning fast delivery</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm text-left">
            <span className="text-xl mb-2 block">📹</span>
            <p className="text-white font-medium text-sm">Video Calls</p>
            <p className="text-white/30 text-xs">High-def crystal clear</p>
          </div>
        </div>
        
        <p className="mt-12 text-xs text-white/20 uppercase tracking-[0.2em]">Secure • Encrypted • Fast</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden flex flex-col relative backdrop-blur-md bg-white/5">
      {/* HEADER */}
      <div className="flex items-center gap-3 py-3.5 px-4 border-b border-white/5 bg-black/30 backdrop-blur-2xl z-20">
        {/* Back Button for Mobile */}
        <button
          onClick={() => setSelectedUser(null)}
          className="flex items-center justify-center w-10 h-10 -ml-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all md:hidden active:scale-90"
        >
          <img src={assets.arrow_icon} className="w-5 opacity-80" alt="back" />
        </button>

        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          className="w-10 h-10 rounded-full object-cover border border-white/10"
          alt=""
        />

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-base md:text-lg text-white font-semibold truncate leading-tight">
            {selectedUser?.fullName || "Chat"}
          </p>
          <p className="text-[11px] md:text-xs leading-tight mt-0.5">
            {typingUsers?.[selectedUser?._id] ? (
              <span className="text-green-400 animate-pulse font-medium">typing...</span>
            ) : (
              <span className={onlineUsers?.includes(selectedUser?._id) ? "text-green-400 font-medium" : "text-white/40"}>
                {onlineUsers?.includes(selectedUser?._id) ? "Online" : "Offline"}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => startAudioCall(selectedUser)}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 bg-white/5 border border-white/5 rounded-full transition-all active:scale-95"
          >
            <img src={assets.call_icon} className="w-5 opacity-80" alt="call" />
          </button>
          
          <button 
            onClick={() => startVideoCall(selectedUser)}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 bg-white/5 border border-white/5 rounded-full transition-all active:scale-95"
          >
            <img src={assets.video_icon} className="w-6 opacity-80" alt="video" />
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {(messages || []).map((msg) => {
          const isMe = (msg.senderId === authUser?._id) || (msg.senderId?._id === authUser?._id);

          return (
            <div
              key={msg._id}
              className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
            >
              {!isMe && (
                <img
                  src={selectedUser?.profilePic || assets.avatar_icon}
                  className="w-7 h-7 rounded-full object-cover border border-white/10 mb-5"
                  alt=""
                />
              )}

              <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                {/* ✅ MEDIA RENDERING */}
                {(msg.file || msg.image) && (
                  <div className="mb-1 rounded-2xl overflow-hidden border border-white/5">
                    {/* VIDEO/FILE/IMAGE logic remains same but with tighter margins */}
                    {msg.fileType === "video" ? (
                      <video src={msg.file} controls className="max-w-full max-h-[300px] object-cover" />
                    ) : msg.fileType === "file" ? (
                      <a href={msg.file} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white/5">
                         <span className="text-xl">📄</span>
                         <span className="text-xs text-white/60 truncate max-w-[120px]">Document</span>
                      </a>
                    ) : (
                      <img
                        src={msg.file || msg.image}
                        className="max-w-full max-h-[400px] object-cover cursor-pointer"
                        alt="shared"
                        onClick={() => window.open(msg.file || msg.image, "_blank")}
                      />
                    )}
                  </div>
                )}

                {/* ✅ TEXT RENDERING (Instagram Style) */}
                {msg.text && (
                  <div
                    className={`px-4 py-2.5 text-[14px] leading-relaxed rounded-[20px] break-words ${
                      isMe
                        ? "bg-gradient-to-tr from-violet-600 to-indigo-500 text-white rounded-br-[4px]"
                        : "bg-white/10 text-white rounded-bl-[4px]"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                {/* ✅ TIME & STATUS */}
                <div className={`flex items-center gap-1 mt-1 px-1 opacity-40`}>
                  <p className="text-[9px]">
                    {msg.createdAt ? formatMessageTime(msg.createdAt) : "now"}
                  </p>
                  {isMe && <span className="text-[10px]">{msg.seen ? "seen" : "✓"}</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef}></div>
      </div>

      {/* INPUT (Instagram Pill) */}
      <div className="p-3 bg-transparent">
        <div className="flex items-center bg-white/5 border border-white/10 p-1 pl-4 rounded-full focus-within:border-white/20 transition-all shadow-2xl">
          <input
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
            placeholder="Message..."
            className="flex-1 bg-transparent text-sm py-2.5 outline-none text-white placeholder-white/20"
          />

          <div className="flex items-center gap-1 pr-1">
            <label htmlFor="chat-file" className="w-9 h-9 flex items-center justify-center cursor-pointer hover:bg-white/5 rounded-full">
              <img src={assets.gallery_icon} className="w-5 opacity-60" alt="attach" />
            </label>

            <button 
              onClick={handleSendMessage}
              disabled={!input.trim()}
              className="w-9 h-9 flex items-center justify-center text-violet-400 font-bold disabled:opacity-0 transition-all px-2"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
