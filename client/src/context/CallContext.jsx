import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";
import api from "../lib/api";
import toast from "react-hot-toast";

export const CallContext = createContext();

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const CallProvider = ({ children }) => {
  const { socket, authUser } = useContext(AuthContext);

  // State
  const [incomingCall, setIncomingCall] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null);
  const [callTime, setCallTime] = useState(0);
  const [remoteUser, setRemoteUser] = useState(null);

  const [isMuted, setIsMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  // Refs
  const receiverId = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);
  const callStartedRef = useRef(false); // Track if the call was actually connected
  const isCallerRef = useRef(false);    // Track if this user initiated the call

  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const remoteAudio = useRef(null);

  // Recording
  const recorderRef = useRef(null);
  const recordedChunks = useRef([]);

  // Timer
  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCallTime((t) => t + 1);
    }, 1000);
  };

  // 🔐 Save encrypted call log to database
  const saveCallLog = async (status) => {
    try {
      if (!receiverId.current || !authUser?._id) return;

      const logData = {
        callerId: isCallerRef.current ? authUser._id : receiverId.current,
        receiverId: isCallerRef.current ? receiverId.current : authUser._id,
        type: callType || "audio",
        status: status || "ended",
        duration: callTime,
      };

      await api.post("/api/calls/log", logData);
    } catch (err) {
      // Log failure (silent in UI)
    }
  };

  // Cleanup
  const cleanupCall = (skipLog = false) => {
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
    callStartedRef.current = false;
    isCallerRef.current = false;

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
    setRemoteUser(null);
  };

  // Handle tab close
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

  // Start Call (Caller)
  const startCall = async (user, isVideo) => {
    receiverId.current = user._id;
    isCallerRef.current = true;
    setCallType(isVideo ? "video" : "audio");
    setInCall(true);
    setRemoteUser(user);

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
      fromName: authUser.fullName,
      fromProfilePic: authUser.profilePic,
    });
  };

  const startAudioCall = (user) => startCall(user, false);
  const startVideoCall = (user) => startCall(user, true);

  // Socket Events
  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-call", (data) => {
      receiverId.current = data.from;
      setIncomingCall(data);
      setCallType(data.type);
      setRemoteUser({
        _id: data.from,
        fullName: data.fromName,
        profilePic: data.fromProfilePic,
      });
    });

    socket.on("call-answered", async ({ answer }) => {
      await peerRef.current.setRemoteDescription(answer);
      callStartedRef.current = true;
      startTimer();
    });

    socket.on("webrtc-candidate", async ({ candidate }) => {
      if (candidate) await peerRef.current.addIceCandidate(candidate);
    });

    socket.on("end-call", async () => {
      // 🔐 Save call log before cleanup (call was connected and ended normally)
      if (callStartedRef.current) {
        await saveCallLog("ended");
      }
      cleanupCall();
    });

    socket.on("call-rejected", async () => {
      // 🔐 Save as missed/rejected call
      await saveCallLog("missed");
      cleanupCall();
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("webrtc-candidate");
      socket.off("end-call");
      socket.off("call-rejected");
    };
  }, [socket]);

  // Answer Call (Receiver)
  const answerCall = async () => {
    setIncomingCall(null);
    setInCall(true);
    isCallerRef.current = false;
    callStartedRef.current = true;

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

  // End Call
  const endCall = async () => {
    console.log("Ending call...");
    // 🔐 Save call log before cleanup
    if (callStartedRef.current) {
      await saveCallLog("ended");
    } else if (isCallerRef.current) {
      // Caller hung up before the other person answered
      await saveCallLog("missed");
    }

    if (receiverId.current) {
      socket.emit("end-call", { to: receiverId.current });
    }
    cleanupCall();
  };

  // Reject Incoming Call
  const rejectCall = async () => {
    // 🔐 Save as missed call from receiver's perspective
    await saveCallLog("missed");

    if (receiverId.current) {
      socket.emit("reject-call", { to: receiverId.current });
    }
    cleanupCall();
  };

  // Controls
  const toggleMute = () => {
    console.log("Toggling mute...");
    if (!localStreamRef.current) {
      console.log("localStreamRef.current is null!");
      return;
    }
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
      console.log("Mute state:", !audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    console.log("Toggling camera...");
    if (!localStreamRef.current) {
      console.log("localStreamRef.current is null!");
      return;
    }
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraOff(!videoTrack.enabled);
      console.log("Camera off state:", !videoTrack.enabled);
    }
  };

  const toggleSpeaker = () => {
    console.log("Toggling speaker...");
    if (!remoteAudio.current) {
      console.log("remoteAudio.current is null!");
      return;
    }
    const isCurrentlyMuted = remoteAudio.current.muted;
    remoteAudio.current.muted = !isCurrentlyMuted;
    remoteAudio.current.volume = !isCurrentlyMuted ? 0 : 1;
    setSpeakerOn(isCurrentlyMuted); // If it was muted, speaker is now ON
    console.log("Speaker is now:", isCurrentlyMuted ? "ON" : "OFF");
  };

  // Recording
  const startRecording = () => {
    if (!localStreamRef.current) return;
    recorderRef.current = new MediaRecorder(localStreamRef.current);
    recordedChunks.current = [];
    recorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.current.push(e.data); };
    recorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "call-recording.webm"; a.click();
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

  // Screen Sharing
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenStreamRef = useRef(null);

  const startScreenShare = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error("Screen sharing is not supported on this device/browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false 
      });
      screenStreamRef.current = stream;
      const videoTrack = stream.getVideoTracks()[0];
      if (peerRef.current) {
        const sender = peerRef.current.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(videoTrack);
      }
      if (myVideo.current) myVideo.current.srcObject = stream;
      videoTrack.onended = () => stopScreenShare();
      setIsScreenSharing(true);
      toast.success("Screen sharing started");
    } catch (err) { 
      console.error("Screen share error:", err);
      if (err.name !== "NotAllowedError") {
        toast.error("Failed to start screen sharing");
      }
    }
  };

  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
    if (peerRef.current && cameraTrack) {
      const sender = peerRef.current.getSenders().find((s) => s.track?.kind === "video");
      if (sender) sender.replaceTrack(cameraTrack);
    }
    if (myVideo.current) myVideo.current.srcObject = localStreamRef.current;
    setIsScreenSharing(false);
  };

  // Camera Switching (Mobile)
  const [facingMode, setFacingMode] = useState("user");

  const switchCamera = async () => {
    if (!localStreamRef.current || isScreenSharing) return;
    const newMode = facingMode === "user" ? "environment" : "user";

    try {
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) oldVideoTrack.stop();

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newMode },
        audio: true,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];

      if (peerRef.current) {
        const sender = peerRef.current.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(newVideoTrack);
      }

      localStreamRef.current = newStream;
      if (myVideo.current) myVideo.current.srcObject = newStream;

      setFacingMode(newMode);
    } catch (err) {
      console.error("Camera switch error:", err);
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
        rejectCall,

        toggleMute,
        toggleCamera,
        toggleSpeaker,
        switchCamera,
        facingMode,
        remoteUser,

        startScreenShare,
        stopScreenShare,
        isScreenSharing,

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
