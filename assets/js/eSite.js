(() => {
  let TARGET_URL = "https://e.revisionbase.site";
  const DEVICE_KEY = "gh_device";
  const USER_KEY = "gh_username";
  const PASS_KEY = "gh_password";

  let countdownTimer = null;
  let moveTimer = null;

  if (window.SiteConfig && window.SiteConfig.ready) {
    window.SiteConfig.ready.then((config) => {
      TARGET_URL = config?.urls?.eSite || TARGET_URL;
    });
  }

  // ---------------------------
  // helpers
  // ---------------------------
  const qs = (sel, root = document) => root.querySelector(sel);
  const safeStr = (v) => (v ?? "").toString().trim();

  function escapeHtml(str) {
    return safeStr(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getDevice() {
    return safeStr(localStorage.getItem(DEVICE_KEY));
  }

  function getUsername() {
    return safeStr(localStorage.getItem(USER_KEY));
  }

  function getPassword() {
    return safeStr(localStorage.getItem(PASS_KEY));
  }

  function looksLoggedIn() {
    return !!(getDevice() && getUsername() && getPassword());
  }

  function isPrivateResourceMode() {
    return safeStr(window.SB_RESOURCE_OPEN_MODE).toLowerCase() === "access_only";
  }

  function isTopLevelPage() {
    try {
      return window.self === window.top;
    } catch {
      return false;
    }
  }

  function shouldShowLaunchBanner() {
    return looksLoggedIn() && isPrivateResourceMode() && isTopLevelPage();
  }

  // ---------------------------
  // mounting
  // ---------------------------
  function ensureWrap() {
  const marker = document.getElementById("global-banner-marker");
  if (!marker) return null;

  let wrap = document.getElementById("sb-banner-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "sb-banner-wrap";
    marker.appendChild(wrap);
  }

  let mount = document.getElementById("sb-history-mode-banner-mount");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "sb-history-mode-banner-mount";
    wrap.appendChild(mount);
  }

  return { wrap, mount };
}

  function tryMoveWrapUnderNavbar() {
    const nav = qs("#navbar-placeholder");
    const wrap = qs("#sb-banner-wrap");
    if (!nav || !wrap) return false;
    if (wrap.previousElementSibling === nav) return true;
    nav.insertAdjacentElement("afterend", wrap);
    return true;
  }

  function setBannerHTML(mount, html) {
  mount.innerHTML = `<div class="mb-6">${html}</div>`;
}

  function clearBanner(mount) {
    if (mount) mount.innerHTML = "";
  }

  // ---------------------------
  // modal
  // ---------------------------
  function ensureLaunchModal() {
    let modal = document.getElementById("sb-history-mode-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "sb-history-mode-modal";
    modal.className =
      "hidden fixed inset-0 z-[140] bg-slate-950/75 backdrop-blur-md items-center justify-center p-4";

    modal.innerHTML = `
      <div class="relative w-full max-w-2xl rounded-[2rem] overflow-hidden border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-[0_25px_80px_-20px_rgba(0,0,0,0.65)]">
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-cyan-400/10 blur-3xl"></div>
          <div class="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-indigo-500/10 blur-3xl"></div>
        </div>

        <button
          id="sb-history-mode-close"
          type="button"
          aria-label="Close"
          class="absolute top-4 right-4 z-10 w-11 h-11 rounded-full border border-white/10 bg-white/10 text-white/80 hover:bg-white/15 hover:text-white transition flex items-center justify-center"
        >
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>

        <div class="relative p-6 md:p-8">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 shrink-0 rounded-2xl border border-cyan-300/15 bg-white/10 flex items-center justify-center text-2xl shadow-lg">
              🚀
            </div>

            <div class="min-w-0">
              <div class="inline-flex items-center rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                Beta feature
              </div>

              <h3 class="mt-3 text-2xl md:text-3xl font-black tracking-tight leading-tight">
                Launch single entry browsing mode?
              </h3>

              <p class="mt-3 text-sm md:text-base leading-relaxed text-white/75">
                In this mode you are able to customise the icon and name of the tab, while also being able to choose where it redirects to if it is entered from your search history.
              </p>
            </div>
          </div>

          <div class="mt-6 grid gap-3">
            <div class="rounded-2xl border border-amber-300/15 bg-amber-400/10 p-4">
              <div class="flex items-start gap-3">
                <div class="text-xl leading-none">⚠️</div>
                <div>
                  <p class="font-bold text-amber-100">Important limitations</p>
                  <p class="mt-1 text-sm leading-relaxed text-white/75">
                    In this mode, auto redirect and auto logout do not work. This means if the link is clicked on from the search history then it will go to the home page and you will remian logged in (unless you setup a redirect page).
                  </p>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div class="flex items-start gap-3">
                <div class="text-xl leading-none">🕘</div>
                <div>
                  <p class="font-bold text-white">Early access</p>
                  <p class="mt-1 text-sm leading-relaxed text-white/75">
                    This feature is still in early access, so there may be bugs on some pages. All data from this feature will still be processed in line with our MSA.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p class="text-sm text-white/70">
              Please wait <span id="sb-history-mode-countdown" class="font-black text-white">3</span> seconds before continuing.
            </p>
          </div>

          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              id="sb-history-mode-confirm"
              type="button"
              disabled
              class="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm md:text-base font-black bg-white text-slate-900 opacity-50 cursor-not-allowed transition"
            >
              Launch
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </button>

            <button
              id="sb-history-mode-cancel"
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm md:text-base font-black bg-white/8 text-white border border-white/10 hover:bg-white/12 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    qs("#sb-history-mode-close", modal)?.addEventListener("click", closeLaunchModal);
    qs("#sb-history-mode-cancel", modal)?.addEventListener("click", closeLaunchModal);
    qs("#sb-history-mode-confirm", modal)?.addEventListener("click", confirmLaunchMode);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeLaunchModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        closeLaunchModal();
      }
    });

    return modal;
  }

  function resetLaunchCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }

    const modal = document.getElementById("sb-history-mode-modal");
    if (!modal) return;

    const countdownEl = qs("#sb-history-mode-countdown", modal);
    const confirmBtn = qs("#sb-history-mode-confirm", modal);
    if (!countdownEl || !confirmBtn) return;

    let remaining = 3;
    countdownEl.textContent = String(remaining);

    confirmBtn.disabled = true;
    confirmBtn.classList.add("opacity-50", "cursor-not-allowed");
    confirmBtn.classList.remove("hover:bg-slate-100");

    countdownTimer = setInterval(() => {
      remaining -= 1;

      if (remaining > 0) {
        countdownEl.textContent = String(remaining);
        return;
      }

      countdownEl.textContent = "0";
      confirmBtn.disabled = false;
      confirmBtn.classList.remove("opacity-50", "cursor-not-allowed");
      confirmBtn.classList.add("hover:bg-slate-100");

      clearInterval(countdownTimer);
      countdownTimer = null;
    }, 1000);
  }

  function openLaunchModal() {
    const modal = ensureLaunchModal();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
    resetLaunchCountdown();
  }

  function closeLaunchModal() {
    const modal = document.getElementById("sb-history-mode-modal");
    if (!modal) return;

    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }

    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "";
  }

  function confirmLaunchMode() {
    closeLaunchModal();
    window.location.replace(TARGET_URL);
  }

  // ---------------------------
  // banner
  // ---------------------------
  function renderLaunchBanner(mount) {
  const btnId = "sb-history-mode-launch-btn";

  setBannerHTML(
    mount,
    `
    <div id="sb-history-mode-banner" class="relative overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-[0_22px_70px_-22px_rgba(14,165,233,0.35)]">
      <div class="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-sky-400/5 to-indigo-500/10 pointer-events-none"></div>
      <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl bg-cyan-400/10 pointer-events-none"></div>
      <div class="absolute -bottom-12 -left-10 w-40 h-40 rounded-full blur-3xl bg-indigo-400/10 pointer-events-none"></div>

      <div class="relative p-5 md:p-7">
        <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div class="min-w-0 flex items-start gap-4 md:gap-5">
            <div class="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] flex items-center justify-center text-3xl md:text-4xl shrink-0 bg-white/10 border border-white/10 text-white shadow-[0_10px_35px_rgba(255,255,255,0.06)]">
              <span aria-hidden="true">🕶️</span>
            </div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2 md:gap-3">
                <span class="px-3 py-1 rounded-full text-[11px] md:text-xs font-black uppercase tracking-[0.18em] bg-white/10 text-cyan-100 border border-white/10 backdrop-blur-md">
                  New browsing mode
                </span>
                <span class="text-xs md:text-sm font-bold text-white/65">
                  <b>FREE beta feature
                </span>
              </div>

              <h3 class="mt-3 text-2xl md:text-4xl font-black tracking-tight leading-none">
                <span class="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-sky-200">
                  Single entry browsing
                </span>
              </h3>

              <p class="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-white/75">
                You can now browse RevisionBase without it showing up in your search history multiple times. This mode is designed to keep it to one browser history entry.
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row xl:flex-col gap-3 xl:min-w-[220px]">
            <button
              id="${btnId}"
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm md:text-base font-black bg-white text-sky-700 hover:bg-sky-50 shadow-[0_10px_30px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Launch
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    `
  );

  document.getElementById(btnId)?.addEventListener("click", openLaunchModal);
}

  async function rerender(mount) {
    if (!mount) return;

    if (!shouldShowLaunchBanner()) {
      clearBanner(mount);
      return;
    }

    renderLaunchBanner(mount);
  }

  async function run() {
    const mounts = ensureWrap();
    if (!mounts) return;

    ensureLaunchModal();

    tryMoveWrapUnderNavbar();

    moveTimer = setInterval(() => {
      const moved = tryMoveWrapUnderNavbar();
      if (moved) clearInterval(moveTimer);
    }, 250);

    setTimeout(() => {
      if (moveTimer) clearInterval(moveTimer);
    }, 6000);

    await rerender(mounts.mount);

    window.addEventListener("sb:resource-mode-changed", async () => {
      await rerender(mounts.mount);
    });

    window.addEventListener("storage", async (e) => {
      if (![DEVICE_KEY, USER_KEY, PASS_KEY].includes(e.key)) return;
      await rerender(mounts.mount);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
