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
    <div className="h-full overflow-hidden flex flex-col relative backdrop-blur-md bg-white/5">
      {/* HEADER */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-white/5">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          className="w-10 h-10 rounded-full object-cover border border-white/10"
          alt=""
        />

        <div className="flex-1 min-w-0">
          <p className="text-lg text-white font-medium truncate">
            {selectedUser?.fullName || "Chat"}
          </p>
          <p className="text-xs">
            {typingUsers?.[selectedUser?._id] ? (
              <span className="text-green-400 animate-pulse font-medium">typing...</span>
            ) : (
              <span className={onlineUsers?.includes(selectedUser?._id) ? "text-green-500/70" : "text-white/30"}>
                {onlineUsers?.includes(selectedUser?._id) ? "Online" : "Offline"}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => startAudioCall(selectedUser)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <img src={assets.call_icon} className="w-5" alt="call" />
          </button>
          
          <button 
            onClick={() => startVideoCall(selectedUser)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <img src={assets.video_icon} className="w-6" alt="video" />
          </button>

          <button
            onClick={() => setSelectedUser(null)}
            className="p-2 hover:bg-white/5 rounded-full transition-colors md:hidden"
          >
            <img src={assets.arrow_icon} className="w-6" alt="back" />
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
              className={`flex items-end gap-2 ${isMe ? "flex-row" : "flex-row-reverse"} ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="flex flex-col max-w-[75%]">
                {/* ✅ SENDER NAME */}
                <p className={`text-[10px] text-gray-500 mb-1 px-2 ${isMe ? "text-right" : "text-left"}`}>
                  {isMe ? "You" : selectedUser?.fullName}
                </p>

                {/* ✅ MEDIA RENDERING */}
                {(msg.file || msg.image) && (
                  <div className="mb-2 min-h-[150px] min-w-[200px] flex items-center justify-center bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                    {/* VIDEO HANDLING */}
                    {msg.fileType === "video" ? (
                      <video
                        src={msg.file}
                        controls
                        className="w-full max-h-[300px] object-cover"
                      />
                    ) : msg.fileType === "file" ? (
                      /* DOCUMENT HANDLING */
                      <a
                        href={msg.file}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-4 w-full h-full hover:bg-white/5 transition-all group"
                      >
                        <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-2xl">📄</span>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                            Attachment
                          </span>
                          <span className="text-[10px] text-white/40 uppercase tracking-tighter">Click to view document</span>
                        </div>
                      </a>
                    ) : (
                      /* IMAGE HANDLING (Default Fallback) */
                      <img
                        src={msg.file || msg.image}
                        className="w-full max-h-[400px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        alt="shared"
                        onLoad={(e) => e.target.parentElement.classList.remove('min-h-[150px]', 'bg-white/5')}
                        onClick={() => window.open(msg.file || msg.image, "_blank")}
                        onError={(e) => e.target.src = "https://via.placeholder.com/150?text=Error+Loading+Image"}
                      />
                    )}
                  </div>
                )}

                {/* ✅ TEXT RENDERING */}
                {msg.text && (
                  <div
                    className={`p-3 md:text-sm font-light rounded-2xl break-words shadow-xl ${
                      isMe
                        ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-none shadow-indigo-500/20"
                        : "bg-white/10 text-white rounded-bl-none border border-white/10"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                {/* ✅ WHATSAPP TICKS & TIME */}
                <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
                  <p className="text-[10px] text-white/30 tracking-tight">
                    {msg.createdAt ? formatMessageTime(msg.createdAt) : "Just now"}
                  </p>
                  {isMe && (
                    <div className="flex items-center">
                      <span className={`text-[10px] ${msg.seen ? "text-blue-400" : "text-white/20"}`}>✓</span>
                      <span className={`text-[10px] -ml-1 ${msg.seen ? "text-blue-400" : "text-white/20"}`}>✓</span>
                    </div>
                  )}
                </div>
              </div>

              <img
                src={isMe ? (authUser?.profilePic || assets.avatar_icon) : (selectedUser?.profilePic || assets.avatar_icon)}
                className="w-7 h-7 rounded-full object-cover shadow-md border border-white/10 mb-5"
                alt=""
              />
            </div>
          );
        })}
        <div ref={scrollRef}></div>
      </div>

      {/* INPUT */}
      <div className="p-4 bg-transparent">
        <div className="flex items-center bg-white/10 backdrop-blur-3xl border border-white/10 p-2 px-4 rounded-[1.5rem] shadow-xl focus-within:border-white/20 transition-all">
          <input
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm p-2 outline-none text-white placeholder-white/20"
          />

          <input
            type="file"
            id="chat-file"
            hidden
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleSendFile}
          />

          <div className="flex items-center gap-4 ml-2">
            <label htmlFor="chat-file" className="cursor-pointer hover:opacity-70 transition-opacity">
              <img src={assets.gallery_icon} className="w-5" alt="attach" />
            </label>

            <button 
              onClick={handleSendMessage}
              disabled={!input.trim()}
              className="p-2 bg-white rounded-xl hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <img src={assets.send_button} className="w-5 invert" alt="send" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
