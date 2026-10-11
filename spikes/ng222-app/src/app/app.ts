import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Counter } from './counter';

@Component({
  imports: [RouterOutlet, Counter],
  selector: 'app-root',
  template: `<app-counter title="Clicks" /><router-outlet />`,
})
export class App {}
