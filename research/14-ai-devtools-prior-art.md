# 14 - Prior art in AI-assisted devtools (cloud AI, MCP, WebMCP) and what can move to built-in AI

Status: complete (2026-10-12). Author: Claude, for Lars. Who read what: Claude itself read Angular's `webmcp` source and the Signal Forms registration (1.2, 3.1), the Storybook addon and toolset source (1.1), the Angular CLI tool files (1.4), Playwright's `webmcp.ts` strings (1.18) and the Claude in Chrome tool definitions (1.3). Three research subagents read the vendor pages behind 1.5 to 1.19 and section 3, and the raw repository and spec files named there (the WebMCP `index.bs` and explainers, the Google sample extension and demo files, `nuxt-mcp`, `vite-plugin-mcp`, the Vite DevTools config, the Svelte handler index); a [measured] label on those files means the subagent read the raw file and the file is named, not that Claude re-read it. Every judgement is Claude's. Pages that failed are listed in section 6.

Why: Lars, on the proposals' line "No shipped framework devtools panel uses an on-device model": "We should still consider prior art DevTools that rely on cloud-based AI, MCP, WebMCP, or anything like that and consider whether we could adopt these features to browser built-in AI APIs." And: "Correction: We do consider WebMCP support in our Angular AI DevTools, don't we?" (section 3 answers the second).

What this file adds over `03-prior-art.md`: 03 covers Pangular Inspector, React DevTools, Chrome DevTools AI assistance (features and data list), chrome-devtools-mcp, Vue DevTools, Nuxt DevTools, React Scan, Redux DevTools, Svelte, Solid, Million Lint, the Angular CLI MCP server, agent-react-devtools, React Grab, Stagewise and Cursor. `01-built-in-ai-apis.md` section 6 covers the DevTools frontend's AI agent source (AiAgent2, skills, typed tools, `BuiltInAi.ts`). This file reads the tools 03 did not, re-reads a few where the AI feature set moved, and judges every AI feature against the proposals' limits.

