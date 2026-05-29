/*
  StudyBase Support Handler
  Path to use on your site:
  /assets/js/support/support-handler.js

  This handler turns any element with [data-support-slot] into an iframe-based
  support slot.

  Pattern:
  - First load: random support iframe, excluding supported-soon.html
  - Next load/rotation: /internal/support_iframes/supported-soon.html
  - Then random again
  - Then supported-soon again
*/

(() => {
  "use strict";

  // External link warning modal (shown in parent, not inside iframes)
  function showExternalLinkWarning(url) {
    const existing = document.getElementById('sb-external-warning-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'sb-external-warning-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,0.82);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,system-ui,-apple-system,sans-serif;';

    modal.innerHTML = `
      <div style="background:#fff;border-radius:20px;max-width:440px;width:100%;padding:28px 26px;box-shadow:0 25px 70px -15px rgba(0,0,0,0.35);border:1px solid #e2e8f0;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <div style="width:44px;height:44px;border-radius:12px;background:#fef2f2;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">⚠️</div>
          <div>
            <div style="font-weight:800;font-size:18px;color:#0f172a;">Leaving StudyBase</div>
            <div style="font-size:13px;color:#64748b;">You are about to visit an external website</div>
          </div>
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:11px 13px;margin-bottom:16px;font-size:13.5px;color:#334155;word-break:break-all;">
          ${new URL(url, window.location.origin).hostname}
        </div>

        <p style="font-size:13.8px;color:#475569;line-height:1.5;margin-bottom:18px;">
          This site is not operated by StudyBase. We recommend reviewing their privacy policy before sharing any information.
        </p>

        <div style="display:flex;gap:10px;">
          <button id="sb-ext-cancel" style="flex:1;padding:11px 16px;border-radius:12px;border:1px solid #cbd5e1;background:#fff;font-weight:700;font-size:14px;color:#334155;cursor:pointer;">Cancel</button>
          <button id="sb-ext-continue" style="flex:1;padding:11px 16px;border-radius:12px;border:none;background:#0f172a;color:#fff;font-weight:700;font-size:14px;cursor:pointer;">Continue</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#sb-ext-cancel').onclick = () => modal.remove();
    modal.querySelector('#sb-ext-continue').onclick = () => {
      modal.remove();
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escHandler);
      }
    }, { once: true });
  }

  // Listen for messages from support iframes
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'show-external-warning' && event.data.url) {
      showExternalLinkWarning(event.data.url);
    }
  });

  const DEFAULT_CONFIG = {
    enabled: true,

    supportPages: [
      "/internal/support_iframes/supported-soon.html",
      "/internal/support_iframes/mental-health-1.html",
      "/internal/support_iframes/mental-health-2.html",
      "/internal/support_iframes/safe-choices.html",
      "/internal/support_iframes/substance-safety.html",
      "/internal/support_iframes/online-safety.html"
    ],

    iframeSrc: "/internal/support_iframes/supported-soon.html",

    featuredSupportSrc: "/internal/support_iframes/supported-soon.html",

    label: "Sponsored",

    rotateEveryMs: 20000,

    collapseWhenDisabled: true,

    injectBaseStyles: true,

    ratios: {
      square: "1 / 1",
      portrait: "9 / 16",
      story: "9 / 16",
      landscape: "16 / 9",

      mobileBanner: "32 / 5",
      mobileLarge: "16 / 5",

      leaderboard: "364 / 45",
      largeLeaderboard: "97 / 9",
      billboard: "97 / 25",

      rectangle: "6 / 5",
      largeRectangle: "6 / 5",
      halfPage: "1 / 2",
      skyscraper: "4 / 15",
      wideSkyscraper: "5 / 16",
      banner: "6 / 1",
      thinBanner: "8 / 1"
    },

    maxWidths: {
      square: "250px",
      portrait: "360px",
      story: "360px",
      landscape: "720px",

      mobileBanner: "320px",
      mobileLarge: "320px",

      leaderboard: "728px",
      largeLeaderboard: "970px",
      billboard: "970px",

      rectangle: "300px",
      largeRectangle: "336px",
      halfPage: "300px",
      skyscraper: "160px",
      wideSkyscraper: "300px",
      banner: "900px",
      thinBanner: "900px"
    }
  };

  const state = {
    config: structuredCloneSafe(DEFAULT_CONFIG),
    started: false,
    slotStates: new WeakMap()
  };

  function structuredCloneSafe(value) {
    try {
      return structuredClone(value);
    } catch {
      return JSON.parse(JSON.stringify(value));
    }
  }

  function mergeDeep(target, source) {
    if (!source || typeof source !== "object") return target;

    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
      ) {
        mergeDeep(targetValue, sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });

    return target;
  }

  function normaliseRatioName(name) {
    if (!name) return "rectangle";

    return String(name)
      .trim()
      .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  function getRatioValue(ratioName) {
    const key = normaliseRatioName(ratioName);
    return state.config.ratios[key] || state.config.ratios.rectangle || "6 / 5";
  }

  function getMaxWidth(ratioName) {
    const key = normaliseRatioName(ratioName);
    return state.config.maxWidths[key] || state.config.maxWidths.rectangle || "300px";
  }

  function parseList(value) {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value
        .map((item) => String(item).trim())
        .filter(Boolean);
    }

    const rawValue = String(value).trim();
    if (!rawValue) return [];

    if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      try {
        const parsed = JSON.parse(rawValue);

        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => String(item).trim())
            .filter(Boolean);
        }
      } catch {
        // Fall back to comma splitting below.
      }
    }

    return rawValue
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function uniqueList(list) {
    return [...new Set(
      list
        .map((item) => String(item).trim())
        .filter(Boolean)
    )];
  }

  function pickRandomItem(list) {
    if (!Array.isArray(list) || !list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  function getSlotIdentity(slot) {
    return slot.dataset.supportSlot || "unknown";
  }

  function getSlotStorageKey(slot) {
    return `sb_support_next_mode_${getSlotIdentity(slot)}`;
  }

  function getStoredNextMode(slot) {
    try {
      return sessionStorage.getItem(getSlotStorageKey(slot));
    } catch {
      return null;
    }
  }

  function storeNextMode(slot, mode) {
    try {
      sessionStorage.setItem(getSlotStorageKey(slot), mode);
    } catch {
      // Storage may be blocked, so silently continue.
    }
  }

  function getSlotState(slot) {
    let slotState = state.slotStates.get(slot);

    if (!slotState) {
      slotState = {
        pagesKey: "",
        timerId: null,

        /*
          Modes:
          - "random" means the next iframe should be one of the non-featured pages.
          - "featured" means the next iframe should be supported-soon.html.

          Defaults to "random", so the order starts:
          random -> supported-soon -> random -> supported-soon
        */
        nextMode: getStoredNextMode(slot) || "random"
      };

      state.slotStates.set(slot, slotState);
    }

    return slotState;
  }

  function getAvailablePages(slot) {
    if (slot.dataset.supportSrc) {
      return uniqueList([slot.dataset.supportSrc]);
    }

    const slotPages = parseList(slot.dataset.supportPages);
    if (slotPages.length) {
      return uniqueList(slotPages);
    }

    const configPages = parseList(state.config.supportPages);
    if (configPages.length) {
      return uniqueList(configPages);
    }

    return uniqueList([state.config.iframeSrc]);
  }

  function chooseNextIframeSrc(slot) {
    const slotState = getSlotState(slot);
    const pages = getAvailablePages(slot);
    const pagesKey = JSON.stringify(pages);

    if (slotState.pagesKey !== pagesKey) {
      slotState.pagesKey = pagesKey;
      slotState.nextMode = getStoredNextMode(slot) || "random";
    }

    const fallbackSrc = state.config.iframeSrc || "/internal/support_iframes/supported-soon.html";
    const featuredSrc = state.config.featuredSupportSrc || fallbackSrc;

    if (!pages.length) {
      return fallbackSrc;
    }

    if (pages.length === 1) {
      return pages[0];
    }

    const hasFeatured = pages.includes(featuredSrc);
    const otherPages = pages.filter((src) => src !== featuredSrc);

    let nextSrc;

    if (slotState.nextMode === "featured" && hasFeatured) {
      nextSrc = featuredSrc;
      slotState.nextMode = "random";
    } else {
      nextSrc = pickRandomItem(otherPages.length ? otherPages : pages) || fallbackSrc;
      slotState.nextMode = "featured";
    }

    storeNextMode(slot, slotState.nextMode);

    return nextSrc;
  }

  function buildIframeSrc(slot, rawSrc = null) {
    const src = rawSrc || chooseNextIframeSrc(slot);
    const slotName = slot.dataset.supportSlot || "unknown";
    const ratioName = slot.dataset.supportRatio || "rectangle";

    try {
      const url = new URL(src, window.location.origin);

      url.searchParams.set("slot", slotName);
      url.searchParams.set("ratio", ratioName);

      if (slot.dataset.supportCacheBust === "true") {
        url.searchParams.set("sbRotate", String(Date.now()));
      }

      return url.toString();
    } catch {
      return src;
    }
  }

  function rotateSlot(slot) {
    if (!slot || slot.dataset.supportMounted !== "true") return;

    const iframe = slot.querySelector("iframe");
    if (!iframe) return;

    iframe.src = buildIframeSrc(slot);
  }

  function stopSlotRotation(slot) {
    if (!slot) return;

    const slotState = getSlotState(slot);

    if (slotState.timerId) {
      window.clearInterval(slotState.timerId);
      slotState.timerId = null;
    }
  }

  function startSlotRotation(slot) {
    stopSlotRotation(slot);

    const rotateEveryMs = Number(state.config.rotateEveryMs);
    const pages = getAvailablePages(slot);

    if (
      !rotateEveryMs ||
      rotateEveryMs < 1000 ||
      pages.length <= 1 ||
      slot.dataset.supportRotate === "false"
    ) {
      return;
    }

    const slotState = getSlotState(slot);

    slotState.timerId = window.setInterval(() => {
      rotateSlot(slot);
    }, rotateEveryMs);
  }

  function injectStyles() {
    if (!state.config.injectBaseStyles) return;
    if (document.getElementById("studybase-support-handler-styles")) return;

    const style = document.createElement("style");
    style.id = "studybase-support-handler-styles";

    style.textContent = `
      [data-support-slot] {
        box-sizing: border-box;
      }

      .sb-support-mounted {
        position: relative;
        width: 100%;
        max-width: var(--sb-support-max-width, 300px);
        aspect-ratio: var(--sb-support-ratio, 6 / 5);
        margin-left: auto;
        margin-right: auto;
        border-radius: var(--sb-support-radius, 18px);
        overflow: hidden;
        background: var(--sb-support-bg, rgba(15, 23, 42, 0.045));
        border: var(--sb-support-border, 1px solid rgba(148, 163, 184, 0.24));
        box-shadow: var(--sb-support-shadow, none);
      }

      .sb-support-mounted::before {
        content: attr(data-support-label);
        position: absolute;
        z-index: 2;
        top: 7px;
        left: 9px;
        padding: 3px 7px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.78);
        color: #64748b;
        font: 700 9px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        pointer-events: none;
        backdrop-filter: blur(8px);
      }

      .sb-support-mounted iframe {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
        display: block;
        background: transparent;
      }

      .sb-support-hidden {
        display: none !important;
      }

      @media (max-width: 760px) {
        [data-support-desktop-only="true"] {
          display: none !important;
        }
      }

      @media (min-width: 761px) {
        [data-support-mobile-only="true"] {
          display: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function mountSlot(slot) {
    if (!slot || slot.dataset.supportMounted === "true") return;

    const slotEnabled = slot.dataset.supportEnabled;
    const isEnabled = state.config.enabled && slotEnabled !== "false";

    if (!isEnabled) {
      if (state.config.collapseWhenDisabled) {
        slot.classList.add("sb-support-hidden");
      }

      return;
    }

    slot.classList.remove("sb-support-hidden");
    slot.classList.add("sb-support-mounted");

    const ratioName = slot.dataset.supportRatio || "rectangle";
    const ratioValue = slot.dataset.supportCustomRatio || getRatioValue(ratioName);
    const maxWidth = slot.dataset.supportMaxWidth || getMaxWidth(ratioName);
    const label = slot.dataset.supportLabel || state.config.label || "Sponsored";

    slot.style.setProperty("--sb-support-ratio", ratioValue);
    slot.style.setProperty("--sb-support-max-width", maxWidth);
    slot.dataset.supportLabel = label;

    const iframe = document.createElement("iframe");

    iframe.src = buildIframeSrc(slot);
    iframe.title = slot.dataset.supportTitle || `${label} support slot`;
    iframe.loading = slot.dataset.supportLoading || "lazy";
    iframe.referrerPolicy =
      slot.dataset.supportReferrerPolicy || "strict-origin-when-cross-origin";

    iframe.sandbox =
      slot.dataset.supportSandbox ||
      "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox";

    if (slot.dataset.supportAllow) {
      iframe.allow = slot.dataset.supportAllow;
    }

    slot.innerHTML = "";
    slot.appendChild(iframe);
    slot.dataset.supportMounted = "true";

    startSlotRotation(slot);
  }

  function unmountSlot(slot) {
    if (!slot) return;

    stopSlotRotation(slot);

    slot.innerHTML = "";
    slot.dataset.supportMounted = "false";
    slot.classList.remove("sb-support-mounted");

    if (state.config.collapseWhenDisabled) {
      slot.classList.add("sb-support-hidden");
    }
  }

  function refresh() {
    injectStyles();

    const slots = document.querySelectorAll("[data-support-slot]");

    slots.forEach((slot) => {
      const slotEnabled = slot.dataset.supportEnabled;
      const shouldBeEnabled = state.config.enabled && slotEnabled !== "false";

      if (shouldBeEnabled) {
        if (slot.dataset.supportMounted === "true") {
          unmountSlot(slot);
        }

        mountSlot(slot);
      } else {
        unmountSlot(slot);
      }
    });
  }

  function configure(newConfig = {}) {
    mergeDeep(state.config, newConfig);
    refresh();
  }

  function enable() {
    state.config.enabled = true;
    refresh();
  }

  function disable() {
    state.config.enabled = false;
    refresh();
  }

  function init(config = {}) {
    if (state.started) {
      configure(config);
      return;
    }

    state.started = true;
    mergeDeep(state.config, config);

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", refresh, { once: true });
    } else {
      refresh();
    }
  }

  window.StudyBaseSupportHandler = {
    init,
    refresh,
    configure,
    enable,
    disable,
    rotateSlot,
    config: state.config,
    ratios: state.config.ratios
  };

  if (window.STUDYBASE_SUPPORT_AUTO_INIT !== false) {
    init(window.STUDYBASE_SUPPORT_CONFIG || {});
  }
})();