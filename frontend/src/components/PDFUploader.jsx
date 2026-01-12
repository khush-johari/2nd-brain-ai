import React, { useState } from "react";
import { uploadPDF } from "../api";

const PDFUploader = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) validateAndUpload(files[0]);
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) validateAndUpload(e.target.files[0]);
  };

  const validateAndUpload = async (file) => {
    // Robust check for PDF files
    const isPdfMime = file.type === "application/pdf";
    const isPdfExt = file.name.toLowerCase().endsWith(".pdf");

    if (!isPdfMime && !isPdfExt) {
      setMessage("❌ Error: Only PDF files are allowed.");
      return;
    }

    setIsUploading(true);
    setMessage("⏳ Processing Knowledge...");

    try {
      const result = await uploadPDF(file);
      setMessage(
        `✅ Success! Added ${result.chunks_processed} chunks to memory.`
      );
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      setMessage(`❌ Failed: ${error.message || "Server Error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      // --- CHANGES HERE: Added h-full, flex, flex-col, justify-center, items-center ---
      className={`
        relative group border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden h-full flex flex-col justify-center items-center
        ${
          isDragging
            ? "border-blue-400 bg-blue-500/10 scale-[1.01] shadow-[0_0_30px_rgba(59,130,246,0.2)]"
            : "border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/50 bg-gray-900/20"
        }
      `}
    >
      {/* Hidden IP */}
      <input
        type="file"
        id="fileInput"
        accept=".pdf"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Decorative Glow Bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col items-center gap-3">
        {isUploading ? (
          <>
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-200 font-medium animate-pulse">{message}</p>
          </>
        ) : (
          <label
            htmlFor="fileInput"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="p-4 bg-gray-800/50 rounded-full mb-2 group-hover:scale-110 transition-transform duration-300 border border-gray-700 group-hover:border-blue-500/50">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-gray-200 font-semibold text-lg">
              Upload Knowledge
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Drag & drop PDF or click to browse
            </p>
          </label>
        )}

        {/* Status Message (Success/Error) */}
        {!isUploading && message && (
          <div
            className={`mt-4 px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-md border ${
              message.includes("Success")
                ? "text-green-300 bg-green-900/30 border-green-500/30"
                : "text-red-300 bg-red-900/30 border-red-500/30"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUploader;
