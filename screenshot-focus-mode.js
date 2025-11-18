const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:4200');
  await page.waitForTimeout(2000);

  // Click the Focus Mode button
  const focusModeButton = page.locator('text=Focus Mode');
  if (await focusModeButton.count() > 0) {
    await focusModeButton.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'focus-mode-final.png', fullPage: true });

  await browser.close();
})();
