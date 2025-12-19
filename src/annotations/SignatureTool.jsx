import React, { useState, useRef } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import SignatureCanvas from "react-signature-canvas";
import { Type, Pen, Upload } from "lucide-react";

const SignatureTool = ({ isOpen, onClose, onAdd, position }) => {
  const [mode, setMode] = useState("typed"); // typed, drawn, uploaded
  const [typedText, setTypedText] = useState("");
  const [font, setFont] = useState("Brush Script MT");
  const [uploadedImage, setUploadedImage] = useState(null);
  const sigCanvas = useRef(null);
  const fileInputRef = useRef(null);

  const handleAdd = () => {
    let signatureData = null;

    if (mode === "typed") {
      if (!typedText.trim()) {
        alert("Please enter your signature text");
        return;
      }
      signatureData = { type: "typed", text: typedText, font };
    } else if (mode === "drawn") {
      if (sigCanvas.current?.isEmpty()) {
        alert("Please draw your signature");
        return;
      }
      signatureData = {
        type: "drawn",
        dataUrl: sigCanvas.current.toDataURL(),
      };
    } else if (mode === "uploaded") {
      if (!uploadedImage) {
        alert("Please upload a signature image");
        return;
      }
      signatureData = { type: "uploaded", dataUrl: uploadedImage };
    }

    onAdd({
      type: "signature",
      signatureData,
      position,
    });

    // Reset
    setTypedText("");
    setUploadedImage(null);
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
    onClose();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fonts = [
    "Brush Script MT",
    "Lucida Handwriting",
    "Courier New",
    "Georgia",
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Signature" size="lg">
      <div className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Tabs */}
        <div className="flex flex-wrap border-b border-gray-200">
          {[
            { key: "typed", label: "Type", icon: Type },
            { key: "drawn", label: "Draw", icon: Pen },
            { key: "uploaded", label: "Upload", icon: Upload },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 text-sm transition-colors ${
                mode === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Typed mode */}
        {mode === "typed" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Enter your name..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Style
              </label>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                {fonts.map((f) => (
                  <option key={f} value={f} style={{ fontFamily: f }}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="p-6 sm:p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
              style={{ fontFamily: font, fontSize: "32px" }}
            >
              {typedText || "Your signature preview"}
            </div>
          </div>
        )}

        {/* Drawn mode */}
        {mode === "drawn" && (
          <div className="space-y-4">
            <div className="border-2 border-gray-300 rounded-lg bg-white overflow-hidden">
              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{
                  className: "w-full h-56 sm:h-64",
                  style: { touchAction: "none" },
                }}
                backgroundColor="white"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => sigCanvas.current?.clear()}
              className="w-full"
            >
              Clear
            </Button>
          </div>
        )}

        {/* Upload mode */}
        {mode === "uploaded" && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Image
            </Button>

            {uploadedImage && (
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                <img
                  src={uploadedImage}
                  alt="Signature"
                  className="max-h-48 mx-auto object-contain"
                />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Signature</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SignatureTool;
