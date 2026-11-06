# Components

The `/components` page renders `ComponentsPage` (`app-components-page`) with two `app-harness-probe` hosts and an
`app-aria-surfaces` block exposing the Angular Aria listbox, tabs, menu and CDK overlay surfaces.

## Sub-features

- `probe-a` and `probe-b` are the two `app-harness-probe` hosts, each projecting content and exposing an Advance button.
- `aria-listbox` (`#components-listbox`) is the `@angular/aria` listbox surface.
- `aria-tabs` (`ngTabs`) is the tabs surface.
- `aria-menu` (`ngMenu` triggered by `ngMenuTrigger`) is the menu surface.
- `cdk-overlay` is the `@angular/cdk` overlay surface opened by the Overlay button.

## How to get to it (user POV)

- Open `<url>` (`http://localhost:4224/components`). The page is a routed single-page app; `app-root` is the
  Angular root element carrying `ng-version`.
- Interact with the two probe hosts and the four Aria/CDK surfaces.

## Driving it with control-angular-dev-app

Preconditions:

- `node $S up --target components` and `node $S doctor --target components` exit 0 on a fresh page.

- **Probes.** Run `playwright-cli -s=<session> snapshot --filename=<evidenceDir>/components.yml`; it contains
  both `app-harness-probe#probe-a` and `app-harness-probe#probe-b`.
- **Surfaces.** The snapshot names the listbox, tabs, menu trigger and overlay button.
- **Proof.** `playwright-cli -s=<session> screenshot --filename=<evidenceDir>/components.png`.

## Gotchas

- The roles, active descendant and panel wiring the Aria directives render are not asserted here; N23 reads them
  from a live page.
- Two servers share `spikes/ng222-app`'s `.angular` cache with the counter target: one target at a time in a checkout.
