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
} from "@mui/material";
import instanceV1 from "../../utils/authaxios";

const SLIDE_DURATION = 300;

const PhotoSelector = () => {
  const [images, setImages] = useState([]);
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

  // ✅ Fetch images (pagination API)
  const fetchUnfilteredImages = async (pageNo = 1) => {
    setIsLoading(true);
    setShowPhoto(false);

    try {
      const authToken = localStorage.getItem("authToken");
      const instance = instanceV1(authToken);

      const res = await instance.get(`/api/crawler/v1/unfilterd/images?page=${pageNo}`);

      if (res.data?.status && res.data?.data?.length > 0) {
        const formatted = res.data.data.map((img) => ({
          id: img.id,
          image: img.image_url,
          restaurantId: img.restaurant_id,
        }));
        setImages(formatted);
        setCurrentIndex(0);
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
    fetchUnfilteredImages(page);
  }, [page]);

  // ✅ Preload next image
  useEffect(() => {
    const nextIndex = currentIndex + 1;
    if (images[nextIndex]) {
      const img = new Image();
      img.src = images[nextIndex].image;
    }
  }, [currentIndex, images]);

  const markAsFiltered = async (imageId) => {
    try {
      await axios.post("https://gp-crawler-3.a2deatsdev.in/api/markImageAsProcessed", {
        id: imageId,
      });
      return true;
    } catch {
      return false;
    }
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
    const blob = await downloadBlob(item.image);
    if (!blob) return;

    try {
      const formData = new FormData();
      formData.append("file", blob, "image.jpg");
      formData.append("uploadType", "cafe_gallery");
      formData.append("cafe_list_id", item.restaurantId);
      formData.append("api_key", "vbdhcweihjcvcjweciuihciqphdcn");

      await axios.post(
        "https://app-admin.a2deatsdev.in/api/admin/crawler/v1/cafe/image",
        formData
      );

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
      setPage((p) => p + 1);
    }

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
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: SLIDE_DURATION / 1000 },
    },
    exit: (dir) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  // ✅ Loading
  if (isLoading)
    return (
      <Box bgcolor="#121212" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress color="primary" size={60} />
      </Box>
    );

  // ✅ Start view
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

  // ✅ Main photo review UI
  return (
    <Box {...handlers} position="relative" bgcolor="#000" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={images[currentIndex]?.id}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{ position: "absolute", width: "90%", maxWidth: "600px" }}
        >
          <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 4 }}>
            <CardMedia
              component="img"
              image={images[currentIndex]?.image}
              alt="cafe"
              sx={{ width: "100%", height: "80vh", objectFit: "cover" }}
            />
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Buttons */}
      <Stack
        direction="row"
        spacing={4}
        position="absolute"
        bottom={30}
        justifyContent="center"
      >
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={() => handleSwipe("left")}
        >
          👎 Skip
        </Button>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={() => handleSwipe("right")}
        >
          👍 Approve
        </Button>
      </Stack>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PhotoSelector;
