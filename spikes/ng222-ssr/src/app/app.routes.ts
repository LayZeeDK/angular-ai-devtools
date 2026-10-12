import { Routes } from '@angular/router';
import { Page } from './page';

export const routes: Routes = [
  { path: '', component: Page, data: { mode: 'server' } },
  { path: 'prerender', component: Page, data: { mode: 'prerender' } },
  { path: 'client', component: Page, data: { mode: 'client' } },
];
