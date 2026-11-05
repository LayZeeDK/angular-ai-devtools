/**
 * The image-budget panel surface — T004 (INTENT.md SC5).
 *
 * Renders the COM-1 finding (code, image, binding) and its explanation from the
 * digest entry — a fact list, never a model call. Four states:
 *   - empty:    no image finding recorded
 *   - loading:  the fact list is being assembled
 *   - unknown:  the code is not carried by the digest
 *   - success:  finding, code, binding and the one-line fix from the digest entry
 *
 * No runtime imports: the module loads under node's type stripping and stays out
 * of the panel's eager bundle graph.
 */

export type ImageBudgetFinding = {
  readonly code: string;
  readonly image?: string;
  readonly binding?: string;
};

export type ImageBudgetDigestEntry = {
  readonly code: string;
  readonly title?: string;
  readonly body?: string;
  readonly meaning?: string;
  readonly fix?: string;
};

export type ImageBudgetInput =
  | null
  | undefined
  | string
  | ImageBudgetFinding
  | {
      readonly finding?: ImageBudgetFinding | null;
      readonly code?: string;
      readonly image?: string;
      readonly binding?: string;
      readonly digest?:
        | readonly ImageBudgetDigestEntry[]
        | { readonly entries?: readonly ImageBudgetDigestEntry[] }
        | null
        | undefined;
      readonly facts?: readonly string[];
      readonly loading?: boolean;
      readonly assembling?: boolean;
    };

export type ImageBudgetSurface =
  | {
      readonly kind: 'empty';
      readonly state: 'empty';
      readonly message: string;
    }
  | {
      readonly kind: 'loading';
      readonly state: 'loading';
      readonly message: string;
      readonly facts: readonly string[];
    }
  | {
      readonly kind: 'unknown';
      readonly state: 'unknown';
      readonly message: string;
      readonly code: string;
    }
  | {
      readonly kind: 'success';
      readonly state: 'success';
      readonly message: string;
      readonly code: string;
      readonly binding: string;
      readonly image: string | null;
      readonly fix: string;
      readonly finding: ImageBudgetFinding;
      readonly entry: ImageBudgetDigestEntry | null;
      readonly text: string;
    };

const EMPTY_MESSAGE = 'no image finding';
const LOADING_MESSAGE = 'assembling fact list';
const UNKNOWN_MESSAGE_PREFIX = 'unknown';

function readCode(value: unknown): string {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : '';
}

function readBinding(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readImage(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function normalizeFinding(input: ImageBudgetInput): ImageBudgetFinding | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'string') {
    const code = readCode(input);
    return code ? { code } : null;
  }
  if (typeof input !== 'object') return null;
  const obj = input as any;
  if (
    typeof obj.code === 'string' &&
    (obj.image === undefined || typeof obj.image === 'string') &&
    (obj.binding === undefined || typeof obj.binding === 'string') &&
    !('finding' in obj) &&
    !('digest' in obj) &&
    !('loading' in obj) &&
    !('facts' in obj)
  ) {
    const code = readCode(obj.code);
    if (!code) return null;
    return {
      code,
      image: readImage(obj.image) ?? undefined,
      binding: readBinding(obj.binding) || undefined,
    } as ImageBudgetFinding;
  }
  if ('finding' in obj) {
    const f = obj.finding;
    if (f && typeof f === 'object') {
      const code = readCode((f as any).code);
      if (!code) return null;
      return {
        code,
        image: readImage((f as any).image) ?? undefined,
        binding: readBinding((f as any).binding) || undefined,
      } as ImageBudgetFinding;
    }
    return null;
  }
  const code = readCode(obj.code);
  if (!code) return null;
  // If loading flag present, treat as no finding yet.
  if (obj.loading === true || obj.assembling === true) return null;
  return {
    code,
    image: readImage(obj.image) ?? undefined,
    binding: readBinding(obj.binding) || undefined,
  } as ImageBudgetFinding;
}

function normalizeDigest(
  input: ImageBudgetInput,
): readonly ImageBudgetDigestEntry[] {
  if (input === null || input === undefined || typeof input !== 'object')
    return [];
  const obj = input as any;
  let raw: unknown = undefined;
  if ('digest' in obj) raw = obj.digest;
  else if (Array.isArray(obj)) raw = obj;
  if (
    raw &&
    typeof raw === 'object' &&
    !Array.isArray(raw) &&
    'entries' in (raw as any)
  ) {
    raw = (raw as any).entries;
  }
  if (Array.isArray(raw)) return raw as ImageBudgetDigestEntry[];
  // second arg digest
  return [];
}

function findDigestEntry(
  code: string,
  digest: readonly ImageBudgetDigestEntry[],
): ImageBudgetDigestEntry | null {
  if (!code) return null;
  for (const e of digest) {
    if (e && typeof e === 'object' && readCode(e.code) === code) return e;
  }
  return null;
}

