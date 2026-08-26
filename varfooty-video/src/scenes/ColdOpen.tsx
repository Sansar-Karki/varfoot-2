import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { Headline, C } from '../components/ui';
import { BrandLockup } from '../components/Brand';
import { MONO, BODY } from '../fonts';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const ColdOpen: React.FC = () => {
  const f = useCurrentFrame();

  // phase opacities
  const p1 = Math.min(interpolate(f, [6, 26], [0, 1], clamp), interpolate(f, [110, 140], [1, 0], clamp));
  const p2 = Math.min(interpolate(f, [120, 140], [0, 1], clamp), interpolate(f, [286, 312], [1, 0], clamp));
  const p3in = interpolate(f, [312, 336], [0, 1], clamp);

  // riser line that fills toward the drop
  const riser = interpolate(f, [320, 466], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  // anticipation flash at the drop
  const flash = interpolate(f, [452, 466, 468], [0, 0.85, 0], clamp);

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* phase 1 — eyebrow */}
      <div style={{ position: 'absolute', opacity: p1, transform: `translateY(${(1 - p1) * 10}px)` }}>
        <span
          style={{
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: '0.4em',
            color: C.inkMute,
            textTransform: 'uppercase',
          }}
        >
          For every player chasing varsity
        </span>
      </div>

      {/* phase 2 — kinetic hook */}
      <div style={{ position: 'absolute', opacity: p2, textAlign: 'center' }}>
        <Headline text={"Talent isn't the problem."} delay={120} size={74} align="center" />
        <div style={{ height: 18 }} />
        <Headline text={'A plan is.'} delay={170} size={128} align="center" color={C.green} />
      </div>

      {/* phase 3 — brand assembles */}
      <div style={{ position: 'absolute', opacity: p3in, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
        <BrandLockup delay={316} iconSize={132} wordScale={1.25} />
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: '0.01em',
            color: C.inkMute,
            opacity: interpolate(f, [342, 366], [0, 1], clamp),
          }}
        >
          Train with purpose. Make varsity.
        </div>
        {/* riser line */}
        <div style={{ width: 460, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.10)', overflow: 'hidden', marginTop: 8 }}>
          <div style={{ width: `${riser * 100}%`, height: '100%', background: C.green, boxShadow: `0 0 16px ${C.green}` }} />
        </div>
      </div>

      {/* anticipation flash */}
      <AbsoluteFill style={{ background: '#EAFFF3', opacity: flash, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};
