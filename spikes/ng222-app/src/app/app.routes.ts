import { Routes } from '@angular/router';
import { StaleViewFixture } from './stale-view-fixture';
import { StaleViewDeferredFixture } from './stale-view-deferred-fixture';
import { ComponentsPage } from './components/components-page';
import { ImageBudgetPage } from './image-budget-page';
import { AfterRenderPage } from './after-render-page';
import { TrustBypassPage } from './trust-bypass-page';
import { FieldFormPage } from './field-form-page';
import { LintObservabilityPage } from './lint-observability-page';
import { LandingPage, LazyPage } from './redirect-page';
import { redirectGuard } from './redirect-guard';

export const routes: Routes = [
  { path: 'stale-view', component: StaleViewFixture },
  { path: 'stale-view-deferred', component: StaleViewDeferredFixture },
  { path: 'components', component: ComponentsPage },
  { path: 'image-budget', component: ImageBudgetPage },
  { path: 'after-render', component: AfterRenderPage },
  { path: 'trust-bypass', component: TrustBypassPage },
  { path: 'field-form', component: FieldFormPage },
  { path: 'lint-observability', component: LintObservabilityPage },
  { path: 'redirect', redirectTo: 'landing' },
  { path: 'landing', component: LandingPage },
  { path: 'gated', component: LandingPage, canActivate: [redirectGuard] },
  { path: 'lazy', loadChildren: () => import('./redirect-page').then(() => [{ path: '', component: LazyPage }]) },
  { path: 'loop-a', redirectTo: 'loop-b' },
  { path: 'loop-b', redirectTo: 'loop-a' },
];
