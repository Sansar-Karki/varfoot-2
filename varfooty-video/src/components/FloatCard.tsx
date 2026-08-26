import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, Img } from 'remotion';
import { C } from '../theme';
import { ImgRef } from '../assets';

export const FloatCard: React.FC<{
  img: ImgRef;
  width: number;
  cx: number;
  cy: number;
  delay?: number;
  rot?: number;
  floatAmp?: number;
  glow?: boolean;
  exitAt?: number; // local frame to start exiting
  z?: number;
}> = ({ img, width, cx, cy, delay = 0, rot = 0, floatAmp = 10, glow = true, exitAt, z = 1 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const height = width * (img.h / img.w);
  const s = spring({ frame: f - delay, fps, config: { damping: 17, mass: 0.7, stiffness: 120 } });
  const exit = exitAt != null ? interpolate(f, [exitAt, exitAt + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
  const op = s * (1 - exit);
  const scale = (0.84 + 0.16 * s) * (1 - exit * 0.1);
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - width / 2,
        top: cy - height / 2,
        width,
        height,
        transform: `translateY(${(1 - s) * 40 + exit * 30}px) rotate(${rot}deg) scale(${scale})`,
        opacity: op,
        zIndex: z,
        borderRadius: 26,
        boxShadow: `0 30px 70px rgba(0,0,0,0.55)${glow ? `, 0 0 50px ${C.green}22` : ''}`,
      }}
    >
      <Img
        src={img.src}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 26,
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'block',
        }}
      />
    </div>
  );
};
