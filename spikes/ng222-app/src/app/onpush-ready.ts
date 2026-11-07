import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

/**
 * M035 measurement fixture.
 *
 * The fixture's strategy subjects. `OnPushReady` declares
 * `ChangeDetectionStrategy.OnPush`; `DeclaredDefault` declares
 * `ChangeDetectionStrategy.Default` explicitly. They exist to be read through
 * `ng.getComponent(el).constructor.ɵcmp`, not to render anything interesting.
 *
 * `DeclaredDefault` is a control, not a second subject: it is the only way to
 * get a component whose compiled def carries a `changeDetection` entry, because
 * the compiler omits the entry when the decorator does not name a strategy.
 * `Counter` — the fixture's existing component that names none — is the
 * default-strategy subject proper.
 */
@Component({
  selector: 'app-onpush-ready',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p id="onpush-ready-label">{{ label() }}</p>`,
})
export class OnPushReady {
  readonly label = input('onpush ready');
}

@Component({
  selector: 'app-declared-default',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `<p id="declared-default-label">{{ label() }}</p>`,
})
export class DeclaredDefault {
  readonly label = input('declared default');
}
