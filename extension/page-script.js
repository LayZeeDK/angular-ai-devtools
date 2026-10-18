// Page script: runs in page context, uses Prompt API
(async function() {
  try {
    if (typeof LanguageModel === 'undefined') {
      console.log('[Angular AI DevTools] Prompt API not available');
      return;
    }
    const avail = await LanguageModel.availability();
    console.log('[Angular AI DevTools] Prompt API availability:', avail);
    if (avail === 'available' || avail === 'downloadable') {
      const session = await LanguageModel.create({ outputLanguage: 'en' });
      const response = await session.prompt('What Angular version is this app using? Answer in one sentence.');
      console.log('[Angular AI DevTools] Model response:', response);
      session.destroy();
    }
  } catch (e) {
    console.log('[Angular AI DevTools] Prompt API error:', e.message);
  }
})();
