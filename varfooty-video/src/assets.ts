import { staticFile } from 'remotion';

export type ImgRef = { src: string; w: number; h: number };
const mk = (file: string, w: number, h: number): ImgRef => ({ src: staticFile('app/' + file), w, h });

// full screens (1179x2556) + tall strips + card crops
export const IMG = {
  auth: mk('auth.png', 1179, 2556),
  today: mk('today.png', 1179, 2556),
  session: mk('session.png', 1179, 2556),
  drill: mk('drill.png', 1179, 2556),
  fuel: mk('fuel.png', 1179, 2556),
  fuelSearch: mk('fuel-search.png', 1179, 2556),
  coachEmpty: mk('coach-empty.png', 1179, 2556),
  coachAnswer: mk('coach-answer.png', 1179, 2556),
  planTall: mk('plan-tall.png', 1179, 5460),
  progressTall: mk('progress-tall.png', 1179, 5460),
  cReadiness: mk('c-readiness.png', 1125, 351),
  cMacro: mk('c-macro.png', 1125, 456),
  cRadar: mk('c-radar.png', 1125, 783),
  cScore: mk('c-score-history.png', 1125, 483),
  cDrill: mk('c-drill.png', 1125, 387),
  cFood: mk('c-foodresult.png', 1125, 252),
  cCoachNote: mk('c-coachnote.png', 1125, 351),
  cMeal: mk('c-meal.png', 1125, 348),
  icon: mk('brand-icon.png', 208, 208),
  wordmark: mk('wordmark.png', 504, 216),
};

export const SCORE = staticFile('score.wav');
