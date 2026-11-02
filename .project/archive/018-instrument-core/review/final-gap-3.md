# Gap Review — 3: The extension initial bundle exceeds the 520 kB warning budget

Reviewed HEAD: 9d202988379b9aab10e30dd164ab661702736c1e
Gap verdict: pass
Risk: The extension initial bundle exceeds the 520 kB warning budget
Waves checked: 1, 2, 3, 4

## Checked evidence

- **Check**: read build-extension budget configuration (apps/angular-ai-devtools/project.json:79-90); `set "NODE_ENV=development" && node node_modules/nx/dist/bin/nx.js run angular-ai-devtools:build-extension --skip-nx-cache`
- **Observed**: maximumWarning is 520kb and maximumError is 1mb for the initial bundle. Exit 0; initial total 535.44 kB; warning that the 520.00 kB budget was exceeded by 15.44 kB.
- **Reference**: apps/angular-ai-devtools/project.json:79-90; command output

## Finding

- **Found**: Crossing the 520 kB threshold is a warning (maximumWarning) with a 1 MB error ceiling, so the build exits 0 and the overrun is an advisory to carry forward, not a milestone defect.
- **Fix direction**: none
