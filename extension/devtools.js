// DevTools page: create the Angular-powered panel
chrome.devtools.panels.create(
  'Angular AI',
  'icon16.svg',
  'panel/index.html',
  (panel) => {
    console.log('[Angular AI DevTools] Panel created');
  },
);
