import React, { useEffect, useMemo, useState, memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
  Pagination,
  Dialog,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Download, Visibility, Close } from "@mui/icons-material";
import GlobalSnackbar from "../../utils/GlobalSnackbar";
import { getAllImages } from "../../utils/indexedDB";

/* =========================
   🔥 Media Preview Component
========================= */
const MediaPreview = memo(({ row, onClick, isTable }) => {
  const commonStyle = {
    width: isTable ? 80 : "100%",
    height: isTable ? 80 : 200,
    objectFit: "cover",
    borderRadius: 6,
    cursor: "pointer",
    border: isTable ? "1px solid #ddd" : "none",
  };

  if (row.type === "video") {
    return (
      <video
        src={row.videoUrl}
        style={commonStyle}
        muted
        onClick={() => onClick(row)}
      />
    );
  }

  return (
    <img
      src={row.image}
      alt="Generated"
      loading="lazy"
      style={commonStyle}
      onClick={() => onClick(row)}
    />
  );
});

/* =========================
   🚀 MAIN COMPONENT
========================= */
const AIImageGenerationTable = ({ action }) => {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [openPreview, setOpenPreview] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* =========================
     📦 Load Data
  ========================= */
  useEffect(() => {
    getAllImages()
      .then((data) => {
        // OPTIONAL OPTIMIZATION (if using Blob)
        const processed = data.map((item) => {
          if (item.imageBlob) {
            return {
              ...item,
              image: URL.createObjectURL(item.imageBlob),
            };
          }
          return item;
        });

        setImages(processed.reverse()); // latest first
      })
      .catch((err) => console.error("IndexedDB error:", err));
  }, [action]);

  /* =========================
     📄 Pagination
  ========================= */
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return images.slice(start, start + rowsPerPage);
  }, [images, page]);

  const totalPages = Math.ceil(images.length / rowsPerPage);

  /* =========================
     👁 Preview
  ========================= */
  const handleOpenPreview = (row) => {
    setPreviewItem(row);
    setOpenPreview(true);
  };

  const handleClosePreview = () => {
    setPreviewItem(null);
    setOpenPreview(false);
  };

  /* =========================
     ⬇ Download
  ========================= */
  const handleDownload = (row) => {
    const link = document.createElement("a");

    if (row.type === "video") {
      link.href = row.videoUrl;
      link.download = `ai-video-${Date.now()}.mp4`;
    } else {
      link.href = row.image;
      link.download = `ai-image-${Date.now()}.png`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setAlert({
      open: true,
      message: `${row.type} downloaded successfully`,
      severity: "success",
    });
  };

  /* =========================
     🎨 UI
  ========================= */
  return (
    <Paper sx={{ width: "100%", p: 1 }}>
      {images.length === 0 ? (
        <Box py={4} sx={{ textAlign: "center" }}>
          <Typography>No AI content Generated Yet</Typography>
        </Box>
      ) : (
        <>
          {/* ================= MOBILE ================= */}
          {isMobile ? (
            paginatedData.map((row) => (
              <Box
                key={row.id}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  p: 1,
                  mb: 1,
                }}
              >
                <MediaPreview row={row} onClick={handleOpenPreview} />

                <Box sx={{ mt: 1 }}>
                  <Typography fontWeight={600} fontSize={14}>
                    Prompt
                  </Typography>
                  <Typography fontSize={13} gutterBottom>
                    {row.prompt}
                  </Typography>

                  <Typography fontSize={12}>
                    <strong>Model:</strong> {row.model}
                  </Typography>

                  <Typography fontSize={12}>
                    <strong>Created:</strong>{" "}
                    {new Date(row.createdAt).toLocaleString()}
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <IconButton onClick={() => handleOpenPreview(row)}>
                      <Visibility />
                    </IconButton>

                    <IconButton onClick={() => handleDownload(row)}>
                      <Download />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))
          ) : (
            /* ================= DESKTOP ================= */
            (<TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>Preview</TableCell>
                      <TableCell>Type</TableCell> {/* ✅ NEW */}
                    <TableCell>Prompt</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {(page - 1) * rowsPerPage + index + 1}
                      </TableCell>

                      <TableCell>
                        <MediaPreview
                          row={row}
                          onClick={handleOpenPreview}
                          isTable
                        />
                      </TableCell>
                       <TableCell>
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: 12,
            fontWeight: 600,
            textAlign: "center",
            width: "fit-content",
            bgcolor: row.type === "video" ? "#e3f2fd" : "#e8f5e9",
            color: row.type === "video" ? "#1976d2" : "#2e7d32",
          }}
        >
          {row.type === "video" ? "Video" : "Image"}
        </Box>
      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 300,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={row.prompt}
                        >
                          {row.prompt}
                        </Typography>
                      </TableCell>

                      <TableCell>{row.model}</TableCell>

                      <TableCell>
                        {new Date(row.createdAt).toLocaleString()}
                      </TableCell>

                      <TableCell align="center">
                        <IconButton onClick={() => handleOpenPreview(row)}>
                          <Visibility />
                        </IconButton>

                        <IconButton onClick={() => handleDownload(row)}>
                          <Download />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>)
          )}

          {/* ================= PAGINATION ================= */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, val) => setPage(val)}
              />
            </Box>
          )}
        </>
      )}
      {/* ================= PREVIEW DIALOG ================= */}
      <Dialog fullScreen open={openPreview} onClose={handleClosePreview}>
        <AppBar
          sx={{
            position: "fixed",
            top: 0,
            bgcolor: "transparent",
            boxShadow: "none",
          }}
        >
          <Toolbar>
            <Typography sx={{ flex: 1, color: "white" }} variant="h6">
              Preview
            </Typography>

            <IconButton onClick={handleClosePreview}>
              <Close sx={{ color: "white" }} />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            bgcolor: "#000",
          }}
        >
          {previewItem &&
            (previewItem.type === "video" ? (
              <video
                src={previewItem.videoUrl}
                controls
                autoPlay
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              />
            ) : (
              <img
                src={previewItem.image}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            ))}
        </Box>
      </Dialog>
      <GlobalSnackbar alert={alert} setAlert={setAlert} />
    </Paper>
  );
};

export default AIImageGenerationTable;