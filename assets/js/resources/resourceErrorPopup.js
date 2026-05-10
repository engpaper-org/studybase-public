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
    host.className = "fixed inset-0 z-[200] hidden items-center justify-center bg-slate-950/62 backdrop-blur-2xl p-4 md:p-6";
    document.body.appendChild(host);
    return host;
  }

  function buildActionButton(id, label, icon, classes) {
    return `
      <button
        id="${id}"
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm md:text-[15px] font-extrabold tracking-tight transition-all duration-200 ${classes}"
      >
        <i class="${icon}"></i>
        ${label}
      </button>
    `;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildResourcePreview(preview) {
    if (!preview || typeof preview !== "object") return "";

    const name = escapeHtml(preview.name || "Resource");
    const imageUrl = String(preview.imageUrl || "").trim();
    const iconHtml = imageUrl && imageUrl !== "pass"
      ? `<img src="${escapeHtml(imageUrl)}" alt="" class="h-full w-full object-cover" loading="lazy" onerror="this.closest('[data-resource-preview-icon]').innerHTML='<i class=&quot;fa-solid fa-file-lines text-slate-500&quot;></i>';">`
      : `<i class="fa-solid fa-file-lines text-slate-500"></i>`;

    return `
      <div class="mt-5 rounded-[1.35rem] border border-white/80 bg-white/76 p-3 shadow-sm">
        <div class="flex items-center gap-3">
          <div data-resource-preview-icon class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-xl shadow-sm">
            ${iconHtml}
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Resource</p>
            <p class="mt-1 text-sm font-extrabold leading-snug text-slate-800 break-words">${name}</p>
          </div>
        </div>
      </div>
    `;
  }

  function openErrorModal(config) {
    const host = ensureErrorHost();
    const codeBlockHtml = config.code
      ? `
        <div class="mt-6 rounded-[1.65rem] border border-white/60 bg-white/58 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl">
          <p class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Error code</p>
          <p class="mt-2 text-sm font-mono text-slate-700 break-all">${config.code}</p>
        </div>
      `
      : "";
    const resourcePreviewHtml = buildResourcePreview(config.resourcePreview);

    host.innerHTML = `
      <div class="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/65 bg-white/80 shadow-[0_40px_120px_-24px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
        <div class="absolute inset-0 ${config.surfaceGlow} opacity-95 pointer-events-none"></div>
        <div class="absolute -top-24 right-[-3rem] h-64 w-64 rounded-full ${config.orbA} blur-3xl opacity-90 pointer-events-none"></div>
        <div class="absolute -bottom-24 left-[-2rem] h-64 w-64 rounded-full ${config.orbB} blur-3xl opacity-80 pointer-events-none"></div>
        <div class="absolute inset-x-0 top-0 h-px bg-white/90 pointer-events-none"></div>

        <button
          id="resource-error-close"
          type="button"
          class="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/70 text-slate-500 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition hover:scale-105 hover:bg-white hover:text-slate-900"
          aria-label="Close"
        >
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>

        <div class="relative p-5 md:p-8">
          <div class="grid gap-5 md:grid-cols-[minmax(0,1fr)_15rem] md:gap-7">
            <div class="min-w-0">
              <div class="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/72 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-700 shadow-sm backdrop-blur-xl">
                <span class="inline-flex h-2.5 w-2.5 rounded-full ${config.badgeDot} shadow-[0_0_0_4px_rgba(255,255,255,0.55)]"></span>
                ${config.badgeText}
              </div>

              <h2 class="mt-5 max-w-2xl text-[2rem] font-black tracking-[-0.04em] text-slate-950 md:text-[3.25rem] md:leading-[0.95]">
                ${config.title}
              </h2>

              <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                ${config.message}
              </p>

              ${codeBlockHtml}

              <div class="mt-7 flex flex-wrap gap-3">
                ${buildActionButton(
                  "resource-error-dismiss",
                  config.primaryLabel || "Understood",
                  "fa-solid fa-check",
                  "bg-slate-950 text-white shadow-[0_18px_38px_-20px_rgba(15,23,42,0.95)] hover:-translate-y-0.5 hover:bg-slate-900"
                )}
                ${buildActionButton(
                  "resource-error-back",
                  config.secondaryLabel || "Back to resources",
                  "fa-solid fa-arrow-left",
                  "border border-slate-200 bg-white/85 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                )}
              </div>
            </div>

            <div class="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl">
              <div class="absolute inset-0 ${config.panelGlow} opacity-90 pointer-events-none"></div>
              <div class="relative flex h-full min-h-[14rem] flex-col justify-between">
                <div>
                  <div class="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/80 bg-white/88 text-3xl shadow-lg shadow-slate-900/5">
                    <span aria-hidden="true">${config.emoji}</span>
                  </div>

                  <p class="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                    ${config.sideLabel}
                  </p>

                  <p class="mt-3 text-sm leading-6 text-slate-600">
                    ${config.sideMessage}
                  </p>

                  ${resourcePreviewHtml}
                </div>

                <div class="mt-5 rounded-[1.35rem] border border-white/80 bg-white/72 px-4 py-3 shadow-sm">
                  <p class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Access window</p>
                  <p class="mt-2 text-sm font-semibold text-slate-700">${config.windowText}</p>
                </div>
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

    host.addEventListener("click", (event) => {
      if (event.target === host) close();
    }, { once: true });

    document.addEventListener("keydown", function escHandler(event) {
      if (event.key === "Escape") {
        close();
        document.removeEventListener("keydown", escHandler);
      }
    });
  }

  function getErrorConfig(errorCode) {
    const code = (errorCode || "").toLowerCase();

    const themes = {
      diamond: {
        badgeText: "Diamond access",
        badgeDot: "bg-cyan-400",
        emoji: "&#128142;",
        sideLabel: "Membership notice",
        sideMessage: "This item sits behind a higher access tier so premium resources stay fast and sustainable for the people using them.",
        windowText: "Available with Diamond membership",
        surfaceGlow: "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.28),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(99,102,241,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(239,246,255,0.88))]",
        panelGlow: "bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.26),rgba(239,246,255,0.08))]",
        orbA: "bg-cyan-300/55",
        orbB: "bg-indigo-300/45"
      },
      unavailable: {
        badgeText: "Limited right now",
        badgeDot: "bg-amber-400",
        emoji: "&#9203;",
        sideLabel: "Availability note",
        sideMessage: "We sometimes throttle access so the library stays responsive and compute-heavy resources do not crowd out everything else.",
        windowText: "Please try again later",
        surfaceGlow: "bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_30%),radial-gradient(circle_at_90%_15%,rgba(249,115,22,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,247,237,0.9))]",
        panelGlow: "bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.2),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,247,237,0.1))]",
        orbA: "bg-amber-300/55",
        orbB: "bg-orange-300/45"
      },
      update: {
        badgeText: "Refreshing resource",
        badgeDot: "bg-blue-400",
        emoji: "&#128736;",
        sideLabel: "Update in progress",
        sideMessage: "This item is being refreshed so the next open gives the latest version rather than stale or partially updated content.",
        windowText: "Back shortly after updates finish",
        surfaceGlow: "bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.24),transparent_30%),radial-gradient(circle_at_88%_20%,rgba(129,140,248,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(239,246,255,0.9))]",
        panelGlow: "bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.24),rgba(239,246,255,0.1))]",
        orbA: "bg-blue-300/55",
        orbB: "bg-indigo-300/45"
      },
      unknown: {
        badgeText: "Resource issue",
        badgeDot: "bg-slate-400",
        emoji: "&#9888;",
        sideLabel: "Unexpected state",
        sideMessage: "We could not match this to a known resource state, so the safest move is to pause here rather than open something broken.",
        windowText: "Review the error code below",
        surfaceGlow: "bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.18),transparent_30%),radial-gradient(circle_at_88%_20%,rgba(203,213,225,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.94),rgba(248,250,252,0.92))]",
        panelGlow: "bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.16),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.24),rgba(248,250,252,0.12))]",
        orbA: "bg-slate-300/55",
        orbB: "bg-slate-200/65"
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
        message: "This resource is reserved for the Diamond tier. Upgrade in My Settings to unlock it and keep your access in sync across the library."
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
        message: "This resource cannot be opened right now. It may be paused for maintenance, short-term capacity limits, or a brief platform issue."
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
        title: "This resource is limited outside school hours",
        message: "This starred resource is only available between 8:20 AM and 3:10 PM. Outside these hours, access is limited to help save compute.",
        sideLabel: "Compute-saving window",
        sideMessage: "Starred items use a more restricted access pattern, so they only open during the daytime window set for this library.",
        windowText: "8:20 AM to 3:10 PM"
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
        message: "Updates are currently being applied to this resource. Please come back shortly while the latest version is prepared."
      };
    }

    return {
      ...themes.unknown,
      title: "Something went wrong",
      message: "We could not match this to a known resource issue. Please try again, and if it keeps happening, share the code below with support.",
      code: errorCode || "unknown"
    };
  }

  function initResourceErrorHandler() {
    const errorCode = getErrorCode();
    if (!errorCode) return;

    const config = getErrorConfig(errorCode);
    openErrorModal(config);
  }

  window.showResourceErrorModal = function showResourceErrorModal(errorCodeOrConfig) {
    const config = typeof errorCodeOrConfig === "string"
      ? getErrorConfig(errorCodeOrConfig)
      : errorCodeOrConfig;

    if (!config) return;
    openErrorModal(config);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initResourceErrorHandler);
  } else {
    initResourceErrorHandler();
  }
})();
