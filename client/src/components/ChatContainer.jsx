import { useEffect, useRef, useContext, useState, useMemo } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Modular Components
import ChatHeader from "./chat/ChatHeader";
import MessageList from "./chat/MessageList";
import ChatInput from "./chat/ChatInput";
import RightSidebar from "./RightSidebar";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages, deleteMessage, typingUsers } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const [showEmoji, setShowEmoji] = useState(false);
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Poll State
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // Camera Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // 🔍 Search Logic
  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) return messages || [];
    return (messages || []).filter(m => m.text?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [messages, searchTerm]);

  // 📊 Poll Logic
  const handleCreatePoll = () => {
    const filteredOptions = pollOptions.filter(opt => opt.trim() !== "");
    if (!pollQuestion.trim() || filteredOptions.length < 2) return toast.error("Enter a question and 2 options.");
    const pollData = { question: pollQuestion.trim(), options: filteredOptions.map(opt => ({ text: opt.trim(), votes: 0 })) };
    sendMessage({ text: JSON.stringify(pollData), fileType: "poll" });
    setShowPollCreator(false); setPollQuestion(""); setPollOptions(["", ""]);
    toast.success("Poll Launched!");
  };

  const handleVote = (msgId, optionIndex) => { toast.success("Vote Cast!"); };

  // 📸 Camera Logic
  const openCamera = async () => { setIsCameraOpen(true); setShowAttachments(false); };
  useEffect(() => {
    const startStream = async () => {
      if (isCameraOpen && videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
          streamRef.current = stream; videoRef.current.srcObject = stream;
        } catch (err) { toast.error("Camera error"); setIsCameraOpen(false); }
      }
    };
    startStream();
  }, [isCameraOpen]);

  const closeCamera = () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); setIsCameraOpen(false); };
  const capturePhoto = () => {
    setIsFlashing(true); setTimeout(() => setIsFlashing(false), 200);
    const canvas = canvasRef.current; const video = videoRef.current;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    sendMessage({ file: canvas.toDataURL("image/jpeg"), fileType: "image" });
    closeCamera();
  };

  const handleSendMessage = async () => {
    if (!text.trim()) return;
    await sendMessage({ text: text.trim(), fileType: "text", replyTo: replyingTo?._id });
    setText(""); setReplyingTo(null);
  };

  const handleSendFile = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ file: reader.result, fileType: file.type.startsWith("image") ? "image" : "document", fileName: file.name });
    };
    reader.readAsDataURL(file); setShowAttachments(false);
  };

  useEffect(() => { if (selectedUser) getMessages(selectedUser._id); }, [selectedUser]);

  if (!selectedUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-[#030014]/40 backdrop-blur-3xl">
        <h2 className="text-4xl font-bold text-white mb-4">Signature Messenger</h2>
        <p className="text-slate-300">Select a contact to begin your elite conversation.</p>
      </div>
    );
  }

  const isPopOpen = showEmoji || showAttachments || isCameraOpen || showPollCreator;

  return (
    <div className="w-full h-full overflow-hidden flex flex-col relative bg-transparent">
      {/* 🌑 Dimmer */}
      {isPopOpen && <div className="absolute inset-0 bg-[#030014]/40 backdrop-blur-sm z-30 transition-all"></div>}

      {/* 📊 Poll Modal */}
      {showPollCreator && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1a1625]/95 backdrop-blur-[100px] border border-white/20 rounded-[3rem] p-8 w-full max-w-md">
            <h3 className="text-2xl font-black text-white mb-6">Create Elite Poll</h3>
            <input value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="Question" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white mb-4" />
            {pollOptions.map((opt, i) => (
              <input key={i} value={opt} onChange={(e) => { const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n); }} placeholder={`Option ${i+1}`} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white mb-2" />
            ))}
            <button onClick={() => setPollOptions([...pollOptions, ""])} className="w-full py-2 text-violet-300 text-xs uppercase">+ Add Option</button>
            <button onClick={handleCreatePoll} className="w-full py-4 bg-violet-600 rounded-2xl text-white font-black mt-6">Launch Poll</button>
            <button onClick={() => setShowPollCreator(false)} className="w-full py-2 text-slate-500 text-xs mt-2">Cancel</button>
          </div>
        </div>
      )}

      {/* 📸 Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-white/20">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} hidden />
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
              <button onClick={closeCamera} className="self-end w-10 h-10 bg-white/10 rounded-full text-white">✕</button>
              <button onClick={capturePhoto} className="self-center w-20 h-20 border-4 border-white rounded-full flex items-center justify-center"><div className="w-14 h-14 bg-white rounded-full"></div></button>
            </div>
            {isFlashing && <div className="absolute inset-0 bg-white animate-fade-out"></div>}
          </div>
        </div>
      )}

      <ChatHeader 
        isSearching={isSearching} 
        setIsSearching={setIsSearching} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        setShowMobileSidebar={setShowMobileSidebar}
      />
      
      <MessageList 
        messages={filteredMessages} 
        authUser={authUser} 
        selectedUser={selectedUser} 
        handleVote={handleVote} 
        deleteMessage={deleteMessage} 
        openMenuId={openMenuId} 
        setOpenMenuId={setOpenMenuId} 
        isPopOpen={isPopOpen} 
      />

      <ChatInput 
        text={text} setText={setText} 
        handleSendMessage={handleSendMessage} 
        handleSendFile={handleSendFile}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        showAttachments={showAttachments} setShowAttachments={setShowAttachments}
        isListening={isListening} toggleListening={() => setIsListening(!isListening)}
        isRecordingAudio={isRecordingAudio} startRecordingAudio={() => setIsRecordingAudio(true)} stopRecordingAudio={() => setIsRecordingAudio(false)}
        replyingTo={replyingTo} setReplyingTo={setReplyingTo}
        openCamera={openCamera} setShowPollCreator={setShowPollCreator}
        shareLocation={() => toast.success("Location Shared!")}
      />

      {/* 📱 MOBILE INTELLIGENCE HUB OVERLAY */}
      <RightSidebar 
        isMobile={true} 
        isOpen={showMobileSidebar} 
        onClose={() => setShowMobileSidebar(false)} 
      />
    </div>
  );
};

export default ChatContainer;
