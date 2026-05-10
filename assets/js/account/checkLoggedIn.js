

(function () {
  const AUTH_KEYS = [
    "studybase_username",
    "studybase_password",
    "studybase_device",
    "studybase_device_b64",
    "studybase_session_expiry",
    "studybase_session_expiry_set_at"
  ];
  const LEGACY_AUTH_KEYS = [
    "gh_username",
    "gh_password",
    "gh_device",
    "gh_device_b64",
    "gh_session_expiry",
    "gh_session_expiry_set_at"
  ];

  function readMigratedKey(primaryKey, legacyKey) {
    const primary = localStorage.getItem(primaryKey);
    if (primary) return primary;

    const legacy = localStorage.getItem(legacyKey);
    if (legacy) {
      localStorage.setItem(primaryKey, legacy);
      localStorage.removeItem(legacyKey);
    }
    return legacy;
  }

  function isLoggedIn() {
    try {
      const u = readMigratedKey("studybase_username", "gh_username");
      const p = readMigratedKey("studybase_password", "gh_password");
      const d = readMigratedKey("studybase_device", "gh_device");
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
    LEGACY_AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
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

  window.addEventListener("studybase:account-session-cleared", () => {
    if (!isLoggedIn()) {
      window.location.replace("/index.html?error=AUTH_001");
    }
  });
})();
