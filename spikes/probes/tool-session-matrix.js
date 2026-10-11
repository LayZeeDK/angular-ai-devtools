// Isolates which create() option makes Chrome refuse a Prompt API session ("unable to create a session").
// Run with playwright-cli run-code --filename=<this file> in a tab of the browser under test.
async page => {
  await page.goto('https://example.com');

  return await page.evaluate(async () => {
    const tool = { name: 'get_count', description: 'Returns a number.', inputSchema: { type: 'object', properties: { scope: { type: 'string', enum: ['page'] } }, required: ['scope'] } };
    const toolTypesIn = [{ type: 'text', languages: ['en'] }, { type: 'tool-response' }];
    const toolTypesOut = [{ type: 'text', languages: ['en'] }, { type: 'tool-call' }];
    const cases = {
      plain: {},
      textEn: { expectedInputs: [{ type: 'text', languages: ['en'] }], expectedOutputs: [{ type: 'text', languages: ['en'] }] },
      toolTypesOnly: { expectedInputs: toolTypesIn, expectedOutputs: toolTypesOut },
      toolCallOutOnly: { expectedOutputs: toolTypesOut },
      toolResponseInOnly: { expectedInputs: toolTypesIn },
      toolsOnly: { tools: [tool] },
      toolsAndTypes: { expectedInputs: toolTypesIn, expectedOutputs: toolTypesOut, tools: [tool] },
      toolsAndTypesNoLang: { expectedInputs: [{ type: 'text' }, { type: 'tool-response' }], expectedOutputs: [{ type: 'text' }, { type: 'tool-call' }], tools: [tool] },
      toolsAndTypesSystem: { expectedInputs: toolTypesIn, expectedOutputs: toolTypesOut, tools: [tool], initialPrompts: [{ role: 'system', content: 'Call tools.' }] },
    };
    const out = { ua: navigator.userAgent.match(/Chrome\/[\d.]+|Edg\/[\d.]+/g)?.join(' '), constructors: { LanguageModelToolCall: typeof LanguageModelToolCall, LanguageModelToolSuccess: typeof LanguageModelToolSuccess }, cases: {} };

    for (const [name, opts] of Object.entries(cases)) {
      const row = {};

      try {
        row.availability = await LanguageModel.availability(opts);
      } catch (e) {
        row.availability = `ERR ${e.name}: ${e.message}`;
      }

      try {
        const s = await LanguageModel.create(opts);
        row.create = 'ok';

        if (opts.tools) {
          try {
            const r = await s.prompt('Call get_count with scope page.');
            row.prompt = Array.isArray(r) ? r.map((p) => p.type).join(',') : 'text';
          } catch (e) {
            row.prompt = `ERR ${e.name}: ${e.message.slice(0, 120)}`;
          }
        }

        s.destroy();
      } catch (e) {
        row.create = `ERR ${e.name}: ${e.message.slice(0, 120)}`;
      }

      out.cases[name] = row;
    }

    return out;
  });
}
