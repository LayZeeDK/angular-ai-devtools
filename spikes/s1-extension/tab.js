s1Run('extension_tab').then((r) => {
  document.getElementById('out').textContent = JSON.stringify(r, null, 2);
});

// chrome.sidePanel.open() needs a user gesture; the runner focuses this button and presses Enter over CDP.
document.getElementById('side').addEventListener('click', async () => {
  const out = document.getElementById('side-out');

  try {
    const win = await chrome.windows.getCurrent();
    await chrome.sidePanel.open({ windowId: win.id });
    out.textContent = 'side panel opened';
  } catch (e) {
    out.textContent = 'ERR ' + s1Err(e);
  }

  await chrome.storage.local.set({ side_panel_open_attempt: out.textContent });
});
document.getElementById('side').focus();
