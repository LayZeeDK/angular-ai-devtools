#!/usr/bin/env node
import fs from 'node:fs';
import { buildDigest } from './image-digest.mjs';

const outPath = process.argv[2] || 'extension/image-digest.json';
const data = { version: '22.2.x', entries: buildDigest() };
fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n');
console.log('wrote', data.entries.length, 'entries to', outPath);
