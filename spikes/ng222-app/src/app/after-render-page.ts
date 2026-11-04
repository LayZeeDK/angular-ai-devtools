import { Component, ElementRef, afterNextRender, viewChild } from '@angular/core';

@Component({
  selector: 'app-after-render-page',
  standalone: true,
  template: `<div #target></div>`,
})
export class AfterRenderPage {
  private readonly target = viewChild.required<ElementRef<HTMLElement>>('target');

  constructor() {
    afterNextRender(() => {
      this.readTargetWidth();
    });
  }

  /** Resolves the fixture's child element and reads its laid-out width. */
  readTargetWidth(): number {
    const el = this.target().nativeElement;
    return el.offsetWidth;
  }
}
