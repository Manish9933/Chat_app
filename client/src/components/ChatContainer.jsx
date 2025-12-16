import { useEffect, useRef, useContext, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../Lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { CallContext } from "../../context/CallContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);
  const { startAudioCall, startVideoCall } = useContext(CallContext);

  const scrollRef = useRef(null);
  const [input, setInput] = useState("");

  // ---------------- SEND TEXT ----------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage({ text: input.trim() });
    setInput("");
  };

  // ---------------- SEND IMAGE ----------------
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select a valid image");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  // ---------------- LOAD MESSAGES ----------------
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-white">
        <img src={assets.logo_icon} className="w-10" />
        <p className="text-lg font-medium">Chat anytime, anywhere</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/* HEADER */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          className="w-8 rounded-full"
        />

        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>

        <img
          src={assets.call_icon}
          onClick={() => startAudioCall(selectedUser)}
          className="w-6 cursor-pointer"
        />

        <img
          src={assets.video_icon}
          onClick={() => startVideoCall(selectedUser)}
          className="w-7 cursor-pointer"
        />

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          className="w-7 cursor-pointer md:hidden"
        />
      </div>

      {/* MESSAGES */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-10">
        {messages.map((msg) => {
          const isMe =
            msg.senderId === authUser._id || msg.senderId?._id === authUser._id;

          const senderName = isMe ? authUser.fullName : selectedUser.fullName;

          return (
            <div
              key={msg._id}
              className={`flex items-end gap-2 ${!isMe && "flex-row-reverse"}`}
            >
              <div className="flex flex-col">
                {/* ✅ SENDER NAME */}
                <p className="text-xs text-gray-400 mb-1">{senderName}</p>

                {msg.image ? (
                  <img
                    src={msg.image}
                    className="max-w-[230px] rounded-lg border border-gray-700"
                  />
                ) : (
                  <p
                    className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg break-all bg-violet-500/30 text-white ${
                      isMe ? "rounded-br-none" : "rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}
              </div>

              <div className="text-center text-xs">
                <img
                  src={
                    isMe
                      ? authUser.profilePic || assets.avatar_icon
                      : selectedUser.profilePic || assets.avatar_icon
                  }
                  className="w-7 rounded-full"
                />
                <p className="text-gray-500">
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={scrollRef}></div>
      </div>

      {/* INPUT */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-3">
        <div className="flex-1 flex items-center bg-gray-100/20 px-3 rounded-full">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
            placeholder="Send a message..."
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
          />

          <input
            type="file"
            id="chat-image"
            hidden
            accept="image/png, image/jpeg"
            onChange={handleSendImage}
          />

          <label htmlFor="chat-image">
            <img src={assets.gallery_icon} className="w-5 cursor-pointer" />
          </label>

          <img
            src={assets.send_button}
            onClick={handleSendMessage}
            className="w-7 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
