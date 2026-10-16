import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// 🥇 SSS-Grade Premium Mechanical Easing (Apple/Linear Style)
const SNAP_SPRING = { mass: 0.35, damping: 10.5, stiffness: 140 };
const CINEMATIC_DRAG = { mass: 0.75, damping: 15.5, stiffness: 85 };

export const VoxVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Multi-phase timeline orchestration
  const dashboardReveal = spring({ frame, fps, config: CINEMATIC_DRAG, delay: 15 });
  const internalStagger = spring({ frame, fps, config: SNAP_SPRING, delay: 30 });

  // 💎 SSS-Grade 3D Perspective Matrix Math (Ultra Smooth)
  const rotateX = interpolate(dashboardReveal, [0, 1], [35, 12]);
  const rotateY = interpolate(dashboardReveal, [0, 1], [-45, -8]);
  const translateZ = interpolate(dashboardReveal, [0, 1], [-500, 0]);
  const opacity = interpolate(dashboardReveal, [0, 0.15, 1], [0, 1, 1]);

  // Premium ambient micro-float (Keeps frames moving organically)
  const ambientFloatY = Math.sin(frame / 12) * 6;

  return (
    <AbsoluteFill style={{ backgroundColor: "#020617", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", fontFamily: "system-ui" }}>
      
      {/* 1. Dynamic Moving Ambient Mesh Gradient */}
      <div 
        style={{
          position: "absolute",
          width: "160%",
          height: "160%",
          background: "radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.12) 0%, rgba(139, 92, 246, 0.04) 40%, rgba(0,0,0,0) 70%)",
          transform: `scale(${1 + Math.sin(frame / 25) * 0.04}) rotate(${frame * 0.05}deg)`,
        }} 
      />

      {/* 2. Main 3D Cinematic Showcase Interface Wrapper */}
      <div
        style={{
          width: "85%",
          height: "65%",
          opacity: opacity,
          transform: `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) translateY(${ambientFloatY}px)`,
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.5) 100%)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.09)",
          boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.7), 0 0 100px -20px rgba(56, 189, 248, 0.2)",
          padding: "32px",
          color: "#f8fafc",
          position: "relative"
        }}
      >
        {/* Dynamic Edge Highlight Overlay */}
        <div style={{ position: "absolute", inset: 0, borderRadius: "20px", background: "linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)", pointerEvents: "none" }} />

        {/* ─── INJECT CONTENT CONTAINER START ─── */}
        {/* Vox Engine: custom SaaS app headers, metric counters, and UI icons staggered using internalStagger math */}
        <div style={{ transform: `scale(${internalStagger})`, display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "inline-block", alignSelf: "flex-start", padding: "6px 12px", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "9999px", fontSize: "12px", color: "#38bdf8", fontWeight: "600", letterSpacing: "0.05em" }}>
            VOX MOTION GRAPHICS
          </div>
          <h1 style={{ fontSize: "42px", fontWeight: "800", letterSpacing: "-0.02em", background: "linear-gradient(to right, #ffffff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Render Cinematic Video in the Cloud
          </h1>
          <p style={{ fontSize: "16px", color: "#94a3b8", maxWidth: "420px", lineHeight: "1.5" }}>
            Layered compositing, edge-tts narration, and spring-physics motion — rendered entirely on zero-cost GitHub Actions runners.
          </p>
        </div>
        {/* ─── INJECT CONTENT CONTAINER END ─── */}

      </div>
    </AbsoluteFill>
  );
};
