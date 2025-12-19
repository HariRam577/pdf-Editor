import React, { useRef } from "react";
import {
  Upload,
  MessageSquare,
  PenTool,
  Stamp,
  Download,
  ZoomIn,
  ZoomOut,
  Trash2,
} from "lucide-react";

import { usePDFContext } from "../context/PDFContext";
import { useAuth } from "../context/AuthContext";
import { savePDFWithAnnotations } from "../utils/pdfUtils";

const Toolbar = () => {
  const fileInputRef = useRef(null);

  const {
    pdfFile,
    setPdfFile,
    selectedTool,
    setSelectedTool,
    annotations,
    clearAnnotations,
    scale,
    setScale,
    numPages,
  } = usePDFContext();

  const { logout } = useAuth();

  // ✅ Upload PDF & RESET zoom to 100%
  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      clearAnnotations();

      // 🔥 Force initial zoom to 100%
      setScale(1);
    }
  };

  // ✅ Save PDF
  const handleSave = async () => {
    if (!pdfFile || annotations.length === 0) {
      alert("No annotations to save");
      return;
    }

    try {
      await savePDFWithAnnotations(pdfFile, annotations, numPages, scale);
      alert("PDF saved successfully!");
    } catch (error) {
      console.error("Error saving PDF:", error);
      alert("Failed to save PDF");
    }
  };

  const tools = [
    { id: "comment", icon: MessageSquare, label: "Comment" },
    { id: "signature", icon: PenTool, label: "Signature" },
    { id: "stamp", icon: Stamp, label: "Stamp" },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          {/* LEFT: Upload + Tools */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF</span>
            </button>

            {pdfFile && (
              <div className="flex flex-wrap items-center gap-2">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() =>
                      setSelectedTool(selectedTool === tool.id ? null : tool.id)
                    }
                    className={`flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                      selectedTool === tool.id
                        ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <tool.icon className="w-4 h-4" />
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Zoom + Clear + Save */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {pdfFile && (
              <>
                {/* 🔍 Zoom Controls */}
                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                  <button
                    onClick={() =>
                      setScale((prev) => Math.max(0.5, prev - 0.1))
                    }
                    className="p-2 hover:bg-gray-100 rounded-l-lg"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <span className="text-xs sm:text-sm font-medium px-2 min-w-[3rem] text-center">
                    {Math.round(scale * 100)}%
                  </span>

                  <button
                    onClick={() => setScale((prev) => Math.min(3, prev + 0.1))}
                    className="p-2 hover:bg-gray-100 rounded-r-lg"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* 🗑 Clear Annotations */}
                <button
                  onClick={() => {
                    if (window.confirm("Clear all annotations?")) {
                      clearAnnotations();
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                  title="Clear All"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* 💾 Save PDF */}
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Save PDF</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
