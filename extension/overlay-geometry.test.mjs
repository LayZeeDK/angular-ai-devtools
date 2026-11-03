// Tests for extension/overlay-geometry.js — the pure geometry behind the drawn rect and its label.
//
// The module is evaluated in a bare `node:vm` context with no `document`, no `window` and no layout,
// which is the strongest available statement that the geometry contains no DOM: E1, E2 and E3 are
// arithmetic and are proven as arithmetic here.
//
//   E1 — a `transform: translate(...) scale(...)` on an ancestor reaches this module as the reading
//        `getBoundingClientRect()` already produced, and a rotated ancestor's reading is the
//        axis-aligned box the label documents; nothing here reconstructs a matrix.
//   E2 — the label stays inside the viewport at both extreme scroll positions and for a zero-size
//        element, which draws a 1 px box at its point; the visual viewport's box and offsets win when
//        the page has one, the document element's client box otherwise.
//   E3 — the box is CSS pixels at device pixel ratio 1 and 2: the ratio is accepted and never used, so
//        a box computed in device pixels is off by the ratio and this suite fails it.
//
// Every pin carries its own failing half: the mutation that a careless implementation would contain is
// applied to a copy of the source and must change the result.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";

const SRC = readFileSync(new URL("./overlay-geometry.js", import.meta.url), "utf8");

/** The module with its comments removed, so a token scan reads code and not prose. */
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

/**
 * The standalone module: a bare context with nothing in it but the source. No DOM, no globals — a
 * module that reached for `document` or `window` would throw here rather than pass.
 */
function standalone(source = SRC) {
  const context = createContext({});
  runInContext(source, context);
  const geometry = context.angularAiOverlayGeometry;
  assert.ok(geometry, "the module must publish its namespace on the global object of whatever world it runs in");
  return { geometry, context };
}

/**
 * A value from the vm context carries that context's `Object` prototype, so it is copied into this
 * realm before a structural assertion reads it.
 */
function plain(value) {
  return { ...value };
}

/** The five readings a browser produces for the shapes this milestone's fixtures use. */
const RECTS = {
  // An ancestor carries `transform: translate(40px, 25px) scale(1.5)`; this is what the browser
  // reports for the element inside it — CSS pixels, already transformed, fractional.
  scaled: { left: 137.5, top: 82.25, width: 300.5, height: 44.75 },
  // An ancestor carries `transform: rotate(20deg)`: the reported box is the axis-aligned bounding box.
  rotated: { left: 90, top: 60, width: 210, height: 120 },
  // The extreme scroll positions: the element is above the viewport's top edge, and below its bottom.
  scrolledAbove: { left: 24, top: -1200, width: 320, height: 200 },
  scrolledBelow: { left: 24, top: 90000, width: 320, height: 200 },
  zeroSize: { left: 411.5, top: 233.25, width: 0, height: 0 },
};

const VIEWPORT = { left: 0, top: 0, width: 1200, height: 800 };
const LABEL = { width: 180, height: 18 };

describe("overlay-geometry.js is pure", () => {
  it("evaluates in a context with no DOM and publishes one namespace", () => {
    const { geometry, context } = standalone();
    assert.equal(context.document, undefined, "the module must not need a document");
    assert.equal(context.window, undefined, "the module must not need a window");
    for (const name of ["boxFor", "viewportBox", "labelFor", "compute"]) {
      assert.equal(typeof geometry[name], "function", `the namespace must carry ${name}`);
    }
    const body = code(SRC);
    for (const [what, pattern] of [
      ["a document read", /\bdocument\b/],
      ["a window read", /\bwindow\b/],
      ["a style read", /getComputedStyle/],
      ["a matrix", /matrix/i],
      ["a rotation", /\brotate|\bsin\b|\bcos\b|\batan\b/],
      ["a layout observer", /\b(ResizeObserver|IntersectionObserver)\b/],
    ]) {
      assert.equal(pattern.test(body), false, `overlay-geometry.js must contain no ${what}: ${pattern}`);
    }
  });
});

