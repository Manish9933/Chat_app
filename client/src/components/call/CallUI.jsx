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
    <div className="fixed inset-0 bg-black/90 z-[9998] flex flex-col items-center justify-center text-white">

      {/* 🔊 REMOTE AUDIO */}
      <audio ref={remoteAudio} autoPlay playsInline />

      {/* AUDIO CALL UI */}
      {callType === "audio" && (
        <div className="flex flex-col items-center gap-2">

        <>
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            className="w-32 h-32 rounded-full border-4 border-white/20 mb-4"
          />
          <p className="text-lg font-medium">{selectedUser?.fullName}</p>
          <p className="text-sm opacity-70 mt-1">{formatTime(callTime)}</p>
        </>
        </div>
      )}

      {/* VIDEO CALL UI */}
      {callType === "video" && (
        <>
          <video
            ref={userVideo}
            autoPlay
            playsInline
            className="w-full bg-black/80 max-w-3xl rounded-lg shadow-xl"
          />
          <video
            ref={myVideo}
            autoPlay
            muted
            playsInline
            className="absolute bottom-28 right-6 w-32 h-44 object-cover rounded-lg border border-white/20"
          />
        </>
      )}

      {/* CONTROLS */}
      <div className="absolute bottom-10 flex gap-5 bg-black/60 px-6 py-3 rounded-full">
        <button onClick={toggleMute}>
          <img
            src={isMuted ? assets.mic_off_icon : assets.mic_on_icon}
            className="w-12 h-12 bg-white/20 p-2 rounded-full"
          />
        </button>

        {callType === "video" && (
          <button onClick={toggleCamera}>
            <img
              src={cameraOff ? assets.cam_off_icon : assets.cam_on_icon}
              className="w-12 h-12 bg-white/20 p-2 rounded-full"
            />
          </button>
        )}

        {callType === "audio" && (
          <button onClick={isRecording ? stopRecording : startRecording}>
            <img
              src={isRecording ? assets.record_off : assets.record_on}
              className="w-12 h-12 bg-white/20 p-2 rounded-full"
            />
          </button>
        )}

        <button onClick={toggleSpeaker}>
          <img
            src={speakerOn ? assets.speaker_on : assets.speaker_off}
            className="w-12 h-12 bg-white/20 p-2 rounded-full"
          />
        </button>

        <button onClick={endCall}>
          <img src={assets.end_call} className="w-14 h-14 rounded-full bg-red-600" />
        </button>
      </div>
    </div>
  );
};

export default CallUI;
