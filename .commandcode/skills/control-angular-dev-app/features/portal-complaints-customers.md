# Portal complaints and customers

Users list complaints (type, customer, date, description) and create one; they list customers (name, phone,
email, address) and open a customer's details, which contract details also link to. Data comes from
`http://localhost:3000/api/complaints` and `/api/customers`.

## Sub-features

- `complaint-list` columns Type, Customer, Date, Description; 2 seeded rows.
- `complaint-create` `/complaint/create`, heading `Complaint Create`: `Select type` (CustomerService, Sales,
  Payments), `Select customer`, Date prefilled with today, Description; `Save` disabled until valid. Save sends
  `POST /api/complaints` (201), shows a success toast and opens the new complaint's details.
- `complaint-details` row click opens `/complaint/<id>/details`, heading `Complaint Details`, with the customer
  as a link.
- `customer-list` columns First name, Last name, Phone, Email, Street, City, State, Zip; 30 rows.
- `customer-details` `/customer/<id>/details`, heading `Customer Details` (name, email, phone, Address
  block), reached by a row click on the list or from the customer link on contract, claim or complaint
  details.

## How to get to it (user POV)

- Home tiles `Complaints` and `Customers`; sidebar Complaint `List`/`Create`, Customer `List`.
- Row click on either list.
- The customer link on contract, claim and complaint details.
- Deep links `/complaint/list`, `/complaint/create`, `/customer/list`, `/customer/<id>/details`.

## Driving it with control-angular-dev-app

Preconditions:

- Portal healthy; page on `/home`.

- **Complaints.** `playwright-cli -s=<session> click "getByRole('link', { name: 'Complaints' })"`, wait for
  `**/complaint/list` and a table row; snapshot shows `heading "Complaints"` and the four headers.
- **Complaint details.** On the list, `click "getByRole('row').nth(1)"`, wait for
  `/\/complaint\/.+\/details/`; `h1` is `Complaint Details`.
- **Complaint create.** Sidebar Complaint `Create`; `click "getByRole('combobox', { name: 'Select type' })"`
  then `run-code "async page => { await page.getByRole('option').first().click(); }"`; the same for
  `Select customer`; `fill <description textbox ref> "<text>"`; `click "getByRole('button', { name: 'Save'
})"`. The URL becomes `/complaint/<id>/details` and `requests` shows
  `[POST] http://localhost:3000/api/complaints => [201] Created`.
- **Customers.** Same with `Customers` and `**/customer/list`; eight headers, 30 rows; a row click opens
  `/customer/<id>/details`.
- **Customer from contract.** On contract details, `playwright-cli -s=<session> click "getByRole('link', {
name: '<customer name from the snapshot>' })"`; the URL matches `/customer/.+/details`.
- **API.** `playwright-cli -s=<session> requests` shows `GET http://localhost:3000/api/customers`.
- **Proof.** Snapshots and `screenshot --filename=<evidenceDir>/customers.png`.

## Gotchas

- Customer names are random per API start; read the name from the snapshot right before clicking.
- New complaints get a short numeric id (`/complaint/46458/details`); a created complaint lives until the API
  restarts (`down`, `up`).
- The customer list's signal graph is the largest per component on the portal (80 nodes measured in
  research/05-spikes.md); query one signal with `dependenciesOf` instead of dumping the graph.
