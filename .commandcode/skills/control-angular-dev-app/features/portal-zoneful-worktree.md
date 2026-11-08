# Zoneful portal worktree

The Insurance Portal checkout at
`D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools` is mid-migration to zoneless
Angular, so the zone-sensitive joins cannot be proven there. The verification target for those claims is an
isolated git worktree of the **zoneful** version, pinned to a recorded commit and served on its own derived
port: the same portal a user sees (fixed header, feature-flagged sidebar, lazy domain routes), running
change detection through `NgZone` rather than the zoneless scheduler.

## Sub-features

- `zoneful-path` the worktree folder
  `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools-zoneful` (outside this
  repository), an isolated worktree of the portal repository.
- `zoneful-commit` the pin: `git -C <path> rev-parse HEAD` prints
  `976752389c22bb563d2278c2d78f423cb2505669`.
- `zoneful-port` the app on its derived port 4509 (slot 9: `4500 + slot`), the API on the fixed 3000.
- `zoneful-angular` Angular 20.3.35 installed (`package.json` asks `@angular/core ^20.3.29`), `zone.js
^0.16.2` installed, and the build polyfills `["zone.js"]`
  (`apps/insurance-portal/project.json`).
- `zoneful-bootstrap` `apps/insurance-portal/src/app/app.config.ts` names no change-detection provider, so the
  default zone-based `NgZone`/`NgZoneChangeDetectionScheduler`/`ZoneStablePendingTask` records apply.
- `zoneful-zone-backed` the proof that it is zone-backed, not just polyfilled: the root environment injector's
  last `NgZone` provider record is a `useFactory` record (not `useClass NoopNgZone`), and a zone-hosted
  `setTimeout` ticked `applicationRef._tick` twice where a `Zone.root` timeout ticked it zero times.

## How to get to it (user POV)

- Open `http://localhost:4509/`: the portal redirects to `/home` and shows the `Home` heading and the four
  domain tiles, exactly as [Portal navigation](./portal-navigation.md) describes.
- The sidebar, contract, claim, complaint and customer pages are the ones the other portal features drive;
  nothing about the app changes here — only the Angular version and the change-detection mode do.
- There is no in-app way to tell zoneful from zoneless: `Zone` is defined on both (the zoneless portal also
  loads zone.js). The difference is read from the injector, not from the screen.

## Driving it with control-angular-dev-app

Preconditions:

- The worktree exists at the path above and is pinned: `git -C <path> rev-parse HEAD` prints the commit.
- Servable on its own ports: `node $S up --target portal --dir <path>` starts the API first on 3000 and then
  the app on its derived port; the run's own header line is
  `> nx run insurance-portal:serve:development --port=4509` (`<evidenceDir>/app.log`).
- `node $S doctor --target portal` exits 0 on the portal origin.

- **Pin.** `git -C D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools-zoneful
rev-parse HEAD` prints `976752389c22bb563d2278c2d78f423cb2505669`; `node $S info --json` prints `slot: 9` and
  `ports` naming `app 4509` (derived) and `api 3000` (fixed).
- **Angular version.** `node $S doctor` prints the `angular-root` line with `20.3.35`, and the
  `change-detection-mode` line reads
  `zone-based (NgZone provider: NgZone); zone.js loaded; mark_feature_usage: ...`. `NgZone` there is the
  `useFactory` record (a `useClass: NoopNgZone` record reads `zoneless`) — that is the whole check, since a
  zoneless app also loads zone.js.
- **The record behind it.** `playwright-cli -s=<session> --raw eval "() => __ngc.injectors(document.querySelector('ng-journal-root'))"`
  resolves the path and `--raw eval "() => __ngc.providers(document.querySelector('ng-journal-root'), <i>)"` on
  the environment injector prints, in one record list, `ChangeDetectionScheduler` `useExisting
ChangeDetectionSchedulerImpl`, an `NgZone` `useClass fn:NoopNgZone` record, and last the `NgZone`
  `useFactory fn:ngZoneFactory` record beside `NgZoneChangeDetectionScheduler` and `ZoneStablePendingTask`.
  The last `NgZone` record is the app's, which is why the doctor reads the last one
  (`research/raw/zone-mode-portal-zonejs.json` is one such capture).
- **Zone-backed behaviour.** The record taken for this pin on 2026-11-08 (in `features/.proven.json`): a
  `setTimeout` scheduled inside the Angular zone ticked `applicationRef._tick` 2 times, one scheduled inside
  `Zone.root` ticked it 0 times. That capture has no one-line recipe yet; re-take it with the same method —
  read the app's `ApplicationRef` from the session, count its `_tick` under a zone-hosted and then a
  `Zone.root` timeout — and record both counts, since proof needs a second capture before a verdict counts
  (map: "Proof and skip reporting").
- **Then drive the feature.** Run the recipe in the portal feature that made you come here
  (`portal-navigation`, `portal-contracts`, `portal-claims`, `portal-complaints-customers`), on this instance.
- **Proof.** A before and after snapshot, one screenshot with the header "Insurance Portal" visible, the
  `change-detection-mode` line, and `<evidenceDir>/app.log` showing the port-4509 serve line.

## Gotchas

- The API port is fixed at 3000, so a zoneful instance and the main checkout's portal cannot run at the same
  time; run the baseline and the change one after the other.
- The derived port comes from the folder hash, not from a pin: another worktree of the portal takes another
  slot, and a busy 4509 moves the run to the next slot (`info --json` prints the slot and ports actually
  used). Read them from `info`, do not assume 4509 after a busy run.
- `--dir` (or `CONTROL_NG_PORTAL_DIR`) is what selects the worktree; without it the skill serves the main
  checkout, whose moving `main` is the zoneless target and answers different `change-detection-mode` text.
- `NgZone` in the doctor line means the record was a `useFactory`, not that the factory name is `NgZone`: the
  helper reports the record's shape, never the factory's identity.
- A worktree session is refused on the main checkout's slots: drive the worktree from its own checkout, or
  attach with `--url` on purpose.
- Re-record this entry when the portal migration completes: the pin, the Angular version and the port all
  change, and the file is the recipe the next recording follows.
