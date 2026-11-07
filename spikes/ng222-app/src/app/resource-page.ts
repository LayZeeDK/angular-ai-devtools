import { Component } from '@angular/core';

import { ResourceStates } from './resource-states';

/**
 * M036 measurement fixture — the routed page.
 *
 * Holds nothing itself: it exists so the four resources live in a component of
 * their own, whose element injector is the one the capture reads the signal
 * graph with. The capture reads `<app-resource-states>` rather than this host.
 */
@Component({
  selector: 'app-resource-page',
  imports: [ResourceStates],
  template: `<h2 id="resource-page-heading">resource graph</h2>
    <app-resource-states />`,
})
export class ResourcePage {}
