import { Routes } from '@angular/router';
import { StaleViewFixture } from './stale-view-fixture';
import { StaleViewDeferredFixture } from './stale-view-deferred-fixture';
import { ComponentsPage } from './components/components-page';
import { ImageBudgetPage } from './image-budget-page';
import { AfterRenderPage } from './after-render-page';
import { TrustBypassPage } from './trust-bypass-page';

export const routes: Routes = [
  { path: 'stale-view', component: StaleViewFixture },
  { path: 'stale-view-deferred', component: StaleViewDeferredFixture },
  { path: 'components', component: ComponentsPage },
  { path: 'image-budget', component: ImageBudgetPage },
  { path: 'after-render', component: AfterRenderPage },
  { path: 'trust-bypass', component: TrustBypassPage },
];
