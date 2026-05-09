(function iframeOnlyGuard() {
    // If this page is NOT inside an iframe, redirect away.
    // window.top !== window.self => not in an iframe
    const inIframe = (function () {
      try { return window.top !== window.self; }
      catch (e) { return true; } // If cross-origin blocks access to top, assume it's in an iframe.
    })();

    if (!inIframe) {
      // 403 = forbidden (blocked from direct access)
      window.location.replace("/index.html?error=SEC_002");
    }
  })();