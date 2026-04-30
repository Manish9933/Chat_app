import React, { useState, useRef, useEffect, useContext } from "react";
import { ChatContext } from "../../../context/ChatContext";
import { AuthContext } from "../../../context/AuthContext";

const LuxuryIcons = {
  Gallery: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
  ),
  Camera: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
  ),
  Location: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
  ),
  Document: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  ),
  Poll: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  )
};

const ChatInput = ({ 
  text, setText, handleSendMessage, handleSendFile, 
  showEmoji, setShowEmoji, showAttachments, setShowAttachments,
  isListening, toggleListening, isRecordingAudio, startRecordingAudio, stopRecordingAudio,
  replyingTo, setReplyingTo, openCamera, setShowPollCreator, shareLocation
}) => {
  const { selectedUser } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);

  const emojiRef = useRef(null);
  const attachmentRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const attachmentButtonRef = useRef(null);
  const galleryInputRef = useRef(null);
  const docInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target) && emojiButtonRef.current && !emojiButtonRef.current.contains(event.target)) setShowEmoji(false);
      if (attachmentRef.current && !attachmentRef.current.contains(event.target) && attachmentButtonRef.current && !attachmentButtonRef.current.contains(event.target)) setShowAttachments(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowEmoji, setShowAttachments]);

  return (
    <div className="p-3 md:p-6 bg-transparent flex flex-col items-center gap-3 w-full max-w-[1200px] mx-auto relative z-50">
      
      {/* 🍎 EMOJI PICKER */}
      {showEmoji && (
        <div ref={emojiRef} className="absolute bottom-[calc(100%+20px)] left-4 right-4 md:left-4 md:right-auto md:w-[280px] p-4 bg-[#1a1625]/95 backdrop-blur-[50px] border border-white/20 rounded-[2rem] shadow-2xl z-50 animate-pop">
          <div className="grid grid-cols-6 gap-2">
            {["😊", "😂", "🥰", "😍", "😒", "😭", "😘", "🔥", "✨", "🙌", "👍", "❤️", "✔️", "📍", "🤝", "🎉", "⚡", "🚀", "💎", "🌟", "💯", "🎈", "🎁"].map((emoji, i) => (
              <button key={i} onClick={() => { setText(prev => prev + emoji); setShowEmoji(false); }} className="text-2xl hover:scale-125 transition-transform p-1">{emoji}</button>
            ))}
          </div>
        </div>
      )}

      {/* 📎 ATTACHMENT MENU */}
      {showAttachments && (
        <div ref={attachmentRef} className="absolute bottom-[calc(100%+20px)] left-4 right-4 md:left-auto md:right-4 md:w-[380px] p-6 bg-[#1a1625]/95 backdrop-blur-[50px] border border-white/20 rounded-[3rem] shadow-2xl grid grid-cols-4 gap-5 animate-pop z-50">
          {[
            { label: "Gallery", icon: LuxuryIcons.Gallery, color: "from-blue-600/60 to-indigo-600/60", action: () => galleryInputRef.current.click() },
            { label: "Camera", icon: LuxuryIcons.Camera, color: "from-pink-600/60 to-rose-600/60", action: openCamera },
            { label: "Location", icon: LuxuryIcons.Location, color: "from-emerald-600/60 to-teal-600/60", action: shareLocation },
            { label: "Document", icon: LuxuryIcons.Document, color: "from-violet-600/60 to-purple-600/60", action: () => docInputRef.current.click() },
            { label: "Poll", icon: LuxuryIcons.Poll, color: "from-yellow-600/60 to-orange-600/60", action: () => { setShowPollCreator(true); setShowAttachments(false); } }
          ].map((item, i) => (
            <button key={i} onClick={item.action} className="flex flex-col items-center gap-2 group">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white border border-white/20 transition-all group-hover:scale-110 shadow-lg`}><item.icon /></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 🧵 REPLY PREVIEW */}
      {replyingTo && (
        <div className="w-full bg-[#1a1625]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-4 flex items-center justify-between animate-slide-up mb-[-12px] relative z-0">
           <div className="flex-1 min-w-0 border-l-4 border-violet-500 pl-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-1">Replying to {replyingTo.senderId?._id === authUser?._id ? "yourself" : selectedUser?.fullName}</p>
              <p className="text-xs text-white/80 line-clamp-1 font-medium italic">{replyingTo.text || "Shared Media"}</p>
           </div>
           <button onClick={() => setReplyingTo(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 transition-all ml-4">✕</button>
        </div>
      )}

      <div className="flex items-end gap-3 w-full relative z-10">
        <div className="flex-1 min-w-0 flex items-center bg-white/10 border border-white/20 p-1 pl-3 md:p-1.5 md:pl-4 rounded-[28px] focus-within:border-white/40 transition-all shadow-2xl backdrop-blur-3xl relative">
          <button ref={emojiButtonRef} onClick={() => setShowEmoji(!showEmoji)} className={`p-2 transition-transform hover:scale-120 shrink-0 ${showEmoji ? "grayscale-0 scale-110" : "grayscale opacity-80"}`}><span className="text-xl md:text-2xl">😊</span></button>
          <input 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} 
            placeholder={isListening ? "Listening..." : (isRecordingAudio ? "Recording..." : "Type your message...")} 
            className="flex-1 min-w-0 bg-transparent text-[15px] py-3 md:py-3.5 px-2 md:px-3 outline-none text-white placeholder-slate-400 font-medium" 
          />
          <div className="flex items-center pr-2 shrink-0">
            <button ref={attachmentButtonRef} onClick={() => setShowAttachments(!showAttachments)} className={`p-2 md:p-2.5 transition-all rounded-full hover:bg-white/10 ${showAttachments ? "text-violet-400 rotate-90 scale-110" : "text-slate-300"}`}><span className="text-xl md:text-2xl block">📎</span></button>
            <input type="file" ref={galleryInputRef} accept="image/*,video/*" hidden onChange={handleSendFile} />
            <input type="file" ref={docInputRef} hidden onChange={handleSendFile} />
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
           {!text.trim() && !isRecordingAudio && (
             <button onClick={toggleListening} className={`relative w-13 h-13 md:w-15 md:h-15 flex items-center justify-center shrink-0 rounded-full transition-all duration-500 shadow-2xl ${isListening ? "bg-violet-500 scale-115" : "bg-white/10 border border-white/20 hover:bg-white/20"}`}>
               <span className={`text-2xl ${isListening ? "animate-pulse text-white" : "text-slate-300"}`}>🎙️</span>
             </button>
           )}
           {!text.trim() && !isListening && (
             <button onClick={isRecordingAudio ? stopRecordingAudio : startRecordingAudio} className={`relative w-13 h-13 md:w-15 md:h-15 flex items-center justify-center shrink-0 rounded-full transition-all duration-500 shadow-2xl ${isRecordingAudio ? "bg-red-500 scale-125 shadow-red-500/40" : "bg-white/10 border border-white/20 hover:bg-white/20"}`}>
               {isRecordingAudio && <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-50"></div>}
               <span className={`text-2xl ${isRecordingAudio ? "scale-115 text-white" : "text-slate-300"}`}>🎤</span>
             </button>
           )}
           {(text.trim() || isListening || isRecordingAudio) && (
             <button onClick={handleSendMessage} className="w-13 h-13 md:w-15 md:h-15 flex items-center justify-center shrink-0 bg-gradient-to-tr from-violet-500 to-indigo-600 rounded-full shadow-2xl shadow-violet-900/50 hover:scale-110 active:scale-95 transition-all animate-pop">
               <span className="text-2xl -rotate-12 translate-x-0.5">🚀</span>
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
