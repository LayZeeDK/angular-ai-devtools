/**
 * Which intent a milestone's verdict claims are held to.
 *
 * A milestone's `research/raw/mNNN-verdict-claims.json` rules that milestone's own success criteria, and
 * the suites that check it must read the criteria from that milestone's own intent. Two suites used to
 * decide this by hand and one of them was wrong: `scripts/performance-capture.test.mjs` held M040's claims
 * against `.project/intent/INTENT.md`, which stopped being M040's the moment M041 wrote its own, so the
 * project gate reddened on `SC1 must quote the INTENT criterion character for character` for a milestone
 * whose claims were correct. A constant cannot know which milestone it belongs to, so the decision lives
 * here once and every claims suite asks.
 *
 * Three rules, and no fallback between them:
 *
 *   1. An archived milestone resolves to its own archive: `.project/archive/<number>-<slug>/intent/INTENT.md`,
 *      the highest-numbered match, the way the overlay suite already selects it. An archive that carries no
 *      intent raises - it does not read the live file, because a finished milestone's claims compared to a
 *      later milestone's words is the same defect with the symptom removed.
 *   2. The live `.project/intent/INTENT.md` answers only for the milestone `.project/STATE.md` binds, so
 *      "the live intent" means "this milestone's intent" rather than "whoever is current".
 *   3. Everything else raises, naming the milestone and every path it tried.
 *
 * The milestone token may be written `M040`, `040` or `40`; a token that names no milestone is the same
 * refusal. This file exports the rule and nothing else, so there is one place to read and one place to fix.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** The bound branch STATE.md must name before the live intent can belong to a milestone. */
const BOUND_BRANCH = /^gsd-path\/M(\d{3})$/;

/**
 * @param {string} text
 * @returns {string}
 */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * The milestone `.project/STATE.md` binds, as `M041`, or `null` when the file is absent or binds none. The
 * binding is the branch line, so `default_branch: main` and every other field are not consulted.
 *
 * @param {string} root
 * @returns {string | null}
 */
function boundMilestone(root) {
  const state = join(root, '.project', 'STATE.md');

  if (!existsSync(state)) {
    return null;
  }

  const text = stripBom(readFileSync(state, 'utf8'));
  const branch = /^branch:\s*(\S+)\s*$/m.exec(text)?.[1];
  const number =
    branch === undefined ? undefined : BOUND_BRANCH.exec(branch)?.[1];

  return number === undefined ? null : `M${number}`;
}

/**
 * The absolute path of the intent a milestone's verdict claims are held to.
 *
 * @param {string} root the repository root the milestone's artefacts live under
 * @param {string} milestone `M040`, `040` or `40` - any token naming one milestone
 * @returns {string} the absolute path of that milestone's own `INTENT.md`
 * @throws when the milestone has no intent of its own, so a caller can never silently compare one
 *   milestone's claims to another milestone's words
 */
export function intentPathForMilestone(root, milestone) {
  const at = resolve(String(root ?? ''));
  const token = String(milestone ?? '').trim();
  const digits = /^M?(\d+)$/i.exec(token)?.[1];
  const archives = join(at, '.project', 'archive');
  const live = join(at, '.project', 'intent', 'INTENT.md');

  if (digits === undefined) {
    throw new Error(
      `no intent belongs to ${JSON.stringify(token)}: a milestone token is M040, 040 or 40, so no path can belong to the one written. Tried the archive ${join(archives, '<number>-<slug>', 'intent', 'INTENT.md')} and the live intent ${live}`,
    );
  }

  const number = digits.padStart(3, '0');
  const named = `M${number}`;
  const slug = (
    existsSync(archives)
      ? readdirSync(archives)
          .filter((name) => name.startsWith(`${number}-`))
          .sort()
      : []
  ).pop();
  const archiveIntent = join(
    archives,
    slug ?? `${number}-<slug>`,
    'intent',
    'INTENT.md',
  );

  if (slug !== undefined) {
    if (existsSync(archiveIntent)) {
      return archiveIntent;
    }

    throw new Error(
      `no intent belongs to ${named}: ${named} is archived as ${slug} and that archive carries no intent, so this is refused rather than fallen back to ${live}. Tried ${archiveIntent}`,
    );
  }

  const bound = boundMilestone(at);

  if (bound !== named) {
    throw new Error(
      `no intent belongs to ${named}: ${named} is not archived (tried ${archiveIntent}) and the live intent ${live} belongs to ${bound ?? 'no milestone, because STATE.md binds none'}, not ${named}`,
    );
  }

  if (!existsSync(live)) {
    throw new Error(
      `no intent belongs to ${named}: ${named} is not archived (tried ${archiveIntent}) and the live intent ${live} it binds to is absent`,
    );
  }

  return live;
}
