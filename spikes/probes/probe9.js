async page => {
  await page.goto('https://example.com');

  return await page.evaluate(async () => {
    const o = {};
    const tool = { name: 'get_component_count', description: 'Returns how many Angular components are on the page.', inputSchema: { type: 'object', properties: { scope: { type: 'string', description: 'Use "page".' } }, required: ['scope'] } };
    const show = (out) => (Array.isArray(out) ? out.map((p) => (p.type === 'tool-call' ? { name: p.value.name, callID: p.value.callID, args: p.value.arguments } : p)) : out);
    const variants = {
      outputsOnly: { expectedOutputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-call' }], tools: [tool] },
      noLanguages: { expectedInputs: [{ type: 'text' }, { type: 'tool-response' }], expectedOutputs: [{ type: 'text' }, { type: 'tool-call' }], tools: [tool] },
      toolCallOnly: { expectedInputs: [{ type: 'text' }, { type: 'tool-response' }], expectedOutputs: [{ type: 'tool-call' }], tools: [tool] },
    };

    for (const [k, opts] of Object.entries(variants)) {
      try {
        const s = await LanguageModel.create(opts);

        try {
          o[k] = show(await s.prompt('How many Angular components are on the page?'));
        } catch (e) {
          o[k] = 'PROMPT ' + e.name + ': ' + e.message;
        }

        try {
          const chunks = [];
          for await (const c of s.clone ? (await s.clone()).promptStreaming('How many Angular components are on the page?') : []) {
            chunks.push(typeof c === 'string' ? c : JSON.stringify(c));
          }
          o[k + 'Stream'] = chunks.join('').slice(0, 300);
        } catch (e) {
          o[k + 'Stream'] = 'STREAM ' + e.name + ': ' + e.message;
        }
      } catch (e) {
        o[k] = 'CREATE ' + e.name + ': ' + e.message;
      }
    }

    return o;
  });
}
