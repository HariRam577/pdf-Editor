import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const savePDFWithAnnotations = async (
  pdfFile,
  annotations,
  numPages,
  scale
) => {
  try {
    // Read the PDF file
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRomanItalic = await pdfDoc.embedFont(
      StandardFonts.TimesRomanItalic
    );
    const courier = await pdfDoc.embedFont(StandardFonts.Courier);
    const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

    // Font mapping helper
    const getFontForFamily = (fontFamily) => {
      const familyLower = (fontFamily || "").toLowerCase();

      if (
        familyLower.includes("times") ||
        familyLower.includes("serif") ||
        familyLower.includes("georgia")
      ) {
        return timesRoman;
      } else if (
        familyLower.includes("courier") ||
        familyLower.includes("mono")
      ) {
        return courier;
      } else if (familyLower.includes("bold")) {
        return helveticaBold;
      } else if (familyLower.includes("italic")) {
        return timesRomanItalic;
      } else if (
        familyLower.includes("brush") ||
        familyLower.includes("script")
      ) {
        return timesRomanItalic; // Closest match for script fonts
      } else if (
        familyLower.includes("lucida") ||
        familyLower.includes("handwriting")
      ) {
        return timesRomanItalic; // Closest match for handwriting fonts
      }

      return helveticaFont; // default
    };

    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = pdfDoc.getPage(pageNum - 1);
      const { width, height } = page.getSize();

      // Get annotations for this page
      const pageAnnotations = annotations.filter(
        (ann) => ann.position.page === pageNum
      );

      for (const annotation of pageAnnotations) {
        const { type, position } = annotation;

        // Convert coordinates (PDF origin is bottom-left)
        const x = position.x;
        const y = height - position.y;

        if (type === "comment") {
          // Calculate text dimensions
          const maxWidth = 200;
          const lineHeight = annotation.fontSize * 1.4;
          const padding = 8;

          // Ensure comment stays within page bounds
          const adjustedX = Math.min(x, width - maxWidth);
          const adjustedY = Math.max(lineHeight + padding, y);

          // Draw comment background
          const bgColor = hexToRgb(annotation.bgColor || "#ffffff");
          page.drawRectangle({
            x: adjustedX,
            y: adjustedY - lineHeight - padding,
            width: maxWidth,
            height: lineHeight + padding * 2,
            color: rgb(bgColor.r / 255, bgColor.g / 255, bgColor.b / 255),
            opacity: 0.9,
          });

          // Get the appropriate font based on fontFamily
          const commentFont = getFontForFamily(annotation.fontFamily);

          // Draw comment text
          const textColor = hexToRgb(annotation.color || "#000000");
          page.drawText(annotation.text, {
            x: adjustedX + padding,
            y: adjustedY - lineHeight,
            size: annotation.fontSize,
            font: commentFont,
            color: rgb(textColor.r / 255, textColor.g / 255, textColor.b / 255),
            maxWidth: maxWidth - padding * 2,
          });
        }

        if (type === "signature") {
          const { signatureData } = annotation;
          const sigWidth = annotation.width || 200;
          const sigHeight = annotation.height || 80;

          // Ensure signature stays within page bounds
          const adjustedX = Math.min(x, width - sigWidth);
          const adjustedY = Math.max(sigHeight, y);

          if (signatureData.type === "typed") {
            // Calculate font size based on height
            const fontSize = Math.min(sigHeight * 0.5, 32);

            // Get the appropriate font for signature
            const signatureFont = getFontForFamily(signatureData.font);

            // Draw typed signature
            page.drawText(signatureData.text, {
              x: adjustedX + 10,
              y: adjustedY - sigHeight / 2,
              size: fontSize,
              font: signatureFont,
              color: rgb(0, 0, 0),
            });
          } else if (
            signatureData.type === "drawn" ||
            signatureData.type === "uploaded"
          ) {
            // Embed and draw signature image
            try {
              const imageBytes = await fetch(signatureData.dataUrl).then(
                (res) => res.arrayBuffer()
              );
              let image;

              if (
                signatureData.dataUrl.includes("image/png") ||
                signatureData.dataUrl.includes("data:image/png")
              ) {
                image = await pdfDoc.embedPng(imageBytes);
              } else {
                image = await pdfDoc.embedJpg(imageBytes);
              }

              // Use the annotation's actual width and height
              page.drawImage(image, {
                x: adjustedX,
                y: adjustedY - sigHeight,
                width: sigWidth,
                height: sigHeight,
              });
            } catch (err) {
              console.error("Error embedding signature image:", err);
            }
          }
        }

        if (type === "stamp") {
          // Calculate stamp dimensions
          const textLength = annotation.text.length;
          const stampWidth = Math.max(100, textLength * 10);
          const stampHeight = 30;
          const fontSize = annotation.fontSize || 14;

          // Ensure stamp stays within page bounds
          const adjustedX = Math.min(x, width - stampWidth);
          const adjustedY = Math.max(stampHeight, y);

          // Get shape styles
          const shape = annotation.shape || "rounded";

          // Draw stamp background
          const bgColor = hexToRgb(annotation.bgColor);

          if (shape === "circle") {
            // For circle, draw ellipse
            page.drawEllipse({
              x: adjustedX + stampWidth / 2,
              y: adjustedY - stampHeight / 2,
              xScale: stampWidth / 2,
              yScale: stampHeight / 2,
              color: rgb(bgColor.r / 255, bgColor.g / 255, bgColor.b / 255),
              borderColor: rgb(0, 0, 0),
              borderWidth: 2,
            });
          } else {
            // For rounded or square
            page.drawRectangle({
              x: adjustedX,
              y: adjustedY - stampHeight,
              width: stampWidth,
              height: stampHeight,
              color: rgb(bgColor.r / 255, bgColor.g / 255, bgColor.b / 255),
              borderColor: rgb(0, 0, 0),
              borderWidth: 2,
            });
          }

          // Draw stamp text (centered)
          const textColor = hexToRgb(annotation.textColor);
          const textWidth = helveticaBold.widthOfTextAtSize(
            annotation.text,
            fontSize
          );
          const textX = adjustedX + (stampWidth - textWidth) / 2;
          const textY = adjustedY - stampHeight / 2 - fontSize / 3;

          page.drawText(annotation.text, {
            x: textX,
            y: textY,
            size: fontSize,
            font: helveticaBold,
            color: rgb(textColor.r / 255, textColor.g / 255, textColor.b / 255),
          });
        }
      }
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // Download the file
    const link = document.createElement("a");
    link.href = url;
    link.download = `annotated_${pdfFile.name}`;
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error saving PDF:", error);
    throw error;
  }
};

// Helper function to convert hex color to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};
