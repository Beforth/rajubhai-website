import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4323/order';
const out = process.argv[3] || '.ui-fix/runs/2026-11-02-orderpage/screens/before-desktop.png';
const width = Number(process.argv[4] || 1440);
const height = Number(process.argv[5] || 1000);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: out, fullPage: true });
await page.screenshot({ path: out.replace('.png', '-fold.png'), fullPage: false });
const metrics = await page.evaluate(() => ({
  title: document.title,
  scrollHeight: document.documentElement.scrollHeight,
  headings: [...document.querySelectorAll('h1,h2,h3')].slice(0, 14).map((h) => h.tagName + ': ' + h.innerText.trim().slice(0, 60)),
  navCount: document.querySelectorAll('header, [role="navigation"]').length,
  bodyText: document.body.innerText.slice(0, 700),
}));
console.log(JSON.stringify({ metrics, errors }, null, 2));
await browser.close();
