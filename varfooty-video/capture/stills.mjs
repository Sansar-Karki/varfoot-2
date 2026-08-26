import { bundle } from '@remotion/bundler';
import { selectComposition, renderStill } from '@remotion/renderer';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const frames = (process.argv[2] || '200,360,1300,1950,2600,3320,4040,4750').split(',').map(Number);
const compId = process.argv[3] || 'VarFooty';

console.log('bundling...');
const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src', 'index.ts') });
const comp = await selectComposition({ serveUrl, id: compId });
for (const f of frames) {
  const out = path.join(ROOT, 'out', `s_${compId}_${f}.png`);
  await renderStill({ composition: comp, serveUrl, output: out, frame: f, imageFormat: 'png', overwrite: true });
  console.log('rendered', out);
}
console.log('STILLS DONE');
