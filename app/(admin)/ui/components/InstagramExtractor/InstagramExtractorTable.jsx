import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Typography,
  Box,
  Grid,
  Select,
  MenuItem,
  Pagination,
  IconButton,
  Chip,
  Menu,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Avatar,
  Badge,
  Grow,
  CircularProgress,
  TextField,
  useMediaQuery,
} from "@mui/material";
import Hls from "hls.js";

import { MoreVertical24Filled } from "@fluentui/react-icons";
import instanceV1 from "../../restaurant/authaxios";
import GlobalSnackbar from "../../utils/GlobalSnackbar";

import { Videocam, PlayArrow, Close, VolumeUp, VolumeOff, Check, Block, Fullscreen, FullscreenExit } from "@mui/icons-material";

const ReelPreview = ({ reel }) => {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const videoUrl = reel.video_url || reel.cf_stream_url;
  const thumbnailUrl = reel.reel_thumbnail;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl || !hovered) {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    if (videoUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        video.play().catch(() => {});
      }
    } else {
      video.src = videoUrl;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hovered, videoUrl]);

  const hasVideo = !!videoUrl;
  const hasThumbnail = !!thumbnailUrl;

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        width: 80,
        height: 100,
        borderRadius: 1,
        overflow: "hidden",
        position: "relative",
        bgcolor: "#eaeaea",
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: 1,
        cursor: "pointer"
      }}
    >
      {/* Thumbnail Image */}
      {hasThumbnail && (!hovered || !hasVideo) && (
        <Box
          component="img"
          src={thumbnailUrl}
          alt="Thumbnail"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      )}

      {/* Hover Video Player */}
      {hasVideo && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            opacity: hovered || !hasThumbnail ? 1 : 0,
            pointerEvents: "none",
            backgroundColor: "#000",
            transition: "opacity 0.2s ease-in-out"
          }}
        />
      )}

      {/* Fallback Icon if nothing is loaded */}
      {!hasThumbnail && !hasVideo && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
          <Videocam sx={{ color: "text.secondary", fontSize: 24 }} />
          <Typography variant="caption" color="textSecondary" sx={{ fontSize: 9 }}>
            Pending
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const ReelGridItem = ({
  reel,
  isPlaying,
  onPlay,
  setEditData,
  setOpenDrawer,
  getStatusChip,
  setAction,
  action,
  setAlert,
  setData,
}) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectOptions, setShowRejectOptions] = useState(false);
  const [customReason, setCustomReason] = useState("");

  const videoUrl = reel.video_url || reel.cf_stream_url;
  const thumbnailUrl = reel.reel_thumbnail;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl || !isPlaying) {
      if (video) {
        video.pause();
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    if (videoUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        video.play().catch(() => {});
      }
    } else {
      video.src = videoUrl;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isPlaying, videoUrl]);

  const handleInstantReject = async (reason) => {
    try {
      setRejecting(true);

      // Optimistic update of local state in parent
      if (setData) {
        setData((prevData) => {
          return prevData.map((profile) => {
            if (profile.id === reel.profile_id) {
              return {
                ...profile,
                reels: (profile.reels || []).map((r) => {
                  if (r.id === reel.id) {
                    return { ...r, is_processed: 1, is_rejected: 1, reject_reason: reason };
                  }
                  return r;
                }),
              };
            }
            return profile;
          });
        });
      }

      const token = localStorage.getItem("authToken");
      const api = instanceV1(token);
      await api.put(`/api/admin/crawler/v1/insta/status/${reel.id}`, {
        is_rejected: 1,
        reject_reason: reason,
      });

      setAlert({
        open: true,
        message: "Reel rejected instantly!",
        severity: "success",
      });
      setShowRejectOptions(false);
      if (setAction) setAction(!action);
    } catch (err) {
      console.error(err);
      setAlert({
        open: true,
        message: err?.response?.data?.msg || "Failed to reject reel",
        severity: "error",
      });
    } finally {
      setRejecting(false);
    }
  };

  const hasVideo = !!videoUrl;
  const hasThumbnail = !!thumbnailUrl;
  const { label, color } = getStatusChip(reel);

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: 2,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Video / Thumbnail Container (16:9 aspect ratio, showing portrait 9:16 video contained) */}
      <Box
        onClick={onPlay}
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%", // 16:9 aspect ratio
          bgcolor: "#000",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        {/* Background Image / Thumbnail */}
        {hasThumbnail && !isPlaying && (
          <Box
            component="img"
            src={thumbnailUrl}
            alt="Reel Thumbnail"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        )}

        {/* Play Video Player */}
        {hasVideo && (isPlaying || (!hasThumbnail && hasVideo)) && (
          <video
            ref={videoRef}
            controls={isPlaying}
            autoPlay={isPlaying}
            muted={!isPlaying}
            loop
            playsInline
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#000",
            }}
          />
        )}

        {/* Default Play Icon Overlay */}
        {!isPlaying && hasVideo && (
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
              background: "rgba(0, 0, 0, 0.2)",
              opacity: 0.8,
              transition: "opacity 0.2s",
              "&:hover": {
                opacity: 1,
                background: "rgba(0, 0, 0, 0.3)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                boxShadow: 2,
              }}
            >
              <PlayArrow sx={{ color: "primary.main", fontSize: 24 }} />
            </Box>
          </Box>
        )}

        {/* Fallback Icon if nothing is loaded */}
        {!hasThumbnail && !hasVideo && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
              bgcolor: "#222",
            }}
          >
            <Videocam sx={{ color: "text.secondary", fontSize: 28 }} />
            <Typography variant="caption" color="text.secondary">
              Pending Crawl
            </Typography>
          </Box>
        )}

        {/* Status Overlay top left */}
        <Box sx={{ position: "absolute", top: 8, left: 8, zIndex: 10 }}>
          <Chip
            label={label}
            color={color}
            size="small"
            sx={{ fontWeight: 600, boxShadow: 1, height: 22, fontSize: "0.7rem" }}
          />
        </Box>
      </Box>

      {/* Reel Card Actions (Compact Bottom Area) */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography
          variant="caption"
          fontWeight="600"
          color="text.secondary"
          sx={{
            display: "block",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={reel.raw_video_url}
        >
          Reel ID: #{reel.id} • {reel.raw_video_url}
        </Typography>

        {rejecting ? (
          <Box py={1} sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress size={20} />
          </Box>
        ) : showRejectOptions ? (
          <Box>
            <Typography variant="caption" fontWeight="700" color="error.main" sx={{ display: "block", mb: 1 }}>
              Select Reject Reason:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {[
                "Reel not related to restaurant",
                "Low quality",
                "Copyright issue",
                "Other reason",
              ].map((reason) => (
                <Button
                  key={reason}
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{
                    textTransform: "none",
                    justifyContent: "flex-start",
                    fontSize: "0.7rem",
                    py: 0.25,
                  }}
                  onClick={() => handleInstantReject(reason)}
                >
                  {reason}
                </Button>
              ))}

              {/* Custom Reason Input Field */}
              <Box sx={{ mt: 1.5, display: "flex", gap: 0.5, alignItems: "center" }}>
                <TextField
                  placeholder="Or type custom reason..."
                  size="small"
                  fullWidth
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "0.75rem",
                      py: 0.75,
                      px: 1,
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => {
                    if (customReason.trim()) {
                      handleInstantReject(customReason.trim());
                    }
                  }}
                  disabled={!customReason.trim()}
                  sx={{
                    minWidth: 45,
                    fontSize: "0.75rem",
                    py: 0.75,
                    px: 1,
                    textTransform: "none",
                  }}
                >
                  Reject
                </Button>
              </Box>

              <Button
                variant="text"
                size="small"
                color="secondary"
                sx={{ textTransform: "none", mt: 0.5, fontSize: "0.7rem" }}
                onClick={() => {
                  setShowRejectOptions(false);
                  setCustomReason("");
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            {reel.is_processed !== 1 ? (
              <Typography variant="caption" color="text.secondary" fontWeight="500">
                Media data is currently fetching...
              </Typography>
            ) : reel.is_rejected === 1 ? (
              <Box
                sx={{
                  width: "100%",
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "error.light",
                  color: "error.contrastText",
                }}
              >
                <Typography variant="caption" fontWeight="600" sx={{ display: "block" }}>
                  Reason: {reel.reject_reason || "None specified"}
                </Typography>
              </Box>
            ) : reel.is_approved === 1 ? (
              <Typography variant="caption" color="success.main" fontWeight="600">
                Approved & Added to Eatshots
              </Typography>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  fullWidth
                  sx={{ textTransform: "none", fontWeight: 600 }}
                  onClick={() => {
                    setEditData(reel);
                    setOpenDrawer(true);
                  }}
                >
                  Approve / Check
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  fullWidth
                  sx={{ textTransform: "none", fontWeight: 600 }}
                  onClick={() => setShowRejectOptions(true)}
                >
                  Reject
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ==========================================
// REPLICATED INSTAGRAM REELS FEED VIEW
// ==========================================

const InstagramReelCard = ({
  reel,
  isActive,
  isMuted,
  onMuteToggle,
  setEditData,
  setOpenDrawer,
  action,
  setAction,
  setAlert,
  setData,
  username,
  avatar,
  isFullScreen,
  setIsFullScreen,
}) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [showVolumeBadge, setShowVolumeBadge] = useState(false);
  const [showRejectOverlay, setShowRejectOverlay] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [customRejectReason, setCustomRejectReason] = useState("");
  const [expandedCaption, setExpandedCaption] = useState(false);

  const videoUrl = reel.video_url || reel.cf_stream_url;

  // Handle active status changes
  useEffect(() => {
    setIsPlaying(isActive);
  }, [isActive]);

  // Handle play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    if (!isActive || !isPlaying) {
      video.pause();
      if (!isActive) {
        video.currentTime = 0;
      }
      return;
    }

    video.muted = isMuted;

    if (videoUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((err) => console.log("HLS play error:", err));
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        video.play().catch((err) => console.log("Native HLS play error:", err));
      }
    } else {
      if (video.src !== videoUrl) {
        video.src = videoUrl;
      }
      video.play().catch((err) => console.log("MP4 play error:", err));
    }
  }, [isActive, isPlaying, videoUrl, isMuted]);

  // Handle volume mute dynamically without rebuilding HLS
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  const handleVideoClick = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleMuteClick = (e) => {
    e.stopPropagation();
    onMuteToggle();
    setShowVolumeBadge(true);
    setTimeout(() => {
      setShowVolumeBadge(false);
    }, 800);
  };

  const handleRejectSubmit = async (reason) => {
    if (!reason || !reason.trim()) return;
    try {
      setRejecting(true);

      // Optimistic update of local state in parent
      if (setData) {
        setData((prevData) => {
          return prevData.map((profile) => {
            if (profile.id === reel.profile_id) {
              return {
                ...profile,
                reels: (profile.reels || []).map((r) => {
                  if (r.id === reel.id) {
                    return { ...r, is_processed: 1, is_rejected: 1, reject_reason: reason };
                  }
                  return r;
                }),
              };
            }
            return profile;
          });
        });
      }

      const token = localStorage.getItem("authToken");
      const api = instanceV1(token);
      await api.put(`/api/admin/crawler/v1/insta/status/${reel.id}`, {
        is_rejected: 1,
        reject_reason: reason,
      });

      setAlert({
        open: true,
        message: "Reel rejected successfully!",
        severity: "success",
      });
      setShowRejectOverlay(false);
      if (setAction) setAction(!action);
    } catch (err) {
      console.error(err);
      setAlert({
        open: true,
        message: err?.response?.data?.msg || "Failed to reject reel",
        severity: "error",
      });
    } finally {
      setRejecting(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        position: "relative",
        bgcolor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        loop
        playsInline
        preload="auto"
        onClick={handleVideoClick}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          cursor: "pointer",
        }}
      />

      {/* Play indicator */}
      {!isPlaying && (
        <Box
          onClick={handleVideoClick}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0,0,0,0.15)",
            zIndex: 2,
          }}
        >
          <PlayArrow sx={{ color: "rgba(255,255,255,0.8)", fontSize: 60 }} />
        </Box>
      )}

      {/* Floating Sound Toggle */}
      <IconButton
        onClick={handleMuteClick}
        sx={{
          position: "absolute",
          top: 15,
          right: 15,
          bgcolor: "rgba(0, 0, 0, 0.5)",
          color: "#fff",
          zIndex: 3,
          "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
        }}
      >
        {isMuted ? <VolumeOff /> : <VolumeUp />}
      </IconButton>

      {/* Mobile Full Screen / Exit Button */}
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          setIsFullScreen(!isFullScreen);
        }}
        sx={{
          position: "absolute",
          top: 65,
          right: 15,
          bgcolor: "rgba(0, 0, 0, 0.5)",
          color: "#fff",
          zIndex: 3,
          display: "flex", // Show on all screen sizes
          "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
        }}
      >
        {isFullScreen ? <Close /> : <Fullscreen />}
      </IconButton>

      {/* Volume indicator badge */}
      {showVolumeBadge && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "rgba(0,0,0,0.6)",
            borderRadius: "50%",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            animation: "fadeOut 0.8s ease-in-out forwards",
            "@keyframes fadeOut": {
              "0%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
              "70%": { opacity: 1 },
              "100%": { opacity: 0, transform: "translate(-50%, -50%) scale(1.2)" },
            },
          }}
        >
          {isMuted ? (
            <VolumeOff sx={{ color: "#fff", fontSize: 40 }} />
          ) : (
            <VolumeUp sx={{ color: "#fff", fontSize: 40 }} />
          )}
        </Box>
      )}

      {/* Bottom Info Gradient Overlay */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%)",
          p: 2.5,
          pb: 3,
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          color: "#fff",
          pointerEvents: "none",
        }}
      >
        {/* Profile info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pointerEvents: "auto" }}>
          <Avatar
            src={avatar}
            alt={username}
            sx={{ width: 34, height: 34, border: "2px solid #fff" }}
          />
          <Typography variant="subtitle2" fontWeight="700" sx={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}>
            @{username || "Pending"}
          </Typography>
        </Box>

        {/* Reel ID & Info */}
        <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}>
          Reel ID: #{reel.id}
        </Typography>

        {/* Caption */}
        {reel.caption && (
          <Box sx={{ pointerEvents: "auto" }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.85rem",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: expandedCaption ? "none" : 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
              }}
            >
              {reel.caption}
            </Typography>
            {reel.caption.length > 80 && !expandedCaption && (
              <Typography
                variant="caption"
                onClick={() => setExpandedCaption(true)}
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "block",
                  mt: 0.5,
                }}
              >
                more
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Right Actions Overlay */}
      <Box
        sx={{
          position: "absolute",
          right: 12,
          bottom: 90,
          zIndex: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "center",
        }}
      >
        {/* Approve button */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setEditData(reel);
              setOpenDrawer(true);
            }}
            sx={{
              width: 48,
              height: 48,
              bgcolor: "rgba(46, 125, 50, 0.95)",
              color: "#fff",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
              transition: "transform 0.15s ease",
              "&:hover": {
                bgcolor: "success.main",
                transform: "scale(1.1)",
              },
            }}
          >
            <Check sx={{ fontSize: 26 }} />
          </IconButton>
          <Typography variant="caption" sx={{ color: "#fff", fontSize: "0.68rem", fontWeight: 700, textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}>
            Approve
          </Typography>
        </Box>

        {/* Reject button */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setShowRejectOverlay(true);
            }}
            sx={{
              width: 48,
              height: 48,
              bgcolor: "rgba(211, 47, 47, 0.95)",
              color: "#fff",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
              transition: "transform 0.15s ease",
              "&:hover": {
                bgcolor: "error.main",
                transform: "scale(1.1)",
              },
            }}
          >
            <Block sx={{ fontSize: 22 }} />
          </IconButton>
          <Typography variant="caption" sx={{ color: "#fff", fontSize: "0.68rem", fontWeight: 700, textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}>
            Reject
          </Typography>
        </Box>
      </Box>

      {/* Reject Overlay */}
      {showRejectOverlay && (
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(12px)",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            p: 3,
            color: "#fff",
          }}
        >
          <Typography variant="subtitle1" fontWeight="700" color="error.main" sx={{ mb: 1 }}>
            Reject Reel #{reel.id}
          </Typography>
          <Typography variant="caption" sx={{ mb: 2, color: "rgba(255,255,255,0.7)" }}>
            Select reason for rejection:
          </Typography>

          {rejecting ? (
            <Box py={4} sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress size={30} sx={{ color: "error.main" }} />
            </Box>
          ) : (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8, mb: 2.5 }}>
                {[
                  "Reel not related to restaurant",
                  "Reel not related to our requirement",
                  "Low video quality",
                  "Copyright issue",
                  "Other reason",
                ].map((reason) => (
                  <Button
                    key={reason}
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{
                      textTransform: "none",
                      justifyContent: "flex-start",
                      color: "#fff",
                      fontSize: "0.75rem",
                      py: 0.75,
                      borderColor: "rgba(211, 47, 47, 0.4)",
                      "&:hover": {
                        borderColor: "error.main",
                        bgcolor: "rgba(211, 47, 47, 0.15)",
                      },
                    }}
                    onClick={() => handleRejectSubmit(reason)}
                  >
                    {reason}
                  </Button>
                ))}
              </Box>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  placeholder="Or type custom reason..."
                  size="small"
                  fullWidth
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  sx={{
                    input: { color: "#fff", fontSize: "0.78rem" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      "& hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                      "&.Mui-focused fieldset": { borderColor: "error.main" },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  disabled={!customRejectReason.trim()}
                  onClick={() => handleRejectSubmit(customRejectReason.trim())}
                  sx={{
                    textTransform: "none",
                    px: 2,
                    fontSize: "0.78rem",
                    py: 1,
                  }}
                >
                  Reject
                </Button>
              </Box>

              <Button
                variant="text"
                sx={{ color: "rgba(255,255,255,0.5)", mt: 3, textTransform: "none", fontSize: "0.8rem" }}
                onClick={() => {
                  setShowRejectOverlay(false);
                  setCustomRejectReason("");
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

const InstagramReelsFeed = ({
  sidebarProfiles,
  selectedProfileId,
  setSelectedProfileId,
  selectedProfile,
  setEditData,
  setOpenDrawer,
  action,
  setAction,
  setAlert,
  setViewMode,
  setData,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Filter reels of selected profile to only show "Ready" reels
  const readyReels = useMemo(() => {
    if (!selectedProfile) return [];
    return (selectedProfile.reels || []).filter(
      (reel) => reel.is_processed === 1 && reel.is_rejected === 0 && reel.is_approved === 0
    );
  }, [selectedProfile]);

  // Reset active index when selected profile changes
  useEffect(() => {
    setActiveCardIndex(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedProfileId]);

  const handleScroll = (e) => {
    const container = e.target;
    const scrollTop = container.scrollTop;
    const cardHeight = container.clientHeight;
    if (cardHeight > 0) {
      const index = Math.round(scrollTop / cardHeight);
      if (index !== activeCardIndex && index >= 0 && index < readyReels.length) {
        setActiveCardIndex(index);
      }
    }
  };

  const handleMuteToggle = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <Box sx={{ width: "100%", pb: 4, position: "relative" }}>
      {/* Top Header - stories and Close button */}
      {!isFullScreen && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 1,
            mb: 2,
            gap: 2,
          }}
        >
          <Typography variant="h6" fontWeight="700">
            Instagram Feed View
          </Typography>

          {/* Close/Cancel Button */}
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={<Close />}
            onClick={() => setViewMode("profiles")}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
        </Box>
      )}

      {/* Stories list */}
      {!isFullScreen && (
        <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 3,
          py: 1.5,
          px: 1,
          mb: 3.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {sidebarProfiles.map((prof) => {
          const isActive = prof.id === selectedProfileId;
          const readyCount = (prof.reels || []).filter(
            (r) => r.is_processed === 1 && r.is_rejected === 0 && r.is_approved === 0
          ).length;
          const initials = (prof.username || "P").substring(0, 2).toUpperCase();

          return (
            <Box
              key={prof.id}
              onClick={() => {
                setSelectedProfileId(prof.id);
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                minWidth: 90,
                textAlign: "center",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              {/* Avatar Circle with Instagram Ring */}
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: "3px",
                  background: isActive
                    ? "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
                    : "linear-gradient(180deg, #eaeaea, #cccccc)",
                  boxShadow: isActive ? "0 4px 10px rgba(220, 39, 67, 0.3)" : "none",
                }}
              >
                <Avatar
                  src={prof.instagram_user_profile}
                  sx={{
                    width: 60,
                    height: 60,
                    border: "3px solid #fff",
                    bgcolor: isActive ? "primary.main" : "grey.400",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                >
                  {initials}
                </Avatar>
              </Box>

              {/* Username */}
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "primary.main" : "text.primary",
                  fontSize: "0.75rem",
                  maxWidth: 85,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={prof.username}
              >
                @{prof.username || "Pending"}
              </Typography>

              {/* Ready Reels Count Badge */}
              <Chip
                label={`${readyCount} Ready`}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 18,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  backgroundColor: isActive ? "success.main" : "action.selected",
                  color: isActive ? "#fff" : "text.secondary",
                  cursor: "pointer",
                }}
              />
            </Box>
          );
        })}
      </Box>
      )}

      {/* Reels Feed Container */}
      {selectedProfile ? (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 2 }}>
          {readyReels.length > 0 ? (
            <Box
              sx={
                isFullScreen
                  ? {
                      width: "100vw",
                      height: "100vh",
                      bgcolor: "#121212",
                      position: "fixed",
                      top: 0,
                      left: 0,
                      zIndex: 1300,
                      borderRadius: 0,
                      border: "none",
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }
                  : {
                      width: "100%",
                      maxWidth: { xs: "100%", sm: 380 },
                      height: { xs: "calc(100vh - 280px)", sm: 650 },
                      minHeight: { sm: 580 },
                      bgcolor: "#000",
                      borderRadius: { xs: "12px", sm: "20px" },
                      border: { sm: "8px solid #1a1a1a" },
                      boxShadow: { sm: "0 15px 35px rgba(0,0,0,0.3)" },
                      overflow: "hidden",
                      position: "relative",
                    }
              }
            >
              {/* Vertical Scroll Viewport */}
              <Box
                ref={scrollContainerRef}
                onScroll={handleScroll}
                sx={{
                  width: "100%",
                  maxWidth: isFullScreen ? { xs: "100%", sm: 450 } : "100%",
                  height: "100%",
                  overflowY: "scroll",
                  scrollSnapType: "y mandatory",
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {readyReels.map((reel, index) => {
                  // Only render the active, previous, and next two cards to save memory & pre-buffer
                  const isVisible = Math.abs(index - activeCardIndex) <= 2;
                  if (!isVisible) {
                    return (
                      <Box
                        key={reel.id}
                        sx={{
                          width: "100%",
                          height: "100%",
                          scrollSnapAlign: "start",
                          scrollSnapStop: "always",
                          bgcolor: "#000",
                        }}
                      />
                    );
                  }

                  return (
                    <InstagramReelCard
                      key={reel.id}
                      reel={reel}
                      isActive={index === activeCardIndex}
                      isMuted={isMuted}
                      onMuteToggle={handleMuteToggle}
                      setEditData={setEditData}
                      setOpenDrawer={setOpenDrawer}
                      action={action}
                      setAction={setAction}
                      setAlert={setAlert}
                      setData={setData}
                      username={selectedProfile.username}
                      avatar={selectedProfile.instagram_user_profile}
                      isFullScreen={isFullScreen}
                      setIsFullScreen={setIsFullScreen}
                    />
                  );
                })}
              </Box>
            </Box>
          ) : (
            <Box sx={{ py: 12, textAlign: "center" }}>
              <Typography color="textSecondary" variant="body1">
                No "Ready" reels found for this profile.
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ py: 12, textAlign: "center" }}>
          <Typography color="textSecondary" variant="body1">
            Please select a profile to view ready reels.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const InstagramExtractorTable = ({ searchTerm = "", setEditData, setOpenDrawer, action, setAction }) => {
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [data, setData] = useState([]);
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("profiles");
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [playingReelId, setPlayingReelId] = useState(null);
  const [reelFilter, setReelFilter] = useState("all");

  useEffect(() => {
    if (data && data.length > 0 && selectedProfileId === null) {
      setSelectedProfileId(data[0].id);
    }
  }, [data, selectedProfileId]);

  // Sorting
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("full_name");

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // Collapse state
  const [openRowId, setOpenRowId] = useState(null);

  useEffect(() => {
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // -----------------------------------
  // FETCH API
  // -----------------------------------
  const fetchProfiles = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem("authToken");
      const api = instanceV1(token);

      const res = await api.get(
        `/api/admin/crawler/v1/insta/data?page=${page}&limit=${rowsPerPage}`
      );

      const list = res.data?.response?.data || [];

      const formatted = list.map((row) => ({
        ...row,
        status_text: row.is_processed === 1 ? "Done" : "Queue",
        full_name: `${row.first_name || ""} ${row.last_name || ""}`.trim(),
      }));

      const currentDataStr = JSON.stringify(dataRef.current);
      const newDataStr = JSON.stringify(formatted);
      if (currentDataStr !== newDataStr) {
        setData(formatted);
      }
      setTotalPages(res.data?.response?.lastPage || 1);
      setError(null);
    } catch (err) {
      setError("Failed to load profiles");
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to load profiles",
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles(true);
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchProfiles(false);

    const interval = setInterval(() => {
      fetchProfiles(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [action]);

  // Sorting
  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const sortData = (array) => {
    return array.sort((a, b) => {
      if (orderBy === "follower") {
        const valA = a[orderBy] !== null && a[orderBy] !== undefined ? Number(a[orderBy]) : -1;
        const valB = b[orderBy] !== null && b[orderBy] !== undefined ? Number(b[orderBy]) : -1;
        return order === "asc" ? valA - valB : valB - valA;
      }
      const A = String(a[orderBy] || "").toLowerCase();
      const B = String(b[orderBy] || "").toLowerCase();
      return order === "asc" ? (A > B ? 1 : -1) : (A < B ? 1 : -1);
    });
  };

  // Search
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  const tableData = useMemo(() => sortData([...filteredData]), [
    filteredData,
    order,
    orderBy,
  ]);

  // Flat list of reels from current fetched profiles (data)
  const allReels = useMemo(() => {
    const list = [];
    data.forEach((profile) => {
      if (profile.reels && Array.isArray(profile.reels)) {
        profile.reels.forEach((reel) => {
          list.push({
            ...reel,
            profile_id: profile.id,
            profile_name: profile.full_name,
            profile_username: profile.username,
          });
        });
      }
    });
    return list;
  }, [data]);

  // Filter reels based on search term
  const filteredReels = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return allReels;
    return allReels.filter((reel) => {
      return (
        String(reel.profile_username || "").toLowerCase().includes(term) ||
        String(reel.profile_name || "").toLowerCase().includes(term) ||
        String(reel.raw_video_url || "").toLowerCase().includes(term) ||
        String(reel.reject_reason || "").toLowerCase().includes(term)
      );
    });
  }, [allReels, searchTerm]);

  // Default sort for reels: unprocessed/Queue first, then newer first
  const sortedReels = useMemo(() => {
    return [...filteredReels].sort((a, b) => {
      const aProcessed = a.is_processed === 1;
      const bProcessed = b.is_processed === 1;
      if (aProcessed !== bProcessed) {
        return aProcessed ? 1 : -1;
      }
      return b.id - a.id;
    });
  }, [filteredReels]);

  // Sidebar profiles filtered by search
  const sidebarProfiles = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return data;
    return data.filter((item) =>
      String(item.username || "").toLowerCase().includes(term) ||
      String(item.full_name || "").toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  // Active selected profile in Reels View
  const selectedProfile = useMemo(() => {
    return data.find((p) => p.id === selectedProfileId);
  }, [data, selectedProfileId]);

  // Reels of the active selected profile
  const selectedReels = useMemo(() => {
    if (!selectedProfile) return [];
    const reels = selectedProfile.reels || [];
    if (reelFilter === "all") return reels;
    return reels.filter((reel) => {
      if (reelFilter === "queue") {
        return reel.is_processed !== 1;
      }
      if (reelFilter === "ready") {
        return reel.is_processed === 1 && reel.is_rejected === 0 && reel.is_approved === 0;
      }
      if (reelFilter === "rejected") {
        return reel.is_processed === 1 && reel.is_rejected === 1 && reel.is_approved === 0;
      }
      if (reelFilter === "accepted") {
        return reel.is_processed === 1 && reel.is_rejected === 0 && reel.is_approved === 1;
      }
      return true;
    });
  }, [selectedProfile, reelFilter]);

  // MENU Actions
  const handleMenuOpen = (e, row) => {
    setSelectedRow(row);
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setSelectedRow(null);
    setAnchorEl(null);
  };

  // ROW CLICK → COLLAPSE
  const toggleRow = (id) => {
    setOpenRowId(openRowId === id ? null : id); // close if same row again
  };

  // const hasWriteAccess = useWriteAccess();
  const getStatusChip = (reel) => {
    if (reel.is_processed !== 1) {
      return { label: "Queue", color: "warning" };
    }

    if (reel.is_rejected === 0 && reel.is_approved === 0) {
      return { label: "Ready", color: "info" };
    }

    if (reel.is_rejected === 1 && reel.is_approved === 0) {
      return { label: "Rejected", color: "warning" };
    }

    if (reel.is_rejected === 0 && reel.is_approved === 1) {
      return { label: "Approved", color: "success" };
    }

    if (reel.is_rejected === 1 && reel.is_approved === 1) {
      return { label: "Error", color: "error" };
    }

    return { label: "Unknown", color: "default" };
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", mt: 1, p: 2 }}>
      {/* Toggle View Options */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: 2 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, val) => {
            if (val !== null) setViewMode(val);
          }}
          size="small"
          color="primary"
        >
          <ToggleButton value="profiles" sx={{ textTransform: "none", fontWeight: 600 }}>
            Profiles View
          </ToggleButton>
          <ToggleButton value="reels" sx={{ textTransform: "none", fontWeight: 600 }}>
            Reels View
          </ToggleButton>
          <ToggleButton 
            value="instagram" 
            sx={{ 
              textTransform: "none", 
              fontWeight: 600, 
              position: "relative",
              overflow: "visible"
            }}
          >
            Instagram View
            <Box
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                bgcolor: "error.main",
                color: "error.contrastText",
                fontSize: "0.55rem",
                fontWeight: 700,
                px: 0.6,
                py: 0.2,
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                textTransform: "uppercase",
                zIndex: 10,
                lineHeight: 1,
              }}
            >
              New
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {loading && (
        <Box py={3} sx={{ textAlign: "center" }}>
          <Typography>Loading...</Typography>
        </Box>
      )}
      {!loading && error && (
        <Box py={3} sx={{ textAlign: "center" }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      {!loading && !error && (
        <>
          {viewMode === "profiles" && (
            <TableContainer
              sx={{
                maxHeight: `${screenHeight - 250}px`,
                overflowY: "auto",
              }}
            >
              <Table stickyHeader size="small">
                <TableHead sx={{ backgroundColor: "#f7faf7" }}>
                  <TableRow>
                    <TableCell>S.No.</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "full_name"}
                        direction={orderBy === "full_name" ? order : "asc"}
                        onClick={() => handleSort("full_name")}
                      >
                        Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "username"}
                        direction={orderBy === "username" ? order : "asc"}
                        onClick={() => handleSort("username")}
                      >
                        Username
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Instagram Link</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "follower"}
                        direction={orderBy === "follower" ? order : "asc"}
                        onClick={() => handleSort("follower")}
                      >
                        Followers
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell sx={{ position: "sticky", right: 0, zIndex: 100 }}>
                      ACTION
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {tableData.map((row, index) => (
                    <React.Fragment key={row.id}>
                      {/* MAIN ROW */}
                      <TableRow
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => toggleRow(row.id)}
                      >
                        <TableCell>
                          {(page - 1) * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar
                              src={row.instagram_user_profile}
                              alt={row.full_name || "Profile"}
                              sx={{ width: 30, height: 30 }}
                            >
                              {row.username ? row.username.charAt(0).toUpperCase() : ""}
                            </Avatar>
                            <Typography variant="body2">
                              {row.full_name || "Pending"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>@{row.username || "Pending"}</TableCell>

                        <TableCell>
                          <Typography
                            component="a"
                            href={row.instagram_profile_url?.trim()}
                            target="_blank"
                            sx={{
                              color: "blue",
                              textDecoration: "underline",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {row.instagram_profile_url}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {row.follower !== null && row.follower !== undefined ? row.follower.toLocaleString() : "-"}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={row.status_text}
                            color={row.is_processed === 1 ? "primary" : "warning"}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>

                        <TableCell
                          sx={{ position: "sticky", right: 0, zIndex: 10 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                            <MoreVertical24Filled />
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {/* COLLAPSE ROW */}
                      <TableRow>
                        <TableCell colSpan={7} sx={{ p: 0, background: "#fafafa" }}>
                          <Collapse in={openRowId === row.id} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2 }}>
                              <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography fontWeight={600}>
                                  Reels List:
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                  Followers: {row.follower !== null && row.follower !== undefined ? row.follower.toLocaleString() : "-"}
                                </Typography>
                              </Box>

                              {row.reels?.length > 0 ? (
                                [...row.reels]
                                  .sort((a, b) => (b.is_processed === 1) - (a.is_processed === 1))
                                  .map((reel, index) => {
                                    const { label, color } = getStatusChip(reel);

                                    return (
                                      <Box
                                        key={reel.id}
                                        sx={{
                                          borderBottom: "1px solid #e0e0e0",
                                          py: 1,
                                          px: 1,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          cursor: "pointer",
                                          "&:hover": { backgroundColor: "#f5f5f5" },
                                        }}
                                        onClick={() => {


                                          // if (reel.is_approved == 1) {
                                          //   setAlert({
                                          //     open: true,
                                          //     severity: "success",
                                          //     message: "This reel is already approved and cannot be edited.",
                                          //   });
                                          //   return
                                          // };
                                          // if (reel.is_rejected == 1) {
                                          //   setAlert({
                                          //     open: true,
                                          //     severity: "success",
                                          //     message: "This reel is already Rejected and cannot be edited.",
                                          //   });
                                          //   return
                                          // };
                                          setEditData(reel);
                                          setOpenDrawer(true);
                                        }}
                                      >
                                        {/* LEFT SIDE */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                                          <Typography sx={{ fontWeight: 600, width: 24 }}>
                                            {index + 1}.
                                          </Typography>

                                          <Typography
                                            component="a"
                                            href={reel.raw_video_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                              color: "primary.main",
                                              textDecoration: "underline",
                                              fontSize: 13,
                                              maxWidth: 420,
                                              whiteSpace: "nowrap",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {reel.raw_video_url}
                                          </Typography>
                                        </Box>

                                        {/* RIGHT SIDE */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                          {/* Reject reason LEFT of chip */}
                                          {label === "Rejected" && reel.reject_reason && (
                                            <Box
                                              sx={{
                                                px: 1,
                                                py: 0.25,
                                                borderRadius: 1,
                                                backgroundColor: "error.lighter",
                                                border: "1px solid",
                                                borderColor: "error.light",
                                                maxWidth: 220,
                                              }}
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  color: "error.main",
                                                  fontWeight: 500,
                                                  whiteSpace: "nowrap",
                                                  overflow: "hidden",
                                                  textOverflow: "ellipsis",
                                                }}
                                                title={reel.reject_reason}
                                              >
                                                {reel.reject_reason}
                                              </Typography>
                                            </Box>
                                          )}

                                          <Chip label={label} color={color} size="small" />
                                        </Box>
                                      </Box>
                                    );
                                  })
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Under process
                                </Typography>
                              )}

                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>

                    </React.Fragment>
                  ))}

                  {tableData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Box py={3} sx={{ textAlign: "center" }}>
                          <Typography>No Data Found</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {viewMode === "reels" && (
            <Box sx={{ width: "100%", pb: 4 }}>
              {/* Instagram Stories-Style Horizontal Profile Selector */}
              <Box
                sx={{
                  display: "flex",
                  overflowX: "auto",
                  gap: 3,
                  py: 1.5,
                  px: 1,
                  mb: 3.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                {sidebarProfiles.map((prof) => {
                  const isActive = prof.id === selectedProfileId;
                  const reelCount = prof.reels?.length || 0;
                  const initials = (prof.username || "P").substring(0, 2).toUpperCase();

                  return (
                    <Box
                      key={prof.id}
                      onClick={() => {
                        setSelectedProfileId(prof.id);
                        setPlayingReelId(null); // Stop any playing video
                      }}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                        minWidth: 90,
                        textAlign: "center",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      {/* Avatar Circle with Instagram Ring */}
                      <Box
                        sx={{
                          width: 68,
                          height: 68,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          p: "3px", // spacing for the gradient ring
                          background: isActive
                            ? "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
                            : "linear-gradient(180deg, #eaeaea, #cccccc)",
                          boxShadow: isActive ? "0 4px 10px rgba(220, 39, 67, 0.3)" : "none",
                        }}
                      >
                        <Avatar
                          src={prof.instagram_user_profile}
                          sx={{
                            width: 60,
                            height: 60,
                            border: "3px solid #fff", // Classic Instagram gap
                            bgcolor: isActive ? "primary.main" : "grey.400",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "1.1rem",
                          }}
                        >
                          {initials}
                        </Avatar>
                      </Box>

                      {/* Username Label */}
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 1,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? "primary.main" : "text.primary",
                          fontSize: "0.75rem",
                          maxWidth: 85,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={prof.username}
                      >
                        @{prof.username || "Pending"}
                      </Typography>

                      {/* Reel Count Badge */}
                      <Chip
                        label={`${reelCount} Reels`}
                        size="small"
                        sx={{
                          mt: 0.5,
                          height: 18,
                          fontSize: "0.6rem",
                          fontWeight: 600,
                          backgroundColor: isActive ? "primary.main" : "action.selected",
                          color: isActive ? "primary.contrastText" : "text.secondary",
                          cursor: "pointer",
                        }}
                      />
                    </Box>
                  );
                })}
                {sidebarProfiles.length === 0 && (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ width: "100%", py: 2 }}>
                    No Instagram profiles found
                  </Typography>
                )}
              </Box>

              {/* Selected Profile Header and Reels 3-Column Grid */}
              {selectedProfile ? (
                <Grow in={true} timeout={400}>
                  <Box>
                    <Box sx={{ mb: 3.5, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          src={selectedProfile.instagram_user_profile}
                          alt={selectedProfile.username}
                          sx={{ width: 48, height: 48 }}
                        >
                          {selectedProfile.username ? selectedProfile.username.charAt(0).toUpperCase() : ""}
                        </Avatar>
                        <Box>
                          <Typography variant="h5" fontWeight="700" sx={{ letterSpacing: "-0.5px" }}>
                            @{selectedProfile.username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedProfile.full_name || "Instagram User"} • {selectedProfile.follower !== null && selectedProfile.follower !== undefined ? `${selectedProfile.follower.toLocaleString()} followers` : "- followers"} • Showing {selectedReels.length} reels
                          </Typography>
                        </Box>
                      </Box>

                      {/* Reel Status Filters */}
                      <ToggleButtonGroup
                        value={reelFilter}
                        exclusive
                        onChange={(e, val) => {
                          if (val !== null) setReelFilter(val);
                        }}
                        size="small"
                        color="primary"
                        sx={{ bgcolor: "background.paper" }}
                      >
                        <ToggleButton value="all" sx={{ textTransform: "none", fontWeight: 600 }}>
                          All
                        </ToggleButton>
                        <ToggleButton value="queue" sx={{ textTransform: "none", fontWeight: 600 }}>
                          Queue
                        </ToggleButton>
                        <ToggleButton value="ready" sx={{ textTransform: "none", fontWeight: 600 }}>
                          Ready
                        </ToggleButton>
                        <ToggleButton value="rejected" sx={{ textTransform: "none", fontWeight: 600 }}>
                          Rejected
                        </ToggleButton>
                        <ToggleButton value="accepted" sx={{ textTransform: "none", fontWeight: 600 }}>
                          Accepted
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    <Grid container spacing={3.5}>
                      {selectedReels.map((reel) => (
                        <Grid
                          key={reel.id}
                          size={{
                            xs: 12,
                            sm: 6,
                            md: 4
                          }}>
                          <ReelGridItem
                            reel={reel}
                            isPlaying={playingReelId === reel.id}
                            onPlay={() => setPlayingReelId(playingReelId === reel.id ? null : reel.id)}
                            setEditData={setEditData}
                            setOpenDrawer={setOpenDrawer}
                            getStatusChip={getStatusChip}
                            setAction={setAction}
                            action={action}
                            setAlert={setAlert}
                            setData={setData}
                          />
                        </Grid>
                      ))}
                      {selectedReels.length === 0 && (
                        <Grid size={12}>
                          <Box py={10} sx={{ textAlign: "center" }}>
                            <Typography color="text.secondary" variant="body1">
                              No reels have been collected for this profile yet.
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grow>
              ) : (
                <Box py={12} sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <Typography color="text.secondary" variant="body1">
                    Please select a profile to display its reels.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {viewMode === "instagram" && (
            <InstagramReelsFeed
              sidebarProfiles={sidebarProfiles}
              selectedProfileId={selectedProfileId}
              setSelectedProfileId={setSelectedProfileId}
              selectedProfile={selectedProfile}
              setEditData={setEditData}
              setOpenDrawer={setOpenDrawer}
              action={action}
              setAction={setAction}
              setAlert={setAlert}
              setViewMode={setViewMode}
              setData={setData}
            />
          )}

          {/* PAGINATION */}
          {viewMode !== "instagram" && (
            <Grid container sx={{ my: 1 }}>
            <Grid
              sx={{ ml: "auto" }}
              size={{
                xs: 12,
                sm: "auto"
              }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Rows per page:
                  </Typography>

                  <Select
                    size="small"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    sx={{ minWidth: 70, height: 32, fontSize: "0.875rem" }}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                  </Select>
                </Box>

                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, val) => setPage(val)}
                  shape="rounded"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
          )}

          {/* ACTION MENU */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                navigator.clipboard.writeText(selectedRow.username);
                setAlert({
                  open: true,
                  message: "Username copied!",
                  severity: "success",
                });
                handleMenuClose();
              }}
            >
              Copy Username
            </MenuItem>

            <MenuItem
              onClick={() => {
                window.open(selectedRow.instagram_profile_url?.trim(), "_blank");
                handleMenuClose();
              }}
            >
              Open Profile
            </MenuItem>
          </Menu>

          <GlobalSnackbar alert={alert} setAlert={setAlert} />
        </>
      )}
    </Paper>
  );
};

export default InstagramExtractorTable;
