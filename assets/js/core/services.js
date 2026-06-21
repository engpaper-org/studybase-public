(function () {
  const API_BASE = "https://api.studybase.site/api";
  const TOKEN_KEY = "studybase_session_active";
  const EXPIRY_KEY = "studybase_session_expiry";

  function token() { return ""; }
  function isLoggedIn() {
    const expiry = Date.parse(localStorage.getItem(EXPIRY_KEY) || "");
    return Boolean(localStorage.getItem(TOKEN_KEY) === "1" && Number.isFinite(expiry) && expiry > Date.now());
  }
  function clearAccountSession() {
    [TOKEN_KEY, "studybase_token", EXPIRY_KEY, "studybase_username", "sb_firstName", "studybase_password", "studybase_device", "studybase_device_b64", "sb_accountEmail"].forEach(k => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent("studybase:account-session-cleared"));
  }
  async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");
    if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: "include" });
    const data = await response.json().catch(() => ({ ok: false, error: "Invalid server response" }));
    if (response.status === 401) clearAccountSession();
    if (!response.ok) return { ok: false, ...data };
    return data;
  }
  function rememberUser(user) {
    if (!user) return;
    if (user.username) localStorage.setItem("studybase_username", user.username);
    if (user.name) localStorage.setItem("sb_firstName", user.name.split(/\s+/)[0]);
  }
  async function accountMe() {
    if (!isLoggedIn()) return { ok: false, error: "Not signed in" };
    const result = await request("/me");
    if (result.user) rememberUser(result.user);
    return result.user ? { ...result, account: { ...result.user, profile: { firstName: result.user.name } } } : result;
  }
  async function logout() {
    try { await request("/logout", { method: "POST", body: "{}" }); } finally { clearAccountSession(); }
  }
  async function deleteAccount(confirmation) {
    return request("/account", { method: "DELETE", body: JSON.stringify({ confirmation }) });
  }
  async function updateProfile(profile) {
    const result = await request("/profile", { method: "POST", body: JSON.stringify(profile || {}) });
    if (result.user) rememberUser(result.user);
    return result;
  }
  window.StudyBaseServices = { API_BASE, token, isLoggedIn, clearAccountSession, accountMe, logout, deleteAccount, updateProfile, request, rotateDeviceIfNeeded: async () => ({ ok: true }) };
})();
