const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:4200');
    await page.waitForTimeout(2000);

    console.log('✓ App loaded');

    // Look for the add button
    const addButton = page.locator('button:has-text("+")').first();
    if (await addButton.isVisible()) {
      console.log('✓ Add button found');
      await addButton.click();
      await page.waitForTimeout(1000);

      // Check if a dialog or form appears
      const dialog = page.locator('p-dialog, .p-dialog');
      if (await dialog.isVisible()) {
        console.log('✓ Task creation dialog opened');
        await page.screenshot({ path: '/tmp/task-dialog.png' });
      } else {
        console.log('✗ No dialog appeared after clicking add button');
        await page.screenshot({ path: '/tmp/no-dialog.png' });
      }
    } else {
      console.log('✗ Add button not found');
    }
  } catch (error) {
    console.error('Error during test:', error.message);
    await page.screenshot({ path: '/tmp/error-screenshot.png' });
  } finally {
    await browser.close();
  }
})();
