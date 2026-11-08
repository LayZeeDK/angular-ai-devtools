#!/usr/bin/env node
// @ts-check
// What a terminal-safe message needs: one regex for the characters that could rewrite or split the line it is on, and
// one function that writes each as a `\u` escape. The process tree, the proof manifest and the control script all
// print command lines and paths they did not author, so none of them owns this.
//
// A control skill carries a byte copy at scripts/text.mjs; edit only
// ~/.commandcode/skills/lars-create-verification/scripts/text.mjs (check-skill.mjs fails a copy that differs).

// Control, format (bidirectional marks included), surrogate and separator characters, which would let printed
// manifest text rewrite or split the terminal line it is on.
export const UNPRINTABLE = /[\p{Cc}\p{Cf}\p{Cs}\p{Zl}\p{Zp}]/u;

/**
 * `text` with every character UNPRINTABLE matches written as a `\u` escape, for printing a message that may quote
 * manifest content.
 * @param {string} text
 * @returns {string}
 */
export function printable(text) {
  return text.replace(new RegExp(UNPRINTABLE.source, 'gu'), (char) => {
    const hex = (char.codePointAt(0) ?? 0).toString(16);

    return hex.length > 4 ? `\\u{${hex}}` : `\\u${hex.padStart(4, '0')}`;
  });
}
