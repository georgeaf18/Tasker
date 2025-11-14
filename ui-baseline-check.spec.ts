import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Pre-commit UI baseline check
 *
 * This test ensures the UI hasn't changed significantly from the baseline.
 * It runs before every commit to catch unintended UI changes.
 *
 * Configuration:
 * - maxDiffPixelRatio: 0.02 (2% of pixels can differ)
 * - threshold: 0.2 (20% per-pixel difference tolerance)
 *
 * The screenshot is saved to .ui-confirmations/ for manual review if needed.
 */
test('UI matches baseline', async ({ page }) => {
  // Check if server is running
  try {
    await page.goto('http://localhost:4200', { timeout: 5000 });
  } catch (error) {
    throw new Error(
      '❌ Frontend server not running at http://localhost:4200\n' +
      'Start it with: npx nx serve frontend\n' +
      'Or skip this check with: git commit --no-verify'
    );
  }

  // Wait for UI to stabilize
  await page.waitForTimeout(2000);

  // Take screenshot and save to confirmations directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const confirmationPath = path.join('.ui-confirmations', `ui-${timestamp}.png`);

  // Ensure directory exists
  if (!fs.existsSync('.ui-confirmations')) {
    fs.mkdirSync('.ui-confirmations', { recursive: true });
  }

  await page.screenshot({ path: confirmationPath, fullPage: true });

  // Compare with baseline
  // Allow 2% of pixels to differ with 20% threshold per pixel
  await expect(page).toHaveScreenshot('baseline-stable-ui.png', {
    maxDiffPixelRatio: 0.02,
    threshold: 0.2,
    fullPage: true
  });

  console.log(`✅ UI matches baseline (screenshot saved to ${confirmationPath})`);
});
