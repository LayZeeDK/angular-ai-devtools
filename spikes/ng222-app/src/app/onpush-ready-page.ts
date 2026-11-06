import { Component } from '@angular/core';

import { DeclaredDefault, OnPushReady } from './onpush-ready';

/**
 * M035 measurement fixture page.
 *
 * Hosts the fixture's declared strategy subjects so a capture can reach them in
 * the live DOM. The fixture's default-strategy subject proper, `Counter`, is
 * rendered by the root component on every route, so this page yields all three
 * defs at the same instant.
 */
@Component({
  selector: 'app-onpush-ready-page',
  imports: [OnPushReady, DeclaredDefault],
  template: `<h2 id="onpush-ready-heading">onpush ready</h2>
    <app-onpush-ready label="page" />
    <app-declared-default label="page" />`,
})
export class OnPushReadyPage {}
