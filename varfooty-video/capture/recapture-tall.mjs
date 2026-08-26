import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'public', 'app');
const BASE = process.env.BASE || 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HIDE = `nextjs-portal,[data-next-badge-root],[data-next-badge],[data-nextjs-dev-tools-button]{display:none!important}* {caret-color:transparent!important}`;

const TALLVH = 1820;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 393, height: TALLVH }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: HIDE });
await page.getByText(/Explore as Jordan/i).first().click().catch(() => {});
await sleep(1500);

async function grabTall(tabName, outName) {
  const btn = page.locator('button,a,[role="tab"]').filter({ hasText: new RegExp('^' + tabName + '$', 'i') }).first();
  if (await btn.count()) { await btn.click().catch(() => {}); await sleep(1500); }
  await page.addStyleTag({ content: HIDE });
  // hide the bottom tab bar so it doesn't float over the long content
  await page.evaluate(() => {
    const navs = [...document.querySelectorAll('nav, footer, div')].filter((n) => {
      const t = n.innerText || '';
      return ['TODAY', 'PLAN', 'TRAIN', 'FUEL', 'COACH'].every((k) => t.includes(k)) && n.getBoundingClientRect().height < 170;
    });
    navs.forEach((n) => (n.style.display = 'none'));
  });
  await sleep(400);
  // measure real content height inside the scroller
  const h = await page.evaluate(() => {
    const sc = document.querySelector('.content-scroll') || document.scrollingElement;
    return Math.min(1800, sc.scrollHeight);
  });
  const clipH = Math.min(TALLVH, h + 40);
  await page.screenshot({ path: path.join(OUT, outName), clip: { x: 0, y: 0, width: 393, height: clipH } });
  console.log(tabName, '-> contentH', h, 'clipH', clipH, '->', outName);
}

await grabTall('PLAN', 'plan-tall.png');
await grabTall('TRAIN', 'progress-tall.png');
await browser.close();
console.log('RECAPTURE DONE');
