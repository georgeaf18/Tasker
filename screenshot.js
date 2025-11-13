const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4200');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/tasker-current.png', fullPage: true });
  await browser.close();
})();
