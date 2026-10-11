# Portal contracts

Users list insurance contracts in a table, open one to see its details (status chip, policy number, start
date, a link to the customer, phone, email), switch to editing, and create a new contract with a customer,
policy number and start date. Data comes from the API at `http://localhost:3000/api/contracts`.

## Sub-features

- `contract-list` table with columns Policynumber, Status, Insurance Start On, Customer, Phone, Email; 20 rows
  after a fresh API start.
- `contract-details` clicking a row opens `/contract/<id>/details` with heading `Contract Details` and an
  `Edit` button.
- `contract-customer-link` the customer name on details links to `/customer/<id>/details`.
- `contract-edit` `Edit` opens `/contract/<id>/edit` (not driven yet).
- `contract-create` `/contract/create`: Status chip `Pending`, Customer dropdown `Select customer`,
  Policynumber textbox, Insurance Start On date field, `Save` disabled until valid.

## How to get to it (user POV)

- Home tile `Contracts`; sidebar Contract `List` and `Create`.
- Row click in the list; `Edit` on details.
- Deep links `/contract/list`, `/contract/create`, `/contract/<id>/details`, `/contract/<id>/edit`.

## Driving it with control-angular-dev-app

Preconditions:

- Portal healthy (`node $S doctor --target portal` exits 0); page on `/home`.

- **List.** Click the `Contracts` tile (see portal-navigation), wait for rows, then
  `playwright-cli -s=<session> --raw eval "() => document.querySelectorAll('table tbody tr').length"` returns
  `20`; snapshot shows the six column headers.
- **Details.** `playwright-cli -s=<session> click "getByRole('row').nth(1)"`, then `run-code "async page => {
  await page.waitForURL(/\/contract\/.+\/details/); await page.waitForLoadState('networkidle'); return
  page.url(); }"`. Snapshot shows `heading "Contract Details Edit"`, the policy number of the clicked row and
  `link "<customer name>"` with `/url: /customer/<id>/details`.
- **API side effect.** `playwright-cli -s=<session> requests` lists `GET http://localhost:3000/api/contracts/<id>`.
- **Angular state.** `eval "() => __ngc.components()"` on details lists `DetailsComponent`,
  `ContractStatusChipComponent`, `HyperlinkComponent`; `eval "() => __ngc.inspect('ng-journal-details')"`
  shows its inputs (`withComponentInputBinding` passes the route `id`).
- **Create form.** Sidebar Contract `Create`; snapshot shows `combobox "Select customer"`, an unnamed
  `textbox` (Policynumber), an unnamed `combobox` (Insurance Start On) and `button "Save" [disabled]`.
- **Proof.** Snapshots before and after the row click, plus
  `screenshot --filename=<evidenceDir>/contract-details.png`.

## Gotchas

- Rows, names and ids are random per API start; pick rows by position, assert on structure.
- The Policynumber and date fields have no accessible name; use the snapshot ref of the field after the label
  text.
- Saving a contract writes into the API's in-memory store; restart the portal flow (`down`, `up`) to reset.
- Edit and Save were not driven during the proof run; treat them as unverified.
