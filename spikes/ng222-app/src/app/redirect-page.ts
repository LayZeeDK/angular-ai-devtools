import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  template: `<h2>landing</h2>`,
  standalone: true,
})
export class LandingPage {}

@Component({
  selector: 'app-lazy-page',
  template: `<h2>lazy</h2>`,
  standalone: true,
})
export class LazyPage {}
