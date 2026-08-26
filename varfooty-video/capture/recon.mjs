import { chromium } from 'playwright';

const OUT = new URL('./shots/', import.meta.url).pathname;
const BASE = 'http://localhost:3000';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function dump(label, data) {
  console.log(`\n===== ${label} =====`);
  console.log(JSON.stringify(data, null, 2));
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();

async function survey(name) {
  const info = await page.evaluate(() => {
    const txt = (el) => (el?.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 60);
    const btns = [...document.querySelectorAll('button, a, [role="button"], [role="tab"]')]
      .map((el) => ({ tag: el.tagName.toLowerCase(), role: el.getAttribute('role'), text: txt(el), href: el.getAttribute('href') }))
      .filter((b) => b.text);
    const heads = [...document.querySelectorAll('h1,h2,h3')].map((h) => txt(h)).filter(Boolean);
    return {
      url: location.href,
      title: document.title,
      scrollHeight: document.documentElement.scrollHeight,
      headings: heads.slice(0, 20),
      interactive: btns.slice(0, 40),
    };
  });
  dump(name, info);
}

await page.goto(BASE, { waitUntil: 'networkidle' });
await sleep(800);
await page.screenshot({ path: OUT + '01-auth.png' });
await survey('AUTH SCREEN');

// Try to find the demo button
const demoBtn = page.getByText(/Explore as Jordan|Jordan Reyes|Explore|Demo/i).first();
if (await demoBtn.count()) {
  await demoBtn.click().catch(() => {});
  await page.waitForLoadState('networkidle').catch(() => {});
  await sleep(1500);
}
await page.screenshot({ path: OUT + '02-home.png' });
await survey('AFTER DEMO LOGIN');

await browser.close();
console.log('\nRECON DONE');
