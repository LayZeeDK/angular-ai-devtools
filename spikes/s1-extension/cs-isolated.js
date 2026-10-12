// Manifest matches limit this to https://example.com/*.
window.addEventListener('message', (ev) => {
  if (ev.source === window && ev.data?.s1 === 'content_main') {
    chrome.runtime.sendMessage({ s1: 'content_main', result: ev.data.result });
  }
});

s1Probe('content_isolated')
  .catch((e) => ({ context: 'content_isolated', probeError: s1Err(e) }))
  .then((result) => chrome.runtime.sendMessage({ s1: 'content_isolated', result }));
