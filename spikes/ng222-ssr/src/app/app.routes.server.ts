import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'prerender', renderMode: RenderMode.Prerender },
  { path: 'client', renderMode: RenderMode.Client },
];
