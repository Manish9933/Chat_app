import React, { useContext } from "react";
import { CallContext } from "../../../context/CallContext";
import assets from "../../assets/assets";

const CallUI = () => {
  const {
    inCall,
    minimizeCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
    callType,
    myVideo,
    userVideo,
    isMuted,
    cameraOff,
    speakerOn,
    callTime,
  } = useContext(CallContext);

  if (!inCall) return null;

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  return (
    <div className="fixed inset-0 bg-black/80 text-white z-[9998] flex flex-col items-center justify-center">
      {/* Remote Video */}
      {callType === "video" ? (
        <video ref={userVideo} autoPlay playsInline className="w-full max-w-xl rounded-lg shadow-xl" />
      ) : (
        <img src={assets.avatar_icon} className="w-32 h-32 rounded-full mb-4" />
      )}

      {/* Timer */}
      <p className="text-lg mt-2 opacity-80">{formatTime(callTime)}</p>

      {/* My video preview */}
      {callType === "video" && (
        <video
          ref={myVideo}
          autoPlay
          muted
          playsInline
          className="absolute bottom-28 right-4 w-28 h-40 object-cover rounded-lg shadow-md bg-black/40"
        />
      )}

      {/* Controls */}
      <div className="flex gap-6 mt-6">
        <button onClick={toggleMute} className="bg-white/20 p-4 rounded-full">
          {isMuted ? "Unmute" : "Mute"}
        </button>

        {callType === "video" && (
          <button onClick={toggleCamera} className="bg-white/20 p-4 rounded-full">
            {cameraOff ? "Cam On" : "Cam Off"}
          </button>
        )}

        <button onClick={toggleSpeaker} className="bg-white/20 p-4 rounded-full">
          {speakerOn ? "Speaker Off" : "Speaker On"}
        </button>

        <button onClick={endCall} className="bg-red-600 p-4 rounded-full">
          End
        </button>

        <button onClick={minimizeCall} className="bg-white/20 p-4 rounded-full">
          Minimize
        </button>
      </div>
    </div>
  );
};

export default CallUI;
