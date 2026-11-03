// overlay-geometry.js — runs in ISOLATED world, listed before overlay.js in the overlay's
// content_scripts declaration.
// The tool's pure geometry: a rect reading, a viewport box, a label size and the device pixel ratio go
// in; the box to draw and the label's anchor come out, in CSS pixels. There is no DOM in this file —
// no `document`, no `window`, no `getComputedStyle`, no matrix — so E1, E2 and E3 are arithmetic a
// Node test can prove without a browser, and the picker that calls it cannot smuggle a second
// measurement in beside it.
//
// The one decision that keeps the drawing honest: `getBoundingClientRect()` is already CSS pixels and
// already the axis-aligned box of the element's transformed shape, so the reading is used verbatim.
// It is never multiplied by the device pixel ratio (E3) and never rebuilt from a matrix, which is why
// a rotated ancestor draws the axis-aligned box the label documents rather than a reconstructed
// quadrilateral (E1). The ratio is an accepted parameter and is deliberately unused: a box computed in
// device pixels is off by the ratio, and that is the failure E3 exists to catch.
(function () {
  // The gap between the box and its label, in CSS pixels.
  const DEFAULT_GAP = 6;

  // A zero-size element still points somewhere: it draws a 1 px box at its own top-left corner.
  const MIN_SIZE = 1;

  function finite(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }

  function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  // The box the overlay draws for one rect reading. `point` is true for a zero-size element, which is
  // drawn as a 1 px outline at the point rather than as nothing at all (E2).
  function boxFor(rect) {
    const reading = rect || {};
    const left = finite(reading.left);
    const top = finite(reading.top);
    const width = finite(reading.width);
    const height = finite(reading.height);
    const drawnWidth = width < MIN_SIZE ? MIN_SIZE : width;
    const drawnHeight = height < MIN_SIZE ? MIN_SIZE : height;
    return {
      left,
      top,
      width: drawnWidth,
      height: drawnHeight,
      right: left + drawnWidth,
      bottom: top + drawnHeight,
      point: width === 0 && height === 0,
    };
  }

  // The viewport box in client coordinates. The visual viewport's own width, height and offsets win
  // when the page has one, because those are the edges the user can actually see; otherwise the
  // document element's client box is the viewport. Both are CSS pixels, so the label's clamp needs no
  // scroll arithmetic either way (E2).
  function viewportBox(source) {
    const from = source || {};
    const visual = from.visualViewport;
    if (
      visual &&
      typeof visual.width === 'number' &&
      typeof visual.height === 'number' &&
      visual.width > 0 &&
      visual.height > 0
    ) {
      return {
        left: finite(visual.offsetLeft),
        top: finite(visual.offsetTop),
        width: visual.width,
        height: visual.height,
      };
    }
    return {
      left: 0,
      top: 0,
      width: finite(from.clientWidth),
      height: finite(from.clientHeight),
    };
  }

  // Where the label's anchor goes: below the box, above it when below does not fit, and then clamped
  // on both axes so the label is never outside the viewport — which is what keeps it visible at both
  // extreme scroll positions and on a zero-size element (E2).
  function labelFor(rect, viewport, labelSize, options) {
    const box = boxFor(rect);
    const edges = viewport || {};
    const gap = options && options.gap !== undefined ? finite(options.gap) : DEFAULT_GAP;
    const size = labelSize || {};
    const labelWidth = Math.max(0, finite(size.width));
    const labelHeight = Math.max(0, finite(size.height));
    const minLeft = finite(edges.left);
    const minTop = finite(edges.top);
    const maxLeft = minLeft + Math.max(0, finite(edges.width) - labelWidth);
    const maxTop = minTop + Math.max(0, finite(edges.height) - labelHeight);
    const below = box.bottom + gap;
    const above = box.top - gap - labelHeight;
    let top = below;
    let placement = 'below';
    if (below + labelHeight > minTop + finite(edges.height)) {
      if (above >= minTop) {
        top = above;
        placement = 'above';
      } else {
        // Neither side fits (a box taller than the viewport): clamp the preferred edge instead.
        placement = 'clamped';
      }
    }
    return {
      left: clamp(box.left, minLeft, maxLeft),
      top: clamp(top, minTop, maxTop),
      placement,
    };
  }

  // The two shapes overlay.js writes, in one call. `options.devicePixelRatio` is accepted so the caller
  // can pass the ratio it read, and is never used: the box is CSS pixels already (E3).
  function compute(rect, viewport, labelSize, options) {
    return {
      box: boxFor(rect),
      label: labelFor(rect, viewport, labelSize, options),
    };
  }

  const namespace = {
    boxFor,
    viewportBox,
    labelFor,
    compute,
    DEFAULT_GAP,
    MIN_SIZE,
  };

  if (globalThis.angularAiOverlayGeometry) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiOverlayGeometry, namespace);
  } else {
    globalThis.angularAiOverlayGeometry = namespace;
  }
})();
