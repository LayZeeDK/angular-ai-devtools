async page => {
  await page.goto('https://example.com');

  return await page.evaluate(async () => {
    const o = { ua: navigator.userAgent, modelContext: typeof navigator.modelContext };

    for (const n of ['LanguageModel', 'Summarizer', 'Writer', 'Rewriter', 'Proofreader', 'Translator', 'LanguageDetector']) {
      try {
        o[n] = typeof self[n] === 'undefined'
          ? 'undefined'
          : await self[n].availability(n === 'Translator' ? { sourceLanguage: 'en', targetLanguage: 'da' } : {});
      } catch (e) {
        o[n] = 'ERR ' + e.message;
      }
    }

    if (o.LanguageModel !== 'available') {
      return o;
    }

    const t0 = performance.now();
    const s = await LanguageModel.create({ initialPrompts: [{ role: 'system', content: 'You are terse.' }] });
    o.createMs = Math.round(performance.now() - t0);
    o.contextWindow = s.contextWindow ?? s.inputQuota;
    o.contextUsage = s.contextUsage ?? s.inputUsage;

    try {
      o.structured = await s.prompt('Name one Angular lifecycle hook.', {
        responseConstraint: { type: 'object', properties: { hook: { type: 'string' } }, required: ['hook'] },
      });
    } catch (e) {
      o.structured = 'ERR ' + e.message;
    }

    s.destroy();
    const calls = [];

    try {
      const ts = await LanguageModel.create({
        initialPrompts: [{ role: 'system', content: 'You are an Angular DevTools assistant. You cannot see the page; call tools to answer.' }],
        expectedOutputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-call' }],
        tools: [
          {
            name: 'getComponentCount',
            description: 'Returns how many Angular components are on the page.',
            inputSchema: { type: 'object', properties: {} },
            async execute() { calls.push('getComponentCount'); return '42'; },
          },
          {
            name: 'getComponentInputs',
            description: 'Returns the input values of the Angular component with the given selector.',
            inputSchema: { type: 'object', properties: { selector: { type: 'string' } }, required: ['selector'] },
            async execute(args) { calls.push('getComponentInputs ' + JSON.stringify(args)); return JSON.stringify({ title: 'Hello', count: 3 }); },
          },
        ],
      });
      const t1 = performance.now();
      o.toolAnswer1 = await ts.prompt('How many Angular components are on the page?');
      o.toolAnswer2 = await ts.prompt('What is the count input of app-counter?');
      o.toolMs = Math.round(performance.now() - t1);
      o.toolUsage = ts.contextUsage;
      ts.destroy();
    } catch (e) {
      o.toolErr = e.name + ': ' + e.message;
    }

    o.toolCalls = calls;

    return o;
  });
}
