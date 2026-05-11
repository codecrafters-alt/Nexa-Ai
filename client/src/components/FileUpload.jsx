import React, { useRef } from "react";
import { assets } from "../assets/assets";

const FileUpload = ({ file, onFileChange, loading }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile?.type === "application/pdf") {
      onFileChange(droppedFile);
    }
  };

  return (
    <div className="mb-4 space-y-3">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className="relative rounded-2xl border-2 border-dashed border-purple-400/40 bg-gradient-to-br from-purple-500/5 via-purple-400/5 to-transparent dark:from-purple-600/10 dark:via-purple-500/5 dark:to-transparent p-6 cursor-pointer transition-all duration-300 hover:border-purple-400/60 hover:bg-purple-500/8"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          className="hidden"
          disabled={loading}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          {!file ? (
            <>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400/20 to-blue-400/20 dark:from-purple-500/30 dark:to-blue-500/30">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Drop PDF here or click to browse
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum file size: 50MB
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-400/20 dark:from-green-500/30 dark:to-emerald-500/30">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {file && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onFileChange(null)}
            disabled={loading}
            className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition disabled:opacity-50"
          >
            Change File
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
