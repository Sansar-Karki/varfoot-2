import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Eyebrow, Headline, Sub, Chip, Counter, C } from '../components/ui';
import { FloatCard } from '../components/FloatCard';
import { IMG } from '../assets';
import { MONO, BODY } from '../fonts';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const SceneFade: React.FC<{ children: React.ReactNode; inF?: number; outF?: number }> = ({ children, inF = 16, outF = 15 }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const op = Math.min(
    interpolate(f, [0, inF], [0, 1], clamp),
    interpolate(f, [durationInFrames - outF, durationInFrames], [1, 0], clamp)
  );
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};

const Caption: React.FC<{ side: 'left' | 'right'; children: React.ReactNode }> = ({ side, children }) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      [side]: 0,
      width: 840,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 26,
      padding: side === 'left' ? '0 0 0 120px' : '0 120px 0 0',
      alignItems: 'flex-start',
    }}
  >
    {children}
  </div>
);

// ---------- REVEAL (readiness) ----------
export const RevealLayer: React.FC = () => (
  <SceneFade>
    <FloatCard img={IMG.cReadiness} width={560} cx={690} cy={300} delay={14} rot={-2} />
    <Caption side="right">
      <Eyebrow delay={2}>Varsity Readiness</Eyebrow>
      <Headline text={'Your readiness,\nscored.'} delay={6} size={92} />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 6 }}>
        <Counter to={70} delay={20} dur={46} size={150} />
        <span style={{ fontFamily: MONO, fontSize: 40, color: C.inkFaint }}>/ 100</span>
      </div>
      <Sub delay={30} width={560}>
        One weighted score across technical, physical, speed and nutrition. The whole picture, in a glance.
      </Sub>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
        <Chip delay={42}>Technical 71</Chip>
        <Chip delay={50} accent={C.blue}>Physical 70</Chip>
        <Chip delay={58} accent={C.amber}>Speed 55</Chip>
      </div>
    </Caption>
  </SceneFade>
);

// ---------- TRAIN (drill) ----------
const StepChip: React.FC<{ label: string; n: number; delay: number }> = ({ label, n, delay }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = interpolate(f - delay, [0, 12], [0, 1], clamp);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 24px',
        borderRadius: 16,
        background: 'rgba(14,17,22,0.86)',
        border: `1px solid ${C.line}`,
        opacity: e,
        transform: `translateX(${(1 - e) * 40}px)`,
        boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${C.green}22`,
          color: C.green,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {n}
      </span>
      <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 22, letterSpacing: '0.12em', color: C.ink, textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  );
};

export const TrainLayer: React.FC = () => (
  <SceneFade>
    <Caption side="left">
      <Eyebrow delay={2}>Train</Eyebrow>
      <Headline text={'Coached,\nnever generic.'} delay={6} size={90} />
      <Sub delay={26} width={520}>
        Every drill ships with a setup, an action, a measurement, and a coaching cue. Log a result and your score moves.
      </Sub>
    </Caption>
    <div style={{ position: 'absolute', right: 150, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <StepChip n={1} label="Setup" delay={40} />
      <StepChip n={2} label="Action" delay={50} />
      <StepChip n={3} label="Measurement" delay={60} />
      <StepChip n={4} label="Coaching cue" delay={70} />
    </div>
  </SceneFade>
);

// ---------- PLAN (roadmap) ----------
export const PlanLayer: React.FC = () => (
  <SceneFade>
    <Caption side="right">
      <Eyebrow delay={2}>Roadmap</Eyebrow>
      <Headline text={'A plan,\nweek by week.'} delay={6} size={92} />
      <Sub delay={26} width={560}>
        Sessions auto-ordered by your biggest gaps, counting down to tryout day. No guesswork about what to do next.
      </Sub>
      <div style={{ marginTop: 8 }}>
        <Chip delay={40}>📅 Building toward Jul 15</Chip>
      </div>
    </Caption>
  </SceneFade>
);

// ---------- FUEL ----------
export const FuelLayer: React.FC = () => (
  <SceneFade>
    <Caption side="left">
      <Eyebrow delay={2}>Fuel</Eyebrow>
      <Headline text={'Eat like\nan athlete.'} delay={6} size={92} />
      <Sub delay={26} width={520}>
        Search real USDA foods and build your plate with live macros. Protein, carbs and fat that actually add up.
      </Sub>
    </Caption>
    <FloatCard img={IMG.cMacro} width={560} cx={1230} cy={286} delay={16} rot={2} />
    <FloatCard img={IMG.cFood} width={470} cx={1300} cy={770} delay={34} rot={-2} />
  </SceneFade>
);

// ---------- COACH ----------
export const CoachLayer: React.FC = () => (
  <SceneFade>
    <Caption side="right">
      <Eyebrow delay={2}>AI Coach</Eyebrow>
      <Headline text={'A coach that\nknows you.'} delay={6} size={90} />
      <Sub delay={26} width={580}>
        Grounded in your readiness, gaps, roadmap and nutrition. It answers like it has read your whole profile, because it has.
      </Sub>
      <div
        style={{
          marginTop: 10,
          maxWidth: 600,
          padding: '20px 24px',
          borderRadius: 18,
          border: `1px solid ${C.green}44`,
          background: `${C.green}12`,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 26,
          lineHeight: 1.45,
          color: C.ink,
          opacity: interpolateQuote(),
        }}
      >
        “Prioritize your 5.9s Recovery Sprint to build the speed varsity demands.”
      </div>
    </Caption>
  </SceneFade>
);

function interpolateQuote() {
  // small helper so the quote fades in slightly later
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const f = useCurrentFrame();
  return interpolate(f, [40, 58], [0, 1], clamp);
}
