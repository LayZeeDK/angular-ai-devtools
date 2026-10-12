s1Run('devtools_page').then((r) => { document.getElementById('out').textContent = JSON.stringify(r, null, 2); });
chrome.devtools.panels.create('S1', '', 'panel.html');
