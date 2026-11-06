import { NgModule } from '@angular/core';

/**
 * M034 measurement fixture.
 *
 * An NgModule that uses `module.id` as its id — the anti-pattern Angular's
 * compiler flags as NG6100. The warning is a compile-time diagnostic; whether
 * anything reaches the page console is what this milestone measures.
 *
 * `module` is a real binding here rather than a `declare`: a declared name has
 * no runtime value, and the browser bundle threw `ReferenceError: module is not
 * defined` before the application could bootstrap. The source still spells
 * `module.id`, which is what the compiler flags.
 */
const module = { id: 'legacy-module' };

@NgModule({ id: module.id })
export class LegacyModule {}
