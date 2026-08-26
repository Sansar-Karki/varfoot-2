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

const VW = 393, VH = 852, DSF = 3;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: VW, height: VH },
  deviceScaleFactor: DSF,
  isMobile: true,
  hasTouch: true,
  reducedMotion: 'no-preference',
});
const page = await ctx.newPage();
const inject = async () => { await page.addStyleTag({ content: HIDE_DEV }).catch(() => {}); };

async function shot(name) {
  await inject();
  await page.screenshot({ path: path.join(OUT, name) });
  log('  shot', name);
}

// crisp clip-crop of a card found by text; climbs to a container wide enough to be the card
async function cardShot(name, regex, { pad = 0, minW = 300, climb = 0 } = {}) {
  try {
    const loc = page.getByText(regex).first();
    await loc.waitFor({ state: 'visible', timeout: 4000 });
    const box = await loc.evaluate((el, args) => {
      let n = el;
      for (let i = 0; i < 40; i++) {
        const r = n.getBoundingClientRect();
        if (r.width >= args.minW && r.height >= 40) break;
        if (!n.parentElement) break;
        n = n.parentElement;
      }
      for (let i = 0; i < args.climb; i++) if (n.parentElement) n = n.parentElement;
      const r = n.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }, { minW, climb });
    const clip = {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: Math.min(VW, box.width + pad * 2),
      height: box.height + pad * 2,
    };
    await inject();
    await page.screenshot({ path: path.join(OUT, name), clip });
    log('  card', name, JSON.stringify(clip));
  } catch (e) {
    log('  !! cardShot FAILED', name, e.message.split('\n')[0]);
  }
}

async function tab(name) {
  const btn = page.locator('button, a, [role="tab"]').filter({ hasText: new RegExp('^' + name + '$', 'i') }).first();
  if (await btn.count()) { await btn.click().catch(() => {}); await sleep(1400); }
  await inject();
}

// ---------- boot + demo login ----------
log('BOOT', BASE);
await page.goto(BASE, { waitUntil: 'networkidle' });
await inject();
await sleep(500);
await shot('auth.png');

await page.getByText(/Explore as Jordan/i).first().click().catch(() => {});
await page.waitForLoadState('networkidle').catch(() => {});
await sleep(1600);
await inject();

// ---------- TODAY ----------
await tab('TODAY');
await shot('today.png');
await cardShot('upnext.png', /UP NEXT/i, { pad: 0, climb: 1 });
await cardShot('readiness.png', /VARSITY READINESS/i, { climb: 1 });
await cardShot('gap.png', /BIGGEST GAP/i, { climb: 1 });
await cardShot('coachnote.png', /COACH NOTE/i, { climb: 1 });

// ---------- PLAN (roadmap) ----------
await tab('PLAN');
await shot('plan.png');
await cardShot('plan-banner.png', /BUILDING TOWARD/i, { climb: 2 });
await cardShot('plan-upnext.png', /UP NEXT/i, { climb: 2 });

// ---------- TRAIN (progress) ----------
await tab('TRAIN');
await shot('progress.png');
await cardShot('score-history.png', /SCORE HISTORY/i, { climb: 1 });
await cardShot('radar.png', /SKILLS RADAR/i, { climb: 1 });
await cardShot('drill-progress.png', /The Recovery Sprint/i, { climb: 2 });

// ---------- FUEL ----------
await tab('FUEL');
await shot('fuel.png');
await cardShot('macro-ring.png', /KCAL/i, { climb: 3 });
await cardShot('meal-lunch.png', /Lunch/i, { climb: 2 });

// fuel search interaction
try {
  const logMeal = page.getByText(/Log a meal/i).first();
  if (await logMeal.count()) {
    await logMeal.click(); await sleep(1200); await inject();
    await shot('fuel-logmeal.png');
    const search = page.locator('input[type="search"], input[type="text"], input:not([type]), input[placeholder]').first();
    if (await search.count()) {
      await search.click(); await search.fill('chicken'); await sleep(2600); await inject();
      await shot('fuel-search.png');
      await cardShot('fuel-result.png', /chicken/i, { climb: 2 });
    } else { log('  !! no search input found'); }
  }
} catch (e) { log('  !! fuel search failed', e.message.split('\n')[0]); }

// ---------- COACH ----------
try {
  await tab('COACH');
  await sleep(800); await inject();
  await shot('coach-empty.png');
  const input = page.locator('textarea, input[type="text"], input:not([type]), input[placeholder]').last();
  if (await input.count()) {
    await input.click();
    await input.fill('What should I focus on to make varsity this season?');
    await sleep(300); await inject();
    await shot('coach-typed.png');
    // submit (Enter, then look for a send button)
    await input.press('Enter').catch(() => {});
    const send = page.locator('button').filter({ hasText: /send|ask/i }).first();
    if (await send.count()) await send.click().catch(() => {});
    // wait for an answer to render
    let prevLen = 0, stable = 0;
    for (let i = 0; i < 40; i++) {
      await sleep(900);
      const len = await page.evaluate(() => document.body.innerText.length);
      if (len === prevLen) { stable++; if (stable >= 3 && len > 600) break; } else { stable = 0; }
      prevLen = len;
    }
    await inject();
    await shot('coach-answer.png');
  } else { log('  !! no coach input found'); }
} catch (e) { log('  !! coach failed', e.message.split('\n')[0]); }

// ---------- DRILL / session detail ----------
try {
  await tab('TODAY');
  const up = page.getByText(/UP NEXT/i).first();
  if (await up.count()) {
    await up.click(); await sleep(1500); await inject();
    await shot('session.png');
    // try to open a single drill within the session
    const firstDrill = page.locator('button').filter({ hasText: /drop|ping|push|sprint|touch|drill|setup|begin|start/i }).first();
    if (await firstDrill.count()) { await firstDrill.click().catch(() => {}); await sleep(1300); await inject(); await shot('drill.png'); }
  }
} catch (e) { log('  !! drill failed', e.message.split('\n')[0]); }

// ---------- TALL clean strips (hide fixed chrome, tall viewport) ----------
async function tallStrip(tabName, name, height = 2200) {
  try {
    await page.goto(BASE, { waitUntil: 'networkidle' }); // reset
    await inject();
    await page.getByText(/Explore as Jordan/i).first().click().catch(() => {});
    await sleep(1400);
    await tab(tabName);
    await page.setViewportSize({ width: VW, height });
    await sleep(700);
    await page.evaluate(() => {
      [...document.querySelectorAll('*')].forEach((el) => {
        const p = getComputedStyle(el).position;
        if (p === 'fixed' || p === 'sticky') el.style.display = 'none';
      });
      window.scrollTo(0, 0);
    });
    await inject();
    await page.screenshot({ path: path.join(OUT, name), fullPage: true });
    log('  tall', name);
    await page.setViewportSize({ width: VW, height: VH });
  } catch (e) { log('  !! tall failed', name, e.message.split('\n')[0]); }
}
await tallStrip('PLAN', 'plan-tall.png', 2600);
await tallStrip('TRAIN', 'progress-tall.png', 2200);

await browser.close();
log('\nCAPTURE DONE ->', OUT);