describe("E1 — the drawn box is the transformed reading", () => {
  it("passes a translate/scale ancestor's reading through within one CSS pixel", () => {
    const { geometry } = standalone();
    const raw = RECTS.scaled;
    const box = geometry.boxFor(raw);
    assert.ok(Math.abs(box.left - raw.left) <= 1, `left ${box.left} must stay within 1 px of the reading ${raw.left}`);
    assert.ok(Math.abs(box.top - raw.top) <= 1, `top ${box.top} must stay within 1 px of the reading ${raw.top}`);
    assert.ok(Math.abs(box.width - raw.width) <= 1, `width ${box.width} must stay within 1 px of the reading ${raw.width}`);
    assert.ok(Math.abs(box.height - raw.height) <= 1, `height ${box.height} must stay within 1 px of the reading ${raw.height}`);
    assert.equal(box.left, raw.left, "fractional CSS pixels are kept verbatim, not rounded");
    assert.equal(box.width, raw.width);
  });

  it("draws a rotated ancestor's axis-aligned box, the box the label documents", () => {
    const { geometry } = standalone();
    const raw = RECTS.rotated;
    assert.deepEqual(plain(geometry.boxFor(raw)), {
      left: 90,
      top: 60,
      width: 210,
      height: 120,
      right: 300,
      bottom: 180,
      point: false,
    });
  });

  it("fails a box rebuilt from a matrix instead of the reading", () => {
    // The failing half: an implementation that "corrects" the reading would no longer equal it. The
    // assertion above has teeth only if a changed reading changes the box.
    const rebuilt = SRC.replace(
      "const reading = rect || {};",
      "const reading = { left: (rect || {}).left * 2, top: (rect || {}).top * 2, width: (rect || {}).width * 2, height: (rect || {}).height * 2 };"
    );
    assert.notEqual(rebuilt, SRC, "the E1 mutation target is gone from overlay-geometry.js — restate the bite in overlay-geometry.test.mjs");
    const { geometry } = standalone(rebuilt);
    assert.notEqual(geometry.boxFor(RECTS.scaled).left, RECTS.scaled.left, "a box rebuilt from anything but the reading must differ from it");
  });
});

describe("E2 — the label stays inside the viewport", () => {
  it("keeps the label inside at the extreme scroll positions", () => {
    const { geometry } = standalone();
    for (const [name, raw] of [
      ["scrolled above the top edge", RECTS.scrolledAbove],
      ["scrolled below the bottom edge", RECTS.scrolledBelow],
    ]) {
      const label = geometry.labelFor(raw, VIEWPORT, LABEL);
      assert.ok(label.left >= VIEWPORT.left, `${name}: label left ${label.left} must not be above the viewport's left edge`);
      assert.ok(label.left + LABEL.width <= VIEWPORT.left + VIEWPORT.width, `${name}: the label must not be clipped on the right`);
      assert.ok(label.top >= VIEWPORT.top, `${name}: label top ${label.top} must not be above the viewport's top edge`);
      assert.ok(label.top + LABEL.height <= VIEWPORT.top + VIEWPORT.height, `${name}: the label must not be clipped at the bottom`);
    }
  });

  it("places the label below the box, and above it when below does not fit", () => {
    const { geometry } = standalone();
    const nearBottom = { left: 100, top: 760, width: 300, height: 30 };
    const below = geometry.labelFor({ left: 100, top: 100, width: 300, height: 30 }, VIEWPORT, LABEL);
    assert.equal(below.placement, "below");
    assert.equal(below.top, 100 + 30 + geometry.DEFAULT_GAP);
    const above = geometry.labelFor(nearBottom, VIEWPORT, LABEL);
    assert.equal(above.placement, "above");
    assert.equal(above.top, 760 - geometry.DEFAULT_GAP - LABEL.height);
  });

  it("draws a zero-size element as a 1 px box at its point and keeps its label inside", () => {
    const { geometry } = standalone();
    const raw = RECTS.zeroSize;
    const box = geometry.boxFor(raw);
    assert.equal(box.point, true, "a zero-size element is a point, and the label documents it as one");
    assert.equal(box.width, 1, "a zero-size element draws a 1 px box, not nothing");
    assert.equal(box.height, 1);
    assert.equal(box.left, raw.left, "at the element's own point");
    assert.equal(box.top, raw.top);
    const label = geometry.labelFor(raw, VIEWPORT, LABEL);
    assert.ok(label.top >= VIEWPORT.top && label.top + LABEL.height <= VIEWPORT.top + VIEWPORT.height);
    assert.ok(label.left >= VIEWPORT.left && label.left + LABEL.width <= VIEWPORT.left + VIEWPORT.width);
    // The same at the very corner of the document, where both clamps bite at once.
    const corner = geometry.labelFor({ left: 1200, top: 800, width: 0, height: 0 }, VIEWPORT, LABEL);
    assert.equal(corner.left, VIEWPORT.width - LABEL.width);
    assert.ok(corner.top + LABEL.height <= VIEWPORT.top + VIEWPORT.height, "the corner label stays inside the bottom edge too");
  });

  it("uses the visual viewport's box and offsets when it exists, the client box otherwise", () => {
    const { geometry } = standalone();
    const zoomed = geometry.viewportBox({
      visualViewport: { width: 600, height: 400, offsetLeft: 250, offsetTop: 120 },
      clientWidth: 1200,
      clientHeight: 800,
    });
    assert.deepEqual(plain(zoomed), { left: 250, top: 120, width: 600, height: 400 }, "the visual viewport wins when the page has one");
    const clientBox = geometry.viewportBox({ visualViewport: null, clientWidth: 1200, clientHeight: 800 });
    assert.deepEqual(plain(clientBox), { left: 0, top: 0, width: 1200, height: 800 }, "the document element's client box is the fallback");
    // A label clamped inside the visual viewport, not inside the layout viewport.
    const label = geometry.labelFor({ left: 100, top: 100, width: 50, height: 20 }, zoomed, LABEL);
    assert.ok(label.left >= 250 && label.top >= 120, "the clamp follows the visual viewport's own offsets");
  });

  it("fails an unclamped label, so the clamp is what the assertion holds", () => {
    const unclamped = SRC.replace(
      "left: clamp(box.left, minLeft, maxLeft),",
      "left: box.left,"
    ).replace("top: clamp(top, minTop, maxTop),", "top: top,");
    assert.notEqual(unclamped, SRC, "the E2 mutation targets are gone from overlay-geometry.js — restate the bite in overlay-geometry.test.mjs");
    const { geometry } = standalone(unclamped);
    const label = geometry.labelFor(RECTS.scrolledBelow, VIEWPORT, LABEL);
    assert.ok(label.top > VIEWPORT.top + VIEWPORT.height, "without the clamp the label is drawn outside the viewport");
    assert.ok(label.left >= VIEWPORT.left, "and the horizontal clamp is the other half");
    const corner = geometry.labelFor({ left: 1400, top: 10, width: 0, height: 0 }, VIEWPORT, LABEL);
    assert.ok(corner.left > VIEWPORT.width, "without the horizontal clamp the corner case escapes too");
  });
});

