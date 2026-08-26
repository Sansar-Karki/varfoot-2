import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'shots');
const BASE = process.env.BASE || 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const HIDE_DEV = `
  nextjs-portal, #__next-build-watcher, [data-nextjs-toast],
  [data-next-badge-root], [data-next-badge], [data-nextjs-dev-tools-button],
  [data-nextjs-dialog-overlay] { display:none !important; visibility:hidden !important; }
`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
await ctx.addInitScript(() => {});
const page = await ctx.newPage();
await page.addStyleTag({ content: HIDE_DEV }).catch(() => {});

async function inject() {
  await page.addStyleTag({ content: HIDE_DEV }).catch(() => {});
}

async function survey(name) {
  const info = await page.evaluate(() => {
    const txt = (el) => (el?.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 70);
    const btns = [...document.querySelectorAll('button, a, [role="button"], [role="tab"], input, textarea')]
      .map((el) => ({ tag: el.tagName.toLowerCase(), type: el.getAttribute('type'), ph: el.getAttribute('placeholder'), text: txt(el) }))
      .filter((b) => b.text || b.ph);
    const heads = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => txt(h)).filter(Boolean);
    // find scrollable containers
    const scrollers = [...document.querySelectorAll('*')]
      .filter((el) => el.scrollHeight > el.clientHeight + 40 && el.clientHeight > 200)
      .slice(0, 5)
      .map((el) => ({ tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 50), sh: el.scrollHeight, ch: el.clientHeight }));
    return { url: location.href, headings: heads.slice(0, 16), interactive: btns.slice(0, 30), scrollers };
  });
  console.log(`\n===== ${name} =====`);
  console.log(JSON.stringify(info, null, 2));
}

await page.goto(BASE, { waitUntil: 'networkidle' });
await inject();
await sleep(600);

// demo login
const demo = page.getByText(/Explore as Jordan/i).first();
if (await demo.count()) {
  await demo.click().catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
}
await sleep(1500);
await inject();

const tabs = ['TODAY', 'PLAN', 'TRAIN', 'FUEL', 'COACH'];
let i = 0;
for (const tab of tabs) {
  i++;
  const btn = page.locator('button, a, [role="tab"]').filter({ hasText: new RegExp('^' + tab + '$', 'i') }).first();
  if (await btn.count()) {
    await btn.click().catch(() => {});
    await sleep(1400);
  }
  await inject();
  await page.screenshot({ path: path.join(OUT, `tab-${i}-${tab.toLowerCase()}.png`) });
  await survey('TAB: ' + tab);
}

await browser.close();
console.log('\nEXPLORE DONE');
