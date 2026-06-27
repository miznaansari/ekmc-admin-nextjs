import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const SLIDE_DURATION = 300;

const PhotoSelector = () => {
  const [images, setImages] = useState([]);
  const [cafeId, setCafeId] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = (message, severity = "info", duration = 2000) => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ ...snackbar, open: false }), duration);
  };

  // ✅ Fetch pending image
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "https://gp-crawler-3.a2deatsdev.in/api/getPendingImageRestaurant"
        );
        if (res.data?.success && res.data?.data) {
          const data = res.data.data;
          setCafeId(data.cafe_list_id_eats);
          setRecordId(data.id);
          const parsedImages = JSON.parse(data.imageUrls || "[]");
          setImages(parsedImages);
          showSnackbar("📸 Swipe right to approve, left to skip", "info", 3000);
        } else {
          showSnackbar("No pending images found", "warning");
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        showSnackbar("❌ Failed to fetch images", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Download image in memory (not system)
  const downloadBlob = async (imgUrl) => {
    try {
      const response = await fetch(imgUrl, { cache: "no-store" });
      return await response.blob();
    } catch (error) {
      console.error("Blob fetch failed:", error);
      return null;
    }
  };

  // ✅ Upload after in-memory download
  const uploadImage = async (imgUrl) => {
    try {
      const blob = await downloadBlob(imgUrl);
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "image.jpg");
      formData.append("uploadType", "cafe_gallery");
      formData.append("cafe_list_id", cafeId);
      formData.append("api_key", "vbdhcweihjcvcjweciuihciqphdcn");

      await axios.post(
        "https://app-admin.a2deatsdev.in/api/admin/crawler/v1/cafe/image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      showSnackbar("✅ Image uploaded successfully!", "success");
    } catch (err) {
      console.error("Upload failed:", err);
      showSnackbar("❌ Upload failed!", "error");
    }
  };

  // ✅ Mark processed
  const markAsProcessed = async () => {
    try {
      await axios.post(
        "https://gp-crawler-3.a2deatsdev.in/api/markImageAsProcessed",
        { id: recordId }
      );
      showSnackbar("🎉 All images reviewed!", "success");
      setImages([]);
    } catch (err) {
      showSnackbar("❌ Failed to mark processed", "error");
    }
  };

  // ✅ Handle swipe
  const handleSwipe = async (dir) => {
    if (isAnimating || !images.length) return;
    setIsAnimating(true);
    setDirection(dir === "right" ? 1 : -1);

    const currentImg = images[currentIndex];

    if (dir === "right") {
      showSnackbar("⏫ Uploading...", "info");
      await uploadImage(currentImg);
    } else {
      showSnackbar("⏩ Skipped!", "info");
    }

    const next = currentIndex + 1;
    if (next < images.length) {
      new Image().src = images[next];
      setTimeout(() => setCurrentIndex(next), 80);
    } else {
      await markAsProcessed();
    }

    setTimeout(() => setIsAnimating(false), SLIDE_DURATION + 100);
  };

  // ✅ Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") handleSwipe("right");
      if (e.key === "ArrowLeft") handleSwipe("left");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // ✅ Swipe gestures
  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // ✅ Framer motion variants
  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 250 : -250,
      opacity: 0,
      scale: 1.05,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: SLIDE_DURATION / 1000, ease: "easeOut" },
    },
    exit: (dir) => ({
      x: dir > 0 ? -250 : 250,
      opacity: 0,
      scale: 0.98,
      transition: { duration: SLIDE_DURATION / 1000, ease: "easeIn" },
    }),
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-white bg-black text-xl">
        Loading...
      </div>
    );

  if (!images.length)
    return (
      <div className="flex justify-center items-center h-screen text-gray-400 bg-black">
        No pending images found
      </div>
    );

  return (
    <div
      {...handlers}
      className="relative w-screen h-screen bg-black overflow-hidden select-none"
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.img
          key={`${currentIndex}-${images[currentIndex]}`}
          src={images[currentIndex]}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          alt="cafe"
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            userSelect: "none",
          }}
        />
      </AnimatePresence>

      {/* ✅ Buttons */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-8 pointer-events-none">
        <button
          onClick={() => handleSwipe("left")}
          disabled={isAnimating}
          className={`pointer-events-auto px-8 py-4 text-lg rounded-full font-semibold transition ${
            isAnimating
              ? "bg-gray-700/50 text-gray-400"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          👎 Skip
        </button>
        <button
          onClick={() => handleSwipe("right")}
          disabled={isAnimating}
          className={`pointer-events-auto px-8 py-4 text-lg rounded-full font-semibold transition ${
            isAnimating
              ? "bg-green-600/50 text-gray-300"
              : "bg-green-600 text-white hover:bg-green-500"
          }`}
        >
          👍 Approve
        </button>
      </div>

      {/* ✅ Counter */}
      <div className="absolute top-6 right-6 text-white text-sm bg-black/60 px-4 py-2 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>

      {/* ✅ MUI Snackbar */}
      <Snackbar
        open={snackbar.open}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default PhotoSelector;
