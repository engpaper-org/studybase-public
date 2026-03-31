

(function () {
  const AUTH_KEYS = ["gh_username", "gh_password", "gh_device"];

  function isLoggedIn() {
    try {
      const u = localStorage.getItem("gh_username");
      const p = localStorage.getItem("gh_password");
      const d = localStorage.getItem("gh_device");
      return !!(u && p && d);
    } catch (_) {
      return false;
    }
  }

  function requireAuth(redirectUrl = "/index.html?error=AUTH_001") {
    if (!isLoggedIn()) {
      window.location.replace(redirectUrl);
      return false;
    }
    return true;
  }

  function logout() {
  try {
    AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch (_) {}

  const target = "/index.html?error=AUTH_001";

  try {
    // If inside an iframe, redirect the top window
    if (window.top !== window.self) {
      window.top.location.replace(target);
    } else {
      window.location.replace(target);
    }
  } catch (_) {
    // Fallback in case of cross-origin iframe restrictions
    window.location.replace(target);
  }
}

  // Expose tiny API globally
  window.AccountAuth = { isLoggedIn, requireAuth, logout };
})();