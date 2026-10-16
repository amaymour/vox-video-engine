import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const MotionTest: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig();
  const left = interpolate(frame, [0, 60], [0, 1200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0f",
        width: 200,
        height: 200,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          backgroundColor: "#00ff00",
          position: "absolute",
          left: left,
          top: 80,
        }}
      />
    </AbsoluteFill>
  );
};
