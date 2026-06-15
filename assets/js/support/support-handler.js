/*
  StudyBase Support Handler
  Path to use on your site:
  /assets/js/support/support-handler.js

  This handler turns any element with [data-support-slot] into an iframe-based
  support slot.

  Pattern:
  - Each page/rotation group has a 1 in 3 chance to show supported-soon.html.
  - If supported-soon is chosen, every support slot on the page shows it together.
  - If supported-soon is not chosen, every slot picks a different weighted support page where possible.
  - Each page can have its own weight using supportPageWeights or data-support-page-weights.
  - External link warning popup includes an auto-generated QR code to open the actual link on a phone.
  - If the URL is https://internal.studybase.site/popup/supported-soon, it opens a custom info modal instead.
*/

(() => {
  "use strict";

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getIframeBaseUrlFromSource(sourceWindow) {
    const iframes = document.querySelectorAll("iframe");

    for (const iframe of iframes) {
      if (iframe.contentWindow === sourceWindow) {
        try {
          return iframe.src || window.location.href;
        } catch {
          return window.location.href;
        }
      }
    }

    return window.location.href;
  }

  function getSafeUrl(rawUrl, baseUrl = window.location.href) {
    try {
      const resolvedUrl = new URL(rawUrl, baseUrl);

      if (!["http:", "https:"].includes(resolvedUrl.protocol)) {
        return null;
      }

      return resolvedUrl;
    } catch {
      return null;
    }
  }

  function showSupportedSoonInfoModal() {
    const existing = document.getElementById("sb-supported-soon-info-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "sb-supported-soon-info-modal";
    modal.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,0.84);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;";

    modal.innerHTML = `
      <div style="background:#fff;border-radius:24px;max-width:560px;width:100%;max-height:min(720px,88vh);display:flex;flex-direction:column;box-shadow:0 25px 80px -15px rgba(0,0,0,0.38);border:1px solid #e2e8f0;overflow:hidden;">
        <div style="padding:24px 24px 16px;border-bottom:1px solid #e2e8f0;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:46px;height:46px;border-radius:14px;background:#eff6ff;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">💙</div>
            <div>
              <div style="font-weight:850;font-size:19px;color:#0f172a;letter-spacing:-0.02em;">Support slots are coming soon</div>
              <div style="font-size:13px;color:#64748b;">A quick note about future StudyBase support</div>
            </div>
          </div>
        </div>

        <div style="padding:18px 24px;overflow-y:auto;line-height:1.58;color:#334155;font-size:14px;">
          <p style="margin:0 0 14px;">
            StudyBase may start showing small support slots soon. These are planned to help fund the running costs of the site, including hosting, infrastructure, bandwidth, security tools, and future improvements.
          </p>

          <p style="margin:0 0 14px;">
            The aim is to keep StudyBase useful, fast, and available without putting everything behind a paywall. Support slots help cover the costs of keeping resources online while still making the site easy to access.
          </p>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:14px 15px;margin:16px 0;">
            <div style="font-weight:800;color:#0f172a;margin-bottom:8px;">What this means</div>
            <ul style="margin:0;padding-left:18px;">
              <li style="margin-bottom:7px;">Support slots may appear in certain areas of StudyBase.</li>
              <li style="margin-bottom:7px;">They are designed to be limited and not get in the way of studying.</li>
              <li style="margin-bottom:7px;">They help fund StudyBase infrastructure and future tools.</li>
              <li style="margin-bottom:0;">The aim is to keep the site clean, safe, and student-friendly.</li>
            </ul>
          </div>

          <p style="margin:0 0 14px;">
            Support slots should stay separate from the main learning tools, so revision, focus, and usability still come first.
          </p>

          <div style="background:#fefce8;border:1px solid #fde68a;border-radius:16px;padding:14px 15px;margin:16px 0;">
            <div style="font-weight:800;color:#713f12;margin-bottom:8px;">Why not just hide everything behind accounts?</div>
            <p style="margin:0;color:#713f12;">
              StudyBase is meant to stay simple to use. Support slots make it easier to keep public tools and resources available without forcing every feature behind a paid system.
            </p>
          </div>

          <p style="margin:0;">
            Thanks for using StudyBase and helping support the project as it grows.
          </p>
        </div>

        <div style="padding:16px 24px 22px;border-top:1px solid #e2e8f0;background:#fff;">
          <button id="sb-supported-soon-close" style="width:100%;padding:12px 16px;border-radius:13px;border:none;background:#0f172a;color:#fff;font-weight:800;font-size:14px;cursor:pointer;">Got it</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#sb-supported-soon-close").onclick = () => modal.remove();

    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    document.addEventListener(
      "keydown",
      function escHandler(e) {
        if (e.key === "Escape") {
          modal.remove();
          document.removeEventListener("keydown", escHandler);
        }
      },
      { once: true }
    );
  }

  function showExternalLinkWarning(url, baseUrl = window.location.href) {
    const safeUrl = getSafeUrl(url, baseUrl);
    if (!safeUrl) return;

    const absoluteUrl = safeUrl.toString();

    if (absoluteUrl === "https://internal.studybase.site/popup/supported-soon") {
      showSupportedSoonInfoModal();
      return;
    }

    const existing = document.getElementById("sb-external-warning-modal");
    if (existing) existing.remove();

    const qrUrl =
      "https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=12&data=" +
      encodeURIComponent(absoluteUrl);

    const modal = document.createElement("div");
    modal.id = "sb-external-warning-modal";
    modal.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,0.84);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;";

    modal.innerHTML = `
      <div style="background:#fff;border-radius:24px;max-width:520px;width:100%;padding:26px;box-shadow:0 25px 80px -15px rgba(0,0,0,0.38);border:1px solid #e2e8f0;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <div style="width:46px;height:46px;border-radius:14px;background:#fef2f2;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">⚠️</div>
          <div>
            <div style="font-weight:850;font-size:19px;color:#0f172a;letter-spacing:-0.02em;">Leaving StudyBase</div>
            <div style="font-size:13px;color:#64748b;">You are about to visit an external website</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 156px;gap:16px;align-items:stretch;margin-bottom:18px;">
          <div style="min-width:0;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:12px 13px;margin-bottom:12px;font-size:13.5px;color:#334155;word-break:break-all;">
              ${escapeHtml(absoluteUrl)}
            </div>

            <p style="font-size:13.8px;color:#475569;line-height:1.55;margin:0;">
              This site is not operated by StudyBase. Scan the QR code to open this exact link on your phone.
            </p>
          </div>

          <a href="${escapeHtml(absoluteUrl)}" target="_blank" rel="noopener noreferrer" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-decoration:none;background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:10px;">
            <img src="${escapeHtml(qrUrl)}" alt="QR code to open this link on your phone" width="118" height="118" style="display:block;width:118px;height:118px;border-radius:10px;background:#fff;">
            <div style="margin-top:8px;font-size:11px;font-weight:800;color:#0f172a;text-align:center;letter-spacing:-0.01em;">Open on phone</div>
            <div style="margin-top:2px;font-size:10px;color:#64748b;text-align:center;">Scan QR code</div>
          </a>
        </div>

        <div style="display:flex;gap:10px;">
          <button id="sb-ext-cancel" style="flex:1;padding:12px 16px;border-radius:13px;border:1px solid #cbd5e1;background:#fff;font-weight:800;font-size:14px;color:#334155;cursor:pointer;">Cancel</button>
          <button id="sb-ext-continue" style="flex:1;padding:12px 16px;border-radius:13px;border:none;background:#0f172a;color:#fff;font-weight:800;font-size:14px;cursor:pointer;">Continue</button>
        </div>

        <style>
          @media (max-width: 520px) {
            #sb-external-warning-modal > div {
              padding: 22px !important;
            }

            #sb-external-warning-modal div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
            }

            #sb-external-warning-modal a[href] {
              max-width: 180px;
              margin: 0 auto;
            }
          }
        </style>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#sb-ext-cancel").onclick = () => modal.remove();

    modal.querySelector("#sb-ext-continue").onclick = () => {
      modal.remove();
      window.open(absoluteUrl, "_blank", "noopener,noreferrer");
    };

    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    document.addEventListener(
      "keydown",
      function escHandler(e) {
        if (e.key === "Escape") {
          modal.remove();
          document.removeEventListener("keydown", escHandler);
        }
      },
      { once: true }
    );
  }

  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "show-external-warning" && event.data.url) {
      const iframeBaseUrl = getIframeBaseUrlFromSource(event.source);
      showExternalLinkWarning(event.data.url, iframeBaseUrl);
    }
  });

  const DEFAULT_CONFIG = {
    enabled: true,

    supportPages: [
      "/internal/support_iframes/digital-wellbeing.html",
      "/internal/support_iframes/supported-soon.html",
      "/internal/support_iframes/mental-health-1.html",
      "/internal/support_iframes/mental-health-2.html",
      "/internal/support_iframes/safe-choices.html",
      "/internal/support_iframes/substance-safety.html",
      "/internal/support_iframes/online-safety.html"
    ],

    iframeSrc: "/internal/support_iframes/supported-soon.html",

    featuredSupportSrc: "/internal/support_iframes/supported-soon.html",

    // 3 means supported-soon has a 1 in 3 chance.
    // 2 = 1 in 2, 4 = 1 in 4, etc.
    featuredFrequency: 3,

    // Bigger number = more likely to be selected.
    // Pages not listed here default to weight 1.
    supportPageWeights: {
      "/internal/support_iframes/digital-wellbeing.html": 3,
      "/internal/support_iframes/mental-health-1.html": 2,
      "/internal/support_iframes/mental-health-2.html": 2,
      "/internal/support_iframes/safe-choices.html": 2,
      "/internal/support_iframes/substance-safety.html": 1,
      "/internal/support_iframes/online-safety.html": 3
    },

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
    slotStates: new WeakMap(),
    pageGroup: {
      index: 0,
      isFeatured: false,
      assignments: new WeakMap(),
      usedNonFeatured: [],
      timerId: null
    }
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
    return [
      ...new Set(
        list
          .map((item) => String(item).trim())
          .filter(Boolean)
      )
    ];
  }

  function pickRandomItem(list) {
    if (!Array.isArray(list) || !list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  function getConfiguredPageWeights(slot) {
    const weights = {};

    if (
      state.config.supportPageWeights &&
      typeof state.config.supportPageWeights === "object" &&
      !Array.isArray(state.config.supportPageWeights)
    ) {
      Object.assign(weights, state.config.supportPageWeights);
    }

    const rawSlotWeights = slot.dataset.supportPageWeights;

    if (rawSlotWeights) {
      try {
        const parsed = JSON.parse(rawSlotWeights);

        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          Object.assign(weights, parsed);
        }
      } catch {
        // Invalid JSON should not break support slots.
      }
    }

    return weights;
  }

  function getPageWeight(src, slot) {
    const weights = getConfiguredPageWeights(slot);
    const directWeight = Number(weights[src]);

    if (Number.isFinite(directWeight) && directWeight > 0) {
      return directWeight;
    }

    return 1;
  }

  function pickWeightedPage(pages, slot) {
    if (!Array.isArray(pages) || !pages.length) return null;

    const weightedPages = pages.map((src) => ({
      src,
      weight: getPageWeight(src, slot)
    }));

    const totalWeight = weightedPages.reduce((total, page) => total + page.weight, 0);

    if (!totalWeight) {
      return pickRandomItem(pages);
    }

    let point = Math.random() * totalWeight;

    for (const page of weightedPages) {
      point -= page.weight;

      if (point <= 0) {
        return page.src;
      }
    }

    return weightedPages[weightedPages.length - 1].src;
  }

  function getSlotState(slot) {
    let slotState = state.slotStates.get(slot);

    if (!slotState) {
      slotState = {
        pagesKey: "",
        timerId: null
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

  function getFeaturedFrequency() {
    const frequency = Number(state.config.featuredFrequency);

    if (!Number.isFinite(frequency) || frequency < 1) {
      return 3;
    }

    return Math.floor(frequency);
  }

  function startNewPageGroup() {
    state.pageGroup.index += 1;
    state.pageGroup.assignments = new WeakMap();
    state.pageGroup.usedNonFeatured = [];
    state.pageGroup.isFeatured = Math.floor(Math.random() * getFeaturedFrequency()) === 0;
  }

  function getNonFeaturedPages(slot) {
    const pages = getAvailablePages(slot);
    const fallbackSrc = state.config.iframeSrc || "/internal/support_iframes/supported-soon.html";
    const featuredSrc = state.config.featuredSupportSrc || fallbackSrc;

    return pages.filter((src) => src !== featuredSrc);
  }

  function chooseDifferentWeightedPage(slot, nonFeaturedPages) {
    const unusedPages = nonFeaturedPages.filter(
      (src) => !state.pageGroup.usedNonFeatured.includes(src)
    );

    const pool = unusedPages.length ? unusedPages : nonFeaturedPages;
    const picked = pickWeightedPage(pool, slot);

    if (picked) {
      state.pageGroup.usedNonFeatured.push(picked);
    }

    return picked;
  }

  function chooseNextIframeSrc(slot) {
    const slotState = getSlotState(slot);
    const pages = getAvailablePages(slot);
    const pagesKey = JSON.stringify(pages);

    if (slotState.pagesKey !== pagesKey) {
      slotState.pagesKey = pagesKey;
    }

    const fallbackSrc = state.config.iframeSrc || "/internal/support_iframes/supported-soon.html";
    const featuredSrc = state.config.featuredSupportSrc || fallbackSrc;

    if (!pages.length) {
      return fallbackSrc;
    }

    if (pages.length === 1) {
      return pages[0];
    }

    if (!state.pageGroup.index) {
      startNewPageGroup();
    }

    if (state.pageGroup.assignments.has(slot)) {
      return state.pageGroup.assignments.get(slot);
    }

    const hasFeatured = pages.includes(featuredSrc);
    const nonFeaturedPages = getNonFeaturedPages(slot);

    let nextSrc;

    if (state.pageGroup.isFeatured && hasFeatured) {
      nextSrc = featuredSrc;
    } else {
      nextSrc =
        chooseDifferentWeightedPage(slot, nonFeaturedPages.length ? nonFeaturedPages : pages) ||
        fallbackSrc;
    }

    state.pageGroup.assignments.set(slot, nextSrc);

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

    startNewPageGroup();

    const iframe = slot.querySelector("iframe");
    if (!iframe) return;

    iframe.src = buildIframeSrc(slot);
  }

  function rotateAllSlots() {
    startNewPageGroup();

    const slots = document.querySelectorAll('[data-support-slot][data-support-mounted="true"]');

    slots.forEach((slot) => {
      const iframe = slot.querySelector("iframe");
      if (!iframe) return;

      iframe.src = buildIframeSrc(slot);
    });
  }

  function stopSlotRotation() {
    if (state.pageGroup.timerId) {
      window.clearInterval(state.pageGroup.timerId);
      state.pageGroup.timerId = null;
    }
  }

  function startSlotRotation(slot) {
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

    if (state.pageGroup.timerId) return;

    state.pageGroup.timerId = window.setInterval(() => {
      rotateAllSlots();
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

    stopSlotRotation();

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

    startNewPageGroup();

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
    rotateAllSlots,
    config: state.config,
    ratios: state.config.ratios
  };

  if (window.STUDYBASE_SUPPORT_AUTO_INIT !== false) {
    init(window.STUDYBASE_SUPPORT_CONFIG || {});
  }
})();
