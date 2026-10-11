# Angular dev app verification map

The feature files live in one place: `.claude/skills/control-angular-dev-app/features/`. This index points
there so the map has one owner; maintain it through `/maintain-verification-skill` naming
`control-angular-dev-app`. Baseline preconditions, driving conventions, proof rules and the feature entry
contract are in [that README](../../control-angular-dev-app/features/README.md).

## Features

- [Counter](../../control-angular-dev-app/features/counter.md): render, increment (mouse and keyboard),
  signal graph, effect, OnPush default.
- [Portal navigation](../../control-angular-dev-app/features/portal-navigation.md): home tiles, sidebar,
  router state, deep links, not-found page.
- [Portal contracts](../../control-angular-dev-app/features/portal-contracts.md): list, details, customer
  link, edit and save, create and save.
- [Portal claims](../../control-angular-dev-app/features/portal-claims.md): list, details, create form.
- [Portal complaints and customers](../../control-angular-dev-app/features/portal-complaints-customers.md):
  both lists, complaint details, complaint create and save, customer details.

An app attached with `--url` has no map entry until someone writes one in the control skill's `features/`.
