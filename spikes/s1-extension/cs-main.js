// MAIN world: no chrome.runtime, so post to the isolated script, which relays to the service worker.
window.__s1Main = { state: 'loaded' };

// Wait so the isolated-world listener is registered first.
setTimeout(() => {
  s1Probe('content_main')
    .catch((e) => ({ context: 'content_main', probeError: s1Err(e) }))
    .then((result) => {
      window.__s1Main = { state: 'posted' };
      window.postMessage({ s1: 'content_main', result }, '*');
    });
}, 1000);
