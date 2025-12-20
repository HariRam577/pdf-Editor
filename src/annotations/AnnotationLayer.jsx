import React, { useState } from "react";
import { Trash2, Move, Maximize2 } from "lucide-react";
import { usePDFContext } from "../context/PDFContext";

const AnnotationLayer = ({ pageNumber, pageWidth, pageHeight, scale }) => {
  const { annotations, updateAnnotation, deleteAnnotation } = usePDFContext();

  const [draggedId, setDraggedId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingId, setResizingId] = useState(null);
  const [resizeStart, setResizeStart] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const pageAnnotations = annotations.filter(
    (ann) => ann.position.page === pageNumber
  );

  // ───────────────── START DRAG ─────────────────
  const handleStartDrag = (e, annotation) => {
    if (e.target.closest(".delete-btn, .resize-handle")) return;

    e.preventDefault();
    setDraggedId(annotation.id);

    const rect = e.currentTarget.getBoundingClientRect();

    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  // ───────────────── DRAG MOVE ─────────────────
  const handleDragMove = (e) => {
    if (draggedId) {
      const container = e.currentTarget;
      const rect = container.getBoundingClientRect();

      const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

      let x = (clientX - rect.left - dragOffset.x) / scale;
      let y = (clientY - rect.top - dragOffset.y) / scale;

      const maxX = Math.max(0, pageWidth - 120);
      const maxY = Math.max(0, pageHeight - 60);

      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));

      const current = annotations.find((a) => a.id === draggedId);
      if (!current) return;

      updateAnnotation(draggedId, {
        position: { ...current.position, x, y },
      });
    }

    if (resizingId) {
      const container = e.currentTarget;
      const rect = container.getBoundingClientRect();

      const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

      const deltaX = (clientX - resizeStart.x) / scale;
      const deltaY = (clientY - resizeStart.y) / scale;

      const newWidth = Math.max(50, resizeStart.width + deltaX);
      const newHeight = Math.max(30, resizeStart.height + deltaY);

      updateAnnotation(resizingId, {
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const handleEndDrag = () => {
    setDraggedId(null);
    setResizingId(null);
  };

  // ───────────────── START RESIZE ─────────────────
  const handleStartResize = (e, annotation) => {
    e.preventDefault();
    e.stopPropagation();

    setResizingId(annotation.id);

    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    setResizeStart({
      width: annotation.width || 200,
      height: annotation.height || 80,
      x: clientX,
      y: clientY,
    });
  };

  // ───────────────── RENDER ─────────────────
  const renderAnnotation = (annotation) => {
    const { id, type, position } = annotation;
    const isMobile = window.innerWidth < 640;

    if (type === "comment") {
      return (
        <div
          key={id}
          className="absolute annotation-comment select-none px-2 py-1 rounded cursor-move shadow-sm"
          style={{
            left: position.x,
            top: position.y,
            backgroundColor: annotation.bgColor || "#fff",
            color: annotation.color,
            fontFamily: annotation.fontFamily,
            fontSize: `${annotation.fontSize}px`,
            maxWidth: isMobile ? 180 : 220,
            lineHeight: 1.4,
          }}
          onMouseDown={(e) => handleStartDrag(e, annotation)}
          onTouchStart={(e) => handleStartDrag(e, annotation)}
        >
          <div className="flex gap-2">
            <div className="break-words">{annotation.text}</div>

            <button
              className="delete-btn text-red-600"
              onClick={() => deleteAnnotation(id)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <Move className="w-3 h-3 opacity-40 mt-1" />
        </div>
      );
    }

    if (type === "signature") {
      const width = annotation.width || 200;
      const height = annotation.height || 80;

      return (
        <div
          key={id}
          className="absolute cursor-move bg-white shadow-md border-2 border-transparent hover:border-blue-400 transition-colors"
          style={{
            left: position.x,
            top: position.y,
            width: `${width}px`,
            height: `${height}px`,
            padding: "8px",
          }}
          onMouseDown={(e) => handleStartDrag(e, annotation)}
          onTouchStart={(e) => handleStartDrag(e, annotation)}
        >
          {annotation.signatureData.type === "typed" && (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                fontFamily: annotation.signatureData.font,
                fontSize: Math.min(height * 0.5, 32),
              }}
            >
              {annotation.signatureData.text}
            </div>
          )}

          {(annotation.signatureData.type === "drawn" ||
            annotation.signatureData.type === "uploaded") && (
            <img
              src={annotation.signatureData.dataUrl}
              alt="Signature"
              className="w-full h-full object-contain"
            />
          )}

          {/* Delete Button */}
          <button
            className="delete-btn absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-700 transition-colors"
            onClick={() => deleteAnnotation(id)}
          >
            <Trash2 className="w-3 h-3" />
          </button>

          {/* Resize Handle */}
          <div
            className="resize-handle absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-tl-lg cursor-nwse-resize flex items-center justify-center hover:bg-blue-600 transition-colors"
            onMouseDown={(e) => handleStartResize(e, annotation)}
            onTouchStart={(e) => handleStartResize(e, annotation)}
          >
            <Maximize2 className="w-3 h-3 text-white" />
          </div>
        </div>
      );
    }

    if (type === "stamp") {
      const shapeClasses = {
        rounded: "rounded-lg",
        square: "rounded-none",
        circle: "rounded-full px-8",
      };

      return (
        <div
          key={id}
          className={`absolute cursor-move font-bold px-3 py-1 shadow-md ${
            shapeClasses[annotation.shape] || "rounded-lg"
          }`}
          style={{
            left: position.x,
            top: position.y,
            backgroundColor: annotation.bgColor,
            color: annotation.textColor,
            fontSize: annotation.fontSize || 14,
          }}
          onMouseDown={(e) => handleStartDrag(e, annotation)}
          onTouchStart={(e) => handleStartDrag(e, annotation)}
        >
          {annotation.text}

          <button
            className="delete-btn absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
            onClick={() => deleteAnnotation(id)}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="absolute inset-0"
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
