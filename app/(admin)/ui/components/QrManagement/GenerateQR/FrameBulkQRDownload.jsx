import React, { forwardRef, useImperativeHandle } from "react";
import QRCodeStyling from "qr-code-styling";
import option from "./options.json";

const FrameBulkQRDownload = forwardRef(({ datas, format = "png" }, ref) => {
  console.log('datas', datas)
  // Expose a function to parent via ref
  useImperativeHandle(ref, () => ({
    downloadAll: async () => {
      for (const data of datas) {
        await downloadQR(data, format);
      }
    },
  }));

  const downloadQR = async (data, ext) => {
    const qrCode = new QRCodeStyling(option);
    qrCode.update({ data: data.qr_shortlink });

    if (ext === "svg") {
      const blob = await qrCode.getRawData("svg");
      let qrSvg = await blob.text();

      // ✅ Clean QR SVG (but KEEP structure info)
      qrSvg = qrSvg
        .replace(/<\?xml[^>]*\?>/g, "")
        .replace(/<!DOCTYPE[^>]*>/g, "")
        .trim();

      // ✅ Extract inner + size
      const viewBoxMatch = qrSvg.match(/viewBox="([^"]+)"/);

      let qrInner = qrSvg
        .replace(/<svg[^>]*>/, "")
        .replace(/<\/svg>/, "")
        .trim();

      let qrW = 300;
      if (viewBoxMatch) {
        const [, w] = viewBoxMatch[1].split(" ").map(Number);
        qrW = w;
      }

      // ✅ Load frame
      const frameRes = await fetch("/qrFrame.svg");
      let frameSvg = await frameRes.text();

      // 🔥 Fix xlink issue
      if (!frameSvg.includes("xmlns:xlink")) {
        frameSvg = frameSvg.replace(
          "<svg",
          `<svg xmlns:xlink="http://www.w3.org/1999/xlink"`
        );
      }

      // ==============================
      // 🎯 CONTROL POSITION HERE
      // ==============================
      const qrSize = 1100;
      const qrX = 250;
      const qrY = 480;

      const scale = qrSize / qrW;

      const qrWrapped = `
    <g transform="translate(${qrX}, ${qrY}) scale(${scale})">
      <rect width="${qrW}" height="${qrW}" fill="white"/>
      ${qrInner}
    </g>
  `;

      // ==============================
      // 🏷️ TEXT (FIXED POSITION)
      // ==============================
      const textSvg = `
    <text 
      x="800" 
      y="1690" 
      text-anchor="middle" 
    font-size="70"
      font-weight="bold" 
      fill="black"
      letter-spacing="2px"
      font-family="Sarabun, sans-serif"
    >
      ${data.qr_uid || "qr_uid"}
    </text>
  `;

      // ==============================
      // 🧩 MERGE
      // ==============================
      let finalSvg;

      if (frameSvg.includes("QR_PLACEHOLDER")) {
        finalSvg = frameSvg.replace(
          "QR_PLACEHOLDER",
          qrWrapped + textSvg
        );
      } else {
        finalSvg = frameSvg.replace(
          "</svg>",
          qrWrapped + textSvg + "</svg>"
        );
      }

      // ==============================
      // 📥 DOWNLOAD
      // ==============================
      const modifiedBlob = new Blob([finalSvg], {
        type: "image/svg+xml",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(modifiedBlob);
      link.download = `${data.qr_uid}.svg`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    else if (ext === "png") {
      // ===== 1. Generate QR SVG =====
      const blob = await qrCode.getRawData("svg");
      let qrSvg = await blob.text();

      qrSvg = qrSvg
        .replace(/<\?xml[^>]*\?>/g, "")
        .replace(/<!DOCTYPE[^>]*>/g, "")
        .trim();

      // ===== 2. Extract inner =====
      const viewBoxMatch = qrSvg.match(/viewBox="([^"]+)"/);

      let qrInner = qrSvg
        .replace(/<svg[^>]*>/, "")
        .replace(/<\/svg>/, "")
        .trim();

      let qrW = 300;
      if (viewBoxMatch) {
        const [, w] = viewBoxMatch[1].split(" ").map(Number);
        qrW = w;
      }

      // ===== 3. Load frame =====
      const frameRes = await fetch("/qrFrame.svg");
      let frameSvg = await frameRes.text();

      if (!frameSvg.includes("xmlns:xlink")) {
        frameSvg = frameSvg.replace(
          "<svg",
          `<svg xmlns:xlink="http://www.w3.org/1999/xlink"`
        );
      }

      // ===== 4. SAME POSITION (copy from SVG block) =====
      const qrSize = 1100;
      const qrX = 250;
      const qrY = 480;

      const scale = qrSize / qrW;

      const qrWrapped = `
    <g transform="translate(${qrX}, ${qrY}) scale(${scale})">
      <rect width="${qrW}" height="${qrW}" fill="white"/>
      ${qrInner}
    </g>
  `;

      const textSvg = `
    <text 
      x="800" 
      y="1690" 
      text-anchor="middle" 
      font-size="70"
      font-weight="bold" 
      fill="black"
      letter-spacing="2px"
      font-family="Sarabun, sans-serif"
    >
      ${data.qr_uid || "qr_uid"}
    </text>
  `;

      // ===== 5. MERGE =====
      let finalSvg;

      if (frameSvg.includes("QR_PLACEHOLDER")) {
        finalSvg = frameSvg.replace(
          "QR_PLACEHOLDER",
          qrWrapped + textSvg
        );
      } else {
        finalSvg = frameSvg.replace(
          "</svg>",
          qrWrapped + textSvg + "</svg>"
        );
      }

      // ===== 6. CONVERT SVG → PNG =====
      const img = new Image();
      const svg64 = btoa(unescape(encodeURIComponent(finalSvg)));
      img.src = "data:image/svg+xml;base64," + svg64;

      await new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");

          // 🔥 high quality export
          const scale = 2;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `${data.qr_uid}.png`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          resolve();
        };

        img.onerror = reject;
      });
    }
  };

  return null; // no UI needed, parent triggers via ref
});

export default FrameBulkQRDownload;
