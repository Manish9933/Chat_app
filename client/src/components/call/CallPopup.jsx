import React, { useContext, useEffect, useRef } from "react";
import { CallContext } from "../../../context/CallContext";
import assets from "../../assets/assets";

const CallPopup = () => {
  const { incomingCall, answerCall, rejectCall } = useContext(CallContext);

  const ringtoneRef = useRef(null);

  // 🔊 Play ringtone when incoming call appears
  useEffect(() => {
    if (incomingCall) {
      // Ensure audio ref is loaded
      if (ringtoneRef.current) {
        ringtoneRef.current.currentTime = 0;
        ringtoneRef.current.play().catch(() => {});
      }
    } else {
      // Stop ringtone when popup closed
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    }
  }, [incomingCall]);

  // Popup hidden
  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col justify-center items-center text-white">

      {/* Ringtone Audio Element */}
      <audio ref={ringtoneRef} src="/ringtone.mp3" loop />

      <img
        src={incomingCall.profilePic || assets.avatar_icon}
        className="w-24 h-24 rounded-full border-2 border-white shadow-lg"
      />

      <h2 className="text-xl mt-2">{incomingCall.fromName}</h2>
      <p className="opacity-70">{incomingCall.type === "audio" ? "Audio Call" : "Video Call"}</p>

      <div className="flex gap-10 mt-8">
        {/* Reject */}
        <button
          onClick={rejectCall}
          className="w-16 h-16 bg-red-600 rounded-full flex justify-center items-center"
        >
          <img src={assets.end_call} className="w-8" />
        </button>

        {/* Answer */}
        <button
          onClick={answerCall}
          className="w-16 h-16 bg-green-600 rounded-full flex justify-center items-center"
        >
          <img src={assets.call_icon} className="w-8" />
        </button>
      </div>
    </div>
  );
};

export default CallPopup;