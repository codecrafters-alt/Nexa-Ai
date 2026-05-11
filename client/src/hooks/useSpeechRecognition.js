import { useEffect, useRef, useState } from "react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

const createRecognition = () => {
  if (!SpeechRecognition) return null;
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;
  return recognition;
};

export const useSpeechRecognition = () => {
  const recognitionRef = useRef(null);
  const [supported, setSupported] = useState(Boolean(SpeechRecognition));
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!supported) {
      return;
    }

    const recognition = createRecognition();
    if (!recognition) {
      setSupported(false);
      return;
    }

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ");
      setTranscript(text);
    };

    recognition.onerror = (event) => {
      setError(event.error || "Speech recognition error");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [supported]);

  const start = () => {
    setError(null);
    if (!recognitionRef.current) {
      setSupported(false);
      return;
    }

    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (e) {
      setError(e.message || "Unable to start voice recognition");
      setListening(false);
    }
  };

  const stop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  const resetTranscript = () => setTranscript("");

  return {
    supported,
    listening,
    transcript,
    error,
    start,
    stop,
    resetTranscript,
  };
};
