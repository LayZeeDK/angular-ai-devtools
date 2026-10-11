// Prints the Broker State tab of chrome:// or edge:// on-device-internals as text, walking shadow roots.
// Run with playwright-cli run-code --filename=<this file>; the page must be on on-device-internals or reachable at it.
async page => {
  const scheme = (await page.evaluate(() => navigator.userAgent)).includes('Edg/') ? 'edge' : 'chrome';
  await page.goto(scheme + '://on-device-internals');
  await page.locator('[role=tab]').nth(2).click({ force: true });
  let text = '';

  for (let i = 0; i < 30; i++) {
    text = await page.evaluate(() => {
      const parts = [];
      const walk = (n) => {
        if (n.nodeType === 3) {
          const t = n.textContent.trim();

          if (t) {
            parts.push(t);
          }

          return;
        }

        if (n.nodeType !== 1 && n.nodeType !== 11) {
          return;
        }

        if (n.nodeType === 1 && (n.tagName === 'STYLE' || n.tagName === 'SCRIPT')) {
          return;
        }

        if (n.shadowRoot) {
          walk(n.shadowRoot);
        }

        n.childNodes.forEach(walk);
      };
      walk(document.body);

      return parts.join(' | ');
    });

    if (text.includes('Manifest Path')) {
      break;
    }

    await page.waitForTimeout(1000);
  }

  return text;
}
