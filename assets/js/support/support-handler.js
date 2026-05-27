/*
  StudyBase Support Handler
  Path to use on your site:
  /assets/js/support/support-handler.js

  This handler turns any element with [data-support-slot] into an iframe-based
  support slot. For now, every slot renders the same iframe source, but each slot
  can keep its own aspect ratio and placement.
*/

(() => {
  "use strict";

  const DEFAULT_CONFIG = {
    enabled: true,

    /*
      For now all slots load this same iframe.
      Change this later to your real support/sponsor/partner page.
    */
    iframeSrc: "/internal/iframes/supported-soon.html",

    label: "Sponsored",

    /*
      If true, hidden/disabled slots collapse fully.
      If false, they keep their space but show an empty placeholder.
    */
    collapseWhenDisabled: true,

    /*
      Adds simple default styling automatically.
      Set to false if you want to style everything yourself.
    */
    injectBaseStyles: true,

    /*
      Slot sizes.
      These names are used in:
      data-support-ratio="leaderboard"
    */
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

    /*
      Suggested max widths.
      These are not strict ad rules, just useful layout defaults.
    */
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
    started: false
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

  function buildIframeSrc(slot) {
    const src = slot.dataset.supportSrc || state.config.iframeSrc;
    const slotName = slot.dataset.supportSlot || "unknown";
    const ratioName = slot.dataset.supportRatio || "rectangle";

    try {
      const url = new URL(src, window.location.origin);
      url.searchParams.set("slot", slotName);
      url.searchParams.set("ratio", ratioName);
      return url.toString();
    } catch {
      return src;
    }
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
        background: rgba(255,255,255,0.78);
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
    iframe.referrerPolicy = slot.dataset.supportReferrerPolicy || "strict-origin-when-cross-origin";

    iframe.sandbox =
      slot.dataset.supportSandbox ||
      "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox";

    if (slot.dataset.supportAllow) {
      iframe.allow = slot.dataset.supportAllow;
    }

    slot.innerHTML = "";
    slot.appendChild(iframe);
    slot.dataset.supportMounted = "true";
  }

  function unmountSlot(slot) {
    if (!slot) return;

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
    config: state.config,
    ratios: state.config.ratios
  };

  /*
    Auto-start unless disabled before this script loads:
    window.STUDYBASE_SUPPORT_AUTO_INIT = false;
  */
  if (window.STUDYBASE_SUPPORT_AUTO_INIT !== false) {
    init(window.STUDYBASE_SUPPORT_CONFIG || {});
  }
})();