import React, { useEffect } from "react";
import { assets } from "../assets/assets";
import moment from "moment";
import Markdown from "react-markdown";
import Prism from "prismjs";

const Message = ({ message }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  return (
    <div className="mb-4">
      {message.role === "user" ? (
        <div className="flex items-end justify-end gap-3">
          <div className="flex flex-col gap-2 p-3 px-4 bg-gradient-to-br from-purple-600/30 to-blue-600/20 dark:from-purple-700/40 dark:to-blue-700/30 border border-purple-400/40 dark:border-purple-500/40 rounded-2xl rounded-tr-sm max-w-2xl backdrop-blur-sm">
            <p className="text-sm text-gray-900 dark:text-white break-words leading-relaxed">
              {message.content}
            </p>
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
          <img
            src={assets.user_icon}
            alt="user"
            className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-purple-400/30"
          />
        </div>
      ) : (
        <div className="flex items-end gap-3 mb-2">
          <div className="flex-1 flex flex-col gap-2 p-3 px-4 max-w-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/5 dark:from-blue-600/20 dark:via-purple-600/15 dark:to-blue-600/10 border border-purple-400/30 dark:border-purple-500/40 rounded-2xl rounded-tl-sm backdrop-blur-sm">
            {message.isImage ? (
              <img
                src={message.content}
                alt="generated"
                className="w-full max-w-md rounded-xl shadow-lg"
              />
            ) : (
              <div className="text-sm text-gray-900 dark:text-gray-100 reset-tw prose-sm dark:prose-invert leading-relaxed">
                <Markdown>{message.content}</Markdown>
              </div>
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 ring-2 ring-purple-400/30">
            <span className="text-xs">✨</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
