import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const BASE_FPS = 30;
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const TAG = 'VDX MOTION GRAPHICS';
const TITLE_LINES = ['Render Cinematic Video', 'Directly in the Cloud'];
const DESCRIPTION =
  'Layered compositing, edge-to-edge math orchestration, and fluid spring physics motion, rendered seamlessly on headless server architectures.';

const Reveal: React.FC<{
  progress: number;
  distance?: number;
  children: React.ReactNode;
}> = ({progress, distance = 115, children}) => {
  const p = Math.min(Math.max(progress, 0), 1.08);
  return (
    <div style={{overflow: 'hidden', paddingBottom: '0.14em', marginBottom: '-0.14em'}}>
      <div
        style={{
          transform: `translateY(${(1 - p) * distance}%)`,
          opacity: interpolate(progress, [0, 0.35], [0, 1], CLAMP),
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const KineticPromoCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const t = (frame * BASE_FPS) / fps;
  const total = (durationInFrames * BASE_FPS) / fps;

  const cardSpring = spring({
    frame: t,
    fps: BASE_FPS,
    durationInFrames: 30,
    config: {damping: 200},
  });

  const tagSpring = spring({
    frame: t,
    fps: BASE_FPS,
    delay: 15,
    config: {damping: 16, stiffness: 140, mass: 0.8},
  });
  const titleSpring = spring({
    frame: t,
    fps: BASE_FPS,
    delay: 25,
    config: {damping: 16, stiffness: 120, mass: 0.9},
  });
  const titleSpring2 = spring({
    frame: t,
    fps: BASE_FPS,
    delay: 31,
    config: {damping: 16, stiffness: 120, mass: 0.9},
  });
  const descSpring = spring({
    frame: t,
    fps: BASE_FPS,
    delay: 35,
    config: {damping: 18, stiffness: 110, mass: 0.9},
  });
  const metricSpring = spring({
    frame: t,
    fps: BASE_FPS,
    delay: 40,
    config: {damping: 20, stiffness: 100},
  });

  const letterSpacing = interpolate(t, [0, total], [0.035, -0.012], {
    ...CLAMP,
    easing: Easing.inOut(Easing.quad),
  });
  const titleScale = interpolate(t, [0, total], [1, 1.045], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const descSpacing = interpolate(t, [0, total], [0.01, 0.028], CLAMP);

  const floatY = Math.sin(t / 22) * 9;
  const floatX = Math.cos(t / 31) * 5;
  const floatTilt = Math.sin(t / 40) * 0.9;

  const rotateX = interpolate(cardSpring, [0, 1], [24, 7]) + Math.sin(t / 36) * 0.8;
  const rotateY = interpolate(cardSpring, [0, 1], [-30, -9]) + floatTilt;
  const rotateZ = interpolate(cardSpring, [0, 1], [-4, -1.6]);
  const cardScale = interpolate(cardSpring, [0, 1], [0.82, 1]);
  const cardOpacity = interpolate(t, [0, 14], [0, 1], CLAMP);

  const progress = interpolate(t, [45, 130], [0, 100], {
    ...CLAMP,
    easing: Easing.bezier(0.45, 0.05, 0.25, 1),
  });
  const pct = Math.floor(progress);
  const framesRendered = Math.round(interpolate(progress, [0, 100], [0, 3600], CLAMP));
  const liveFps = Math.round(
    interpolate(t, [45, 70, 130], [0, 842, 861], CLAMP) + Math.sin(t / 3) * 6 * (t > 70 ? 1 : 0),
  );

  const m1x = 22 + Math.sin(t / 55) * 14;
  const m1y = 28 + Math.cos(t / 47) * 12;
  const m2x = 78 + Math.cos(t / 61) * 13;
  const m2y = 72 + Math.sin(t / 43) * 14;
  const m3x = 50 + Math.sin(t / 37 + 1.4) * 22;
  const m3y = 55 + Math.cos(t / 52 + 0.6) * 18;

  const bgDriftX = 50 + Math.sin(t / 90) * 10;
  const bgDriftY = 45 + Math.cos(t / 110) * 8;

  const barGlow = 0.45 + 0.25 * Math.sin(t / 6);
  const dotPulse = 0.55 + 0.45 * Math.sin(t / 5);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#03050d',
        backgroundImage: `radial-gradient(60% 55% at ${bgDriftX}% ${bgDriftY}%, rgba(20,60,140,0.32) 0%, rgba(3,5,13,0) 70%)`,
        fontFamily: "Inter, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
        color: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        perspective: 1800,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: 1520,
          height: 780,
          opacity: cardOpacity,
          transformStyle: 'preserve-3d',
          transform: `translate3d(${floatX}px, ${floatY}px, 0) scale(${cardScale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
          position: 'relative',
          borderRadius: 40,
          overflow: 'hidden',
          backgroundColor: 'rgba(10,15,32,0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow:
            '0 60px 140px rgba(0,0,0,0.65), 0 0 120px rgba(40,120,255,0.12), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: [
              `radial-gradient(520px 420px at ${m1x}% ${m1y}%, rgba(46,130,255,0.30), rgba(46,130,255,0) 70%)`,
              `radial-gradient(480px 400px at ${m2x}% ${m2y}%, rgba(130,80,255,0.26), rgba(130,80,255,0) 70%)`,
              `radial-gradient(380px 320px at ${m3x}% ${m3y}%, rgba(0,200,255,0.14), rgba(0,200,255,0) 70%)`,
            ].join(','),
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            backgroundPosition: `${(t * 0.35) % 64}px ${(t * 0.2) % 64}px`,
            opacity: 0.7,
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 88,
            right: 88,
            top: 84,
            display: 'flex',
            flexDirection: 'column',
            gap: 30,
            transform: 'translateZ(60px)',
          }}
        >
          <Reveal progress={tagSpring} distance={140}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 20px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.05)',
                backgroundColor: 'rgba(46,130,255,0.12)',
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: `${0.28 + Math.sin(t / 30) * 0.02}em`,
                color: '#58b0ff',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: '#58b0ff',
                  opacity: dotPulse,
                  boxShadow: '0 0 14px rgba(88,176,255,0.9)',
                }}
              />
              {TAG}
            </div>
          </Reveal>

          <div
            style={{
              transform: `scale(${titleScale})`,
              transformOrigin: 'left center',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {TITLE_LINES.map((line, i) => (
              <Reveal key={line} progress={i === 0 ? titleSpring : titleSpring2}>
                <div
                  style={{
                    fontSize: 118,
                    lineHeight: 1.08,
                    fontWeight: 800,
                    letterSpacing: `${letterSpacing}em`,
                    whiteSpace: 'nowrap',
                    backgroundImage: 'linear-gradient(180deg, #ffffff 30%, #a9c4ff 120%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {line}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal progress={descSpring} distance={130}>
            <div
              style={{
                maxWidth: 1000,
                fontSize: 34,
                lineHeight: 1.5,
                fontWeight: 400,
                letterSpacing: `${descSpacing}em`,
                color: 'rgba(190,205,235,0.78)',
              }}
            >
              {DESCRIPTION}
            </div>
          </Reveal>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 64,
            right: 64,
            bottom: 56,
            padding: '30px 36px 28px',
            borderRadius: 28,
            backgroundColor: 'rgba(10,15,32,0.8)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.05)',
            opacity: interpolate(metricSpring, [0, 1], [0, 1], CLAMP),
            transform: `translateZ(90px) translateY(${(1 - Math.min(metricSpring, 1)) * 60}px)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 20,
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            <span style={{color: 'rgba(190,205,235,0.8)', letterSpacing: '0.04em'}}>
              <span style={{color: '#58b0ff', opacity: dotPulse}}>●</span>
              {'  '}
              {pct < 100 ? 'Compiling Assets…' : 'Render Complete'}
            </span>
            <span
              style={{
                color: '#58b0ff',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.02em',
              }}
            >
              {liveFps} FPS / Enqueued
            </span>
          </div>

          <div
            style={{
              position: 'relative',
              height: 12,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.06)',
              overflow: 'visible',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progress}%`,
                borderRadius: 999,
                backgroundImage: 'linear-gradient(90deg, #2e82ff, #8250ff)',
                boxShadow: `0 0 ${22 + barGlow * 20}px rgba(70,130,255,${barGlow})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${progress}%`,
                width: 22,
                height: 22,
                marginLeft: -11,
                marginTop: -11,
                borderRadius: 999,
                backgroundColor: '#fff',
                opacity: interpolate(progress, [0, 2, 98, 100], [0, 1, 1, 0], CLAMP),
                boxShadow: '0 0 24px rgba(120,170,255,1)',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 20,
              fontSize: 20,
              fontWeight: 500,
              color: 'rgba(150,170,210,0.6)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.1em',
            }}
          >
            <span>CLUSTER_NODE_04 / WORKER</span>
            <span>
              {String(framesRendered).padStart(4, '0')} / 3600 FRAMES · {String(pct).padStart(3, '0')}%
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default KineticPromoCard;
