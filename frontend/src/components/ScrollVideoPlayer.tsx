"use client";

import React, { useRef, useEffect } from "react";

interface ScrollVideoPlayerProps {
  src: string;
  speed?: number;
  className?: string;
}

export default function ScrollVideoPlayer({
  src,
  speed = 0.5,
  className = "w-full h-auto rounded-2xl object-cover shadow-inner",
}: ScrollVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set playback rate (e.g., 0.5x half speed)
    video.playbackRate = speed;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.playbackRate = speed;
            video.play().catch(() => {
              // Silently handle any browser autoplay restrictions
            });
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.25, // Play when 25% of the video is visible on screen
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [speed]);

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      muted
      playsInline
      className={className}
    />
  );
}
