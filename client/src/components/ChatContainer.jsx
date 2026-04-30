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
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const typingTimeoutRef = useRef(null);

  const emojis = ["😊", "😂", "🥰", "😍", "😒", "😭", "😘", "🔥", "✨", "🙌", "👍", "❤️", "✔️", "📍", "🤝", "🎉"];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          sendMessage({ file: reader.result, fileType: "audio" });
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

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
        
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 max-w-md w-full">
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
        
        <p className="mt-12 text-xs text-white/20 uppercase tracking-[0.2em] hidden sm:block">Secure • Encrypted • Fast</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden flex flex-col relative bg-transparent">
      {/* HEADER */}
      <div className="flex items-center gap-3 py-3.5 px-4 border-b border-violet-500/10 bg-[#0b0a1a]/40 backdrop-blur-3xl z-20 shadow-2xl relative">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>

        {/* Back Button for Mobile */}
        <button
          onClick={() => setSelectedUser(null)}
          className="flex items-center justify-center w-10 h-10 -ml-1 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 rounded-full transition-all md:hidden active:scale-90 shadow-lg shadow-violet-900/40"
        >
          <img src={assets.arrow_icon} className="w-5 opacity-100 brightness-150 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" alt="back" />
        </button>

        <div className="relative shrink-0">
          <div className="absolute -inset-1 bg-violet-500/20 blur-md rounded-full"></div>
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            className="relative w-10 h-10 rounded-full object-cover border-2 border-white/20 shadow-xl"
            alt=""
          />
          {onlineUsers?.includes(selectedUser?._id) && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0b0a1a] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)] z-10"></span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center ml-1">
          <p className="text-base md:text-lg text-white font-bold truncate tracking-tight drop-shadow-sm">
            {selectedUser?.fullName || "Chat"}
          </p>
          <p className="text-[11px] md:text-xs leading-tight mt-0.5 font-bold">
            {typingUsers?.[selectedUser?._id] ? (
              <span className="text-violet-400 animate-pulse uppercase tracking-wider">typing...</span>
            ) : (
              <span className={onlineUsers?.includes(selectedUser?._id) ? "text-green-400 uppercase tracking-widest text-[9px]" : "text-white/40 uppercase tracking-widest text-[9px]"}>
                {onlineUsers?.includes(selectedUser?._id) ? "Online" : "Offline"}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => startAudioCall(selectedUser)}
            className="w-10 h-10 flex items-center justify-center hover:bg-violet-600/30 bg-white/5 border border-white/10 rounded-full transition-all active:scale-95 shadow-lg group"
          >
            <img src={assets.call_icon} className="w-5 opacity-90 brightness-150 group-hover:scale-110 transition-transform" alt="call" />
          </button>
          
          <button 
            onClick={() => startVideoCall(selectedUser)}
            className="w-10 h-10 flex items-center justify-center hover:bg-violet-600/30 bg-white/5 border border-white/10 rounded-full transition-all active:scale-95 shadow-lg group"
          >
            <img src={assets.video_icon} className="w-6 opacity-90 brightness-150 group-hover:scale-110 transition-transform" alt="video" />
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
        <div className="absolute inset-0 bg-whatsapp pointer-events-none opacity-[0.05]"></div>
        <div className="relative z-10 space-y-6 flex flex-col">
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
      </div>

      {/* INPUT (WhatsApp Style, Sync with Theme) */}
      <div className="p-1.5 md:p-3 bg-transparent flex items-end gap-1.5 md:gap-2 w-full max-w-full relative">
        
        {/* Emoji Picker Popup */}
        {showEmoji && (
          <div className="absolute bottom-full left-4 mb-2 p-2 bg-[#0b0a1a]/90 backdrop-blur-3xl border border-violet-500/20 rounded-2xl shadow-2xl grid grid-cols-4 gap-2 animate-pop z-50">
            {emojis.map(e => (
              <button 
                key={e} 
                onClick={() => { setInput(prev => prev + e); setShowEmoji(false); }}
                className="text-xl p-2 hover:bg-white/5 rounded-lg transition-all"
              >
                {e}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 min-w-0 flex items-center bg-white/5 border border-white/10 p-0.5 pl-2 md:p-1 md:pl-3 rounded-[24px] focus-within:border-white/20 transition-all shadow-xl backdrop-blur-xl">
          <button 
            onClick={() => setShowEmoji(!showEmoji)}
            className={`p-1.5 md:p-2 transition-colors shrink-0 ${showEmoji ? "text-violet-400" : "text-white/40 hover:text-violet-400"}`}
          >
            <span className="text-lg md:text-xl">😊</span>
          </button>
          
          <input
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
            placeholder={isRecording ? "Recording..." : "Message"}
            disabled={isRecording}
            className="flex-1 min-w-0 bg-transparent text-sm py-2.5 md:py-3 px-1 md:px-2 outline-none text-white placeholder-white/20"
          />

          <div className="flex items-center gap-0.5 pr-1 shrink-0">
            {/* Document Upload */}
            <label htmlFor="doc-file" className="p-1.5 md:p-2 cursor-pointer text-white/40 hover:text-violet-400 transition-all" title="Document">
               <span className="text-lg md:text-xl rotate-45 block">📎</span>
            </label>
            
            <label htmlFor="chat-file" className="p-1.5 md:p-2 cursor-pointer text-white/40 hover:text-violet-400 transition-all" title="Gallery">
              <img src={assets.gallery_icon} className="w-4.5 md:w-5 opacity-40" alt="attach" />
            </label>
            
            <button className="p-1.5 md:p-2 text-white/40 hover:text-violet-400 transition-all" title="Camera">
              <span className="text-lg md:text-xl">📷</span>
            </button>
          </div>
        </div>

        {/* Circular Send/Mic Button */}
        <button 
          onClick={input.trim() ? handleSendMessage : (isRecording ? stopRecording : startRecording)}
          className={`w-[48px] h-[48px] md:w-[52px] md:h-[52px] shrink-0 flex items-center justify-center rounded-full shadow-lg transition-all active:scale-90
            ${input.trim() || isRecording
              ? "bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-violet-600/40" 
              : "bg-white/10 text-white/40 shadow-none hover:bg-white/20"}`}
        >
          {input.trim() ? (
             <img src={assets.send_button} className="w-5 md:w-6 animate-pop" alt="send" />
          ) : (
             isRecording ? (
               <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
             ) : (
               <img src={assets.mic_on_icon} className="w-5 md:w-6 opacity-60" alt="mic" />
             )
          )}
        </button>
      </div>
      
      {/* Hidden file inputs */}
      <input type="file" id="chat-file" accept="image/*,video/*" hidden onChange={handleSendFile} />
      <input type="file" id="doc-file" accept=".pdf,.doc,.docx,.txt" hidden onChange={(e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          sendMessage({ file: reader.result, fileType: "document", fileName: file.name });
        };
      }} />
    </div>
  );
};

export default ChatContainer;
