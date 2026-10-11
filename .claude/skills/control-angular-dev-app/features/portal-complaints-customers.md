# Portal complaints and customers

Users list complaints (type, customer, date, description) and create one; they list customers (name, phone,
email, address) and open a customer's details, which contract details also link to. Data comes from
`http://localhost:3000/api/complaints` and `/api/customers`.

## Sub-features

- `complaint-list` columns Type, Customer, Date, Description.
- `complaint-create` `/complaint/create` (route and sidebar entry exist; not driven yet).
- `complaint-details` `/complaint/<id>/details` (not driven yet).
- `customer-list` columns First name, Last name, Phone, Email, Street, City, State, Zip.
- `customer-details` `/customer/<id>/details`, reached from the list or from a contract's customer link.

## How to get to it (user POV)

- Home tiles `Complaints` and `Customers`; sidebar Complaint `List`/`Create`, Customer `List`.
- The customer link on contract details.
- Deep links `/complaint/list`, `/complaint/create`, `/customer/list`, `/customer/<id>/details`.

## Driving it with control-angular-dev-app

Preconditions:

- Portal healthy; page on `/home`.

- **Complaints.** `playwright-cli -s=<session> click "getByRole('link', { name: 'Complaints' })"`, wait for
  `**/complaint/list` and a table row; snapshot shows `heading "Complaints"` and the four headers.
- **Customers.** Same with `Customers` and `**/customer/list`; eight headers.
- **Customer from contract.** On contract details, `playwright-cli -s=<session> click "getByRole('link', {
  name: '<customer name from the snapshot>' })"`; the URL matches `/customer/.+/details`.
- **API.** `playwright-cli -s=<session> requests` shows `GET http://localhost:3000/api/customers`.
- **Proof.** Snapshots and `screenshot --filename=<evidenceDir>/customers.png`.

## Gotchas

- Customer names are random per API start; read the name from the snapshot right before clicking.
- The customer list's signal graph is the largest per component on the portal (80 nodes measured in
  research/05-spikes.md); query one signal with `dependenciesOf` instead of dumping the graph.
