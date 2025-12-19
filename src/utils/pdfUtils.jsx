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
    const courier = await pdfDoc.embedFont(StandardFonts.Courier);

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

        // Convert coordinates (accounting for PDF coordinate system)
        const x = position.x / scale;
        const y = height - position.y / scale;

        if (type === "comment") {
          // Draw comment background
          const bgColor = hexToRgb(annotation.bgColor);
          page.drawRectangle({
            x,
            y: y - 30,
            width: 150,
            height: 30,
            color: rgb(bgColor.r / 255, bgColor.g / 255, bgColor.b / 255),
            opacity: 0.8,
          });

          // Draw comment text
          const textColor = hexToRgb(annotation.color);
          page.drawText(annotation.text, {
            x: x + 5,
            y: y - 20,
            size: annotation.fontSize / scale,
            font: helveticaFont,
            color: rgb(textColor.r / 255, textColor.g / 255, textColor.b / 255),
            maxWidth: 140,
          });
        }

        if (type === "signature") {
          const { signatureData } = annotation;

          if (signatureData.type === "typed") {
            // Draw typed signature
            page.drawText(signatureData.text, {
              x,
              y: y - 25,
              size: 24 / scale,
              font: helveticaBold,
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

              const imgDims = image.scale(0.3 / scale);
              page.drawImage(image, {
                x,
                y: y - imgDims.height,
                width: imgDims.width,
                height: imgDims.height,
              });
            } catch (err) {
              console.error("Error embedding signature image:", err);
            }
          }
        }

        if (type === "stamp") {
          // Draw stamp background
          const bgColor = hexToRgb(annotation.bgColor);
          page.drawRectangle({
            x,
            y: y - 25,
            width: 100,
            height: 25,
            color: rgb(bgColor.r / 255, bgColor.g / 255, bgColor.b / 255),
            borderColor: rgb(0, 0, 0),
            borderWidth: 2,
          });

          // Draw stamp text
          const textColor = hexToRgb(annotation.textColor);
          page.drawText(annotation.text, {
            x: x + 10,
            y: y - 17,
            size: 12 / scale,
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
