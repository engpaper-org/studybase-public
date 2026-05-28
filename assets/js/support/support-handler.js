/*
  StudyBase Support Handler
  Path to use on your site:
  /assets/js/support/support-handler.js

  This handler turns any element with [data-support-slot] into an iframe-based
  support slot.

  Random pages are controlled inside this JS file by default.
  A placement can still override the default by using:
  - data-support-src
  - data-support-pages

  Promo rotation:
  - Rotates every 20 seconds by default.
  - Each slot gets its own random cycle.
  - It shows every promo once before starting a new cycle.
  - It avoids showing the same promo twice in a row.
  - It remembers the last shown promo in sessionStorage, so refreshing the page
    should not immediately repeat the same promo.
*/

(() => {
  "use strict";

  const DEFAULT_CONFIG = {
    enabled: true,

    /*
      Default random pages controlled by this JS file.

      If a placement does NOT define data-support-src or data-support-pages,
      the handler randomly chooses from these.
    */
    supportPages: [
      "/internal/support_iframes/supported-soon.html",
      "/internal/support_iframes/mental-health-1.html",
      "/internal/support_iframes/mental-health-2.html",
      "/internal/support_iframes/safe-choices.html",
      "/internal/support_iframes/substance-safety.html",
      "/internal/support_iframes/online-safety.html"
    ],

    /*
      Final fallback only used if supportPages is empty.
    */
    iframeSrc: "/internal/support_iframes/supported-soon.html",

    label: "Sponsored",

    /*
      Rotate promos every 20 seconds.
      Set to 0 or false to disable automatic rotation.
    */
    rotateEveryMs: 20000,

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
    started: false,

    /*
      Per-slot rotation state.
      WeakMap means removed DOM nodes can still be garbage collected.
    */
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

    /*
      Supports either JSON:
      data-support-pages='["/one.html", "/two.html"]'

      Or comma-separated:
      data-support-pages="/one.html,/two.html"
    */
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

  function shuffleList(list) {
    const shuffled = [...list];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
  }

  function getSlotIdentity(slot) {
    /*
      This keeps storage separate for each placement.
      If multiple pages use the same data-support-slot, they will share the same
      last shown promo memory, which is usually what you want.
    */
    return slot.dataset.supportSlot || "unknown";
  }

  function getSlotStorageKey(slot) {
    return `sb_support_last_src_${getSlotIdentity(slot)}`;
  }

  function getStoredLastSrc(slot) {
    try {
      return sessionStorage.getItem(getSlotStorageKey(slot));
    } catch {
      return null;
    }
  }

  function storeLastSrc(slot, src) {
    try {
      sessionStorage.setItem(getSlotStorageKey(slot), src);
    } catch {
      // Storage may be blocked, so silently continue.
    }
  }

  function getSlotState(slot) {
    let slotState = state.slotStates.get(slot);

    if (!slotState) {
      slotState = {
        pagesKey: "",
        queue: [],
        lastSrc: getStoredLastSrc(slot),
        timerId: null
      };

      state.slotStates.set(slot, slotState);
    }

    return slotState;
  }

  function getAvailablePages(slot) {
    /*
      Priority:
      1. data-support-src on the placement
      2. data-support-pages on the placement
      3. default random supportPages from this JS file
      4. fallback iframeSrc
    */

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

  function makeRandomQueue(pages, lastSrc) {
    if (!Array.isArray(pages) || pages.length === 0) return [];

    const queue = shuffleList(pages);

    /*
      Avoid the first promo in a fresh cycle being the same as the previous promo.
      This matters when:
      - the cycle resets
      - the page refreshes
      - the user comes back while sessionStorage still remembers the last promo
    */
    if (queue.length > 1 && queue[0] === lastSrc) {
      const swapIndex = queue.findIndex((src) => src !== lastSrc);

      if (swapIndex > 0) {
        [queue[0], queue[swapIndex]] = [queue[swapIndex], queue[0]];
      }
    }

    return queue;
  }

  function chooseNextIframeSrc(slot) {
    const slotState = getSlotState(slot);
    const pages = getAvailablePages(slot);
    const pagesKey = JSON.stringify(pages);

    /*
      If the available promo list changes, reset the queue.
      Also reload lastSrc from sessionStorage, because the page may have been
      refreshed or another matching slot may have updated it.
    */
    if (slotState.pagesKey !== pagesKey) {
      slotState.pagesKey = pagesKey;
      slotState.queue = [];
      slotState.lastSrc = getStoredLastSrc(slot);
    }

    if (!slotState.queue.length) {
      slotState.queue = makeRandomQueue(pages, slotState.lastSrc);
    }

    let nextSrc = slotState.queue.shift() || state.config.iframeSrc;

    /*
      Extra safety: prevent immediate repeats, including after page refresh.
    */
    if (pages.length > 1 && nextSrc === slotState.lastSrc) {
      const differentFromQueueIndex = slotState.queue.findIndex(
        (src) => src !== slotState.lastSrc
      );

      if (differentFromQueueIndex >= 0) {
        const replacement = slotState.queue.splice(differentFromQueueIndex, 1)[0];
        slotState.queue.unshift(nextSrc);
        nextSrc = replacement;
      } else {
        const fallbackDifferent = pages.find((src) => src !== slotState.lastSrc);

        if (fallbackDifferent) {
          nextSrc = fallbackDifferent;
        }
      }
    }

    slotState.lastSrc = nextSrc;
    storeLastSrc(slot, nextSrc);

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

      /*
        Optional cache busting.
        Use data-support-cache-bust="true" on a slot if you need it.
      */
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

    /*
      Only rotate when:
      - rotation is enabled globally
      - there is more than one promo available
      - this specific placement has not disabled rotation
    */
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

  /*
    Auto-start unless disabled before this script loads:
    window.STUDYBASE_SUPPORT_AUTO_INIT = false;
  */
  if (window.STUDYBASE_SUPPORT_AUTO_INIT !== false) {
    init(window.STUDYBASE_SUPPORT_CONFIG || {});
  }
})();