import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`[BROWSER ${type.toUpperCase()}]`, msg.text());
    }
  });

  // Capture page errors
  page.on('pageerror', err => {
    console.log('[PAGE ERROR]', err.message);
  });

  await page.goto('http://localhost:4200');
  await page.waitForTimeout(3000);

  // Get the HTML to see what's actually rendered
  const html = await page.content();
  console.log('\n[HTML SNAPSHOT - checking for components]');
  const hasBacklog = html.includes('app-backlog-sidebar');
  const hasKanban = html.includes('app-kanban-board');
  console.log('Has <app-backlog-sidebar>:', hasBacklog);
  console.log('Has <app-kanban-board>:', hasKanban);

  // Take screenshot
  await page.screenshot({ path: '/tmp/tasker-ui-fixed.png', fullPage: true });
  console.log('\n[Screenshot saved to /tmp/tasker-ui-fixed.png]');

  await browser.close();
})();
