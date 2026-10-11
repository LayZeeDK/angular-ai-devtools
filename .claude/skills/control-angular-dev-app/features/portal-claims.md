# Portal claims

Users list insurance claims, open a claim's details, and file a new claim with claim number, date, damage
type, the contract's policy number and a description. Data comes from `http://localhost:3000/api/claims`.

## Sub-features

- `claim-list` table with columns Claim number, Damage Type, Date, Policynumber, Customer.
- `claim-details` row click opens `/claim/<id>/details` (route exists; not driven yet).
- `claim-create` `/claim/create`: Claim Number textbox, Date field prefilled with today, `Select damage type`
  and `Select contract` dropdowns, Description textbox.

## How to get to it (user POV)

- Home tile `Claims`; sidebar Claim `List` and `Create`.
- Deep links `/claim/list`, `/claim/create`, `/claim/<id>/details`.

## Driving it with control-angular-dev-app

Preconditions:

- Portal healthy; page on `/home`.

- **List.** `playwright-cli -s=<session> click "getByRole('link', { name: 'Claims' })"`, wait with
  `run-code "async page => { await page.waitForURL('**/claim/list'); await page.locator('table tbody
  tr').first().waitFor(); return page.url(); }"`. Snapshot shows `heading "Claims"` and the five column
  headers.
- **Signals.** `eval "() => __ngc.signals('ng-journal-list')"` shows `computed:claims -> signal:#state`
  (the facade's state signal) plus the UI library's styling signals.
- **Create form.** Sidebar Claim `Create`; snapshot shows `combobox "Select damage type"`,
  `combobox "Select contract"` and the Date field with today's date.
- **Proof.** Snapshot files and `screenshot --filename=<evidenceDir>/claims.png`.

## Gotchas

- `/claim/create` shows the heading `Complaint Create`: an app bug, measured; report it, do not patch it in the
  map. Assert on the form fields instead of the heading until it is fixed.
- The list component's signal graph is mostly UI-library styling signals; filter by label (`claims`, `#state`).
- Unlabelled textboxes, as in contracts.
