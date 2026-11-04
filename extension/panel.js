// Panel logic
// The element the panel reports into. It is named for the element it holds: a bare `status` is the
// browser's own `window.status` string, which is a different value with a different type.
const statusEl = document.getElementById('status');
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'angular-detected') {
    statusEl.textContent = 'Angular detected: ' + message.version;
  }
});
