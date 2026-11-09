# E3 diagnosis — is `e3-zero-skipped` counting a cache hit, or is a leg skipping?

- **Repository**: `D:\projects\sandbox\angular-ai-devtools`, branch `gsd-path/M041`, HEAD `302fd620870d096c896f236941520e9ab3e340d0`
- **Measured**: 2026-11-09, 08:23–08:56 local (Windows, cmd.exe, node v24.22.0, npm 12.2.0, nx 23.3.0)
- **Machine condition during every measurement below**: an unrelated Stryker run was live the whole
  time — PID 25128 (`stryker run … --concurrency 8`) plus up to eight `node --test` worker processes
  from `D:\projects\stryker-playwright-runner`, and two nx daemons. Ruled in/out in §7.
- **Scope**: read-only. No product code, test, task or STATE file was touched. All captures live in the
  session scratchpad; the only file written in the repo is this one.

## Verdict in one line

Neither the cache nor a skip: **a warm nx cache changes nothing the guard counts (measured, hot and
cold), and no leg is skipping (measured, nested and at the corpus's own depth). The red is a nested
`&&` chain stopping after its first leg — a leg exiting non-zero — and E3 reports that as "too few
pass summary blocks" because its block count is asserted before its exit status and it throws the
nested output away.** That is outcome **2 (environment is wrong)**, with outcome **1 (guard is wrong)
applying to its diagnostics, not to its count**. §5 states the smallest fix.

---

## 1. The counting logic, verbatim

`tests/held-out/e3-zero-skipped.test.mjs` (44 lines, read in full):

```js
test('E3: npm test reports 0 skipped and 0 todo', () => {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  delete env.NODE_TEST_WORKER_ID;
  const result = spawnSync('npm', ['test'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 256,
    timeout: 20 * 60 * 1000,
    shell: true,
    env,
  });
  const output = (result.stdout || '') + '\n' + (result.stderr || '');
  const skippedMatches = [...output.matchAll(/ℹ skipped (\d+)/g)];
  const todoMatches = [...output.matchAll(/ℹ todo (\d+)/g)];
  const passMatches = [...output.matchAll(/ℹ pass (\d+)/g)];
  const totalPass = passMatches.reduce((s, m) => s + Number(m[1]), 0);
  let bad = [];
  for (const m of skippedMatches) {
    if (Number(m[1]) !== 0) bad.push(`skipped ${m[1]}`);
  }
  for (const m of todoMatches) {
    if (Number(m[1]) !== 0) bad.push(`todo ${m[1]}`);
  }
  assert.equal(
    skippedMatches.length + todoMatches.length > 0,
    true,
    'E3: no node --test summary lines found',
  );
  assert.ok(
    passMatches.length >= 3,
    `E3: expected at least 3 pass summary blocks, got ${passMatches.length}`,
  );
  assert.ok(
    totalPass >= 500,
    `E3: expected total pass count >= 500, got ${totalPass}`,
  );
  assert.deepEqual(bad, [], `E3: non-zero skip/todo counts: ${bad.join(', ')}`);
  assert.equal(result.status, 0, `E3: npm test exited ${result.status}`);
});
```

The matched pattern is the **spec reporter's summary line**, `/ℹ pass (\d+)/g`, counted as *blocks*
(one block per nested `node --test` run that finishes and prints its summary). The message is the
literal `E3: expected at least 3 pass summary blocks, got ${passMatches.length}`.

Which legs it expects to find, derived from `package.json:15`:

```
test = node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" "src/**/*.test.ts" "src/**/*.spec.ts"
       && node scripts/run-user-scope-tests.mjs
       && npm run test:skills
       && npm run test:app
       && npm run test:held-out
```

| # | leg | reports `ℹ pass`? | observed block |
|---|-----|-------------------|----------------|
| 1 | `node --test` over scripts/extension/src | **yes** | `ℹ pass 1182` |
| 2 | `run-user-scope-tests.mjs` → `node --test …` (stdio `inherit`) | **yes** | `ℹ pass 60` |
| 3 | `npm run test:skills` → `node --test …` | **yes** | `ℹ pass 628` |
| 4 | `npm run test:app` → `npx nx run angular-ai-devtools:test` → vitest | **no** | 0 |
| 5 | `npm run test:held-out` → `scripts/held-out-corpus.mjs` | **no** (output captured, echoed only on failure; on success it prints `PASS <file> — N test(s)`) | 0 |

So the "at least 3" floor is exactly legs 1–3. The app leg and the held-out leg are assumed to
contribute nothing — and they do contribute nothing, in both cache states (§2.3, §2.4).

### What a *cached* nx target's output looks like versus a fresh one

From the code's own assumptions the app leg is invisible to the guard either way; measured, it is:

**Cached** (`[existing outputs match the cache, left as is]`, `Run duration: 32ms`):

```
> nx run angular-ai-devtools:test  [existing outputs match the cache, left as is]
 ✓ angular-ai-devtools  apps/…/panel-demo.spec.ts (9 tests) 525ms
 Test Files  31 passed (31)
      Tests  345 passed (345)
 NX   Successfully ran target test for project angular-ai-devtools
  Run duration:      32ms
  Cache:             1/1 hit (100%)
Nx read the output from the cache instead of running the command for 1 out of 1 tasks.
```

**Fresh** (`Cache: 0/1 hit (0%)`, `Run duration: 5.8s`) — byte-for-byte the same vitest summary
(`Test Files 31 passed (31)`, `Tests 345 passed (345)`, `Duration 2.32s`), only the timing and the
`Cache:` line differ.

Neither form contains `ℹ pass`. **The app leg never contributed one of the three blocks, so the nx
cache cannot change the count.** The cache saves measured 5.8 s − 32 ms ≈ **5.8 s**, against nested
runs that take 2m32s–17m26s; it is not a minutes-scale lever and it is not a block lever.

## 2. What was run, with output and timings

Every run used the same capture path as E3: spawn with `shell: true`, `encoding: 'utf8'`,
`maxBuffer 256 MB`, `timeout 20 min`, `NODE_TEST_CONTEXT`/`NODE_TEST_WORKER_ID` deleted, output
concatenated as `stdout + '\n' + stderr`. Harness: scratchpad `measure-e3.mjs`.

### 2.0 Two control probes (cheap, and they close two escape hatches)

| probe | result |
|---|---|
| Encoding: does `ℹ` survive a pipe / a `shell:true` (cmd.exe) spawn? | Yes. `ℹ tests 2` arrives as `U+2139` through both paths (`enc-probe.mjs`). No codepage mangling; the regex cannot be defeated by Windows encoding. Active code page is 850, which only affects console *display*, not pipes. |
| Timeout: does `spawnSync({timeout})` return the output produced before the kill? | Yes. A child printing `line one…` + `ℹ pass 1182` then blocking is killed at 5 025 ms with `status: null, signal: 'SIGTERM', error.code: 'ETIMEDOUT'` and `stdout: "line one before the sleep\nℹ pass 1182\n"` retained (`timeout-probe.mjs`). **A timeout cannot silently reduce a completed leg's block to 0.** |

### 2.1 Step 2 — E3 alone, unmodified

```
node --test tests/held-out/e3-zero-skipped.test.mjs
```

Output (its own summary), started 08:24:26, harness exit 08:41:54:

```
✔ E3: npm test reports 0 skipped and 0 todo (1046018.0088ms)
ℹ tests 1 / ℹ suites 0 / ℹ pass 1 / ℹ fail 0 / ℹ cancelled 0 / ℹ skipped 0 / ℹ todo 0
```

**Green.** 1 046 018 ms = **17m 26s** — 87 % of the guard's own 20-minute `spawnSync` budget. (This
run has `HELD_OUT_CORPUS_DEPTH` unset, so its nested `npm test` runs the *whole* corpus, ~10½ min of
which is suite 5; the guard is at 87 % of its rope.)

