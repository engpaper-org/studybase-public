(function () {
  const KEYS = {
    user: "gh_username",
    pass: "gh_password",
    device: "gh_device",
    expiry: "gh_session_expiry",
    expirySetAt: "gh_session_expiry_set_at",
  };

  const CHECK_EVERY_MS = 10_000;

  let modalShown = false;
  let timerId = null;

  // ---------------------------
  // Helpers
  // ---------------------------

  function getStr(key) {
    const v = localStorage.getItem(key);
    return (v ?? "").toString().trim();
  }

  function anyCredentialPresent() {
    return !!(getStr(KEYS.user) || getStr(KEYS.pass) || getStr(KEYS.device));
  }

  function parseExpiryMs() {
    const raw = localStorage.getItem(KEYS.expiry);
    if (!raw) return null;

    // Supports ISO string or numeric ms
    const asNum = Number(raw);
    if (Number.isFinite(asNum) && asNum > 0) return asNum;

    const d = new Date(raw);
    const ms = d.getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  /**
   * Returns the next occurrence of Friday 20:00 (8:00pm) in the user's local timezone.
   * If it's already Friday and >= 20:00, returns next week's Friday 20:00.
   */
  function nextFridayAt8pmMs(now = new Date()) {
    const d = new Date(now);

    // JS: 0=Sun ... 5=Fri
    const day = d.getDay();
    const daysUntilFriday = (5 - day + 7) % 7;

    d.setHours(20, 0, 0, 0);
    d.setDate(d.getDate() + daysUntilFriday);

    // If it's Friday and time is already past 20:00, move to next Friday
    if (d.getTime() <= now.getTime()) {
      d.setDate(d.getDate() + 7);
      d.setHours(20, 0, 0, 0);
    }

    return d.getTime();
  }

  function setExpiryIfNeeded() {
    if (!anyCredentialPresent()) return;

    // Only set if not already set
    if (parseExpiryMs() != null) return;

    const expiryMs = nextFridayAt8pmMs(new Date());
    localStorage.setItem(KEYS.expiry, String(expiryMs));
    localStorage.setItem(KEYS.expirySetAt, new Date().toISOString());
  }

  function clearCredsAndRedirect() {
    localStorage.removeItem(KEYS.user);
    localStorage.removeItem(KEYS.pass);
    localStorage.removeItem(KEYS.device);
    localStorage.removeItem(KEYS.expiry);
    localStorage.removeItem(KEYS.expirySetAt);

    // Redirect
    window.location.href = "/index.html?sessionExpired=true";
  }

  // ---------------------------
  // Modal UI (Tailwind)
  // ---------------------------

  function ensureTailwind() {
    // If Tailwind isn't available on this page, you can still use the basic CSS,
    // but most of your site likely already includes it.
    // We won't inject tailwindcdn automatically to avoid duplicating it.
  }

  function showExpiredModal() {
    if (modalShown) return;
    modalShown = true;

    ensureTailwind();

    const overlay = document.createElement("div");
    overlay.id = "gh-expired-overlay";
    overlay.className =
      "fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4";

    overlay.innerHTML = `
      <div class="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div class="p-5">
          <div class="flex items-start gap-3">
            <div class="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M10.29 3.86l-8.2 14.2A2 2 0 003.83 21h16.34a2 2 0 001.74-2.94l-8.2-14.2a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-black text-slate-900">Session expired</h3>
              <p class="mt-1 text-sm text-slate-500 leading-relaxed">
                To continue to use the site, please login again.
              </p>
            </div>
          </div>

          <div class="mt-5 flex gap-3">
            <button id="gh-expired-confirm"
              class="w-full rounded-xl bg-slate-900 hover:bg-black text-white font-bold py-3 transition active:scale-[0.99]">
              Login again
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const confirmBtn = overlay.querySelector("#gh-expired-confirm");
    confirmBtn.addEventListener("click", clearCredsAndRedirect, { once: true });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        // do nothing
      }
    });
  }

  // ---------------------------
  // Expiry check loop
  // ---------------------------

  function checkExpiryAndAct() {
    setExpiryIfNeeded();

    const expiryMs = parseExpiryMs();
    if (expiryMs == null) return;

    if (Date.now() >= expiryMs) {
      showExpiredModal();
    }
  }

  function start() {
    // run once immediately
    checkExpiryAndAct();

    // then poll every 10 seconds
    timerId = window.setInterval(checkExpiryAndAct, CHECK_EVERY_MS);

    // also re-check on tab focus (so it triggers immediately when you come back)
    window.addEventListener("focus", checkExpiryAndAct);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) checkExpiryAndAct();
    });
  }

  // ---------------------------
  // Manual testing hook
  // ---------------------------

  window.sessionExpireManual = function () {
    // Set expiry to now, so next check triggers modal instantly
    localStorage.setItem(KEYS.expiry, String(Date.now()));
    localStorage.setItem(KEYS.expirySetAt, new Date().toISOString());
    checkExpiryAndAct();
    return "Set gh_session_expiry to now (manual test).";
  };

  // Start when DOM is ready (safe even if placed in <head>)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();