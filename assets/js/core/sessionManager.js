(function () {
  const KEYS = {
    user: "gh_username",
    pass: "gh_password",
    device: "gh_device",
    expiry: "gh_session_expiry",
    expirySetAt: "gh_session_expiry_set_at",
    deviceB64: "gh_device_b64",
    accountEmail: "sb_accountEmail",
    quickLogin: "sb_quickLogin",
    quickLoginHash: "sb_quickLoginCodeHash",
    deviceRotationCheckedAt: "sb_deviceRotationCheckedAt",
    deviceRotationKey: "sb_deviceRotationKey",
  };

  const CHECK_EVERY_MS = 10_000;
  const DEVICE_ROTATION_CHECK_EVERY_MS = 30 * 60 * 1000;

  let modalShown = false;
  let timerId = null;
  let rotationInFlight = false;

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

  function normaliseDeviceCode(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, "");
  }

  function getCreds() {
    return {
      username: getStr(KEYS.user),
      password: getStr(KEYS.pass),
      deviceCode: normaliseDeviceCode(getStr(KEYS.device))
    };
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
   * Returns the next occurrence of Friday 12:00 in the user's local timezone.
   * If it's already Friday and >= 12:00, returns next week's Friday 12:00.
   */
  function nextFridayAtNoonMs(now = new Date()) {
    const d = new Date(now);

    // JS: 0=Sun ... 5=Fri
    const day = d.getDay();
    const daysUntilFriday = (5 - day + 7) % 7;

    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + daysUntilFriday);

    // If it's Friday and time is already past noon, move to next Friday
    if (d.getTime() <= now.getTime()) {
      d.setDate(d.getDate() + 7);
      d.setHours(12, 0, 0, 0);
    }

    return d.getTime();
  }

  function setExpiryIfNeeded() {
    if (!anyCredentialPresent()) return;

    const currentExpiry = parseExpiryMs();
    const nextNoonExpiry = nextFridayAtNoonMs(new Date());
    if (currentExpiry != null && currentExpiry <= nextNoonExpiry) return;

    setNextSessionExpiry();
  }

  function setNextSessionExpiry() {
    const expiryMs = nextFridayAtNoonMs(new Date());
    localStorage.setItem(KEYS.expiry, String(expiryMs));
    localStorage.setItem(KEYS.expirySetAt, new Date().toISOString());
  }

  function setDeviceCode(deviceCode) {
    const next = normaliseDeviceCode(deviceCode);
    if (!next) return "";

    localStorage.setItem(KEYS.device, next);

    try {
      localStorage.setItem(KEYS.deviceB64, btoa(next));
    } catch (_) {}

    return next;
  }

  function rememberAccount(account) {
    if (!account || typeof account !== "object") return;

    if (account.email) localStorage.setItem(KEYS.accountEmail, account.email);
    if (account.profile?.firstName) localStorage.setItem("sb_firstName", account.profile.firstName);
    if (account.deviceRotationKey) localStorage.setItem(KEYS.deviceRotationKey, account.deviceRotationKey);
  }

  async function apiBase() {
    if (window.StudyBaseServices?.apiBase) {
      return window.StudyBaseServices.apiBase();
    }

    try {
      const config = window.SiteConfig?.ready ? await window.SiteConfig.ready : window.SB_CONFIG;
      return config?.endpoints?.apiBase || "https://api.studybase.site";
    } catch (_) {
      return "https://api.studybase.site";
    }
  }

  async function postAccount(path, payload) {
    if (window.StudyBaseServices?.post) {
      return window.StudyBaseServices.post(path, payload);
    }

    const base = (await apiBase()).replace(/\/+$/, "");
    const res = await fetch(`${base}${path}`, {
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

    if (data?.deviceCode) setDeviceCode(data.deviceCode);
    if (data?.account) rememberAccount(data.account);
    return data;
  }

  async function rotateDeviceIfNeeded() {
    const creds = getCreds();
    if (!creds.username || !creds.password || !creds.deviceCode || modalShown || rotationInFlight) return;

    const lastCheck = Number(localStorage.getItem(KEYS.deviceRotationCheckedAt) || 0);
    if (Number.isFinite(lastCheck) && Date.now() - lastCheck < DEVICE_ROTATION_CHECK_EVERY_MS) return;

    rotationInFlight = true;
    localStorage.setItem(KEYS.deviceRotationCheckedAt, String(Date.now()));

    try {
      if (window.StudyBaseServices?.rotateDeviceIfNeeded) {
        const result = await window.StudyBaseServices.rotateDeviceIfNeeded();
        if (result?.account) rememberAccount(result.account);
        return;
      }

      await postAccount("/account/device/rotate", creds);
    } catch (_) {
      localStorage.removeItem(KEYS.deviceRotationCheckedAt);
    } finally {
      rotationInFlight = false;
    }
  }

  function canUseQuickLogin() {
    const creds = getCreds();
    return Boolean(
      creds.username &&
      creds.password &&
      creds.deviceCode &&
      localStorage.getItem(KEYS.quickLogin) === "true" &&
      getStr(KEYS.quickLoginHash)
    );
  }

  async function runQuickLogin(code) {
    const creds = getCreds();
    return postAccount("/account/quick-login", {
      ...creds,
      email: getStr(KEYS.accountEmail),
      quickLoginCode: String(code || "").replace(/\D/g, "")
    });
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
    const quickLoginReady = canUseQuickLogin();

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
                Your weekly device session needs refreshing. Use Quick Login to get a new device code, or sign in again.
              </p>
            </div>
          </div>

          ${quickLoginReady ? `
          <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label for="gh-quick-login-code" class="text-xs font-black uppercase tracking-widest text-slate-500">
              Quick Login code
            </label>
            <input
              id="gh-quick-login-code"
              inputmode="numeric"
              maxlength="6"
              autocomplete="one-time-code"
              class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-black tracking-[0.24em] outline-none focus:ring-4 focus:ring-blue-100"
              placeholder="123456"
            >
            <p id="gh-quick-login-error" class="mt-2 hidden text-sm font-semibold text-red-600"></p>
            <button id="gh-quick-login-confirm"
              class="mt-3 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 transition active:scale-[0.99]">
              Continue with Quick Login
            </button>
          </div>
          ` : ""}

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

    const quickBtn = overlay.querySelector("#gh-quick-login-confirm");
    const quickInput = overlay.querySelector("#gh-quick-login-code");
    const quickError = overlay.querySelector("#gh-quick-login-error");

    quickInput?.addEventListener("input", () => {
      quickInput.value = String(quickInput.value || "").replace(/\D/g, "").slice(0, 6);
      if (quickError) quickError.classList.add("hidden");
    });

    quickBtn?.addEventListener("click", async () => {
      const code = String(quickInput?.value || "").replace(/\D/g, "");

      if (!/^\d{6}$/.test(code)) {
        if (quickError) {
          quickError.textContent = "Enter your full 6 digit Quick Login code.";
          quickError.classList.remove("hidden");
        }
        return;
      }

      quickBtn.disabled = true;
      quickBtn.textContent = "Checking...";

      try {
        const result = await runQuickLogin(code);

        if (!result?.ok) {
          throw new Error(result?.error || "Quick Login failed.");
        }

        if (result.deviceCode) setDeviceCode(result.deviceCode);
        if (result.account) rememberAccount(result.account);

        setNextSessionExpiry();
        modalShown = false;
        overlay.remove();
      } catch (error) {
        if (quickError) {
          quickError.textContent = error?.message || "Quick Login failed.";
          quickError.classList.remove("hidden");
        }
        quickBtn.disabled = false;
        quickBtn.textContent = "Continue with Quick Login";
      }
    });

    setTimeout(() => quickInput?.focus(), 50);

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
      return;
    }

    rotateDeviceIfNeeded();
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
