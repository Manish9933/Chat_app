import React, { useContext, useState, useCallback } from "react";
import { CallContext } from "../../context/CallContext";
import { ChatContext } from "../../context/ChatContext";
import assets from "../../assets/assets";

// Mobile-friendly button with real tap feedback via state
const TapButton = ({ onClick, className, children, style }) => {
  const [pressed, setPressed] = useState(false);

  const handleDown = useCallback(() => setPressed(true), []);
  const handleUp = useCallback(() => setPressed(false), []);

  return (
    <button
      onClick={onClick}
      onTouchStart={handleDown}
      onTouchEnd={(e) => { handleUp(); }}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent", ...style }}
      className={`${className} select-none transition-all duration-150 ${pressed ? "scale-90 brightness-75" : "scale-100 brightness-100"}`}
    >
      {children}
    </button>
  );
};

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
    startScreenShare,
    stopScreenShare,
    isScreenSharing,
    switchCamera,
  } = useContext(CallContext);

  const { selectedUser } = useContext(ChatContext);

  if (!inCall) return null;

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-0 md:p-6 lg:p-10 font-['Outfit'] overflow-hidden">
      {/* Global Background (Matches Home Page) */}
      <div className="absolute inset-0 bg-mesh opacity-100"></div>
      <div className="absolute inset-0 bg-whatsapp opacity-[0.05] pointer-events-none"></div>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm md:backdrop-blur-xl"></div>
      
      <div className="relative w-full h-full max-w-[1200px] max-h-[900px] md:bg-[#0b0a1a]/60 md:backdrop-blur-3xl md:rounded-[3.5rem] md:border md:border-white/10 md:shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center justify-center">
        
        {/* Massive Desktop Glows */}
        <div className="hidden md:block absolute -top-40 -left-40 w-[50rem] h-[50rem] bg-violet-600/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="hidden md:block absolute -bottom-40 -right-40 w-[50rem] h-[50rem] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse animation-delay-2000"></div>

        {/* 🔊 REMOTE AUDIO */}
        <audio ref={remoteAudio} autoPlay playsInline />
   
        {/* TOP HEADER */}
        <div className="absolute top-8 md:top-10 left-0 right-0 flex flex-col items-center z-20 pointer-events-none">
          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2.5 shadow-2xl animate-slide-down">
            <div className="relative">
               <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse opacity-40"></div>
               <div className="relative w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
            </div>
            <p className="text-[9px] font-black tracking-[0.2em] uppercase text-white/90">
              {callType === "video" ? "Secure Video" : "Secure Voice"} • LIVE
            </p>
            <div className="w-[1px] h-3 bg-white/20"></div>
            <p className="text-[10px] font-mono font-bold text-violet-300">{formatTime(callTime)}</p>
          </div>
          <h3 className="mt-2 text-2xl md:text-4xl font-black tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-pop">
            {selectedUser?.fullName || "Private Call"}
          </h3>
        </div>
   
        {/* CONTENT AREA */}
        <div className="relative w-full h-full flex items-center justify-center">
          {callType === "video" ? (
            <>
              {/* REMOTE VIDEO */}
              <div className="relative w-full h-full overflow-hidden">
                 <video
                   ref={userVideo}
                   autoPlay
                   playsInline
                   className="w-full h-full object-cover opacity-90 transition-opacity duration-1000"
                 />
                 <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
              </div>
              
              {/* MY VIDEO (Floating) */}
              <div className="absolute bottom-40 md:bottom-32 right-6 md:right-12 w-32 md:w-56 h-48 md:h-72 rounded-[2rem] md:rounded-[3rem] overflow-hidden border-2 border-white/20 shadow-2xl z-30 bg-[#0b0a1a] animate-slide-in group hover:scale-105 transition-all duration-500">
                <video
                  ref={myVideo}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${cameraOff ? "opacity-0" : "opacity-100"}`}
                />
                {cameraOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0b0a1a]">
                     <span className="text-2xl opacity-40">📷</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                   <p className="text-[8px] font-black text-white uppercase tracking-widest">Me</p>
                </div>
              </div>
            </>
          ) : (
            /* AUDIO CALL VIEW */
            <div className="relative flex flex-col items-center justify-center w-full max-w-lg">
              {/* Animated Rings */}
              <div className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] border border-violet-500/20 rounded-full animate-[ping_4s_infinite] opacity-30"></div>
              <div className="absolute w-[250px] h-[250px] md:w-[350px] md:h-[350px] border border-indigo-500/10 rounded-full animate-[pulse_3s_infinite] opacity-20"></div>
              
              <div className="relative z-10 p-1.5 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 backdrop-blur-3xl border border-white/10 shadow-[0_0_60px_rgba(139,92,246,0.25)]">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-white/10 overflow-hidden shadow-2xl">
                  <img
                    src={selectedUser?.profilePic || assets.avatar_icon}
                    className="w-full h-full rounded-full object-cover scale-105"
                    alt=""
                  />
                </div>
              </div>
              
              <div className="mt-12 px-6 py-2 bg-white/5 rounded-full border border-white/5 backdrop-blur-sm">
                 <p className="text-violet-300 text-[10px] font-black uppercase tracking-[0.4em]">End-to-End Encrypted</p>
              </div>
            </div>
          )}
        </div>
   
        {/* CONTROLS BAR */}
        <div className="absolute bottom-8 md:bottom-10 z-[60] w-full px-4 flex justify-center" style={{ touchAction: "manipulation" }}>
          <div className="bg-[#1a1a2e]/90 backdrop-blur-3xl border border-white/10 p-2 md:p-3 rounded-full flex items-center gap-2 md:gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            {/* Mute */}
            <TapButton 
              onClick={() => toggleMute()}
              className={`w-11 h-11 md:w-12 md:h-12 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full
                ${isMuted ? "bg-red-500 text-white shadow-lg shadow-red-500/40" : "bg-white/5 text-white border border-white/10"}`}
            >
              <img src={isMuted ? assets.mic_off_icon : assets.mic_on_icon} className="w-5 h-5 pointer-events-none" alt="mute" />
            </TapButton>
   
            {callType === "video" && (
              <>
                {/* Camera */}
                <TapButton 
                  onClick={() => toggleCamera()}
                  className={`w-11 h-11 md:w-12 md:h-12 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full
                    ${cameraOff ? "bg-red-500 text-white shadow-lg shadow-red-500/40" : "bg-white/5 text-white border border-white/10"}`}
                >
                  <img src={cameraOff ? assets.cam_off_icon : assets.cam_on_icon} className="w-5 h-5 pointer-events-none" alt="camera" />
                </TapButton>

                {/* Switch Camera */}
                {!isScreenSharing && (
                  <TapButton 
                    onClick={() => switchCamera()}
                    className="w-11 h-11 md:w-12 md:h-12 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none">
                      <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                  </TapButton>
                )}
              </>
            )}
   
            {/* Screen Share — Desktop Only (not supported on mobile browsers) */}
            <TapButton 
              onClick={() => isScreenSharing ? stopScreenShare() : startScreenShare()}
              className={`hidden md:flex w-12 h-12 min-w-[44px] min-h-[44px] items-center justify-center rounded-full
                ${isScreenSharing ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40" : "bg-white/5 text-white border border-white/10"}`}
            >
              <span className="text-lg pointer-events-none">🖥️</span>
            </TapButton>
   
            {/* Speaker */}
            <TapButton 
              onClick={() => toggleSpeaker()}
              className={`w-11 h-11 md:w-12 md:h-12 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full
                ${speakerOn ? "bg-violet-600/40 text-white border border-violet-500/40" : "bg-white/5 text-white/40 border border-white/10"}`}
            >
              <img src={speakerOn ? assets.speaker_on : assets.speaker_off} className="w-5 h-5 pointer-events-none" alt="speaker" />
            </TapButton>
   
            <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
   
            {/* End Call */}
            <TapButton 
              onClick={() => endCall()}
              className="w-13 h-13 md:w-14 md:h-14 min-w-[52px] min-h-[52px] flex items-center justify-center bg-red-600 rounded-full shadow-xl shadow-red-600/30"
            >
              <img src={assets.end_call} className="w-6 h-6 md:w-7 md:h-7 pointer-events-none" alt="end" />
            </TapButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallUI;
