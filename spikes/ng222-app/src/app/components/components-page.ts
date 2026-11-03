import { Component } from '@angular/core';
import { HarnessProbe } from './harness-probe';

@Component({
  selector: 'app-components-page',
  imports: [HarnessProbe],
  template: `
    <app-harness-probe id="probe-a" class="harness-probe" data-probe="host">
      <span class="projected">projected content</span>
    </app-harness-probe>
    <app-harness-probe id="probe-b" class="harness-probe" data-probe="host">
      <span class="projected">projected content</span>
    </app-harness-probe>
    <span class="projected">projected content</span>
  `,
})
export class ComponentsPage {}
