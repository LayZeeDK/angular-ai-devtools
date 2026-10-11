// Starts a built-in model download with a trusted keyboard gesture (Enter on a focused button), for browsers where pointer clicks time out.
async page => {
  await page.goto('https://example.com');
  await page.evaluate(() => {
    window.__dl = { progress: [], state: 'idle' };
    const b = document.createElement('button');
    b.id = 'dl';
    b.textContent = 'download';
    b.onclick = async () => {
      window.__dl.state = 'creating';

      try {
        const s = await LanguageModel.create({
          monitor(m) { m.addEventListener('downloadprogress', (e) => window.__dl.progress.push(Math.round(e.loaded * 100))); },
        });
        window.__dl.state = 'ready ' + s.contextWindow;
      } catch (e) {
        window.__dl.state = 'ERR ' + e.message;
      }
    };
    document.body.append(b);
    b.focus();
  });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(20000);

  return await page.evaluate(async () => ({ ...window.__dl, progress: window.__dl.progress.slice(-3), availability: await LanguageModel.availability() }));
}
