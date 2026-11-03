import { Routes } from '@angular/router';
import { StaleViewFixture } from './stale-view-fixture';
import { StaleViewDeferredFixture } from './stale-view-deferred-fixture';
import { ComponentsPage } from './components/components-page';

export const routes: Routes = [
  { path: 'stale-view', component: StaleViewFixture },
  { path: 'stale-view-deferred', component: StaleViewDeferredFixture },
  { path: 'components', component: ComponentsPage },
];
