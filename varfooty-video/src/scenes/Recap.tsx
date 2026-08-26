import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { C } from '../components/ui';
import { FloatCard } from '../components/FloatCard';
import { IMG, ImgRef } from '../assets';
import { DISPLAY, MONO } from '../fonts';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const ITEMS: { word: string; img: ImgRef; side: 'left' | 'right' }[] = [
  { word: 'READINESS', img: IMG.cReadiness, side: 'right' },
  { word: 'TRAINING', img: IMG.cDrill, side: 'left' },
  { word: 'A ROADMAP', img: IMG.cScore, side: 'right' },
  { word: 'NUTRITION', img: IMG.cMacro, side: 'left' },
  { word: 'COACHING', img: IMG.cCoachNote, side: 'right' },
];

const ITEM_DUR = 117; // ~1 bar

const RecapItem: React.FC<{ i: number; active: boolean }> = ({ i, active }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = f - i * ITEM_DUR;
  const s = spring({ frame: local, fps, config: { damping: 16, mass: 0.6, stiffness: 150 } });
  const out = interpolate(local, [ITEM_DUR - 14, ITEM_DUR], [1, 0], clamp);
  const op = s * out;
  if (!active) return null;
  const it = ITEMS[i];
  const wordX = it.side === 'right' ? 220 : 1700;
  const cardCx = it.side === 'right' ? 1380 : 540;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          [it.side === 'right' ? 'left' : 'right']: 150,
          transform: `translateY(-50%) translateX(${(1 - s) * (it.side === 'right' ? -50 : 50)}px)`,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 120,
          letterSpacing: '-0.03em',
          color: C.ink,
          lineHeight: 0.95,
          maxWidth: 760,
        }}
      >
        {it.word}
      </div>
      <FloatCard img={it.img} width={560} cx={cardCx} cy={540} delay={i * ITEM_DUR + 2} rot={it.side === 'right' ? 3 : -3} floatAmp={6} />
    </AbsoluteFill>
  );
};

export const Recap: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const idx = Math.min(ITEMS.length - 1, Math.floor(f / ITEM_DUR));
  const fade = interpolate(f, [0, 12, durationInFrames - 12, durationInFrames], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      {/* tiny header */}
      <div
        style={{
          position: 'absolute',
          top: 92,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: '0.4em',
          color: C.green,
          textTransform: 'uppercase',
        }}
      >
        Everything in one app
      </div>
      <RecapItem i={idx} active />
      {/* progress dots */}
      <div style={{ position: 'absolute', bottom: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {ITEMS.map((_, k) => (
          <span
            key={k}
            style={{
              width: k === idx ? 36 : 12,
              height: 12,
              borderRadius: 12,
              background: k === idx ? C.green : 'rgba(255,255,255,0.18)',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
