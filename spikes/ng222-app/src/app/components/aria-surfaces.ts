import { Component, OnDestroy, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';
import { Listbox, Option } from '@angular/aria/listbox';
import { Tabs, TabList, Tab, TabPanel } from '@angular/aria/tabs';
import { Menu, MenuTrigger, MenuItem } from '@angular/aria/menu';
import { listboxItems, menuItems } from './aria-items';

@Component({
  selector: 'app-aria-surfaces',
  imports: [
    MatButton,
    Listbox,
    Option,
    Tabs,
    TabList,
    Tab,
    TabPanel,
    Menu,
    MenuTrigger,
    MenuItem,
  ],
  template: `
    <section class="aria-surfaces">
      <ul id="components-listbox" ngListbox aria-label="Components listbox" focusMode="activedescendant">
        @for (item of listboxItems; track item) {
          <li ngOption [value]="item" [label]="item">{{ item }}</li>
        }
      </ul>

      <div ngTabs>
        <ul ngTabList aria-label="Components tabs">
          @for (item of tabItems; track item) {
            <li ngTab [value]="item">{{ item }}</li>
          }
        </ul>
        @for (item of tabItems; track item) {
          <div ngTabPanel [value]="item">{{ item }} panel</div>
        }
      </div>

      <button matButton ngMenuTrigger [menu]="menu" aria-label="Open components menu" aria-controls="components-menu">
        Menu
      </button>
      <div ngMenu #menu="ngMenu" id="components-menu" aria-label="Components menu">
        @for (item of menuItems; track item) {
          <div ngMenuItem [value]="item">{{ item }}</div>
        }
      </div>

      <button matButton (click)="openOverlay()" aria-label="Open overlay">Overlay</button>
      <ng-template #overlayTpl>
        <div class="overlay-panel">Overlay content</div>
      </ng-template>
    </section>
  `,
})
export class AriaSurfaces implements OnDestroy {
  readonly listboxItems = listboxItems;
  readonly menuItems = menuItems;
  readonly tabItems = ['One', 'Two', 'Three'];

  @ViewChild('overlayTpl') overlayTpl!: TemplateRef<unknown>;

  private overlayRef?: OverlayRef;

  constructor(
    private readonly overlay: Overlay,
    private readonly viewContainerRef: ViewContainerRef,
  ) {}

  openOverlay(): void {
    if (this.overlayRef) {
      return;
    }
    this.overlayRef = this.overlay.create({ hasBackdrop: false });
    this.overlayRef.attach(new TemplatePortal(this.overlayTpl, this.viewContainerRef));
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }
}
