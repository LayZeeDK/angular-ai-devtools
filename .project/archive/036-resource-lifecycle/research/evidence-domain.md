# Evidence — domain

Dimension: domain
Questions assigned: Which resource fields does the graph label on this fixture's build, and are they present for resource, rxResource and httpResource alike?; Does the fixture already contain a resource on each state, or does one need adding?

## Finding: the fixture contains no resource at all

- **Claim**: `spikes/ng222-app/src/app/**` contains no `resource(`, `rxResource(` or `httpResource(` call, so none of the four states the explainer must show has a subject in the app the panel tests against.
- **Source**: `grep -rn "\b(resource|rxResource|httpResource)\s*\(" spikes/ng222-app` returned no matches; routes listed at `spikes/ng222-app/src/app/app.routes.ts:16-34` contain no data-fetching page.
- **Confidence**: high
- **Why it matters here**: the milestone assumes a fixture subject. It has none, so T001 must add resources rather than measure existing ones — the fourth consecutive milestone whose roadmap sentence assumed a subject that is not there.

## Finding: the one `httpResource` in the repo cannot reach idle-by-design

- **Claim**: the only `httpResource` call in the repository is in the SSR spike, and its request function always returns a descriptor, so `ResourceParamsStatus.IDLE` is unreachable from it; it can reach loading and, depending on the response, resolved or errored.
- **Source**: `spikes/ng222-ssr/src/app/data-list.ts:22` — `protected readonly items = httpResource<Item[]>(() => ({ url: '/api/items', transferCache: this.transfer() !== '0' }));`
- **Confidence**: high
- **Why it matters here**: SC2 (idle-by-design) needs a params expression that can produce nothing — a `params` reading a signal that is `undefined` — which does not exist anywhere in the repo and must be authored deliberately.

## Assigned questions — answers

- Which resource fields does the graph label on this fixture's build, and are they present for resource, rxResource and httpResource alike? → Answered by the stack dimension: eight labelled fields, identical for all three constructors.
- Does the fixture already contain a resource on each state, or does one need adding? → It contains no resource at all; all four states need subjects, and the idle-by-design case needs a params expression that can return nothing.

## Dead ends

- The SSR spike's `httpResource` was considered as a substitute subject and rejected: it is a different app, and its params can never be idle, so it cannot demonstrate SC2.
