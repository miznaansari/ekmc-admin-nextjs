import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Button, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QRCodeStyling from "qr-code-styling";
import option from "./options.json";

const QrDialog = ({ open, onClose, title, qrData, qrUid }) => {
  const qrRef = useRef(null);
  const qrCodeRef = useRef(null);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(qrData);
  }, [qrData]);

  useEffect(() => {
    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling(option);
    }
    if (qrRef.current && url) {
      qrRef.current.innerHTML = "";
      qrCodeRef.current.update({ data: url });
      qrCodeRef.current.append(qrRef.current);
    }
  }, [url, open]);

  const handleCopy = (e) => {
    // Ensure this runs inside a user click event for iOS
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url || "").then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 5000);
        });
      } else {
        // Fallback for iOS Safari
        const textarea = document.createElement("textarea");
        textarea.value = url || "";
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px"; // offscreen
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const successful = document.execCommand("copy");
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 5000);
        }
        document.body.removeChild(textarea);
      }
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {title}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <div ref={qrRef} />
        <Typography variant="body2" sx={{ mt: 1, wordBreak: "break-word" }}>
          {qrUid || url}
        </Typography>
        <Button variant="outlined" size="small" onClick={handleCopy} sx={{ mt: 1 }}>
          {copied ? "Copied ✅" : "Copy Link"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default QrDialog;
