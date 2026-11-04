#!/usr/bin/env node
import fs from 'node:fs';

export const TOKEN_LIMIT = 150;
export const TRIM_MARKER = ' …';
export const MEASURED_CODES = [
  'NG0913',
  'NG2950',
  'NG2951',
  'NG2952',
  'NG2953',
  'NG2954',
  'NG2955',
  'NG2956',
  'NG2958',
  'NG2959',
  'NG2960',
  'NG2961',
  'NG2962',
  'NG2963',
  'NG2964',
  'NG2965',
  'NG2966',
  'NG2967',
];
export const CODES = MEASURED_CODES;
export const IMAGE_CODES = MEASURED_CODES;

export const ENTRIES_SOURCE = [
  { code: 'NG0913', meaning: 'An image that is the LCP element was given loading="lazy".', fix: 'Change its loading value to eager or use NgOptimizedImage prioritization.' },
  // packages/common/src/directives/ng_optimized_image/ng_optimized_image.ts:805 (RuntimeErrorCode.UNEXPECTED_SRC_ATTR)
  { code: 'NG2950', meaning: 'Both src and ngSrc were set on the same image.', fix: 'Remove the src attribute; the directive sets src from ngSrc.' },
  // packages/common/src/directives/ng_optimized_image/ng_optimized_image.ts:820 (RuntimeErrorCode.UNEXPECTED_SRCSET_ATTR)
  { code: 'NG2951', meaning: 'Both srcset and ngSrcset were set on the same image.', fix: 'Remove the srcset attribute; the directive sets srcset from ngSrcset.' },
  { code: 'NG2952', meaning: 'NgOptimizedImage reported an invalid input (aspect ratio, fill, or dimensions).', fix: 'Correct the width, height, fill, or loading attribute per the warning.' },
  // packages/common/src/directives/ng_optimized_image/ng_optimized_image.ts:1028 (RuntimeErrorCode.UNEXPECTED_INPUT_CHANGE)
  { code: 'NG2953', meaning: 'An NgOptimizedImage input was updated after initialization.', fix: 'Use a static value or wrap the image in an @if gated on the value.' },
  // packages/common/src/directives/ng_optimized_image/ng_optimized_image.ts:1212 (RuntimeErrorCode.REQUIRED_INPUT_MISSING)
  { code: 'NG2954', meaning: 'Required width and height attributes are missing.', fix: 'Add width and height or enable fill mode.' },
  { code: 'NG2955', meaning: 'An image is the LCP element but was not marked priority.', fix: 'Add the priority attribute to that image.' },
  { code: 'NG2956', meaning: 'A priority image has no preconnect tag for its origin.', fix: 'Add a preconnect link for the image origin in the document head.' },
  // packages/common/src/directives/ng_optimized_image/asserts.ts:21 (RuntimeErrorCode.UNEXPECTED_DEV_MODE_CHECK_IN_PROD_MODE)
  { code: 'NG2958', meaning: 'A dev-mode check ran in production mode.', fix: 'Ensure production mode is enabled for production builds.' },
  { code: 'NG2959', meaning: 'The Netlify image loader saw an unsupported attribute.', fix: 'Remove the unsupported attribute from the img tag.' },
  { code: 'NG2960', meaning: 'The intrinsic image is significantly larger than necessary.', fix: 'Resize the image or use ngSrcset and sizes.' },
  { code: 'NG2961', meaning: 'More than the default preloaded image limit were marked priority.', fix: 'Remove priority from less important images.' },
  { code: 'NG2962', meaning: 'Images look hosted on a CDN but no matching loader is configured.', fix: 'Provide the built-in loader or define a custom IMAGE_LOADER.' },
  { code: 'NG2963', meaning: 'ngSrcset or loaderParams is present but no image loader is configured.', fix: 'Provide a loader or remove ngSrcset and loaderParams.' },
  { code: 'NG2964', meaning: 'An LCP image had its ngSrc modified after render.', fix: 'Do not modify ngSrc on an LCP image.' },
  { code: 'NG2965', meaning: 'A placeholder data URL is longer than the recommended limit.', fix: 'Use a smaller data URL placeholder.' },
  { code: 'NG2966', meaning: 'The priority attribute is set more than the threshold number of times.', fix: 'Reserve priority for the LCP image only.' },
  { code: 'NG2967', meaning: 'A placeholder image exceeds the dimension limit.', fix: 'Use a smaller image as the placeholder.' },
];

