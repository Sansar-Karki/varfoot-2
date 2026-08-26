import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from 'remotion';
import { C } from '../theme';
import { DISPLAY, BODY, MONO } from '../fonts';

// re-export brand colors so scenes can import everything from ui
export { C };

const useEnter = (delay: number, damping = 16) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping, mass: 0.7, stiffness: 120 } });
};

export const Eyebrow: React.FC<{ children: React.ReactNode; delay?: number; color?: string }> = ({
  children,
  delay = 0,
  color = C.green,
}) => {
  const e = useEnter(delay, 18);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: e,
        transform: `translateY(${(1 - e) * 18}px)`,
      }}
    >
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: 9,
          background: color,
          boxShadow: `0 0 14px ${color}`,
        }}
      />
      <span
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 21,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: color,
        }}
      >
        {children}
      </span>
    </div>
  );
};

export const Headline: React.FC<{ text: string; delay?: number; size?: number; align?: 'left' | 'center'; color?: string }> = ({
  text,
  delay = 0,
  size = 86,
  align = 'left',
  color = C.ink,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = text.split('\n');
  let wi = 0;
  return (
    <div style={{ textAlign: align }}>
      {lines.map((line, li) => (
        <div key={li} style={{ overflow: 'hidden', paddingBottom: 6 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: `0 ${size * 0.24}px`, justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
            {line.split(' ').map((word, k) => {
              const d = delay + wi * 4;
              wi++;
              const s = spring({ frame: f - d, fps, config: { damping: 18, mass: 0.6, stiffness: 130 } });
              return (
                <span
                  key={k}
                  style={{
                    display: 'inline-block',
                    fontFamily: DISPLAY,
                    fontWeight: 800,
                    fontSize: size,
                    lineHeight: 1.02,
                    letterSpacing: '-0.025em',
                    color,
                    transform: `translateY(${(1 - s) * size * 0.9}px)`,
                    opacity: s,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export const Sub: React.FC<{ children: React.ReactNode; delay?: number; width?: number; align?: 'left' | 'center' }> = ({
  children,
  delay = 0,
  width = 540,
  align = 'left',
}) => {
  const e = useEnter(delay, 20);
  return (
    <div
      style={{
        fontFamily: BODY,
        fontWeight: 500,
        fontSize: 28,
        lineHeight: 1.5,
        color: C.inkMute,
        maxWidth: width,
        opacity: e,
        transform: `translateY(${(1 - e) * 14}px)`,
        textAlign: align,
      }}
    >
      {children}
    </div>
  );
};

export const Chip: React.FC<{ children: React.ReactNode; delay?: number; accent?: string }> = ({
  children,
  delay = 0,
  accent = C.green,
}) => {
  const e = useEnter(delay, 14);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 20px',
        borderRadius: 999,
        border: `1px solid ${accent}55`,
        background: `${accent}14`,
        fontFamily: MONO,
        fontWeight: 500,
        fontSize: 19,
        color: C.ink,
        opacity: e,
        transform: `scale(${0.86 + e * 0.14})`,
        boxShadow: `0 0 28px ${accent}22`,
      }}
    >
      {children}
    </div>
  );
};

export const Counter: React.FC<{
  to: number;
  delay?: number;
  dur?: number;
  size?: number;
  suffix?: string;
}> = ({ to, delay = 0, dur = 50, size = 150, suffix = '' }) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const val = Math.round(p * to);
  const pop = interpolate(f - delay - dur, [0, 8, 16], [1, 1.06, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <span
      style={{
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '-0.03em',
        color: C.green,
        textShadow: `0 0 40px ${C.green}66`,
        display: 'inline-block',
        transform: `scale(${pop})`,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {val}
      {suffix && <span style={{ fontSize: size * 0.4, color: C.inkMute }}>{suffix}</span>}
    </span>
  );
};
