(function () {
  window.CurrentScriptVersions = window.CurrentScriptVersions || {};
  window.CurrentScriptVersions['envCheck'] = '1.0.0';

  var REDIRECT = "/index.html?error=ENV_009";

  var ua = navigator.userAgent;

  // Detect real Chrome (exclude Edge, Opera)
  var isChrome =
    /Chrome/.test(ua) &&
    !/Edg/.test(ua) &&
    !/OPR/.test(ua);

  if (!isChrome) {
    window.location.replace(REDIRECT);
  }
})();