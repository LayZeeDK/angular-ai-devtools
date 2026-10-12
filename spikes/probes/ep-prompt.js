// One timed Prompt API call on a real page, for backend trials. Run with playwright-cli run-code --filename=<this file>.
async page => {
  await page.goto('https://example.com');

  return await page.evaluate(async () => {
    const t0 = performance.now();
    const availability = await LanguageModel.availability();

    if (availability !== 'available') {
      return { availability };
    }

    try {
      const s = await LanguageModel.create();
      const t1 = performance.now();
      const out = await Promise.race([
        s.prompt('Name three Angular lifecycle hooks.'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout 180 s')), 180000)),
      ]);

      return { availability, createMs: Math.round(t1 - t0), promptMs: Math.round(performance.now() - t1), out: String(out).slice(0, 120) };
    } catch (e) {
      return { availability, error: `${e.name}: ${e.message}` };
    }
  });
}