### 2.2 Step 3a — the nested command, with a warm nx cache

The nested command is `npm test`. Run in the configuration the corpus actually runs E3 in
(`HELD_OUT_CORPUS_DEPTH=1`, which is what `held-out-corpus.mjs:runSuite` sets for its children —
the recorded failures came from a corpus run, T005:149):

```
set HELD_OUT_CORPUS_DEPTH=1 && npm test
```

08:44:01 → 08:47:53 = **3m 52s**. `ℹ pass` blocks, by hand, with their legs:

| block | value | leg |
|---|---|---|
| 1 | `ℹ pass 1182` | leg 1 — `node --test "scripts/**" "extension/**" "src/**/*.test.ts" "src/**/*.spec.ts"` |
| 2 | `ℹ pass 60` | leg 2 — `node scripts/run-user-scope-tests.mjs` |
| 3 | `ℹ pass 628` | leg 3 — `npm run test:skills` |

`ℹ fail 0`, `ℹ skipped 0`, `ℹ todo 0` on all three. Leg 4: `Test Files 31 passed (31)`,
`Tests 345 passed (345)`, **`Cache: 1/1 hit (100%)`**, `Run duration: 32ms`. Leg 5:
`held-out corpus: nested run (HELD_OUT_CORPUS_DEPTH=1) — the outer corpus run owns and reports these
suites, so nothing is re-run here`. Total pass = 1870.

