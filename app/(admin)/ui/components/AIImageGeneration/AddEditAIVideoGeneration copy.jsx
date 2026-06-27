import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  MenuItem,
  CircularProgress,
  Grid,
  IconButton,
} from "@mui/material";
import { Close, Download } from "@mui/icons-material";
import { addImage } from "../../utils/indexedDB";
const AddEditAIVideoGeneration = ({ open, onClose, setAlert,setAction,action }) => {
  const apiMetaData = JSON.parse(localStorage.getItem("api_key") || "{}");
  const apiKey = apiMetaData?.api_key || "";
  const [model, setModel] = useState("veo-3.1-generate-preview");
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [prompt, setPrompt] = useState("");
  const [resolution, setResolution] = useState("720p");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(()=>{
console.log('images')
  },[images])

  /* =========================
      Handle Image Upload
  ========================== */
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const base64Images = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result.split(",")[1];
              resolve({
                mimeType: file.type,
                bytesBase64Encoded: base64,
              });
            };
            reader.readAsDataURL(file);
          })
      )
    );
    setImages(base64Images);
  };

  /* =========================
      Generate Video Logic
  ========================== */
  const handleGenerate = async () => {
    if (!apiKey || !prompt) {
      setAlert({ open: true, message: "API Key and Prompt required", severity: "warning" });
      return;
    }

    try {
      setLoading(true);
      setVideoUrl(null);

      const modelId = model;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predictLongRunning?key=${apiKey}`;

      const instance = { prompt: prompt };
      if (images.length > 0) {
        instance.image = {
          bytesBase64Encoded: images[0].bytesBase64Encoded,
          mimeType: images[0].mimeType,
        };
      }

      const body = {
        instances: [instance],
        parameters: { aspectRatio: aspectRatio, sampleCount: 1,resolution: resolution, durationSeconds: Number(durationSeconds) },
      };

      const startRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const startData = await startRes.json();
      if (!startRes.ok) throw new Error(startData.error?.message || "Failed to start");

      let operationName = startData.name;
      let done = false;

      // STEP 2: Polling with your specific response structure
      while (!done) {
        await new Promise((resolve) => setTimeout(resolve, 8000));

        const pollRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`
        );
        const pollData = await pollRes.json();

        if (pollData.done) {
          done = true;
          if (pollData.error) throw new Error(pollData.error.message);

          // EXACT PATH from your debug log:
          // response -> generateVideoResponse -> generatedSamples -> [0] -> video -> uri
          const uri =
            pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;

          if (!uri) throw new Error("Could not find video URI in the response.");

          setVideoUrl(`${uri}&key=${apiKey}`);

          /* =======================
             SAVE TO INDEXED DB
          ======================= */
          const payload = {
            type: "video",
            videoUrl: `${uri}&key=${apiKey}`,
            prompt,
            model,
            aspectRatio,
            referenceImage: images?.[0] || null,
            createdAt: new Date().toISOString(),
          };

          await addImage(payload);
      setAction(!action);

        }
      }

      setAlert({ open: true, message: "Video generated successfully!", severity: "success" });
    } catch (err) {
      console.error("Generation Error:", err);
      setAlert({ open: true, message: err.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    < >
      {/* Header */}
      <Grid container spacing={4}>
        {/* Input Side */}
        <Grid
          size={{
            xs: 12,
            md: 5
          }}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                select
                label="Gemini Model"
                size="small"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <MenuItem value="veo-3.1-generate-preview">
                  VEO 3.1 Generate Preview
                </MenuItem>
                <MenuItem value="veo-3.1-fast-generate-preview">
                  VEO 3.1 Fast Generate Preview
                </MenuItem>
                <MenuItem value="veo-2.0-generate-001">
                  VEO 2.0 Generate 001
                </MenuItem>
              </TextField>
              <TextField
                select
                size="small"

                label="Aspect Ratio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                fullWidth
              >
                <MenuItem value="16:9">16:9 Landscape</MenuItem>
                <MenuItem value="9:16">9:16 Portrait</MenuItem>
              </TextField>
               <TextField
                select
                size="small"

                label="Resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                fullWidth
              >
                <MenuItem value="720p">720p</MenuItem>
                <MenuItem value="1080p">1080p</MenuItem>
                <MenuItem value="4K">4K</MenuItem>
              </TextField>
                <TextField
                size="small"

                label="Duration (seconds)"
                type="number"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value)}
                fullWidth
              />

              <TextField
                label="Prompt"
                multiline
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the motion, lighting, and subject..."
                fullWidth
              />

              <Button variant="outlined" component="label" fullWidth sx={{ borderStyle: 'dashed' }}>
                {images.length > 0 ? "Change Reference Image" : "Upload Image (Optional)"}
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Button>

              {images.length > 0 && (
                <Typography variant="caption" sx={{ mt: -2, color: 'success.main', textAlign: 'center' }}>
                  ✓ Reference image loaded
                </Typography>
              )}

              <Button
                variant="contained"
                onClick={handleGenerate}
                disabled={loading}
                size="large"
                fullWidth
                sx={{ py: 1.5, fontWeight: 600 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Video"}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Preview Side */}
        <Grid
          size={{
            xs: 12,
            md: 7
          }}>
          <Box
            sx={{
              width: "100%",
              aspectRatio: aspectRatio === "16:9" ? "16/9" : aspectRatio === "9:16" ? "9/16" : "1/1",
              bgcolor: "#000",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              position: "relative",
              boxShadow: 3
            }}
          >
            {videoUrl ? (
              <video
                src={`${videoUrl}&key=${apiKey}`}
                controls
                autoPlay
                loop
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <Box color="grey.600" sx={{ textAlign: "center" }}>
                {loading ? (
                  <CircularProgress color="inherit" />
                ) : (
                  <Typography variant="body2">Preview will appear here</Typography>
                )}
              </Box>
            )}
          </Box>

          {videoUrl && (
            <Button
              startIcon={<Download />}
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => window.open(videoUrl, "_blank")}
            >
              Download / Open Video
            </Button>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default AddEditAIVideoGeneration;