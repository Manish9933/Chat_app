import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { CallContext } from "../../context/CallContext";
import assets from "../../assets/assets";

// Mobile-friendly button with real tap feedback
const TapButton = ({ onClick, className, children }) => {
  const [pressed, setPressed] = useState(false);
  const handleDown = useCallback(() => setPressed(true), []);
  const handleUp = useCallback(() => setPressed(false), []);

  return (
    <button
      onClick={onClick}
      onTouchStart={handleDown}
      onTouchEnd={handleUp}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
      className={`${className} select-none transition-all duration-150 ${pressed ? "scale-[0.85] brightness-75" : "scale-100 brightness-100"}`}
    >
      {children}
    </button>
  );
};

const CallPopup = () => {
  const { incomingCall, answerCall, rejectCall } = useContext(CallContext);
  const ringtoneRef = useRef(null);

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
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col justify-center items-center text-white pointer-events-auto">
      
      <audio ref={ringtoneRef} src="/ringtone.mp3" loop />

      {/* Animated rings */}
      <div className="absolute w-[200px] h-[200px] border border-white/10 rounded-full animate-[ping_3s_infinite] pointer-events-none" />
      <div className="absolute w-[260px] h-[260px] border border-white/5 rounded-full animate-[ping_4s_infinite] pointer-events-none" />

      {/* Avatar */}
      <div className="relative z-10 p-1 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-white/10 shadow-[0_0_60px_rgba(139,92,246,0.3)] pointer-events-none">
        <img
          src={incomingCall.fromProfilePic || assets.avatar_icon}
          className="w-28 h-28 rounded-full object-cover border-2 border-white/20 shadow-2xl"
          alt=""
        />
      </div>

      {/* Caller Info */}
      <h2 className="text-2xl font-black tracking-tight mt-5 pointer-events-none">{incomingCall.fromName || "Unknown"}</h2>
      <p className="text-sm text-white/50 mt-1 pointer-events-none">
        {incomingCall.type === "video" ? "📹 Incoming Video Call" : "📞 Incoming Audio Call"}
      </p>

      {/* Encrypted badge */}
      <div className="mt-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 pointer-events-none">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-violet-300/70">End-to-End Encrypted</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-16 mt-12 relative z-[100]" style={{ touchAction: "manipulation" }}>
        {/* Reject */}
        <TapButton
          onClick={() => rejectCall()}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-18 h-18 min-w-[72px] min-h-[72px] bg-red-600 rounded-full flex items-center justify-center shadow-xl shadow-red-600/40">
            <img src={assets.end_call} className="w-7 h-7 pointer-events-none" alt="reject" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400/80 pointer-events-none">Decline</span>
        </TapButton>

        {/* Accept */}
        <TapButton
          onClick={() => answerCall()}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-18 h-18 min-w-[72px] min-h-[72px] bg-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-600/40 animate-pulse">
            <img src={assets.call_icon} className="w-7 h-7 pointer-events-none" alt="accept" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-400/80 pointer-events-none">Accept</span>
        </TapButton>
      </div>
    </div>
  );
};

export default CallPopup;