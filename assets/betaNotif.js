// betaNotice.js
(function () {
  const STORAGE_KEY = "studybase_beta_notice_seen_v1";
  const COUNTDOWN_SECONDS = 5;

  // Stop if already shown before
  if (localStorage.getItem(STORAGE_KEY) === "true") return;

  let timeLeft = COUNTDOWN_SECONDS;

  function createOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "beta-overlay";
    overlay.className =
      "fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4";

    overlay.innerHTML = `
      <div class="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-[fadeIn_.25s_ease-out]">
        <div class="p-8">
          <div class="flex items-center gap-3 mb-5">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 text-2xl">
              ⚠️
            </div>
            <div>
              <h2 class="text-2xl font-bold text-slate-900">Beta Notice</h2>
              <p class="text-sm text-slate-500">Please read before continuing</p>
            </div>
          </div>

          <div class="space-y-4 text-slate-700 text-[15px] leading-6">
            <p>
              Welcome! This site is currently in <span class="font-semibold text-slate-900">beta</span>.
              That means some features may still be unfinished, changed, removed, or improved over time.
            </p>
            <p>
              You may notice design tweaks, small bugs, missing content, or things that work differently later on.
              We appreciate your patience while everything is being refined.
            </p>
          </div>

          <div class="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p class="text-sm text-slate-600">
              Continue button unlocks in
              <span id="beta-countdown" class="font-bold text-slate-900">${COUNTDOWN_SECONDS}</span>
              second${COUNTDOWN_SECONDS === 1 ? "" : "s"}.
            </p>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              id="beta-continue-btn"
              disabled
              class="inline-flex items-center justify-center rounded-2xl bg-slate-300 px-5 py-3 text-sm font-semibold text-white cursor-not-allowed transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const countdownEl = document.getElementById("beta-countdown");
    const buttonEl = document.getElementById("beta-continue-btn");

    const timer = setInterval(() => {
      timeLeft--;
      if (countdownEl) {
        countdownEl.textContent = String(timeLeft);
      }

      if (timeLeft <= 0) {
        clearInterval(timer);

        buttonEl.disabled = false;
        buttonEl.textContent = "Continue";
        buttonEl.className =
          "inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition cursor-pointer";
      }
    }, 1000);

    buttonEl.addEventListener("click", function () {
      localStorage.setItem(STORAGE_KEY, "true");

      overlay.classList.add("opacity-0", "transition-opacity", "duration-200");
      setTimeout(() => {
        overlay.remove();
      }, 200);
    });
  }

  function init() {
    if (!document.body) {
      window.addEventListener("DOMContentLoaded", createOverlay, { once: true });
    } else {
      createOverlay();
    }
  }

  init();
})();