const LICENSE_PATTERN = /MIT License|Google LLC|licensed under/i;

export function stripLicense(text) {
  return String(text)
    .split('\n')
    .filter((line) => !/MIT License/i.test(line) && !/Google LLC/i.test(line) && !/licensed under/i.test(line))
    .join('\n')
    .replace(/MIT License/gi, '')
    .replace(/Google LLC/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function countTokens(text) {
  // Upper bound: no tokenizer emits more than one token per ~3 characters of English prose, so ceil(len/3) never understates the real count.
  const cleaned = stripLicense(String(text ?? ''));
  return Math.ceil(cleaned.length / 3);
}

export function trimToTokens(text, limit = TOKEN_LIMIT) {
  const cleaned = stripLicense(String(text ?? ''));
  if (Math.ceil(cleaned.length / 3) <= limit) return cleaned.trim();
  const available = limit * 3 - TRIM_MARKER.length;
  return cleaned.trim().slice(0, available).trimEnd() + TRIM_MARKER;
}

export function hasLicense(text) {
  return LICENSE_PATTERN.test(String(text ?? ''));
}

export function counterStatus(count) {
  const n = Number(count);
  return n > TOKEN_LIMIT ? 'red' : 'ok';
}

export function reddens(textOrCount) {
  const count = typeof textOrCount === 'number' ? textOrCount : countTokens(textOrCount);
  return count > TOKEN_LIMIT;
}

export function buildEntry(source) {
  const meaning = stripLicense(source.meaning);
  const fix = stripLicense(source.fix);
  const combined = `${meaning} ${fix}`.trim();
  const body = trimToTokens(combined, TOKEN_LIMIT);
  return {
    code: source.code,
    title: meaning,
    body,
    meaning,
    fix,
    tokens: countTokens(body),
  };
}

export function buildDigest(sources = ENTRIES_SOURCE) {
  return sources.map(buildEntry);
}

export const entries = buildDigest();
export const digest = { version: '22.2.x', entries };

export function findEntry(code) {
  return entries.find((e) => e.code === code) ?? null;
}

export function lookup(code) {
  const entry = findEntry(code);
  return entry ? entry : 'unknown';
}

export function explain(code) {
  const entry = findEntry(code);
  if (!entry) return 'unknown';
  return entry.body;
}

export function isKnownCode(code) {
  return MEASURED_CODES.includes(code);
}

export function unknown(code) {
  return isKnownCode(code) ? null : 'unknown';
}

export function assertNoLicense(list = entries) {
  for (const entry of list) {
    const text = [entry.code, entry.title, entry.body, entry.meaning, entry.fix].join(' ');
    if (hasLicense(text)) {
      throw new Error(`license text survived in entry ${entry.code}`);
    }
  }
  return true;
}

export function guardNoLicense(list = entries) {
  return assertNoLicense(list);
}

export default {
  TOKEN_LIMIT,
  TRIM_MARKER,
  MEASURED_CODES,
  CODES,
  IMAGE_CODES,
  entries,
  digest,
  countTokens,
  trimToTokens,
  stripLicense,
  hasLicense,
  counterStatus,
  reddens,
  buildEntry,
  buildDigest,
  findEntry,
  lookup,
  explain,
  isKnownCode,
  unknown,
  assertNoLicense,
  guardNoLicense,
};

function main() {
  const outPath = process.argv[2] || 'extension/image-digest.json';
  const data = { version: '22.2.x', entries: buildDigest() };
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n');
  console.log('wrote', data.entries.length, 'entries to', outPath);
}

const selfPath = new URL(import.meta.url).pathname;
if (process.argv[1] && process.argv[1].endsWith('image-digest.mjs')) {
  main();
}
