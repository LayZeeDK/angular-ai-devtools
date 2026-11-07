import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { bridge } from './sidecar-deps-bridge.mjs';

const cwd = process.cwd();

if (existsSync(join(cwd, 'node_modules'))) {
  process.exit(0);
}

let commonDir;

try {
  commonDir = execFileSync('git', ['rev-parse', '--git-common-dir'], {
    cwd,
    encoding: 'utf8',
  }).trim();
} catch {
  process.exit(0);
}

const gitDir = resolve(cwd, commonDir);
const primary = dirname(gitDir);

if (
  !existsSync(join(primary, 'package.json')) ||
  !existsSync(join(primary, 'node_modules'))
) {
  process.exit(0);
}

bridge(cwd, primary);

const FIXTURE = ['spikes', 'ng222-app'];
const fixturePrimary = join(primary, ...FIXTURE);
const fixtureSidecar = join(cwd, ...FIXTURE);

if (
  existsSync(join(fixturePrimary, 'package.json')) &&
  existsSync(join(fixturePrimary, 'node_modules')) &&
  !existsSync(join(fixtureSidecar, 'node_modules'))
) {
  mkdirSync(fixtureSidecar, { recursive: true });
  // A copy, not a bridge: the fixture's own resolution is what several suites measure, and a
  // junction would make every path below it resolve into the primary checkout instead.
  cpSync(
    join(fixturePrimary, 'node_modules'),
    join(fixtureSidecar, 'node_modules'),
    {
      recursive: true,
      dereference: false,
    },
  );
}
