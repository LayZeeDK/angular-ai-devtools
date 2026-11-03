// overlay.js — runs in ISOLATED world, at document_start (the manifest's third content-script entry)
// The tool's page half: one host element with a closed shadow root, the overlay's own observer, and the
// picker that draws the tracked rect and label into that root.
// The host is the only DOM the tool adds to an inspected page (AR-3), so this file is written so that
// a second injection cannot add a second one and cannot throw into the page it inspects (E7, N3).
// Nothing here is a page control (AR-6) and nothing here writes a style to a page node (N1): the host
// carries its own `position` and `pointer-events` and every node the picker draws is created into the
// closed root, where the page can neither read it nor style it.
(function () {
  const HOST_ID = 'angular-ai-devtools-host';

  // E7 / N3: re-injection happens on SPA route changes and on extension reloads, so the guard is the
  // first statement. A second run finds the first run's host and returns before creating a node,
  // attaching a shadow root, registering a listener or an observer, or throwing. The first run's
  // closures still own the closed root, and a closed root is never readable back, so this instance
  // neither can nor needs to reach it.
  if (document.getElementById(HOST_ID)) return;

  // A missing filter is a named failure, not silence: the declaration that loads this file lists
  // observer-filter.js first in the same isolated world. An overlay that cannot exclude its own host
  // from its own observer is a regression to pre-AR-4 behaviour, so refuse by name before attaching
  // anything, and leave no half-owned host behind.
  function requireObserverFilter() {
    const filter = globalThis.angularAiObserverFilter;
    if (!filter || typeof filter.isToolRecord !== 'function') {
      throw new Error(
        '[Angular AI DevTools] overlay.js requires observer-filter.js first in the same isolated world; fix the content_scripts declaration order'
      );
    }
    return filter;
  }

  requireObserverFilter();

  // The geometry module is the same dependency discipline as the filter, with one difference that
  // belongs to the page rather than to the tool: it is required when the picker arms, not at load, so
  // a declaration that does not list overlay-geometry.js costs the picker a named `unavailable` state
  // and never costs the inspected page its host (AR-3, N3).
  function requireGeometry() {
    const geometry = globalThis.angularAiOverlayGeometry;
    if (!geometry || typeof geometry.compute !== 'function') {
      throw new Error(
        '[Angular AI DevTools] overlay.js requires overlay-geometry.js first in the same isolated world; fix the content_scripts declaration order'
      );
    }
    return geometry;
  }

  // The one host, on the document element rather than the body, which can still be absent at
  // document_start. position and pointer-events are the host's whole inline style: everything the
  // overlay draws is styled on a node inside the closed root, never on a page node and never as an
  // inline width/top here (AR-3, N1). `pointer-events: none` is what makes a hover reach the page
  // element under the drawing instead of the drawing itself (T002's measured ruling).
  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.position = 'fixed';
  host.style.pointerEvents = 'none';

  // Exactly one closed root in this file: the page cannot read or style the drawing, and the tool
  // never reads its own root back. The nodes the picker draws are created into `root`.
  const root = host.attachShadow({ mode: 'closed' });

  // The element a locked pick follows — set by the picker the moment a pick locks, null until then.
  // It is the only thing this observer ever asks about, and the only reason it exists.
  let followedElement = null;

  // Hands the records that survived the shared predicate to the observer's one question. Returns the
  // records it passed, so overlay.test.mjs can assert which records reached this path; the platform
  // ignores a MutationObserver callback's return value.
  function notePageRecords(pageRecords) {
    if (pageRecords.length === 0) return pageRecords;
    if (followedElement !== null && !followedElement.isConnected) followedElement = null;
    return pageRecords;
  }

  // AR-4: the overlay's own observer, filtered first and last. One observer on the document element
  // with { childList: true, subtree: true } and no other observer kind, so the tool's surface stays
  // the relay's two callbacks plus this one. It registers before the host is attached on purpose: the
  // host's own insertion record (target = the document element, the host in addedNodes) is then one of
  // the records the shared predicate has to drop, which is the half a target-only filter gets wrong.
  const observer = new MutationObserver((records) => {
    const filter = requireObserverFilter();
    const pageRecords = [];
    for (let index = 0; index < records.length; index += 1) {
      if (filter.isToolRecord(records[index])) continue;
      pageRecords.push(records[index]);
    }
    return notePageRecords(pageRecords);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // ---- The picker: five rect inputs, one dirty flag, one frame loop, hover, lock, cancel ----------
  //
  // Down, from the relay: CustomEvent("angular-ai:picker-command", { detail: { action } }) on window.
  // Up, to the relay: CustomEvent("angular-ai:picker-state", { detail: { status, reason? } }) on window.
  // The page realm's answer arrives as CustomEvent("angular-ai:picked", { detail: descriptor }) on
  // window — this module reads it for the label and never re-emits it, so the panel receives exactly
  // the one event the page realm produced.
  const COMMAND_EVENT = 'angular-ai:picker-command';
  const STATE_EVENT = 'angular-ai:picker-state';
  const PICKED_EVENT = 'angular-ai:picked';
  const PICK_EVENT = 'angular-ai:pick';
  const ANSWER_TIMEOUT_MS = 1500;
  const LABEL_GAP = 6;

  // The drawing's whole stylesheet, on one node inside the closed root. Everything is positioned
  // fixed inside the fixed host, so viewport coordinates need no scroll-offset arithmetic; per-frame
  // writes are one transform and one width/height each, and `pointer-events: none` keeps every one of
  // them out of the hit test.
  const DRAWING_CSS =
    '.ai-pick-rect{position:fixed;left:0;top:0;margin:0;padding:0;box-sizing:border-box;' +
    'border:1px solid #6d5efc;box-shadow:0 0 0 1px rgba(255,255,255,.85) inset;' +
    'pointer-events:none;z-index:2147483647;transform-origin:0 0}' +
    '.ai-pick-rect[hidden]{display:none}' +
    '.ai-pick-label{position:fixed;left:0;top:0;margin:0;padding:2px 6px;max-width:60vw;overflow:hidden;' +
    'text-overflow:ellipsis;white-space:nowrap;font:12px/1.4 ui-monospace,Menlo,Consolas,monospace;' +
    'color:#fff;background:#3b2f9e;border-radius:3px;pointer-events:none;z-index:2147483647;transform-origin:0 0}' +
    '.ai-pick-label[hidden]{display:none}';

  let armed = false;
  let lockedElement = null;
  let hoveredElement = null;
  let pointer = null;
  let dirty = false;
  let frameHandle = 0;
  let answerTimer = 0;
  let answerListener = null;
  let geometry = null;
  let drawing = null;
  let labelSize = { width: 0, height: 0 };
  let inputs = [];
  let resolutionQuery = null;
  let descriptorState = null;
  let unanswered = false;

  function emit(type, detail) {
    if (typeof window.dispatchEvent !== 'function') return;
    window.dispatchEvent(new CustomEvent(type, { detail: detail }));
  }

  // Every state the page cannot show through a closed root leaves by name: armed, cancelled and the
  // bounded unavailable outcome. No state is inferred from an absence of messages.
  function emitState(status, reason) {
    const detail = { status: status };
    if (typeof reason === 'string' && reason.length > 0) detail.reason = reason;
    emit(STATE_EVENT, detail);
  }

  function cssPixels(value) {
    return String(value) + 'px';
  }

  function tagOf(element) {
    const tag = element && element.tagName;
    return typeof tag === 'string' && tag.length > 0 ? tag.toLowerCase() : 'element';
  }

  // The label is the surface: a hovered element is named by its tag, a locked pick keeps that tag and
  // gains the page realm's answer, and the three outcomes are three different labels rather than one
  // empty box (SC1, SC2).
  function labelText(element) {
    const tag = tagOf(element);
    const answer = descriptorState;
    if (answer && answer.status === 'resolved') {
      const component = typeof answer.componentName === 'string' && answer.componentName.length > 0 ? answer.componentName : null;
      const className = typeof answer.className === 'string' && answer.className.length > 0 ? answer.className : null;
      if (component && className) return tag + ' — ' + component + ' (' + className + ')';
      if (component) return tag + ' — ' + component;
      return tag + ' — component unresolved';
    }
    if (answer && answer.status === 'no-dev-api') {
      const reason = typeof answer.reason === 'string' && answer.reason.length > 0 ? answer.reason : 'no Angular dev API on this page';
      return tag + ' — ' + reason;
    }
    if (answer && answer.status === 'no-component') return tag + ' — no owning component';
    if (unanswered) return tag + ' — the page realm did not answer in ' + ANSWER_TIMEOUT_MS + ' ms';
    return tag;
  }

  // The document element's client box is the viewport only when there is no visual viewport; the
  // choice is the geometry module's, so it is spelled once (E2). This hands the module a *box*
  // (left, top, width, height) — its `labelFor` clamps against those four numbers, so passing the raw
  // source would clamp against nothing and pin the label to the corner.
  function viewportBox() {
    const documentElement = document.documentElement;
    return geometry.viewportBox({
      visualViewport: window.visualViewport || null,
      clientWidth: documentElement ? documentElement.clientWidth : 0,
      clientHeight: documentElement ? documentElement.clientHeight : 0,
    });
  }

  // Hover resolves through document.elementFromPoint, and a hit that returns the tool — the host
  // itself, or anything the host contains — is the tool and not a candidate. The mapping is correct
  // whatever an engine does with the inner nodes of a closed root, because the host's own
  // `pointer-events: none` is what lets the pointer through: the picker never leans on retargeting
  // (T002's ruling, `reliesOnEngineRetargeting: false`). `visualViewport.scale` is read for nothing.
  function candidateAt(x, y) {
    if (typeof document.elementFromPoint !== 'function') return null;
    const hit = document.elementFromPoint(x, y);
    if (!hit) return null;
    if (hit === host || host.contains(hit)) return null;
    return hit;
  }

  function ensureDrawing() {
    if (drawing) return drawing;
    const styleNode = document.createElement('style');
    styleNode.textContent = DRAWING_CSS;
    const rectNode = document.createElement('div');
    rectNode.className = 'ai-pick-rect';
    rectNode.hidden = true;
    const labelNode = document.createElement('div');
    labelNode.className = 'ai-pick-label';
    labelNode.hidden = true;
    root.appendChild(styleNode);
    root.appendChild(rectNode);
    root.appendChild(labelNode);
    drawing = { styleNode: styleNode, rectNode: rectNode, labelNode: labelNode };
    return drawing;
  }

  // Cancel leaves the host, not the drawing: the three nodes leave the closed root and the root stays.
  function removeDrawing() {
    if (!drawing) return;
    const nodes = [drawing.styleNode, drawing.rectNode, drawing.labelNode];
    drawing = null;
    labelSize = { width: 0, height: 0 };
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      if (node && node.parentNode) node.parentNode.removeChild(node);
    }
  }

  function hideDrawing() {
    if (!drawing) return;
    drawing.rectNode.hidden = true;
    drawing.labelNode.hidden = true;
  }

  // One recompute: the reading, the two shapes, and three writes — all of them on nodes inside the
  // closed root. The rect is `getBoundingClientRect()` verbatim: CSS pixels and the axis-aligned box
  // of the transformed element, with no ratio and no matrix anywhere in the path (E1, E3).
  function draw() {
    const element = lockedElement || hoveredElement;
    if (!element || element.isConnected === false) {
      hideDrawing();
      return;
    }
    ensureDrawing();
    const text = labelText(element);
    const changed = drawing.labelNode.textContent !== text;
    if (changed) drawing.labelNode.textContent = text;
    // Shown before it is measured: a hidden box measures 0 x 0, and a label clamped with a zero size
    // can overflow the viewport it is supposed to stay inside (E2).
    drawing.rectNode.hidden = false;
    drawing.labelNode.hidden = false;
    if (changed) {
      const measured = drawing.labelNode.getBoundingClientRect();
      labelSize = { width: measured.width || 0, height: measured.height || 0 };
    }
    const placement = geometry.compute(element.getBoundingClientRect(), viewportBox(), labelSize, {
      gap: LABEL_GAP,
    });
    drawing.rectNode.style.transform = 'translate(' + cssPixels(placement.box.left) + ', ' + cssPixels(placement.box.top) + ')';
    drawing.rectNode.style.width = cssPixels(placement.box.width);
    drawing.rectNode.style.height = cssPixels(placement.box.height);
    drawing.labelNode.style.transform = 'translate(' + cssPixels(placement.label.left) + ', ' + cssPixels(placement.label.top) + ')';
  }

  function recompute() {
    dirty = false;
    if (!armed) return;
    if (!lockedElement) hoveredElement = pointer ? candidateAt(pointer.x, pointer.y) : null;
    draw();
  }

  // The one frame loop. Every input sets the flag and asks for a frame; the loop recomputes at most
  // once per frame and clears the flag. While a selection exists it keeps asking, because a CSS
  // transform on an ancestor emits no event and continuous frames are the only input that catches it.
  function frameStep() {
    frameHandle = 0;
    if (!armed) return;
    if (dirty || lockedElement || hoveredElement) recompute();
    if (lockedElement || hoveredElement) scheduleFrame();
  }

  function scheduleFrame() {
    if (frameHandle || !armed) return;
    if (typeof window.requestAnimationFrame !== 'function') return;
    frameHandle = window.requestAnimationFrame(frameStep);
  }

  function stopFrame() {
    if (!frameHandle) return;
    const handle = frameHandle;
    frameHandle = 0;
    if (typeof window.cancelAnimationFrame === 'function') window.cancelAnimationFrame(handle);
  }

  function markDirty() {
    dirty = true;
    scheduleFrame();
  }

  function onPointerMove(event) {
    if (!armed || lockedElement) return;
    pointer = { x: event.clientX, y: event.clientY };
    markDirty();
  }

  // A click locks the pick; hovering stops, the rect holds, and the page does not navigate — the
  // correction of 2026-11-03 is lock on click and navigate from the panel.
  function onClick(event) {
    if (!armed || lockedElement) return;
    const element = candidateAt(event.clientX, event.clientY);
    if (!element) return;
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
    lock(element);
  }

  function clearAnswerTimer() {
    if (!answerTimer) return;
    const handle = answerTimer;
    answerTimer = 0;
    if (typeof window.clearTimeout === 'function') window.clearTimeout(handle);
  }

  function followAnswer(follow) {
    if (!follow) {
      if (answerListener) {
        window.removeEventListener(PICKED_EVENT, answerListener);
        answerListener = null;
      }
      return;
    }
    if (answerListener) return;
    answerListener = function (event) {
      answered(event && event.detail);
    };
    window.addEventListener(PICKED_EVENT, answerListener);
  }

  // The page realm answered: plain data only, and the label is what changes. The rect holds, and the
  // answer is never re-emitted — the relay already forwarded the one the page realm produced.
  function answered(detail) {
    if (!lockedElement) return;
    clearAnswerTimer();
    followAnswer(false);
    descriptorState = detail && typeof detail === 'object' ? detail : null;
    unanswered = false;
    markDirty();
  }

  // 1500 ms with no answer: the third named outcome, with its reason, and the rect stays where the
  // element is.
  function onAnswerTimeout() {
    answerTimer = 0;
    if (!lockedElement) return;
    unanswered = true;
    descriptorState = null;
    followAnswer(false);
    markDirty();
    emitState('unavailable', 'no ' + PICKED_EVENT + ' within ' + ANSWER_TIMEOUT_MS + ' ms of ' + PICK_EVENT);
  }

  function lock(element) {
    lockedElement = element;
    hoveredElement = element;
    pointer = null;
    followedElement = element;
    descriptorState = null;
    unanswered = false;
    followAnswer(true);
    try {
      // The cross-world hop: a DOM node, dispatched on the element itself. `bubbles: true` so a
      // capture listener on the global object sees it, `composed: false` so it never leaves the light
      // tree, and no detail at all — the MAIN-world listener reads `event.target`.
      element.dispatchEvent(new CustomEvent(PICK_EVENT, { bubbles: true, composed: false }));
    } catch (error) {
      /* a page element must never be able to throw the picker over */
    }
    answerTimer = window.setTimeout(onAnswerTimeout, ANSWER_TIMEOUT_MS);
    markDirty();
  }

  function attachInput(target, type, handler, capture) {
    if (!target || typeof target.addEventListener !== 'function') return;
    const useCapture = capture === true;
    target.addEventListener(type, handler, useCapture);
    inputs.push({ target: target, type: type, handler: handler, capture: useCapture });
  }

  function detachInputs() {
    for (let index = 0; index < inputs.length; index += 1) {
      const entry = inputs[index];
      entry.target.removeEventListener(entry.type, entry.handler, entry.capture);
    }
    inputs = [];
    dropResolutionQuery();
  }

  function dropResolutionQuery() {
    const held = resolutionQuery;
    resolutionQuery = null;
    if (!held) return;
    if (typeof held.query.removeEventListener === 'function') held.query.removeEventListener('change', held.handler);
    else if (typeof held.query.removeListener === 'function') held.query.removeListener(held.handler);
  }

  // CSS `zoom` and page zoom surface as a device-pixel-ratio change, so the resolution query is rebuilt
  // from the ratio the page reports now, and re-registered on every fire (decision 6).
  function attachResolutionQuery() {
    dropResolutionQuery();
    if (typeof window.matchMedia !== 'function') return;
    const ratio = window.devicePixelRatio || 1;
    const query = window.matchMedia('(resolution: ' + ratio + 'dppx)');
    const handler = function () {
      markDirty();
      attachResolutionQuery();
    };
    if (typeof query.addEventListener === 'function') query.addEventListener('change', handler);
    else if (typeof query.addListener === 'function') query.addListener(handler);
    resolutionQuery = { query: query, handler: handler };
  }

  // The five inputs of decision 6, plus the picker's own two: hover and the lock. Every listener is
  // recorded so cancel and close can remove exactly what was added, and no observer kind is added —
  // a ResizeObserver would be the tool's first observer AR-4 does not name.
  function attachInputs() {
    detachInputs();
    attachInput(window, 'scroll', markDirty, true);
    attachInput(window, 'resize', markDirty);
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      attachInput(visualViewport, 'resize', markDirty);
      attachInput(visualViewport, 'scroll', markDirty);
    }
    attachResolutionQuery();
    attachInput(window, 'pointermove', onPointerMove, true);
    attachInput(window, 'click', onClick, true);
  }

  function resetSelection() {
    lockedElement = null;
    hoveredElement = null;
    pointer = null;
    dirty = false;
    followedElement = null;
    descriptorState = null;
    unanswered = false;
    clearAnswerTimer();
    followAnswer(false);
    stopFrame();
  }

  function arm() {
    let module;
    try {
      module = requireGeometry();
    } catch (error) {
      emitState('unavailable', error && error.message ? error.message : 'overlay.js requires overlay-geometry.js');
      return;
    }
    geometry = module;
    resetSelection();
    armed = true;
    dirty = true;
    ensureDrawing();
    observer.observe(document.documentElement, { childList: true, subtree: true });
    attachInputs();
    emitState('armed');
    scheduleFrame();
  }

  // Cancel removes the rect and the label from the closed root, detaches every listener and
  // disconnects the overlay's observer, and reports the cancelled state. The host stays attached:
  // a second host is the defect AR-3 forbids and re-attaching on navigation is how an overlay leaks.
  function cancel() {
    armed = false;
    resetSelection();
    detachInputs();
    observer.disconnect();
    removeDrawing();
    emitState('cancelled');
  }

  function onCommand(event) {
    const detail = event && event.detail ? event.detail : null;
    const action = detail && typeof detail.action === 'string' ? detail.action : null;
    if (action === 'arm') {
      arm();
      return;
    }
    if (action === 'cancel') {
      cancel();
      return;
    }
    // The background validates the action before forwarding it; anything else is answered by name.
    emitState('unavailable', COMMAND_EVENT + ' carried no known action (arm|cancel)');
  }

  // Attach last, so the observer above sees the tool's own insertion and has to drop it.
  document.documentElement.appendChild(host);

  // The panel's one command arrives as a window event, so the listener exists from document_start —
  // before any panel can arm — and is never detached: it is the channel, not a rect input.
  window.addEventListener(COMMAND_EVENT, onCommand);

  console.log('[Angular AI DevTools] Overlay host attached (closed shadow root)');
})();
