import { Component, signal } from '@angular/core';
import { form, required, min, max, validate } from '@angular/forms/signals';
import { FormField, FormRoot } from '@angular/forms/signals';

/**
 * M031 fixture: a Signal Forms form with two validatable fields (a required `name` and a
 * numeric-range `age`), one cross-field rule, and a submit button whose `disabled` is bound to
 * the form's validity.
 */
@Component({
  selector: 'app-field-form-page',
  imports: [FormField, FormRoot],
  template: `
    <h2>field form</h2>
    <form [formRoot]="fieldForm">
      <label>name <input id="name" [formField]="fieldForm.name" /></label>
      <label>age <input id="age" type="number" [formField]="fieldForm.age" /></label>
      <button type="submit" id="submit" [disabled]="fieldForm().invalid()">submit</button>
    </form>
  `,
  standalone: true,
})
export class FieldFormPage {
  readonly model = signal({ name: '', age: 0 });
  readonly fieldForm = form(this.model, (f) => {
    required(f.name);
    min(f.age, 1);
    max(f.age, 120);
    validate(f, ({ value }) =>
      value().name.length < value().age ? { kind: 'name-too-short-for-age' } : undefined,
    );
  });
}