Labels: **[measured]** = run, or read in a primary source file (repository source, a spec's IDL, a local clone, a tool definition loaded in this session), by Claude or by a research subagent that fetched the raw file; the status line says which; **[documented]** = vendor docs, release notes, a README or a blog post read in this run (by Claude or by a research subagent); **[inferred]** = Claude's reading, not stated in a source. Every tool entry cites a URL or a file.

The proposals' limits that each judgement is made against (`docs/feature-proposals.md`):
- the model is on-device, with a 7,168 (Aion) to 9,216 (Gemma 4, Nano, Phi-4-mini) token context window (2.1); tools return short summaries by id (3.4); at most about 6 tool steps per question on a 7K window (3.3);
- measured tool calling: native tools on Aion only; the structured-output loop on Gemma 4, Nano (GPU) and Phi-4-mini; Nano on CPU unsupported (2.1, 3.3);
- the extension is only a browser extension: no server, no dev-server plugin, no npm package in the app (section 8);
- it generates no code of any kind (section 8); findings name the modern Angular pattern and why, and may name an official schematic;
- writes from chat go behind a per-action confirm, with a read-only switch (3.5);
- supported apps: zoneless, standalone Angular 22.2 dev builds (section 1);
- image input is a documented Prompt API feature not yet run (N8); the Proofreader API is not defined in the measured builds (N11).

Judgement scale per feature: **Fits as is** / **Fits if reduced** (with what to cut) / **Does not fit** (with why) / **Already covered** (N feature).

## 1. Tools and their AI features

### 1.0 Features that 03 already describes, judged here

03 describes these features but does not judge them against the proposals. Sources are the ones 03 and 01 cite; nothing here was re-read unless a later section says so. The judgement column uses the scale above.

| Tool (03 section) | AI feature | Data to the model | Model or service | Judgement |
|---|---|---|---|---|
| Chrome DevTools AI assistance (03 3.1, 01 section 6) | Styling agent: explains an element's styles and layout | DOM structure and contents, CSS **[documented, data-usage page via 03]** | cloud Gemini | **Already covered (N8)** for the picked-element case; the text-only form (host computed style subset, no screenshot) is N8 without the image and needs no new feature **[inferred]** |
| | Network agent: explains a request | URL, a header subset, timing, initiator chain **[documented via 03]** | cloud Gemini | **Fits if reduced**: the page can read `PerformanceResourceTiming` (URL, timing, size, status for same-origin or `Timing-Allow-Origin` responses) but not headers or bodies without patching `fetch`/XHR; cut headers and bodies, keep timing and the `httpResource` state nodes; extends N14 **[inferred]** |
| | Sources agent: explains a file | file name, URL, content, source-map URLs **[documented via 03]** | cloud Gemini | **Does not fit** as a whole-file read: a component file does not fit a 7-9K window next to tools and history; the snippet form (one function's source from `debuggableFn`) is what N2 and N24 already do **[inferred]** |
| | Performance agent, "Generate label", "Ask AI" on a call frame | selected call frame, more of the trace on request **[documented via 03]** | cloud Gemini | **Already covered (N21)**, which needs the `debugger` permission for the trace |
| | Console Insights (full) | log level, stack, related request headers, code around the stack **[documented via 03]** | cloud Gemini | **Already covered (N4)** |
| | Console Insights teasers (on-device) | same, capped at 200 characters **[measured, 01 section 6 `BuiltInAi.ts`]** | Prompt API, `clone()` per answer | **Already covered (N4)**; the clone-per-question pattern is in 2.1 |
| | Autonomous actions: Lighthouse accessibility audit, performance trace, suspect requests (Chrome 149+) | audit results, trace **[documented via 03]** | cloud Gemini | **Does not fit** for Lighthouse (runs in the DevTools frontend; an extension cannot start it); the accessibility part is reduced to N10's DOM-computed a11y rule (2.2); the trace part is N21 **[inferred]** |
| | Side-effect gating (Continue/Cancel before a side effect) | n/a | n/a | **Already covered (3.5)** |
| | "Apply to workspace" (CSS edits written to source with a diff) | n/a | cloud Gemini | **Does not fit**: writes source, which is code generation (section 8 ruling) |
| | "Copy to coding agent" | n/a | n/a | **Already covered (N13)** |
| | AI commit messages (Changes panel) | the diff | cloud Gemini | **Does not fit**: the extension has no workspace or diff, and the text would describe generated code |
| | Context follows the current selection | the selected node, request, file | n/a | **Already covered (3.1 context chip, 3.3 step 2)** |
| | Accessibility agent (01 section 6, AiAgent2 tool `GetElementAccessibilityDetails`) | a11y details of a node | cloud Gemini | **Fits if reduced** to DOM-computed roles and names (2.2), which is N10's a11y rule and N23; the full tree needs the `debugger` permission **[inferred]** |
| | Storage agent (01 section 6, AiAgent2 tools `ListCookies`, `GetStorageValues`) | cookies and storage values | cloud Gemini | **Does not fit** the scope: not Angular state; `ɵgetTransferState` in section 5 covers the Angular part **[inferred]** |
| | Origin-locked conversations (01 section 6) | n/a | n/a | **Fits as is** as a rule: a new conversation per origin; the proposals' 3.3 has no origin rule yet. Candidate C1 in section 4 **[inferred]** |
| chrome-devtools-mcp (03 3.3) | Input automation (click, fill, fill_form, hover, press_key, type_text, upload_file) | n/a | the MCP client's model | **Does not fit**: writes through CDP on the user's behalf; the extension's writes are the confirmed `set_writable_field`, navigate, dispatch and form fill (3.5), not free input automation **[inferred]** |
| | `take_snapshot` (accessibility tree with uids) | the a11y tree | the client's model | **Fits if reduced**: the full tree needs CDP (`debugger`); the DOM-computed subset is N10 and N23; the uid idea is 3.4's id rule **[inferred]** |
| | `take_screenshot`, screencast | pixels | the client's model | **Already covered (N8)** for one component's box; a full-page screenshot does not fit the window as a text input and is not a text input at all; whether an image prompt fits the context is spike S5 |
| | console messages, source-mapped stacks | console entries | the client's model | **Already covered (N4)** |
| | network list and request details | requests, headers, bodies | the client's model | **Fits if reduced** as in the Network agent row above |
| | performance trace and insights | a trace | the client's model | **Already covered (N21)** |
| | `lighthouse_audit` | audit JSON | the client's model | **Does not fit** (no Lighthouse in an extension) |
| | memory heap snapshot analysis | heap snapshot | the client's model | **Does not fit**: needs CDP `HeapProfiler`; the page can read only `performance.measureUserAgentSpecificMemory()` as one number **[inferred]** |
| | third-party developer tools (`list_3p_developer_tools`, `execute_3p_developer_tool`) | tool output | the client's model | **Already covered (3.2)**: the extension consumes and publishes `devtoolstooldiscovery` tools |
| | WebMCP (`list_webmcp_tools`, `execute_webmcp_tool`) | tool output | the client's model | **Already covered (3.2, N9)** as a consumer; section 3 judges publishing |
| | `--slim` subset; design principles (token-optimized summaries, small deterministic tools, errors that suggest a fix, references for heavy payloads) | n/a | n/a | **Already covered (3.3 step 1, 3.4, 3.6)** |
| Angular CLI MCP server (03 section 5, 02 section 4.6) | `ai_tutor`, `onpush_zoneless_migration`, `list_projects`, `devserver.*`, `run_target`: tools that read or change source or run the CLI | project files | the client's model | **Does not fit**: a server and code changes (section 8) |
| | `get_best_practices` (rule text) and `search_documentation` (angular.dev search) | docs | the client's model | **Already covered (N10's rules table from `angular/skills`; N4's bundled error digest as the offline form of the search)** **[inferred]** |
| agent-react-devtools (03 section 5) | tree, component, find, count, errors, profile start/stop, slow and rerenders report, profile export | React DevTools backend data | the client's model | **Already covered (3.4 tools `find_components`, `inspect_component`, `cd_record`; N1, N4)** |
| | `wait` (block until the tree settles) and profile diff (two recordings compared) | the same | the client's model | **Fits as is** as two tools: a `wait_for {condition}` tool and a diff of two `cd_record` summaries; candidate C2 in section 4 **[inferred]** |
| React Grab, Stagewise (03 section 5) | copy an element plus component stack with `file:line` to an agent | element, stack, computed CSS, bounding box, selector, URL | the IDE's model | **Already covered (N13, 3.1 context chip)** |
| Cursor browser (03 section 5) | Browser Controls over CDP; select-element style editor | page via CDP | cloud | **Does not fit** (an IDE driving the browser; writes); reads are covered by 3.4 |
| Nuxt DevTools MCP Inspector (03 4.2) | a tab that inspects the app's own MCP tools | the app's tool list | n/a | **Already covered (N9)** |
| Pangular MCP tools (03 1.5) | about 60 read and action tools for an external agent | runtime state by RPC | the client's model | **Already covered (3.4 is designed after them)**; the action tools are the confirmed writes of 3.5 |

### 1.1 Storybook MCP addon (`@storybook/addon-mcp`)

Source: local clone `D:\projects\github\storybookjs\storybook` at `dc9b30e8fd8` (2026-10-02, branch `next`), `code/addons/mcp/src/*` and `code/core/src/shared/open-service/toolsets/*` **[measured]**. README: `code/addons/mcp/README.md`; docs at https://storybook.js.org/docs/next/ai/mcp/overview (not read). The proposals' 6.2 names the addon by its `/mcp` endpoint only.

How it works **[measured, `mcp-handler.ts`, `tool-registry.ts`]**: a Vite middleware on the Storybook dev server serves an MCP server (`tmcp`, HTTP transport) at `/mcp`. Tools are grouped in three toolsets, `dev`, `docs` and `test`, switchable per request with an `X-MCP-Toolsets` header. The server's `instructions` text is built per availability (`buildServerInstructions`: dev, test, docs, change detection, module graph, review). There is no model in the addon; the MCP client's model does the work. A `storybook ai` CLI (Claude Code and Codex plugins) talks to the same server with a proxy header that turns the review tool on by default.

| AI feature (tool) | Data to the model | Model or service | Judgement |
|---|---|---|---|
| `stories.preview` ("Get story preview URLs"): returns preview URLs for story ids; its description tells the agent to open the URL in the IDE's browser pane after any visual change **[measured, `stories/definition.ts:275-289`]** | story ids, titles, URLs | the client's model | **Fits as is**: the extension already runs in the browser, and the story index at `/index.json` is Tier 0 (6.2); "open the story for this component" is one confirmed navigation (3.5). Extends 6.2 (candidate C4 in section 4) **[inferred]** |
| `stories.changed` ("Get changed stories metadata"): stories affected by the files changed in git, through the dev server's module graph **[measured, `:307-313`]** | changed file list, story ids | the client's model | **Does not fit**: needs git and the server's module graph |
| `stories.findByComponent` ("Get stories for component files"): component file paths to story ids, with a max import distance **[measured, `:397-403`]** | file paths, story ids | the client's model | **Already covered (6.2 story gap finder)**; the extension can match `ɵcmp.debugInfo.filePath` against the index's `importPath` without the server **[inferred]** |
| `review.create` ("Create Storybook review"): the agent publishes a curated set of stories as a review page in the running Storybook; the description orders the agent to take story ids only from the other tools, never from memory **[measured, `review/definition.ts:80-92,142`]** | story ids, changed files, the agent's notes | the client's model | **Does not fit**: writes into the Storybook server; the extension has no server and the reviewer is the developer, not an agent |
| `test.run`: runs story tests (Vitest addon), with accessibility results when the a11y addon is on **[measured, `tool-registry.ts:239-243`; the a11y part from `availability.a11yEnabled`]** | test results | the client's model | **Does not fit**: runs on the server. The in-browser half, explaining a failed test page, is 6.3 |
| `docs.list`, `docs.show`, `docs.showStory`: component documentation from a docgen manifest, per source in a composition **[measured, `docs/definition.ts:359-419`]** | docgen manifests (props, types) | the client's model | **Does not fit** at 7-9K tokens: a manifest page is the size of a component's API; `inspect_component` (3.4) already gives the live inputs and outputs. Whether the manifest is readable over HTTP from the page was not checked **[inferred]** |
| `get-storybook-story-instructions`: instructions for writing stories, tailored to the installed addons **[measured, `tool-names.ts:15`, `tool-registry.ts:184-211`]** | none (static text) | the client's model | **Does not fit**: its purpose is story generation, which the ruling in section 8 rules out |
| Server `instructions` built from what is installed; tools hidden per toolset **[measured, `mcp-handler.ts:47-59`, `getToolsets`]** | n/a | n/a | **Already covered (N18, 3.3 step 1)**: the feature fingerprint picks tool groups per app |
| Tool errors that "speak to the agent and name their own recovery" (`agentFacing` errors) **[measured, `toolset-tools.ts:83-85,149-158`]** | n/a | n/a | **Already covered (3.6 error template)** |

### 1.2 Angular's WebMCP APIs, read in source (facts for section 3)

Source: local clone `D:\projects\github\angular\angular` at `5db6fc4453` (2026-09-25, branch `22.2.x`) **[measured]**. 02 section 4.3 covers the docs; these are the source facts the 7-9K judgement in section 3 needs.

- `Annotations` (experimental since 22.2): `readOnlyHint`, `untrustedContentHint`, `consequentialHint`, all optional booleans; the comment on `readOnlyHint` says agents "may be more likely to use tools which are explicitly declared read-only" (`packages/core/src/webmcp/types.ts:64-84`). `ToolDescriptor` is `{name, description, inputSchema, execute, annotations?}` (`:91-109`). Angular's `ModelContext` interface has `registerTool` only (`:112-123`).
- `declareExperimentalWebMcpTool` returns at once under SSR, reads `document.modelContext ?? navigator.modelContext`, and does nothing unless `registerTool` is a function (a DOM-clobbering guard, `declare_tool.ts:36-46`). It wraps `execute` to run in the injector's injection context with an `AbortSignal` that fires on injector destroy, and passes `{signal}` to `registerTool` (`:57-82`). So an extension shim that defines `registerTool` receives every app tool (N9's fallback), and tools disappear when their injector is destroyed.
- Implicit Signal Forms tools (`packages/forms/signals/src/webmcp/registration.ts`): registration waits for an `effect` so a form built from a required input is ready (`:24-36`); the schema is inferred from the model's current value, with `required` from the field's `required()` state and `additionalProperties: false`, and registration throws when a value is `null`, `undefined`, an empty array or an unsupported type (`:44-51`, `:96-147`); `execute` sets the whole form value, calls `submit`, and returns `Form submitted successfully.` or `Form submission failed:` followed by one `field.path: message` line per error (`:69-89`); the annotations are forced to `readOnlyHint: false` and `untrustedContentHint: false`, with `consequentialHint` taken from the app (`:58-68`).
- Reading for the extension **[inferred]**: a form tool is always a write that may submit to a server, so it always carries the "may change server data" confirm label (3.5); its result text is short (one line, or one line per error) and fits any window; and its `required` list and types are a free, exact description of what the model has to fill, which N15's "Why can't I submit?" can read without the tool being run.

### 1.3 Claude in Chrome (a coding-agent browser integration), from its tool definitions

Source: the `mcp__claude-in-chrome__*` tool definitions loaded in this Claude Code session (read, not run) **[measured]**. The agent is cloud Claude; the extension reads the page and acts on it. Group C's research adds the vendor pages.

| AI feature (tool) | Data to the model | Judgement |
|---|---|---|
| `read_page`: the accessibility tree with element reference ids, a depth limit, an `interactive` filter, a 50,000-character cap that truncates at a line boundary and reports the full size, and a `ref_id` to read one subtree | a11y tree | **Fits if reduced**: the same reduction as chrome-devtools-mcp's `take_snapshot` (1.0): DOM-computed roles and names (2.2), ids per 3.4, a subtree per component instead of the page **[inferred]** |
| `find`: natural-language search for elements ("login button"), at most 20 matches, returned as references | the query and the page | **Already covered (N12, `find_components` with host text)** |
| `get_page_text`: the page's readable text, article content first | text | **Already covered (N11 collects text nodes per component; `find_components` returns the host's first 80 characters)** |
| `read_console_messages`: a regex `pattern` the description says to always provide, `onlyErrors`, a `limit` of 100, and `clear` after reading | console entries | **Fits as is**: N4 hooks `console.error` only; a read tool `console_messages {level, pattern}` with a "clear after read" option gives the model a filtered, incremental log. Candidate C3 in section 4 **[inferred]** |
| `read_network_requests`: all requests including cross-origin, a `urlPattern` filter, `clear`; entries are dropped when the page leaves the domain | request list | **Fits if reduced** as the Network agent row in 1.0: the page sees `PerformanceResourceTiming` only; extends N14 **[inferred]** |
| `computer` `screenshot` and `zoom` (a region of the viewport) | pixels | **Already covered (N8)**; `zoom` on a region is N8's crop to the component box |
| `computer` click, type, key, scroll, drag, `scroll_to` a reference, hover | n/a | **Does not fit** as free input automation (3.5); scrolling a component into view is the one harmless part, and Pangular's `highlight` covers it as a panel action, not a model action **[inferred]** |
| `javascript_tool`: run model-written JavaScript in the page | the page | **Does not fit**: the model writes code (section 8 ruling), and page text can steer that code (prompt injection). Chrome DevTools AI assistance works the same way (03 section 3.1) and is judged the same |

### 1.4 Angular CLI MCP server, re-checked

Source: local clone `D:\projects\github\angular\angular-cli` at `5584a589a` (2026-07-10, branch `22.0.x`), `packages/angular/cli/src/commands/mcp/tools/**` **[measured]**. The registered tool names are `ai_tutor`, `get_best_practices`, `list_projects`, `search_documentation`, `onpush_zoneless_migration`, `devserver.start`, `devserver.stop`, `devserver.wait_for_build` and `run_target`, which matches 02 section 4.6, so the 1.0 judgement stands and nothing was re-judged. The `22.2` branch of the CLI was not read (section 6).

