import { useContext } from "react";
import { CallContext } from "../../context/CallContext";

const VideoCall = () => {
  const {callTime, inCall } =
    useContext(CallContext);

  if (!inCall) return null;

  const minutes = String(Math.floor(callTime / 60)).padStart(2, "0");
  const seconds = String(callTime % 60).padStart(2, "0");


    
};

export default VideoCall;
