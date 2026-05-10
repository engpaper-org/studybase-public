(function () {
  const DEFAULT_CONFIG = {
    brand: {
      name: "StudyBase",
      suffix: ".site",
      displayName: "StudyBase.site",
      shortName: "StudyBase",
      securityName: "StudyBase Security Checkpoint",
      tagline:
        "A paper-first A-Level revision service for finding past papers, marking with purpose and using focused tools to improve the next attempt."
    },
    urls: {
      site: "https://studybase.site",
      eSite: "https://e.studybase.site",
      home: "/index.html",
      privacy: "/legal/index.html#privacy",
      terms: "/legal/index.html#terms"
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
        toolkit: true,
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
        toolkit: true,
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
      resourceGet: "https://api.studybase.site/resource/get",
      resourceState: "https://api.studybase.site/state",
      resourceTopCards: "https://api.studybase.site/resources/top-cards",
      consentLog:
        "https://script.google.com/macros/s/AKfycbyW-AQ4JeYOMujbXToocpkXPH_GMYxhJTqViDOkoPyXYrpcaMvFuxnVjtWQx-ot6T3L/exec",
      materialAnalytics:
        "https://script.google.com/macros/s/AKfycbz6WAa5VWe19UTQhKJ32eTF0gQnV2ZqQMyKlBflyzz9lpQrczB4RKeECsb5oKz7RLK9/exec",
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
      materialPage: "/resource_database/material.html",
      embeddedMaterialHash: "#primary-access",
      idleUnload: {
        enabled: true,
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
        loginAnimationCheck: "/assets/js/auth/loginAnimationCheck.js",
        timeRecords: "/assets/js/account/timeRecords.js",
        timeWarn: "/assets/js/account/timeWarn.js",
        playHistory: "/assets/js/monitoring/playHistory.js",
        checkVerification: "/assets/js/auth/checkVerification.js",
        envCheck: "/assets/js/monitoring/envCheck.js",
        hashtagProto: "/assets/js/resources/hashtagProto.js",
        settingsSafetyWarning: "/assets/js/account/settingsSafetyWarning.js",
        analytics: "/assets/js/monitoring/analytics.js"
      }
    },
    timeLimits: {
      maintenance: {
        enabled: true,
        warningStart: "23:00",
        shutdownStart: "23:02",
        shutdownEnd: "04:00",
        checkIntervalMs: 5000,
        warningTitle: "Scheduled Daily Maintenance Imminent",
        warningMessage: "To protect infrastructure stability and proactively reduce overnight server load, StudyBase will initiate its standard automated shutdown at 11:02 PM.",
        restoreMessage: "Services will automatically restore at 4:00 AM. Please save your current work.",
        shutdownTitle: "StudyBase is currently offline for servicing",
        shutdownMessage: "StudyBase undergoes scheduled daily maintenance between 11:02 PM and 4:00 AM.",
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
      quickLoginCodeLength: 6,
      toastDurationMs: 1200,
      autoSave: true,
      storageKeys: {
        firstName: "sb_firstName",
        redirect: "sb_redirectFromHistory",
        birthdays: "sb_showBirthdays",
        announcements: "sb_showAnnouncements",
        recent: "sb_saveRecentlyPlayed",
        searchHistory: "sb_saveSearchHistory",
        contentWarnings: "sb_showContentWarnings",
        redirectLogout: "sb_logoutAfterRedirect",
        quickLogin: "sb_quickLogin",
        quickLoginCodeHash: "sb_quickLoginCodeHash"
      },
      defaults: {
        firstName: "",
        redirect: true,
        redirectLogout: true,
        birthdays: true,
        announcements: true,
        recent: true,
        searchHistory: true,
        quickLogin: false,
        contentWarnings: true
      },
      wizardDefaults: {
        quickLoginWhenUnset: true,
        firstStep: 0,
        skipHistoryStepWhenNameExists: true
      }
    },
    account: {
      authStorageKeys: {
        username: "studybase_username",
        password: "studybase_password",
        device: "studybase_device"
      },
      sessionStorageKeys: {
        expiry: "studybase_session_expiry",
        expirySetAt: "studybase_session_expiry_set_at"
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
      contactUrl: "/contact.html",
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
    }
  };

  const CONFIG_URL = window.SB_CONFIG_URL || "/site.config.json";
  const root = document.documentElement;
  root.classList.add("sb-config-loading");

  let activeConfig = DEFAULT_CONFIG;
  let activeThemePreference = null;

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
    endpointPopupScript.src = "/assets/js/monitoring/endpointPopup.js?v=20260510-expected-results";
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

  function isObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function mergeDeep(base, override) {
    const output = Object.assign({}, base);
    if (!isObject(override)) return output;

    Object.keys(override).forEach((key) => {
      if (isObject(base[key]) && isObject(override[key])) {
        output[key] = mergeDeep(base[key], override[key]);
      } else {
        output[key] = override[key];
      }
    });

    return output;
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

  function replaceBrandText(value, config) {
    if (typeof value !== "string" || !value) return value;

    const displayName = config.brand.displayName || config.brand.name || "";
    const shortName = config.brand.shortName || config.brand.name || displayName;
    const siteUrl = config.urls.site || "";

    return value
      .replace(/https:\/\/revisionbase\.site/gi, siteUrl)
      .replace(/RevisionBase\.site/g, displayName)
      .replace(/revisionbase\.site/g, displayName.toLowerCase())
      .replace(/Revision Base Security Checkpoint/g, config.brand.securityName || shortName)
      .replace(/RevisionBase/g, shortName);
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
          return /RevisionBase|revisionbase\.site|Revision Base Security Checkpoint/.test(node.nodeValue)
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
    refreshThemeFromConfig(config);

    document.title = replaceBrandText(document.title, config);
    setIcon("icon", config.icons.favicon);
    setIcon("shortcut icon", config.icons.favicon);
    setIcon("apple-touch-icon", config.icons.appleTouch || config.icons.favicon);

    if (document.body) {
      document.body.dataset.siteName = config.brand.displayName || config.brand.name || "";
      applyTextNodeBranding(config);
      applyAttributeBranding(config);
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

  async function fetchConfig() {
    const controller = window.AbortController ? new AbortController() : null;
    const timeoutMs = Number(DEFAULT_CONFIG.environment.configFetchTimeoutMs) || 2500;
    const timeoutId = controller
      ? window.setTimeout(() => controller.abort(), timeoutMs)
      : null;

    try {
      const response = await fetch(CONFIG_URL, {
        cache: "no-store",
        signal: controller ? controller.signal : undefined
      });

      if (!response.ok) throw new Error(`Config request failed with ${response.status}`);
      return mergeDeep(DEFAULT_CONFIG, await response.json());
    } catch (error) {
      console.warn("Using default site config:", error);
      return DEFAULT_CONFIG;
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  }

  const ready = fetchConfig().then((config) => {
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
    theme: window.SiteTheme
  };
})();
