// Shared by the content script and background service worker.
function sanitizeFilename(value, fallback = 'Cinemana_Video') {
  const clean = input => String(input || '')
    .replace(/[<>:/\\|*]+/g, ' - ')
    .replace(/["?]/g, '')
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[. -]+|[. -]+$/g, '');

  const safe = clean(value) || clean(fallback) || 'Cinemana_Video';
  // Windows reserves device names even when followed by an extension.
  return /^(?:con|prn|aux|nul|com[1-9\u00B9\u00B2\u00B3]|lpt[1-9\u00B9\u00B2\u00B3])(?:\.|$)/i.test(safe)
    ? `_${safe}`
    : safe;
}
