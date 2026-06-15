(function () {
  const AUTH_KEYS = {
    username: "studybase_username",
    password: "studybase_password",
    device: "studybase_device",
    deviceB64: "studybase_device_b64",
    expiry: "studybase_session_expiry",
    expirySetAt: "studybase_session_expiry_set_at",
    legacyUsername: "gh_username",
    legacyPassword: "gh_password",
    legacyDevice: "gh_device",
    legacyDeviceB64: "gh_device_b64",
    legacyExpiry: "gh_session_expiry",
    legacyExpirySetAt: "gh_session_expiry_set_at"
  };
  const ACCOUNT_EMAIL_KEY = "sb_accountEmail";

  let cachedConfig = null;

  function normaliseDeviceCode(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, "");
  }

  async function getConfig() {
    if (cachedConfig) return cachedConfig;

    if (window.SiteConfig?.ready) {
      try {
        cachedConfig = await window.SiteConfig.ready;
        return cachedConfig;
      } catch (_) {}
    }

    cachedConfig = window.SB_CONFIG || {};
    return cachedConfig;
  }

  async function apiBase() {
    const config = await getConfig();
    return config?.endpoints?.apiBase || window.SiteConfig?.defaults?.endpoints?.apiBase || "";
  }

  async function endpoint(path) {
    const base = (await apiBase()).replace(/\/+$/, "");
    return `${base}${path}`;
  }

  function readMigratedKey(primaryKey, legacyKey) {
    const primary = (localStorage.getItem(primaryKey) || "").trim();
    if (primary) return primary;

    const legacy = (localStorage.getItem(legacyKey) || "").trim();
    if (legacy) {
      localStorage.setItem(primaryKey, legacy);
      localStorage.removeItem(legacyKey);
    }
    return legacy;
  }

  function migrateAccountStorage() {
    readMigratedKey(AUTH_KEYS.username, AUTH_KEYS.legacyUsername);
    readMigratedKey(AUTH_KEYS.password, AUTH_KEYS.legacyPassword);
    readMigratedKey(AUTH_KEYS.device, AUTH_KEYS.legacyDevice);
    readMigratedKey(AUTH_KEYS.deviceB64, AUTH_KEYS.legacyDeviceB64);
    readMigratedKey(AUTH_KEYS.expiry, AUTH_KEYS.legacyExpiry);
    readMigratedKey(AUTH_KEYS.expirySetAt, AUTH_KEYS.legacyExpirySetAt);
  }

  function clearAccountSession() {
    [
      AUTH_KEYS.username,
      AUTH_KEYS.password,
      AUTH_KEYS.device,
      AUTH_KEYS.deviceB64,
      AUTH_KEYS.expiry,
      AUTH_KEYS.expirySetAt,
      AUTH_KEYS.legacyUsername,
      AUTH_KEYS.legacyPassword,
      AUTH_KEYS.legacyDevice,
      AUTH_KEYS.legacyDeviceB64,
      AUTH_KEYS.legacyExpiry,
      AUTH_KEYS.legacyExpirySetAt,
      ACCOUNT_EMAIL_KEY,
      "sb_deviceRotationCheckedAt",
      "sb_deviceRotationKey"
    ].forEach((key) => localStorage.removeItem(key));

    window.dispatchEvent(new CustomEvent("studybase:account-session-cleared", {
      detail: { reason: "device_not_authorised" }
    }));
  }

  function isDeviceNotAuthorised(data) {
    return Boolean(
      data &&
      data.ok === false &&
      String(data.error || "").toLowerCase() === "device not authorised"
    );
  }

  function credentials() {
    migrateAccountStorage();

    return {
      username: (localStorage.getItem(AUTH_KEYS.username) || "").trim(),
      password: (localStorage.getItem(AUTH_KEYS.password) || "").trim(),
      deviceCode: normaliseDeviceCode(localStorage.getItem(AUTH_KEYS.device) || "")
    };
  }

  function isLoggedIn() {
    const creds = credentials();
    return Boolean(creds.username && creds.password && creds.deviceCode);
  }

  function setDeviceCode(deviceCode) {
    const next = normaliseDeviceCode(deviceCode);
    if (!next) return "";

    localStorage.setItem(AUTH_KEYS.device, next);
    localStorage.removeItem(AUTH_KEYS.legacyDevice);

    try {
      localStorage.setItem(AUTH_KEYS.deviceB64, btoa(next));
      localStorage.removeItem(AUTH_KEYS.legacyDeviceB64);
    } catch (_) {}

    return next;
  }

  function rememberAccount(account) {
    if (!account || typeof account !== "object") return account;

    if (account.email) {
      localStorage.setItem(ACCOUNT_EMAIL_KEY, account.email);
    }

    if (account.profile?.firstName) {
      localStorage.setItem("sb_firstName", account.profile.firstName);
    }

    if (account.deviceRotationKey) {
      localStorage.setItem("sb_deviceRotationKey", account.deviceRotationKey);
    }

    return account;
  }

  async function post(path, payload) {
    const res = await fetch(await endpoint(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {})
    });

    let data = null;
    try {
      data = await res.json();
    } catch (_) {
      data = { ok: false, error: res.statusText || "Request failed" };
    }

    if (!res.ok && data && data.ok !== false) {
      data.ok = false;
      data.error = data.error || res.statusText || "Request failed";
    }

    if (data?.account) rememberAccount(data.account);
    if (data?.deviceCode) setDeviceCode(data.deviceCode);
    if (isDeviceNotAuthorised(data)) clearAccountSession();

    return data;
  }

  async function accountMe() {
    if (!isLoggedIn()) return { ok: false, error: "Not signed in" };
    return post("/account/me", credentials());
  }

  async function tokens() {
    if (!isLoggedIn()) return { ok: false, error: "Not signed in" };
    return post("/account/tokens", credentials());
  }

  async function redeem(code) {
    if (!isLoggedIn()) return { ok: false, error: "Not signed in" };
    return post("/account/redeem", {
      ...credentials(),
      code
    });
  }

  async function updateProfile(profile) {
    if (!isLoggedIn()) return { ok: false, error: "Not signed in" };
    return post("/account/profile", {
      ...credentials(),
      ...profile
    });
  }

  async function rotateDeviceIfNeeded() {
    if (!isLoggedIn()) return { ok: false, error: "Not signed in" };

    const result = await post("/account/device/rotate", credentials());
    if (result?.deviceRotationKey) {
      localStorage.setItem("sb_deviceRotationKey", result.deviceRotationKey);
    }
    return result;
  }

  async function quickLogin(quickLoginCode) {
    const creds = credentials();
    const email = (localStorage.getItem(ACCOUNT_EMAIL_KEY) || "").trim();

    return post("/account/quick-login", {
      username: creds.username,
      password: creds.password,
      deviceCode: creds.deviceCode,
      email,
      quickLoginCode
    });
  }

  migrateAccountStorage();

  window.StudyBaseServices = {
    getConfig,
    apiBase,
    endpoint,
    post,
    credentials,
    isLoggedIn,
    setDeviceCode,
    migrateAccountStorage,
    clearAccountSession,
    rememberAccount,
    accountMe,
    tokens,
    redeem,
    updateProfile,
    rotateDeviceIfNeeded,
    quickLogin
  };
})();
