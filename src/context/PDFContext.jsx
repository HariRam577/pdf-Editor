import React, { createContext, useContext, useState } from "react";

const PDFContext = createContext(null);

export const usePDFContext = () => {
  const context = useContext(PDFContext);
  if (!context) {
    throw new Error("usePDFContext must be used within PDFProvider");
  }
  return context;
};

export const PDFProvider = ({ children }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [scale, setScale] = useState(1.5);

  const addAnnotation = (annotation) => {
    setAnnotations((prev) => [...prev, { ...annotation, id: Date.now() }]);
  };

  const updateAnnotation = (id, updates) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann))
    );
  };

  const deleteAnnotation = (id) => {
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
  };

  const clearAnnotations = () => {
    setAnnotations([]);
  };

  return (
    <PDFContext.Provider
      value={{
        pdfFile,
        setPdfFile,
        numPages,
        setNumPages,
        currentPage,
        setCurrentPage,
        annotations,
        addAnnotation,
        updateAnnotation,
        deleteAnnotation,
        clearAnnotations,
        selectedTool,
        setSelectedTool,
        scale,
        setScale,
      }}
    >
      {children}
    </PDFContext.Provider>
  );
};
