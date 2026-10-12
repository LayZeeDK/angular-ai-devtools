// Separates the two suspected causes of Gemma 4 tool-prompt failures: the tool name's style and an empty parameter schema.
// One fresh session per variant, 70 s apart so Chrome's crash backoff (three crashes, then one minute) cannot skew a later variant.
async page => {
  await page.goto('https://example.com');
  page.setDefaultTimeout(0);

  return await page.evaluate(async () => {
    const withParam = { type: 'object', properties: { scope: { type: 'string', enum: ['page'] } }, required: ['scope'] };
    const noParam = { type: 'object', properties: {} };
    const variants = [
      { label: 'snake_case + param (control)', name: 'get_component_count', schema: withParam },
      { label: 'snake_case + empty properties', name: 'get_component_count', schema: noParam },
      { label: 'camelCase + param', name: 'getComponentCount', schema: withParam },
      { label: 'lowercase, no separator + param', name: 'getcomponentcount', schema: withParam },
      { label: 'snake_case with capital + param', name: 'Get_component_count', schema: withParam },
    ];
    const out = [];

    for (const [i, v] of variants.entries()) {
      if (i > 0) {
        await new Promise((r) => setTimeout(r, 70000));
      }

      const row = { label: v.label, name: v.name };

      try {
        const s = await LanguageModel.create({
          expectedInputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-response' }],
          expectedOutputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-call' }],
          tools: [{ name: v.name, description: 'Returns how many Angular components are on the page.', inputSchema: v.schema }],
        });
        const r = await Promise.race([s.prompt('How many Angular components are on the page? Use the tool.'), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout 120 s')), 120000))]);
        const parts = Array.isArray(r) ? r : [{ type: 'text', value: r }];
        row.result = parts.map((p) => (p.type === 'tool-call' ? `tool-call ${p.value.name}(${JSON.stringify(p.value.arguments)})` : `text: ${String(p.value).slice(0, 60)}`)).join(' | ');
        s.destroy();
      } catch (e) {
        row.result = `ERR ${e.name}: ${e.message}`;
      }

      out.push(row);
    }

    return out;
  });
}
