import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

/**
 * Custom hook for camera capture functionality.
 * Handles getUserMedia, video stream, and photo capture.
 * 
 * @param {Function} sendMessage - Function to send the captured photo
 * @returns {Object} Camera state and controls
 */
const useCamera = (sendMessage) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera stream when opened
  useEffect(() => {
    const startStream = async () => {
      if (isCameraOpen && videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
          });
          streamRef.current = stream;
          videoRef.current.srcObject = stream;
        } catch (err) {
          toast.error("Camera error");
          setIsCameraOpen(false);
        }
      }
    };
    startStream();
  }, [isCameraOpen]);

  const openCamera = () => {
    setIsCameraOpen(true);
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    sendMessage({ file: canvas.toDataURL("image/jpeg"), fileType: "image" });
    closeCamera();
  };

  return {
    isCameraOpen,
    isFlashing,
    videoRef,
    canvasRef,
    openCamera,
    closeCamera,
    capturePhoto,
  };
};

export default useCamera;