### 1.5 Chrome DevTools AI assistance, beyond 03

Sources, read by the group A subagent (fetch log in its file; every page came back through markdown.new): https://developer.chrome.com/docs/devtools/ai-assistance/chat (updated 2026-05-20), .../data-usage-and-enterprise-controls (2026-01-30), .../get-started (2024-11-13), https://developer.chrome.com/docs/devtools/console/understand-messages (2024-05-10), https://developer.chrome.com/docs/devtools/application/webmcp (2026-05-12) **[documented]**. The per-agent URLs (`/styling`, `/network`, `/sources`, `/performance`) returned the chat page, so there are no separate per-agent pages. 03 section 3 and 1.0 above already judge the four agents, Console Insights, the autonomous actions, side-effect gating, workspace writes and "Copy to coding agent"; the rows below are what is new.

| AI feature | Data to the model | Model or service | Judgement |
|---|---|---|---|
| The published per-feature data list with always-excluded fields: the network agent sends a header subset and never `X-*`, `Cookie`, `Set-Cookie` or `Authorization`; Console Insights sends headers of the related request minus cookies, auth, `x-*` and the response body **[documented, data-usage page]** | n/a | cloud Gemini | **Fits as is** as a panel rule, no model needed: a "what this tool sends" line per tool in the panel, and an exclusion list the page agent applies before data leaves the page. 3.4 has the redaction; the per-tool table in the UI is new. Candidate C5 in section 4 **[inferred]** |
| Performance "Generate label" sends `{name, url, dur, self, children}` of one call frame; "Ask AI" may request page load timings, network requests and styling from the trace **[documented, data-usage page]** | one frame, then more on request | cloud Gemini | **Already covered (N21)**; the per-frame shape is the id-and-summary rule of 3.4 |
| Conversation history kept between sessions, deletable per conversation **[documented, chat page]** | n/a | n/a | **Fits as is**: a persisted transcript per origin, with the origin-locked conversation rule (C1) **[inferred]** |
| Requirements: 18 or older, a signed-in Google Account, a supported location, DevTools in English, off by default **[documented, get-started page]** | n/a | cloud Gemini | n/a (not a feature). The on-device extension has none of these; 3.5 states the "nothing leaves the device" difference |
| DevTools WebMCP pane (Application panel): lists the page's tools with name, description and an invocation count; a chronological log of invocations with status (Completed, Canceled, In Progress, Error), the input the agent sent and the output; filters by name, status and declarative-HTML vs imperative-JavaScript tools; a manual test area that runs a tool with edited parameters, pre-filled from a past call; shows schema violations and whether the agent ever considered a tool **[documented, webmcp page]** | none (a local viewer) | none | **Fits as is** for the extension's own calls: N9 already runs the model against the app's tools; the pane's call log, status, manual "Run tool" with a confirm (3.5) and "did the model consider this tool" belong in N9's report. Calls made by other agents are not visible to the extension unless its `modelContext` shim is the registry (N9 fallback) **[inferred]**. Candidate C6 in section 4 |

### 1.6 Microsoft Edge DevTools Copilot features

Sources (group A): https://learn.microsoft.com/en-us/microsoft-edge/devtools/console/copilot-explain-console (ms.date 2024-03-20, updated 2026-01-15), https://learn.microsoft.com/en-us/microsoft-edge/devtools/experimental-features/ (2026-08-03), https://learn.microsoft.com/microsoft-edge/web-platform/prompt-api (updated 2026-10-06) **[documented]**. Neither DevTools page states what data goes to Copilot or which model answers. The Edge DevTools landing page and the "What's new" pages for 153 and 154 contain no Copilot or AI text **[documented]**.

