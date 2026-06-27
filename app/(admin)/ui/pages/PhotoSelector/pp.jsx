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
} from "@mui/material";
import instanceV1 from "../../utils/authaxios";
import Logo from '../../assets/logo.png';
import { useTheme } from "@emotion/react";
import { CancelOutlined } from "@mui/icons-material";
const SLIDE_DURATION = 300;

const PhotoSelector = () => {
  const [images, setImages] = useState([]);
  const [nextBatch, setNextBatch] = useState([]); // ✅ preload buffer

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [page, setPage] = useState(1);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = (message, severity = "info", duration = 2000) => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ open: false, message: "", severity }), duration);
  };

  /** ✅ Fetch unfiltered images (supports preload buffer) */
  const fetchUnfilteredImages = async (pageNo = 1, append = false) => {
    try {
      setIsLoading(!append); // only show loading on first load

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
          setNextBatch(formatted); // ✅ store in buffer
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnfilteredImages(page, false); // initial fetch
  }, [page]);

  /** ✅ Preload next page when user reaches 2nd last image */
  useEffect(() => {
    if (currentIndex >= images.length - 2 && nextBatch.length === 0) {
      fetchUnfilteredImages(page + 1, true); // preload silently
    }
  }, [currentIndex, images]);

  /** Preload next image for faster swipe */
  useEffect(() => {
    const nextIndex = currentIndex + 1;
    if (images[nextIndex]) {
      const img = new Image();
      img.src = images[nextIndex].image;
    }
  }, [currentIndex, images]);

  const markAsFiltered = async (imageId) => {

  };

  const downloadBlob = async (url) => {
    try {
      const response = await fetch(url, { cache: "no-store" });
      return await response.blob();
    } catch {
      return null;
    }
  };

  const uploadImage = async (item) => {


    try {

      const token = localStorage.getItem("authToken");
      const instance = instanceV1(token);
      console.log(item)
      const res = await instance.put(`/api/crawler/v1/filter/image/${item.id}`)

      await markAsFiltered(item.id);
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
      await markAsFiltered(item.id);
    }

    const next = currentIndex + 1;

    if (next < images.length) {
      setCurrentIndex(next);
    } else {
      // ✅ End reached → append preloaded batch
      if (nextBatch.length > 0) {
        setImages([...images, ...nextBatch]);
        setNextBatch([]);
        setPage((p) => p + 1);
        setCurrentIndex(next);
      } else {
        setPage((p) => p + 1); // fallback: load normally
      }
    }

    setTimeout(() => setIsAnimating(false), SLIDE_DURATION + 50);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });
  const theme = useTheme();
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
      <Box bgcolor="#121212" color="white" sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h5" gutterBottom>
          📸 Ready to review images?
        </Typography>
        <Button variant="contained" size="large" onClick={() => setShowPhoto(true)}>
          👀 View Photo
        </Button>
      </Box>
    );

  /** ✅ Main UI */
  return (
    <Box {...handlers} position="relative" sx={{ // height: "calc(100dvh - env(safe-area-inset-bottom))",
        // paddingBottom: "env(safe-area-inset-bottom)",
        bgcolor: "#000",
        overflow: "hidden",
        position: "absolute",
        top: 0, left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>

      <Box sx={{ display: 'flex', mb: 2, zIndex: 99999, position: 'absolute', top: 10, left: 10 }} >
        <img src={Logo} alt="Logo" style={{ maxWidth: '50px', marginRight: '15px' }} />
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>EKMC</Typography>
          <Typography variant="subtitle1" component="p" sx={{ color: theme.palette.primary.main }}>PLATFORM</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top) + 8px)", // ✅ prevents overlap with iPhone notch / bar
          right: "12px",
          zIndex: 99999,
        }}
      >
        <IconButton
          onClick={() => setShowPhoto(false)}
        >  {/* optional callback */}
          <CancelOutlined sx={{ fontSize: 32,color:'white' }} />
        </IconButton>
      </Box>

      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={images[currentIndex]?.id}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{ position: "absolute", width: "100%%", maxWidth: "600px" }}
        >
          <Card sx={{ borderRadius: 0, overflow: "hidden", boxShadow: 4 }}>
            <CardMedia
              component="img"
              image={images[currentIndex]?.image}
              alt="cafe"
              sx={{ width: "100%", height: "100dvh", objectFit: "cover" }}
            />
          </Card>
        </motion.div>
      </AnimatePresence>

      <Stack direction="row" spacing={0} position="absolute" bottom={0} width={"100%"} justifyContent="center">
        <Button variant="contained" sx={{ borderRadius: 0, width: '50%' }} color="error" size="large" onClick={() => handleSwipe("left")}>
          👎 Skip
        </Button>
        <Button variant="contained" sx={{ borderRadius: 0, width: '50%' }} color="success" size="medium" onClick={() => handleSwipe("right")}>
          👍 Approve
        </Button>
      </Stack>

      <Snackbar open={snackbar.open} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snackbar.severity} sx={{ width: "100%", mt: 10 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PhotoSelector;
