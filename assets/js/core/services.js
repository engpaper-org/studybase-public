(function () {
  const DEVICE_B64_KEY = "gh_device_b64";
  const ACCOUNT_EMAIL_KEY = "sb_accountEmail";

  let cachedConfig = null;

  function normaliseDeviceCode(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[^1-9A-Z]/g, "");
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
    return config?.endpoints?.apiBase || "https://api.studybase.site";
  }

  async function endpoint(path) {
    const base = (await apiBase()).replace(/\/+$/, "");
    return `${base}${path}`;
  }

  function credentials() {
    return {
      username: (localStorage.getItem("gh_username") || "").trim(),
      password: (localStorage.getItem("gh_password") || "").trim(),
      deviceCode: normaliseDeviceCode(localStorage.getItem("gh_device") || "")
    };
  }

  function isLoggedIn() {
    const creds = credentials();
    return Boolean(creds.username && creds.password && creds.deviceCode);
  }

  function setDeviceCode(deviceCode) {
    const next = normaliseDeviceCode(deviceCode);
    if (!next) return "";

    localStorage.setItem("gh_device", next);

    try {
      localStorage.setItem(DEVICE_B64_KEY, btoa(next));
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

  window.StudyBaseServices = {
    getConfig,
    apiBase,
    endpoint,
    post,
    credentials,
    isLoggedIn,
    setDeviceCode,
    rememberAccount,
    accountMe,
    tokens,
    redeem,
    updateProfile,
    rotateDeviceIfNeeded,
    quickLogin
  };
})();
