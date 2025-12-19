import React, { useMemo } from "react";
import { Document } from "react-pdf";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageThumbnail from "./PageThumbnail";
import { usePDFContext } from "../context/PDFContext";

const Sidebar = ({ isOpen, onClose, onOpen }) => {
  const { pdfFile, numPages, setNumPages } = usePDFContext();

  const pages = useMemo(
    () => Array.from({ length: numPages }, (_, i) => i + 1),
    [numPages]
  );

  if (!pdfFile) return null;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed z-40 w-64 h-full
          bg-gray-50 border-r border-gray-200
          transition-transform duration-300 ease-in-out
          top-0 lg:top-[20px]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">
              Pages ({numPages})
            </h2>

            {/* Close button (mobile only) */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded hover:bg-gray-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <Document
              file={pdfFile}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                </div>
              }
            >
              <div className="space-y-3">
                {pages.map((page) => (
                  <PageThumbnail key={page} pageNumber={page} />
                ))}
              </div>
            </Document>
          </div>
        </div>
      </aside>

      {/* Toggle Button (mobile only) */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="
            fixed z-40 bottom-4 left-4
            lg:hidden
            bg-white border border-gray-300 rounded-full p-2 shadow-md
            hover:bg-gray-50
          "
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
