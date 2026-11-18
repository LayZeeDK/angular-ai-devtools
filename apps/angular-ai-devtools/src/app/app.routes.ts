import { Route } from '@angular/router';
import { N1UpdateCauseComponent } from './n1-update-cause.component';
import { N2SignalProvenanceComponent } from './n2-signal-provenance.component';
import { N3DiDoctorComponent } from './n3-di-doctor.component';
import { ErrorExplainerComponent } from './error-explainer.component';
import { StaleViewComponent } from './stale-view.component';

// Every panel surface route installs the same component through the same dynamic import, so the
// loader is defined once and referenced by each of those routes. Thirteen copies of one closure in
// the route table were thirteen copies of its bytes in the eager bundle — which is exactly what put
// the initial total over the recorded baseline when the last surface was registered. Defined here,
// not per route: the dynamic import below stays the only reference to the demo module, so the lazy
// boundary is unchanged and the demo stays out of the eager graph.
const loadPanelDemo = () =>
  import('./panel-demo').then((m) => m.PanelDemoComponent);

/**
 * The panel's surfaces, in the order their routes sit in `appRoutes` below. Each name is both the
 * route's path and its `data.surface`, so the two readings of a surface cannot drift apart.
 *
 * A list mapped over one object literal rather than twenty-one literals: the route object is eager
 * even though its component is lazy, because the table itself lives in the entry chunk, so every
 * entry carried its own copy of the property names and of the minifier's per-entry renames. One
 * literal is one copy of those bytes; the names below are the only thing that varies.
 *
 * Every route built from this list is lazy — installed through `loadPanelDemo` above and never a
 * surface function — for the same reason the picker above is: the panel's initial bundle is measured
 * from the eager references in the built index, and nothing eager may import a surface.
 */
const PANEL_SURFACES = [
  // The M028 SC4 surface: the ordered after-render chain, or the state that names its absence.
  'after-render',
  // The M029 SC4 surface: the sanitizer finding from a fact list, or the state that names the
  // absence it renders.
  'sanitizer',
  // The M030 SC4 surface: the walked redirect chain, or the state that names its absence.
  'redirect',
  // The M031 SC4 surface: the field set, or the state that names its absence.
  'fields',
  // The M032 SC4 surface: the diagnostic joined to the input its own text names, or the state
  // that names why it could not be joined.
  'lint',
  // The M033 SC4 surface: the router finding — the unmatched segment, or the state that names
  // why it cannot be told.
  'router',
  // The M034 SC4 surface: the selected component's structure and the modern form the cited table
  // sources for it — or the absence it can name instead.
  'legacy',
  // The M035 SC4 surface: the change-detection strategy the component def reports, with the
  // readiness facts the metadata carries — or the state that names why it cannot be told.
  'onpush',
  // The M036 SC5 surface: the resource the graph named, the state it reports and the params status
  // beside it — or the state that names why it cannot be told.
  'resource',
  // The M038 SC4 surface: the linked signal and the source it follows, both stored values and the
  // agreement the join reads between them — matching or differing — or the state that names why it
  // cannot be told.
  'linked-state',
  // The M039 SC5 surface: the effect the graph carries with the signals its edges name, the phase
  // as the absence the join published, and the change-detection finding — three blocks, each
  // rendering only its own text.
  'render-phase',
  // The M040 SC5 surface: the frame's ordered work — each interval's component identity in one
  // column and the cost the page measured in another — and nothing the answer did not carry.
  'performance',
  // The M041 SC1-SC3 surface: one block per recorded navigation. An open navigation renders the
  // stage it reached, its last event and the holder it cannot name; an ended one renders its
  // terminal class and only that class's own fields; the guard aggregate and the resolve stage
  // render their own named absences; and each route-config load renders by its own route with its
  // measured interval.
  'navigation',
  // The M042 SC1-SC4 surface: the declaring component and the throwing component as two separate
  // facts, the error's own name, message and cause, the content the boundary rendered instead under
  // its own fallback label, and every named absence — the replaced subtree included — in its own
  // sentence.
  'error-boundary',
  // The M043 SC5 surface: the stability state and the emission it was read from, the settle time or
  // its named absence, and the repeated work the frame recorded — three readings, each in its own
  // block, and every named absence in its own sentence.
  'stability',
  // The M045 SC3-SC5 surface: the console join's own answer — the state the capture reported and one
  // block of lines per captured diagnostic, each named by the code it carried — and nothing else: no
  // cause, no element and no remedy, because the capture records none of the three.
  'console',
  // The M046 SC1-SC3 surface: the hand-off the join `extension/copy-to-agent.js` answers for the
  // text a pane drew — the control sentence naming what will be sent and the body itself as the pane
  // rendered it, the same with the absence a finding names still stated, or the `cannot-tell` reason
  // and nothing beside it.
  'console-read',
  // The M047 SC1-SC2 surface: the components the record names, filtered by the text a user typed
  // and counted by the rows the join kept — or the record's own statement that the page rendered
  // none, or the reason its source could not be read, each in a sentence of its own.
  'components',
  // The M048 SC1-SC2 surface: every string the surfaces declare compared against the copy digest
  // — the count compared when all are explained, each string the digest does not carry named with
  // the surface that renders it, or the reason one side is missing — and nothing read off a page.
  'copy-check',
  // The M049 SC1-SC2 surface: the record's steps in the order its shared `at` reading supports,
  // each naming its stream and quoting its recorded fields, the streams that were empty named
  // beside the story — never as quiet — and the joined-with-nothing state stating the narration's
  // own reason word, with the bound that says a story is what the record kept and not what the page
  // did.
  'interaction-story',
  // The M050 SC1-SC2 surface: each start whose terminal is absent from the window it was judged
  // over, quoting the fields the start recorded beside the window itself — its list, its kind, its
  // length and the `final: false` that says no finding is settled — then the count compared when
  // every start holds its terminal, then the reason word when the judgement cannot bound its
  // window or pair a start; and, in every state, the two chains the judgement refused, named as
  // not judged with their own reasons.
  'dead-click',
];

export const appRoutes: Route[] = [
  { path: '', component: N1UpdateCauseComponent },
  { path: 'signal-provenance', component: N2SignalProvenanceComponent },
  { path: 'di-doctor', component: N3DiDoctorComponent },
  { path: 'error-explainer', component: ErrorExplainerComponent },
  { path: 'stale-view', component: StaleViewComponent },
  {
    path: 'interop',
    loadComponent: () =>
      import('./interop.component').then((m) => m.InteropComponent),
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./chat-entry.component').then((m) => m.ChatEntryComponent),
  },
  // The picker's surface is lazy for the same reason the two above are: the panel's initial bundle
  // is measured from the eager references in the built index, and nothing eager may import it.
  {
    path: 'picker',
    loadComponent: () =>
      import('./page-picker.component').then((m) => m.PagePickerComponent),
  },
  {
    path: 'image-budget',
    loadComponent: () =>
      import('./image-budget').then((m) => m.imageBudget as any),
  },
  // The panel surfaces, spread here where their twenty-one literals sat: one route per name in
  // `PANEL_SURFACES`, each installing the shared loader above and naming its own surface in route
  // data. The order of the list is the order of the table.
  ...PANEL_SURFACES.map((surface): Route => ({
    path: surface,
    loadComponent: loadPanelDemo,
    data: { surface },
  })),
];
