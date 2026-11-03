import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4321/order';
const widths = (process.argv[3] || '1440,390').split(',').map(Number);
const browser = await chromium.launch();

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const data = await page.evaluate(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { top: Math.round(b.top + scrollY), left: Math.round(b.left), w: Math.round(b.width), h: Math.round(b.height) };
    };
    const pick = (sel) => r(document.querySelector(sel));
    const cs = (sel, props) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const s = getComputedStyle(el);
      const o = {};
      props.forEach((p) => (o[p] = s[p]));
      return o;
    };
    const cards = [...document.querySelectorAll('.food-card-interactive')].slice(0, 4).map((c) => ({
      box: r(c),
      text: c.innerText.replace(/\n+/g, ' | ').slice(0, 160),
    }));
    return {
      scrollHeight: document.documentElement.scrollHeight,
      header: pick('body > header, header'),
      appNavbar: pick('[role="navigation"]'),
      topStrip: pick('[role="navigation"] > div:first-child'),
      h1: pick('h1'),
      search: pick('.order-search'),
      catList: pick('.cat-list'),
      catPills: [...document.querySelectorAll('.cat-pill')].map((p) => r(p)),
      grid: pick('.order-items'),
      firstCard: pick('.food-card-interactive'),
      cartPanel: pick('.order-cart'),
      footer: pick('body > footer, footer'),
      h1Style: cs('h1', ['fontSize', 'fontWeight', 'letterSpacing']),
      cards,
      catStyles: [...document.querySelectorAll('.cat-pill')].slice(0, 2).map((p) => {
        const s = getComputedStyle(p);
        return { padding: s.padding, borderRadius: s.borderRadius, fontSize: s.fontSize, h: Math.round(p.getBoundingClientRect().height) };
      }),
      addButton: (() => {
        const b = [...document.querySelectorAll('button')].find((x) => x.innerText.trim() === 'ADD');
        if (!b) return null;
        const s = getComputedStyle(b);
        return { box: r(b), padding: s.padding, fontSize: s.fontSize };
      })(),
      wordsVisible: document.body.innerText.trim().split(/\s+/).length,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  console.log('=== width', width, '===');
  console.log(JSON.stringify(data, null, 2));
  await page.close();
}
await browser.close();
