import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, Img } from 'remotion';
import { C } from '../theme';
import { IMG } from '../assets';

export const BrandLockup: React.FC<{
  delay?: number;
  iconSize?: number;
  vertical?: boolean;
  wordScale?: number;
}> = ({ delay = 0, iconSize = 108, vertical = false, wordScale = 1 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const si = spring({ frame: f - delay, fps, config: { damping: 14, mass: 0.8, stiffness: 120 } });
  const sw = spring({ frame: f - delay - 8, fps, config: { damping: 18, mass: 0.7, stiffness: 120 } });
  const wmW = 360 * wordScale;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        alignItems: 'center',
        gap: vertical ? 30 : 26,
      }}
    >
      <div
        style={{
          width: iconSize,
          height: iconSize,
          transform: `scale(${0.6 + si * 0.4}) rotate(${(1 - si) * -12}deg)`,
          opacity: si,
          borderRadius: iconSize * 0.26,
          boxShadow: `0 18px 50px rgba(0,0,0,0.5), 0 0 50px ${C.green}33`,
        }}
      >
        <Img src={IMG.icon.src} style={{ width: '100%', height: '100%', borderRadius: iconSize * 0.26, display: 'block' }} />
      </div>
      <div style={{ overflow: 'hidden' }}>
        <Img
          src={IMG.wordmark.src}
          style={{
            width: wmW,
            height: wmW * (IMG.wordmark.h / IMG.wordmark.w),
            display: 'block',
            transform: `translateX(${(1 - sw) * -30}px)`,
            opacity: sw,
          }}
        />
      </div>
    </div>
  );
};
