import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UNMATCHED_ROUTE_PATH } from './router-lint';

/**
 * M033 measurement fixture.
 *
 * The component is a normal routed page; on init it asks the router to navigate
 * to a path that is not in the route table. That navigation fails at runtime and
 * the router reports it to the page's console, which is what this milestone
 * measures.
 */
@Component({
  selector: 'app-router-lint-page',
  template: `<h2 id="router-lint-heading">router lint</h2>`,
})
export class RouterLintPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    void this.router.navigateByUrl(UNMATCHED_ROUTE_PATH);
  }
}
