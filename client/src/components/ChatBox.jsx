import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";
import { messageApi, apiUtils } from "../api/api";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

const mapMessage = (message) => {
  const role = message.sender === "user" ? "user" : "assistant";
  const timestamp =
    message.createdAt || message.updatedAt || message.timestamp || Date.now();
  const content =
    message.type === "pdf"
      ? `Uploaded PDF: ${message.fileName || message.fileUrl || "document"}`
      : message.content || "";

  return {
    ...message,
    role,
    content,
    timestamp,
  };
};

const ChatBox = () => {
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const { selectedChat, theme } = useAppContext();
  const {
    supported,
    listening,
    transcript,
    error: speechError,
    start,
    stop,
  } = useSpeechRecognition();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [file, setFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [emailConfirm, setEmailConfirm] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "files") {
      await handleUploadPdf();
    } else {
      await handleSendMessage();
    }
  };

  const appendMessages = (newMessages) => {
    setMessages((prev) => [...prev, ...newMessages.map(mapMessage)]);
  };

  const handleSendMessage = async () => {
    if (!selectedChat) {
      setStatusMessage("Please select or create a chat first.");
      return;
    }

    if (!prompt.trim()) {
      setStatusMessage("Please type a message before sending.");
      return;
    }

    setLoading(true);
    setStatusMessage("");

    try {
      const response = await messageApi.sendMessage({
        chatId: selectedChat._id,
        content: prompt,
        type: "text",
      });

      if (response.action === "confirm_email") {
        setEmailConfirm(response.data);
        if (response.messages) {
          appendMessages([
            response.messages.userMessage,
            response.messages.botMessage,
          ]);
        }
      } else if (response.data) {
        appendMessages([response.data.userMessage, response.data.botMessage]);
      }

      setPrompt("");
    } catch (error) {
      setStatusMessage(apiUtils.getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    setFile(null);
    setStatusMessage("PDF selection cleared. Add a new file to continue.");
  };

  const handleUploadPdf = async () => {
    if (!selectedChat) {
      setStatusMessage("Please select or create a chat first.");
      return;
    }

    if (!file) {
      setStatusMessage("Please select a PDF file to upload.");
      return;
    }

    setLoading(true);
    setStatusMessage("");

    const formData = new FormData();
    formData.append("chatId", selectedChat._id);
    formData.append("file", file);

    try {
      await messageApi.uploadPdf(formData);
      setStatusMessage(
        "PDF uploaded successfully. Ask questions about it now.",
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      setStatusMessage(apiUtils.getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSend = async () => {
    if (!selectedChat || !emailConfirm) {
      return;
    }

    setSendingEmail(true);
    setStatusMessage("");

    try {
      const response = await messageApi.sendEmail({
        chatId: selectedChat._id,
        ...emailConfirm,
      });

      setEmailConfirm(null);
      setStatusMessage("Email sent successfully!");

      // Refresh messages to show the success message from backend
      const messagesResponse = await messageApi.getMessages(selectedChat._id);
      setMessages((messagesResponse.data || []).map(mapMessage));

      // Clear success message after 3 seconds
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      setStatusMessage(
        `Failed to send email: ${apiUtils.getErrorMessage(error)}`,
      );
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCancelEmail = () => {
    setEmailConfirm(null);
    setStatusMessage("Email cancelled.");
    // Clear the message after 2 seconds
    setTimeout(() => setStatusMessage(""), 2000);
  };

  useEffect(() => {
    if (transcript) {
      setPrompt(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setStatusMessage("");
      try {
        const response = await messageApi.getMessages(selectedChat._id);
        setMessages((response.data || []).map(mapMessage));
      } catch (error) {
        setStatusMessage(apiUtils.getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40 ">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedChat
              ? selectedChat.title || "Chat"
              : "Welcome to Chatx Agent"}
          </h2>
          {selectedChat && (
            <p className="text-xs text-purple-400/60 dark:text-purple-400/50 mt-1">
              AI Conversation
            </p>
          )}
        </div>
        <div className="text-xs font-medium px-3 py-1 rounded-full bg-purple-500/20 dark:bg-purple-600/30 text-purple-600 dark:text-purple-300">
          {mode === "files" ? "📄 PDF Mode" : "💬 Chat Mode"}
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 mb-6 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent"
      >
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
            <img
              src={
                theme === "dark" ? assets.logo_full1 : assets.logo_full_dark1
              }
              alt=""
              className="w-full max-w-56 sm:max-w-64 opacity-80"
            />
            <div>
              <p
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-violet-600 bg-clip-text text-transparent"
                style={{
                  fontFamily:
                    "'Poppins', 'Montserrat', 'Segoe UI', 'Arial', sans-serif",
                }}
              >
                Ask anything.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                Start a conversation or upload a PDF to get started
              </p>
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-1">
            {messages.map((message, index) => (
              <Message
                key={`${message._id || index}-${message.timestamp}`}
                message={message}
              />
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-8">
            <div
              className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        )}
      </div>

      {emailConfirm && (
        <div className="space-y-4 mb-4 p-4 rounded-2xl border border-purple-400/40 bg-gradient-to-br from-purple-500/10 to-blue-500/5 dark:from-purple-600/20 dark:to-blue-600/10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Confirm Email
            </h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Review the extracted email details before sending.
          </p>
          <div className="text-sm space-y-2 p-3 rounded-lg bg-white/50 dark:bg-black/30 text-gray-700 dark:text-gray-200">
            <p>
              <strong>To:</strong>{" "}
              <span className="text-purple-600 dark:text-purple-400">
                {emailConfirm.to}
              </span>
            </p>
            <p>
              <strong>Subject:</strong>{" "}
              <span className="text-purple-600 dark:text-purple-400">
                {emailConfirm.subject}
              </span>
            </p>
            <p className="whitespace-pre-wrap mt-2 text-xs">
              {emailConfirm.message}
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              disabled={sendingEmail}
              onClick={handleEmailSend}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
            >
              {sendingEmail ? "Sending..." : "Send Email"}
            </button>
            <button
              type="button"
              onClick={handleCancelEmail}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900/30 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {(statusMessage || speechError || (!supported && mode === "text")) && (
        <div
          className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium ${
            speechError || !supported
              ? "bg-red-500/20 border border-red-400/50 text-red-700 dark:text-red-400"
              : "bg-green-500/20 border border-green-400/50 text-green-700 dark:text-green-400"
          }`}
        >
          {speechError ||
            (!supported &&
              "Voice assistant is not supported in this browser.") ||
            statusMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl backdrop-blur-xl bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 dark:from-purple-700/20 dark:via-purple-600/10 dark:to-purple-700/20 border border-purple-400/30 dark:border-purple-500/40 p-3 pl-4 flex gap-3 items-center transition-all focus-within:border-purple-400/60 dark:focus-within:border-purple-500/60"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="text-xs font-medium px-3 py-1.5 rounded-lg outline-none bg-white/20 dark:bg-white/10 text-gray-900 dark:text-white border border-white/20 dark:border-white/10 hover:bg-white/30 dark:hover:bg-white/20 transition cursor-pointer"
        >
          <option className="dark:bg-purple-900" value="text">
            💬 Text
          </option>
          <option className="dark:bg-purple-900" value="files">
            📄 Files
          </option>
        </select>
        <div className="flex-1 flex flex-col gap-2">
          <input
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            type="text"
            placeholder={
              mode === "files"
                ? file
                  ? file.name
                  : "Add a PDF file using Add Files"
                : "Ask anything..."
            }
            className="w-full text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            required={mode === "text"}
            disabled={mode === "files"}
          />
          {mode === "files" && file && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Selected file: {file.name}
              </p>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-xs text-red-500 hover:text-red-400 transition"
              >
                Remove
              </button>
            </div>
          )}
        </div>
        {mode === "files" && (
          <button
            type="button"
            onClick={handleSelectFile}
            disabled={loading}
            className="h-9 rounded-lg bg-white/10 dark:bg-white/10 border border-white/20 dark:border-white/10 text-xs font-semibold text-gray-900 dark:text-white px-3 hover:bg-white/20 dark:hover:bg-white/20 transition"
          >
            Add Files
          </button>
        )}
        {mode === "text" && (
          <button
            type="button"
            onClick={listening ? stop : start}
            disabled={loading}
            className={`h-9 w-9 flex items-center justify-center rounded-lg border transition ${
              listening
                ? "bg-red-500/30 border-red-400/50 text-red-600 dark:text-red-400"
                : "bg-white/20 dark:bg-white/10 border-white/20 dark:border-white/10 text-gray-900 dark:text-white hover:bg-white/30 dark:hover:bg-white/20"
            } disabled:opacity-50`}
            title={listening ? "Stop recording" : "Start voice input"}
          >
            {listening ? "🎙️" : "🎤"}
          </button>
        )}
        <button
          disabled={loading}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
          title={loading ? "Stop generating" : "Send message"}
        >
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className="w-5"
            alt=""
          />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
