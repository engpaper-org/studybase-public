(() => {
  function getErrorCode() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("error") || "").trim();
  }

  function removeErrorFromUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url.toString());
  }

  function ensureErrorHost() {
    let host = document.getElementById("resource-error-host");
    if (host) return host;

    host = document.createElement("div");
    host.id = "resource-error-host";
    host.className = "fixed inset-0 z-[200] hidden items-center justify-center bg-slate-950/55 backdrop-blur-xl p-4";
    document.body.appendChild(host);
    return host;
  }

  function openErrorModal(config) {
    const host = ensureErrorHost();

    host.innerHTML = `
      <div class="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border ${config.cardBorder} ${config.cardBg} shadow-[0_30px_100px_-20px_rgba(15,23,42,0.35)]">
        <div class="absolute inset-x-0 top-0 h-24 ${config.topGlow} opacity-70 pointer-events-none"></div>
        <div class="absolute -top-12 -right-10 w-40 h-40 rounded-full ${config.orbA} blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-16 -left-10 w-40 h-40 rounded-full ${config.orbB} blur-3xl pointer-events-none"></div>

        <button
          id="resource-error-close"
          type="button"
          class="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/90 border border-white/70 text-slate-500 hover:text-slate-900 hover:bg-white transition flex items-center justify-center shadow-sm"
          aria-label="Close"
        >
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>

        <div class="relative p-6 md:p-8">
          <div class="flex items-start gap-4 md:gap-5">
            <div class="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-[1.5rem] flex items-center justify-center text-3xl md:text-4xl ${config.iconWrap} shadow-sm">
              <span aria-hidden="true">${config.emoji}</span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.18em] ${config.badge}">
                ${config.badgeText}
              </div>

              <h2 class="mt-4 text-2xl md:text-4xl font-black tracking-tight leading-none text-slate-900">
                ${config.title}
              </h2>

              <p class="mt-4 text-sm md:text-base leading-relaxed text-slate-600 max-w-xl">
                ${config.message}
              </p>

              ${
                config.code
                  ? `
                <div class="mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50/90 px-4 py-3.5">
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 mb-1.5">Error code</p>
                  <p class="text-sm font-mono text-slate-700 break-all">${config.code}</p>
                </div>
              `
                  : ""
              }

              <div class="mt-6 flex flex-wrap gap-3">
                <button
                  id="resource-error-dismiss"
                  type="button"
                  class="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm md:text-base font-black bg-slate-900 text-white hover:bg-black transition shadow-sm"
                >
                  <i class="fa-solid fa-check"></i>
                  Got it
                </button>

                <button
                  id="resource-error-back"
                  type="button"
                  class="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm md:text-base font-black bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                >
                  <i class="fa-solid fa-arrow-left"></i>
                  Back to resources
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    host.classList.remove("hidden");
    host.classList.add("flex");

    const close = () => {
      host.classList.add("hidden");
      host.classList.remove("flex");
      host.innerHTML = "";
      removeErrorFromUrl();
    };

    document.getElementById("resource-error-close")?.addEventListener("click", close);
    document.getElementById("resource-error-dismiss")?.addEventListener("click", close);
    document.getElementById("resource-error-back")?.addEventListener("click", () => {
      close();
      window.location.hash = "primary-access";
    });

    host.addEventListener("click", (e) => {
      if (e.target === host) close();
    }, { once: true });

    document.addEventListener("keydown", function escHandler(e) {
      if (e.key === "Escape") {
        close();
        document.removeEventListener("keydown", escHandler);
      }
    });
  }

  function getErrorConfig(errorCode) {
    const code = (errorCode || "").toLowerCase();

    const themes = {
      diamond: {
        cardBg: "bg-gradient-to-br from-slate-950 via-sky-950 to-indigo-950",
        cardBorder: "border-cyan-300/20",
        topGlow: "bg-gradient-to-r from-cyan-400/30 via-sky-400/25 to-indigo-500/30",
        orbA: "bg-cyan-400/20",
        orbB: "bg-indigo-400/20",
        iconWrap: "bg-white/10 border border-white/10 text-white",
        badge: "bg-white/10 text-cyan-100 border border-white/10",
        badgeText: "Diamond required",
        emoji: "💎",
        titleClass: "text-white"
      },
      unavailable: {
        cardBg: "bg-gradient-to-br from-white via-amber-50 to-orange-50",
        cardBorder: "border-amber-200",
        topGlow: "bg-gradient-to-r from-amber-300/50 via-orange-300/40 to-yellow-300/40",
        orbA: "bg-amber-300/30",
        orbB: "bg-orange-300/25",
        iconWrap: "bg-white border border-amber-100 text-amber-600",
        badge: "bg-white/80 text-amber-700 border border-amber-100",
        badgeText: "Temporarily unavailable",
        emoji: "⏳"
      },
      update: {
        cardBg: "bg-gradient-to-br from-white via-blue-50 to-indigo-50",
        cardBorder: "border-blue-200",
        topGlow: "bg-gradient-to-r from-blue-300/50 via-indigo-300/40 to-sky-300/40",
        orbA: "bg-blue-300/25",
        orbB: "bg-indigo-300/25",
        iconWrap: "bg-white border border-blue-100 text-blue-600",
        badge: "bg-white/80 text-blue-700 border border-blue-100",
        badgeText: "Resource update",
        emoji: "🛠️"
      },
      unknown: {
        cardBg: "bg-gradient-to-br from-white via-slate-50 to-slate-100",
        cardBorder: "border-slate-200",
        topGlow: "bg-gradient-to-r from-slate-300/40 via-slate-400/35 to-slate-500/30",
        orbA: "bg-slate-300/25",
        orbB: "bg-slate-400/20",
        iconWrap: "bg-white border border-slate-200 text-slate-700",
        badge: "bg-white/80 text-slate-700 border border-slate-200",
        badgeText: "Unknown error",
        emoji: "⚠️"
      }
    };

    if ([
      "diamond",
      "diamond_required",
      "upgrade",
      "upgrade_required",
      "premium",
      "premium_required",
      "members_only"
    ].includes(code)) {
      return {
        ...themes.diamond,
        title: "Diamond membership needed",
        message: "This resource is only available on the Diamond tier. To upgrade, go to My Settings and manage your membership there."
      };
    }

    if ([
      "temporarily_unavailable",
      "unavailable",
      "temp_unavailable",
      "offline",
      "down"
    ].includes(code)) {
      return {
        ...themes.unavailable,
        title: "This resource is temporarily unavailable",
        message: "This resource cannot be opened right now. It may be unavailable because of maintenance, capacity limits, or a short-term issue. Please try again later."
      };
    }

    if ([
      "limited_hours",
      "time_limited",
      "school_hours_only",
      "compute_limited"
    ].includes(code)) {
      return {
        ...themes.unavailable,
        title: "This resource is limited right now",
        message: "This starred resource is only available between 8:20 AM and 3:10 PM. Outside these hours, access is limited to help save compute."
      };
    }

    if ([
      "update",
      "resource_update",
      "updating",
      "refreshing",
      "maintenance"
    ].includes(code)) {
      return {
        ...themes.update,
        title: "This resource is being updated",
        message: "We’re currently applying updates to this resource. Please come back shortly while the latest version is being prepared."
      };
    }

    return {
      ...themes.unknown,
      title: "Something went wrong",
      message: "We couldn’t match this to a known issue. Please try again, and if it keeps happening, report the code below to support.",
      code: errorCode || "unknown"
    };
  }

  function applyTextColors() {
    const modal = document.querySelector("#resource-error-host > div");
    if (!modal) return;

    if (modal.className.includes("from-slate-950")) {
      const title = modal.querySelector("h2");
      const msg = modal.querySelector("p.mt-4");
      const codeWrap = modal.querySelector(".font-mono")?.closest("div");
      if (title) title.classList.remove("text-slate-900"), title.classList.add("text-white");
      if (msg) msg.classList.remove("text-slate-600"), msg.classList.add("text-white/75");
      const badge = modal.querySelector(".inline-flex");
      if (badge) badge.classList.add("backdrop-blur-md");
      if (codeWrap) codeWrap.className = "mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3.5";
      const codeTitle = codeWrap?.querySelector("p:first-child");
      const codeText = codeWrap?.querySelector(".font-mono");
      if (codeTitle) codeTitle.className = "text-[11px] font-black uppercase tracking-[0.18em] text-white/55 mb-1.5";
      if (codeText) codeText.className = "text-sm font-mono text-white/85 break-all";
    }
  }

  function initResourceErrorHandler() {
    const errorCode = getErrorCode();
    if (!errorCode) return;

    const config = getErrorConfig(errorCode);
    openErrorModal(config);
    applyTextColors();
  }

  window.showResourceErrorModal = function showResourceErrorModal(errorCodeOrConfig) {
    const config = typeof errorCodeOrConfig === "string"
      ? getErrorConfig(errorCodeOrConfig)
      : errorCodeOrConfig;

    if (!config) return;
    openErrorModal(config);
    applyTextColors();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initResourceErrorHandler);
  } else {
    initResourceErrorHandler();
  }
})();
