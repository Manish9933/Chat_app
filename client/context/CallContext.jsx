import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";

export const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const { socket, authUser } = useContext(AuthContext);

  // ===============================
  // 📞 CALL STATES
  // ===============================
  const [incomingCall, setIncomingCall] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callType, setCallType] = useState(null);

  const [isMuted, setIsMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);

  const receiverId = useRef(null);

  // ===============================
  // 📸 AUDIO / VIDEO STREAM
  // ===============================
  const localStream = useRef(null);
  const myVideo = useRef(null);
  const userVideo = useRef(null);

  // ===============================
  // ⏱ CALL TIMER
  // ===============================
  const [callTime, setCallTime] = useState(0);
  const timerRef = useRef(null);

  // ===============================
  // 🔔 RINGTONES
  // ===============================
  const incomingTone = new Audio("/sounds/incoming.mp3");
  const outgoingTone = new Audio("/sounds/outgoing.mp3");

  incomingTone.loop = true;
  outgoingTone.loop = true;

  // ===============================
  // 🧩 START CALL (Audio / Video)
  // ===============================
  const startCall = async (user, isVideo) => {
    receiverId.current = user._id;

    setCallType(isVideo ? "video" : "audio");
    setInCall(true);
    setIsMinimized(false);

    // Play outgoing ringing tone
    setIsRinging(true);
    outgoingTone.play();

    // Notify receiver
    socket.emit("call-user", {
      from: authUser._id,
      fromName: authUser.fullName,
      to: user._id,
      type: isVideo ? "video" : "audio",
      profilePic: authUser.profilePic,
    });
  };

  const startAudioCall = (user) => startCall(user, false);
  const startVideoCall = (user) => startCall(user, true);

  // ===============================
  // 📥 INCOMING CALL
  // ===============================
  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-call", (data) => {
      // Stop outgoing tone if caller receives immediate callback
      outgoingTone.pause();

      receiverId.current = data.from;

      setIncomingCall(data);
      setCallType(data.type);

      // Vibrate (mobile)
      if (navigator.vibrate) navigator.vibrate(500);

      // Play ringtone
      setIsRinging(true);
      incomingTone.play();
    });

    return () => socket.off("incoming-call");
  }, [socket]);

  // ===============================
  // ✔ ANSWER CALL
  // ===============================
  const answerCall = async () => {
    setInCall(true);
    setIncomingCall(null);
    setIsMinimized(false);

    incomingTone.pause();
    outgoingTone.pause();
    setIsRinging(false);

    setCallTimerStart();

    socket.emit("answer-call", { to: receiverId.current });

    if (callType === "video") {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      myVideo.current.srcObject = localStream.current;
    }
  };

  // ===============================
  // RECEIVER ACCEPTED CALL
  // ===============================
  useEffect(() => {
    if (!socket) return;

    socket.on("call-answered", () => {
      outgoingTone.pause();
      setIsRinging(false);
      setCallTimerStart();
    });

    return () => socket.off("call-answered");
  }, [socket]);

  // ===============================
  // ❌ END CALL (Both sides)
  // ===============================
  const endCall = () => {
    socket.emit("end-call", { to: receiverId.current });

    incomingTone.pause();
    outgoingTone.pause();
    setIsRinging(false);

    stopCallTimer();

    localStream.current?.getTracks().forEach((t) => t.stop());
    myVideo.current.srcObject = null;

    setInCall(false);
    setIncomingCall(null);
    setCallType(null);
    setIsMinimized(false);

    setIsMuted(false);
    setCameraOff(false);
    setSpeakerOn(false);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("call-ended", () => endCall());

    return () => socket.off("call-ended");
  }, [socket]);

  // ===============================
  // 🎚 TOGGLES
  // ===============================
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const toggleCamera = () => {
    setCameraOff((prev) => !prev);
  };

  const toggleSpeaker = () => {
    setSpeakerOn((prev) => !prev);
  };

  const minimizeCall = () => setIsMinimized(true);
  const restoreCall = () => setIsMinimized(false);

  // ===============================
  // ⏱ TIMER HANDLING
  // ===============================
  const setCallTimerStart = () => {
    setCallTime(0);
    timerRef.current = setInterval(() => {
      setCallTime((prev) => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    clearInterval(timerRef.current);
  };

  // ===============================
  // RETURN CONTEXT
  // ===============================

  return (
    <CallContext.Provider
      value={{
        // UI State
        incomingCall,
        inCall,
        callType,
        isRinging,
        isMinimized,
        callTime,

        // Functions
        startAudioCall,
        startVideoCall,
        answerCall,
        endCall,
        minimizeCall,
        restoreCall,

        toggleMute,
        toggleCamera,
        toggleSpeaker,

        // Status
        isMuted,
        cameraOff,
        speakerOn,

        // Refs
        myVideo,
        userVideo,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
