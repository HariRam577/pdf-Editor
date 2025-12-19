import React, { useState } from "react";
import { Trash2, Move } from "lucide-react";
import { usePDFContext } from "../context/PDFContext";

const AnnotationLayer = ({ pageNumber, pageWidth, pageHeight, scale }) => {
  const { annotations, updateAnnotation, deleteAnnotation } = usePDFContext();

  const [draggedId, setDraggedId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const pageAnnotations = annotations.filter(
    (ann) => ann.position.page === pageNumber
  );

  // ───────────────── START DRAG ─────────────────
  const handleStartDrag = (e, annotation) => {
    if (e.target.closest(".delete-btn")) return;

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
    if (!draggedId) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();

    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

    // Convert SCREEN → PDF coordinates
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
  };

  const handleEndDrag = () => {
    setDraggedId(null);
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
            fontSize: `${annotation.fontSize}px`, // ✅ exact
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
      return (
        <div
          key={id}
          className="absolute cursor-move bg-white px-2 py-1 shadow-md"
          style={{
            left: position.x,
            top: position.y,
          }}
          onMouseDown={(e) => handleStartDrag(e, annotation)}
          onTouchStart={(e) => handleStartDrag(e, annotation)}
        >
          {annotation.signatureData.type === "typed" && (
            <div
              style={{
                fontFamily: annotation.signatureData.font,
                fontSize: 24,
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
              style={{ maxWidth: 200, maxHeight: 80 }}
            />
          )}

          <button
            className="delete-btn absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
            onClick={() => deleteAnnotation(id)}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      );
    }

    if (type === "stamp") {
      return (
        <div
          key={id}
          className="absolute cursor-move font-bold px-3 py-1 shadow-md"
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
