"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/auth/AuthForm";

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const timeRef = useRef(0);
  const animationFrameId = useRef(null);

  // Simple noise function
  const noise = (x, y, t) => {
    const n =
      Math.sin(x * 0.02 + t) * Math.cos(y * 0.02 + t) +
      Math.sin(x * 0.03 - t) * Math.cos(y * 0.01 + t);
    return (n + 1) / 2;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to full window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const numLines = Math.floor(canvas.width / 44); // Adjust line density for screen width
    const lineSpacing = canvas.width / numLines;

    // Generate patterns that avoid extremes
    const generatePattern = (seed) => {
      const pattern = [];
      for (let i = 0; i < numLines; i++) {
        const lineBars = [];
        let currentY = 0;

        while (currentY < canvas.height) {
          const noiseVal = noise(i * lineSpacing, currentY, seed);

          if (noiseVal > 0.5) {
            // Create medium-length bars
            const barLength = 10 + noiseVal * 30; // 10-40 pixels
            const barWidth = 1 + noiseVal * 2;

            lineBars.push({
              y: currentY + barLength / 2,
              height: barLength,
              width: barWidth,
            });

            currentY += barLength + 15; // Spacing between bars
          } else {
            currentY += 15; // Skip space when no bar
          }
        }
        pattern.push(lineBars);
      }
      return pattern;
    };

    // Generate two patterns with different seeds
    const pattern1 = generatePattern(0);
    const pattern2 = generatePattern(5);

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      timeRef.current += 0.005; // Cut speed in half

      // Create a cycle with pauses
      const cycleTime = timeRef.current % (Math.PI * 2);
      let easingFactor;

      if (cycleTime < Math.PI * 0.1) {
        // Pause at pattern 1
        easingFactor = 0;
      } else if (cycleTime < Math.PI * 0.9) {
        // Transition to pattern 2
        const transitionProgress =
          (cycleTime - Math.PI * 0.1) / (Math.PI * 0.8);
        easingFactor = transitionProgress;
      } else if (cycleTime < Math.PI * 1.1) {
        // Pause at pattern 2
        easingFactor = 1;
      } else if (cycleTime < Math.PI * 1.9) {
        // Transition back to pattern 1
        const transitionProgress =
          (cycleTime - Math.PI * 1.1) / (Math.PI * 0.8);
        easingFactor = 1 - transitionProgress;
      } else {
        // Pause at pattern 1 again
        easingFactor = 0;
      }

      // Let go of clinging to any one state
      const smoothEasing =
        easingFactor < 0.5
          ? 4 * easingFactor * easingFactor * easingFactor
          : 1 - Math.pow(-2 * easingFactor + 2, 3) / 2;

      // Clear canvas
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw lines and interpolated bars
      for (let i = 0; i < numLines; i++) {
        const x = i * lineSpacing + lineSpacing / 2;

        // Draw vertical line
        ctx.beginPath();
        ctx.strokeStyle = "#E8E8E8";
        ctx.lineWidth = 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

        // Interpolate between pattern1 and pattern2
        const bars1 = pattern1[i];
        const bars2 = pattern2[i];

        // Match bars between patterns
        const maxBars = Math.max(bars1.length, bars2.length);

        for (let j = 0; j < maxBars; j++) {
          let bar1 = bars1[j];
          let bar2 = bars2[j];

          // If one pattern has fewer bars, create a dummy bar
          if (!bar1) bar1 = { y: bar2.y - 100, height: 0, width: 0 };
          if (!bar2) bar2 = { y: bar1.y + 100, height: 0, width: 0 };

          // Add some wave motion during transition
          const waveOffset =
            Math.sin(i * 0.3 + j * 0.5 + timeRef.current * 2) *
            10 *
            (smoothEasing * (1 - smoothEasing) * 4); // Peak in middle of transition

          // Interpolate properties with wave offset
          const y = bar1.y + (bar2.y - bar1.y) * smoothEasing + waveOffset;
          const height =
            bar1.height + (bar2.height - bar1.height) * smoothEasing;
          const width = bar1.width + (bar2.width - bar1.width) * smoothEasing;

          // Only draw if bar has size
          if (height > 0.1 && width > 0.1) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(x - width / 2, y - height / 2, width, height);
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      // Clear canvas context
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Reset refs to prevent memory leaks
      timeRef.current = 0;
      animationFrameId.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
      }}
    />
  );
};

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);

  const handleEnterApp = () => {
    router.push("/bots");
  };

  const handleGoToArena = () => {
    router.push("/arena");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8E8E8]"></div>
      </div>
    );
  }

  // If showing auth form
  if (showAuth && !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setShowAuth(false)}
              className="mb-4 text-[#E8E8E8] hover:bg-[#E8E8E8] hover:text-[#0A0A0A]"
            >
              ← Back
            </Button>
            <h1 className="text-4xl font-bold text-[#E8E8E8] mb-2">
              GLADIASTER
            </h1>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  // Main landing page
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0A0A0A",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <AnimatedBackground />

      {/* Content overlay */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-[#E8E6DE] mb-8 tracking-wider">
            GLADIASTER
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleEnterApp}
              size="lg"
              className="text-xl px-12 py-6 bg-[#E8E6DE] hover:bg-[#FFFFFF] text-[#2A2927] border-2 border-[#E8E6DE] hover:border-[#FFFFFF] font-semibold tracking-wide"
            >
              ENTER APP
            </Button>
            <Button
              onClick={handleGoToArena}
              size="lg"
              className="text-xl px-12 py-6 bg-[#C4A32D] hover:bg-[#D4B53D] text-[#2A2927] border-2 border-[#C4A32D] hover:border-[#D4B53D] font-semibold tracking-wide"
            >
              GO TO ARENA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
