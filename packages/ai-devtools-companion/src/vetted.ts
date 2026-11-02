/**
 * The vetted symbol table: executable code, not data.
 *
 * A data file can only carry names, and a name reduces the panel to exactly the Tier-1 token-name
 * matching S16 recorded as degraded. Each symbol is therefore imported as a real class value, so
 * the entry carries class identity and the page realm can compare provider records against it
 * with `===` (SYNTHESIS.md decision 8).
 */
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import type { Facade } from './facade.js';

/** The package's own version string, and the accepted vocabulary's version key. */
export const PACKAGE_VERSION = '0.2202.0';

/**
 * The Angular version this table was vetted against: the copy the identity comparison actually
 * meets in the fixture, and the only version measured at this head.
 */
export const VETTED_ANGULAR_VERSION = '22.2.2';

/**
 * The table entry's value. Exactly two symbols this milestone and no others — `Router` from
 * `@angular/router` and `Meta` from `@angular/platform-browser` — carried as the class objects the
 * extracting imports returned, at module scope and with no `forwardRef` (that identifier is the
 * one this builder marks pure and would drop).
 */
export const facade = {
  version: PACKAGE_VERSION,
  '@angular/platform-browser': { Meta },
  '@angular/router': { Router },
} as const satisfies Facade;
