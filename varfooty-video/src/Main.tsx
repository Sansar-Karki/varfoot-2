import React from 'react';
import { AbsoluteFill, Sequence, Audio, Img, useCurrentFrame, interpolate } from 'remotion';
import './fonts';
import { C, SCN } from './theme';
import { Bg, Grain } from './components/Bg';
import { Phone } from './components/Phone';
import { ColdOpen } from './scenes/ColdOpen';
import { RevealLayer, TrainLayer, PlanLayer, FuelLayer, CoachLayer } from './scenes/Features';
import { Recap } from './scenes/Recap';
import { Outro } from './scenes/Outro';
import { IMG, SCORE } from './assets';
import { BODY } from './fonts';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Metallic swoosh (brand-tinted) at major section boundaries — PVS signature.
const SWOOSH_BOUNDS = [SCN.train, SCN.plan, SCN.fuel, SCN.coach, SCN.recap, SCN.outro];
const SWOOSH_DUR = 15;
const Swoosh: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {SWOOSH_BOUNDS.map((b, i) => {
        const local = f - (b - SWOOSH_DUR / 2);
        if (local < 0 || local > SWOOSH_DUR) return null;
        const p = local / SWOOSH_DUR;
        const pos = interpolate(p, [0, 1], [-20, 120]);
        const op = interpolate(p, [0, 0.5, 1], [0, 1, 0]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: op,
              background: `linear-gradient(105deg,
                transparent ${pos - 14}%,
                rgba(255,255,255,0) ${pos - 9}%,
                rgba(150,255,200,0.18) ${pos - 5}%,
                rgba(18,252,116,0.45) ${pos - 2}%,
                rgba(255,255,255,0.92) ${pos}%,
                rgba(18,252,116,0.45) ${pos + 2}%,
                rgba(150,255,200,0.18) ${pos + 5}%,
                rgba(255,255,255,0) ${pos + 9}%,
                transparent ${pos + 14}%)`,
            }}
          />
        );
      })}
    </>
  );
};

const Watermark: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [10, 30], [0, 0.92], clamp);
  return (
    <div style={{ position: 'absolute', top: 56, left: 70, display: 'flex', alignItems: 'center', gap: 14, opacity: op }}>
      <Img src={IMG.icon.src} style={{ width: 42, height: 42, borderRadius: 11 }} />
      <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 28, letterSpacing: '-0.01em', color: C.ink }}>VarFooty</span>
    </div>
  );
};

export const VarFooty: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg0 }}>
      <Bg />

      <Sequence durationInFrames={SCN.reveal} name="Cold open">
        <ColdOpen />
      </Sequence>

      {/* persistent phone across the feature sections */}
      <Sequence from={SCN.reveal} durationInFrames={SCN.recap - SCN.reveal} name="Phone">
        <Phone />
      </Sequence>
      <Sequence from={SCN.reveal} durationInFrames={SCN.recap - SCN.reveal} name="Watermark">
        <Watermark />
      </Sequence>

      {/* feature caption / motion-graphics layers */}
      <Sequence from={SCN.reveal} durationInFrames={SCN.train - SCN.reveal} name="Reveal">
        <RevealLayer />
      </Sequence>
      <Sequence from={SCN.train} durationInFrames={SCN.plan - SCN.train} name="Train">
        <TrainLayer />
      </Sequence>
      <Sequence from={SCN.plan} durationInFrames={SCN.fuel - SCN.plan} name="Plan">
        <PlanLayer />
      </Sequence>
      <Sequence from={SCN.fuel} durationInFrames={SCN.coach - SCN.fuel} name="Fuel">
        <FuelLayer />
      </Sequence>
      <Sequence from={SCN.coach} durationInFrames={SCN.recap - SCN.coach} name="Coach">
        <CoachLayer />
      </Sequence>

      <Sequence from={SCN.recap} durationInFrames={SCN.outro - SCN.recap} name="Recap">
        <Recap />
      </Sequence>
      <Sequence from={SCN.outro} durationInFrames={SCN.end - SCN.outro} name="Outro">
        <Outro />
      </Sequence>

      <Swoosh />
      <Grain />
      <Audio src={SCORE} />
    </AbsoluteFill>
  );
};
