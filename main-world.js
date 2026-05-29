// Cinemana API interceptor running in the MAIN world
(function() {
  if (window.__cinemanaDlInterceptorInstalled) {
    return;
  }

  window.__cinemanaDlInterceptorInstalled = true;

  function isSubtitleUrl(url) {
    return typeof url === 'string' && /(\.vtt|\.srt|subtitle|subtitles|translation|transfile)/i.test(url);
  }

  function isJsonResponse(response) {
    try {
      return /json/i.test(response.headers.get('content-type') || '');
    } catch (e) {
      return false;
    }
  }

  function isJsonXhr(xhr) {
    try {
      return /json/i.test(xhr.getResponseHeader('content-type') || '');
    } catch (e) {
      return false;
    }
  }

  function postApiData(url, data) {
    window.postMessage({
      type: 'CINEMANA_API_DATA',
      url: url,
      data: data
    }, '*');
  }

  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    const url = (args[0] && typeof args[0] === 'object') ? args[0].url : String(args[0] || '');
    
    if (url && typeof url === 'string') {
      if (isSubtitleUrl(url)) {
        postApiData(url, { url: url });
      }

      if (!isJsonResponse(response)) {
        return response;
      }

      try {
        const clone = response.clone();
        clone.json().then(data => {
          postApiData(url, data);
        }).catch(() => {});
      } catch (e) {}
    }
    return response;
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._url = url;
    return originalOpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function(...args) {
    this.addEventListener('load', function() {
      const url = this._url;
      if (url && typeof url === 'string') {
        if (isSubtitleUrl(url)) {
          postApiData(url, { url: url });
        }

        if (!isJsonXhr(this)) {
          return;
        }

        try {
          const data = JSON.parse(this.responseText);
          postApiData(url, data);
        } catch (e) {}
      }
    });
    return originalSend.apply(this, args);
  };
})();
