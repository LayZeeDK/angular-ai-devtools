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
        const opts = {
          monitor(m) { m.addEventListener('downloadprogress', (e) => window.__dl.progress.push(Math.round(e.loaded * 100))); },
        };
        const s = await LanguageModel.create(opts);
        window.__dl.state = 'ready ' + s.contextWindow;
        await Summarizer.create(opts).catch((e) => { window.__dl.sum = e.message; });
      } catch (e) {
        window.__dl.state = 'ERR ' + e.message;
      }
    };
    document.body.append(b);
  });
  await page.click('#dl');
  await page.waitForTimeout(15000);

  return await page.evaluate(() => ({ ...window.__dl, progress: window.__dl.progress.slice(-3), avail: undefined }));
}
