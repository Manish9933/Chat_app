import React, { useRef, useEffect, useCallback } from "react";
import MessageItem from "./MessageItem";

const MessageList = ({ messages, authUser, selectedUser, users, handleVote, deleteMessage, openMenuId, setOpenMenuId, isPopOpen, setReplyingTo }) => {
  const containerRef = useRef(null);
  const prevUserIdRef = useRef(null);
  const prevMsgCountRef = useRef(0);

  // Scroll to bottom helper — uses the container's own scrollTop, 
  // NOT scrollIntoView which can cause page-level scroll jumps
  const scrollToBottom = useCallback((instant = false) => {
    const el = containerRef.current;
    if (!el) return;
    
    if (instant) {
      // Instant scroll (chat switch) — no animation, no layout shift
      el.scrollTop = el.scrollHeight;
    } else {
      // Smooth scroll (new message) — animate only within the container
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, []);

  // Check if user is near the bottom (within 150px)
  const isNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    return (el.scrollHeight - el.scrollTop - el.clientHeight) < 150;
  }, []);

  // CHAT SWITCH: Instantly jump to bottom after messages load
  useEffect(() => {
    const currentUserId = selectedUser?._id;

    if (currentUserId !== prevUserIdRef.current) {
      // Chat changed — wait for DOM to paint new messages, then snap to bottom
      prevUserIdRef.current = currentUserId;
      prevMsgCountRef.current = messages.length;

      // Use double-rAF to ensure the browser has fully rendered messages
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom(true); // instant, no smooth animation
        });
      });
      return;
    }

    // SAME CHAT: New message arrived
    if (messages.length > prevMsgCountRef.current) {
      const wasNearBottom = isNearBottom();
      prevMsgCountRef.current = messages.length;

      if (wasNearBottom) {
        // User was reading latest messages — smoothly scroll to new one
        requestAnimationFrame(() => {
          scrollToBottom(false);
        });
      }
      // If user scrolled up to read history, don't auto-scroll
    }

    prevMsgCountRef.current = messages.length;
  }, [messages, selectedUser?._id, scrollToBottom, isNearBottom]);

  return (
    <div 
      ref={containerRef}
      className={`flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-6 relative transition-all duration-500 ${isPopOpen ? "blur-[2px] opacity-60 scale-[0.98]" : ""}`}
    >
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
              authUser={authUser}
              users={users}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MessageList;
