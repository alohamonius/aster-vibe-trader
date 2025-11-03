"use client";

import { useEffect, useRef } from "react";

interface VideoAvatarProps {
  isHovered: boolean;
  agentName: string;
  videoSrc: string;
  posterSrc: string;
  className?: string;
}

export function VideoAvatar({
  isHovered,
  agentName,
  videoSrc,
  posterSrc,
  className = "w-full h-full object-cover",
}: VideoAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isHovered) {
      videoRef.current.play().catch((err) => {
        console.error("Video play error:", err);
      });
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered]);

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      poster={posterSrc}
      preload="none"
      muted
      loop
      playsInline
      className={className}
      aria-label={`${agentName} avatar`}
    />
  );
}
