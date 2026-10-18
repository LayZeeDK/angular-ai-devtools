// DevTools page: create the panel
chrome.devtools.panels.create(
  'Angular AI',
  'icon.png',
  'panel.html',
  (panel) => {
    console.log('[Angular AI DevTools] Panel created');
  }
);