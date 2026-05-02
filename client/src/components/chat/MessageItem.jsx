import React from "react";
import { formatMessageTime } from "../../lib/utils";
import assets from "../../assets/assets";

const MessageItem = ({ msg, isMe, selectedUser, handleVote, deleteMessage, openMenuId, setOpenMenuId, setReplyingTo }) => {
  let pollData = null;
  if (msg.fileType === "poll") {
    try { pollData = JSON.parse(msg.text); } catch (e) { pollData = null; }
  }

  const repliedMsg = msg.replyTo; // Assume it's populated or we find it in parent

  return (
    <div id={msg._id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}>
      {!isMe && (
        <img 
          src={selectedUser?.profilePic || assets.avatar_icon} 
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
               <button 
                 onClick={() => { setReplyingTo(msg); setOpenMenuId(null); }} 
                 className="w-full px-4 py-3.5 text-left text-[10px] font-black text-violet-300 hover:bg-white/10 flex items-center gap-3 tracking-widest"
               >
                 ↳ REPLY
               </button>
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

        {/* Location Rendering */}
        {msg.fileType === "location" && msg.text && (() => {
          try {
            const parts = msg.text.split("|");
            const coordText = (parts[0] || "").replace("📍 ", "").trim();
            const coords = coordText.split(",").map(s => s.trim());
            if (coords.length < 2 || !coords[0] || !coords[1]) return null;
            const [lat, lng] = coords;
            const mapUrl = parts[1] || `https://www.google.com/maps?q=${lat},${lng}`;
            return (
              <a href={mapUrl} target="_blank" rel="noopener noreferrer"
                className={`block mb-2 rounded-[24px] overflow-hidden border-2 shadow-2xl cursor-pointer ${isMe ? "border-violet-400/40" : "border-white/20"}`}>
                <div className="relative w-[260px] md:w-[280px] h-[140px] md:h-[160px] bg-[#1a1625]">
                  <img 
                    src={`https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=560x320&markers=${lat},${lng},red-pushpin`}
                    className="w-full h-full object-cover" alt="map" 
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">📍</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Location Shared</span>
                    </div>
                    <p className="text-[11px] font-bold text-white/90">{lat}, {lng}</p>
                    <p className="text-[9px] text-white/40 mt-1">Tap to open in Maps</p>
                  </div>
                </div>
              </a>
            );
          } catch { return null; }
        })()}

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

        {/* Integrated Bubble with Reply */}
        <div className={`relative group max-w-full ${isMe ? "items-end" : "items-start"}`}>
          <div className={`overflow-hidden shadow-2xl transition-all duration-300 ${isMe ? "bg-gradient-to-tr from-violet-600 to-indigo-700 text-white rounded-[22px] rounded-br-[4px] border border-violet-400/30" : "bg-white/10 backdrop-blur-3xl text-white rounded-[22px] rounded-bl-[4px] border border-white/20 shadow-black/40"}`}>
            
            {/* Reply Preview (Internal) */}
            {msg.replyTo && (
              <div 
                className={`mx-2 mt-2 mb-1 p-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition-all hover:bg-white/5 border-l-[3px] border-violet-400 bg-black/20`}
                onClick={() => {
                  const element = document.getElementById(msg.replyTo._id);
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-violet-300 opacity-80 mb-0.5">Original Message</p>
                  <p className="text-[11px] text-white/70 line-clamp-1 font-medium italic leading-tight">
                    {msg.replyTo.text || "Shared Media"}
                  </p>
                </div>
              </div>
            )}

            {/* Main Text Content */}
            {msg.text && msg.fileType !== "poll" && msg.fileType !== "location" && (
              <div className="px-5 py-3.5 text-[15px] leading-relaxed break-words font-medium">
                {msg.text}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1.5 px-2 transition-opacity">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.createdAt ? formatMessageTime(msg.createdAt) : "now"}</p>
          {isMe && (
            <div className="flex items-center">
              {msg.seen ? (
                <svg width="18" height="15" viewBox="0 0 30 24" fill="none" className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">
                  <path d="M2 12L7 17L18 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 17L26 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-white/30">
                  <path d="M4 12L9 17L20 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
