import { loadFont as loadDisplay } from '@remotion/google-fonts/BricolageGrotesque';
import { loadFont as loadBody } from '@remotion/google-fonts/HankenGrotesk';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

const display = loadDisplay('normal', { weights: ['600', '700', '800'], subsets: ['latin'] });
const body = loadBody('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] });
const mono = loadMono('normal', { weights: ['500', '700'], subsets: ['latin'] });

export const DISPLAY = display.fontFamily;
export const BODY = body.fontFamily;
export const MONO = mono.fontFamily;
