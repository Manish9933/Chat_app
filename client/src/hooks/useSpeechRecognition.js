import { useState } from "react";
import toast from "react-hot-toast";

/**
 * Custom hook for speech-to-text functionality.
 * Wraps the Web Speech API for voice input.
 * 
 * @param {Function} onTranscript - Callback receiving transcribed text
 * @returns {Object} Listening state and toggle function
 */
const useSpeechRecognition = (onTranscript) => {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error("Speech recognition not supported");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      let finalTranscript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
      }
      if (finalTranscript) onTranscript(finalTranscript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return { isListening, toggleListening };
};

export default useSpeechRecognition;
