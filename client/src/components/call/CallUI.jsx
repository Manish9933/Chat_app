import React, { useContext } from "react";
import { CallContext } from "../../../context/CallContext";
import { ChatContext } from "../../../context/ChatContext";
import assets from "../../assets/assets";

const CallUI = () => {
  const {
    inCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
    callType,
    myVideo,
    userVideo,
    remoteAudio,
    isMuted,
    cameraOff,
    speakerOn,
    callTime,
    startRecording,
    stopRecording,
    isRecording,
  } = useContext(CallContext);

  const { selectedUser } = useContext(ChatContext);

  if (!inCall) return null;

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  return (
    <div className="fixed inset-0 bg-[#0a0a0c]/95 z-[9999] flex flex-col items-center justify-center text-white animate-fade-in font-['Outfit']">
      
      {/* 🔊 REMOTE AUDIO */}
      <audio ref={remoteAudio} autoPlay playsInline />

      {/* TOP HEADER */}
      <div className="absolute top-10 left-0 right-0 flex flex-col items-center z-20 pointer-events-none">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full flex items-center gap-3 shadow-2xl">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
          <p className="text-sm font-medium tracking-widest uppercase opacity-80">
            {callType === "video" ? "Video Call" : "Voice Call"}
          </p>
          <div className="w-[1px] h-4 bg-white/10"></div>
          <p className="text-sm font-mono text-white/60">{formatTime(callTime)}</p>
        </div>
        <h3 className="mt-6 text-2xl font-bold tracking-tight text-white/90">
          {selectedUser?.fullName || "Private Call"}
        </h3>
      </div>

      {/* VIDEO AREA */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {callType === "video" ? (
          <>
            {/* REMOTE VIDEO (Full Screen) */}
            <video
              ref={userVideo}
              autoPlay
              playsInline
              className="w-full h-full object-cover opacity-90"
            />
            
            {/* MY VIDEO (Floating Card) */}
            <div className="absolute bottom-32 right-8 w-40 h-56 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-black/50 group hover:scale-105 transition-all duration-500 z-30">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
              <video
                ref={myVideo}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${cameraOff ? "opacity-0" : "opacity-100"}`}
              />
              {cameraOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1c]">
                  <span className="text-2xl">📷</span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* AUDIO CALL VIEW */
          <div className="relative">
            <div className="absolute inset-0 bg-violet-600/20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="relative flex flex-col items-center">
              <div className="relative w-48 h-48 mb-8 p-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl">
                <img
                  src={selectedUser?.profilePic || assets.avatar_icon}
                  className="w-full h-full rounded-full object-cover"
                  alt=""
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONTROLS BAR */}
      <div className="absolute bottom-12 z-50">
        <div className="bg-white/10 backdrop-blur-3xl border border-white/10 px-8 py-5 rounded-[2.5rem] flex items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          <button 
            onClick={toggleMute}
            className={`p-4 rounded-2xl transition-all duration-300 ${isMuted ? "bg-red-500/80 text-white shadow-lg shadow-red-500/20" : "bg-white/10 hover:bg-white/20 text-white/80"}`}
          >
            <img src={isMuted ? assets.mic_off_icon : assets.mic_on_icon} className="w-6 h-6" alt="mute" />
          </button>

          {callType === "video" && (
            <button 
              onClick={toggleCamera}
              className={`p-4 rounded-2xl transition-all duration-300 ${cameraOff ? "bg-red-500/80 text-white shadow-lg shadow-red-500/20" : "bg-white/10 hover:bg-white/20 text-white/80"}`}
            >
              <img src={cameraOff ? assets.cam_off_icon : assets.cam_on_icon} className="w-6 h-6" alt="camera" />
            </button>
          )}

          <button 
            onClick={toggleSpeaker}
            className={`p-4 rounded-2xl transition-all duration-300 ${!speakerOn ? "bg-white/10 text-white/40" : "bg-white/10 hover:bg-white/20 text-white/80"}`}
          >
            <img src={speakerOn ? assets.speaker_on : assets.speaker_off} className="w-6 h-6" alt="speaker" />
          </button>

          <div className="w-[1px] h-8 bg-white/10"></div>

          <button 
            onClick={endCall}
            className="p-5 bg-red-600 hover:bg-red-500 rounded-3xl transition-all duration-300 shadow-xl shadow-red-600/30 active:scale-95"
          >
            <img src={assets.end_call} className="w-7 h-7 brightness-200" alt="end" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallUI;
