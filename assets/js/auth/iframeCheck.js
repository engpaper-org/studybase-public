(function iframeOnlyGuard() {
  function isInIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      // Cross-origin access errors usually mean it is embedded.
      return true;
    }
  }

  if (isInIframe()) {
    return;
  }

  const currentUrl = window.location.href;
  const redirectUrl =
    window.location.origin +
    "/404.html?routeAnalytics=" +
    encodeURIComponent(currentUrl);

  // Stop the current page loading as much as possible
  try {
    window.stop();
  } catch (e) {}

  // Destroy visible page content
  try {
    document.documentElement.innerHTML = "";
    document.open();
    document.write("");
    document.close();
  } catch (e) {}

  // Prevent further script errors from showing anything useful
  try {
    window.addEventListener(
      "error",
      function (event) {
        event.preventDefault();
        return true;
      },
      true
    );

    window.addEventListener(
      "unhandledrejection",
      function (event) {
        event.preventDefault();
        return true;
      },
      true
    );
  } catch (e) {}

  // Redirect to the fake 404 route analytics URL
  window.location.replace(redirectUrl);
})();