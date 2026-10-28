const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 950 } });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:8099/index.html', { waitUntil: 'load' });
  await p.evaluate(() => document.querySelector('#applications').scrollIntoView());
  await p.waitForTimeout(1600);
  await p.screenshot({ path: '/home/user/shots/v2-desktop-apps-settled.png' });
  await p.evaluate(() => document.querySelector('#about').scrollIntoView());
  await p.waitForTimeout(1600);
  await p.screenshot({ path: '/home/user/shots/v2-desktop-about-settled.png' });
  await b.close();
})();
