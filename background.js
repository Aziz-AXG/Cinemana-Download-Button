// Background script for Cinemana Download Button

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'download') {
    const { url, filename } = message;
    
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true // Let user decide folder or prompt
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Download failed:', chrome.runtime.lastError);
      } else {
        console.log('Download started with ID:', downloadId);
      }
    });
  }
});
