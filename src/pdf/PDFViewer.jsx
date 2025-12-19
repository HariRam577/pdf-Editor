import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import AnnotationLayer from "../annotations/AnnotationLayer";
import CommentTool from "../annotations/CommentTool";
import SignatureTool from "../annotations/SignatureTool";
import StampTool from "../annotations/StampTool";

import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { usePDFContext } from "../context/PDFContext";

import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js?url";
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const PDFViewer = () => {
  const {
    pdfFile,
    numPages,
    setNumPages,
    currentPage,
    setCurrentPage,
    selectedTool,
    addAnnotation,
    scale,
  } = usePDFContext();

  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState(null);
  const [containerWidth, setContainerWidth] = useState(null);

  const pageRef = useRef(null);
  const containerRef = useRef(null);

  // Calculate container width for PDF scaling
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width;
        // Use 95% of container width for better fit, accounting for scale
        const baseWidth = width * 0.95;
        setContainerWidth(baseWidth);
      }
    };

    // Wait for container to render
    const timer = setTimeout(updateDimensions, 50);

    window.addEventListener("resize", updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateDimensions);
    };
  }, [pdfFile, scale]); // Re-calculate when scale changes

  const handlePageClick = (e) => {
    if (!selectedTool) return;

    // Don't open modal if clicking on annotation elements
    if (
      e.target.closest(
        ".annotation-comment, .annotation-signature, .annotation-stamp"
      )
    ) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setClickPosition({ x, y, page: currentPage });
    setModalOpen(true);
  };

  const handleAddAnnotation = (data) => {
    addAnnotation(data);
    setModalOpen(false);
  };

  const handlePageLoadSuccess = (page) => {
    setPageWidth(page.width);
    setPageHeight(page.height);
  };

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (!pdfFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-500 text-sm sm:text-base text-center">
          Upload a PDF to view
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Mobile-Responsive Toolbar */}
      <div className="bg-white border-b px-2 sm:px-4 py-2 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded disabled:opacity-50 transition-colors touch-manipulation"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <span className="text-xs sm:text-sm font-medium whitespace-nowrap px-1">
            <span className="hidden sm:inline">Page </span>
            {currentPage} / {numPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            disabled={currentPage === numPages}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded disabled:opacity-50 transition-colors touch-manipulation"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {selectedTool && (
          <span className="text-xs sm:text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
            <span className="hidden sm:inline">Tap to add </span>
            <span className="sm:hidden">+ </span>
            {selectedTool}
          </span>
        )}
      </div>

      {/* Responsive Scroll Container */}
      <div ref={containerRef} className="flex-1 overflow-auto">
        <div className="flex justify-center items-start p-2 sm:p-4">
          {containerWidth ? (
            <Document
              file={pdfFile}
              onLoadSuccess={handleDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center py-20">
                  <Loader className="animate-spin mr-2 w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-sm sm:text-base">Loading PDF...</span>
                </div>
              }
            >
              {/* PDF Page Container */}
              <div
                className="relative shadow-lg bg-white"
                onClick={handlePageClick}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                }}
              >
                <Page
                  pageNumber={currentPage}
                  width={containerWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onLoadSuccess={handlePageLoadSuccess}
                />

                <AnnotationLayer
                  pageNumber={currentPage}
                  pageWidth={pageWidth * scale}
                  pageHeight={pageHeight * scale}
                />
              </div>
            </Document>
          ) : (
            <div className="flex items-center justify-center py-20">
              <Loader className="animate-spin mr-2 w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base">Loading PDF...</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tools */}
      {selectedTool === "comment" && (
        <CommentTool
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={handleAddAnnotation}
          position={clickPosition}
        />
      )}

      {selectedTool === "signature" && (
        <SignatureTool
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={handleAddAnnotation}
          position={clickPosition}
        />
      )}

      {selectedTool === "stamp" && (
        <StampTool
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={handleAddAnnotation}
          position={clickPosition}
        />
      )}
    </div>
  );
};

export default PDFViewer;
