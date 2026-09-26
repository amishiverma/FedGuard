"use client";

import React, { useRef, useEffect } from "react";

interface ScrollVideoPlayerProps {
  src: string;
  speed?: number;
  className?: string;
}

export default function ScrollVideoPlayer({
  src,
  speed = 0.75,
  className = "w-full h-auto rounded-2xl object-cover shadow-inner",
}: ScrollVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = () => {
      video.playbackRate = speed;
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch((error) => {
          console.warn("Autoplay error, awaiting interaction:", error);
        });
      }
    };

    video.playbackRate = speed;
    playVideo();

    video.addEventListener("loadeddata", playVideo);
    video.addEventListener("canplaythrough", playVideo);

    return () => {
      video.removeEventListener("loadeddata", playVideo);
      video.removeEventListener("canplaythrough", playVideo);
    };
  }, [speed]);

  return (
    <div 
      className="relative w-full cursor-pointer"
      onClick={() => {
        if (videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play();
          } else {
            videoRef.current.pause();
          }
        }
      }}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={className}
      />
    </div>
  );
}
