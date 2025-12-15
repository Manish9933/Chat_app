// import React, { useContext } from "react";
// import { CallContext } from "../../context/CallContext";

// const FloatingCallBar = () => {
//   const {
//     isMinimized,
//     restoreCall,
//     endCall,
//     callTime,
//     callType,
//   } = useContext(CallContext);

//   if (!isMinimized) return null;

//   const formatTime = (s) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
//       2,
//       "0"
//     )}`;

//   return (
//     <div className="fixed bottom-4 left-1/2 -translate-x-1/2 
//       bg-black/70 text-white px-6 py-3 rounded-full shadow-lg 
//       flex items-center gap-4 z-[9999] cursor-pointer"
//       onClick={restoreCall}
//     >
//       <span>{callType === "video" ? "📹" : "📞"} Call</span>
//       <span className="text-sm opacity-80">{formatTime(callTime)}</span>

//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           endCall();
//         }}
//         className="bg-red-600 px-3 py-1 rounded-full text-sm"
//       >
//         End 
//       </button>
//     </div>
//   );
// };

// export default FloatingCallBar;
