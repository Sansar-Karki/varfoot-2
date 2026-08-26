import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { C, W, H } from '../theme';

// Slow-drifting green glow, perspective pitch lines, subtle vertical scan.
export const Bg: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const f = useCurrentFrame();
  const t = f / 60;
  const gx = W * 0.5 + Math.sin(t * 0.18) * 360;
  const gy = H * 0.42 + Math.cos(t * 0.13) * 200;
  const glow = (0.55 + 0.12 * Math.sin(t * 0.5)) * intensity;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg0, overflow: 'hidden' }}>
      {/* base vertical gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.bg1} 0%, ${C.bg0} 55%, #030407 100%)`,
        }}
      />
      {/* drifting green radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(closest-side at ${gx}px ${gy}px, rgba(18,252,116,${0.16 * glow}), rgba(18,252,116,0.04) 40%, transparent 70%)`,
        }}
      />
      {/* secondary cool glow for depth */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(closest-side at ${W * 0.82 + Math.cos(t * 0.1) * 160}px ${H * 0.8}px, rgba(63,169,245,0.07), transparent 60%)`,
        }}
      />
      {/* perspective pitch lines */}
      <AbsoluteFill style={{ opacity: 0.5 * intensity }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <linearGradient id="ln" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0)" />
              <stop offset="0.65" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="1" stopColor="rgba(18,252,116,0.10)" />
            </linearGradient>
          </defs>
          {Array.from({ length: 16 }).map((_, i) => {
            const vx = W / 2;
            const x = (i / 15) * W * 2 - W / 2;
            return <line key={i} x1={vx} y1={H * 0.46} x2={x} y2={H + 40} stroke="url(#ln)" strokeWidth={1.2} />;
          })}
          {Array.from({ length: 7 }).map((_, i) => {
            const p = (i + ((t * 0.25) % 1)) / 7;
            const y = H * 0.46 + Math.pow(p, 2.2) * H * 0.6;
            return <line key={'h' + i} x1={0} y1={y} x2={W} y2={y} stroke="url(#ln)" strokeWidth={1} opacity={p} />;
          })}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// grain + vignette, sits on top of everything
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const seed = (f % 6) * 0.13;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: 'overlay' }}>
        <svg width={W} height={H}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={1 + f % 10} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width={W} height={H} filter="url(#grain)" transform={`translate(${seed} ${seed})`} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
