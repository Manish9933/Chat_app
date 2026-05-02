import { useState, useRef } from "react";
import toast from "react-hot-toast";

/**
 * Custom hook for audio recording functionality.
 * Handles MediaRecorder API, blob creation, and base64 conversion.
 * 
 * @param {Function} sendMessage - Function to send the recorded audio
 * @returns {Object} Recording state and controls
 */
const useAudioRecorder = (sendMessage) => {
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const audioRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          sendMessage({ file: reader.result, fileType: "audio", fileName: "voice-message.webm" });
          toast.success("Voice Message Sent!");
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecordingAudio(true);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecordingAudio = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  return { isRecordingAudio, startRecordingAudio, stopRecordingAudio };
};

export default useAudioRecorder;
