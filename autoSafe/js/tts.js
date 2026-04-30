(() => {
  "use strict";

  let DEBUG = false;
  let GUARD_ENABLED = true;
  let BAD_WORDS_URL = "/autoSafe/data/badWords.txt";
  let SHOW_MATCHED_HASH = true;
  let REPLACE_LOOKALIKE_SYMBOLS = true;
  let REMOVE_PUNCTUATION_VARIANTS = true;
  let COLLAPSE_SEPARATED_LETTERS = true;
  let CANCEL_SPEECH_ON_BLOCK = true;

  let TTS_INPUT_SELECTORS = [
    "#ttsText",
    "[data-tts-input]",
    'textarea[name="tts"]',
    'textarea[name="textToSpeech"]'
  ];

  let TTS_BUTTON_SELECTORS = [
    "#ttsSpeakBtn",
    "[data-tts-speak]"
  ];

  const LOOKALIKE_REPLACEMENTS = {
    "@": "a",
    "4": "a",
    "0": "o",
    "1": "i",
    "!": "i",
    "|": "i",
    "3": "e",
    "\u20ac": "e",
    "5": "s",
    "$": "s",
    "7": "t",
    "+": "t",
    "8": "b",
    "9": "g",
    "\u00a3": "l"
  };

  let bannedHashes = new Set();
  let bannedLoaded = false;
  let suppressNextCheck = false;
  let modalOpen = false;

  function log(...args) {
    if (DEBUG) console.log("[TtsGuard]", ...args);
  }

  function error(...args) {
    if (DEBUG) console.error("[TtsGuard]", ...args);
  }

  async function applyTtsConfig() {
    if (!window.SiteConfig?.ready) return;

    try {
      const config = await window.SiteConfig.ready;
      const autoSafe = config?.autoSafe || {};
      const tts = autoSafe.tts || {};

      GUARD_ENABLED = autoSafe.enabled !== false && tts.enabled !== false;
      DEBUG = Boolean(config?.environment?.showDebugLogs || tts.debug);
      BAD_WORDS_URL = tts.badWordsUrl || autoSafe.badWordsUrl || BAD_WORDS_URL;
      SHOW_MATCHED_HASH = tts.showMatchedHash !== false;
      REPLACE_LOOKALIKE_SYMBOLS = tts.replaceLookalikeSymbols !== false;
      REMOVE_PUNCTUATION_VARIANTS = tts.removePunctuationVariants !== false;
      COLLAPSE_SEPARATED_LETTERS = tts.collapseSeparatedLetters !== false;
      CANCEL_SPEECH_ON_BLOCK = tts.cancelSpeechOnBlock !== false;

      if (Array.isArray(tts.inputSelectors) && tts.inputSelectors.length) {
        TTS_INPUT_SELECTORS = tts.inputSelectors;
      }

      if (Array.isArray(tts.buttonSelectors) && tts.buttonSelectors.length) {
        TTS_BUTTON_SELECTORS = tts.buttonSelectors;
      }
    } catch (err) {
      error("Failed to apply TTS guard config:", err);
    }
  }

  function findFirst(selectors, root = document) {
    for (const selector of selectors) {
      const el = root.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  function replaceLookalikeSymbols(text) {
    const replacements = {
      "@": "a",
      "4": "a",
      "0": "o",
      "1": "i",
      "!": "i",
      "|": "i",
      "3": "e",
      "€": "e",
      "5": "s",
      "$": "s",
      "7": "t",
      "+": "t",
      "8": "b",
      "9": "g",
      "£": "l"
    };

    return [...String(text || "").toLowerCase().normalize("NFKC")]
      .map((char) => LOOKALIKE_REPLACEMENTS[char] || replacements[char] || char)
      .join("");
  }

  function describeSymbolChanges(text) {
    const changes = new Set();

    for (const char of [...String(text || "").toLowerCase().normalize("NFKC")]) {
      const replacement = LOOKALIKE_REPLACEMENTS[char];
      if (replacement && replacement !== char) {
        changes.add(`${char} -> ${replacement}`);
      }
    }

    return [...changes];
  }

  function normalizeText(text, options = {}) {
    const raw = options.replaceSymbols
      ? replaceLookalikeSymbols(text)
      : String(text || "").toLowerCase().normalize("NFKC");

    return raw
      .toLowerCase()
      .replace(/\r/g, "")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function compactText(text, options = {}) {
    const raw = options.replaceSymbols
      ? replaceLookalikeSymbols(text)
      : String(text || "").toLowerCase().normalize("NFKC");

    return raw
      .replace(/\r/g, "")
      .replace(/[^\p{L}\p{N}]/gu, "")
      .trim();
  }

  async function sha256Hex(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(hashBuffer)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
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
        .map((line) => String(line || "").trim().toLowerCase())
        .filter(Boolean);

      bannedHashes = new Set(lines);
      bannedLoaded = true;
      log(`Loaded ${bannedHashes.size} TTS guard hashes.`);
    } catch (err) {
      error("Failed to fetch bad words file:", err);
    }
  }

  function recordTerm(candidates, term, changes = []) {
    const cleanTerm = String(term || "").trim();
    if (!cleanTerm || candidates.has(cleanTerm)) return;

    candidates.set(cleanTerm, {
      term: cleanTerm,
      changes: [...new Set(changes)]
    });
  }

  function addWordTerms(words, candidates, changes = []) {
    if (!words.length) return;

    for (const word of words) recordTerm(candidates, word, changes);

    for (let i = 0; i < words.length - 1; i++) {
      recordTerm(candidates, `${words[i]} ${words[i + 1]}`, changes);
    }

    for (let i = 0; i < words.length - 2; i++) {
      recordTerm(candidates, `${words[i]} ${words[i + 1]} ${words[i + 2]}`, changes);
    }
  }

  function addCollapsedLetterRuns(words, candidates, changes = []) {
    let run = "";
    const collapsedChanges = [...changes, "letter separators removed"];

    for (const word of words) {
      if (word.length === 1) {
        run += word;
        continue;
      }

      if (run.length > 1) recordTerm(candidates, run, collapsedChanges);
      run = "";
    }

    if (run.length > 1) recordTerm(candidates, run, collapsedChanges);
  }

  function buildTermsToCheck(text) {
    const symbolChanges = describeSymbolChanges(text);
    const variants = [
      { term: normalizeText(text), changes: [] }
    ];

    if (REPLACE_LOOKALIKE_SYMBOLS) {
      variants.push({ term: normalizeText(text, { replaceSymbols: true }), changes: symbolChanges });
    }

    const candidates = new Map();

    for (const variant of variants) {
      const words = variant.term.split(" ").filter(Boolean);
      addWordTerms(words, candidates, variant.changes);
      if (COLLAPSE_SEPARATED_LETTERS) addCollapsedLetterRuns(words, candidates, variant.changes);
      recordTerm(candidates, variant.term, variant.changes);
    }

    if (REMOVE_PUNCTUATION_VARIANTS) {
      const compactVariants = [
        { term: compactText(text), changes: ["punctuation removed"] },
        ...String(text || "")
          .split(/\s+/)
          .map((part) => ({ term: compactText(part), changes: ["punctuation removed"] }))
      ];

      if (REPLACE_LOOKALIKE_SYMBOLS) {
        compactVariants.push(
          { term: compactText(text, { replaceSymbols: true }), changes: [...symbolChanges, "punctuation removed"] },
          ...String(text || "")
            .split(/\s+/)
            .map((part) => ({ term: compactText(part, { replaceSymbols: true }), changes: [...symbolChanges, "punctuation removed"] }))
        );
      }

      for (const variant of compactVariants.filter((variant) => variant.term && variant.term.length > 1)) {
        recordTerm(candidates, variant.term, variant.changes);
      }
    }

    return [...candidates.values()];
  }

  async function isBlocked(text) {
    if (!bannedLoaded) {
      return { blocked: false, matchedHash: null };
    }

    const terms = buildTermsToCheck(text);
    if (!terms.length) {
      return { blocked: false, matchedHash: null };
    }

    const hashes = await Promise.all(terms.map((candidate) => sha256Hex(candidate.term)));

    for (let i = 0; i < hashes.length; i++) {
      const hash = hashes[i];
      if (bannedHashes.has(hash)) {
        return {
          blocked: true,
          matchedHash: hash,
          matchedTerm: terms[i].term,
          changes: terms[i].changes
        };
      }
    }

    return { blocked: false, matchedHash: null };
  }

  function ensureModal() {
    if (document.getElementById("sb-tts-warning-modal")) return;

    const root = document.createElement("div");
    root.innerHTML = `
      <div id="sb-tts-warning-backdrop"
           class="fixed inset-0 z-[9998] hidden bg-slate-950/75 backdrop-blur-md"></div>

      <div id="sb-tts-warning-modal"
           class="fixed inset-0 z-[9999] hidden items-center justify-center p-4">
        <div role="dialog"
             aria-modal="true"
             aria-labelledby="sb-tts-warning-title"
             class="w-full max-w-lg overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-slate-950 shadow-2xl shadow-rose-950/20">
          <div class="h-1.5 bg-gradient-to-r from-rose-500 via-orange-400 to-amber-300"></div>

          <div class="p-6 sm:p-7">
            <div class="flex items-start justify-between gap-5">
              <div class="flex items-start gap-4">
                <div class="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-rose-50 ring-1 ring-rose-100">
                  <div class="absolute inset-1 rounded-[1.25rem] bg-gradient-to-br from-rose-100 to-amber-50"></div>
                  <svg class="relative h-9 w-9 text-rose-600 drop-shadow-sm" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <path d="M24 5.5 39 11v11.6c0 9.2-6.2 17.8-15 20-8.8-2.2-15-10.8-15-20V11l15-5.5Z" fill="currentColor" opacity=".95"/>
                    <path d="M16.5 31.5 31.5 16.5" stroke="#fff1f2" stroke-width="4.2" stroke-linecap="round"/>
                    <path d="M16.5 16.5 31.5 31.5" stroke="#fff1f2" stroke-width="4.2" stroke-linecap="round"/>
                  </svg>
                </div>

                <div>
                  <p class="text-xs font-extrabold uppercase tracking-[0.24em] text-rose-600">
                    TTS blocked
                  </p>
                  <h2 id="sb-tts-warning-title" class="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    That text was removed
                  </h2>
                  <p class="mt-3 text-sm font-semibold leading-6 text-slate-600">
                    The phrase you typed matches the TTS safety filter. The text box has been cleared and speech playback was stopped before it could be read aloud.
                  </p>
                </div>
              </div>

              <button id="sb-tts-warning-close"
                      type="button"
                      class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      aria-label="Close">
                &times;
              </button>
            </div>

            <div class="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-4">
              <div class="flex gap-3">
                <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3.5 21 19H3L12 3.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M12 9v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M12 16.5h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-extrabold text-amber-900">
                    Smoothwall may flag this
                  </p>
                  <p class="mt-1 text-sm font-semibold leading-6 text-amber-900/75">
                    Avoid entering terms like this in text to speech. School filtering tools may log or flag them, even if you did not mean to play the audio.
                  </p>
                </div>
              </div>
            </div>

            <details id="sb-tts-warning-hash-box"
                     class="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <summary class="cursor-pointer select-none text-sm font-extrabold text-slate-700 marker:text-rose-500">
                More details
              </summary>
              <div class="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p class="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  Matched reference
                </p>
                <p id="sb-tts-warning-hash"
                   class="mt-2 break-all rounded-2xl bg-slate-100 p-3 font-mono text-xs leading-6 text-slate-600"></p>
              </div>
              <div id="sb-tts-warning-change-box"
                   class="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                <p class="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  Character changes performed
                </p>
                <ul id="sb-tts-warning-changes"
                    class="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-slate-600"></ul>
              </div>
            </details>

            <div class="mt-6 flex justify-end gap-3">
              <button id="sb-tts-warning-ok"
                      type="button"
                      class="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-rose-700">
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    const modal = document.getElementById("sb-tts-warning-modal");
    const backdrop = document.getElementById("sb-tts-warning-backdrop");
    const closeBtn = document.getElementById("sb-tts-warning-close");
    const okBtn = document.getElementById("sb-tts-warning-ok");

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

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.classList.contains("hidden")) {
        hide();
      }
    });
  }

  function showWarningModal(match) {
    ensureModal();

    const modal = document.getElementById("sb-tts-warning-modal");
    const backdrop = document.getElementById("sb-tts-warning-backdrop");
    const hashEl = document.getElementById("sb-tts-warning-hash");
    const hashBox = document.getElementById("sb-tts-warning-hash-box");
    const changeBox = document.getElementById("sb-tts-warning-change-box");
    const changeList = document.getElementById("sb-tts-warning-changes");
    const matchedHash = match?.matchedHash || null;
    const changes = Array.isArray(match?.changes) ? match.changes.filter(Boolean) : [];

    if (matchedHash && SHOW_MATCHED_HASH) {
      hashEl.textContent = matchedHash;
      hashBox.classList.remove("hidden");
    } else {
      hashEl.textContent = "";
      hashBox.classList.add("hidden");
    }

    if (changeBox && changeList) {
      changeList.replaceChildren();

      if (changes.length) {
        for (const change of changes) {
          const item = document.createElement("li");
          item.textContent = change;
          changeList.appendChild(item);
        }
        changeBox.classList.remove("hidden");
      } else {
        changeBox.classList.add("hidden");
      }
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    backdrop.classList.remove("hidden");
    document.documentElement.classList.add("overflow-hidden");
    document.body.classList.add("overflow-hidden");
    modalOpen = true;
  }

  function clearAndWarn(input, match) {
    suppressNextCheck = true;
    input.value = "";
    input.blur();

    if (CANCEL_SPEECH_ON_BLOCK && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    showWarningModal(match);

    setTimeout(() => {
      suppressNextCheck = false;
    }, 50);
  }

  async function checkInput(input, event = null) {
    if (suppressNextCheck || modalOpen) return false;

    const rawValue = String(input.value || "");
    const result = await isBlocked(rawValue);

    if (!result.blocked) return false;

    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
    }

    clearAndWarn(input, result);
    return true;
  }

  function attachGuards(input, button) {
    input.addEventListener("input", () => {
      checkInput(input);
    }, true);

    input.addEventListener("keyup", () => {
      checkInput(input);
    }, true);

    input.addEventListener("paste", () => {
      setTimeout(() => checkInput(input), 0);
    }, true);

    button?.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();

      const blocked = await checkInput(input);
      if (!blocked) {
        window.speakSoundboardTts?.();
      }
    }, true);
  }

  function bindTtsGuard() {
    const input = findFirst(TTS_INPUT_SELECTORS);

    if (!input) {
      log("No TTS input found.");
      return;
    }

    const button = findFirst(TTS_BUTTON_SELECTORS);
    attachGuards(input, button);
  }

  async function init() {
    await applyTtsConfig();
    if (!GUARD_ENABLED) return;

    if (!window.crypto?.subtle) {
      error("Web Crypto API not available.");
      return;
    }

    await loadBadWords();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bindTtsGuard, { once: true });
    } else {
      bindTtsGuard();
    }
  }

  init();
})();