// Default fact list (mirrors scripts/image-digest.mjs) so the surface works
// even when no digest is passed in.
const DEFAULT_ENTRIES: readonly ImageBudgetDigestEntry[] = [
  {
    code: 'NG0913',
    meaning: 'An image that is the LCP element was given loading="lazy".',
    fix: 'Change its loading value to eager or use NgOptimizedImage prioritization.',
  },
  {
    code: 'NG2952',
    meaning:
      'NgOptimizedImage reported an image aspect-ratio, fill, or loading attribute problem.',
    fix: 'Correct the width, height, fill, or loading attribute per the warning.',
  },
  {
    code: 'NG2955',
    meaning: 'An image is the LCP element but was not marked priority.',
    fix: 'Add the priority attribute to that image.',
  },
  {
    code: 'NG2956',
    meaning: 'A priority image has no preconnect tag for its origin.',
    fix: 'Add a preconnect link for the image origin in the document head.',
  },
  {
    code: 'NG2959',
    meaning: 'The Netlify image loader saw an unsupported attribute.',
    fix: 'Remove the unsupported attribute from the img tag.',
  },
  {
    code: 'NG2960',
    meaning: 'The intrinsic image is significantly larger than necessary.',
    fix: 'Resize the image or use ngSrcset and sizes.',
  },
  {
    code: 'NG2961',
    meaning:
      'More than the default preloaded image limit were marked priority.',
    fix: 'Remove priority from less important images.',
  },
  {
    code: 'NG2962',
    meaning:
      'Images look hosted on a CDN but no matching loader is configured.',
    fix: 'Provide the built-in loader or define a custom IMAGE_LOADER.',
  },
  {
    code: 'NG2963',
    meaning:
      'ngSrcset or loaderParams is present but no image loader is configured.',
    fix: 'Provide a loader or remove ngSrcset and loaderParams.',
  },
  {
    code: 'NG2964',
    meaning: 'An LCP image had its ngSrc modified after render.',
    fix: 'Do not modify ngSrc on an LCP image.',
  },
  {
    code: 'NG2965',
    meaning: 'A placeholder data URL is longer than the recommended limit.',
    fix: 'Use a smaller data URL placeholder.',
  },
  {
    code: 'NG2966',
    meaning:
      'The priority attribute is set more than the threshold number of times.',
    fix: 'Reserve priority for the LCP image only.',
  },
  {
    code: 'NG2967',
    meaning: 'A placeholder image exceeds the dimension limit.',
    fix: 'Use a smaller image as the placeholder.',
  },
];

export function imageBudget(...args: unknown[]): ImageBudgetSurface {
  // Determine loading state.
  let loading = false;
  let facts: readonly string[] = [];
  let finding: ImageBudgetFinding | null = null;
  let digest: readonly ImageBudgetDigestEntry[] = DEFAULT_ENTRIES;

  // Collect args.
  const first = args[0];
  const second = args[1];

  // loading detection from first arg
  if (first && typeof first === 'object' && !Array.isArray(first)) {
    const o = first as any;
    if (o.loading === true || o.assembling === true) loading = true;
    if (Array.isArray(o.facts)) facts = o.facts as string[];
  }

  // digest from second arg if provided
  if (Array.isArray(second)) digest = second as ImageBudgetDigestEntry[];
  else if (second && typeof second === 'object') {
    const o = second as any;
    if (Array.isArray(o)) digest = o as ImageBudgetDigestEntry[];
    else if (Array.isArray(o.entries))
      digest = o.entries as ImageBudgetDigestEntry[];
    else if (o.digest) {
      const d = o.digest;
      if (Array.isArray(d)) digest = d as ImageBudgetDigestEntry[];
      else if (d && typeof d === 'object' && Array.isArray((d as any).entries))
        digest = (d as any).entries as ImageBudgetDigestEntry[];
    }
  }

  // digest from first arg if present
  if (first && typeof first === 'object' && !Array.isArray(first)) {
    const o = first as any;
    const d = normalizeDigest(first as ImageBudgetInput);
    if (d.length > 0) digest = d;
    // also digest.entries
    if (Array.isArray(o.digest)) digest = o.digest as ImageBudgetDigestEntry[];
    else if (o.digest && typeof o.digest === 'object') {
      const dd = o.digest as any;
      if (Array.isArray(dd.entries))
        digest = dd.entries as ImageBudgetDigestEntry[];
    }
    if (Array.isArray(o.entries))
      digest = o.entries as ImageBudgetDigestEntry[];
  }

  if (!loading) {
    finding = normalizeFinding(first as ImageBudgetInput);
    // If first is empty/null, finding null -> empty
  }

  // If finding provided via second? handle code string second
  if (!finding && typeof second === 'string') {
    const c = readCode(second);
    if (c) finding = { code: c };
  }

  if (loading) {
    return {
      kind: 'loading',
      state: 'loading',
      message: LOADING_MESSAGE,
      facts,
    };
  }

  if (!finding) {
    return { kind: 'empty', state: 'empty', message: EMPTY_MESSAGE };
  }

  const code = readCode(finding.code);
  const entry = findDigestEntry(code, digest);

  if (!entry) {
    return {
      kind: 'unknown',
      state: 'unknown',
      message: `${UNKNOWN_MESSAGE_PREFIX}: ${code} — the digest has no entry for it`,
      code,
    };
  }

  const binding = readBinding(finding.binding);
  const image = readImage(finding.image);
  const fix =
    typeof entry.fix === 'string'
      ? entry.fix
      : typeof entry.body === 'string'
        ? entry.body
        : '';
  const text = [code, binding, fix].filter(Boolean).join(' — ');

  return {
    kind: 'success',
    state: 'success',
    message: text,
    code,
    binding,
    image,
    fix,
    finding,
    entry,
    text,
  };
}

// Aliases for discoverability.
export const imageBudgetSurface = imageBudget;
export const renderImageBudget = imageBudget;
export const imageBudgetFinding = imageBudget;
export const imageBudgetState = imageBudget;

export default imageBudget;
