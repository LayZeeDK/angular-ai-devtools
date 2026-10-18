// Panel logic
const status = document.getElementById('status');
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'angular-detected') {
    status.textContent = 'Angular detected: ' + message.version;
  }
});