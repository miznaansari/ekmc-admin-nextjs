import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";

const InstagramExtractor = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingReels, setLoadingReels] = useState(false);
  const [reelsList, setReelsList] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Fetch entire reel list
  const fetchReels = async () => {
    if (!url.trim()) return alert("Please enter profile URL");

    setLoadingReels(true);

    try {
      const res = await axios.post("https://gp-crawler-3.a2deatsdev.in/fetchreels", {
        // const res = await axios.post("http://localhost:4000/fetchreels", {
        url: url.trim(),
      });

      if (res.data.success && res.data.files?.reels) {
        setReelsList(res.data.files.reels);
      } else {
        alert("No reels found.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch reels.");
    }

    setLoadingReels(false);
  };


  // Fetch full data for one reel (existing logic)
  const fetchReelDetails = async (reelUrl) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await axios.post("https://gp-crawler-3.a2deatsdev.in/download", { url: reelUrl });
      // const res = await axios.post("http://localhost:4000/download", { url: reelUrl });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load reel details.");
    }

    setLoading(false);
  };

  const handleExtract = async () => {
    if (!url.trim()) return alert("Please enter Instagram URL");

    fetchReelDetails(url.trim());
  };

  const metadata = result?.files?.metadata || {};
  const videoBase64 = result?.files?.video_base64 || "";

  return (
    <Box sx={{ width: "100%", mx: "auto", mt: 1, p: 1 }}>
      {/* <Typography variant="h5" textAlign="center" fontWeight="bold" mb={1}>
        Instagram Reel Extractor
      </Typography> */}
      <Grid container spacing={1}>

        {/* LEFT SIDE → REELS LIST */}
        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <TextField
            fullWidth
            size="small"
            label="Enter Profile URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={fetchReels}
            disabled={loadingReels}
          >
            {loadingReels ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Fetch Reels"
            )}
          </Button>

          {/* LIST TABLE */}
          {reelsList.length > 0 && (
            <Paper sx={{ mt: 2, p: 1, maxHeight: "50vh", overflowY: "auto" }}>
              <Typography variant="h6">Reels List</Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>#</strong></TableCell>
                    <TableCell><strong>Reel URL</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reelsList.map((reel, index) => (
                    <TableRow
                      key={index}
                      hover
                      onClick={() => fetchReelDetails(reel)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{reel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Grid>

        {/* RIGHT SIDE → REEL DETAILS (your original UI) */}
        {/* === RIGHT SIDE → COMPRESSED IG POST STYLE UI === */}
        <Grid
          size={{
            xs: 12,
            md: 8
          }}>

          {/* INPUT BOX */}
          <TextField
            fullWidth
            size="small"
            label="Enter Instagram Reel URL"
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleExtract}
            disabled={loading}
            size="small"
          >
            {loading ? <CircularProgress size={26} color="inherit" /> : "Extract Reel"}
          </Button>

          {error && <Typography color="error" mt={2}>{error}</Typography>}

          {/* RESULT CARD */}
          {result?.success && result?.files && (
            <Card sx={{ mt: 2, p: 1, height: "65vh", overflow: "hidden" }}>
              <Grid container spacing={1} sx={{ height: "100%" }}>

                {/* LEFT SIDE — COMPRESSED VIDEO */}
                <Grid
                  sx={{ height: "100%", display: "flex", flexDirection: "column" }}
                  size={{
                    xs: 12,
                    md: 4
                  }}>
                  {videoBase64 ? (
                    <video
                      controls
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "12px",
                        objectFit: "cover"
                      }}
                      src={`data:video/mp4;base64,${videoBase64}`}
                    />
                  ) : (
                    <Typography>No video available</Typography>
                  )}

                  {/* DOWNLOAD BUTTON */}
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{ mt: 1 }}
                    disabled={!videoBase64}
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `data:video/mp4;base64,${videoBase64}`;
                      link.download = `${metadata?.id || "reel"}.mp4`;
                      link.click();
                    }}
                  >
                    Download Video
                  </Button>
                </Grid>

                {/* RIGHT SIDE — COMPRESSED DATA PANEL */}
                <Grid
                  sx={{
                    height: "100%",
                    overflowY: "auto",
                    pr: 1
                  }}
                  size={{
                    xs: 12,
                    md: 8
                  }}>
                  {/* Username */}
                  <Typography variant="h6" fontWeight="bold">
                    @{metadata.username}
                  </Typography>

                  {/* KEY VALUE TABLE */}
                  <Table size="small" sx={{ mt: 1 }}>
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>ID</strong></TableCell>
                        <TableCell>{metadata.id}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Likes</strong></TableCell>
                        <TableCell>{metadata.likes}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Views</strong></TableCell>
                        <TableCell>{metadata.views}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Duration</strong></TableCell>
                        <TableCell>{metadata.duration}s</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  {/* CAPTION (SCROLLABLE) */}
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 2,
                      maxHeight: "120px",
                      overflowY: "auto",
                      whiteSpace: "pre-line",
                      background: "#f7f7f7",
                      p: 1,
                      borderRadius: "8px"
                    }}
                  >
                    {metadata.caption || "No caption"}
                  </Typography>

                  {/* HASHTAGS */}
                  {metadata.caption && (
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{
                        mt: 1,
                        whiteSpace: "pre-line",
                        fontWeight: "bold"
                      }}
                    >
                      {metadata.caption
                        .split(" ")
                        .filter((w) => w.startsWith("#"))
                        .join(" ")}
                    </Typography>
                  )}

                  {/* THUMBNAIL */}
                  {metadata.thumbnail && (
                    <>
                      <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Thumbnail
                      </Typography>
                      <img
                        src={metadata.thumbnail}
                        alt="thumbnail"
                        style={{
                          width: "100px",
                          borderRadius: "10px",
                          marginTop: "10px"
                        }}
                      />
                    </>
                  )}
                </Grid>
              </Grid>
            </Card>
          )}
        </Grid>

      </Grid>
    </Box>
  );
};

export default InstagramExtractor;
