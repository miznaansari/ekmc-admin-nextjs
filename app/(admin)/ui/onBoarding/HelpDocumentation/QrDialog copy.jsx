import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Button, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QRCodeStyling from "qr-code-styling";
import option from "./options.json";

const QrDialog = ({ open, onClose, title, qrData, qrUid }) => {
  const qrRef = useRef(null);
  const qrCodeRef = useRef(null);
  const [url, setUrl] = useState("");

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

  const handleCopy = () => navigator.clipboard.writeText(url);

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
          Copy Link
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default QrDialog;
