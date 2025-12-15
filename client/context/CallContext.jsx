import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";

export const CallContext = createContext();

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const CallProvider = ({ children }) => {
  const { socket } = useContext(AuthContext);

  // ---------- STATE ----------
  const [incomingCall, setIncomingCall] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null);
  const [callTime, setCallTime] = useState(0);

  const [isMuted, setIsMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  // ---------- REFS ----------
  const receiverId = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);

  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const remoteAudio = useRef(null);

  // RECORDING
  const recorderRef = useRef(null);
  const recordedChunks = useRef([]);

  // ---------- TIMER ----------
  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCallTime((t) => t + 1);
    }, 1000);
  };

  // ---------- CLEANUP ----------
  const cleanupCall = () => {
    clearInterval(timerRef.current);

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }

    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.oniceconnectionstatechange = null;
      peerRef.current.close();
    }

    peerRef.current = null;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    localStreamRef.current = null;
    receiverId.current = null;

    if (myVideo.current) myVideo.current.srcObject = null;
    if (userVideo.current) userVideo.current.srcObject = null;
    if (remoteAudio.current) remoteAudio.current.srcObject = null;

    setIncomingCall(null);
    setInCall(false);
    setCallType(null);
    setCallTime(0);

    setIsMuted(false);
    setCameraOff(false);
    setSpeakerOn(true);
    setIsRecording(false);
  };

  // ---------- TAB CLOSE ----------
  useEffect(() => {
    if (!socket) return;

    const handleUnload = () => {
      if (receiverId.current) {
        socket.emit("end-call", { to: receiverId.current });
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [socket]);

  // ---------- START CALL (CALLER) ----------
  const startCall = async (user, isVideo) => {
    receiverId.current = user._id;
    setCallType(isVideo ? "video" : "audio");
    setInCall(true);

    // USER ACTION → Chrome allows camera
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      video: isVideo,
      audio: true,
    });

    if (myVideo.current) {
      myVideo.current.srcObject = localStreamRef.current;
      myVideo.current.muted = true;
      myVideo.current.playsInline = true;
    }

    peerRef.current = new RTCPeerConnection(ICE_SERVERS);

    // 🔥 ADD TRACKS BEFORE OFFER (CRITICAL)
    localStreamRef.current.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, localStreamRef.current);
    });

    peerRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc-candidate", {
          to: receiverId.current,
          candidate: e.candidate,
        });
      }
    };

    peerRef.current.oniceconnectionstatechange = () => {
      const state = peerRef.current.iceConnectionState;
      if (state === "disconnected" || state === "failed") {
        endCall();
      }
    };

    peerRef.current.ontrack = (e) => {
      if (isVideo && userVideo.current) {
        userVideo.current.srcObject = e.streams[0];
        setTimeout(() => userVideo.current.play().catch(() => {}), 300);
      } else if (!isVideo && remoteAudio.current) {
        remoteAudio.current.srcObject = e.streams[0];
        remoteAudio.current.muted = false;
        setTimeout(() => remoteAudio.current.play().catch(() => {}), 300);
      }
    };

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);

    socket.emit("call-user", {
      to: receiverId.current,
      offer,
      type: isVideo ? "video" : "audio",
    });
  };

  const startAudioCall = (user) => startCall(user, false);
  const startVideoCall = (user) => startCall(user, true);

  // ---------- SOCKET EVENTS ----------
  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-call", (data) => {
      receiverId.current = data.from;
      setIncomingCall(data);
      setCallType(data.type);
    });

    socket.on("call-answered", async ({ answer }) => {
      await peerRef.current.setRemoteDescription(answer);
      startTimer();
    });

    socket.on("webrtc-candidate", async ({ candidate }) => {
      if (candidate) await peerRef.current.addIceCandidate(candidate);
    });

    socket.on("end-call", cleanupCall);
    socket.on("call-rejected", cleanupCall);

    return () => socket.removeAllListeners();
  }, [socket]);

  // ---------- ANSWER (RECEIVER) ----------
  const answerCall = async () => {
    setIncomingCall(null);
    setInCall(true);

    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      video: callType === "video",
      audio: true,
    });

    if (myVideo.current) {
      myVideo.current.srcObject = localStreamRef.current;
      myVideo.current.muted = true;
      myVideo.current.playsInline = true;
    }

    peerRef.current = new RTCPeerConnection(ICE_SERVERS);

    // 🔥 ADD TRACKS BEFORE ANSWER
    localStreamRef.current.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, localStreamRef.current);
    });

    peerRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc-candidate", {
          to: receiverId.current,
          candidate: e.candidate,
        });
      }
    };

    peerRef.current.oniceconnectionstatechange = () => {
      const state = peerRef.current.iceConnectionState;
      if (state === "disconnected" || state === "failed") {
        endCall();
      }
    };

    peerRef.current.ontrack = (e) => {
      if (callType === "video" && userVideo.current) {
        userVideo.current.srcObject = e.streams[0];
        setTimeout(() => userVideo.current.play().catch(() => {}), 300);
      } else if (callType === "audio" && remoteAudio.current) {
        remoteAudio.current.srcObject = e.streams[0];
        remoteAudio.current.muted = false;
        setTimeout(() => remoteAudio.current.play().catch(() => {}), 300);
      }
    };

    await peerRef.current.setRemoteDescription(incomingCall.offer);

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    socket.emit("answer-call", {
      to: receiverId.current,
      answer,
    });

    startTimer();
  };

  // ---------- END ----------
  const endCall = () => {
    if (receiverId.current) {
      socket.emit("end-call", { to: receiverId.current });
    }
    cleanupCall();
  };

  // ---------- CONTROLS ----------
  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCameraOff(!track.enabled);
  };

  const toggleSpeaker = () => {
    if (!remoteAudio.current) return;
    remoteAudio.current.muted = speakerOn;
    remoteAudio.current.volume = speakerOn ? 0 : 1;
    setSpeakerOn(!speakerOn);
  };

  // ---------- RECORDING ----------
  const startRecording = () => {
    if (!localStreamRef.current) return;

    recorderRef.current = new MediaRecorder(localStreamRef.current);
    recordedChunks.current = [];

    recorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.current.push(e.data);
    };

    recorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, {
        type: "audio/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "call-recording.webm";
      a.click();
      URL.revokeObjectURL(url);
    };

    recorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <CallContext.Provider
      value={{
        incomingCall,
        inCall,
        callType,
        callTime,

        startAudioCall,
        startVideoCall,
        answerCall,
        endCall,

        toggleMute,
        toggleCamera,
        toggleSpeaker,

        startRecording,
        stopRecording,
        isRecording,

        isMuted,
        cameraOff,
        speakerOn,

        myVideo,
        userVideo,
        remoteAudio,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
