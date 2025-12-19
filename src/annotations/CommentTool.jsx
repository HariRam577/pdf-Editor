import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { Type, Palette } from "lucide-react";

const CommentTool = ({ isOpen, onClose, onAdd, position }) => {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [color, setColor] = useState("#000000");

  // Background color OPTIONAL
  const [bgColor, setBgColor] = useState(null);

  const fonts = [
    "Arial",
    "Times New Roman",
    "Courier New",
    "Georgia",
    "Verdana",
  ];

  const bgColors = [
    "#ffffff",
    "#ffeb3b",
    "#ff9800",
    "#4caf50",
    "#2196f3",
    "#e91e63",
    "#9c27b0",
  ];

  const handleAdd = () => {
    if (!text.trim()) {
      alert("Please enter comment text");
      return;
    }

    onAdd({
      type: "comment",
      text,
      fontSize: Number(fontSize), // ✅ always number
      fontFamily,
      color,
      ...(bgColor && { bgColor }),
      position,
    });

    // reset
    setText("");
    setFontSize(14);
    setFontFamily("Arial");
    setColor("#000000");
    setBgColor(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Comment" size="md">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Comment Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            rows={4}
            placeholder="Enter your comment..."
          />
        </div>

        {/* Font & Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Type className="w-4 h-4 inline mr-1" />
              Font Family
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              {fonts.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <input
              type="number"
              min={8}
              max={72}
              value={fontSize}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value)) {
                  setFontSize(value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Color
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
          />
        </div>

        {/* Background Color (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Palette className="w-4 h-4 inline mr-1" />
            Background Color (Optional)
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {/* No BG */}
            <button
              type="button"
              onClick={() => setBgColor(null)}
              className={`px-2 py-1 text-xs rounded border ${
                bgColor === null
                  ? "border-blue-600 text-blue-600"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              No BG
            </button>

            {bgColors.map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => setBgColor(bg)}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  bgColor === bg
                    ? "border-gray-800 scale-110"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: bg }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div
          className="p-4 rounded-lg border-2 border-dashed text-sm"
          style={{
            ...(bgColor && { backgroundColor: bgColor }),
            color,
            fontFamily,
            fontSize: `${fontSize}px`, //
          }}
        >
          {text || "Preview of your comment..."}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Comment</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CommentTool;
