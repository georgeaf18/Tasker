const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type()}]:`, msg.text());
  });

  // Navigate to app
  await page.goto('http://localhost:4200');
  await page.waitForTimeout(2000);

  console.log('\n=== Initial page load ===');

  // Check initial data-theme attribute
  const initialTheme = await page.evaluate(() => {
    return document.documentElement.getAttribute('data-theme');
  });
  console.log('Initial data-theme attribute:', initialTheme);

  // Open settings
  console.log('\n=== Opening Settings ===');
  const settingsButton = page.locator('button[aria-label="Settings"], i.pi-cog').first();
  await settingsButton.click();
  await page.waitForTimeout(1000);

  // Click on Appearance tab
  console.log('\n=== Clicking Appearance tab ===');
  const appearanceTab = page.locator('text=Appearance');
  await appearanceTab.click();
  await page.waitForTimeout(1000);

  // Check if theme toggle is visible
  const themeToggle = page.locator('app-theme-toggle');
  const isVisible = await themeToggle.isVisible();
  console.log('Theme toggle visible:', isVisible);

  if (isVisible) {
    // Take screenshot to see structure
    await page.screenshot({ path: 'theme-toggle-debug.png' });
    console.log('Screenshot saved: theme-toggle-debug.png');

    // Click Dark theme option (simpler selector)
    console.log('\n=== Clicking Dark theme option ===');
    const darkOption = page.getByText('Dark', { exact: true }).last();
    await darkOption.click();
    await page.waitForTimeout(2000);

    // Check data-theme attribute after clicking
    const afterTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
    console.log('data-theme after clicking Dark:', afterTheme);

    // Check localStorage
    const localStorage = await page.evaluate(() => {
      return window.localStorage.getItem('tasker-theme');
    });
    console.log('localStorage tasker-theme:', localStorage);

    // Check computed styles
    const bgColor = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return styles.getPropertyValue('--background-primary');
    });
    console.log('CSS Variable --background-primary:', bgColor);
  }

  console.log('\n=== Debug complete - browser will close in 5 seconds ===');
  await page.waitForTimeout(5000);

  await browser.close();
})();
