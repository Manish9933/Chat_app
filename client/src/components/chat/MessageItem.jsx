import React from "react";
import { formatMessageTime } from "../../lib/utils";

const MessageItem = ({ msg, isMe, selectedUser, handleVote, deleteMessage, openMenuId, setOpenMenuId }) => {
  let pollData = null;
  if (msg.fileType === "poll") {
    try { pollData = JSON.parse(msg.text); } catch (e) { pollData = null; }
  }

  const repliedMsg = msg.replyTo; // Assume it's populated or we find it in parent

  return (
    <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}>
      {!isMe && (
        <img 
          src={selectedUser?.profilePic || "/avatar.png"} 
          className="w-8 h-8 rounded-full object-cover border-2 border-white/20 mb-6 shadow-lg" 
          alt="" 
        />
      )}
      
      <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? "items-end" : "items-start"} group relative`}>
        
        {/* Menu Toggle */}
        <div className={`absolute top-0 ${isMe ? "-left-11" : "-right-11"} opacity-0 group-hover:opacity-100 transition-opacity z-30`}>
           <button 
             onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === msg._id ? null : msg._id); }} 
             className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all active:scale-90 shadow-xl"
           >
             <span className="text-white text-xl">⋮</span>
           </button>
           {openMenuId === msg._id && (
             <div className={`absolute top-11 ${isMe ? "left-0" : "right-0"} w-40 bg-[#1a1625]/95 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-pop z-50`} onClick={(e) => e.stopPropagation()}>
               <button className="w-full px-4 py-3.5 text-left text-[10px] font-black text-violet-300 hover:bg-white/10 flex items-center gap-3 tracking-widest">↳ REPLY</button>
               {isMe && (
                 <button 
                   onClick={() => deleteMessage(msg._id)} 
                   className="w-full px-4 py-3.5 text-left text-[10px] font-black text-red-400 hover:bg-red-500/20 flex items-center gap-3 tracking-widest"
                 >
                   🗑️ DELETE
                 </button>
               )}
             </div>
           )}
        </div>

        {/* Media Rendering */}
        {(msg.file || msg.image) && (
          <div className={`mb-2 rounded-[24px] overflow-hidden border-2 transition-all shadow-2xl ${isMe ? "border-violet-400/40" : "border-white/20"}`}>
            {msg.fileType === "video" ? (
              <video src={msg.file} controls className="max-w-full max-h-[300px] object-cover" />
            ) : msg.fileType === "audio" ? (
              <div className="flex items-center gap-3 p-5 bg-white/10 backdrop-blur-2xl">
                <div className="w-12 h-12 rounded-full bg-violet-500/30 flex items-center justify-center text-white text-xl">🎵</div>
                <audio src={msg.file} controls className="h-9 w-44 md:w-64" />
              </div>
            ) : (
              <img 
                src={msg.file || msg.image} 
                className="max-w-full max-h-[450px] object-cover cursor-pointer hover:scale-[1.02] transition-transform" 
                alt="shared" 
                onClick={() => window.open(msg.file || msg.image, "_blank")} 
              />
            )}
          </div>
        )}

        {/* Poll Rendering */}
        {pollData && (
          <div className={`p-6 rounded-[2.5rem] border-2 transition-all shadow-2xl min-w-[280px] ${isMe ? "bg-white/15 border-violet-400/40" : "bg-[#1a1625]/80 backdrop-blur-3xl border-white/20 shadow-black/60"}`}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl drop-shadow-lg">📊</span>
              <p className="text-base font-black text-white tracking-tight">{pollData.question}</p>
            </div>
            <div className="space-y-3">
              {pollData.options.map((opt, i) => {
                const totalVotes = pollData.options.reduce((sum, o) => sum + (o.votes || 0), 0);
                const percentage = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
                return (
                  <button key={i} onClick={() => handleVote(msg._id, i)} className="w-full relative p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all overflow-hidden group">
                    <div className="absolute inset-0 bg-violet-500/20 origin-left transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                    <div className="relative z-10 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-200">{opt.text}</span>
                      <span className="text-[10px] font-black text-violet-300 uppercase tracking-widest">{percentage}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Text Message */}
        {msg.text && msg.fileType !== "poll" && (
          <div className={`px-5 py-3 text-[15px] leading-relaxed break-words shadow-2xl transition-all duration-300 ${isMe ? "bg-gradient-to-tr from-violet-500 to-indigo-600 text-white rounded-[26px] rounded-br-[4px] border border-violet-300/30" : "bg-white/15 backdrop-blur-2xl text-white rounded-[26px] rounded-bl-[4px] border border-white/25 shadow-black/50"}`}>
            {msg.text}
          </div>
        )}

        <div className="flex items-center gap-2 mt-1.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.createdAt ? formatMessageTime(msg.createdAt) : "now"}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
