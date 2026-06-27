import React, { forwardRef, useImperativeHandle } from "react";
import QRCodeStyling from "qr-code-styling";
import option from "./options.json";

const BulkQRDownload = forwardRef(({ datas, format = "png" }, ref) => {
    console.log('datas',datas)
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
    qrCode.update({ data: data.qr_shortlink});

    if (ext === "svg") {
      const blob = await qrCode.getRawData("svg");
      const svgText = await blob.text();

      const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/);
      let newSvg = svgText;

      if (viewBoxMatch) {
        const [x, y, w, h] = viewBoxMatch[1].split(" ").map(Number);
        const newViewBox = `0 0 ${w} ${h + 40}`;
        newSvg = newSvg.replace(/viewBox="[^"]+"/, `viewBox="${newViewBox}"`);
        newSvg = newSvg.replace(/height="([^"]+)"/, (_, hAttr) => `height="${parseInt(hAttr) + 40}"`);

        const injected = newSvg.replace(
          "</svg>",
          `<text 
             x="${w / 2}" 
             y="${h + 20}" 
             text-anchor="middle" 
             font-size="16" 
             font-weight="bold" 
             fill="black"
             letter-spacing="2px"
             font-family="Sarabun, sans-serif"
           >
             ${data.qr_uid || "qr_uid"}
           </text>
         </svg>`
        );

        const modifiedBlob = new Blob([injected], { type: "image/svg+xml" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(modifiedBlob);
        link.download = `${data.qr_uid}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else if (ext === "png") {
      const svgBlob = await qrCode.getRawData("svg");
      const svgText = await svgBlob.text();
      const svgUrl = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgText)));

      const img = new Image();
      img.src = svgUrl;

      await new Promise((resolve) => {
        img.onload = () => {
          const scale = 2;
          const padding = 40;
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scale;
          canvas.height = (img.height + padding) * scale;
          const ctx = canvas.getContext("2d");

          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);

          const text = data.qr_uid || "qr_uid";
          const fontSize = 16 * scale;
          const letterSpacing = 2 * scale;
          ctx.font = `bold ${fontSize}px Sarabun, sans-serif`;
          ctx.fillStyle = "black";

          let textWidth = 0;
          for (let i = 0; i < text.length; i++) {
            textWidth += ctx.measureText(text[i]).width;
            if (i < text.length - 1) textWidth += letterSpacing;
          }

          let startX = (canvas.width - textWidth) / 2;
          const y = img.height * scale + 25 * scale;

          for (let i = 0; i < text.length; i++) {
            ctx.fillText(text[i], startX, y);
            startX += ctx.measureText(text[i]).width + letterSpacing;
          }

          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `${data.qr_uid}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          resolve();
        };
      });
    }
  };

  return null; // no UI needed, parent triggers via ref
});

export default BulkQRDownload;
