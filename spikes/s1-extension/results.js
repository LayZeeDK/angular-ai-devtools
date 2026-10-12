chrome.storage.local.get(null).then((all) => {
  document.getElementById('out').textContent = JSON.stringify(all, null, 2);
});
