import React, { useContext, useEffect, useRef } from "react";
import { CallContext } from "../../context/CallContext";
import assets from "../../assets/assets";

const CallPopup = () => {
  const { incomingCall, answerCall, rejectCall } = useContext(CallContext);
  const ringtoneRef = useRef(null);

  // Play ringtone when incoming call appears
  useEffect(() => {
    if (incomingCall) {
      if (ringtoneRef.current) {
        ringtoneRef.current.currentTime = 0;
        ringtoneRef.current.play().catch(() => {});
      }
    } else {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    }
  }, [incomingCall]);

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col justify-center items-center text-white animate-fade-in">
      
      {/* Ringtone */}
      <audio ref={ringtoneRef} src="/ringtone.mp3" loop />

      {/* Animated rings */}
      <div className="absolute w-[200px] h-[200px] border border-white/10 rounded-full animate-[ping_3s_infinite]" />
      <div className="absolute w-[260px] h-[260px] border border-white/5 rounded-full animate-[ping_4s_infinite]" />

      {/* Avatar */}
      <div className="relative z-10 p-1 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-white/10 shadow-[0_0_60px_rgba(139,92,246,0.3)] animate-pop">
        <img
          src={incomingCall.profilePic || assets.avatar_icon}
          className="w-28 h-28 rounded-full object-cover border-2 border-white/20 shadow-2xl"
          alt=""
        />
      </div>

      {/* Caller Info */}
      <h2 className="text-2xl font-black tracking-tight mt-5 animate-slide-down">{incomingCall.fromName || "Unknown"}</h2>
      <p className="text-sm text-white/50 mt-1 animate-slide-down">
        {incomingCall.type === "video" ? "📹 Incoming Video Call" : "📞 Incoming Audio Call"}
      </p>

      {/* Encrypted badge */}
      <div className="mt-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 animate-slide-down">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-violet-300/70">End-to-End Encrypted</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-16 mt-12 animate-pop pointer-events-auto">
        {/* Reject */}
        <button
          onClick={() => rejectCall()}
          className="group flex flex-col items-center gap-3"
        >
          <div className="w-16 h-16 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-xl shadow-red-600/40 transition-all duration-300 active:scale-75 hover:scale-110 group-hover:shadow-red-500/60 ring-2 ring-red-400/0 group-hover:ring-red-400/40">
            <img src={assets.end_call} className="w-7 h-7 group-hover:rotate-90 transition-transform duration-500" alt="reject" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400/80">Decline</span>
        </button>

        {/* Accept */}
        <button
          onClick={() => answerCall()}
          className="group flex flex-col items-center gap-3"
        >
          <div className="w-16 h-16 bg-green-600 hover:bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-600/40 transition-all duration-300 active:scale-75 hover:scale-110 group-hover:shadow-green-500/60 ring-2 ring-green-400/0 group-hover:ring-green-400/40 animate-pulse">
            <img src={assets.call_icon} className="w-7 h-7 group-hover:-rotate-12 transition-transform duration-300" alt="accept" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-400/80">Accept</span>
        </button>
      </div>
    </div>
  );
};

export default CallPopup;