async page => {
  await page.goto('https://example.com');

  return await page.evaluate(async () => {
    const o = { log: [] };
    const impl = {
      get_component_count: () => ({ count: 42 }),
      get_component_inputs: (args) => ({ selector: args.selector, inputs: { title: 'Hello', count: 3 } }),
    };
    const s = await LanguageModel.create({
      initialPrompts: [{ role: 'system', content: 'You are an Angular DevTools assistant. You cannot see the page; call tools to answer.' }],
      expectedInputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-response' }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-call' }],
      tools: [
        { name: 'get_component_count', description: 'Returns how many Angular components are on the page.', inputSchema: { type: 'object', properties: { scope: { type: 'string', description: 'Use "page".' } }, required: ['scope'] } },
        { name: 'get_component_inputs', description: 'Returns the input values of the Angular component with the given selector.', inputSchema: { type: 'object', properties: { selector: { type: 'string' } }, required: ['selector'] } },
      ],
    });

    async function ask(question) {
      const t = performance.now();
      let input = question;

      for (let step = 0; step < 4; step++) {
        const out = await s.prompt(input);
        const parts = Array.isArray(out) ? out : [{ type: 'text', value: out }];
        const calls = parts.filter((p) => p.type === 'tool-call').map((p) => p.value);

        if (calls.length === 0) {
          return { answer: parts.map((p) => p.value).join(''), steps: step, ms: Math.round(performance.now() - t) };
        }

        const responses = calls.map((c) => {
          o.log.push({ name: c.name, callID: c.callID ?? c.callId, arguments: c.arguments });
          const result = impl[c.name]?.(c.arguments ?? {});

          return {
            type: 'tool-response',
            value: result
              ? new LanguageModelToolSuccess({ callID: c.callID ?? c.callId, name: c.name, result: [{ type: 'object', value: result }] })
              : new LanguageModelToolError({ callID: c.callID ?? c.callId, name: c.name, errorMessage: 'unknown tool' }),
          };
        });
        input = [{ role: 'user', content: responses }];
      }

      return { answer: 'step limit' };
    }

    try {
      o.q1 = await ask('How many Angular components are on the page?');
      o.q2 = await ask('What is the count input of app-counter?');
    } catch (e) {
      o.err = e.name + ': ' + e.message;
    }

    o.contextUsage = s.contextUsage;

    return o;
  });
}
