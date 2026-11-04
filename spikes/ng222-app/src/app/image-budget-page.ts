import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-image-budget-page',
  imports: [NgOptimizedImage],
  template: `<img ngSrc="https://placehold.co/400x300" width="400" height="300" sizes="100px" alt="image budget" />`,
})
export class ImageBudgetPage {}
