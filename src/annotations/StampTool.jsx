import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { Stamp } from "lucide-react";

const StampTool = ({ isOpen, onClose, onAdd, position }) => {
  const [text, setText] = useState("");
  const [bgColor, setBgColor] = useState("#ff5722");
  const [textColor, setTextColor] = useState("#ffffff");
  const [shape, setShape] = useState("rounded"); // rounded, square, circle

  const presetStamps = [
    { text: "APPROVED", bgColor: "#4caf50", textColor: "#ffffff" },
    { text: "REJECTED", bgColor: "#f44336", textColor: "#ffffff" },
    { text: "CONFIDENTIAL", bgColor: "#ff9800", textColor: "#000000" },
    { text: "DRAFT", bgColor: "#9e9e9e", textColor: "#ffffff" },
    { text: "URGENT", bgColor: "#e91e63", textColor: "#ffffff" },
    { text: "REVIEWED", bgColor: "#2196f3", textColor: "#ffffff" },
  ];

  const handlePreset = (preset) => {
    setText(preset.text);
    setBgColor(preset.bgColor);
    setTextColor(preset.textColor);
  };

  const handleAdd = () => {
    if (!text.trim()) {
      alert("Please enter stamp text");
      return;
    }

    onAdd({
      type: "stamp",
      text,
      bgColor,
      textColor,
      shape,
      position,
    });

    setText("");
    onClose();
  };

  const shapeClasses = {
    rounded: "rounded-lg",
    square: "rounded-none",
    circle: "rounded-full px-8",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Stamp" size="md">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto">
        {/* Presets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {presetStamps.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePreset(preset)}
                className="px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: preset.bgColor,
                  color: preset.textColor,
                }}
              >
                {preset.text}
              </button>
            ))}
          </div>
        </div>

        {/* Custom text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Text
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase text-sm"
            placeholder="ENTER STAMP TEXT..."
            maxLength={20}
          />
          <p className="text-xs text-gray-400 mt-1">
            Up to 20 characters. Text will auto‑uppercase.
          </p>
        </div>

        {/* Shape selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shape
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(shapeClasses).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setShape(s)}
                className={`px-4 py-2 border-2 rounded-md text-sm transition-all capitalize ${
                  shape === s
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="flex justify-center">
          <div
            className={`px-6 py-3 font-bold text-lg ${shapeClasses[shape]} inline-flex items-center shadow-lg`}
            style={{
              backgroundColor: bgColor,
              color: textColor,
            }}
          >
            <Stamp className="w-5 h-5 mr-2" />
            {text || "PREVIEW"}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Stamp</Button>
        </div>
      </div>
    </Modal>
  );
};

export default StampTool;
