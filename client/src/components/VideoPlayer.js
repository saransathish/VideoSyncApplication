import React, { useRef, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Backend URL

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const isSeekingRef = useRef(false); // Track if a seek action is in progress

  useEffect(() => {
    // Listen for sync actions from the server
    socket.on("sync_action", ({ action, timestamp }) => {
      const video = videoRef.current;

      if (!video) return;

      if (action === "play") video.play();
      if (action === "pause") video.pause();
      if (action === "seek") {
        isSeekingRef.current = true; // Avoid emitting redundant events
        video.currentTime = timestamp;
      }
    });

    // Reset the seeking state after seek operation
    videoRef.current?.addEventListener("seeked", () => {
      isSeekingRef.current = false;
    });

    return () => {
      socket.off("sync_action");
    };
  }, []);

  const handlePlay = () => {
    videoRef.current.play();
    socket.emit("sync_action", { action: "play" });
  };

  const handlePause = () => {
    videoRef.current.pause();
    socket.emit("sync_action", { action: "pause" });
  };

  const handleSeek = () => {
    if (!isSeekingRef.current) {
      const timestamp = videoRef.current.currentTime;
      socket.emit("sync_action", { action: "seek", timestamp });
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files[0];
          const videoURL = URL.createObjectURL(file);
          videoRef.current.src = videoURL;
        }}
      />
      <video
        ref={videoRef}
        controls
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeek}
        style={{ width: "100%", maxHeight: "500px" }}
      />
    </div>
  );
};

export default VideoPlayer;
