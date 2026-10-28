const { chromium } = require('playwright-core');
const fs = require('fs');
const OUT = '/home/user/shots';
fs.mkdirSync(OUT, { recursive: true });
const VPS = [
  { name: 'desktop', width: 1440, height: 950 },
  { name: 'tablet',  width: 834,  height: 1100 },
  { name: 'mobile',  width: 390,  height: 844 }
];
(async () => {
  const browser = await chromium.launch();
  const problems = [];
  for (const vp of VPS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    const info = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src'))
    }));
    console.log(`[${vp.name}] ${info.sw}/${info.cw} ${info.sw > info.cw ? 'OVERFLOW' : 'ok'} brokenImgs=${info.broken.length ? info.broken.join(',') : 0}`);
    if (info.sw > info.cw) problems.push(vp.name + ' overflow');
    if (info.broken.length) problems.push(vp.name + ' broken: ' + info.broken.join(','));
    if (errs.length) problems.push(vp.name + ' js: ' + errs.join('|'));

    // reveal everything, then shoot sections
    await page.evaluate(async () => {
      const H = document.body.scrollHeight;
      for (let y = 0; y <= H; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/v2-${vp.name}-hero.png` });
    for (const [sel, tag] of [['#products','products'], ['#applications','apps'], ['#about','about'], ['#contact','contact']]) {
      await page.evaluate(s => document.querySelector(s).scrollIntoView(), sel);
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${OUT}/v2-${vp.name}-${tag}.png` });
    }
    await ctx.close();
  }
  await browser.close();
  console.log('PROBLEMS:', problems.length ? problems.join(' || ') : 'none');
})();
