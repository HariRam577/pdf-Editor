import React, { useState } from "react";
import { Trash2, Move } from "lucide-react";
import { usePDFContext } from "../context/PDFContext";

const AnnotationLayer = ({ pageNumber, pageWidth, pageHeight }) => {
  const { annotations, updateAnnotation, deleteAnnotation, scale } =
    usePDFContext();
  const [draggedId, setDraggedId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const pageAnnotations = annotations.filter(
    (ann) => ann.position.page === pageNumber
  );

  // Handle both mouse and touch events
  const handleStartDrag = (e, annotation) => {
    // Prevent if clicking delete button
    if (e.target.closest(".delete-btn")) return;

    e.preventDefault();

    setDraggedId(annotation.id);
    const rect = e.currentTarget.getBoundingClientRect();

    // Handle both touch and mouse events
    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  const handleDragMove = (e) => {
    if (!draggedId) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();

    // Handle both touch and mouse events
    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

    let x = clientX - rect.left - dragOffset.x;
    let y = clientY - rect.top - dragOffset.y;

    // Clamp to boundaries with responsive sizing
    const minWidth = window.innerWidth < 640 ? 100 : 120;
    const minHeight = window.innerWidth < 640 ? 40 : 60;

    const maxX = Math.max(0, pageWidth - minWidth);
    const maxY = Math.max(0, pageHeight - minHeight);

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    const current = annotations.find((a) => a.id === draggedId);
    if (!current) return;

    updateAnnotation(draggedId, {
      position: {
        ...current.position,
        x,
        y,
      },
    });
  };

  const handleEndDrag = () => {
    setDraggedId(null);
  };

  const renderAnnotation = (annotation) => {
    const { id, type, position } = annotation;

    // Responsive sizing based on screen width
    const isMobile = window.innerWidth < 640;
    const deleteButtonSize = isMobile ? "w-3 h-3" : "w-4 h-4";
    const moveIconSize = isMobile ? "w-2.5 h-2.5" : "w-3 h-3";

    if (type === "comment") {
      return (
        <div
          key={id}
          className="absolute annotation-comment select-none px-2 py-1 rounded cursor-move touch-none"
          style={{
            left: position.x,
            top: position.y,
            backgroundColor: annotation.bgColor,
            color: annotation.color,
            fontFamily: annotation.fontFamily,
            fontSize: `${annotation.fontSize * (isMobile ? 0.85 : 1)}px`,
            maxWidth: isMobile ? "180px" : "220px",
          }}
          onMouseDown={(e) => handleStartDrag(e, annotation)}
          onTouchStart={(e) => handleStartDrag(e, annotation)}
        >
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <div className="flex-1 break-words text-xs sm:text-sm">
              {annotation.text}
            </div>
            <button
              type="button"
              className="delete-btn text-red-600 hover:text-red-800 flex-shrink-0 p-0.5 touch-manipulation"
              onClick={() => deleteAnnotation(id)}
            >
              <Trash2 className={deleteButtonSize} />
            </button>
          </div>
          <Move className={`${moveIconSize} opacity-50 mt-0.5 sm:mt-1`} />
        </div>
      );
    }

    if (type === "signature") {
      const { signatureData } = annotation;
      return (
        <div
          key={id}
          className="absolute annotation-signature select-none bg-white px-1.5 sm:px-2 py-1 rounded shadow-md cursor-move touch-none"
          style={{
            left: position.x,
            top: position.y,
          }}
          onMouseDown={(e) => handleStartDrag(e, annotation)}
          onTouchStart={(e) => handleStartDrag(e, annotation)}
        >
          {signatureData.type === "typed" && (
            <div
              style={{
                fontFamily: signatureData.font,
                fontSize: isMobile ? "18px" : "24px",
                whiteSpace: "nowrap",
              }}
            >
              {signatureData.text}
            </div>
          )}

          {(signatureData.type === "drawn" ||
            signatureData.type === "uploaded") && (
            <img
              src={signatureData.dataUrl}
              alt="Signature"
              className="object-contain"
              style={{
                maxWidth: isMobile ? "160px" : "220px",
                maxHeight: isMobile ? "70px" : "100px",
              }}
            />
          )}

          <button
            type="button"
            className="delete-btn absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-600 text-white rounded-full p-0.5 sm:p-1 shadow touch-manipulation"
            onClick={() => deleteAnnotation(id)}
          >
            <Trash2 className={deleteButtonSize} />
          </button>
          <Move
            className={`${moveIconSize} opacity-50 absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1`}
          />
        </div>
      );
    }

    if (type === "stamp") {
      const shapeClasses = {
        rounded: "rounded-lg",
        square: "rounded-none",
        circle: "rounded-full",
      };

      return (
        <div
          key={id}
          className={`absolute annotation-stamp select-none px-2 sm:px-4 py-1 sm:py-2 font-bold shadow-md cursor-move touch-none ${
            shapeClasses[annotation.shape]
          }`}
          style={{
            left: position.x,
            top: position.y,
            backgroundColor: annotation.bgColor,
            color: annotation.textColor,
            fontSize: isMobile ? "10px" : "14px",
          }}
          onMouseDown={(e) => handleStartDrag(e, annotation)}
          onTouchStart={(e) => handleStartDrag(e, annotation)}
        >
          <span className="text-xs sm:text-sm">{annotation.text}</span>
          <button
            type="button"
            className="delete-btn absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-600 text-white rounded-full p-0.5 sm:p-1 shadow touch-manipulation"
            onClick={() => deleteAnnotation(id)}
          >
            <Trash2 className={deleteButtonSize} />
          </button>
          <Move
            className={`${moveIconSize} opacity-50 absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1`}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="absolute inset-0 pointer-events-auto"
      onMouseMove={handleDragMove}
      onMouseUp={handleEndDrag}
      onMouseLeave={handleEndDrag}
      onTouchMove={handleDragMove}
      onTouchEnd={handleEndDrag}
      onTouchCancel={handleEndDrag}
    >
      {pageAnnotations.map(renderAnnotation)}
    </div>
  );
};

export default AnnotationLayer;
