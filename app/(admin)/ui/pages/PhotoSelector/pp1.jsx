import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  Card,
  CardMedia,
  Stack,
  IconButton,
  Skeleton,
} from "@mui/material";
import { CancelOutlined, BrokenImageOutlined } from "@mui/icons-material";
import instanceV1 from "../../utils/authaxios";
import Logo from "../../assets/logo.png";
import { useTheme } from "@emotion/react";

const SLIDE_DURATION = 300;

const PhotoSelector = () => {
  const [images, setImages] = useState([]);
  const [nextBatch, setNextBatch] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [page, setPage] = useState(1);

  // ✅ image state
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const theme = useTheme();

  const showSnackbar = (message, severity = "info", duration = 3000) => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ open: false, message: "", severity }), duration);
  };

  /** ✅ Fetch unfiltered images (supports preload buffer) */
  const fetchUnfilteredImages = async (pageNo = 1, append = false) => {
    try {
      setImageLoading(!append);

      const authToken = localStorage.getItem("authToken");
      const instance = instanceV1(authToken);

      const res = await instance.get(`/api/crawler/v1/unfilterd/images?page=${pageNo}`);

      if (res.data?.status && res.data?.data?.length > 0) {
        const formatted = res.data.data.map((img) => ({
          id: img.id,
          image: img.image_url,
          restaurantId: img.restaurant_id,
        }));

        if (append) {
          setNextBatch(formatted);
        } else {
          setImages(formatted);
          setCurrentIndex(0);
        }
      } else {
        setIsDone(true);
      }
    } catch (err) {
      showSnackbar("❌ Failed to fetch images", "error");
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    fetchUnfilteredImages(page, false);
  }, [page]);

  /** ✅ Preload next page when near end */
  useEffect(() => {
    if (currentIndex >= images.length - 2 && nextBatch.length === 0) {
      fetchUnfilteredImages(page + 1, true);
    }
  }, [currentIndex, images]);

  /** ✅ Preload next image for smooth swipe */
  useEffect(() => {
    const nextIndex = currentIndex + 1;
    if (images[nextIndex]) {
      const img = new Image();
      img.src = images[nextIndex].image;
    }
  }, [currentIndex, images]);

  const markAsFiltered = async (imageId) => {
    try {
      const token = localStorage.getItem("authToken");
      const instance = instanceV1(token);
      await instance.put(`/api/crawler/v1/filter/image/${imageId}`);
      return true;
    } catch {
      return false;
    }
  };

  const uploadImage = async (item) => {
    try {
      const token = localStorage.getItem("authToken");
      const instance = instanceV1(token);
      await instance.put(`/api/crawler/v1/filter/image/${item.id}`);

      // await markAsFiltered(item.id);
      showSnackbar("✅ Approved & Uploaded!", "success");
    } catch {
      showSnackbar("❌ Upload failed", "error");
    }
  };

  const handleSwipe = async (dir) => {
    if (isAnimating || !images.length) return;
    setIsAnimating(true);
    setDirection(dir === "right" ? 1 : -1);

    const item = images[currentIndex];

    if (dir === "right") {
      showSnackbar("⏫ Uploading...", "info");
      await uploadImage(item);
    } else {
      showSnackbar("⏩ Skipped!", "info");
      // await markAsFiltered(item.id);
    }

    const next = currentIndex + 1;

    if (next < images.length) {
      setCurrentIndex(next);
    } else {
      if (nextBatch.length > 0) {
        setImages([...images, ...nextBatch]);
        setNextBatch([]);
        setPage((p) => p + 1);
        setCurrentIndex(next);
      } else {
        setPage((p) => p + 1);
      }
    }

    setImageError(false);
    setImageLoading(true);

    setTimeout(() => setIsAnimating(false), SLIDE_DURATION + 50);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: SLIDE_DURATION / 1000 } },
    exit: (dir) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  /** ✅ Loading state */
  if (isLoading)
    return (
      <Box bgcolor="#121212" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress color="primary" size={60} />
      </Box>
    );

  /** ✅ Start screen */
  if (!showPhoto)
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Typography variant="h5" gutterBottom>
          Ready to review images?
        </Typography>
        <Button variant="contained" size="large" onClick={() => setShowPhoto(true)}>
          View Photo
        </Button>
      </Box>
    );

  /** ✅ Main UI */
  return (
    <Box {...handlers} position="relative" sx={{ bgcolor: "#fff",
        overflow: "hidden",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* Logo + Title */}
      <Box sx={{ display: "flex", mb: 2, zIndex: 99999, position: "absolute", top: 10, left: 10 }}>
        <img src={Logo} alt="Logo" style={{ maxWidth: "50px", marginRight: "15px" }} />
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
            EKMC
          </Typography>
          <Typography variant="subtitle1" component="p" sx={{ color: theme.palette.primary.main }}>
            PLATFORM
          </Typography>
        </Box>
      </Box>

      {/* Close button */}
      <Box
        sx={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top) + 8px)",
          right: "12px",
          zIndex: 99999,
        }}
      >
        <IconButton onClick={() => setShowPhoto(false)}>
          <CancelOutlined sx={{ fontSize: 32, color: "white", bgcolor:"black",borderRadius:100 }} />
        </IconButton>
      </Box>

      {/* Animated Image */}
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={images[currentIndex]?.id}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{ position: "absolute", width: "100%", maxWidth: "600px" }}
        >
          <Card sx={{ borderRadius: 0, overflow: "hidden", boxShadow: 4 }}>
            {/* ✅ Image loading skeleton */}
            {imageLoading && !imageError && (
              <Box
                sx={{
                  width: "100%",
                  height: "100dvh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#fafafa",
                }}
              >
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{ color: "primary.main" }}
                />
              </Box>
            )}


            {/* ✅ Error state */}
            {imageError && (
              <Box bgcolor="#111" color="white" sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100dvh" }}>
                <BrokenImageOutlined sx={{ fontSize: 80, color: "#ff5252", mb: 2 }} />
                <Typography variant="h6">Failed to load image</Typography>
                <Typography variant="body2" color="gray">
                  Try swiping to the next photo
                </Typography>
              </Box>
            )}

            {/* ✅ Actual Image */}
            {!imageError && (
              <CardMedia
                component="img"
                image={images[currentIndex]?.image}
                alt="cafe"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
                sx={{
                  width: "100%",
                  height: "100dvh",
                  objectFit: "cover",
                  display: imageLoading ? "none" : "block",
                }}
              />
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Buttons */}
      <Stack direction="row" spacing={0} position="absolute" bottom={0} width={"100%"} justifyContent="center">
        <Button variant="contained" sx={{ borderRadius: 0, width: "50%" }} color="error" size="large" onClick={() => handleSwipe("left")}>
          👎 Skip
        </Button>
        <Button variant="contained" sx={{ borderRadius: 0, width: "50%" }} color="success" size="large" onClick={() => handleSwipe("right")}>
          👍 Approve
        </Button>
      </Stack>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snackbar.severity} sx={{ width: "100%", mt: 10 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PhotoSelector;
