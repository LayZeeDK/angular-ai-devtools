import { Component } from '@angular/core';

import { LegacyModule } from './legacy-module';

/**
 * M034 measurement fixture.
 *
 * A routed page that imports the flagged module so the compiler sees the
 * construct. Nothing on this page reads a legacy signal; the page exists to
 * give the construct a route and a render.
 */
@Component({
  selector: 'app-legacy-module-page',
  imports: [LegacyModule],
  template: `<h2 id="legacy-module-heading">legacy module</h2>`,
})
export class LegacyModulePage {}
