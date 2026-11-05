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
  { path: 'interop', loadComponent: () => import('./interop.component').then((m) => m.InteropComponent) },
  { path: 'chat', loadComponent: () => import('./chat-entry.component').then((m) => m.ChatEntryComponent) },
  // The picker's surface is lazy for the same reason the two above are: the panel's initial bundle
  // is measured from the eager references in the built index, and nothing eager may import it.
  { path: 'picker', loadComponent: () => import('./page-picker.component').then((m) => m.PagePickerComponent) },
  { path: 'image-budget', loadComponent: () => import('./image-budget').then((m) => m.imageBudget as any) },
  // The M028 SC4 surface: the ordered after-render chain, or the state that names its absence.
  // Lazy for the same reason as the three above it — the panel's eager bundle is measured.
  { path: 'after-render', loadComponent: () => import('./after-render').then((m) => m.afterRenderPanel as any) },
  // The M029 SC4 surface: the sanitizer finding from a fact list, or the state that names the
  // absence it renders. Lazy for the same reason as the five above it — the panel's eager bundle is
  // measured, and its eager graph is unchanged by this route.
  { path: 'sanitizer', loadComponent: () => import('./panel-sanitizer').then((m) => m.sanitizerPanel as any) },
  // The M030 SC4 surface: the walked redirect chain, or the state that names its absence.
  // Lazy for the same reason as the surfaces above it — the panel's eager bundle is measured.
  { path: 'redirect', loadComponent: () => import('./panel-redirect').then((m) => m.redirectPanel as any) },
];
