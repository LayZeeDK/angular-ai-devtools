/**
 * The writer half of the companion package: one property assignment, and no Angular import at all.
 *
 * `vetted.ts` builds the table entry out of real Angular class objects; this module is where that
 * value is installed on the app's global object, so the install can be exercised — and proven
 * first-write-wins — without loading a single `@angular/*` module (SYNTHESIS.md decision 2).
 */

/** The one own string key this package adds to `globalThis`; no other name is touched (N3). */
export const FACADE_KEY = 'ngAiDevTools';

/**
 * The table entry's shape: the package's own version string and one record per Angular package,
 * each mapping a vetted symbol name to the class the package imported from that peer.
 */
export interface Facade {
  readonly version: string;
  readonly '@angular/platform-browser': { readonly Meta: unknown };
  readonly '@angular/router': { readonly Router: unknown };
}

declare global {
  // The single property this package owns. A declaration is erased at compile time: it writes
  // nothing at import time, so the only write is the statement inside `installFacade` below.
  var ngAiDevTools: Facade | undefined;
}

/**
 * Installs `facade` as `globalThis.ngAiDevTools` and returns the entry now in place.
 *
 * First write wins: a second install returns the object already there, unchanged and throwing
 * nothing, so a second load is a no-op on the table (E5). A `Symbol.for(...)` key or a second
 * string name is what E4 forbids, so this is the module's only global statement.
 */
export function installFacade(facade: Facade): Facade {
  const existing = globalThis.ngAiDevTools;
  if (existing !== undefined && existing !== null) {
    return existing;
  }
  globalThis.ngAiDevTools = facade;
  return facade;
}
