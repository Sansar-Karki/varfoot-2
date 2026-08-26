import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { C } from '../components/ui';
import { BrandLockup } from '../components/Brand';
import { BODY, MONO } from '../fonts';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const burst = interpolate(f, [0, 10, 40], [0.6, 0.35, 0], clamp);
  const tagline = interpolate(f, [28, 50], [0, 1], clamp);
  const pill = spring({ frame: f - 46, fps, config: { damping: 14, mass: 0.7, stiffness: 130 } });
  const fadeOut = interpolate(f, [durationInFrames - 40, durationInFrames], [1, 0], clamp);
  const pulse = 1 + 0.02 * Math.sin(f / 16);

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: fadeOut }}>
      {/* impact glow burst */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(closest-side at 50% 46%, ${C.green}, transparent 60%)`,
          opacity: burst,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, transform: `scale(${pulse})` }}>
        <BrandLockup delay={2} iconSize={150} wordScale={1.6} />
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 40,
            color: C.inkMute,
            opacity: tagline,
            transform: `translateY(${(1 - tagline) * 12}px)`,
          }}
        >
          Train with purpose. Make varsity.
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
            padding: '20px 40px',
            borderRadius: 999,
            background: C.green,
            color: '#04210F',
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 34,
            letterSpacing: '0.01em',
            opacity: pill,
            transform: `scale(${0.8 + pill * 0.2})`,
            boxShadow: `0 0 60px ${C.green}77`,
          }}
        >
          varfoot.vercel.app
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          fontFamily: MONO,
          fontWeight: 500,
          fontSize: 20,
          letterSpacing: '0.3em',
          color: C.inkFaint,
          textTransform: 'uppercase',
          opacity: interpolate(f, [60, 84], [0, 1], clamp),
        }}
      >
        Built for LexHack '26
      </div>
    </AbsoluteFill>
  );
};