| AI feature | Data to the model | Model or service | Judgement |
|---|---|---|---|
| "Explain this error" button next to a console message opens Copilot in the Edge sidebar with the message and a fixed request; follow-ups allowed; not in InPrivate, Kids Mode, WebView2 or standalone PWA windows; behind the "AI Explain Console Error" experiment (Edge stable 151, Canary 153) | the console message (the page says no more) | "Copilot in Edge", model not stated, cloud | **Already covered (N4)**, which adds the error code digest and the owning component |
| CSS Copilot (experiment "Enable CSS Copilot"): a Copilot button next to an element or style rule asks the sidebar to explain the element or style | not stated | Copilot, cloud | **Already covered (N8's text form; 1.0 styling row)** |
| Edge Prompt API statement: the model "runs on the same device", and "the data input to the model never leaves the device, and isn't collected to train AI models" | n/a | Phi-4-mini, Aion (on-device) | n/a (not a feature): evidence for the proposals' 3.5, which says no Microsoft statement was found and marks Edge's on-device claim **[inferred]**; this page is that statement **[documented]**. Section 7 lists it as a correction for 3.5 |

### 1.7 Firefox DevTools

Checked (group A): https://firefox-source-docs.mozilla.org/devtools-user/ and https://firefox-source-docs.mozilla.org/ai-agent-tools/index.html **[documented]**, plus a search **[search-summary]**. Firefox DevTools has no AI assistant. Mozilla ships "Firefox DevTools MCP" (`npx @mozilla/firefox-devtools-mcp`), an MCP server that drives Firefox over WebDriver BiDi for coding agents, with tool presets `slim`, `basic` (includes `evaluate_script`), `developer` and `mozilla`, a warning to use a dedicated profile, and a prompt-injection note **[documented, https://raw.githubusercontent.com/mozilla/firefox-devtools-mcp/main/README.md]**.

| AI feature | Data to the model | Model or service | Judgement |
|---|---|---|---|
| Firefox DevTools MCP tool presets (`slim` to `mozilla`) | what the tools return | the client's model | **Already covered (3.3 step 1 tool groups; chrome-devtools-mcp `--slim` in 1.0)**. Firefox itself is out of scope by Lars's ruling (section 8: no Prompt API) |

### 1.8 Lighthouse and PageSpeed Insights

Checked (group A): https://developers.google.com/speed/docs/insights/v5/about (2024-10-21), https://developer.chrome.com/docs/performance/insights, https://developer.chrome.com/docs/lighthouse/overview **[documented]**; a search for a Gemini feature in PSI or Lighthouse found nothing **[search-summary]**. The Performance panel's "Insights" (font display, render-blocking requests, dependency chains and others) name no model, so they are read as rule-based **[inferred from the absence of a model statement]**. The only generative use of Lighthouse found is Chrome 149's autonomous accessibility audit (1.0).

| AI feature | Data to the model | Model or service | Judgement |
|---|---|---|---|
| Rule-based performance insights with fixed names and explanations | none | none | **Already covered (N10's shape: deterministic checks, explained by the model)** |

### 1.9 Sentry Seer

Sources (group A): https://docs.sentry.io/product/ai-in-sentry/seer/, .../seer/autofix/, https://docs.sentry.io/product/ai-in-sentry/ai-privacy-and-security/, https://docs.sentry.io/security-legal-pii/security/service-data-usage/ (no dates shown) **[documented]**. The LLM is not named: "third-party large language models (LLMs) that are hosted within Sentry's production infrastructure"; an own "ML model" scores fixability. Data used: issue context (error messages, stack traces, event metadata), tracing data, logs, code from linked GitHub or GitLab repositories, profiles, user feedback, Sentry docs, DOM interactions; data is not used for training by default. Runs on Sentry's servers.

| AI feature | Data to the model | Model or service | Judgement |
|---|---|---|---|
| Autofix root cause analysis from an ingested issue, run automatically when the fixability score is high enough | error, stack, event metadata, traces, logs, repository code | cloud LLM in Sentry's infrastructure | **Fits if reduced**: cut the repository code, traces and logs; keep the error, stack and the owning component's state, which is N4. The reduction is N4 itself, so nothing new **[inferred]** |
| Fixability score (an ML model ranks which issues are worth fixing) | issue features | Sentry's own model | **Does not fit**: needs a trained scorer and a corpus of issues; the on-device models are not classifiers over history |
| Solution identification, code generation and PR creation, PR iteration from CI | the above plus code | cloud LLM | **Does not fit**: code generation (section 8 ruling) and a server |
| Handoff of a structured prompt to Claude Code, Cursor Cloud Agents or GitHub Copilot after root cause and plan | the analysis | cloud LLM | **Already covered (N13)** |
| Seer Agent: natural-language investigation across errors, traces, spans, logs and code, with actions in Sentry (archive, dashboards, monitors, alerts), also in Slack | org-wide data | cloud LLM | **Does not fit**: cross-session server data; the chat loop itself is 3.3 |
| DOM interactions as a data source for the analysis | recorded interactions | cloud LLM | **Already covered (N7's recorder)** |
| Code Review of pull requests | PR diff | cloud LLM | **Does not fit**: no code, no repository |

### 1.10 Replay.io

Sources (group A): https://docs.replay.io/basics/replay-mcp/overview, https://docs.replay.io/reference/replay-mcp/tools, https://docs.replay.io/llms.txt, https://docs.replay.io/basics/replay-qa/agent-integration **[documented]**. No repository source was read (`github.com/replayio/replay-mcp` returns "Page not found"). Replay MCP is a cloud MCP server (`https://dispatch.replay.io/nut/mcp`) over a time-travel recording: 30 tools for source and console, variables and expressions, call stacks and virtual breakpoints, error analysis, network and storage, React renders, Redux, Zustand and TanStack Query state, Playwright steps and profiling; `RecordingOverview` runs first and can take minutes. No model is run by Replay **[inferred from the docs; not stated]**. Replay QA is an autonomous app-testing service with its own MCP endpoint.

| AI feature | Data to the model | Model or service | Judgement |
|---|---|---|---|
| Time-travel inspection of a recording: variables at any point, call stacks, virtual breakpoints | recording data | the client's model | **Does not fit**: needs Replay's recording runtime; a live page has no past state, and breakpoints need the `debugger` permission (2.2) |
| React renders, and state-library state (Redux, Zustand, TanStack Query) in the recording | render and state events | the client's model | **Already covered (N1 `cd_record` for the live equivalent; 6.1 for NgRx)** |
| `RecordingOverview` as the required first call | an overview | the client's model | **Already covered (3.3 step 2 context chip, N18, and Pangular's "start here" tools, 03 section 1.5)** |
| Replay QA: an autonomous agent explores the app, builds journeys, runs them with recordings and reports root causes | the app under test | not stated, cloud | **Does not fit**: autonomous input automation on the user's behalf (3.5) and a server |
| Published agent skills (`replay-mcp`, `replay-cli`, `replay-playwright`) that teach a coding agent the tools | n/a | n/a | **Fits as is** as documentation: a skill file for chrome-devtools-mcp users of the published tool group (3.2); not an extension feature. Candidate C7 in section 4, lowest priority **[inferred]** |

### 1.11 LogRocket (Galileo AI)

Sources (group A): https://docs.logrocket.com/docs/galileo.md (2026-06-11), .../logrocket-galileo-ai-privacy-faq.md (2026-05-18), .../galileo-highlights.md (2025-08-19), .../ask-galileo.md (2026-06-08), .../mcp.md (2026-08-14) **[documented]**. LogRocket calls "OpenAI, Google, and Anthropic's API for certain Galileo functions"; no model is named; its own ML models score issues; it runs in LogRocket's cloud. Redacted fields never reach Highlights ("sees exactly what you would see").

| AI feature | Data to the model | Model or service | Judgement |
|---|---|---|---|
| Highlights: a summary of up to 10 sessions of one user, with per-session summaries linked to the moment | session recordings after redaction | cloud LLM | **Already covered (N7, which writes the story of the current session; the Summarizer is available for a long recorder log)** |
| Galileo for Issues: ML scoring of user impact from errors, failed requests, rage clicks, dead clicks and funnel drop-off; an issue needs 3 occurrences | event streams across sessions | own ML models | **Fits if reduced**: drop the cross-session scoring and the funnel; keep the detection of a dead click (a click after which no change-detection cycle, DOM mutation or navigation follows) and a rage click (the same target clicked three or more times within two seconds) from the N7 recorder and `cd_record`, as deterministic rules the model explains with the component and its listeners (`component_listeners`). Candidate C8 in section 4 **[inferred]** |
| Natural-language issue titles written by an LLM from session events (beta) | the session events | cloud LLM | **Already covered (N7's title and "expected, actual" text)** |
| The "Galileo debug package" handed to a coding agent for a severe issue | the issue package | cloud | **Already covered (N13)** |
| Automatic dispatch of a Cursor Cloud Agent when a severe issue appears | the package | cloud | **Does not fit**: no cloud agent and no server; N13 is a click |
| Ask Galileo: chat over 100 sessions per query, with charts, funnels and playlists; the MCP server (`use_logrocket`, `find_sessions`, `watch_sessions`, `build_metric`, `find_issues`) | the session store | cloud LLM | **Does not fit**: a cross-session store on a server |
| `get_network_entries`: the HAR of one session | request log | the client's model | **Fits if reduced** to `PerformanceResourceTiming` for the current page, as the Network row in 1.0; extends N14 **[inferred]** |
| Redaction before the model sees a session | n/a | n/a | **Already covered (3.4 redaction in the page agent)** |

### 1.12 Next.js: `next-devtools-mcp`, the `/_next/mcp` runtime tools and the agent features

Sources (group B): https://raw.githubusercontent.com/vercel/next-devtools-mcp/main/README.md, https://nextjs.org/docs/app/guides/mcp (Next.js 16.4.0, 2026-10-02), https://nextjs.org/docs/app/guides/ai-agents (2026-10-06), https://nextjs.org/blog/next-16-2-ai (2026-03-18) **[documented]**; no tool source was read. Shape: Next.js 16+ serves an MCP endpoint at `/_next/mcp` from the dev server, on by default; `next-devtools-mcp` is a stdio "thin connector" with `nextjs_index` (scan ports, list each server's tools) and `nextjs_call` (call one runtime tool), plus two gateway tools that return instructions instead of doing work. `get_errors` and `get_page_metadata` "read from active browser sessions"; how the browser state reaches the server is not described. The model is the MCP client's.

| AI feature (tool) | Data to the model | Judgement |
|---|---|---|
| `get_errors`: config validation errors, browser runtime errors and build errors with source-mapped stacks | errors and stacks | **Already covered (N4)** for the runtime part; build errors do not exist in the page |
| `get_logs`: the path to a dev log file holding browser console logs and server output | a file path | **Fits as is** for the browser half: a `console_messages` read tool (C3); the server half does not exist for the extension |
| `get_page_metadata`: what contributes to the current page's render (the open browser session) | render metadata | **Already covered (N18 feature fingerprint, `find_components`, `defer_blocks`)** |
| `get_routes`: every route from the filesystem, grouped by router | the route list | **Already covered (section 5 router tree row, `router_state`, `ɵgetLoadedRoutes`)**, from the live config instead of files |
| `get_server_action_by_id`, `get_compilation_issues`, `compile_route` | server and build data | **Does not fit**: server and build; the extension has neither (section 8) |
| `get_request_insights`: recent request timelines, server fetches and cache behaviour from a span recorder | timelines | **Fits if reduced** to the client side (`PerformanceResourceTiming`, `httpResource` state nodes), as the Network row in 1.0; extends N14 **[inferred]** |
| `nextjs_docs` gateway: returns the path of version-matched docs in `node_modules/next/dist/docs/` and reading instructions, without fetching | a path | **Already covered (N4's bundled error digest, N10's `get_rule`)**: the extension ships a version-matched digest instead of pointing at files it cannot read |
| `browser_eval` gateway: tells the agent to use the `agent-browser` CLI | instructions | **Does not fit**: a hand-off to browser automation the extension does not do |
| Managed `AGENTS.md` block written by `next dev`; `agentRules` | instructions | **Fits as is** as documentation for chrome-devtools-mcp users of the published tool group (C7); not a panel feature |
| Browser console errors forwarded to the terminal (`logging.browserToTerminal`) | console | **Does not fit**: no terminal and no dev-server hook |
| `@vercel/next-browser` and `agent-browser` CLIs: React component trees with props, hooks, state and source-mapped file locations, as structured text | the tree | **Already covered (3.4 `find_components` and `inspect_component`; N13 file and line)** |
| `next-browser`: PPR shell and Suspense-boundary analysis | boundaries | **Already covered (N5 for `@defer`; N16 for `@boundary`)** |
| `next-browser`: loading filmstrips and screenshots | frames | **Does not fit** for a filmstrip (a screencast needs CDP through `debugger`, 2.2); one screenshot is N8 |
| Dev overlay "Copy prompt": on a blocking error the overlay lists labelled fixes and packages the chosen one as a paste-ready prompt with an instruction to read the matching error page | the chosen fix | **Already covered (N4 plus N13)**; the UI shape, a choice of labelled findings before the copy, is worth copying into N13's button **[inferred]** |
| Automatic agent feedback (`experimental.agentFeedback`): the agent keeps anonymised feedback and opens a review form; nothing is sent until the user clicks | feedback | **Does not fit**: telemetry to a vendor, out of the extension's scope |
| `next upgrade --agent`: migration guides handed to a coding agent | guides | **Does not fit**: code changes (section 8 ruling) |

Vercel Toolbar and Comments (https://vercel.com/docs/vercel-toolbar, https://vercel.com/docs/comments **[documented]**): no AI, agent or v0 feature on either page. Nothing to judge.

### 1.13 Nuxt: `nuxt-mcp-dev`, the MCP Toolkit's inspector tab, Nuxt DevTools

Sources (group B): `packages/nuxt-mcp-dev/src/tools/runtime.ts`, `scaffold.ts` and `src/prompts/basic.ts` in https://github.com/antfu/nuxt-mcp **[measured]**; its README **[documented]**; https://devtools.nuxt.com/guide/features and https://mcp-toolkit.nuxt.dev/raw/getting-started/inspector.md **[documented]**. `nuxt-mcp-dev` is an MCP server inside the Nuxt dev server (`/__mcp/sse`); it also rewrites editor config files to register itself. The Nuxt DevTools features page has no AI, MCP or agent section.

| AI feature (tool) | Data to the model | Judgement |
|---|---|---|
| `get-nuxt-config`, `list-nuxt-auto-imports-items`: build-time config and auto-imports | config | **Does not fit**: dev-server state |
| `list-nuxt-components`, `list-nuxt-pages`: the registered components and pages | lists | **Already covered (`find_components`, `router_state`)**, from the live page |
| `nuxt-scaffold`: runs `nuxi add` to create files | files | **Does not fit**: generates code |
| Prompt `nuxt-basic`: a system-style prompt with the project's directories and SSR guidance | a prompt | **Already covered (3.3 step 2 context chip; 3.6 system prompt)** |
| MCP Toolkit "MCP Inspector" tab: opens the official MCP Inspector against the app's own MCP server to browse and run tools and see request history | tool calls | **Already covered (N9, C6)** |

### 1.14 Vue DevTools

Sources (group B): https://devtools.vuejs.org/ and its features page, the `vuejs/devtools` README and `AGENTS.md` **[documented]**; `raw.githubusercontent.com/vuejs/mcp/main/README.md` returned 404. Vue DevTools v9 lists no AI, MCP or agent feature; its Vite plugin is a dock inside Vite DevTools (Devframe), so any agent surface comes through Vite DevTools' `mcp` option (1.17) **[inferred]**. Nothing to judge beyond 1.17.

### 1.15 Svelte MCP

Sources (group B): https://raw.githubusercontent.com/sveltejs/mcp/main/README.md, `documentation/docs/30-mcp/40-tools.md`, `50-resources.md`, `70-cli.md` **[documented]**; tool handler names from `packages/mcp-server/src/mcp/handlers/tools/index.ts` **[measured]**. Four tools, none of which reads a running app: `list-sections` and `get-documentation` (docs from svelte.dev), `svelte-autofixer` (static analysis of code the model wrote), `playground-link`.

| AI feature (tool) | Data to the model | Judgement |
|---|---|---|
| `list-sections`, `get-documentation`: live documentation sections | docs text | **Does not fit**: needs the network; the offline substitutes are N4's digest and N10's rules |
| `svelte-autofixer`: lints model-written code and asks for another call after fixing | code | **Does not fit**: the extension writes no code |
| `playground-link` | code in a URL | **Does not fit**: code |
| Skills, subagents and an `AGENTS.md` block for Claude, Cursor, Copilot, Codex | n/a | **Fits as is** as documentation (C7) |

### 1.16 React DevTools, React Scan, Redux DevTools

Sources (group B): React Scan README and the React DevTools CHANGELOG (searched for agent, MCP, AI, LLM), the Redux DevTools README and file tree **[documented; the CHANGELOG search is a file read]**. None has an AI or MCP feature. React Scan's README points at "React Doctor", static checks for coding agents (not read). Agents reach React DevTools data through `next-browser` and `agent-browser react tree` (1.12). Nothing to judge; 03 sections 2 and 4 cover their non-AI features.

### 1.17 TanStack Devtools and Vite DevTools (Devframe), WebMCP from a library

Sources (group B): https://raw.githubusercontent.com/TanStack/devtools/main/README.md, `docs/webmcp-tools.md`, `packages/devtools-webmcp/README.md` **[documented]**; `vitejs/devtools` `packages/core/src/node/config.ts`, `server.ts`, `__tests__/server-mcp.test.ts` **[measured]**; https://devfra.me/guide/agent-native **[documented]**; `antfu/nuxt-mcp` `packages/vite-plugin-mcp/src/server.ts` **[measured]**.

Facts:
- `@tanstack/devtools-webmcp` (0.0.2): `registerDevtoolsTools({pluginId, instanceId?, tools})` registers a library's internals as WebMCP tools on `document.modelContext` (or `navigator.modelContext`) so "an agent in the browser" can read them during development; the browser tool name is `pluginId[.instanceId].name`, for example `tanstack.query.main.getQueryCache`; it sets `annotations.debugging = true` and passes `readOnlyHint`, `untrustedContentHint` and `consequentialHint` through; the root import is a no-op outside `NODE_ENV === 'development'`; the tools "do not appear in a devtools panel" **[documented]**.
- Vite DevTools config option `mcp`: "Expose the aggregate MCP endpoint at `<base>__mcp`, a Streamable-HTTP server over the whole tool registry of every mounted devframe. Defaults to 'auto': the route mounts once any agent-flagged surface exists" **[measured, `config.ts`]**. Devframe's guide: an RPC function opts in with an `agent` field; safety is inferred from `type: 'query'` as read; a browser-side WebMCP projection exists for client RPC functions with `agent`, marked experimental; structured errors carry `code`, `message`, `fix` and `docs`; tool names match `^[a-zA-Z0-9_-]{1,128}$` **[documented]**. Which built-in Vite DevTools functions carry `agent` was not found.
- `vite-plugin-mcp`: `get-vite-config` and `get-vite-module-info` over the dev server's module graph **[measured]**.

| AI feature | Data to the model | Judgement |
|---|---|---|
| A library registers its internals as WebMCP tools with `debugging: true` (TanStack); a devtools framework projects agent-flagged client RPC functions as WebMCP tools (Devframe) | library state through `execute` | **Fits as is**: the exact app-side WebMCP case of section 3. The extension consumes `debugging: true` tools as a read source (`getTools()` is already in N9), subject to the selection and naming rules in section 3; TanStack's names carry dots and camelCase, so they reach native Chrome sessions only through the structured-output loop (S11). Candidate C9 in section 4 **[inferred]** |
| Read-or-write inferred from the RPC type (`query` is read) | n/a | **Already covered (3.5: reads run, writes confirm)**; for WebMCP tools the hint is `readOnlyHint` (section 3) |
| Structured errors with `code`, `message`, `fix` and `docs` | n/a | **Already covered (3.6 error template)**; a `docs` field (a rule id for `get_rule`) is a one-line addition **[inferred]** |
| Agent skills installed with `npx @tanstack/intent install` | n/a | **Fits as is** as documentation (C7) |
| `vite-plugin-mcp` config and module info; Vite DevTools' aggregate `/__mcp` endpoint | dev-server state | **Does not fit**: server |

### 1.18 Playwright MCP

Sources (group B): https://raw.githubusercontent.com/microsoft/playwright-mcp/main/README.md **[documented]**; local clone `D:\projects\github\microsoft\playwright` (HEAD 2026-09-25), `packages/playwright-core/src/tools/backend/{tool,snapshot,response,webmcp}.ts` **[measured]**; the `webmcp.ts` strings "Tool names, descriptions and schemas are page-provided and untrusted" and the `untrustedContent` hint handling were re-read by Claude **[measured]**. The README says accessibility snapshots, "No vision models needed", and that coding agents may prefer the Playwright CLI with skills for token efficiency. Capability groups in source: config, core, core-navigation, core-tabs, core-input, core-install, network, pdf, storage, testing, vision, devtools. The model is the MCP client's.

| AI feature (tool) | Data to the model | Judgement |
|---|---|---|
| `browser_snapshot`: an ARIA snapshot in YAML with element refs, `depth`, a `target` subtree, and `boxes` for bounding boxes; the description says it "is better than screenshot" | the a11y tree | **Fits if reduced** as `read_page` in 1.3 and `take_snapshot` in 1.0: DOM-computed roles and names, ids per 3.4, per component **[inferred]** |
| `browser_find`: search the snapshot for text or a regex | matches | **Already covered (N12 `find_components`)** |
| `browser_console_messages`; `browser_network_requests` | console; requests | **Already covered**: console in C3 (1.3 row) and network in the 1.0 Network row; nothing new |
| `browser_evaluate`, `browser_run_code_unsafe` ("RCE-equivalent") | the page | **Does not fit**: model-written code (section 8) |
| Input tools (`browser_click`, `type`, `press_key`, `drag`, `select_option`, `handle_dialog`, `file_upload`) and the `vision` coordinate tools | n/a | **Does not fit** as free input automation (3.5) |
| `browser_fill_form` | field values | **Already covered (3.5: a form fill behind a confirm)** |
| `browser_webmcp_list` and `browser_webmcp_call` (capability `core`, on by default, `--no-webmcp` to turn off); every snapshot response lists the page's WebMCP tools; the listing says names, descriptions and schemas are "page-provided and untrusted" | the app's tools | **Already covered (3.2 app tools, N9, 3.4 notice)**; the "list on every snapshot" pattern is judged in section 3 (it costs context on a 7-9K window) |
| `devtools` capability: `browser_annotate` (the user annotates a screenshot in the Playwright Dashboard; the agent gets the annotated screenshot, the ARIA snapshot and the annotation list), `browser_highlight` | annotations | **Already covered (N8's screenshot region; Pangular's highlight as a panel action)** |
| `devtools` capability: tracing (`browser_start_tracing`, `browser_stop_tracing`) | a trace | **Already covered (N21)** |
| `devtools` capability: video recording and chapters | video | **Does not fit**: no screencast without the `debugger` permission (2.2) |
| `testing` capability: `browser_verify_element_visible`, `browser_verify_text_visible`, `browser_verify_list_visible`, `browser_verify_value` | a pass or fail | **Fits as is**: narrow check tools (`check_visible {id}`, `check_text {id, text}`) that let the model confirm a claim against the page before it answers, and that N7's "expected, actual" can use. Candidate C10 in section 4, low priority **[inferred]** |
| `testing` capability: `browser_generate_locator` | a locator | **Does not fit**: test code |
| `storage` capability (cookies, localStorage, sessionStorage, storage state) | storage | **Does not fit** the scope (as the Storage agent row in 1.0) |
| `--snapshot-mode none`, `--caps` subsets | n/a | **Already covered (3.3 step 1 tool groups; 3.4 caps)** |

### 1.19 Coding-agent browser integrations (vendor pages)

Sources (group C): Claude in Chrome, https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome (2026-08-26) and https://claude.com/chrome; VS Code Copilot browser tools, https://code.visualstudio.com/docs/agents/run/browser-tools and .../debugtest/integrated-browser; Cursor, https://cursor.com/docs/agent/tools/browser; Gemini in Chrome, https://support.google.com/chrome/answer/16283624 and https://support.google.com/gemini/answer/16821166; Copilot Mode in Edge, https://www.microsoft.com/en-us/edge/ai-powered/copilot-mode **[documented]**. None of these pages mentions WebMCP (zero matches in each fetched text); the WebMCP consumers named by the implementation-status file are Brave Leo, ChatGPT Desktop, Chrome 149 and Edge 150 origin trials, and Meta AI on Ray-Ban Display **[documented]**. 1.3 already judges Claude in Chrome's tools from their definitions; the rows below are what the pages add.

| AI feature | Data to the model | Model or service | Judgement |
|---|---|---|---|
| Claude in Chrome: clicks, typing and screenshots through the `debugger` permission; `scripting` to read page text; approval modes, with "Automatically approve" backed by a separate safety check that reviews each action, and sensitive actions (purchases) always waiting for the user | page text, DOM, console, network, screenshots | cloud Claude | The reads are 1.3. The separate safety-check model: **Does not fit**: a second model pass per write on a 7-9K window is too costly, and 3.5's human confirm is the guard **[inferred]** |
| VS Code Copilot browser tools (`readPage`, `screenshotPage`, `clickElement`, `typeInPage`, ...); "Add to Chat" attaches a selected element's HTML, CSS, an optional screenshot, element comments and console logs | element, CSS, screenshot, console | the Copilot session's model | **Already covered (3.1 context chip, N8, N13)** |
| VS Code `runPlaywrightCode` | model-written code | the Copilot session's model | **Does not fit**: code (section 8) |
| VS Code: agent pages run in isolated ephemeral sessions; a user tab is shared only after a "Share with Agent" confirmation, and autopilot mode declines share requests | the shared tab | n/a | **Already covered (3.5 read-only switch; the extension reads only the dev tab the user opened the panel on)** |
| Cursor browser: console logs written to files the agent greps; network requests and responses; approval modes Manual, Allow-listed actions, Auto-run; an origin allowlist that is "best effort" | console, network, screenshots | "Sonnet 4.5, GPT-5, and Auto" (cloud) | **Already covered (C3's pattern filter; 3.5 confirm and read-only switch)** |
| Gemini in Chrome "auto browse": shows a plan first, the user confirms sensitive steps and can take over; eligibility 18 or over, US, English, a paid plan | shared tabs' content | cloud Gemini | **Already covered (3.5 per-action confirm)**; a plan preview before a write sequence is a small addition to 3.5 **[inferred]** |
| Copilot Mode in Edge: works across tabs, journeys | tabs | cloud, not stated | **Does not fit** the scope (cross-tab browsing assistance) |

### 1.20 WebMCP explainer, spec, Chrome docs, the Google sample extension and the demos

Group C's facts about WebMCP itself are judged in section 3, item by item, because every one of them is about the app's side. Sources are listed there.

## 2. Adoption table

This section is a roll-up of the judgement rows in sections 1 and 3.2; each judgement lives in its own row there, and this table only counts and groups them. Counted by a script over the file (`count.mjs` in the session scratchpad; one row counts once, by its judgement marker) **[measured count, 2026-10-12]**: 139 rows in all.

| Judgement | Rows | Where the "fits" rows go |
|---|---|---|
| Fits as is | 21 | C1 (origin-locked, persisted conversations), C2 (`wait_for` and CD diff), C3 (`console_messages`), C4 (open the story), C5 (per-tool data table), C6 (WebMCP call log and manual run), C7 (skill file, counted from 1.10, 1.12, 1.15 and 1.17), C8 is a "fits if reduced" row, C9 (library `debugging` tools), C10 (check tools), C11 (WebMCP tool audit); plus rows that extend an existing feature with no new candidate: N7 (WebMCP calls in the story), N12 (navigation by intent), N15 (form tool schema), declarative tools as consumption |
| Fits if reduced | 11 | Network and HAR data reduced to `PerformanceResourceTiming` (extends N14; five rows: Chrome network agent, chrome-devtools-mcp network, Claude in Chrome, LogRocket HAR, Next.js request insights); accessibility trees reduced to DOM-computed roles and names (extends N10 and N23; four rows: Chrome a11y agent, `take_snapshot`, `read_page`, `browser_snapshot`); Sentry Autofix root cause reduced to N4; LogRocket issue detection reduced to C8 |
| Does not fit | 45 | code generation (Chrome "Apply to workspace", commit messages, Sentry code generation, Svelte autofixer, Next.js upgrades, Nuxt scaffold, Playwright locators, model-written JavaScript in three tools); servers and build state (Next.js, Nuxt, Vite, Storybook server tools, Sentry, Replay, LogRocket stores); free input automation (chrome-devtools-mcp, Claude in Chrome, Playwright, Replay QA); data the page cannot give (Lighthouse, heap snapshots, storage, screencasts, time travel, cross-session stores); a second model pass per write |
| Already covered | 62 | mostly 3.2 to 3.6 (confirm, read-only switch, redaction, notice, caps, error template, tool groups), N4, N7, N8, N9, N12, N13, N18, N21, 6.1 to 6.3 |

By tool, every feature judged: Chrome DevTools AI assistance (1.0 and 1.5), chrome-devtools-mcp, the Angular CLI MCP server, agent-react-devtools, React Grab and Stagewise, Cursor, Nuxt DevTools, Pangular (1.0); Storybook MCP (1.1); Claude in Chrome (1.3, 1.19); Edge DevTools Copilot (1.6); Firefox DevTools MCP (1.7); Lighthouse and PageSpeed (1.8); Sentry Seer (1.9); Replay.io (1.10); LogRocket (1.11); Next.js and Vercel (1.12); Nuxt MCP (1.13); Vue DevTools (1.14, nothing to judge); Svelte MCP (1.15); React DevTools, React Scan, Redux DevTools (1.16, nothing to judge); TanStack and Vite DevTools (1.17); Playwright MCP (1.18); VS Code Copilot, Cursor, Gemini in Chrome, Copilot Mode in Edge (1.19); WebMCP from the app's side (3.2).

## 3. WebMCP from the app's side

Lars, verbatim: "I didn't mean that Angular AI DevTools should export its tools as WebMCP, I meant that it may add a prerequisite for an Angular application to expose WebMCP, or support Angular paplications that already expose WebMCP."

Stated once, plainly: the extension publishes none of its own tools through WebMCP. Its external tool surface is the `devtoolstooldiscovery` group for chrome-devtools-mcp (3.2). WebMCP enters only from the app's side: an Angular app that registers tools, and the extension that reads and runs them.

Sources for this section, all read in this run unless marked otherwise: the WebMCP explainer README, `declarative-api-explainer.md` and `implementation-status.md`, and the spec source `index.bs` at `webmachinelearning/webmcp` main head `d0e4e0e` (2026-10-09) **[measured for the IDL and algorithm steps; documented for the prose]**; Chrome's pages https://developer.chrome.com/docs/ai/webmcp (updated 2026-10-07), .../webmcp/best-practices, .../webmcp/secure-tools (updated 2026-09-01), https://developer.chrome.com/docs/agents/security and the DevTools pane page **[documented]**; the Google sample extension `GoogleChromeLabs/webmcp-extension` (`extension/content.ts`, `shared/systemPrompt.ts`, `server/tools.ts`, `manifest.json`) **[measured]** and its README **[documented]**; the Google demos `pizza-maker/script.js` and `sport-shop-angular/.../webmcp.service.ts` **[measured]**; https://angular.dev/ai/webmcp **[documented]**; Angular's source (1.2) **[measured]**; Playwright's `webmcp.ts` (1.18) **[measured]**; TanStack's `devtools-webmcp` docs (1.17) **[documented]**; and the proposals' N9, 3.2 and 3.5, with 00 (WebMCP live in Chrome Beta and Edge Dev), 01 section 5 and 02 section 4.3.

### 3.1 What the platform and Angular give, in short

- The API is `document.modelContext` with `registerTool`, `getTools({fromOrigins})` and `executeTool(tool, input, {signal})`, plus `toolchange`, `toolactivated` and `toolcancel` events; `executeTool` resolves to the JSON-stringified return value of `execute`, whatever its shape, so the MCP `{content: [...]}` array is a convention, not a rule **[measured, `index.bs`]**. 00 measured the same members on `document.modelContext` in both browsers.
- `ToolAnnotations` in the spec: `readOnlyHint`, `untrustedContentHint`, `consequentialHint`, `debugging`, all default `false`; there is no `destructiveHint` or `idempotentHint` **[measured, `index.bs`]**. Angular's `Annotations` interface has the first three and not `debugging` (`types.ts:64-84`) **[measured]**; because `declareExperimentalWebMcpTool` spreads `...tool` into the registered object (`declare_tool.ts:60-61`), an extra `debugging` field would reach the browser untyped **[inferred from that spread; not run]**.
- Name rules: at most 128 code points, ASCII letters and digits plus `_`, `-` and `.`; an empty description or a duplicate name rejects with `InvalidStateError`; the spec sets no limit on description length, schema size or tool count **[measured, `index.bs`]**. Chrome recommends 500 characters per tool description, 150 per parameter description, 30 per tool or parameter name, and 1,500 characters per tool output, "subject to change" **[documented, secure-tools page]**.
- Exposure: by default a tool is visible to its own document, same-origin documents in the frame tree and the browser's built-in agent; `exposedTo` widens it to named origins; the `tools` Permissions Policy (default `'self'`) can disable it, and then `registerTool` rejects with `NotAllowedError` **[documented, explainer; measured, `index.bs`]**.
- A declarative form (`<form toolname tooldescription>` with `toolparamdescription` on controls and an optional `toolautosubmit`) is a separate explainer, "not part of the specification at this time"; Chromium implements a loose version, and the DevTools pane lists such tools as "Declarative HTML tools" **[documented]**. Angular has no declarative support; its Signal Forms tool is imperative (1.2).
- Consumers today: Brave Leo, ChatGPT Desktop, the Chrome 149 and Edge 150 origin trials, Meta AI on Ray-Ban Display **[documented, implementation-status]**; Playwright MCP lists and calls page tools on by default (1.18); none of the coding-agent browser integrations in 1.19 mentions WebMCP.
- Discrepancy: Chrome's secure-tools page says the spec draft has `requestUserInteraction()` on a `ModelContextClient`; `index.bs` at `d0e4e0e` contains neither name, and the README lists `ModelContextClient` only as an open issue **[measured for `index.bs`; documented for the claim]**. So no consent API exists for a tool to call; the confirm stays the client's job (3.5).

### 3.2 Which extension features become possible, or much better, when an app exposes WebMCP tools

Each row is judged on the same scale as section 1.

| Feature | What app WebMCP tools add | Judgement |
|---|---|---|
| N9 agent rehearsal | The feature itself; nothing to add here except the facts above: the annotations to check are `readOnlyHint`, `consequentialHint` and `untrustedContentHint` (EXT4 names `readOnlyHint` only), and the spec's name and description rules give N9 exact pass or fail checks on the tool metadata before the model runs **[inferred]** | **Already covered (N9, EXT4)** |
| N9 report, with the DevTools WebMCP pane's shape (1.5) | A call log per tool (status, input, output), a counter of how often the model chose each tool, "the model never considered this tool", and a manual "Run tool" with edited parameters behind the 3.5 confirm | **Fits as is**: candidate C6 |
| N15 Signal Forms doctor | A form registered with `experimentalWebMcpTool` carries an inferred schema with `required` and types, and `execute` returns one `field.path: message` line per error (1.2). N15 can read the schema from `getTools()` without running the tool, and can name the blocking field from the tool's own error lines after a rehearsal run **[measured facts; the use inferred]** | **Fits as is**: extends N15; no new feature |
| N12 navigation by intent | Demo apps register navigation tools (`view_product {productId \| productName}`, `search_product {query, category, size}`, `open_cart` in the sport-shop demo **[measured]**). With such tools, "take me to the running shoes" becomes one confirmed app tool call instead of a URL the model has to invent for `ɵnavigateByUrl` **[inferred]** | **Fits as is**: extends N12 behind the 3.5 confirm; no new feature |
| N7 interaction story | A WebMCP call the model made is a named action with arguments and a result, so the story can say "called `search_product {query: 'shoes'}`" instead of describing clicks; Pangular tags such timeline events with origin `agent` (03 section 1.5) | **Fits as is**: extends N7 |
| N10 runtime lint: a WebMCP tool audit | Deterministic rules over `getTools()`: a name outside the spec's character set or over Chrome's 30-character budget; an uppercase letter in a name (such a tool cannot reach a native Chrome session, S11); a description over 500 characters, or over the extension's 200-character cap (3.6); a parameter without a description; no annotation at all; a read with no `readOnlyHint` (EXT4); a tool that stays registered after the user leaves its route (Angular's guide says route tools need `withAutoCleanupInjectors()`; detectable as a tool still listed after navigation **[inferred]**); duplicate names (Angular throws; the spec rejects). The model explains each finding and names the modern Angular pattern (root services or `provideExperimentalWebMcpTools`, per the guide) | **Fits as is**: candidate C11, which folds EXT4 in |
| Library debugging tools as a read source | TanStack's `@tanstack/devtools-webmcp` registers library internals with `debugging: true` (1.17). If an Angular library did the same (none was found), the extension would get its internals without Tier 1 or a `globalThis` export, read through `getTools()` and run through `executeTool` | **Fits as is**: candidate C9 |
| N1, N2, N3, N24, N25 | Nothing: app tools are actions and reads of app state, not graphs; the signal, DI and change-detection data stay with `ng` | **Already covered**, unchanged |
| Declarative form tools | They appear in `getTools()` like imperative ones, so the extension consumes them the same way; without `toolautosubmit` the browser focuses the submit button and leaves the submit to the user, which matches 3.5's confirm **[documented; the fit inferred]** | **Fits as is** as consumption; nothing Angular-specific |

### 3.3 What the extension could reasonably ask an app to expose, and a recommended minimal tool set (guidance, not code)

The prerequisite stays "none" for the first release: every feature in sections 4 and 5 of the proposals works on a dev build with no app change, and WebMCP is the app opt-in tier (2.2, N9). What follows is what the panel's N9 and C11 output can recommend to an app that wants the WebMCP features, worded as guidance **[inferred recommendation; the facts it rests on are cited]**:

1. **Start with what Angular gives for free.** Every Signal Form the developer wants rehearsed gets `experimentalWebMcpTool: {name, description}` under `provideExperimentalWebMcpForms()`; the schema, the validation link and the submit result come from the framework (1.2). That alone makes N15's and N9's form cases work.
2. **One read tool per thing the page shows**, named `get_<thing>` (lowercase, snake_case, under 30 characters, no dot: dots are legal in the spec but untested on Gemma 4, and uppercase fails there, S11), with `readOnlyHint: true`, 0-3 flat parameters each with a `description`, and a flat object result under about 1,500 characters (Chrome's budget). The explainer's `get-dresses` and the sport-shop's `get_product_info` are this shape **[measured for the demos]**.
3. **One navigation tool per main destination**, `view_<thing> {id}`, with `readOnlyHint: false` and no `consequentialHint`, so N12 can navigate by intent. Apps that do not want this lose nothing: `router_state` still answers URL questions.
4. **Mark every tool that can reach a server** with `consequentialHint: true`, and every read that returns user-written content with `untrustedContentHint: true` (secure-tools page). The extension confirms every call anyway (3.5), but the hints decide the label "may change server data" and whether the result is wrapped (3.4 below).
5. **Register from root services or `provideExperimentalWebMcpTools`**, never from a component constructor that renders more than once (duplicate names throw); route tools only with `withAutoCleanupInjectors()` (Angular's guide). Keep descriptions to one sentence; Chrome allows 500 characters, but the extension truncates to 200 outside N9 (3.4 below), so the first sentence has to carry the meaning.
6. **Size.** Five to seven tools is the size of the Google demos (the sport-shop has five, the pizza maker seven **[measured]**), and about the most a 7-9K session can carry next to the extension's own tools (3.4 below). More tools are fine for cloud agents; the extension will pick a subset.
7. **Do not expose Angular internals through WebMCP** for the extension's sake: the signal graph, DI and change detection come from `ng` (Tier 0 and 1). If an app ever needs to hand the extension something `ng` cannot give (3.4 of the proposals: `@if` block state, the DI event stream), the brief's route is a `globalThis` export (Tier 2), not a WebMCP tool, because a WebMCP tool would also be visible to every other agent on the page.

### 3.4 Using tools apps already expose, on a 7-9K window

- **Budget.** At Chrome's budgets a tool with three described parameters is about 900 characters of declaration, about 225 tokens at 4 characters per token; ten such tools are about 2,250 tokens, a quarter to a third of Aion's 7,168 **[inferred arithmetic from documented budgets]**. An implicit form tool for a ten-field form is smaller (names and types, no descriptions: `registration.ts` writes none) but its `required` list and nesting still cost about 100-150 tokens **[inferred from the schema shape in 1.2]**. So app tools follow the same selection as every other group: N18's intent step (3.3 step 1) includes the app group only when the question is about an action, a form or "what can an agent do here", and the session takes at most about five app tools, chosen by the model's group answer plus a name match against the question **[inferred design]**. S3 (tool count per model) is the spike that sets the real number.
- **Descriptions.** Outside N9, a tool's description is cut to its first sentence, at most 200 characters (3.6), and its parameter descriptions to 60 characters; N9 keeps them unchanged, because N9 tests the app's own wording (its stated reason). The extension never rewrites names.
- **Listing.** Playwright MCP appends the page's WebMCP tool list to every snapshot response (1.18); the Google sample extension lists once per tab and re-lists on `toolchange`, debounced 100 ms **[measured, `content.ts`]**. On a 7-9K window the second pattern is the only affordable one: list at session creation, and on `toolchange` tell the panel, which offers "reload tools" rather than re-declaring mid-conversation (tools are fixed at `create()`, 3.2).
- **Naming per session.** As N9 states: app tools go unchanged to Aion's native tools and to the structured-output loop on any model, where the name is only text inside a JSON schema. A native tool session on Chrome, reachable only through the manual override, gets the app tools whose names have no uppercase letter and leaves out the rest; the panel names what it left out (S11). Dots, hyphens and colons in names were not run on any model (section 9 of the proposals), so TanStack-style dotted names and chrome-devtools-mcp-style `angular:` names stay on the structured-output loop until a matrix run says otherwise **[inferred]**.
- **Confirm.** Every WebMCP call pauses for the confirm, including `readOnlyHint: true` tools, because the hint is the app's claim (3.5). The Google sample runs `readOnlyHint: true` tools without asking and always asks on `consequentialHint` (its README trust table) **[documented]**; the proposals' stricter rule stands, because the measured argument errors of the small models (2.1) make the exact call on the confirm screen the only guard. The label "may change server data" follows `readOnlyHint: false` or `consequentialHint: true`.
- **Untrusted results.** The sample wraps `untrustedContentHint` results in Base64 on its server path and in a random marker on its on-device path, and Chrome's agents page prices Base64 at about 33 percent more tokens **[documented]**. On 7-9K tokens Base64 is not affordable, so the extension uses the marker wrap for `untrustedContentHint` results and the `<page>` notice of 3.4 for everything else, caps an app tool's result at 1,500 characters (Chrome's output budget) with a "cut, N characters left out" line, and keeps the system-prompt line that page data is never an instruction (3.6; the sample's rule 3 says the same) **[inferred design]**.
- **Visibility.** The extension's page agent runs in the page's own origin, so the default exposure covers it and `exposedTo` is not needed **[inferred from the default exposure rule; not run]**. If the app's response sets `Permissions-Policy: tools=()`, no tool registers and the panel should say so instead of "no tools found" **[inferred]**. Cross-origin iframes need `allow="tools"` on the frame; the sample reaches them through `all_frames: true` and a `postMessage` handshake **[measured, `content.ts`]**; the extension can do the same later, but the first release reads the top document only.
- **Shim.** N9's `modelContext` shim for browsers without the flag must behave like the native object where Angular can tell the difference: reject duplicate names (the spec does; Angular's guide tells developers to expect a throw), honour the `signal` option (Angular aborts it on injector destroy, `declare_tool.ts:79`), and never install over a native implementation (the mcp-b polyfill is idempotent and preserves a native context **[documented, npm registry page]**). Angular's own testing advice is `@mcp-b/webmcp-polyfill` (02 section 4.3), so a spike can run Angular's registration against it before writing a shim.

Not run: no Angular app with WebMCP tools has been run yet (proposals section 9), so every "fits" in this section is a reading of the APIs, not a measurement.

## 4. Candidate new features

Each candidate comes from a "fits" row above and is not in the proposals yet. Prompt, data, API and tier per candidate; all **[inferred design]**.

- **C1. Origin-locked, persisted conversations.** No prompt; a rule. A conversation belongs to one origin (Chrome DevTools AI assistance, 01 section 6) and is kept between panel openings, deletable per conversation (1.5). Data: the panel's own transcript. API: none; the Summarizer when a restored transcript is rebuilt into a session (3.3 step 5). Tier 0.
- **C2. `wait_for` and change-detection diff.** Prompt: "Click submit, then tell me what changed." Two tools after agent-react-devtools (1.0): `wait_for {condition: stable|navigation}` that returns when no change-detection cycle has run for 500 ms or a navigation ended, and a diff of two `cd_record` summaries (components checked, signals that changed epoch). Data: `ɵsetProfiler` events, router events. API: Prompt API with tools. Tier 1.
- **C3. `console_messages` read tool.** Prompt: "Any warnings from the cart?" A tool `{level: error|warn|all, pattern}` with a `clear` flag, after Claude in Chrome's `read_console_messages` (1.3) and Next.js `get_logs` (1.12). N4 hooks `console.error` only; this one keeps a capped ring buffer of all levels in the page agent and returns matches, 20 at most, 200 characters each. Data: console hooks. API: Prompt API with tools; Summarizer for a long match set. Tier 0.
- **C4. Open the story for this component.** Prompt: "Show me this component in Storybook." Match `ɵcmp.debugInfo.filePath` against the story index's `importPath` (`/index.json`, Tier 0 by URL) and open the story URL in a new tab behind a confirm, after Storybook's `stories.preview` (1.1). Data: the index and the debug info. API: none for the open; the model only picks the story when several match. Tier 1 for the file path.
- **C5. "What this tool sends" per tool, and an exclusion list.** No prompt; a panel table after Chrome's data-usage page (1.5): one line per tool naming the fields it sends to the model, and a fixed exclusion list the page agent applies (cookie-like and authorization-like values, `x-*` headers if network data is ever read). Data: none. API: none. Tier 0.
- **C6. WebMCP call log and manual run in N9.** No new prompt; N9's report gets the DevTools WebMCP pane's shape (1.5, 3.2): per tool a counter, a log of each call with status, input and output, "never considered" marks, and a "Run tool" form with edited parameters behind the 3.5 confirm. Data: the extension's own `executeTool` calls. API: Prompt API with tools (N9). Tier: app opt-in.
- **C7. A skill file for chrome-devtools-mcp users.** Not a panel feature: a short skill document, after Replay's and TanStack's skills and Next.js's managed `AGENTS.md` block (1.10, 1.17, 1.12), that tells a coding agent which read tools the extension publishes through `devtoolstooldiscovery` (3.2) and how to call them. Data: none. API: none. Tier 0.
- **C8. Dead-click and rage-click finder.** Prompt: "Did any click do nothing?" Deterministic rules after LogRocket's issue detection (1.11): a dead click is a click after which no change-detection cycle, DOM mutation or navigation follows within 300 ms; a rage click is the same target clicked three or more times within two seconds. The finding names the component and whether its host has a listener (`component_listeners`), and the model explains it (an unlistened output, a disabled control with no visible state, a handler that writes a plain field in a zoneless app, which is N24's case). Data: N7's recorder, `cd_record`, a `MutationObserver`. API: Prompt API with structured output (finding schema), then explanation. Tier 1 for the cycle data, Tier 0 for the DOM part.
- **C9. Library `debugging` tools as a read source.** No new prompt; a tool source after TanStack's `devtools-webmcp` and Devframe's projection (1.17, 3.2): app WebMCP tools with `annotations.debugging === true` are treated as read tools of the library that registered them, selected by N18 when the library is detected, and shown in the walkthrough with the library's name. Data: `getTools()`. API: Prompt API with tools or the structured-output loop (3.4 naming rule). Tier: app opt-in; no Angular library was found that registers such tools yet.
- **C10. Check tools.** No new prompt; two narrow tools after Playwright MCP's `browser_verify_*` (1.18): `check_visible {id}` and `check_text {id, text}` return a pass or fail against the live page, so the model can confirm a claim before it answers, and N7's "expected, actual" can state which checks fail. Data: DOM. API: Prompt API with tools. Tier 0. Lowest priority: `find_components` already returns the host's text.
- **C11. WebMCP tool audit.** Prompt: "Are my app's tools ready for an agent?" N10 rules over `getTools()` (3.2): name rules (character set, 30 characters, no uppercase letter), description length (500 per Chrome, 200 for this extension), parameters without a description, missing annotations, a read without `readOnlyHint` (EXT4 folds in), a tool still registered after its route is left, duplicate names. The model explains each finding and names the modern Angular pattern (root services, `provideExperimentalWebMcpTools`, `withAutoCleanupInjectors()`). Data: `getTools()` and `router_state`. API: Prompt API with structured output. Tier: app opt-in.

## 5. Ranked shortlist [inferred recommendation]

Ranked by how much the candidate adds that no existing N feature gives, against its cost on a 7-9K window; Lars decides.

1. **C8, dead-click and rage-click finder.** The one candidate that is new to Angular tooling and specific to zoneless apps: a click that caused no cycle is exactly the symptom N24 explains, and no panel detects it today.
2. **C11, WebMCP tool audit.** Lars asked for WebMCP from the app's side; this gives the opt-in tier a deterministic, cheap feature (rules over `getTools()`, explained in prose) that also folds EXT4 in and makes N9's rehearsal results interpretable.
3. **C3, `console_messages` read tool.** Four surveyed tools expose a filtered, clearable console read, N4 hooks errors only, and the cost is a ring buffer in the page agent.
4. **C2, `wait_for` and change-detection diff.** "What changed after I clicked?" is the incremental read that 03's takeaways and Pangular's `since` markers call for, and it reuses `cd_record` with no new data source.
5. **C9, library `debugging` tools as a read source.** The spec's `debugging` annotation and TanStack's package show the pattern; it costs one filter on `getTools()` and gives the extension library internals without Tier 1, if an Angular library ever ships them.

Left out of the five and why: C6 is UI for N9 rather than a feature; C1 and C5 are rules the implementation can adopt without a decision; C4, C7 and C10 are small and can ride along with 6.2, 3.2 and N7.

## 6. Not covered

Nothing in this file was run: no browser, no model, no Angular app with WebMCP tools (the brief forbids installs and browser runs). Every "fits" is a reading of documented or measured APIs against the proposals' measured limits.

Not read, and why:
- Chrome: the per-agent pages (`/styling`, `/network`, `/sources`, `/performance`) return the chat page, so per-agent facts come from the chat, overview and data-usage pages. The data-usage page (2026-01-30) does not itemise what the Chrome 149 autonomous actions send.
- Edge: the "explain this request / issue" features named in the brief have no page the subagent could find; `.../devtools/ai-assistance/` and the Learn page for Edge WebMCP are 404; the Microsoft support page for Copilot Mode returns an error page. Neither Edge DevTools page states what data goes to Copilot.
- Firefox: a search and two docs pages only; Mozilla's "Firefox AI Runtime" was not read.
- PageSpeed Insights: no Gemini feature was found by page reads and one search; absence is not proof.
- Sentry: the Code Review sub-page and the subprocessor list were not read.
- Replay: no repository source (`replayio/replay-mcp` is not found); the skills repository was not fetched.
- Next.js: `next-devtools-mcp`'s tool source was not read (README only); the `devIndicators` reference page returned 403, so in-browser panel AI features beyond "Copy prompt" are unknown; the `agent-browser` and `next-browser` repositories, react.doctor and the React Compiler devtools were not read.
- Vue: `vuejs/mcp` is 404; the Vue DevTools CHANGELOG was not searched.
- Vite: which built-in Vite DevTools or Rolldown functions carry the `agent` flag was not found; `devfra.me/guide/mcp` is a not-found body.
- Svelte: the mcp-server package README and the svelte.dev raw docs path are 404; tool descriptions come from the docs, names from source.
- Storybook: the docs page for the MCP addon was not read; `test.run`'s source lives in the Vitest addon and was not read; whether the docgen manifest is readable over HTTP from the page was not checked.
- Angular CLI: the `22.2` branch of the CLI was not read (the local clone is `22.0.x`).
- WebMCP: the rendered spec page was not fetched (`index.bs` is its source); the `leather-bag` Angular demo was not read; the Google "Model Context Tool Inspector" extension's source was not read; the `webmcp-evals`, `webmcp-skills` and `webmcp-studio` folders of `GoogleChromeLabs/webmcp-tools` were not read.
- Browser agents: no web search was run for Edge, Cursor or Gemini; the facts are the vendor pages only. Claude in Chrome's tool definitions were read, not run.
- Model behaviour: dots, hyphens and colons in tool names (TanStack's and chrome-devtools-mcp's styles) were not run on any model; S3's tool-count budget is still open, so "about five app tools per session" in 3.4 is a guess.

Observations for upstream, not filed (Lars files from the ledger; the brief says edit nothing else, so these are not added to `docs/filing-ledger.md`):
- Angular's `Annotations` interface lacks the spec's `debugging` hint (3.1) **[measured in both sources]**.
- Chrome's secure-tools page cites `requestUserInteraction()` as being in the spec draft; `index.bs` at `d0e4e0e` has no such name (3.1) **[measured for `index.bs`]**.
- Playwright MCP's README omits `browser_webmcp_list` and `browser_webmcp_call`, which its source defines (1.18) **[measured for the source; documented for the README]**.

## 7. Summary

1. Tools covered: 29 tools or products, counted by Claude from the list that follows (each named product once) **[measured count]**, across browser DevTools (Chrome, Edge, Firefox), framework MCP servers (Next.js, Nuxt, Vue, Svelte, TanStack, Vite, Storybook, the Angular CLI), browser-automation MCP servers (chrome-devtools-mcp, Playwright MCP, Firefox DevTools MCP), error and session tools (Sentry Seer, Replay, LogRocket), coding-agent browser integrations (Claude in Chrome, VS Code Copilot, Cursor, Gemini in Chrome, Copilot Mode in Edge), Lighthouse and PageSpeed, Pangular, agent-react-devtools, React Grab and Stagewise, and WebMCP itself (explainer, spec, Chrome docs, the Google sample extension and demos, Angular's APIs in source).
2. Features judged: 139 rows, one judgement each (sections 1 and 3.2), plus 11 candidate features (section 4) and the app-side WebMCP guidance (section 3).
3. Counts: 21 fit as is, 11 fit if reduced, 45 do not fit, 62 are already covered by the proposals **[measured count by script]**.
4. Top three candidates **[inferred recommendation]**: C8 dead-click and rage-click finder; C11 WebMCP tool audit; C3 `console_messages` read tool.
5. Two corrections for the proposals, for Lars to apply: 3.5's "no Microsoft statement was found" is now answered by Edge's Prompt API page ("the data input to the model never leaves the device") **[documented, 1.6]**; and the WebMCP facts in 3.1 (the `debugging` annotation, the name rules, the stringified result, no consent API in the spec) sharpen N9 and EXT4.
