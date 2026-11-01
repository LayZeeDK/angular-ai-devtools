import { Routes } from '@angular/router';
import { StaleViewFixture } from './stale-view-fixture';
import { StaleViewDeferredFixture } from './stale-view-deferred-fixture';

export const routes: Routes = [
  { path: 'stale-view', component: StaleViewFixture },
  { path: 'stale-view-deferred', component: StaleViewDeferredFixture },
];