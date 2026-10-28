const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch();
  for (const w of [390, 834, 900, 1100, 1150, 1200, 1280, 1440]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      burger: getComputedStyle(document.querySelector('#navToggle')).display !== 'none',
      broken: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)
    }));
    console.log(`${w}px -> ${r.sw}/${r.cw} ${r.sw > r.cw ? 'OVERFLOW' : 'ok'} | burger=${r.burger} | brokenImgs=${r.broken.length ? r.broken.join(',') : 0}`);
    await ctx.close();
  }
  await browser.close();
})();
