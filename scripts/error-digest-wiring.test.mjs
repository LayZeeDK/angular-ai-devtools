import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const projectPath = join(
  here,
  '..',
  'apps',
  'angular-ai-devtools',
  'project.json',
);

test('build-extension depends on generate-error-digest', () => {
  const project = JSON.parse(readFileSync(projectPath, 'utf8'));
  const buildExtension = project.targets['build-extension'];
  assert.ok(buildExtension, 'build-extension target exists');
  const dependsOn = Array.isArray(buildExtension.dependsOn)
    ? buildExtension.dependsOn
    : buildExtension.dependsOn
      ? [buildExtension.dependsOn]
      : [];
  assert.ok(
    dependsOn.includes('generate-error-digest'),
    'build-extension must depend on generate-error-digest',
  );
});

test('generate-error-digest target runs the generator via nx:run-commands', () => {
  const project = JSON.parse(readFileSync(projectPath, 'utf8'));
  const target = project.targets['generate-error-digest'];
  assert.ok(target, 'generate-error-digest target exists');
  assert.equal(target.executor, 'nx:run-commands');
  const command =
    target.options?.command ??
    (Array.isArray(target.options?.commands)
      ? target.options.commands
          .map((c) => (typeof c === 'string' ? c : c.command))
          .join(' ')
      : '');
  assert.match(command, /generate-error-digest\.mjs/);
});

test('build target is unchanged (still @angular/build:application)', () => {
  const project = JSON.parse(readFileSync(projectPath, 'utf8'));
  assert.equal(project.targets.build.executor, '@angular/build:application');
});
