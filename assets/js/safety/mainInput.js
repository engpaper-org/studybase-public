(() => {
  "use strict";

  let DEBUG = false;
  let GUARD_ENABLED = true;
  let BAD_WORDS_URL = "/assets/data/safety/bad-words.txt";
  let VIOLATIONS_KEY = "sb_searchguard_violations";
  let SEARCH_DISABLED_AT = 5;
  let REVIEW_THRESHOLD = 3;
  let SHOW_MATCHED_HASH = true;
  let REFILTER_AFTER_BLOCK = true;

 
  let ADMIN_OVERRIDE_HASH = "";

  let SEARCH_INPUT_SELECTORS = [
    "#searchInput",
    'input[type="search"]',
    'input[name="q"]',
    'input[name="search"]',
    "#search",
    "#searchBar",
    'input[type="text"]',
    "[data-search-input]",
    "firstName"
  ];

  let SEARCH_BUTTON_SELECTORS = [
    'button[type="submit"]',
    "[data-search-button]",
    ".search-button"
  ];

  let bannedHashes = new Set();
  let bannedLoaded = false;
  let suppressNextFilter = false;
  let modalOpen = false;

  function log(...args) {
    if (DEBUG) console.log("[SearchGuard]", ...args);
  }

  function warn(...args) {
    if (DEBUG) console.warn("[SearchGuard]", ...args);
  }

  function error(...args) {
    if (DEBUG) console.error("[SearchGuard]", ...args);
  }

  async function applyGuardConfig() {
    if (!window.SiteConfig?.ready) return;

    try {
      const config = await window.SiteConfig.ready;
      const autoSafe = config?.autoSafe || {};
      const mainInput = autoSafe.mainInput || {};

      GUARD_ENABLED = autoSafe.enabled !== false && mainInput.enabled !== false;
      DEBUG = Boolean(config?.environment?.showDebugLogs || mainInput.debug);
      BAD_WORDS_URL = mainInput.badWordsUrl || autoSafe.badWordsUrl || BAD_WORDS_URL;
      VIOLATIONS_KEY = mainInput.violationsKey || VIOLATIONS_KEY;
      SEARCH_DISABLED_AT = Number(mainInput.searchDisabledAt) || SEARCH_DISABLED_AT;
      REVIEW_THRESHOLD = Number(mainInput.reviewThreshold) || REVIEW_THRESHOLD;
      ADMIN_OVERRIDE_HASH = mainInput.adminOverrideHash || ADMIN_OVERRIDE_HASH;
      SHOW_MATCHED_HASH = mainInput.showMatchedHash !== false;
      REFILTER_AFTER_BLOCK = mainInput.refilterAfterBlock !== false;

      if (Array.isArray(mainInput.inputSelectors) && mainInput.inputSelectors.length) {
        SEARCH_INPUT_SELECTORS = mainInput.inputSelectors;
      }

      if (Array.isArray(mainInput.buttonSelectors) && mainInput.buttonSelectors.length) {
        SEARCH_BUTTON_SELECTORS = mainInput.buttonSelectors;
      }
    } catch (err) {
      error("Failed to apply search guard config:", err);
    }
  }

  function findFirst(selectors, root = document) {
    for (const selector of selectors) {
      const el = root.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  function normalizeText(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFKC")
      .replace(/\r/g, "")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  async function sha256Hex(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(hashBuffer)]
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function loadBadWords() {
    try {
      const res = await fetch(BAD_WORDS_URL, { cache: "no-store" });
      if (!res.ok) {
        error(`Failed to load ${BAD_WORDS_URL} (${res.status})`);
        return;
      }

      const text = await res.text();
      const lines = text
        .split("\n")
        .map(line => String(line || "").trim().toLowerCase())
        .filter(Boolean);

      bannedHashes = new Set(lines);
      bannedLoaded = true;
    } catch (err) {
      error("Failed to fetch bad words file:", err);
    }
  }

  function buildTermsToCheck(query) {
    const normalized = normalizeText(query);
    if (!normalized) return [];

    const words = normalized.split(" ").filter(Boolean);
    const terms = new Set();

    for (const word of words) terms.add(word);

    for (let i = 0; i < words.length - 1; i++) {
      terms.add(`${words[i]} ${words[i + 1]}`);
    }

    for (let i = 0; i < words.length - 2; i++) {
      terms.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }

    terms.add(normalized);

    return [...terms];
  }

  async function isBlocked(query) {
    if (!bannedLoaded) {
      return { blocked: false, matchedTerm: null, matchedHash: null };
    }

    const normalized = normalizeText(query);
    if (!normalized) {
      return { blocked: false, matchedTerm: null, matchedHash: null };
    }

    const terms = buildTermsToCheck(query);
    const hashes = await Promise.all(terms.map(term => sha256Hex(term)));

    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];
      const hash = hashes[i];

      if (bannedHashes.has(hash)) {
        return {
          blocked: true,
          matchedTerm: term,
          matchedHash: hash
        };
      }
    }

    return {
      blocked: false,
      matchedTerm: null,
      matchedHash: null
    };
  }

  function getViolationCount() {
    const raw = localStorage.getItem(VIOLATIONS_KEY);
    const num = Number(raw);
    return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0;
  }

  function setViolationCount(count) {
    localStorage.setItem(VIOLATIONS_KEY, String(Math.max(0, Math.floor(count))));
  }

  function incrementViolationCount() {
    const next = getViolationCount() + 1;
    setViolationCount(next);
    return next;
  }

  function isSearchDisabled() {
    return getViolationCount() >= SEARCH_DISABLED_AT;
  }

  function ordinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
  }

  function ensureModal() {
    if (document.getElementById("sb-prohibited-search-modal")) return;

    const root = document.createElement("div");
    root.innerHTML = `
      <div id="sb-prohibited-search-backdrop"
           class="fixed inset-0 z-[9998] hidden bg-slate-950/70 backdrop-blur-sm"></div>

      <div id="sb-prohibited-search-modal"
           class="fixed inset-0 z-[9999] hidden items-center justify-center p-4">
        <div class="w-full max-w-xl overflow-hidden rounded-3xl border border-red-500/20 bg-slate-900 shadow-2xl shadow-red-900/20">
          <div class="bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 px-6 py-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.28em] text-red-100/90">
                  Search Safety Notice
                </p>
                <h2 id="sb-prohibited-search-title" class="mt-1 text-2xl font-bold text-white">
                  Prohibited search term entered
                </h2>
              </div>

              <button id="sb-prohibited-search-close"
                      type="button"
                      class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                      aria-label="Close">
                ✕
              </button>
            </div>
          </div>

          <div class="px-6 py-6">
            <div class="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <div class="flex items-start gap-3">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/20 text-xl">
                  ⚠️
                </div>
                <div class="w-full">
                  <p id="sb-prohibited-search-heading" class="text-base font-semibold text-white">
                    This search was blocked
                  </p>
                  <p id="sb-prohibited-search-message" class="mt-1 text-sm leading-6 text-slate-300">
                    You entered a prohibited search term which is against our MSA.
                  </p>

                  <div id="sb-prohibited-search-warning-box"
                       class="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p id="sb-prohibited-search-warning-count"
                       class="text-sm font-semibold text-white"></p>
                    <p id="sb-prohibited-search-warning-extra"
                       class="mt-2 text-sm leading-6 text-slate-300"></p>
                  </div>

                  <div id="sb-prohibited-search-hash-box"
                       class="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90">
                      Matched reference
                    </p>
                    <p id="sb-prohibited-search-hash"
                       class="mt-2 break-all font-mono text-xs leading-6 text-amber-100"></p>
                  </div>

                  <div id="sb-banned-override-box"
                       class="mt-4 hidden rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/90">
                      Admin override
                    </p>
                    <p class="mt-2 text-sm leading-6 text-slate-300">
                      Enter an admin override code below.
                    </p>

                    <div class="mt-3 flex flex-col gap-3 sm:flex-row">
                      <input id="sb-admin-override-input"
                             type="password"
                             autocomplete="off"
                             spellcheck="false"
                             placeholder="Enter override code"
                             class="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400" />

                      <button id="sb-admin-override-submit"
                              type="button"
                              class="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">
                        Unlock
                      </button>
                    </div>

                    <p id="sb-admin-override-status"
                       class="mt-3 text-sm text-slate-300"></p>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button id="sb-prohibited-search-ok"
                      type="button"
                      class="rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400">
                Understood
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    const modal = document.getElementById("sb-prohibited-search-modal");
    const backdrop = document.getElementById("sb-prohibited-search-backdrop");
    const closeBtn = document.getElementById("sb-prohibited-search-close");
    const okBtn = document.getElementById("sb-prohibited-search-ok");
    const overrideSubmit = document.getElementById("sb-admin-override-submit");
    const overrideInput = document.getElementById("sb-admin-override-input");

    const hide = () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      backdrop.classList.add("hidden");
      document.documentElement.classList.remove("overflow-hidden");
      document.body.classList.remove("overflow-hidden");
      modalOpen = false;
    };

    closeBtn?.addEventListener("click", hide);
    okBtn?.addEventListener("click", hide);
    backdrop?.addEventListener("click", hide);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        hide();
      }
    });

    overrideSubmit?.addEventListener("click", handleAdminOverrideSubmit);
    overrideInput?.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        await handleAdminOverrideSubmit();
      }
    });
  }

  async function handleAdminOverrideSubmit() {
    const input = document.getElementById("sb-admin-override-input");
    const status = document.getElementById("sb-admin-override-status");

    if (!input || !status) return;

    const raw = String(input.value || "").trim();

    if (!raw) {
      status.textContent = "Please enter an override code.";
      status.className = "mt-3 text-sm text-amber-300";
      return;
    }

    status.textContent = "Checking override code...";
    status.className = "mt-3 text-sm text-slate-300";

    try {
      const hashed = await sha256Hex(raw);

      if (ADMIN_OVERRIDE_HASH && hashed === ADMIN_OVERRIDE_HASH) {
        setViolationCount(0);
        input.value = "";
        status.textContent = "Override accepted. Violations have been reset to 0.";
        status.className = "mt-3 text-sm text-emerald-300";
      } else {
        input.value = "";
        status.textContent = "Invalid override code.";
        status.className = "mt-3 text-sm text-red-300";
      }
    } catch (err) {
      status.textContent = "Failed to check override code.";
      status.className = "mt-3 text-sm text-red-300";
      error("Override check failed:", err);
    }
  }

  function showViolationModal(count, matchedHash = null, bannedMode = false) {
    ensureModal();

    const modal = document.getElementById("sb-prohibited-search-modal");
    const backdrop = document.getElementById("sb-prohibited-search-backdrop");

    const titleEl = document.getElementById("sb-prohibited-search-title");
    const headingEl = document.getElementById("sb-prohibited-search-heading");
    const messageEl = document.getElementById("sb-prohibited-search-message");
    const countEl = document.getElementById("sb-prohibited-search-warning-count");
    const extraEl = document.getElementById("sb-prohibited-search-warning-extra");
    const hashEl = document.getElementById("sb-prohibited-search-hash");
    const hashBox = document.getElementById("sb-prohibited-search-hash-box");
    const okBtn = document.getElementById("sb-prohibited-search-ok");
    const overrideBox = document.getElementById("sb-banned-override-box");
    const overrideStatus = document.getElementById("sb-admin-override-status");
    const overrideInput = document.getElementById("sb-admin-override-input");

    if (overrideStatus) overrideStatus.textContent = "";
    if (overrideInput) overrideInput.value = "";

    if (bannedMode || count >= SEARCH_DISABLED_AT) {
      titleEl.textContent = "Search banned";
      headingEl.textContent = "You have been banned from search";
      messageEl.textContent =
        "Search has been disabled due to multiple violations. Any further attempts to type into search will continue to be blocked on this device.";
      countEl.textContent = `This is your ${ordinal(count)} warning.`;
      extraEl.textContent =
        "An admin override code can be entered below for local unlocking. If this were a real system, review by the RevisionBase team could result in account action for breach of the MSA.";
      okBtn.textContent = "Close";
      overrideBox?.classList.remove("hidden");
    } else {
      titleEl.textContent = "Prohibited search term entered";
      headingEl.textContent = "This search was blocked";
      messageEl.textContent =
        "You entered a prohibited search term which is against our MSA.";
      countEl.textContent = `This is your ${ordinal(count)} warning.`;

      if (count >= REVIEW_THRESHOLD) {
        extraEl.textContent =
          "This violation has been reported to the RevisionBase team to review whether it was in breach of our MSA. If it is found to be in breach, your account may be banned for violation of the MSA.";
      } else {
        extraEl.textContent =
          "Continued misuse may result in action being taken on your account.";
      }

      okBtn.textContent = "Understood";
      overrideBox?.classList.add("hidden");
    }

    if (matchedHash && SHOW_MATCHED_HASH) {
      hashEl.textContent = matchedHash;
      hashBox.classList.remove("hidden");
    } else {
      hashEl.textContent = "";
      hashBox.classList.add("hidden");
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    backdrop.classList.remove("hidden");
    document.documentElement.classList.add("overflow-hidden");
    document.body.classList.add("overflow-hidden");
    modalOpen = true;
  }

  function safelyRefilter() {
    if (!REFILTER_AFTER_BLOCK) return;

    try {
      if (typeof window.filterResources === "function") {
        window.filterResources();
      }
    } catch (err) {
      error("Failed to call filterResources():", err);
    }
  }

  function handleBlockedSearch(input, rawValue, matchedHash) {
    suppressNextFilter = true;

    input.value = "";
    input.blur();

    const count = incrementViolationCount();
    showViolationModal(count, matchedHash, false);

    safelyRefilter();

    setTimeout(() => {
      suppressNextFilter = false;
    }, 50);
  }

  function handleDisabledAttempt(input, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();
    }

    input.value = "";
    showViolationModal(getViolationCount(), null, true);
  }

  function attachGuards(input, button) {
    input.addEventListener("input", async (e) => {
      if (suppressNextFilter) return;

      if (isSearchDisabled()) {
        handleDisabledAttempt(input, e);
        return;
      }

      if (modalOpen) return;

      const rawValue = String(input.value || "");
      const result = await isBlocked(rawValue);

      if (result.blocked) {
        handleBlockedSearch(input, rawValue, result.matchedHash);
      }
    }, true);

    input.addEventListener("keydown", async (e) => {
      if (isSearchDisabled()) {
        return;
      }

      if (e.key !== "Enter") return;

      const rawValue = String(input.value || "");
      const result = await isBlocked(rawValue);

      if (result.blocked) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        handleBlockedSearch(input, rawValue, result.matchedHash);
      }
    }, true);

    input.addEventListener("keyup", async () => {
      if (suppressNextFilter || modalOpen || isSearchDisabled()) return;

      const rawValue = String(input.value || "");
      const result = await isBlocked(rawValue);

      if (result.blocked) {
        handleBlockedSearch(input, rawValue, result.matchedHash);
      }
    }, true);

    if (button) {
      button.addEventListener("click", async (e) => {
        if (isSearchDisabled()) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
          showViolationModal(getViolationCount(), null, true);
          return;
        }

        const rawValue = String(input.value || "");
        const result = await isBlocked(rawValue);

        if (result.blocked) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
          handleBlockedSearch(input, rawValue, result.matchedHash);
        }
      }, true);
    }
  }

  function bindSearchGuard() {
    const input = findFirst(SEARCH_INPUT_SELECTORS);

    if (!input) {
      warn("No search input found.");
      return;
    }

    const button = input.parentElement?.querySelector("button") || findFirst(SEARCH_BUTTON_SELECTORS);
    attachGuards(input, button);
  }

  async function init() {
    await applyGuardConfig();
    if (!GUARD_ENABLED) return;

    if (!window.crypto?.subtle) {
      error("Web Crypto API not available.");
      return;
    }

    await loadBadWords();

    window.resetSearchGuardViolations = function () {
      setViolationCount(0);
    };

    window.hashSearchGuardOverrideCode = async function (plainText) {
      return await sha256Hex(String(plainText || ""));
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bindSearchGuard, { once: true });
    } else {
      bindSearchGuard();
    }
  }

  init();
})();
