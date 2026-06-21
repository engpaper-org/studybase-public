(function () {
  function isLoggedIn() { return Boolean(window.StudyBaseServices?.isLoggedIn?.()); }
  function requireAuth(redirectUrl = "/myaccount/login.html?sessionExpired=true") {
    if (isLoggedIn()) return true;
    window.location.replace(redirectUrl);
    return false;
  }
  async function logout() {
    await window.StudyBaseServices?.logout?.();
    const target = "/myaccount/login.html";
    try { (window.top !== window.self ? window.top : window).location.replace(target); }
    catch (_) { window.location.replace(target); }
  }
  window.AccountAuth = { isLoggedIn, requireAuth, logout };
  window.addEventListener("studybase:account-session-cleared", () => {
    if (!isLoggedIn() && !location.pathname.endsWith("/login.html")) location.replace("/myaccount/login.html?sessionExpired=true");
  });
})();
