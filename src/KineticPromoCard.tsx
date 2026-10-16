import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const springCfg = { damping: 16, stiffness: 120, mass: 0.9 };

const Reveal = ({ children, progress }: { children: React.ReactNode; progress: number }) => (
  <div style={{ overflow: "hidden", paddingBottom: 8 }}>
    <div
      style={{
        transform: `translateY(${(1 - progress) * 115}%)`,
        opacity: progress,
      }}
    >
      {children}
    </div>
  </div>
);

export default function KineticPromoCard() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Timebase locked to 30fps so timing is identical at 60fps.
  const t = (frame * 30) / fps;
  const totalFrames = (durationInFrames * 30) / fps; // 150 at 60fps / 300 frames

  // Staggered reveal springs (0 -> 1).
  const tagSpring = spring({ frame: t, fps: 30, config: springCfg, delay: 15 });
  const titleSpring = spring({ frame: t, fps: 30, config: springCfg, delay: 25 });
  const title2Spring = spring({ frame: t, fps: 30, config: springCfg, delay: 31 });
  const descSpring = spring({ frame: t, fps: 30, config: springCfg, delay: 35 });
  const metricSlide = spring({ frame: t, fps: 30, config: springCfg, delay: 42 });

  // Card tilt settle spring (durationInFrames 30, damping 200).
  const tiltX = spring({
    frame: t,
    fps: 30,
    config: { damping: 200 },
    from: 24,
    to: 7,
    durationInFrames: 30,
  });
  const tiltY = spring({
    frame: t,
    fps: 30,
    config: { damping: 200 },
    from: -30,
    to: -9,
    durationInFrames: 30,
  });
  const tiltZ = spring({
    frame: t,
    fps: 30,
    config: { damping: 200 },
    from: -4,
    to: -1.6,
    durationInFrames: 30,
  });
  const cardScale = spring({
    frame: t,
    fps: 30,
    config: { damping: 200 },
    from: 0.82,
    to: 1,
    durationInFrames: 30,
  });

  // Continuous timeline reactions.
  const letterSpacing = interpolate(t, [0, totalFrames], [0.035, -0.012]);
  const titleScale = interpolate(t, [0, totalFrames], [1, 1.045]);

  const floatX = Math.cos(t / 31) * 5;
  const floatY = Math.sin(t / 22) * 9;
  const floatRotateY = Math.sin(t / 40) * 0.9;

  // Progress bar: fluid 0% -> 100% over frames 45 -> 130 (clamped).
  const progress = interpolate(t, [45, 130], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const framesCounter = Math.floor(
    interpolate(t, [0, totalFrames], [0, 3600]),
  );
  const rampFps = Math.floor(interpolate(t, [0, totalFrames], [0, 60]));
  const glowOpacity = interpolate(progress, [90, 100], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#02040a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Parent provides the 1800px perspective for the 3D card. */}
      <div style={{ perspective: 1800, width: "100%", height: "100%" }}>
        <div
          style={{
            width: 1520,
            height: 780,
            borderRadius: 40,
            background: "rgba(10, 15, 32, 0.8)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            boxShadow:
              "0 40px 80px -20px rgba(0, 0, 0, 0.6), 0 0 120px -30px rgba(14, 165, 233, 0.2)",
            transformStyle: "preserve-3d",
            transform: `rotateX(${tiltX}deg) rotateY(${tiltY +
              floatRotateY}deg) rotateZ(${tiltZ}deg) translate3d(${floatX}px, ${floatY}px, 0) scale(${cardScale})`,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Moving mesh gradient blobs (blue, violet, cyan). */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 40,
              background: `
                radial-gradient(circle at ${50 +
                  Math.sin(t / 20) * 10}% ${50 +
                  Math.cos(t / 30) * 10}%, rgba(56, 189, 248, 0.14) 0%, transparent 40%),
                radial-gradient(circle at ${50 +
                  Math.cos(t / 25) * 12}% ${30 +
                  Math.sin(t / 22) * 8}%, rgba(139, 92, 246, 0.11) 0%, transparent 38%),
                radial-gradient(circle at ${70 +
                  Math.sin(t / 18) * 8}% ${70 +
                  Math.cos(t / 28) * 10}%, rgba(6, 182, 212, 0.1) 0%, transparent 42%)
              `,
            }}
          />

          {/* Slowly scrolling 64px grid. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 40,
              backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
              backgroundSize: "64px 64px",
              backgroundPosition: `${t * 0.4}px ${t * 0.3}px`,
              opacity: 0.5,
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              padding: 48,
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
              color: "#f8fafc",
              fontFamily: "system-ui, -apple-system, sans-serif",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Top accent line. */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "10%",
                right: "10%",
                height: 1,
                background: "linear-gradient(to right, transparent, rgba(14, 165, 233, 0.3), transparent)",
              }}
            />

            {/* Header & typography block. */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Reveal progress={tagSpring}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "#0ea5e9",
                      boxShadow: `0 0 ${6 + Math.abs(Math.sin(t / 4)) * 6}px #0ea5e9`,
                      transform: `scale(${1 + Math.sin(t / 6) * 0.25})`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      color: "#0ea5e9",
                      textTransform: "uppercase",
                    }}
                  >
                    VDX MOTION GRAPHICS
                  </span>
                </div>
              </Reveal>

              <Reveal progress={titleSpring}>
                <div style={{ overflow: "hidden", paddingBottom: 4 }}>
                  <h1
                    style={{
                      transform: `translateY(${interpolate(
                        titleSpring,
                        [0, 1],
                        [30, 0],
                      )}px) scale(${titleScale})`,
                      opacity: titleSpring,
                      letterSpacing: `${letterSpacing}em`,
                      fontSize: 118,
                      fontWeight: 800,
                      margin: 0,
                      background: "linear-gradient(to bottom right, #ffffff 30%, #94a3b8 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Render Cinematic Video
                  </h1>
                </div>
              </Reveal>

              <Reveal progress={title2Spring}>
                <div style={{ overflow: "hidden", paddingBottom: 4 }}>
                  <h1
                    style={{
                      transform: `translateY(${interpolate(
                        title2Spring,
                        [0, 1],
                        [30, 0],
                      )}px) scale(${titleScale})`,
                      opacity: title2Spring,
                      letterSpacing: `${letterSpacing}em`,
                      fontSize: 118,
                      fontWeight: 800,
                      margin: 0,
                      background: "linear-gradient(to bottom right, #ffffff 30%, #94a3b8 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Directly in the Cloud
                  </h1>
                </div>
              </Reveal>

              <Reveal progress={descSpring}>
                <p
                  style={{
                    transform: `translateY(${interpolate(
                      descSpring,
                      [0, 1],
                      [30, 0],
                    )}px)`,
                    opacity: descSpring,
                    fontSize: 34,
                    color: "#94a3b8",
                    maxWidth: 520,
                    margin: 0,
                    lineHeight: 1.6,
                    fontWeight: 400,
                  }}
                >
                  Layered compositing, edge-to-edge math orchestration, and fluid
                  spring physics motion, rendered seamlessly on headless server
                  architectures.
                </p>
              </Reveal>
            </div>

            {/* Motion graphic: dynamic server metric status bar. */}
            <div
              style={{
                transform: `translateY(${(1 - metricSlide) * 100}px)`,
                opacity: metricSlide,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                background: "rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255,255,255,0.03)",
                padding: 20,
                borderRadius: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    color: "#94a3b8",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      backgroundColor:
                        frame > 45 && frame < 130
                          ? "#eab308"
                          : frame >= 130
                          ? "#22c55e"
                          : "#64748b",
                      borderRadius: "50%",
                    }}
                  />
                  {frame < 45
                    ? "Queued Node..."
                    : frame < 130
                    ? "Compiling Assets..."
                    : "Success: Render Complete"}
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    color: "#0ea5e9",
                    fontWeight: 600,
                  }}
                >
                  {rampFps} FPS / Enqueued
                </span>
              </div>

              {/* Moving progress bar track. */}
              <div
                style={{
                  width: "100%",
                  height: 6,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: "9999px",
                  overflow: "visible",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "linear-gradient(to right, #6366f1, #0ea5e9)",
                    boxShadow: "0 0 12px #0ea5e9",
                    borderRadius: "9999px",
                    transition: "width 0.1s linear",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: `${progress}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 10,
                    height: 10,
                    backgroundColor: "#0ea5e9",
                    borderRadius: "50%",
                    boxShadow: "0 0 10px #0ea5e9",
                    opacity: glowOpacity,
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#475569",
                  fontFamily: "monospace",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span>CLUSTER_NODE_04 // HEADLESS</span>
                <span>PROGRESS: {Math.floor(progress)}%</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#64748b",
                  fontFamily: "monospace",
                  fontVariantNumeric: "tabular-nums",
                  marginTop: 4,
                }}
              >
                <span>FRAMES: {String(framesCounter).padStart(4, "0")}</span>
                <span>FPS: {rampFps}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
