import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
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
  bridge(fixtureSidecar, fixturePrimary);
}
