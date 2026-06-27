import React, { useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Fade,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VerifiedIcon from "@mui/icons-material/VerifiedUser";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import FileIcon from "@mui/icons-material/InsertDriveFile";
import { CircularProgress } from "@mui/material";

const QRVerification = () => {
  const [results, setResults] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const codeReader = new BrowserQRCodeReader();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // 🔍 Scan QR using ZXing
  const scanQRCodeFromFile = async (file) => {
    try {
      console.log(`📷 [${file.name}] Reading image...`);

      const imageUrl = URL.createObjectURL(file);
      const result = await codeReader.decodeFromImageUrl(imageUrl);

      const qrText = result.getText();

      console.log("✅ ZXing FULL RESULT →", result);
      console.log("📦 QR DATA →", qrText);

      const expectedUID = file.name
        .split(".")[0]          // remove extension
        .match(/\d+/)?.[0];     // extract only digits

      let isMatch = false;
      let finalUrl = null;
      let extractedUID = null;

      try {
        // 🔥 STEP 1: Expand short URL
        const res = await fetch(qrText, {
          method: "GET",
          redirect: "follow",
        });

        finalUrl = res.url;

        console.log("🌐 Expanded URL →", finalUrl);

        // 🔥 STEP 2: Extract UID
        const urlObj = new URL(finalUrl);

        extractedUID =
          urlObj.searchParams.get("qr_uid") || // ?qr_uid=123
          urlObj.pathname.split("/").pop();   // /123 fallback

        console.log("🆔 Extracted UID →", extractedUID);

        // 🔥 STEP 3: Compare
        isMatch = extractedUID === expectedUID;
      } catch (err) {
        console.log("❌ Expand or parse failed", err);
      }

      return {
        file: file.name,
        status: isMatch
          ? "✅ Verified"
          : "⚠️ Mismatch",
        data: qrText,
        finalUrl,
        extractedUID,
      };
    } catch (error) {
      console.log(`❌ [${file.name}] No QR detected`, error);

      return {
        file: file.name,
        status: "❌ No QR Found",
        data: null,
      };
    }
  };

  // 📂 Handle uploads
  const handleUpload = async (e) => {
    let files = [];
    if (e.dataTransfer && e.dataTransfer.files) {
      files = Array.from(e.dataTransfer.files);
    } else if (e.target && e.target.files) {
      files = Array.from(e.target.files);
    }

    if (files.length === 0) return;

    // Initialize results state for real-time updates
    const initialResults = files.map(file => ({
      file: file.name,
      status: "⏳ Processing...",
      data: null,
      finalUrl: null,
      extractedUID: null
    }));

    setResults(prev => [...initialResults, ...prev]);

    console.log("\n==============================");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      console.log(
        `📁 Processing (${i + 1}/${files.length}) → ${file.name}`
      );

      const res = await scanQRCodeFromFile(file);

      setResults((prev) => {
        const updated = [...prev];
        // Match by filename and "Processing" status to update the correct row
        const indexToUpdate = updated.findIndex(r => r.file === file.name && r.status === "⏳ Processing...");
        if (indexToUpdate !== -1) {
          updated[indexToUpdate] = res;
        }
        return updated;
      });

      console.log("==============================");
    }

    console.log("\n🎉 Verification Completed");

    // Clear the input so the same files can be uploaded again if needed
    if (e.target && e.target.value) {
      e.target.value = null;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e);
  };

  const clearResults = () => setResults([]);

  return (
    <Box sx={{ p: isMobile ? 1 : 3, mx: "auto" }}>

      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 4 },
          mb: 4,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#ffffff",
          boxShadow: "0 4px 20px -10px rgba(0,0,0,0.05)"
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
          <Box
            sx={{
              bgcolor: "primary.50",
              p: 1.5,
              borderRadius: 2,
              display: "flex"
            }}
          >
            <VerifiedIcon color="primary" fontSize="medium" />
          </Box>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight="700" color="text.primary">
            Bulk QR Verification
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ ml: { xs: 0, sm: 7 }, mt: { xs: 2, sm: 0 } }}>
          Upload batch QR codes to verify their UIDs against expected filenames. You can drag and drop multiple images at once.
        </Typography>

        {/* Modern Dropzone */}
        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            mt: 4,
            border: "2px dashed",
            borderColor: isDragging ? "primary.main" : "grey.300",
            borderRadius: 3,
            p: { xs: 4, md: 6 },
            textAlign: "center",
            bgcolor: isDragging ? "primary.50" : "grey.50",
            transition: "all 0.2s ease-in-out",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: isDragging ? "primary.main" : "grey.400", mb: 2 }} />
          <Typography variant="h6" color="text.primary" fontWeight="600" gutterBottom>
            {isDragging ? "Drop your QR images here!" : "Drag & Drop QR images here"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Supports JPG, PNG, WEBP (Max multiple files allowed)
          </Typography>
          <Button
            variant="contained"
            component="label"
            disableElevation
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 4
            }}
          >
            Browse Files
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleUpload}
            />
          </Button>
        </Box>
      </Paper>

      {/* Results Table Section */}
      {results.length > 0 && (
        <Fade in>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "#ffffff",
              overflow: "hidden",
              boxShadow: "0 4px 20px -10px rgba(0,0,0,0.05)"
            }}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#f9fafb" }}>
              <Typography variant="subtitle1" fontWeight="600">
                Scan Results ({results.length})
              </Typography>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={clearResults}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Clear All
              </Button>
            </Box>

            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="qr verification table" size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "700", bgcolor: "#ffffff" }}>File</TableCell>
                    <TableCell sx={{ fontWeight: "700", bgcolor: "#ffffff" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "700", bgcolor: "#ffffff", display: { xs: "none", md: "table-cell" } }}>Extracted UID</TableCell>
                    <TableCell sx={{ fontWeight: "700", bgcolor: "#ffffff", display: { xs: "none", lg: "table-cell" } }}>Final URL</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((r, i) => (
                    <TableRow
                      key={i}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FileIcon sx={{ color: "grey.400", fontSize: 20 }} />
                          <Typography variant="body2" fontWeight="500" sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {r.file}
                          </Typography>
                        </Stack>

                        {/* Mobile Only: Show UID/URL under filename */}
                        {isMobile && (
                          <Box sx={{ mt: 1 }}>
                            {r.extractedUID && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                <strong>UID:</strong> {r.extractedUID}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={r.status.replace("✅ ", "").replace("❌ ", "").replace("⚠️ ", "").replace("⏳ ", "")}
                          color={
                            r.status.includes("✅") ? "success"
                              : r.status.includes("⏳") ? "primary"
                                : r.status.includes("⚠️") ? "warning"
                                  : "error"
                          }
                          size="small"
                          sx={{ fontWeight: "600", borderRadius: 1.5 }}
                          icon={
                            r.status.includes("⏳") ? <CircularProgress size={12} color="inherit" sx={{ ml: 1 }} /> : undefined
                          }
                        />
                      </TableCell>

                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                        {r.extractedUID ? (
                          <Typography variant="body2" fontWeight="600" color="text.primary">
                            {r.extractedUID}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.disabled">-</Typography>
                        )}
                      </TableCell>

                      <TableCell sx={{ display: { xs: "none", lg: "table-cell" }, maxWidth: 300 }}>
                        {r.finalUrl ? (
                          <Typography
                            variant="caption"
                            color="primary"
                            sx={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              bgcolor: "primary.50",
                              p: 0.5,
                              borderRadius: 1,
                              fontFamily: "monospace"
                            }}
                          >
                            {r.finalUrl}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default QRVerification;