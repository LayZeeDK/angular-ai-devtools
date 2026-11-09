import { Route } from '@angular/router';
import { N1UpdateCauseComponent } from './n1-update-cause.component';
import { N2SignalProvenanceComponent } from './n2-signal-provenance.component';
import { N3DiDoctorComponent } from './n3-di-doctor.component';
import { ErrorExplainerComponent } from './error-explainer.component';
import { StaleViewComponent } from './stale-view.component';

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
  // The M028 SC4 surface: the ordered after-render chain, or the state that names its absence.
  // Lazy for the same reason as the three above it — the panel's eager bundle is measured.
  {
    path: 'after-render',
    loadComponent: () =>
      import('./panel-demo').then((m) => m.PanelDemoComponent),
    data: { surface: 'after-render' },
  },
  // The M029 SC4 surface: the sanitizer finding from a fact list, or the state that names the
  // absence it renders. Lazy for the same reason as the five above it — the panel's eager bundle is
  // measured, and its eager graph is unchanged by this route.
  {
    path: 'sanitizer',
    loadComponent: () =>
      import('./panel-demo').then((m) => m.PanelDemoComponent),
    data: { surface: 'sanitizer' },
  },
  // The M030 SC4 surface: the walked redirect chain, or the state that names its absence.
  // Lazy for the same reason as the surfaces above it — the panel's eager bundle is measured.
  {
    path: 'redirect',
    loadComponent: () =>
      import('./panel-demo').then((m) => m.PanelDemoComponent),
    data: { surface: 'redirect' },
  },
  // The M031 SC4 surface: the field set, or the state that names its absence.
  // Lazy for the same reason as the surfaces above it — the panel's eager bundle is measured.
  {
    path: 'fields',
    loadComponent: () =>
      import('./panel-demo').then((m) => m.PanelDemoComponent),
    data: { surface: 'fields' },
  },
  // The M032 SC4 surface: the diagnostic joined to the input its own text names, or the state
  // that names why it could not be joined. Lazy for the same reason as the surfaces above it —
  // the panel's eager bundle is measured.
  {
    path: 'lint',
    loadComponent: () =>
      import('./panel-demo').then((m) => m.PanelDemoComponent),
    data: { surface: 'lint' },
  },
  // The M033 SC4 surface: the router finding — the unmatched segment, or the state that names
  // why it cannot be told. Lazy for the same reason as the surfaces above it — the panel's eager
  // bundle is measured.
  {
    path: 'router',
    loadComponent: () =>
      import('./panel-demo').then((m) => m.PanelDemoComponent),
    data: { surface: 'router' },
  },
  // The M034 SC4 surface: the selected component's structure and the modern form the cited table
  // sources for it — or the absence it can name instead. Lazy for the same reason as the surfaces
  // above it — the panel's eager bundle is measured.
  {
    path: 'legacy',
    loadComponent: () =>
      import('./panel-demo').then((m) => m.PanelDemoComponent),
    data: { surface: 'legacy' },
  },
  // The M035 SC4 surface: the change-detection strategy the component def reports, with the
  // readiness facts the metadata carries — or the state that names why it cannot be told. Lazy for
  // the same reason as the surfaces above it — the panel's eager bundle is measured.
  {
    path: 'onpush',
    loadComponent: () =>
      import('./panel-demo').then((m) => m.PanelDemoComponent),
    data: { surface: 'onpush' },
  },
  // The M036 SC5 surface: the resource the graph named, the state it reports and the params status
  // beside it — or the state that names why it cannot be told. Lazy for the same reason as the
  // surfaces above it — the panel's eager bundle is measured.
  {
    path: 'resource',
    loadComponent: () =>
      import('./panel-demo').then((m) => m.PanelDemoComponent),
    data: { surface: 'resource' },
  },
  // The M038 SC4 surface: the linked signal and the source it follows, both stored values and the
  // agreement the join reads between them — matching or differing — or the state that names why it
  // cannot be told. Lazy for the same reason as the surfaces above it — the panel's eager bundle is
  // measured.
  {
    path: 'linked-state',
    loadComponent: () =>
      import('./panel-demo').then((m) => m.PanelDemoComponent),
    data: { surface: 'linked-state' },
  },
  // The M039 SC5 surface: the effect the graph carries with the signals its edges name, the phase
  // as the absence the join published, and the change-detection finding — three blocks, each
  // rendering only its own text. Lazy for the same reason as the surfaces above it — the panel's
  // eager bundle is measured.
  {
    path: 'render-phase',
    loadComponent: () =>
      import('./panel-demo').then((m) => m.PanelDemoComponent),
    data: { surface: 'render-phase' },
  },
  // The M040 SC5 surface: the frame's ordered work — each interval's component identity in one
  // column and the cost the page measured in another — and nothing the answer did not carry. Lazy
  // for the same reason as the surfaces above it — the panel's eager bundle is measured.
  {
    path: 'performance',
    loadComponent: () =>
      import('./panel-demo').then((m) => m.PanelDemoComponent),
    data: { surface: 'performance' },
  },
  // The M041 SC1-SC3 surface: one block per recorded navigation. An open navigation renders the
  // stage it reached, its last event and the holder it cannot name; an ended one renders its
  // terminal class and only that class's own fields; the guard aggregate and the resolve stage
  // render their own named absences; and each route-config load renders by its own route with its
  // measured interval. Lazy for the same reason as the surfaces above it — the panel's eager bundle
  // is measured.
  {
    path: 'navigation',
    loadComponent: () =>
      import('./panel-demo').then((m) => m.PanelDemoComponent),
    data: { surface: 'navigation' },
  },
];
