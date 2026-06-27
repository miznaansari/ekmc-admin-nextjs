import React, { useState } from "react";
import {
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

const AddEditAIVideoGeneration = ({ setAlert, setAction, action }) => {
  const apiMetaData = JSON.parse(localStorage.getItem("api_key") || "{}");
  const apiKey = apiMetaData?.api_key || "";

  const [model, setModel] = useState("veo-2.0-generate-001");
  const [durationSeconds, setDurationSeconds] = useState(8);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [prompt, setPrompt] = useState("");
  const [resolution, setResolution] = useState("720p");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  /* =========================
      HANDLE MULTIPLE IMAGE UPLOAD
  ========================== */
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const base64Images = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result.split(",")[1];
              resolve({
                file,
                preview: reader.result,
                mimeType: file.type,
                bytesBase64Encoded: base64,
              });
            };
            reader.readAsDataURL(file);
          })
      )
    );

    // Append images
    setImages((prev) => [...prev, ...base64Images]);
  };

  /* =========================
      REMOVE SINGLE IMAGE
  ========================== */
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* =========================
      GENERATE VIDEO
  ========================== */
  const handleGenerate = async () => {
    if (!apiKey || !prompt) {
      setAlert({
        open: true,
        message: "API Key and Prompt required",
        severity: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      setVideoUrl(null);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning?key=${apiKey}`;

      const instance = { prompt };

      // currently using first image (API safe)
      if (images.length > 0) {
        instance.image = {
          bytesBase64Encoded: images[0].bytesBase64Encoded,
          mimeType: images[0].mimeType,
        };
      }

      const body = {
        instances: [instance],
        parameters: {
          aspectRatio,
          sampleCount: 1,
          resolution,
          durationSeconds: Number(durationSeconds),
        },
      };

      const startRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const startData = await startRes.json();
      if (!startRes.ok) throw new Error(startData.error?.message);

      let operationName = startData.name;
      let done = false;

      while (!done) {
        await new Promise((r) => setTimeout(r, 8000));

        const pollRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`
        );

        const pollData = await pollRes.json();

        if (pollData.done) {
          done = true;

          const uri =
            pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;

          if (!uri) throw new Error("Video not found");

          setVideoUrl(`${uri}&key=${apiKey}`);

          await addImage({
            type: "video",
            videoUrl: `${uri}&key=${apiKey}`,
            prompt,
            model,
            aspectRatio,
            referenceImage: images?.[0] || null,
            createdAt: new Date().toISOString(),
          });

          setAction(!action);
        }
      }

      setAlert({
        open: true,
        message: "Video generated successfully!",
        severity: "success",
      });
    } catch (err) {
      setAlert({
        open: true,
        message: err.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={2}>
      {/* ================= LEFT PANEL ================= */}
      <Grid
        size={{
          xs: 12,
          md: 6
        }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: "20px",
            backdropFilter: "blur(12px)",
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
 {apiKey === "" ? (
              <Typography variant="body2" color="text.secondary">
                No Gemini API Key found. Please add it in Account Settings.
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Using Gemini API Key from Account Settings.
              </Typography>
            )}
            {/* MODEL */}
            <TextField
              select
              size="small"
              label="Model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <MenuItem value="veo-3.1-generate-preview">VEO 3.1</MenuItem>
              <MenuItem value="veo-3.1-fast-generate-preview">VEO Fast</MenuItem>
              <MenuItem value="veo-2.0-generate-001">VEO 2.0</MenuItem>
            </TextField>

            {/* RATIO + RESOLUTION */}
            <Grid container spacing={1}>
              <Grid size={6}>
                <TextField
                  select
                  size="small"
                  label="Ratio"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="16:9">16:9</MenuItem>
                  <MenuItem value="9:16">9:16</MenuItem>
                </TextField>
              </Grid>

              <Grid size={6}>
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
              </Grid>
            </Grid>

            {/* DURATION */}
            <TextField
                  select
                  size="small"
                  label="Duration"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="5">5s</MenuItem>
                  <MenuItem value="8">8s</MenuItem>
                </TextField>

            {/* PROMPT */}
            <TextField
              label="Prompt"
              multiline
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe cinematic motion..."
            />

            {/* UPLOAD */}
            <Button
              variant="outlined"
              component="label"
              sx={{
                borderRadius: "12px",
                borderStyle: "dashed",
              }}
            >
              Upload Reference Image
              <input
                type="file"
                hidden
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
            </Button>

            {/* THUMBNAILS */}
            {images.length > 0 && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    overflowX: "auto",
                  }}
                >
                  {images.map((img, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: "relative",
                        minWidth: 90,
                        height: 70,
                        borderRadius: "12px",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={img.preview}
                        alt="preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />

                      <IconButton
                        size="small"
                        onClick={() => removeImage(index)}
                        sx={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          bgcolor: "rgba(0,0,0,0.7)",
                          color: "#fff",
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>

                <Typography variant="caption">
                  {images.length} image(s) selected
                </Typography>
              </>
            )}

            {/* GENERATE */}
            <Button
              onClick={handleGenerate}
              disabled={loading}
              variant="contained"
              sx={{
                py: 1.4,
                borderRadius: "14px",
                fontWeight: 600,
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Generate Video"
              )}
            </Button>
          </Box>
        </Paper>
      </Grid>
      {/* ================= RIGHT PANEL ================= */}
      <Grid
        size={{
          xs: 12,
          md: 6
        }}>
        <Box
          sx={{
            width: "100%",
            aspectRatio:
              aspectRatio === "16:9"
                ? "16/9"
                : aspectRatio === "9:16"
                ? "9/16"
                : "1/1",
            bgcolor: "#000",
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              style={{ width: "100%", height: "100%" }}
            />
          ) : loading ? (
            <CircularProgress sx={{ color: "#fff" }} />
          ) : (
            <Typography color="#aaa">Preview</Typography>
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
  );
};

export default AddEditAIVideoGeneration;