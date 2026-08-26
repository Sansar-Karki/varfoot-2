// ---- Brand palette (locked to the app) ------------------------------------
export const C = {
  bg0: '#05060A',
  bg1: '#080A0F',
  bg2: '#0E1116',
  green: '#12FC74',
  greenDim: '#0CB857',
  greenDeep: '#0A3D24',
  blue: '#3FA9F5',
  amber: '#F5C24B',
  ink: '#F4F8F4',
  inkMute: '#9AA6A0',
  inkFaint: '#5C6862',
  line: 'rgba(255,255,255,0.08)',
};

// ---- Composition ----------------------------------------------------------
export const FPS = 60;
export const W = 1920;
export const H = 1080;
export const BPM = 123;

// frames per bar / beat (beat-locked to public/score.wav)
export const FPB = (240 * FPS) / BPM; // 4 beats * 60s/BPM * FPS
export const FP_BEAT = FPB / 4;
export const bar = (b: number) => Math.round(b * FPB);
export const beat = (b: number) => Math.round(b * FP_BEAT);

// ---- Scene boundaries (absolute frames, matched to the soundtrack) --------
export const SCN = {
  cold: bar(0),     // 0      cold open + problem
  reveal: bar(4),   // 468    readiness reveal (the drop)
  train: bar(10),   // 1171   train / drill
  plan: bar(16),    // 1873   roadmap
  fuel: bar(21),    // 2459   nutrition
  coach: bar(27),   // 3161   AI coach (breakdown)
  recap: bar(34),   // 3980   recap montage
  outro: bar(39),   // 4566   CTA + resolve
  end: bar(43),     // 5034
};

export const TOTAL_FRAMES = SCN.end;

// phone geometry on the 1920x1080 stage
export const PHONE_H = 884;
export const PHONE_W = Math.round(PHONE_H * (1179 / 2556)); // ~408
