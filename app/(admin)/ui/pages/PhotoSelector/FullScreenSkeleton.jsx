import React from "react";
import { Skeleton, Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const FullScreenSkeleton = ({ visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: "100%", height: "100vh" }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            animation="wave"   // ✅ built-in skeleton motion
            sx={{
              bgcolor: "rgba(200,200,200,1)",
              "& .MuiSkeleton-wave": {
                animationDuration: "2.8s",   // slower, more visible wave
                background:
                  "linear-gradient(90deg, rgba(200,200,200,1) 0%, rgba(255,255,255,0.9) 60%, rgba(200,200,200,1) 100%)",
              },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenSkeleton;
