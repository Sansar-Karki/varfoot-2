import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import './fonts';
import { C } from './theme';
import { Bg, Grain } from './components/Bg';
import { Eyebrow, Headline, Sub } from './components/ui';
import { BrandLockup } from './components/Brand';
import { IMG, SCORE } from './assets';
import { BODY, MONO } from './fonts';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ---- timing (60fps) ----
export const DS_FPS = 60;
const INTRO = 96; // 1.6s
const PART = 180; // 3.0s each
const OUTRO = 150; // 2.5s
const PARTS_FROM = INTRO;

// ---- phone geometry (footage is 812x1700) ----
const PH = 884;
const PW = Math.round(PH * (812 / 1700)); // ~422
const BEZEL = 12;
const SCREEN_W = PW - BEZEL * 2;
const SCREEN_H = PH - BEZEL * 2;
const CX = 600;
const CY = 540;

const PHONE_SRC = staticFile('phone_clean.mp4');

// each part: footage window start (footage frames @60fps) + caption
const PARTS = [
  { foot: 270, eyebrow: 'Varsity readiness', headline: 'Your readiness,\nscored.', sub: 'One weighted score across every skill that matters.' },
  { foot: 1200, eyebrow: 'Train', headline: 'Coached,\nnever generic.', sub: 'Every drill has a setup, an action, a measure, and a cue.' },
  { foot: 2160, eyebrow: 'Progress', headline: 'Watch the\nscore climb.', sub: 'Score history and a live skills radar.' },
  { foot: 3180, eyebrow: 'Fuel', headline: 'Eat like\nan athlete.', sub: 'Real USDA foods, tracked to the gram.' },
  { foot: 4380, eyebrow: 'AI coach', headline: 'A coach that\nknows you.', sub: 'Grounded in your readiness, gaps, and plan.' },
];
export const DS_TOTAL = INTRO + PART * PARTS.length + OUTRO;
const OUTRO_FROM = INTRO + PART * PARTS.length;

// persistent stationary phone; screen window hard-cuts per part
const PhoneVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  const enter = spring({ frame: f, fps, config: { damping: 16, mass: 0.8, stiffness: 110 } });
  const ty = (1 - enter) * 70;
  return (
    <div
      style={{
        position: 'absolute',
        left: CX - PW / 2,
        top: CY - PH / 2,
        width: PW,
        height: PH,
        opacity: enter,
        transform: `translateY(${ty}px)`,
      }}
    >
      <div style={{ position: 'absolute', inset: -80, background: `radial-gradient(closest-side, ${C.green}30, transparent 72%)`, filter: 'blur(18px)' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 52,
          background: 'linear-gradient(160deg, #20262E 0%, #0B0E13 46%, #05070A 100%)',
          padding: BEZEL,
          boxShadow: '0 40px 90px rgba(0,0,0,0.6), inset 0 0 0 1.5px rgba(255,255,255,0.10), inset 0 2px 2px rgba(255,255,255,0.18)',
        }}
      >
        <div style={{ position: 'relative', width: SCREEN_W, height: SCREEN_H, borderRadius: 40, overflow: 'hidden', background: C.bg0 }}>
          {PARTS.map((p, i) => (
            <Sequence key={i} from={i * PART} durationInFrames={PART} layout="none">
              <OffthreadVideo
                src={PHONE_SRC}
                trimBefore={p.foot}
                muted
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Sequence>
          ))}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.08) 0%, transparent 22%, transparent 80%, rgba(255,255,255,0.03) 100%)', pointerEvents: 'none' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', top: BEZEL + 10, left: '50%', transform: 'translateX(-50%)', width: 104, height: 28, borderRadius: 18, background: '#04060A' }} />
    </div>
  );
};

const Caption: React.FC<{ p: (typeof PARTS)[number] }> = ({ p }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const op = Math.min(interpolate(f, [0, 12], [0, 1], clamp), interpolate(f, [durationInFrames - 12, durationInFrames], [1, 0], clamp));
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 880, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, padding: '0 110px 0 0' }}>
        <Eyebrow delay={2}>{p.eyebrow}</Eyebrow>
        <Headline text={p.headline} delay={6} size={82} />
        <Sub delay={20} width={560}>{p.sub}</Sub>
      </div>
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [INTRO - 14, INTRO], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: op }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        <BrandLockup delay={2} iconSize={120} wordScale={1.3} />
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 32, color: C.inkMute, opacity: interpolate(f, [22, 44], [0, 1], clamp) }}>
          Train with purpose. Make varsity.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const pill = spring({ frame: f - 30, fps, config: { damping: 14, mass: 0.7, stiffness: 130 } });
  const fade = interpolate(f, [durationInFrames - 26, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: fade }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
        <BrandLockup delay={2} iconSize={130} wordScale={1.45} />
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 34, color: C.inkMute, opacity: interpolate(f, [18, 40], [0, 1], clamp) }}>
          Train with purpose. Make varsity.
        </div>
        <div
          style={{
            padding: '18px 38px',
            borderRadius: 999,
            background: C.green,
            color: '#04210F',
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 32,
            opacity: pill,
            transform: `scale(${0.82 + pill * 0.18})`,
            boxShadow: `0 0 56px ${C.green}77`,
          }}
        >
          varfoot.vercel.app
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const DemoShort: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg0 }}>
      <Bg intensity={0.9} />

      <Sequence durationInFrames={INTRO} name="Intro">
        <Intro />
      </Sequence>

      <Sequence from={PARTS_FROM} durationInFrames={PART * PARTS.length} name="Phone">
        <PhoneVideo />
      </Sequence>

      {PARTS.map((p, i) => (
        <Sequence key={i} from={PARTS_FROM + i * PART} durationInFrames={PART} name={p.eyebrow}>
          <Caption p={p} />
        </Sequence>
      ))}

      <Sequence from={OUTRO_FROM} durationInFrames={OUTRO} name="Outro">
        <Outro />
      </Sequence>

      <Grain />
      <Audio src={SCORE} trimBefore={390} volume={(ff) => interpolate(ff, [0, 10, DS_TOTAL - 80, DS_TOTAL], [0, 1, 1, 0], clamp)} />
    </AbsoluteFill>
  );
};
