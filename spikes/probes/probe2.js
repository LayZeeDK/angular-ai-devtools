async page => {
  return await page.evaluate(async () => {
    const o = {};
    const t0 = performance.now();
    const s = await LanguageModel.create({ initialPrompts: [{ role: 'system', content: 'You are terse.' }] });
    o.createMs = Math.round(performance.now() - t0);
    o.inputQuota = s.inputQuota ?? s.contextWindow;
    o.inputUsage = s.inputUsage ?? s.contextUsage;
    o.sessionKeys = Object.keys(Object.getPrototypeOf(s));
    try {
      const r = await s.prompt('Name one Angular lifecycle hook.', {
        responseConstraint: { type: 'object', properties: { hook: { type: 'string' } }, required: ['hook'] },
      });
      o.structured = r; s.destroy();
    } catch (e) { o.structured = 'ERR ' + e.message; }
    try {
      const calls = [];
      const ts = await LanguageModel.create({
        initialPrompts: [{ role: 'system', content: 'You are an Angular DevTools assistant. You cannot see the page; you MUST call tools to answer.' }],
        tools: [{
          name: 'getComponentCount',
          description: 'Returns how many Angular components are on the page.',
          inputSchema: { type: 'object', properties: {} },
          async execute() { calls.push('getComponentCount'); return '42'; },
        }],
      });
      const t1 = performance.now();
      o.toolAnswer = await ts.prompt('How many Angular components are on the page? Use the tool.');
      o.toolMs = Math.round(performance.now() - t1);
      o.toolCalls = calls;
    } catch (e) { o.tool = 'ERR ' + e.message; }
    return o;
  });
}
