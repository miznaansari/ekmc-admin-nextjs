import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const VideoPlayer = ({ url, width = 300 }) => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setLoading(true);

    const onCanPlay = () => {
      setLoading(false);
    };

    const timeout = setTimeout(() => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      }
    }, 5000);

    video.addEventListener("canplay", onCanPlay);

    return () => {
      clearTimeout(timeout);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [url]);

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <video
        ref={videoRef}
        controls
        autoPlay
        style={{ width: "100%", }}
      />
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayer;
