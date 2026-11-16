# Archive — 045-console-read

Milestone: console-read
Shipped: 2026-11-16
Final verdict: all criteria met; project verify passed
Waves: 20  Tasks: 27 done / 27 total  Review cycles used: 1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| The panel reports one finding per captured console diagnostic, naming the diagnostic's own text and the code it carries, without inventing a code for a message that has none. | met | extension/console-join.js`, `scripts/console-join.test.mjs |
| A diagnostic whose code the digest carries is reported with that entry's title, and the join is proven against the shipped `extension/error-digest.json` rather than a fixture. | met | apps/angular-ai-devtools/src/app/panel-console.ts`, `scripts/console-panel-render.test.mjs |
| A diagnostic whose code the digest does not carry reports the absence by name — the code, or the fact that the message carried no code — instead of a count, an empty cell, or a remedy. | met | extension/console-join.js` `REASONS`, `scripts/console-panel-render.test.mjs |
| A page that captured nothing reports that it captured nothing, distinguished from a capture that produced diagnostics the digest has no entries for. | met | apps/angular-ai-devtools/src/app/panel-console.ts` sentence registry, `.project/tasks/T001-measure-the-capture-and-the-digest.md |
| The surface renders only what the capture states: no cause, no element, no fix, and no "angular" attribution that the message text does not carry. | met | scripts/console-panel-render.test.mjs` prohibition pins |

## Contents

- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- plan/build-recovery-11de634b21b7d3563e8a1187fce8258aa402558c/review/VERIFICATION.json
- plan/build-recovery-11de634b21b7d3563e8a1187fce8258aa402558c/review/wave-1.cycle5.md
- plan/build-recovery-11de634b21b7d3563e8a1187fce8258aa402558c/review/wave-2.cycle3.md
- plan/build-recovery-11de634b21b7d3563e8a1187fce8258aa402558c/review/wave-3.cycle5.md
- plan/build-recovery-11de634b21b7d3563e8a1187fce8258aa402558c/review/wave-5.cycle5.md
- plan/build-recovery-1214817ae8fdc27dc94070dbf5ca0519e19405f1/review/VERIFICATION.json
- plan/build-recovery-1214817ae8fdc27dc94070dbf5ca0519e19405f1/review/wave-1.cycle5.md
- plan/build-recovery-1214817ae8fdc27dc94070dbf5ca0519e19405f1/review/wave-2.cycle3.md
- plan/build-recovery-1214817ae8fdc27dc94070dbf5ca0519e19405f1/review/wave-3.cycle5.md
- plan/build-recovery-1214817ae8fdc27dc94070dbf5ca0519e19405f1/review/wave-5.cycle5.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/VERIFICATION.json
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-1.cycle6.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-10.cycle1.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-11.cycle1.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-12.cycle1.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-13.cycle1.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-14.cycle1.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-15.cycle1.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-16.cycle1.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-17.cycle1.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-2.cycle6.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-3.cycle6.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-4.cycle1.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-5.cycle6.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-6.cycle1.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-7.cycle1.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-8.cycle1.md
- plan/build-recovery-305199c390190a061f26e0e6f046195d8f7d6a63/review/wave-9.cycle1.md
- plan/build-recovery-400f2f85cbf5746bc7334bfbef84a7df2f4b5719/review/VERIFICATION.json
- plan/build-recovery-400f2f85cbf5746bc7334bfbef84a7df2f4b5719/review/wave-1.cycle1.md
- plan/build-recovery-400f2f85cbf5746bc7334bfbef84a7df2f4b5719/review/wave-1.cycle2.md
- plan/build-recovery-400f2f85cbf5746bc7334bfbef84a7df2f4b5719/review/wave-2.cycle1.md
- plan/build-recovery-400f2f85cbf5746bc7334bfbef84a7df2f4b5719/review/wave-3.cycle1.md
- plan/build-recovery-400f2f85cbf5746bc7334bfbef84a7df2f4b5719/review/wave-3.cycle2.md
- plan/build-recovery-400f2f85cbf5746bc7334bfbef84a7df2f4b5719/review/wave-4.cycle1.md
- plan/build-recovery-400f2f85cbf5746bc7334bfbef84a7df2f4b5719/review/wave-4.cycle2.md
- plan/build-recovery-400f2f85cbf5746bc7334bfbef84a7df2f4b5719/review/wave-5.cycle1.md
- plan/build-recovery-400f2f85cbf5746bc7334bfbef84a7df2f4b5719/review/wave-5.cycle2.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/VERIFICATION.json
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-1.cycle6.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-10.cycle2.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-11.cycle1.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-12.cycle1.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-13.cycle1.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-14.cycle2.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-15.cycle1.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-16.cycle1.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-17.cycle2.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-18.cycle1.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-19.cycle1.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-2.cycle6.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-3.cycle6.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-4.cycle1.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-5.cycle6.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-6.cycle1.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-7.cycle1.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-8.cycle1.md
- plan/build-recovery-41081992278cc68ba5ec4a4ccfdfcad73aad8dac/review/wave-9.cycle1.md
- plan/build-recovery-6a5382c771b6f091004b5991f18b8185360a2eb2/review/VERIFICATION.json
- plan/build-recovery-6a5382c771b6f091004b5991f18b8185360a2eb2/review/wave-1.cycle3.md
- plan/build-recovery-6a5382c771b6f091004b5991f18b8185360a2eb2/review/wave-1.cycle4.md
- plan/build-recovery-6a5382c771b6f091004b5991f18b8185360a2eb2/review/wave-2.cycle2.md
- plan/build-recovery-6a5382c771b6f091004b5991f18b8185360a2eb2/review/wave-3.cycle3.md
- plan/build-recovery-6a5382c771b6f091004b5991f18b8185360a2eb2/review/wave-3.cycle4.md
- plan/build-recovery-6a5382c771b6f091004b5991f18b8185360a2eb2/review/wave-4.cycle3.md
- plan/build-recovery-6a5382c771b6f091004b5991f18b8185360a2eb2/review/wave-5.cycle3.md
- plan/build-recovery-6a5382c771b6f091004b5991f18b8185360a2eb2/review/wave-5.cycle4.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/VERIFICATION.json
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-1.cycle6.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-10.cycle1.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-11.cycle1.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-12.cycle1.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-13.cycle1.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-14.cycle1.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-15.cycle1.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-16.cycle1.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-17.cycle1.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-2.cycle6.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-3.cycle6.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-4.cycle1.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-5.cycle6.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-6.cycle1.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-7.cycle1.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-8.cycle1.md
- plan/build-recovery-6bb35b212f97502f8b50e4886b20e19ab994e1d6/review/wave-9.cycle1.md
- plan/build-recovery-9a11c57c997a21f93f778a251637dad9ef9e0039/review/VERIFICATION.json
- plan/build-recovery-9a11c57c997a21f93f778a251637dad9ef9e0039/review/wave-1.cycle3.md
- plan/build-recovery-9a11c57c997a21f93f778a251637dad9ef9e0039/review/wave-1.cycle4.md
- plan/build-recovery-9a11c57c997a21f93f778a251637dad9ef9e0039/review/wave-2.cycle2.md
- plan/build-recovery-9a11c57c997a21f93f778a251637dad9ef9e0039/review/wave-3.cycle3.md
- plan/build-recovery-9a11c57c997a21f93f778a251637dad9ef9e0039/review/wave-3.cycle4.md
- plan/build-recovery-9a11c57c997a21f93f778a251637dad9ef9e0039/review/wave-4.cycle3.md
- plan/build-recovery-9a11c57c997a21f93f778a251637dad9ef9e0039/review/wave-5.cycle3.md
- plan/build-recovery-9a11c57c997a21f93f778a251637dad9ef9e0039/review/wave-5.cycle4.md
- plan/build-recovery-a1ec01920766dffa02e5fec9c03c00e240ada1e8/review/VERIFICATION.json
- plan/build-recovery-a1ec01920766dffa02e5fec9c03c00e240ada1e8/review/wave-1.cycle5.md
- plan/build-recovery-a1ec01920766dffa02e5fec9c03c00e240ada1e8/review/wave-2.cycle3.md
- plan/build-recovery-a315fa5e6a7c0b5ff0c8f3218d64e4de8c063f86/review/wave-1.cycle1.md
- plan/build-recovery-a315fa5e6a7c0b5ff0c8f3218d64e4de8c063f86/review/wave-2.cycle1.md
- plan/build-recovery-a315fa5e6a7c0b5ff0c8f3218d64e4de8c063f86/review/wave-3.cycle1.md
- plan/build-recovery-a315fa5e6a7c0b5ff0c8f3218d64e4de8c063f86/review/wave-4.cycle1.md
- plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/VERIFICATION.json
- plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/wave-1.cycle1.md
- plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/wave-1.cycle2.md
- plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/wave-1.cycle3.md
- plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/wave-2.cycle1.md
- plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/wave-3.cycle1.md
- plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/wave-3.cycle2.md
- plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/wave-3.cycle3.md
- plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/wave-4.cycle1.md
- plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/wave-4.cycle2.md
- plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/wave-4.cycle3.md
- plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/wave-5.cycle1.md
- plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/wave-5.cycle2.md
- plan/build-recovery-b0bab4463b77872a5eaaa9799928ea488e16d384/review/wave-5.cycle3.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/SYNTHESIS.md
- research/inspect-inventory.txt
- review/FINAL.md
- review/VERIFICATION.json
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-10.cycle1.md
- review/wave-11.cycle1.md
- review/wave-12.cycle1.md
- review/wave-13.cycle1.md
- review/wave-14.cycle1.md
- review/wave-15.cycle1.md
- review/wave-16.cycle1.md
- review/wave-17.cycle1.md
- review/wave-18.cycle1.md
- review/wave-19.cycle1.md
- review/wave-2.cycle1.md
- review/wave-20.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- review/wave-8.cycle1.md
- review/wave-9.cycle1.md
- tasks/T001-measure-the-capture-and-the-digest.md
- tasks/T002-join-a-captured-diagnostic-to-the-digest-by-code.md
- tasks/T003-render-the-join-and-pin-the-routes-it-adds.md
- tasks/T004-record-the-surface-and-run-the-project-verify.md
- tasks/T005-make-the-gate-agree-with-this-milestones-own-evidence.md
- tasks/T006-stop-the-pin-rule-from-absolving-a-path-that-exists-nowhere.md
- tasks/T007-pin-e7-on-every-state-and-name-the-state-the-pane-was-given.md
- tasks/T008-correct-the-measurement-record-and-pin-that-text-cannot-choose-an-entry.md
- tasks/T009-police-only-the-words-the-pane-writes-itself.md
- tasks/T010-correct-the-control-character-count-and-give-every-number-a-command.md
- tasks/T011-stop-the-tail-suffix-resolution-from-pinning-a-path-that-exists-nowhere.md
- tasks/T012-restore-the-word-the-list-dropped.md
- tasks/T013-pin-the-measurements-to-the-commit-they-were-taken-at.md
- tasks/T014-stop-the-prohibitions-from-being-a-phrase-list.md
- tasks/T015-report-a-case-folded-match-as-the-digest-carries-it.md
- tasks/T016-make-the-counts-a-measurement-at-a-commit-too.md
- tasks/T017-hold-the-record-s-label-vocabulary-to-the-pane.md
- tasks/T018-pin-the-fold-s-exactness-behaviourally.md
- tasks/T019-make-the-pane-s-own-sentences-an-enumerated-registry.md
- tasks/T020-stop-the-log-restating-derived-facts.md
- tasks/T021-stop-the-join-editing-the-captured-text.md
- tasks/T022-make-the-joins-reasons-a-closed-set.md
- tasks/T023-let-the-record-hold-the-case-the-join-can-now-produce.md
- tasks/T024-re-derive-the-two-gate-recordings-our-waves-moved.md
- tasks/T025-state-the-title-only-when-the-row-carries-one.md
- tasks/T026-withdraw-the-two-facts-the-log-still-restates.md
- tasks/T027-withdraw-the-third-instance-the-heading-miscounted.md

## Notes

- none
