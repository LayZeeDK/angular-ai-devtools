// Sets optimization_guide.on_device.performance_class in a closed browser profile's Local State.
// Usage: node seed-perf-class.mjs <profile-dir> <class>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [dir, cls] = process.argv.slice(2);
const file = join(dir, 'Local State');
const state = JSON.parse(readFileSync(file, 'utf8'));
const before = state.optimization_guide?.on_device?.performance_class;
state.optimization_guide ??= {};
state.optimization_guide.on_device ??= {};
state.optimization_guide.on_device.performance_class = Number(cls);
writeFileSync(file, JSON.stringify(state));
console.log(`performance_class ${before} -> ${cls} in ${file}`);
