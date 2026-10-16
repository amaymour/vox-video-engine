import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const VoxVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tagSpring = spring({ frame, fps, config: { mass: 0.3, damping: 10, stiffness: 150 }, delay: 15 });
  const titleSpring = spring({ frame, fps, config: { mass: 0.4, damping: 12, stiffness: 130 }, delay: 25 });
  const descSpring = spring({ frame, fps, config: { mass: 0.5, damping: 12, stiffness: 110 }, delay: 35 });
  const boardSpring = spring({ frame, fps, config: { mass: 0.8, damping: 16, stiffness: 90 }, delay: 5 });

  const rotateX = interpolate(boardSpring, [0, 1], [30, 12]);
  const rotateY = interpolate(boardSpring, [0, 1], [-45, -12]);
  const translateZ = interpolate(boardSpring, [0, 1], [-400, 0]);
  const boardOpacity = interpolate(boardSpring, [0, 1], [0, 1]);
  const floatY = Math.sin(frame / 14) * 6;

  const progressWidth = interpolate(frame, [45, 130], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const serverSpeed = Math.floor(interpolate(frame, [45, 130], [0, 842], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const letterSpacing = interpolate(frame, [0, 150], [1, -0.5]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#02040a", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", fontFamily: "system-ui, -apple-system" }}>
      <div style={{ position: "absolute", width: "150%", height: "150%", background: "radial-gradient(circle at 60% 40%, rgba(14, 165, 233, 0.15) 0%, rgba(99, 102, 241, 0.04) 40%, transparent 70%)", transform: `scale(${1 + Math.sin(frame / 20) * 0.03}) rotate(${frame * 0.03}deg)` }} />

      <div
        style={{
          width: "80%",
          height: "60%",
          opacity: boardOpacity,
          transform: `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) translateY(${floatY}px)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: "24px",
          background: "linear-gradient(145deg, rgba(10, 15, 30, 0.8) 0%, rgba(15, 23, 42, 0.5) 100%)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 40px 80px -20px rgba(0, 0, 0, 0.8), 0 0 120px -30px rgba(14, 165, 233, 0.25)",
          padding: "48px",
          color: "#f8fafc",
          boxSizing: "border-box"
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(to right, transparent, rgba(14, 165, 233, 0.3), transparent)" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ opacity: tagSpring, transform: `translateY(${interpolate(tagSpring, [0, 1], [30, 0])}px)`, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#0ea5e9", boxShadow: "0 0 8px #0ea5e9" }} />
            <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.15em", color: "#0ea5e9", textTransform: "uppercase" }}>
              VOX MOTION GRAPHICS
            </span>
          </div>

          <div style={{ overflow: "hidden", paddingBottom: "4px" }}>
            <h1 style={{ transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`, opacity: titleSpring, letterSpacing: letterSpacing, fontSize: "44px", fontWeight: "800", margin: 0, background: "linear-gradient(to bottom right, #ffffff 30%, #94a3b8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Render Cinematic Video <br /> Directly in the Cloud
            </h1>
          </div>

          <p style={{ opacity: descSpring, transform: `translateY(${interpolate(descSpring, [0, 1], [30, 0])}px)`, fontSize: "15px", color: "#64748b", maxWidth: "520px", margin: 0, lineHeight: "1.6", fontWeight: "400" }}>
            Layered compositing, edge-to-edge math orchestration, and fluid spring physics motion — rendered seamlessly on headless server architectures.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "rgba(0, 0, 0, 0.25)", border: "1px solid rgba(255,255,255,0.03)", padding: "20px", borderRadius: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
            <span style={{ color: "#94a3b8", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", backgroundColor: "#0ea5e9", borderRadius: "50%" }} />
              Compiling Assets...
            </span>
            <span style={{ fontFamily: "monospace", color: "#0ea5e9", fontWeight: "600" }}>
              {serverSpeed} FPS / Enqueued
            </span>
          </div>

          <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden", position: "relative" }}>
            <div style={{ width: `${progressWidth}%`, height: "100%", background: "linear-gradient(to right, #6366f1, #0ea5e9)", boxShadow: "0 0 12px #0ea5e9", borderRadius: "999px", transition: "width 0.1s linear" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#475569", fontFamily: "monospace" }}>
            <span>CLUSTER_NODE_04 // HEADLESS</span>
            <span>PROGRESS: {Math.floor(progressWidth)}%</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
