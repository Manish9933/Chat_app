import React, { useContext } from "react";
import { CallContext } from "../../context/CallContext";
import assets from "../assets/assets";

const VideoCall = () => {
  const {
    myVideo,
    userVideo,
    inCall,
    toggleMute,
    toggleCamera,
    endCall,
    isMuted,
    cameraOff,
  } = useContext(CallContext);

  if (!inCall) return null; // Only mount UI when in call

  return (
    <div className="
      fixed inset-0 
      bg-black/70 
      backdrop-blur-md 
      flex flex-col items-center justify-center 
      z-[9999]
      text-white
    ">
      {/* Remote Video */}
      <video
        ref={userVideo}
        autoPlay
        playsInline
        className="
          w-[90%] 
          max-w-3xl 
          rounded-xl 
          shadow-xl 
          border border-white/20
        "
      />

      {/* My Small Preview */}
      <video
        ref={myVideo}
        autoPlay
        muted
        playsInline
        className="
          absolute 
          bottom-28 
          right-6 
          w-32 
          h-48 
          object-cover 
          rounded-lg 
          border border-white/30 
          shadow-md
        "
      />

      {/* CONTROLS */}
      <div className="
        absolute 
        bottom-6 
        flex items-center gap-6
        bg-white/10 
        p-4 
        rounded-full 
        backdrop-blur-lg
        border border-white/20
      ">
        {/* Mute / Unmute */}
        <button
          onClick={toggleMute}
          className="
            w-12 h-12 
            flex items-center justify-center 
            rounded-full 
            bg-white/20 
            hover:bg-white/30 
            transition
          "
        >
          <img
            src={isMuted ? assets.mic_off_icon : assets.mic_on_icon}
            className="w-6"
          />
        </button>

        {/* Camera On / Off */}
        <button
          onClick={toggleCamera}
          className="
            w-12 h-12 
            flex items-center justify-center 
            rounded-full 
            bg-white/20 
            hover:bg-white/30 
            transition
          "
        >
          <img
            src={cameraOff ? assets.cam_off_icon : assets.cam_on_icon}
            className="w-6"
          />
        </button>

        {/* End Call */}
        <button
          onClick={endCall}
          className="
            w-14 h-14 
            flex items-center justify-center 
            rounded-full 
            bg-red-600 
            hover:bg-red-700 
            transition
          "
        >
          <img src={assets.end_call_icon} className="w-7" />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
