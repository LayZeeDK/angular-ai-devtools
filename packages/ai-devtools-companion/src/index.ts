/**
 * The companion package's entry point: `provideAiDevTools()`.
 *
 * The app installs it in a development-only provider, and its whole effect is the one table entry
 * on `globalThis` — one own string key, no DOM, no prompt, no second global (AR-3, AR-6, N3, N7).
 * The write happens *inside* the provider call under `isDevMode()`, never at module scope: a
 * module-scope side effect is what a bundler is free to reorder, and the guard is what keeps a
 * production build from exposing the table at all (N5).
 */
import { isDevMode, type Provider } from '@angular/core';
import { installFacade } from './facade.js';
import { facade } from './vetted.js';

export { FACADE_KEY, installFacade } from './facade.js';
export type { Facade } from './facade.js';
export { facade, PACKAGE_VERSION, VETTED_ANGULAR_VERSION } from './vetted.js';

/**
 * Installs `globalThis.ngAiDevTools` in a development build and returns no provider records.
 *
 * The return value is an empty provider list on purpose: the entry *is* the contract with the
 * panel, and a DI record would be a second contract inside someone else's build. First-write-wins
 * makes a second install a no-op (E5).
 */
export function provideAiDevTools(): Provider[] {
  if (isDevMode()) {
    installFacade(facade);
  }
  return [];
}
