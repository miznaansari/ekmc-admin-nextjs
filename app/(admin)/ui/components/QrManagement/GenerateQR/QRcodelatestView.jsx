import React, { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import option from "./options.json";
import { Button, Typography } from "@mui/material";
import { ArrowDown24Regular, ArrowDownload24Regular } from "@fluentui/react-icons";

const qrCode = new QRCodeStyling(option);

export default function QRcodelatestView({ data }) {
  const [url, setUrl] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    setUrl(data?.qr_shortlink);
  }, [data]);

  useEffect(() => {
    qrCode.append(ref.current);
  }, []);

  useEffect(() => {
    qrCode.update({
      data: url,
    });
  }, [url]);

  const handleDownload = async (ext) => {
    if (ext === "svg") {
      // ---------- SVG ----------
      const blob = await qrCode.getRawData("svg");
      const svgText = await blob.text();

      const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/);
      let newSvg = svgText;

      if (viewBoxMatch) {
        const [x, y, w, h] = viewBoxMatch[1].split(" ").map(Number);

        const newViewBox = `0 0 ${w} ${h + 40}`;
        newSvg = newSvg.replace(/viewBox="[^"]+"/, `viewBox="${newViewBox}"`);
        newSvg = newSvg.replace(
          /height="([^"]+)"/,
          (_, hAttr) => `height="${parseInt(hAttr) + 40}"`
        );

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
             ${data?.qr_uid || "qr_uid"}
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
      } else {
        qrCode.download({ extension: "svg" });
      }
    } else if (ext === "png") {
      const svgBlob = await qrCode.getRawData("svg");
      const svgText = await svgBlob.text();
      const svgUrl = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgText)));

      const img = new Image();
      img.src = svgUrl;

      img.onload = () => {
        const scale = 2;
        const padding = 40;
        const canvas = document.createElement("canvas");
        canvas.width = (img.width) * scale;
        canvas.height = (img.height + padding) * scale;

        const ctx = canvas.getContext("2d");

        // Fill white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw QR SVG scaled up
        ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);

        // Draw UID text
        const text = data?.qr_uid || "qr_uid";
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

        // Export PNG
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `${data.qr_uid}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }

    else {
      qrCode.download({ extension: ext });
    }
  };

  return (
    <div className="App">
      {/* QR Code */}
      <div ref={ref} />
      <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold', textAlign: 'center' }} letterSpacing={'2px'}>
      {data.qr_uid}

      </Typography>

      {/* Download buttons */}
      <div style={{ marginTop: "20px" }}>
        <Button variant="contained" onClick={() => handleDownload("png")} startIcon={<ArrowDownload24Regular />
      }
      size={"small"}

      >
          DOWNLOAD PNG
        </Button>
        <Button
          variant="contained"
          onClick={() => handleDownload("svg")}
          style={{ marginLeft: "10px" }}
          startIcon={<ArrowDownload24Regular />


          }
      size={"small"}

        >
          DOWNLOAD SVG
        </Button>
      </div>
    </div>
  );
}
