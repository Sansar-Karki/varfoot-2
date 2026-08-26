import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'public', 'app');
const BASE = process.env.BASE || 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HIDE_DEV = `nextjs-portal,[data-next-badge-root],[data-next-badge],[data-nextjs-dev-tools-button]{display:none!important}`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 4, isMobile: true });
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: HIDE_DEV });
await sleep(500);

// wordmark box
const wm = page.getByText('VarFooty', { exact: true }).first();
const wb = await wm.boundingBox();
console.log('wordmark', JSON.stringify(wb));
await page.screenshot({ path: path.join(OUT, 'wordmark.png'), clip: { x: wb.x - 6, y: wb.y - 6, width: wb.width + 12, height: wb.height + 12 } });

// icon = square element above the wordmark, same center
const iconBox = await page.evaluate((wbTop) => {
  const cands = [...document.querySelectorAll('div,span,img,svg')].filter((el) => {
    const r = el.getBoundingClientRect();
    const sq = Math.abs(r.width - r.height) < 14;
    return sq && r.width >= 44 && r.width <= 110 && r.y < wbTop && r.y > wbTop - 160;
  });
  cands.sort((a, b) => b.getBoundingClientRect().y - a.getBoundingClientRect().y); // closest above
  if (!cands.length) return null;
  const r = cands[0].getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}, wb.y);
console.log('icon', JSON.stringify(iconBox));
if (iconBox) {
  await page.screenshot({ path: path.join(OUT, 'brand-icon.png'), clip: { x: iconBox.x, y: iconBox.y, width: iconBox.width, height: iconBox.height } });
}
await browser.close();
console.log('BRAND DONE');
