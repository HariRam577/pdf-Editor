import React from "react";
import { Page } from "react-pdf";
import { usePDFContext } from "../context/PDFContext";

const PageThumbnail = ({ pageNumber }) => {
  const { currentPage, setCurrentPage } = usePDFContext();
  const isActive = currentPage === pageNumber;

  return (
    <div
      onClick={() => setCurrentPage(pageNumber)}
      className={`cursor-pointer mb-4 p-2 rounded-lg transition-all ${
        isActive ? "bg-blue-100 ring-2 ring-blue-500" : "hover:bg-gray-100"
      }`}
    >
      <div className="relative bg-white shadow-sm rounded overflow-hidden">
        <Page
          pageNumber={pageNumber}
          width={150}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
        <div
          className={`absolute bottom-0 left-0 right-0 text-center py-1 text-xs font-medium ${
            isActive ? "bg-blue-600 text-white" : "bg-gray-700 text-white"
          }`}
        >
          Page {pageNumber}
        </div>
      </div>
    </div>
  );
};

export default PageThumbnail;