describe("E3 — CSS pixels at any device pixel ratio", () => {
  it("returns the same box at device pixel ratio 1 and 2", () => {
    const { geometry } = standalone();
    for (const raw of Object.values(RECTS)) {
      const at1 = geometry.compute(raw, VIEWPORT, LABEL, { devicePixelRatio: 1 });
      const at2 = geometry.compute(raw, VIEWPORT, LABEL, { devicePixelRatio: 2 });
      assert.deepEqual(at2, at1, "the ratio is never multiplied into the geometry, so the box cannot change with it");
      assert.equal(at1.box.width, geometry.boxFor(raw).width, "the box stays the reading's CSS pixels");
    }
  });

  it("fails a box computed in device pixels: off by the ratio", () => {
    const scaled = SRC.replace(
      "const drawnWidth = width < MIN_SIZE ? MIN_SIZE : width;",
      "const drawnWidth = (width < MIN_SIZE ? MIN_SIZE : width) * ((options && options.devicePixelRatio) || 1);"
    );
    assert.notEqual(scaled, SRC, "the E3 mutation target is gone from overlay-geometry.js — restate the bite in overlay-geometry.test.mjs");
    // The mutation needs `options` in scope, so it is applied to the whole module through boxFor's caller.
    const { geometry } = standalone(
      SRC.replace(
        "function boxFor(rect) {",
        "function boxFor(rect, options) {"
      )
    );
    assert.equal(geometry.boxFor(RECTS.scaled, { devicePixelRatio: 2 }).width, RECTS.scaled.width, "the shipped module ignores the ratio");
    const mutated = standalone(scaled.replace("function boxFor(rect) {", "function boxFor(rect, options) {")).geometry;
    assert.equal(
      mutated.boxFor(RECTS.scaled, { devicePixelRatio: 2 }).width,
      RECTS.scaled.width * 2,
      "a box computed in device pixels is exactly the ratio too wide, which is the failure E3 names"
    );
  });
});
