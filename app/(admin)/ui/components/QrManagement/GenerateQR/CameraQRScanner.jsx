import React, { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";
import {
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Fade,
  Zoom
} from "@mui/material";
import {
  QrCodeScanner as QrIcon,
  CheckCircle as SuccessIcon,
  StopCircle as StopIcon
} from "@mui/icons-material";

const CameraQRScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [qrUID, setQrUID] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(false);

  const isProcessingRef = useRef(false);
  const lastScannedTextRef = useRef("");
  const requestRef = useRef(null);
  const streamRef = useRef(null);

  const addLog = useCallback((msg) => {
    console.log("[QR Scanner]", msg);
    setDebugLogs(prev => {
      const time = new Date().toLocaleTimeString();
      return [`[${time}] ${msg}`, ...prev].slice(0, 30);
    });
  }, []);

  const stopScanner = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }

    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScanning(false);
    setQrUID(null);
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const tick = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth", // The MAGIC for inverted QR codes!
      });

      if (code && !isProcessingRef.current) {
        const text = code.data;
        if (text !== lastScannedTextRef.current) {
          lastScannedTextRef.current = text;
          isProcessingRef.current = true;
          setLoading(true);
          addLog(`QR Scanned (RAW): ${text}`);

          // Self-invoking async to not block tick
          (async () => {
            try {
              const res = await fetch(text, { method: "GET", redirect: "follow" });
              const finalUrl = res.url;
              addLog(`Expanded URL: ${finalUrl}`);

              const url = new URL(finalUrl);
              const uid = url.searchParams.get("qr_uid") || url.pathname.split("/").pop();
              const finalUid = uid || "No UID Found";
              
              addLog(`Extracted Final UID: ${finalUid}`);
              setQrUID(finalUid);
            } catch (error) {
              addLog(`Expansion Fetch Failed: ${error.message || "Network Error"}`);
              addLog(`Fallback: Using RAW text as UID.`);
              setQrUID(text);
            }
            setLoading(false);
            isProcessingRef.current = false;
          })();
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  }, [addLog]);

  const startScanner = async () => {
    stopScanner();
    isProcessingRef.current = false;
    lastScannedTextRef.current = "";
    setQrUID(null);
    setErrorMsg("");
    setScanning(true);
    setLoading(false);
    setDebugLogs([]);
    
    addLog("Initializing jsQR scanner engine...");

    try {
      addLog("Requesting rear camera access...");
      // Mobile optimized view
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
        await videoRef.current.play();
        addLog("Camera stream active.");
        requestRef.current = requestAnimationFrame(tick);
      }
    } catch (error) {
      addLog(`Camera Error: ${error.message}`);
      console.error("Camera error:", error);
      setErrorMsg(error.message || "Could not access the camera. Please check permissions.");
      setScanning(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", mt: 2 }}>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 620,
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Header Area */}
        <Box borderBottom={scanning || qrUID ? "1px solid" : "none"} borderColor="divider" bgcolor="#f9fafb" sx={{ p: 3, textAlign: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 1 }}>
            <QrIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight="700" color="text.primary">
              QR Code Scanner
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {scanning
              ? "Continuous scanning active. Position QR code."
              : "Tap below to start scanning for eatery UID"}
          </Typography>
        </Box>

        {/* Content Area */}
        <Box position="relative" minHeight={200} sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

          {/* Default Start State */}
          {!scanning && !qrUID && (
            <Fade in>
              <Box sx={{ textAlign: "center", width: "100%" }}>
                <Box bgcolor="primary.50" borderRadius="50%" sx={{ width: 120, height: 120, mx: "auto", mb: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <QrIcon sx={{ fontSize: 48, color: "primary.main" }} />
                </Box>

                {errorMsg && (
                  <Typography variant="body2" color="error.main" mb={2}>
                    {errorMsg}
                  </Typography>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={startScanner}
                  startIcon={<QrIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
                    boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)"
                  }}
                >
                  Start Camera Scanner
                </Button>
              </Box>
            </Fade>
          )}

          {/* Active Scanner State */}
          {scanning && (
            <Fade in>
              <Box position="relative" sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

                {/* Video Container with Scanner Framing */}
                <Box position="relative" borderRadius={3} overflow="hidden" bgcolor="#000" boxShadow="inset 0 0 20px rgba(0,0,0,0.5)" sx={{ aspectRatio: { xs: "3/4", sm: "4/3" }, width: "100%" }}>
                  <video
                    ref={videoRef}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />

                  {/* Decorative Scanner Box Overlay */}
                  {!loading && (
                    <Box position="absolute" top="50%" left="50%" sx={{ transform: "translate(-50%, -50%)",
                        border: "2px dashed rgba(255, 255, 255, 0.6)",
                        borderRadius: 4,
                        pointerEvents: "none",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "2px",
                          bgcolor: "primary.main",
                          boxShadow: "0 0 8px 2px rgba(25, 118, 210, 0.5)",
                          animation: "scanLine 2s ease-in-out infinite alternate",
                          willChange: "top"
                        },
                        "@keyframes scanLine": {
                          "0%": { top: "0%" },
                          "100%": { top: "calc(100% - 2px)" }
                        }, width: "65%", height: "65%" }} />
                  )}

                  {loading && (
                    <Box position="absolute" top={0} left={0} right={0} bottom={0} bgcolor="rgba(0,0,0,0.7)" zIndex={10} sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <CircularProgress size={40} thickness={4} sx={{ color: "white", mb: 2 }} />
                      <Typography variant="body2" color="white" fontWeight="600">
                        Processing QR...
                      </Typography>
                    </Box>
                  )}

                </Box>

                {/* Actions below the camera */}
                <Box sx={{ mt: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: "100%" }}>
                  {/* SUCCESS RESULT */}
                  {qrUID && (
                    <Zoom in key={qrUID}>
                      <Box bgcolor="#e8f5e9" borderRadius={8} px={4} py={1.5} boxShadow="0 4px 12px rgba(76, 175, 80, 0.2)" border="1px solid #a5d6a7" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <SuccessIcon sx={{ color: "#2e7d32", fontSize: 28 }} />
                        <Typography 
                          variant="h6" 
                          fontWeight="800" 
                          sx={{ color: "#1b5e20", letterSpacing: 0.5, whiteSpace: "nowrap" }}
                        >
                          {qrUID}
                        </Typography>
                      </Box>
                    </Zoom>
                  )}

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={stopScanner}
                    startIcon={<StopIcon />}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, px: 4 }}
                  >
                    Stop Scanning
                  </Button>

                  <Button 
                    size="small" 
                    color="inherit" 
                    onClick={() => setShowDebug(!showDebug)}
                    sx={{ mt: 1, opacity: 0.6 }}
                  >
                    {showDebug ? "Hide Debug Console" : "Show Debug Console"}
                  </Button>

                  {/* Debug Console UI */}
                  {showDebug && (
                    <Box bgcolor="#1e1e1e" color="#4caf50" borderRadius={2} sx={{ fontFamily: 'monospace', 
                        fontSize: 12, 
                        maxHeight: 200, 
                        overflowY: 'auto',
                        textAlign: 'left',
                        wordBreak: 'break-all',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)', width: "100%", p: 2 }}>
                      {debugLogs.length === 0 ? (
                        <Typography variant="caption" sx={{ opacity: 0.5 }}>No logs yet...</Typography>
                      ) : (
                        debugLogs.map((log, i) => (
                          <Box key={i} sx={{ mb: 0.5, borderBottom: '1px solid #333', pb: 0.5 }}>
                            {log}
                          </Box>
                        ))
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </Fade>
          )}

        </Box>
      </Paper>
    </Box>
  );
};

export default CameraQRScanner;