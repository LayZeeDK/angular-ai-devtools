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
];
