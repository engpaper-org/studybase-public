(function () {
  const API_BASE = "https://api.platformbase.online/api";
  const TOKEN_KEY = "studybase_session_active";
  const EXPIRY_KEY = "studybase_session_expiry";
  let authenticationRequiredNotified = false;

  function token() { return ""; }
  function isLoggedIn() {
    const expiry = Date.parse(localStorage.getItem(EXPIRY_KEY) || "");
    return Boolean(localStorage.getItem(TOKEN_KEY) === "1" && Number.isFinite(expiry) && expiry > Date.now());
  }
  function clearAccountSession(detail = {}) {
    [TOKEN_KEY, EXPIRY_KEY, "studybase_user"].forEach(k => localStorage.removeItem(k));
    const reason = String(detail?.reason || "");
    if (reason === "authentication-required" && authenticationRequiredNotified) return;
    if (reason === "authentication-required") authenticationRequiredNotified = true;
    window.dispatchEvent(new CustomEvent("studybase:account-session-cleared", { detail: { reason } }));
    if (reason === "authentication-required" && window.parent !== window) {
      window.parent.postMessage({ type: "studybase:session-ended", reason }, window.location.origin);
    }
  }
  async function request(path, options = {}) {
    const { suppressAuthRequired = false, ...fetchOptions } = options;
    const headers = new Headers(fetchOptions.headers || {});
    headers.set("Accept", "application/json");
    if (fetchOptions.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const response = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers, credentials: "include" });
    const data = await response.json().catch(() => ({ ok: false, error: "Invalid server response" }));
    if (!suppressAuthRequired && response.status === 401 && data?.ok === false && data?.error === "Authentication required") clearAccountSession({ reason: "authentication-required" });
    if (!response.ok) return { ok: false, ...data };
    return data;
  }
  function rememberUser(user) {
    if (!user) return;
    localStorage.setItem("studybase_user", JSON.stringify(user));
  }
  async function accountMe() {
    if (!isLoggedIn()) return { ok: false, error: "Not signed in" };
    const result = await request("/me");
    if (result.user) rememberUser(result.user);
    return result.user ? { ...result, account: { ...result.user, profile: { firstName: result.user.name } } } : result;
  }
  async function logout() {
    try { await request("/logout", { method: "POST", body: "{}", suppressAuthRequired: true }); } finally { clearAccountSession({ reason: "signed-out" }); }
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
  window.addEventListener("studybase:account-session-updated", () => { authenticationRequiredNotified = false; });
})();