**Nested count = 3, with a 100 % cache hit.**

### 2.3 Step 4 — the decisive measurement, cache defeated

```
set HELD_OUT_CORPUS_DEPTH=1 && npx nx reset && npm test
```

08:48:31 → 08:51:03 = **2m 32s**. Blocks:

| block | value | leg |
|---|---|---|
| 1 | `ℹ pass 1182` | leg 1 |
| 2 | `ℹ pass 60` | leg 2 |
| 3 | `ℹ pass 628` | leg 3 |

Leg 4 executed for real this time — `Test Files 31 passed (31)`, `Tests 345 passed (345)`,
`Duration 2.32s`, `Run duration: 5.8s`, **`Cache: 0/1 hit (0%)`**. Leg 5 short-circuited as above.

**Cold-cache count = 3. The count did not move.** The brief's decisive test therefore returns its
verdict: *E3 is not counting something a cache removes.*

### 2.4 Step 2b — E3 exactly as the corpus spawns it

```
set HELD_OUT_CORPUS_DEPTH=1 && node --experimental-strip-types --test tests/held-out/e3-zero-skipped.test.mjs
```

Started 08:51:12, exit 08:53:28:

```
✔ E3: npm test reports 0 skipped and 0 todo (135986.937ms)
ℹ tests 1 / ℹ pass 1 / ℹ fail 0 / ℹ skipped 0 / ℹ todo 0
```

**Green in 2m 16s** — the same 2–6 minute scale as the recorded failures (2m39s and 5m46s,
T005:149), but passing.

### 2.5 Step 5 — which single leg can produce "got 1", demonstrated

No leg produces a shortfall on its own. So I forced the *shape* instead: made leg 1 exit non-zero
(a `USER_SCOPE_SCRIPTS_DIR` pointed at an empty directory reddens 24 of the leg-1 tests that pin the
user-scope install — `G1..G7 prompt pin`, `health: check() on the real resolved install`,
`E2 helper pin: an absent install or helper dir…`, `D0/D2 dispatch pin`, …):

```
set USER_SCOPE_SCRIPTS_DIR=<empty dir> && set HELD_OUT_CORPUS_DEPTH=1 && npm test
```

08:53:52 → 08:54:43 = **51 s**. Nested output: exactly **one** block — `ℹ tests 1182`, `ℹ pass 1158`,
**`ℹ fail 24`** — and then the tail is the aborted chain:

```
npm notice run test
npm notice run node --experimental-strip-types --test "scripts/**/*.test.mjs" … && node scripts/run-user-scope-tests.mjs && …
```

The `&&` chain stopped; legs 2, 3, 4, 5 never printed anything.

And running E3 against that same leg-1 failure reproduces the reported assertion **exactly**, at
`34:10`, after 55 437 ms:

```
✖ E3: npm test reports 0 skipped and 0 todo (55437.0033ms)
  AssertionError [ERR_ASSERTION]: E3: expected at least 3 pass summary blocks, got 1
      at TestContext.<anonymous> (file:///D:/projects/sandbox/angular-ai-devtools/tests/held-out/e3-zero-skipped.test.mjs:34:10)
```

This is the signature, not a claim about the user's environment: **"got 1" = one leg reported, the
`&&` chain stopped there.** It is the only shape that fits, because

- leg 1's block prints only when leg 1 *finishes* (so a kill during leg 1 gives 0, not 1);
- a kill during leg 2 gives 1, but needs leg 1 to have burned ~20 min (measured today: a whole
  aborted-chain run with leg 1 *included* is 51 s, and a complete green chain is 2m32s–3m52s; the
  recorded failures totalled 2m39s / 5m46s — the cap was never reached);
- a kill during leg 3 gives 2, during leg 4 or 5 gives 3;
- a leg that exits non-zero *after* printing its summary gives that leg's block plus the previous
  ones — so a 1-count means the abort came from a leg that printed nothing at all, i.e. leg 2's
  no-tests path (`run-user-scope-tests.mjs:77-80`, `No user-scope tests found under …`, exit 1, no
  summary) or a leg-1 failure like the one demonstrated above.

