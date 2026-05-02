import React, { useRef, useEffect } from "react";
import MessageItem from "./MessageItem";

const MessageList = ({ messages, authUser, selectedUser, handleVote, deleteMessage, openMenuId, setOpenMenuId, isPopOpen, setReplyingTo }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative transition-all duration-500 ${isPopOpen ? "blur-[2px] opacity-60 scale-[0.98]" : ""}`}>
      {/* 🌌 Luxury Chat Pattern */}
      <div className="absolute inset-0 bg-whatsapp pointer-events-none opacity-[0.05] invert brightness-200"></div>
      
      <div className="relative z-10 space-y-6 flex flex-col max-w-[1200px] mx-auto w-full">
        {messages.map((msg) => {
          const isMe = (msg.senderId === authUser?._id) || (msg.senderId?._id === authUser?._id);
          return (
            <MessageItem 
              key={msg._id} 
              msg={msg} 
              isMe={isMe} 
              selectedUser={selectedUser}
              handleVote={handleVote}
              deleteMessage={deleteMessage}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              setReplyingTo={setReplyingTo}
            />
          );
        })}
        <div ref={scrollRef}></div>
      </div>
    </div>
  );
};

export default MessageList;
