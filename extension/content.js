// Content script (isolated world): detect Angular, ask background to inject Prompt API
(function() {
  function checkAngular() {
    const root = document.querySelector('[ng-version]');
    if (root) {
      const version = root.getAttribute('ng-version');
      console.log('[Angular AI DevTools] Angular detected, version:', version);

      // Ask background service worker to inject Prompt API call into page
      chrome.runtime.sendMessage({ type: 'inject-prompt-api' }, (response) => {
        console.log('[Angular AI DevTools] Injection response:', response);
      });

      // Inject marker
      const marker = document.createElement('div');
      marker.id = 'angular-ai-devtools-marker';
      marker.textContent = 'Angular ' + version + ' detected';
      marker.style.cssText = 'position:fixed;top:0;right:0;background:#4caf50;color:white;padding:4px 8px;z-index:99999;font-size:12px;';
      document.body.appendChild(marker);
    } else {
      setTimeout(checkAngular, 500);
    }
  }
  checkAngular();
})();
