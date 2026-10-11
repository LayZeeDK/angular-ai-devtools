async page => {
  await page.goto('https://example.com');

  return await page.evaluate(async () => {
    const o = {};
    const step = async (name, fn) => {
      const t = performance.now();

      try {
        o[name] = await fn();
      } catch (e) {
        o[name] = 'ERR ' + e.name + ': ' + e.message;
      }

      o[name + 'Ms'] = Math.round(performance.now() - t);
    };
    const toolOpts = {
      expectedInputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-response' }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-call' }],
      tools: [
        { name: 'getComponentCount', description: 'Returns how many Angular components are on the page.', inputSchema: { type: 'object', properties: {} } },
      ],
    };
    let s;
    await step('create', async () => { s = await LanguageModel.create(); return { contextWindow: s.contextWindow, contextUsage: s.contextUsage }; });
    await step('plain', () => s.prompt('Say hi in three words.'));
    await step('structured', () => s.prompt('Name one Angular lifecycle hook.', { responseConstraint: { type: 'object', properties: { hook: { type: 'string' } }, required: ['hook'] } }));
    let t;
    await step('toolCreate', async () => { t = await LanguageModel.create(toolOpts); return t.contextUsage; });
    await step('toolPrompt', async () => {
      const out = await t.prompt('How many Angular components are on the page? Use the tool.');

      return Array.isArray(out) ? out.map((p) => (p.type === 'tool-call' ? { type: p.type, name: p.value.name, callID: p.value.callID, args: p.value.arguments } : p)) : out;
    });
    let u;
    await step('toolCreateSys', async () => { u = await LanguageModel.create({ ...toolOpts, initialPrompts: [{ role: 'system', content: 'Call tools to answer.' }] }); return u.contextUsage; });
    await step('toolPromptSys', async () => {
      const out = await u.prompt('How many Angular components are on the page?');

      return Array.isArray(out) ? out.map((p) => (p.type === 'tool-call' ? { type: p.type, name: p.value.name, callID: p.value.callID, args: p.value.arguments } : p)) : out;
    });

    return o;
  });
}
