// Shared S1 probe. Loaded as a classic script in every context (pages, service worker via importScripts,
// content scripts in both worlds). Never calls LanguageModel.create() unless availability() is 'available',
// so it cannot start a model download. Load-time runs record exposure only; the runner then calls
// s1RunRoundTrip(context) in one context at a time, so model sessions never run in parallel.

const S1_TOOL_OPTIONS = {
  expectedInputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-response' }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-call' }],
};

function s1Err(e) {
  return `${e?.name ?? 'Error'}: ${e?.message ?? String(e)}`;
}

async function s1ToolRoundTrip() {
  const impl = {
    get_component_count: (args) => ({ scope: args.scope, count: 42 }),
    get_component_inputs: (args) => ({ selector: args.selector, inputs: { title: 'Hello', count: 3 } }),
  };
  const out = { calls: [], prompts: 0 };
  const s = await LanguageModel.create({
    initialPrompts: [{ role: 'system', content: 'You are an Angular DevTools assistant. You cannot see the page; call tools to answer.' }],
    ...S1_TOOL_OPTIONS,
    tools: [
      {
        name: 'get_component_count',
        description: 'Returns how many Angular components are on the page.',
        inputSchema: { type: 'object', properties: { scope: { type: 'string', description: 'Use "page".' } }, required: ['scope'] },
      },
      {
        name: 'get_component_inputs',
        description: 'Returns the input values of the Angular component with the given selector.',
        inputSchema: { type: 'object', properties: { selector: { type: 'string' } }, required: ['selector'] },
      },
    ],
  });
  out.contextWindow = s.contextWindow;
  const t = performance.now();
  let input = 'What is the count input of app-counter?';

  try {
    for (let step = 0; step < 4; step++) {
      out.prompts++;
      const res = await s.prompt(input);
      const parts = Array.isArray(res) ? res : [{ type: 'text', value: res }];
      const calls = parts.filter((p) => p.type === 'tool-call').map((p) => p.value);

      if (calls.length === 0) {
        out.answer = parts.map((p) => p.value).join('');
        out.steps = step;
        break;
      }

      const responses = calls.map((c) => {
        const callID = c.callID ?? c.callId;
        out.calls.push({ name: c.name, callID, arguments: c.arguments, isToolCallInstance: typeof LanguageModelToolCall === 'function' && c instanceof LanguageModelToolCall });
        const result = impl[c.name]?.(c.arguments ?? {});

        return {
          type: 'tool-response',
          value: result
            ? new LanguageModelToolSuccess({ callID, name: c.name, result: [{ type: 'object', value: result }] })
            : new LanguageModelToolError({ callID, name: c.name, errorMessage: 'unknown tool' }),
        };
      });
      input = [{ role: 'user', content: responses }];
    }
  } catch (e) {
    out.error = s1Err(e);
  } finally {
    out.ms = Math.round(performance.now() - t);
    out.contextUsage = s.contextUsage;
    s.destroy();
  }

  return out;
}

async function s1Probe(context, { roundTrip = false } = {}) {
  const r = {
    context,
    at: new Date().toISOString(),
    href: typeof location === 'undefined' ? null : location.href,
    isSecureContext: typeof isSecureContext === 'undefined' ? null : isSecureContext,
    typeofLanguageModel: typeof LanguageModel,
    typeofLanguageModelToolCall: typeof LanguageModelToolCall,
    typeofLanguageModelToolSuccess: typeof LanguageModelToolSuccess,
    userAgent: navigator.userAgent,
  };

  try {
    r.permissionsPolicyAllowsLanguageModel = typeof document === 'undefined' ? 'no document (worker)' : (document.featurePolicy?.allowsFeature?.('language-model') ?? null);
  } catch (e) {
    r.permissionsPolicyAllowsLanguageModel = s1Err(e);
  }

  if (typeof LanguageModel === 'undefined') {
    return r;
  }

  try {
    r.availability = await LanguageModel.availability();
  } catch (e) {
    r.availabilityError = s1Err(e);
  }

  try {
    r.availabilityWithToolOptions = await LanguageModel.availability(S1_TOOL_OPTIONS);
  } catch (e) {
    r.availabilityWithToolOptionsError = s1Err(e);
  }

  // A blocked context reports 'unavailable'; record what create() then throws. Runner-triggered only, on
  // instances whose model is on disk, so it cannot start a download.
  if (roundTrip && r.availability === 'unavailable') {
    try {
      const s = await LanguageModel.create();
      r.createWhenUnavailable = `created, contextWindow ${s.contextWindow}`;
      s.destroy();
    } catch (e) {
      r.createWhenUnavailableError = s1Err(e);
    }
  }

  if (roundTrip && r.availability === 'available') {
    try {
      r.roundTrip = await s1ToolRoundTrip();
      r.contextWindow = r.roundTrip.contextWindow;

      if (r.roundTrip.error) {
        r.roundTripError = r.roundTrip.error;
      }
    } catch (e) {
      r.roundTripError = s1Err(e);
    }
  }

  return r;
}

// Writes straight to chrome.storage.local where the context has it; otherwise relays through the service worker.
async function s1Save(context, result) {
  if (globalThis.chrome?.storage?.local) {
    await chrome.storage.local.set({ [context]: result });

    return;
  }

  await chrome.runtime.sendMessage({ s1: context, result });
}

async function s1Run(context) {
  let result;

  try {
    result = await s1Probe(context);
  } catch (e) {
    result = { context, probeError: s1Err(e) };
  }

  await s1Save(context, result);

  return result;
}

// Called by the runner over CDP. Saves like s1Run; the MAIN world has no chrome.runtime, so it posts to the
// isolated world, which relays to the service worker.
async function s1RunRoundTrip(context) {
  let result;

  try {
    result = await s1Probe(context, { roundTrip: true });
  } catch (e) {
    result = { context, probeError: s1Err(e) };
  }

  result.trigger = 'runner';

  if (globalThis.chrome?.runtime?.id) {
    await s1Save(context, result);
  } else {
    window.postMessage({ s1: context, result }, '*');
  }

  return result;
}