### 2.6 The three counts, side by side

| measurement | pass blocks | detail | wall |
|---|---|---|---|
| E3 alone (`node --test …e3-zero-skipped.test.mjs`, unmodified) | **passes** (≥3 required, all other asserts satisfied) | `✔`, `pass 1 / fail 0` | 17m 26s |
| nested `npm test`, `DEPTH=1`, **warm cache** | **3** — `1182`, `60`, `628` | `Cache: 1/1 hit (100%)` | 3m 52s |
| nested `npm test`, `DEPTH=1`, **cold cache** (`npx nx reset`) | **3** — `1182`, `60`, `628` | `Cache: 0/1 hit (0%)`, app leg executed | 2m 32s |
| nested `npm test`, `DEPTH=1`, one leg forced red | 1 — `1182` (with `fail 24`) | chain aborted after leg 1 | 51s |

## 3. Why the recorded failure is not a cache hit and not a skip

1. **Not the cache.** The three blocks come from legs 1–3, all `node --test`; the app leg is vitest
   and emits `Test Files` / `Tests`, never `ℹ pass`, cached or fresh (§2.2, §2.3). Measured directly:
   same 3 blocks at `Cache: 1/1 hit (100%)` and at `Cache: 0/1 hit (0%)`. The earlier hypothesis
   that "a warm cache reddens a gate over a green tree"
   (`.project/archive/035-onpush-readiness/tasks/T006-…md:34`) is falsified by measurement — it
   assumed the app leg contributed a block. It never did. T007's own compensation ("with the cache on
   the inner runs fit inside 20 minutes because the app suite is replayed") is also over-weighted: the
   replay saves **5.8 s**, and the corpus-free inner run it was describing takes 2m32s–3m52s.
2. **Not a skip in the product.** No leg skips. Each is green alone at the nested depth (the recorded
   evidence and my runs agree), the nested chain is green end-to-end at the corpus's own depth
   (§2.4), and `ℹ skipped 0` / `ℹ todo 0` appear in every block in every run above. `ℹ skipped 1`
   was never observed in any capture.
