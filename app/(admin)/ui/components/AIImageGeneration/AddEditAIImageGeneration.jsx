import React, { useEffect, useState } from "react";
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

import {
  addImage,
  getLastImage,
  getImageCount,
} from "../../utils/indexedDB";

/* =======================
   LocalStorage Key
======================= */
const API_KEY_STORAGE = "gemini_api_key";

/* =======================
   Supported Models
======================= */
const IMAGE_REFERENCE_SUPPORTED_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-3-pro-image-preview",
];

const AddEditAIImageGeneration = ({
  setAlert,
  action,
  setAction,
}) => {
  const apiMetaData = JSON.parse(localStorage.getItem("api_key") || "{}");

  const [apiKey, setApiKey] = useState(apiMetaData?.api_key || "");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash-image");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageSize, setImageSize] = useState("1K");

  const [referenceImage, setReferenceImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [totalImages, setTotalImages] = useState(0);

  /* =======================
     SUPPORT CHECK
  ======================= */
  const supportsReferenceImage =
    IMAGE_REFERENCE_SUPPORTED_MODELS.includes(model);

  /* =======================
     INIT
  ======================= */
  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE);
    if (savedKey) setApiKey(savedKey);

    getLastImage().then((img) => {
      if (img) setResult(img);
    });

    getImageCount().then(setTotalImages);
  }, []);

  /* =======================
     CLEAR IMAGE IF MODEL CHANGES
  ======================= */
  useEffect(() => {
    if (!supportsReferenceImage) {
      setReferenceImage(null);
    }
  }, [model]);

  /* =======================
     HANDLE IMAGE UPLOAD
  ======================= */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];

      setReferenceImage({
        preview: reader.result,
        mimeType: file.type,
        data: base64,
      });
    };

    reader.readAsDataURL(file);
  };

  /* =======================
     GENERATE IMAGE
  ======================= */
  const handleGenerate = async () => {
    if (!apiKey || !prompt) {
      setAlert({
        open: true,
        message: "Gemini API Key and Prompt are required",
        severity: "warning",
      });
      return;
    }

    try {
      setLoading(true);

      localStorage.setItem(API_KEY_STORAGE, apiKey);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const parts = [{ text: prompt }];

      if (referenceImage && supportsReferenceImage) {
        parts.push({
          inlineData: {
            mimeType: referenceImage.mimeType,
            data: referenceImage.data,
          },
        });
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts,
            },
          ],
          generationConfig: {
            temperature: 0.8,
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: {
              aspectRatio,
              imageSize,
            },
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error: ${res.status} ${errText}`);
      }

      const data = await res.json();

      const imagePart =
        data?.candidates?.[0]?.content?.parts?.find(
          (p) => p.inlineData
        );

      if (!imagePart) {
        setAlert({
          open: true,
          message: "Model returned text only. No image generated.",
          severity: "info",
        });
        return;
      }

      const imageBase64 = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

      const payload = {
        image: imageBase64,
        prompt,
        type: "image",
        model,
        aspectRatio,
        imageSize,
        referenceImage: referenceImage || null,
        createdAt: new Date().toISOString(),
      };

      await addImage(payload);

      setResult(payload);
      setTotalImages((prev) => prev + 1);

      setAlert({
        open: true,
        message: "Image generated successfully!",
        severity: "success",
      });

      setAction(!action);
    } catch (err) {
      console.error(err);
      setAlert({
        open: true,
        message: err.message || "Failed to generate image",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     DOWNLOAD IMAGE
  ======================= */
  const handleDownload = () => {
    if (!result?.image) return;

    const link = document.createElement("a");
    link.href = result.image;
    link.download = `gemini-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* =======================
     UI
  ======================= */
  return (
    <Grid container spacing={2}>
      {/* LEFT PANEL */}
      <Grid
        size={{
          xs: 12,
          md: 6
        }}>
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* API KEY */}
            <Typography variant="body2" color="text.secondary">
              {apiKey
                ? "Using Gemini API Key"
                : "No API Key found"}
            </Typography>

            {/* MODEL */}
            <TextField
              select
              size="small"
              label="Model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <MenuItem value="gemini-2.5-flash-image">
                Gemini 2.5 Flash Image
              </MenuItem>
              <MenuItem value="gemini-3-pro-image-preview">
                Gemini 3 Pro Image
              </MenuItem>
           
            </TextField>

            {/* SETTINGS */}
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
                  <MenuItem value="1:1">1:1</MenuItem>
                  <MenuItem value="16:9">16:9</MenuItem>
                  <MenuItem value="9:16">9:16</MenuItem>
                </TextField>
              </Grid>

              <Grid size={6}>
                <TextField
                  select
                  size="small"
                  label="Resolution"
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="1K">1K</MenuItem>
                  <MenuItem value="2K">2K</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {/* PROMPT */}
            <TextField
              label="Prompt"
              multiline
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            {/* CONDITIONAL UI */}
            {supportsReferenceImage ? (
              <>
                <Button variant="outlined"  sx={{
                borderRadius: "12px",
                borderStyle: "dashed",
              }} component="label">
                  Upload Reference Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>

                {referenceImage && (
                  <Box position="relative">
                    <img
                      src={referenceImage.preview}
                      style={{
                        width: "100%",
                        borderRadius: 10,
                      }}
                    />
                    <IconButton
                      onClick={() => setReferenceImage(null)}
                      sx={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        bgcolor: "black",
                        color: "white",
                      }}
                    >
                      <Close />
                    </IconButton>
                  </Box>
                )}
              </>
            ) : (
              <Typography fontSize={12} color="text.secondary">
                This model does not support reference images
              </Typography>
            )}

            {/* GENERATE */}
            <Button
              onClick={handleGenerate}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : "Generate"}
            </Button>
          </Box>
        </Paper>
      </Grid>
      {/* RIGHT PANEL */}
      <Grid
        size={{
          xs: 12,
          md: 6
        }}>
        {result && (
          <Paper sx={{ p: 2 }}>
            <Typography mb={1}>Generated Image</Typography>

            <Box
              sx={{
                width: "100%",
                aspectRatio: result.aspectRatio,
              }}
            >
              <img
                src={result.image}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>

            <Button fullWidth sx={{ mt: 2 }} onClick={handleDownload}>
              <Download sx={{ mr: 1 }} />
              Download
            </Button>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
};

export default AddEditAIImageGeneration;