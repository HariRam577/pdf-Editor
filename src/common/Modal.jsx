import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container */}
      <div
        className={`
          relative w-full ${sizes[size]}
          mx-4 sm:mx-6
          bg-white rounded-lg shadow-xl
          max-h-[90vh]
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (scrollable) */}
        <div className="px-4 py-3 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
