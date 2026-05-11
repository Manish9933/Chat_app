import React, { useState } from "react";
import { formatMessageTime } from "../../lib/utils";
import assets from "../../assets/assets";

const MessageItem = ({ msg, isMe, selectedUser, handleVote, deleteMessage, openMenuId, setOpenMenuId, setReplyingTo, authUser, users }) => {
  const [showVotersModal, setShowVotersModal] = useState(false);
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
            ) : msg.fileType === "document" || msg.fileType === "file" ? (
              <a 
                href={msg.file} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-4 p-5 bg-white/10 backdrop-blur-3xl hover:bg-white/15 transition-all group min-w-[220px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30 group-hover:scale-110 transition-transform shadow-xl">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-black text-white truncate mb-1">{msg.fileName || "Document"}</p>
                   <p className="text-[9px] font-black uppercase tracking-widest text-violet-300/60">Open Shared Asset ➔</p>
                </div>
              </a>
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

        {/* Poll Rendering - Radio button behavior, no percentages */}
        {pollData && (
          <div className={`p-6 rounded-[2.5rem] border-2 transition-all shadow-2xl min-w-[280px] ${isMe ? "bg-white/15 border-violet-400/40" : "bg-[#1a1625]/80 backdrop-blur-3xl border-white/20 shadow-black/60"}`}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl drop-shadow-lg">📊</span>
              <p className="text-base font-black text-white tracking-tight">{pollData.question}</p>
            </div>
            <div className="space-y-3">
              {pollData.options.map((opt, i) => {
                // Check if CURRENT USER has voted for this option
                const hasVoted = opt.voters?.includes(authUser?._id);
                const voteCount = opt.voters?.length || 0;
                
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <button 
                      onClick={() => handleVote(msg._id, i)} 
                      className={`w-full relative p-4 rounded-2xl transition-all overflow-hidden group flex justify-between items-center border
                        ${hasVoted 
                          ? "bg-violet-600 border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.3)]" 
                          : "bg-white/5 hover:bg-white/10 border-white/10"
                        }`}
                    >
                      <span className={`text-xs font-bold ${hasVoted ? "text-white" : "text-slate-200"}`}>{opt.text}</span>
                      <div className="flex items-center gap-2">
                        {voteCount > 0 && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${hasVoted ? "bg-white/20 text-white" : "bg-violet-500/20 text-violet-300"}`}>
                            {voteCount} {voteCount === 1 ? "VOTE" : "VOTES"}
                          </span>
                        )}
                        {hasVoted && (
                          <span className="text-white">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
            
            {/* Poll Footer with Total Count */}
            <div 
              onClick={() => setShowVotersModal(true)}
              className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center px-1 cursor-pointer hover:bg-white/5 rounded-b-2xl transition-all"
            >
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                   {[...Array(Math.min(3, pollData.options.reduce((sum, o) => sum + (o.voters?.length || 0), 0)))].map((_, i) => (
                     <div key={i} className="w-5 h-5 rounded-full border border-[#1a1625] bg-violet-500 flex items-center justify-center text-[8px] font-bold">👤</div>
                   ))}
                </div>
                <p className="text-[10px] font-bold text-white/40 tracking-tight">
                  {pollData.options.reduce((sum, o) => sum + (o.voters?.length || 0), 0)} people voted
                </p>
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400/50">Details ➔</p>
            </div>
          </div>
        )}

        {/* 📊 Voters Details Modal */}
        {showVotersModal && pollData && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-[#030014]/60 backdrop-blur-xl animate-fade-in" onClick={() => setShowVotersModal(false)}>
            <div className="bg-[#120f26] border border-white/20 w-full max-w-sm rounded-[3rem] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-pop" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white tracking-tighter uppercase italic opacity-80">Poll Results</h3>
                <button onClick={() => setShowVotersModal(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs">✕</button>
              </div>
              
              <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                {pollData.options.map((opt, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex justify-between items-baseline">
                       <p className="text-sm font-black text-violet-300 tracking-wide uppercase italic">{opt.text}</p>
                       <p className="text-[10px] font-black text-white/40 tracking-[0.2em]">{opt.voters?.length || 0} VOTES</p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       {(opt.voters || []).length > 0 ? (
                         opt.voters.map(vId => {
                           const voter = users?.find(u => u._id === vId) || (vId === authUser?._id ? authUser : null);
                           return (
                             <div key={vId} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
                                <img src={voter?.profilePic || assets.avatar_icon} className="w-6 h-6 rounded-full object-cover" alt="" />
                                <span className="text-[11px] font-bold text-white/80">{voter?.fullName || "Mysterious Voter"}</span>
                                {vId === authUser?._id && <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest bg-violet-400/10 px-1.5 py-0.5 rounded-full ml-auto">You</span>}
                             </div>
                           );
                         })
                       ) : (
                         <p className="text-[10px] text-white/20 italic ml-2">No votes yet</p>
                       )}
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setShowVotersModal(false)}
                className="w-full mt-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl text-white font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-violet-900/40"
              >
                Close Details
              </button>
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
