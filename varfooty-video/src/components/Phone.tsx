import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing, Img } from 'remotion';
import { C, PHONE_W, PHONE_H, SCN } from '../theme';
import { IMG, ImgRef } from '../assets';

type Seg = { s: number; img: ImgRef; sc0: number; sc1: number };

// relative to the Phone sequence (which starts at SCN.reveal)
const R = (abs: number) => abs - SCN.reveal;
const SPAN = SCN.recap - SCN.reveal;

const SEGS: Seg[] = [
  { s: 0, img: IMG.today, sc0: 0.02, sc1: 0.1 },
  { s: R(SCN.train), img: IMG.session, sc0: 0.0, sc1: 0.04 },
  { s: R(SCN.train) + 200, img: IMG.drill, sc0: 0.0, sc1: 0.28 },
  { s: R(SCN.plan), img: IMG.planTall, sc0: 0.0, sc1: 0.6 },
  { s: R(SCN.fuel), img: IMG.fuel, sc0: 0.0, sc1: 0.06 },
  { s: R(SCN.fuel) + 320, img: IMG.fuelSearch, sc0: 0.0, sc1: 0.16 },
  { s: R(SCN.coach), img: IMG.coachEmpty, sc0: 0, sc1: 0 },
  { s: R(SCN.coach) + 130, img: IMG.coachAnswer, sc0: 0.0, sc1: 0.02 },
];

const BEZEL = 13;
const SCREEN_W = PHONE_W - BEZEL * 2;
const SCREEN_H = PHONE_H - BEZEL * 2;
const XFADE = 16;

const segEnd = (i: number) => (i + 1 < SEGS.length ? SEGS[i + 1].s : SPAN);

const ScreenImg: React.FC<{ seg: Seg; f: number; opacity: number; scalePunch?: number }> = ({ seg, f, opacity, scalePunch = 1 }) => {
  const p = interpolate(f, [seg.s, segEndOf(seg)], [seg.sc0, seg.sc1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });
  const baseH = SCREEN_W * (seg.img.h / seg.img.w);
  const cover = Math.max(1, SCREEN_H / baseH); // ensure the screen is always filled
  const w = SCREEN_W * cover;
  const h = baseH * cover;
  const left = (SCREEN_W - w) / 2;
  const range = Math.max(0, h - SCREEN_H);
  const ty = -p * range;
  return (
    <Img
      src={seg.img.src}
      style={{
        position: 'absolute',
        top: 0,
        left,
        width: w,
        height: h,
        transform: `translateY(${ty}px) scale(${scalePunch})`,
        transformOrigin: 'center top',
        opacity,
      }}
    />
  );
};

function segEndOf(seg: Seg) {
  const i = SEGS.indexOf(seg);
  return segEnd(i);
}

export const Phone: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // current segment
  let i = 0;
  for (let k = SEGS.length - 1; k >= 0; k--) {
    if (f >= SEGS[k].s) {
      i = k;
      break;
    }
  }
  const seg = SEGS[i];
  const intoSeg = f - seg.s;
  const xfIn = i > 0 ? interpolate(intoSeg, [0, XFADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  const prev = SEGS[i - 1];

  // Stationary within each section. The phone only relocates to the other side
  // DURING the swoosh transition window (so the move is masked, never a slow drift).
  const TR = R(SCN.train), PL = R(SCN.plan), FU = R(SCN.fuel), CO = R(SCN.coach);
  const WIN = 8;
  const cx = interpolate(
    f,
    [0, TR - WIN, TR + WIN, PL - WIN, PL + WIN, FU - WIN, FU + WIN, CO - WIN, CO + WIN, SPAN],
    [700, 700, 1232, 1232, 700, 700, 1232, 1232, 742, 742],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
  );
  const cy = 540; // fixed — no breathing bob
  const tilt = interpolate(960 - cx, [-540, 540], [-6, 6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // entrance (slam in on the drop) + exit
  const enter = spring({ frame: f, fps, config: { damping: 15, mass: 0.9, stiffness: 110 } });
  const exit = interpolate(f, [SPAN - 26, SPAN], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const appear = enter * (1 - exit);
  const ty = (1 - enter) * 120 + exit * 140;
  const scale = (0.9 + 0.1 * enter) * (1 - exit * 0.12);

  return (
    <div
      style={{
        position: 'absolute',
        left: cx - PHONE_W / 2,
        top: cy - PHONE_H / 2,
        width: PHONE_W,
        height: PHONE_H,
        transform: `perspective(1600px) rotateY(${tilt}deg) translateY(${ty}px) scale(${scale})`,
        transformOrigin: 'center center',
        opacity: appear,
      }}
    >
      {/* glow behind */}
      <div
        style={{
          position: 'absolute',
          inset: -90,
          background: `radial-gradient(closest-side, ${C.green}33, transparent 72%)`,
          filter: 'blur(20px)',
        }}
      />
      {/* device body */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 52,
          background: 'linear-gradient(160deg, #20262E 0%, #0B0E13 46%, #05070A 100%)',
          padding: BEZEL,
          boxShadow:
            '0 40px 90px rgba(0,0,0,0.6), 0 6px 24px rgba(0,0,0,0.5), inset 0 0 0 1.5px rgba(255,255,255,0.10), inset 0 2px 2px rgba(255,255,255,0.18)',
        }}
      >
        {/* screen */}
        <div
          style={{
            position: 'relative',
            width: SCREEN_W,
            height: SCREEN_H,
            borderRadius: 40,
            overflow: 'hidden',
            background: C.bg0,
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.8)',
          }}
        >
          {prev && xfIn < 1 && <ScreenImg seg={prev} f={f} opacity={1 - xfIn} />}
          <ScreenImg seg={seg} f={f} opacity={xfIn} scalePunch={interpolate(intoSeg, [0, XFADE], [1.04, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
          {/* screen sheen */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(115deg, rgba(255,255,255,0.10) 0%, transparent 22%, transparent 78%, rgba(255,255,255,0.04) 100%)`,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
      {/* notch / camera */}
      <div
        style={{
          position: 'absolute',
          top: BEZEL + 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 104,
          height: 30,
          borderRadius: 20,
          background: '#04060A',
        }}
      />
    </div>
  );
};
