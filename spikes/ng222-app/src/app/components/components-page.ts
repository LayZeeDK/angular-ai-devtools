import { Component } from '@angular/core';
import { HarnessProbe } from './harness-probe';
import { AriaSurfaces } from './aria-surfaces';

@Component({
  selector: 'app-components-page',
  imports: [HarnessProbe, AriaSurfaces],
  template: `
    <app-harness-probe id="probe-a" class="harness-probe" data-probe="host">
      <span class="projected">projected content</span>
    </app-harness-probe>
    <app-harness-probe id="probe-b" class="harness-probe" data-probe="host">
      <span class="projected">projected content</span>
    </app-harness-probe>
    <span class="projected">projected content</span>
    <app-aria-surfaces></app-aria-surfaces>
  `,
})
export class ComponentsPage {}
