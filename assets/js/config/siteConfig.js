(function () {
  const DEFAULT_CONFIG = {
    distributionId: "studybase-main",
    brand: {
      name: "StudyBase",
      suffix: ".site",
      displayName: "StudyBase.site",
      shortName: "StudyBase",
      serviceAlias: "studybase.site",
      securityName: "StudyBase Security Checkpoint",
      tagline:
        "A paper-first A-Level revision service for finding past papers, marking with purpose and using focused tools to improve the next attempt."
    },
    urls: {
      site: "https://studybase.site",
      eSite: "https://e.studybase.site",
      home: "/index.html",
      privacy: "/legal/privacy.html",
      terms: "/legal/tos.html"
    },
    icons: {
      favicon: "/assets/images/site-icons/main.ico",
      navbar: "/assets/images/site-icons/navbar.png",
      footer: "/assets/images/site-icons/main.ico",
      appleTouch: "/assets/images/site-icons/navbar.png"
    },
    ui: {
      theme: {
        defaultMode: "light",
        defaultDarkMode: false,
        darkModeStorageKey: "darkMode",
        colorScheme: "light"
      },
      fonts: {
        heading: "Plus Jakarta Sans",
        body: "Inter",
        mono: "JetBrains Mono"
      },
      loading: {
        hideBodyUntilConfigReady: true,
        bodyReadyClass: "sb-config-ready",
        bodyLoadingClass: "sb-config-loading"
      }
    },
    navigation: {
      enabled: true,
      brandSubtitle: "Past papers, tools, resources",
      supportSubtitle: "Support Centre",
      loginCheckIntervalMs: 90000,
      accountUrl: "/myaccount/account.html",
      loginUrl: "/myaccount/login.html",
      settingsUrl: "/myaccount/settings.html",
      sections: {
        studyTools: true,
        resources: true,
        pastPapers: true,
        blogs: true,
        support: true
      }
    },
    footer: {
      enabled: true,
      preFooterEnabled: true,
      randomizePreFooter: true,
      cycleStartMonth: 6,
      columns: {
        papers: true,
        studyTools: true,
        resources: true,
        platform: true
      }
    },
    endpoints: {
      apiBase: "https://api.studybase.site",
      loginState: "https://api.studybase.site/state",
      apgList: "https://alert-api.studybase.site/apg/list",
      reportProblem: "https://report-problem.studybase.site",
      resourceList: "https://api.studybase.site/resources/list",
      approvedEmailAccess: "https://api.studybase.site/resources/access/check",
      resourceGet: "https://api.studybase.site/resource/get",
      resourceState: "https://api.studybase.site/state",
      resourceTopCards: "https://api.studybase.site/resources/top-cards",
      consentLog: "https://script.google.com/macros/s/AKfycbyW-AQ4JeYOMujbXToocpkXPH_GMYxhJTqViDOkoPyXYrpcaMvFuxnVjtWQx-ot6T3L/exec",
      materialAnalytics: "https://script.google.com/macros/s/AKfycbz6WAa5VWe19UTQhKJ32eTF0gQnV2ZqQMyKlBflyzz9lpQrczB4RKeECsb5oKz7RLK9/exec",
      update: "https://update.studybase.site"
    },
    environment: {
      testMode: false,
      showDebugLogs: false,
      configFetchTimeoutMs: 2500
    },
    analytics: {
      enabled: true,
      googleTagId: "G-N7LHC0S1T1"
    },
    resources: {
      dataBase: "/assets/data/resources/alevel",
      rootFolder: "000",
      materialPage: "/r/material.html",
      embeddedMaterialHash: "#client-preflight",
      idleUnload: {
        enabled: false,
        afterInactiveMs: 120000,
        unloadOnBlur: true,
        unloadOnHidden: true,
        title: "Paused while inactive.",
        message: "To reduce resource load while you are away, the resource cards have been unloaded.",
        actionText: "Click anywhere to continue"
      }
    },
    autoSafe: {
      enabled: true,
      badWordsUrl: "/assets/data/safety/bad-words.txt",
      mainInput: {
        enabled: true,
        debug: false,
        violationsKey: "sb_searchguard_violations",
        searchDisabledAt: 5,
        reviewThreshold: 3,
        adminOverrideHash: "",
        showMatchedHash: true,
        refilterAfterBlock: true,
        inputSelectors: [
          "#searchInput",
          "input[type=\"search\"]",
          "input[name=\"q\"]",
          "input[name=\"search\"]",
          "#search",
          "#searchBar",
          "input[type=\"text\"]",
          "[data-search-input]",
          "firstName"
        ],
        buttonSelectors: [
          "button[type=\"submit\"]",
          "[data-search-button]",
          ".search-button"
        ]
      },
      tts: {
        enabled: true,
        debug: false,
        showMatchedHash: true,
        replaceLookalikeSymbols: true,
        removePunctuationVariants: true,
        collapseSeparatedLetters: true,
        cancelSpeechOnBlock: true,
        inputSelectors: [
          "#ttsText",
          "[data-tts-input]",
          "textarea[name=\"tts\"]",
          "textarea[name=\"textToSpeech\"]"
        ],
        buttonSelectors: [
          "#ttsSpeakBtn",
          "[data-tts-speak]"
        ]
      }
    },
    updates: {
      enabled: true,
      endpoint: "https://update.studybase.site",
      versionPath: "/version",
      execPath: "/exec",
      execEnabled: true,
      modalEnabled: true,
      checkIntervalMs: 1000,
      failureCooldownMs: 300000,
      successStorageKey: "studybase_last_update_check",
      dailyCheckHour: 3,
      dailyCheckMinute: 0,
      minimumVisibleStepMs: 2000,
      perModuleDelayMs: 1000,
      registry: {
        deviceCheck: "/assets/js/monitoring/deviceCheck.js",
        timeCheck: "/assets/js/monitoring/timeCheck.js",
        timeRecords: "/assets/js/account/timeRecords.js",
        timeWarn: "/assets/js/account/timeWarn.js",
        checkVerification: "/assets/js/auth/checkVerification.js",
        envCheck: "/assets/js/monitoring/envCheck.js",
        hashtagProto: "/assets/js/resources/hashtagProto.js",
        analytics: "/assets/js/monitoring/analytics.js"
      }
    },
    timeLimits: {
      maintenance: {
        enabled: true,
        warningStart: "23:00",
        shutdownStart: "",
        shutdownEnd: "",
        checkIntervalMs: 5000,
        warningTitle: "Scheduled Daily Maintenance Imminent",
        warningMessage: "Scheduled overnight maintenance is disabled.",
        restoreMessage: "Services remain available unless an administrator manually disables them.",
        shutdownTitle: "StudyBase is currently offline for servicing",
        shutdownMessage: "Scheduled overnight maintenance is disabled.",
        actionTitle: "Action Required: Keep this tab open",
        actionMessage: "Your active session is safely preserved. At exactly 4:00 AM, this notice will automatically dismiss."
      },
      usageTracking: {
        enabled: true,
        storageKey: "siteActiveTime",
        tickMs: 1000,
        requireVisible: true,
        requireFocus: true,
        weekStartsOn: 1
      },
      wellbeingBreak: {
        enabled: true,
        storageKey: "siteActiveTime",
        alertKey: "siteActiveBreakAlert",
        dailyLimitSeconds: 3600,
        showOncePerDay: true,
        title: "You've spent over 1 hour on the site today.",
        subtitle: "You're doing well - consider taking a short break for today to reset your focus.",
        pill: "StudyBase Wellbeing"
      }
    },
    settings: {
      pageTitle: "Your Settings",
      pageDescription: "Control how StudyBase behaves on this device.",
      setupTitle: "Quick setup",
      setupDescription: "Set your preferences once - you can change them any time.",
      setupModeLabel: "Setup mode (from login)",
      editingModeLabel: "Editing mode",
      setupBrandLabel: "StudyBase setup",
      closeMessageTarget: "*",
      closeMessage: "animation_complete",
      toastDurationMs: 1200,
      autoSave: true,
      storageKeys: {
        redirect: "sb_redirectFromHistory",
        birthdays: "sb_showBirthdays",
        announcements: "sb_showAnnouncements",
        contentWarnings: "sb_showContentWarnings",
        redirectLogout: "sb_logoutAfterRedirect"
      },
      defaults: {
        firstName: "",
        redirect: true,
        redirectLogout: true,
        birthdays: true,
        announcements: true,
        contentWarnings: true
      },
      wizardDefaults: {
        firstStep: 0,
        skipHistoryStepWhenNameExists: true
      }
    },
    account: {
      sessionStorageKeys: {
        expiry: "studybase_session_expiry"
      },
      loginSuccessMessage: "login-success",
      sessionExpiredParam: "sessionExpired"
    },
    safetyPages: {
      contentWarningsEnabledStorageKey: "sb_showContentWarnings",
      defaultShowContentWarnings: true,
      safetyPageUrl: "/safety.html"
    },
    support: {
      url: "/support/help_center.html",
      label: "Support Centre",
      contactUrl: "/support/contact.html",
      reportUrl: "/report.html"
    },
    security: {
      turnstileSiteKeys: {
        login: "0x4AAAAAAC9-EW6MUp3spIEP",
        adminOverride: "0x4AAAAAAC9-bB7cCm-tLuHn",
        resource: "0x4AAAAAACxsClLBNoaHGiZm",
        test: "1x00000000000000000000AA"
      },
      useTestTurnstileInTestMode: true
    },
    years: {
      // These are computed at runtime for auto-updating "future" positioning copy
      // Use data-sb-year="next" etc on elements, or window.SB_YEARS
      current: null,
      next: null,
      prev: null
    }
  };

  const root = document.documentElement;
  root.classList.add("sb-config-loading");

  let activeConfig = DEFAULT_CONFIG;
  let activeThemePreference = null;

  // === Dynamic Year System (auto-updates "2026 Standard", cohorts, etc. every year) ===
  function computeYears() {
    const current = new Date().getFullYear();
    return {
      current: current,
      next: current + 1,
      prev: current - 1
    };
  }

  window.SB_YEARS = computeYears();
  // Also expose on the config for consistency
  DEFAULT_CONFIG.years = { ...window.SB_YEARS };

  function replaceYearsInText(text) {
    if (typeof text !== 'string' || !text) return text;
    const y = window.SB_YEARS;
    return text
      .replace(/\b2026\b/g, y.next)           // most common future reference
      .replace(/\b2025 cohort\b/gi, `${y.prev} cohort`)
      .replace(/\bthe students getting top grades in \d{4}/gi, (m) => m.replace(/\d{4}/, y.next))
      .replace(/Stop revising like it’s \d{4}/gi, `Stop revising like it’s ${y.prev}`)
      .replace(/Start winning like it’s \d{4}/gi, `Start winning like it’s ${y.next}`)
      .replace(/Revision in \d{4} should be different/gi, `Revision in ${y.next} should be different`)
      .replace(/THE \d{4} STANDARD/gi, `THE ${y.next} STANDARD`)
      .replace(/THE STUDENTS WHO WIN IN \d{4}/gi, `THE STUDENTS WHO WIN IN ${y.next}`);
  }

  function applyYearReplacements() {
    // 1. Data attribute driven (most reliable)
    document.querySelectorAll('[data-sb-year]').forEach(el => {
      const mode = el.dataset.sbYear;
      const y = window.SB_YEARS;
      let value = '';

      if (mode === 'current') value = y.current;
      else if (mode === 'next') value = y.next;
      else if (mode === 'prev') value = y.prev;
      else if (mode === 'next-short') value = String(y.next).slice(-2);
      else if (mode === 'current-short') value = String(y.current).slice(-2);

      if (value) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.value = value;
        } else {
          el.textContent = value;
        }
      }
    });

    // 2. Text node replacement for marketing copy (aggressive but safe patterns)
    if (!document.body) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement.tagName)) {
        if (/\b(2026|2025 cohort|it’s 2019|it’s 2026)\b/i.test(node.nodeValue)) {
          nodes.push(node);
        }
      }
    }
    nodes.forEach(n => {
      n.nodeValue = replaceYearsInText(n.nodeValue);
    });
  }

  function getThemeSettings(config) {
    return (config && config.ui && config.ui.theme) || DEFAULT_CONFIG.ui.theme;
  }

  function normalizeThemePreference(value) {
    const normalized = String(value || "").toLowerCase();
    if (["dark", "true", "1", "yes", "on"].includes(normalized)) return "dark";
    if (["light", "false", "0", "no", "off"].includes(normalized)) return "light";
    if (normalized === "system" || normalized === "auto") return "system";
    return "";
  }

  function prefersDarkTheme() {
    return Boolean(
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  function getDefaultThemePreference(config) {
    const theme = getThemeSettings(config);
    const configuredMode = normalizeThemePreference(theme.defaultMode);
    if (configuredMode) return configuredMode;
    if (theme.defaultDarkMode === true) return "dark";
    if (theme.colorScheme === "dark") return "dark";
    return "system";
  }

  function readStoredThemePreference(config) {
    const theme = getThemeSettings(config);
    const storageKeys = [
      theme.modeStorageKey,
      theme.darkModeStorageKey,
      "sb_theme",
      "darkMode"
    ].filter(Boolean);

    try {
      for (const key of storageKeys) {
        const storedValue = window.localStorage.getItem(key);
        const preference = normalizeThemePreference(storedValue);
        if (preference) return preference;
      }
    } catch (error) {
      return "";
    }

    return "";
  }

  function writeStoredThemePreference(preference, config) {
    const theme = getThemeSettings(config);
    const key = theme.darkModeStorageKey || theme.modeStorageKey || "darkMode";

    try {
      if (preference === "system") {
        window.localStorage.removeItem(key);
        if (theme.modeStorageKey) window.localStorage.removeItem(theme.modeStorageKey);
        return;
      }

      window.localStorage.setItem(key, preference === "dark" ? "true" : "false");
      if (theme.modeStorageKey && theme.modeStorageKey !== key) {
        window.localStorage.setItem(theme.modeStorageKey, preference);
      }
    } catch (error) {}
  }

  function setColorSchemeMeta(isDark) {
    let meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "color-scheme";
      document.head.appendChild(meta);
    }

    meta.content = isDark ? "dark light" : "light";
  }

  function applyThemePreference(preference, config, options = {}) {
    const normalizedPreference =
      normalizeThemePreference(preference) ||
      readStoredThemePreference(config) ||
      getDefaultThemePreference(config);
    const resolvedDark =
      normalizedPreference === "dark" ||
      (normalizedPreference === "system" && prefersDarkTheme());

    activeThemePreference = normalizedPreference;
    root.classList.toggle("dark", resolvedDark);
    root.dataset.theme = resolvedDark ? "dark" : "light";
    root.dataset.themePreference = normalizedPreference;
    root.style.colorScheme = resolvedDark ? "dark light" : "light";
    setColorSchemeMeta(resolvedDark);

    if (options.persist) {
      writeStoredThemePreference(normalizedPreference, config);
    }

    window.dispatchEvent(
      new CustomEvent("site-theme-change", {
        detail: {
          mode: resolvedDark ? "dark" : "light",
          preference: normalizedPreference,
          isDark: resolvedDark
        }
      })
    );

    return resolvedDark ? "dark" : "light";
  }

  function refreshThemeFromConfig(config) {
    activeConfig = config || DEFAULT_CONFIG;
    const preference = readStoredThemePreference(activeConfig) || getDefaultThemePreference(activeConfig);
    return applyThemePreference(preference, activeConfig);
  }

  applyThemePreference(readStoredThemePreference(DEFAULT_CONFIG) || getDefaultThemePreference(DEFAULT_CONFIG), DEFAULT_CONFIG);

  if (window.matchMedia) {
    const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (activeThemePreference === "system") {
        applyThemePreference("system", activeConfig);
      }
    };

    if (systemThemeQuery.addEventListener) {
      systemThemeQuery.addEventListener("change", handleSystemThemeChange);
    } else if (systemThemeQuery.addListener) {
      systemThemeQuery.addListener(handleSystemThemeChange);
    }
  }

  window.SiteTheme = {
    get mode() {
      return root.dataset.theme || "light";
    },
    get preference() {
      return activeThemePreference || getDefaultThemePreference(activeConfig);
    },
    apply(preference, options = {}) {
      return applyThemePreference(preference, activeConfig, options);
    },
    set(preference) {
      return applyThemePreference(preference, activeConfig, { persist: true });
    },
    toggle() {
      return applyThemePreference(
        root.classList.contains("dark") ? "light" : "dark",
        activeConfig,
        { persist: true }
      );
    },
    useSystem() {
      return applyThemePreference("system", activeConfig, { persist: true });
    }
  };

  if (!document.querySelector('script[data-studybase-endpoint-popup="true"]')) {
    const endpointPopupScript = document.createElement("script");
    endpointPopupScript.src = "/assets/js/monitoring/endpointPopup.js?v=20260512-fullscreen-report";
    endpointPopupScript.async = false;
    endpointPopupScript.dataset.studybaseEndpointPopup = "true";
    document.head.appendChild(endpointPopupScript);
  }

  if (!document.getElementById("sb-config-loading-style")) {
    const style = document.createElement("style");
    style.id = "sb-config-loading-style";
    style.textContent =
      "html.sb-config-loading body{visibility:hidden;}html.sb-config-ready body{visibility:visible;}";
    document.head.appendChild(style);
  }

  function setIcon(rel, href) {
    if (!href) return;
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement("link");
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = href;
  }

  function getDistributionId(config = activeConfig || DEFAULT_CONFIG) {
    return String(
      config?.distributionId ||
      config?.distribution?.id ||
      DEFAULT_CONFIG.distributionId ||
      ""
    ).trim();
  }

  function shouldAddDistributionId(url, config = activeConfig || DEFAULT_CONFIG) {
    if (!url || !config || !config.endpoints) return false;
    const endpoints = config.endpoints;

    return Object.keys(endpoints).some((key) => {
      const endpoint = endpoints[key];
      if (typeof endpoint !== "string" || !endpoint) return false;

      try {
        const parsedEndpoint = new URL(endpoint, window.location.origin);
        return (
          parsedEndpoint.protocol === url.protocol &&
          parsedEndpoint.hostname === url.hostname &&
          parsedEndpoint.port === url.port
        );
      } catch (_) {
        return false;
      }
    });
  }

  function withDistributionId(rawUrl, config = activeConfig || DEFAULT_CONFIG) {
    const distributionId = getDistributionId(config);
    if (!distributionId) return rawUrl;

    try {
      const url = new URL(rawUrl, window.location.href);
      if (!shouldAddDistributionId(url, config)) return rawUrl;
      if (!url.searchParams.has("distributionId")) {
        url.searchParams.set("distributionId", distributionId);
      }
      return url.toString();
    } catch (_) {
      return rawUrl;
    }
  }

  function installDistributionFetchWrapper(config) {
    if (window.__studybaseDistributionFetchWrapped) return;
    const originalFetch = window.fetch ? window.fetch.bind(window) : null;
    if (!originalFetch) return;

    window.__studybaseDistributionFetchWrapped = true;
    window.fetch = function distributionFetch(input, init) {
      try {
        const active = window.SB_CONFIG || config || activeConfig || DEFAULT_CONFIG;

        if (typeof input === "string" || input instanceof URL) {
          return originalFetch(withDistributionId(String(input), active), init);
        }

        if (input && typeof input.url === "string") {
          const nextUrl = withDistributionId(input.url, active);
          if (nextUrl !== input.url) {
            return originalFetch(new Request(nextUrl, input), init);
          }
        }
      } catch (_) {
        // Fall back to the original request below.
      }

      return originalFetch(input, init);
    };
  }

  function replaceBrandText(value, config) {
    if (typeof value !== "string" || !value) return value;

    const displayName = config.brand.displayName || config.brand.name || "";
    const shortName = config.brand.shortName || config.brand.name || displayName;
    const siteUrl = config.urls.site || "";
    const securityName = config.brand.securityName || shortName;

    // Support easy full rebrand: these strings in the UI will be replaced by whatever is in config.brand
    const replaceable = ["StudyBase", "Study Base", "studybase", "Studybase"];

    let result = value
      .replace(/https:\/\/revisionbase\.site/gi, siteUrl)
      .replace(/RevisionBase\.site/g, displayName)
      .replace(/revisionbase\.site/g, displayName.toLowerCase())
      .replace(/Revision Base Security Checkpoint/g, securityName);

    // Replace any of the known current brand names with the configured one (case-aware)
    replaceable.forEach((oldName) => {
      const lowerOld = oldName.toLowerCase();
      // Title case / exact
      result = result.replace(new RegExp(`\\b${oldName}\\b`, "g"), shortName);
      // All lower
      result = result.replace(new RegExp(`\\b${lowerOld}\\b`, "g"), shortName.toLowerCase());
      // All upper (rare)
      result = result.replace(new RegExp(`\\b${oldName.toUpperCase()}\\b`, "g"), shortName.toUpperCase());
    });

    // Final legacy fallback
    result = result.replace(/RevisionBase/g, shortName);

    return result;
  }

  function applyTextNodeBranding(config) {
    if (!document.body) return;

    const excluded = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT"]);
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent || excluded.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
          return /StudyBase|Study Base|studybase|RevisionBase|revisionbase\.site|Revision Base Security Checkpoint/.test(node.nodeValue)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      node.nodeValue = replaceBrandText(node.nodeValue, config);
    });
  }

  function applyAttributeBranding(config) {
    if (!document.body) return;

    const attrs = ["alt", "aria-label", "title", "placeholder", "content", "value"];
    document.querySelectorAll("*").forEach((el) => {
      attrs.forEach((attr) => {
        if (el.hasAttribute(attr)) {
          const next = replaceBrandText(el.getAttribute(attr), config);
          if (next !== el.getAttribute(attr)) el.setAttribute(attr, next);
        }
      });
    });
  }

  function applyConfig(config) {
    window.SB_CONFIG = config;
    installDistributionFetchWrapper(config);
    refreshThemeFromConfig(config);

    // Load unified premium design system
    if (!document.getElementById("sbx-premium-system")) {
      const link = document.createElement("link");
      link.id = "sbx-premium-system";
      link.rel = "stylesheet";
      link.href = "/assets/css/premium-system.css";
      document.head.appendChild(link);
    }

    // Load Tailwind CDN if not present (for consistent modern styling across pages)
    if (!document.getElementById("sbx-tailwind-cdn")) {
      const tw = document.createElement("script");
      tw.id = "sbx-tailwind-cdn";
      tw.src = "https://cdn.tailwindcss.com";
      tw.onload = () => {
        if (window.tailwind) {
          window.tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                fontFamily: {
                  sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif']
                }
              }
            }
          };
        }
      };
      document.head.appendChild(tw);
    }

    // Load Lucid icons for consistent iconography (especially theme button)
    if (!document.getElementById("sbx-lucid-icons")) {
      const luc = document.createElement("script");
      luc.id = "sbx-lucid-icons";
      luc.src = "https://unpkg.com/lucide@latest/dist/umd/lucide.js";
      luc.onload = () => {
        if (window.lucide) window.lucide.createIcons();
      };
      document.head.appendChild(luc);
    }

    document.title = replaceBrandText(document.title, config);
    setIcon("icon", config.icons.favicon);
    setIcon("shortcut icon", config.icons.favicon);
    setIcon("apple-touch-icon", config.icons.appleTouch || config.icons.favicon);

    if (document.body) {
      document.body.dataset.siteName = config.brand.displayName || config.brand.name || "";
      applyTextNodeBranding(config);
      applyAttributeBranding(config);
      applyYearReplacements();
    }

    window.dispatchEvent(new CustomEvent("site-config-ready", { detail: config }));
  }

  let brandObserver = null;
  let observerTimer = null;

  function startBrandObserver(config) {
    if (!document.body || !window.MutationObserver || brandObserver) return;

    brandObserver = new MutationObserver(() => {
      window.clearTimeout(observerTimer);
      observerTimer = window.setTimeout(() => {
        applyTextNodeBranding(config);
        applyAttributeBranding(config);
        applyYearReplacements();
        document.title = replaceBrandText(document.title, config);
      }, 30);
    });

    brandObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["alt", "aria-label", "title", "placeholder", "content", "value"]
    });
  }

  const ready = Promise.resolve(DEFAULT_CONFIG).then((config) => {
    applyConfig(config);

    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          applyConfig(config);
          startBrandObserver(config);
          root.classList.remove("sb-config-loading");
          root.classList.add("sb-config-ready");
        },
        { once: true }
      );
    } else {
      applyConfig(config);
      startBrandObserver(config);
      root.classList.remove("sb-config-loading");
      root.classList.add("sb-config-ready");
    }

    return config;
  });

  window.SiteConfig = {
    defaults: DEFAULT_CONFIG,
    ready,
    get(path, fallback) {
      const config = window.SB_CONFIG || DEFAULT_CONFIG;
      const value = String(path || "")
        .split(".")
        .filter(Boolean)
        .reduce((current, key) => (current && current[key] !== undefined ? current[key] : undefined), config);

      return value === undefined ? fallback : value;
    },
    apply: applyConfig,
    getDistributionId,
    withDistributionId,
    theme: window.SiteTheme
  };
})();
