import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'public', 'app');
fs.mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE || 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

const HIDE_DEV = `
  nextjs-portal, #__next-build-watcher, [data-nextjs-toast],
  [data-next-badge-root], [data-next-badge], [data-nextjs-dev-tools-button],
  [data-nextjs-dialog-overlay] { display:none !important; visibility:hidden !important; }
  * { caret-color: transparent !important; }
`;
const VW = 393, VH = 852;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: VW, height: VH }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
});
const page = await ctx.newPage();
const inject = async () => { await page.addStyleTag({ content: HIDE_DEV }).catch(() => {}); };
const shot = async (name, opts = {}) => { await inject(); await page.screenshot({ path: path.join(OUT, name), ...opts }); log('  shot', name); };

async function navTab(name) {
  const btn = page.locator('button, a, [role="tab"]').filter({ hasText: new RegExp('^' + name + '$', 'i') }).first();
  if (await btn.count()) { await btn.click().catch(() => {}); await sleep(1300); await inject(); return true; }
  return false;
}
async function goHome() {
  for (let i = 0; i < 5; i++) {
    const back = page.getByRole('button', { name: /^back$/i }).first();
    if ((await back.count()) && (await back.isVisible().catch(() => false))) { await back.click().catch(() => {}); await sleep(600); }
    else break;
  }
  await navTab('TODAY');
}

// crop a card by its label text: find the SMALLEST element containing the label, climb to the card container
async function cardClip(name, label, { grow = 0, pad = 7 } = {}) {
  try {
    const box = await page.evaluate(({ label, grow }) => {
      const all = [...document.querySelectorAll('body *')].filter((n) => {
        const t = (n.innerText || '');
        return t.includes(label) && n.getBoundingClientRect().width > 0;
      });
      if (!all.length) return null;
      all.sort((a, b) => {
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return ra.width * ra.height - rb.width * rb.height;
      });
      let n = all[0];
      const isCard = (el) => {
        const s = getComputedStyle(el), r = el.getBoundingClientRect();
        const bg = s.backgroundColor;
        const hasBg = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
        const rad = parseFloat(s.borderRadius) || 0;
        return r.width >= 300 && r.width <= 420 && r.height >= 64 && (hasBg || rad > 6);
      };
      for (let i = 0; i < 40 && n.parentElement; i++) { if (isCard(n)) break; n = n.parentElement; }
      for (let i = 0; i < grow && n.parentElement; i++) n = n.parentElement;
      const r = n.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }, { label, grow });
    if (!box) { log('  !! card not found', name, label); return; }
    const x = Math.max(0, box.x - pad), y = Math.max(0, box.y - pad);
    const clip = { x, y, width: Math.min(VW - x, box.width + pad * 2), height: box.height + pad * 2 };
    await inject();
    await page.screenshot({ path: path.join(OUT, name), clip });
    log('  card', name, `${Math.round(clip.width)}x${Math.round(clip.height)}`);
  } catch (e) { log('  !! cardClip FAILED', name, e.message.split('\n')[0]); }
}

// ---- boot + demo ----
await page.goto(BASE, { waitUntil: 'networkidle' });
await inject(); await sleep(400);
await page.getByText(/Explore as Jordan/i).first().click().catch(() => {});
await page.waitForLoadState('networkidle').catch(() => {});
await sleep(1500); await inject();

// ---- TODAY cards (fixed) ----
await goHome();
await cardClip('c-readiness.png', 'VARSITY READINESS', { grow: 0 });
await cardClip('c-upnext.png', 'Passing focus', { grow: 0 });
await cardClip('c-gap.png', 'BIGGEST GAP RIGHT NOW', { grow: 0 });
await cardClip('c-coachnote.png', 'COACH NOTE', { grow: 0 });

// ---- PROGRESS cards ----
await navTab('TRAIN');
await cardClip('c-score-history.png', 'SCORE HISTORY', { grow: 0 });
await cardClip('c-radar.png', 'SKILLS RADAR', { grow: 0 });
await cardClip('c-drill.png', 'The Recovery Sprint', { grow: 0 });

// ---- FUEL cards ----
await navTab('FUEL');
await cardClip('c-macro.png', 'Protein', { grow: 0 });
await cardClip('c-meal.png', 'Chicken breast', { grow: 0 });

// ---- PLAN card ----
await navTab('PLAN');
await cardClip('c-plansession.png', 'The 30-Step Long Ping', { grow: 0 });

// ---- FUEL SEARCH (results) ----
await goHome();
await navTab('FUEL');
try {
  const logMeal = page.getByText(/Log a meal/i).first();
  if (await logMeal.count()) {
    await logMeal.click(); await sleep(1000); await inject();
    const search = page.locator('input').first();
    await search.click(); await search.fill('chicken breast');
    await search.press('Enter').catch(() => {});
    const searchBtn = page.locator('button:has(svg)').filter({ hasNot: page.getByText(/back/i) }).first();
    await searchBtn.click().catch(() => {});
    // poll for results
    for (let i = 0; i < 16; i++) {
      await sleep(800);
      const hits = await page.locator('text=/kcal|cal\\b|protein|g\\b/i').count().catch(() => 0);
      const len = await page.evaluate(() => document.body.innerText.length);
      if (len > 900) break;
    }
    await inject();
    await shot('fuel-search.png');
    await cardClip('c-foodresult.png', 'Chicken', { grow: 0 });
  }
} catch (e) { log('  !! fuel search failed', e.message.split('\n')[0]); }

// ---- COACH (real Q&A) ----
await goHome();
try {
  if (await navTab('COACH')) {
    await sleep(900); await inject();
    await shot('coach-empty.png');
    const input = page.locator('textarea, input[type="text"], input:not([type])').last();
    if (await input.count()) {
      await input.click();
      await input.fill('What should I focus on to make varsity this season?');
      await sleep(300); await inject();
      await shot('coach-typed.png');
      await input.press('Enter').catch(() => {});
      const send = page.locator('button').filter({ hasText: /send|ask|→/i }).first();
      if (await send.count()) await send.click().catch(() => {});
      // wait for assistant answer
      let prev = 0, stable = 0;
      for (let i = 0; i < 45; i++) {
        await sleep(900);
        const len = await page.evaluate(() => document.body.innerText.length);
        if (len === prev) { stable++; if (stable >= 3 && len > 500) break; } else stable = 0;
        prev = len;
      }
      await inject();
      await shot('coach-answer.png');
    } else { log('  !! coach input not found'); }
  } else { log('  !! COACH tab not found'); }
} catch (e) { log('  !! coach failed', e.message.split('\n')[0]); }

// ---- SESSION / DRILL ----
await goHome();
try {
  const up = page.getByText(/Passing focus/i).first();
  if (await up.count()) {
    await up.click(); await sleep(1500); await inject();
    await shot('session.png');
    const drill = page.locator('button, a').filter({ hasText: /30-Step Long Ping|Max Pushups|drill|begin|start/i }).first();
    if (await drill.count()) { await drill.click().catch(() => {}); await sleep(1300); await inject(); await shot('drill.png'); }
  } else { log('  !! up next not found'); }
} catch (e) { log('  !! session failed', e.message.split('\n')[0]); }

await browser.close();
log('\nCAPTURE2 DONE');