3. **The guard's *count* is right; its *message* is what is wrong.** The guard's real purpose survives
   and is what actually caught this: something in the nested gate is red. But `passMatches.length >= 3`
   fires *before* `assert.equal(result.status, 0, …)`, and E3 keeps none of the nested run's output,
   so a 24-test leg-1 failure and "leg 2 found no tests" are both reported as
   "expected at least 3 pass summary blocks, got 1". That is why this took two sessions to chase
   (`T005:150`: "The failing leg inside that nested invocation could not be observed — E3 echoes only
   its own assertion, never the nested run's output").

## 4. Stryker / unrelated nx workload: ruled in or out?

**Ruled out as the cause; ruled in as a wall-clock risk against the 20-minute cap.**

- Out as the cause: it was live for every run above — including both runs that produced 3 blocks and
  both E3 runs that passed. It cannot remove a summary (the probe in §2.0 shows partial output is
  retained even when a child is killed), and it does not stop a leg from printing.
- The recorded failures are also too *fast* to be cap hits: 2m39s and 5m46s against a 20-minute cap
  (T005:149), and a cap hit would surface as `E3: npm test exited null` (line 43), not as a block
  count.
- In as a risk, separately: E3 standalone burns **17m26s of its 20-minute budget (87 %)** because its
  nested `npm test` runs the entire held-out corpus, which itself re-enters `npm test` through e3 and
  e4 (3m07s and 7m06s in `scratchpad/tail.txt`). Under any extra load that crosses 20 minutes and
  turns into `assert.equal(result.status, 0)` failing with `null` — a different, equally confusing
  message. E4 (two `npm test` + two `npm run check`) has no observed green completion at all
  (T005:151). The recursion is bounded only by `HELD_OUT_CORPUS_DEPTH`, and both e3 and e4 ignore it.

## 5. Recommendation

**Outcome: environment is wrong — with the guard's diagnostics also wrong about it.** Precisely:

- **environment**: the nested `npm test` is a plain `&&` chain over five legs; one leg exiting
  non-zero (or leg 2 finding no test files, `scripts/run-user-scope-tests.mjs:77-80`, which prints no
  summary at all) truncates the chain to a single block. The *setting* implicated is not nx's cache
  and not any output cap: it is the nested run's inherited environment — leg 1 alone contains 24
  tests that read the user-scope install path from `USER_SCOPE_SCRIPTS_DIR` /
  `USER_SCOPE_SCRIPTS_ROOT` / `USER_SCOPE_ROOT` / `RUN_USER_SCOPE_TESTS_ROOT` /
  `RUN_USER_SCOPE_TESTS_DIR` / `RUN_USER_SCOPE_ROOT` (see `run-user-scope-tests.mjs:14-21`), which is
  exactly the class of variable that makes a leg red inside one environment and green in a shell that
  measured it "alone". No such variable was set in this session (`set | findstr /I "USER_SCOPE"` →
  empty), which is why I could not reproduce the red without injecting one.
- **the guard is wrong about *what it says*, not about *what it counts***: it must keep counting, but
  it must report the leg that stopped instead of the block count.

### The smallest change that keeps the guard's real purpose

In `tests/held-out/e3-zero-skipped.test.mjs`, two edits, no threshold widened, no assertion removed:

1. **Assert the exit status first**, with the nested run's tail in the message — so any aborted or
   red leg names itself and its failures:

   ```js
   assert.equal(
     result.status,
     0,
     `E3: npm test exited ${result.status}\n${output.split('\n').slice(-40).join('\n')}`,
   );
   ```

2. **Make the block assertion name the legs that reported**, instead of only the count:

   ```js
   assert.ok(
     passMatches.length >= 3,
     `E3: expected at least 3 pass summary blocks, got ${passMatches.length}; legs announced: ${
       [...output.matchAll(/npm notice run (test[\w:-]*)/g)].map((m) => m[1]).join(', ')
     }`,
   );
   ```

That is the whole guard-preserving fix: the same gate, the same `>= 3`, the same
`totalPass >= 500`, the same zero-skip/zero-todo semantics, but a red now says "exited 1, here are the
24 failures" or "leg 2 announced, produced no summary" instead of "got 1".

The block count needs **no** widening to "also count cached legs" — that was measured and is already
true (3 hot, 3 cold). If it is ever made reporter-proof it should follow
`scripts/held-out-corpus.mjs:summaryCount`, which already accepts both reporters
(`^\s*(?:ℹ|#)?\s*pass\s+(\d+)\s*$`) — E3's `/ℹ pass (\d+)/` is the only place in the repo that
assumes the spec reporter.

**The real fix is structural, and out of scope here** (recorded only): e3 and e4 each re-enter the
whole gate; the corpus already carries a nesting marker (`HELD_OUT_CORPUS_DEPTH`) that both ignore for
their own nested `npm test`. Bounding the inner run — the remedy T007 named — is what removes both the
17m26s/20min squeeze and the fragility, after which the app target can stay uncached
(`nx.json` `@angular/build:unit-test`) without cost.

## 6. What would settle the residual doubt

The failing nested output was never captured, by anyone: E3 discards it. With edit (1) above, the next
red prints the last 40 lines of the nested run and names its cause directly. Until then the open
question is only *which* leg's non-zero exit it was — leg 1 (environment-sensitive install pins, 24 of
them demonstrated) or leg 2 (no user-scope tests found, a silent exit 1) — and both are environmental,
neither is the nx cache, and neither is a skipped test.

## 7. Evidence index (session scratchpad)

| file | what it is |
|---|---|
| `e3-alone-out.txt` | E3 alone, unmodified — `✔`, 1 046 018 ms |
| `nested-depth1-out.txt` | nested `npm test`, `DEPTH=1`, warm cache — 3 blocks, `Cache: 1/1 hit (100%)` |
| `nested-depth1-cold-out.txt` | after `npx nx reset` — 3 blocks, `Cache: 0/1 hit (0%)` |
| `e3-depth1-out.txt` | E3 as the corpus runs it — `✔`, 135 987 ms |
| `nested-leg2-missing-out.txt` | forced leg-1 red — 1 block, `ℹ pass 1158 / ℹ fail 24`, 51 s |
| `e3-tampered-out.txt` | E3 against that red — the reported assertion, verbatim, at `34:10` |
| `timeout-probe.mjs` / output | partial stdout survives a `spawnSync` timeout kill |
| `enc-probe.mjs` / output | `ℹ` survives pipes and `shell:true`; no codepage loss |
| `measure-e3.mjs` | the harness: E3's own spawn options and output concatenation |
| `verify.log`, `tail.txt` | earlier full-gate captures: 3 blocks (`1182`, `60`, `628`), corpus 22/22 in 10m27s, e3 PASS 3m07s **with `Cache: 1/1 hit (100%)`** |
