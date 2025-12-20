import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
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
  const [baseWidth, setBaseWidth] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setBaseWidth(containerRef.current.offsetWidth * 0.95);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [pdfFile]);

  const handlePageClick = (e) => {
    if (!selectedTool) return;

    if (
      e.target.closest(
        ".annotation-comment, .annotation-signature, .annotation-stamp"
      )
    )
      return;

    const rect = e.currentTarget.getBoundingClientRect();

    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setClickPosition({ x, y, page: currentPage });
    setModalOpen(true);
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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        Upload a PDF
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b px-3 py-2 flex items-center gap-3">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-sm font-medium">
          {currentPage} / {numPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
          disabled={currentPage === numPages}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="ml-auto text-sm font-medium text-gray-600">
          Zoom: {Math.round(scale * 100)}%
        </div>
      </div>

      {/* PDF */}
      <div ref={containerRef} className="flex-1 overflow-auto">
        <div className="flex justify-center p-4">
          {baseWidth && (
            <Document
              file={pdfFile}
              onLoadSuccess={handleDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center p-8">
                  <Loader className="animate-spin w-8 h-8 text-blue-600" />
                </div>
              }
            >
              <div
                className="relative bg-white shadow-lg"
                onClick={handlePageClick}
              >
                <Page
                  pageNumber={currentPage}
                  width={baseWidth * scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onLoadSuccess={handlePageLoadSuccess}
                />

                <AnnotationLayer
                  pageNumber={currentPage}
                  pageWidth={pageWidth}
                  pageHeight={pageHeight}
                  scale={scale}
                />
              </div>
            </Document>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedTool === "comment" && (
        <CommentTool
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={addAnnotation}
          position={clickPosition}
        />
      )}

      {selectedTool === "signature" && (
        <SignatureTool
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={addAnnotation}
          position={clickPosition}
        />
      )}

      {selectedTool === "stamp" && (
        <StampTool
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={addAnnotation}
          position={clickPosition}
        />
      )}
    </div>
  );
};

export default PDFViewer;
