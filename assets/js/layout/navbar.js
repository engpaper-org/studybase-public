(function () {
  const navGroups = [
    {
      label: "Resource Database",
      href: "/r/index.html#client-preflight",
      featured: true,
      links: [
        ["Open database", "/r/index.html#client-preflight"],
        ["Browse subjects", "/subjects/index.html"],
        ["Revision guides", "/blogs/index.html"]
      ]
    },
    {
      label: "Past Papers",
      href: "/past_papers/index.html",
      links: [
        ["Past paper finder", "/past_papers/index.html"],
        ["Mistake log", "/blogs/mistake-log.html"],
        ["Paper resources", "/past_papers/index.html"]
      ]
    },
    {
      label: "Study Tools",
      href: "/tools/",
      links: [
        ["All study tools", "/tools/"],
        ["Planning & Command Centre", "/tools/planning/"],
        ["Mathematics", "/tools/mathematics/"],
        ["Sciences", "/tools/sciences/"],
        ["Humanities & Essays", "/tools/humanities/"],
        ["Computer Science", "/tools/compsci/"],
        ["Languages & University", "/tools/languages/"]
      ]
    },
    {
      label: "Support",
      href: "/support/help_center.html",
      links: [
        ["Legal Centre", "/legal/index.html"],
        ["Help Centre", "/support/help_center.html"],
        ["TOS", "/legal/tos.html"],
        ["Privacy", "/legal/privacy.html"],
        ["Contributions", "/legal/contributions.html"]
      ]
    }
  ];

  function normalPath(value) {
    return String(value || "").split("#")[0].replace(/\/+$/, "") || "/index.html";
  }

  function isActive(href) {
    const path = normalPath(window.location.pathname);
    const target = normalPath(href);
    if (path === target) return true;
    if (target.endsWith("/index.html")) {
      return path.startsWith(target.replace(/\/index\.html$/, ""));
    }
    return false;
  }

  function groupMarkup(group) {
    const dropdown = group.links.map(([label, href]) => `
      <a class="sbx-nav-dropdown-link" href="${href}">
        <span>${label}</span>
        <span aria-hidden="true">&rarr;</span>
      </a>
    `).join("");

    return `
      <div class="sbx-nav-group ${group.featured ? "is-featured" : ""} ${isActive(group.href) ? "is-active" : ""}">
        <button class="sbx-nav-link sbx-nav-dropdown-trigger" type="button" aria-label="Open ${group.label} menu" aria-expanded="false">
          <span>${group.label}</span>
          <span class="sbx-nav-caret" aria-hidden="true"></span>
        </button>
        <div class="sbx-nav-dropdown">
          <div class="sbx-nav-dropdown-head">
            <strong>${group.label}</strong>
            <small>StudyBase remastered</small>
          </div>
          <a class="sbx-nav-dropdown-link is-primary" href="${group.href}">
            <span>Open ${group.label}</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
          ${dropdown}
        </div>
      </div>
    `;
  }

  function mobileMarkup() {
    return navGroups.map((group) => `
      <details class="sbx-mobile-group">
        <summary>${group.label}</summary>
        <a href="${group.href}">Open ${group.label}</a>
        ${group.links.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}
      </details>
    `).join("");
  }

  function readAuthKey(primaryKey, legacyKey) {
    try {
      const primary = (localStorage.getItem(primaryKey) || "").trim();
      if (primary) return primary;

      const legacy = (localStorage.getItem(legacyKey) || "").trim();
      if (legacy) {
        localStorage.setItem(primaryKey, legacy);
        localStorage.removeItem(legacyKey);
      }
      return legacy;
    } catch (_) {
      return "";
    }
  }

  function isLoggedIn() {
    try {
      if (window.StudyBaseServices?.isLoggedIn) return window.StudyBaseServices.isLoggedIn();
      if (window.AccountAuth?.isLoggedIn) return window.AccountAuth.isLoggedIn();
    } catch (_) {}

    const token = localStorage.getItem("studybase_session_active") === "1";
    const expiry = Date.parse(localStorage.getItem("studybase_session_expiry") || "");
    return Boolean(token && Number.isFinite(expiry) && expiry > Date.now());
  }

  let loginAvailable = false;

  async function checkLoginAvailability() {
    const stateUrl =
      (window.SB_CONFIG && window.SB_CONFIG.endpoints && window.SB_CONFIG.endpoints.loginState) ||
      (window.SiteConfig && window.SiteConfig.defaults && window.SiteConfig.defaults.endpoints && window.SiteConfig.defaults.endpoints.loginState) ||
      "";
    try {
      const response = await fetch(stateUrl, {
        cache: "no-store",
        credentials: "omit"
      });
      if (!response.ok) return false;
      const data = await response.json();
      return Boolean(
        data &&
        data.ok === true &&
        data.shutdown === false &&
        data.reason === ""
      );
    } catch (_) {
      return false;
    }
  }

  function clearAuthSession() {
    try {
      if (window.StudyBaseServices?.clearAccountSession) {
        window.StudyBaseServices.clearAccountSession();
      }
    } catch (_) {}

    [
      "studybase_session_active",
      "studybase_session_expiry",
      "studybase_user"
    ].forEach((key) => {
      try { localStorage.removeItem(key); } catch (_) {}
    });

    window.dispatchEvent(new CustomEvent("studybase:account-session-cleared"));
  }

  function authMarkup() {
    if (isLoggedIn()) {
      return `
        <div class="sbx-nav-auth" data-sbx-auth>
          <a class="sbx-nav-access sbx-nav-account" href="/myaccount/account.html" data-sbx-account>My account</a>
          <button class="sbx-nav-access sbx-nav-signout" type="button" data-sbx-signout>Sign out</button>
        </div>
      `;
    }

    if (!loginAvailable) {
      // Only show the Login button when the state endpoint explicitly confirms services are available.
      return `<div class="sbx-nav-auth" data-sbx-auth></div>`;
    }

    return `
      <div class="sbx-nav-auth" data-sbx-auth>
        <a class="sbx-nav-access" href="/myaccount/login.html" data-sbx-login>Login</a>
      </div>
    `;
  }

  function isMaintenanceActive() {
    if (window.SB_MAINTENANCE_ACTIVE === true) return true;
    const banner = document.getElementById('studybase-maint-banner');
    if (banner && banner.style.display !== 'none') return true;

    // Time-based check: 23:02–04:00 UK time (out of service). Robust parsing.
    try {
      const now = new Date();

      // Reliable UK time extraction (avoids locale string parsing bugs)
      const ukFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      });
      const parts = ukFormatter.formatToParts(now);
      let hours = 0, minutes = 0;
      for (const p of parts) {
        if (p.type === 'hour') hours = parseInt(p.value, 10);
        if (p.type === 'minute') minutes = parseInt(p.value, 10);
      }
      const totalMinutes = hours * 60 + minutes;

      const shutdownStart = 23 * 60 + 2; // 23:02
      const shutdownEnd = 4 * 60;        // 04:00

      if (totalMinutes >= shutdownStart || totalMinutes < shutdownEnd) {
        return true;
      }
    } catch (e) {
      // On any error, default to NOT blocking (safer for users)
      return false;
    }

    return false;
  }

  function showMaintenanceLoginErrorModal() {
    // Remove any existing
    const existing = document.getElementById('sbx-maint-login-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'sbx-maint-login-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:2147483645;background:rgba(15,23,42,0.82);display:flex;align-items:center;justify-content:center;padding:20px;';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:20px;max-width:420px;width:100%;padding:28px 26px;box-shadow:0 25px 70px -15px rgba(0,0,0,0.35);border:1px solid #e2e8f0;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
        <div style="margin:0 auto 16px;width:52px;height:52px;border-radius:9999px;background:linear-gradient(145deg,#f8fafc,#e0f2fe);display:flex;align-items:center;justify-content:center;font-size:26px;">🛠️</div>
        <h2 style="margin:0 0 10px;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.01em;">Login unavailable</h2>
        <p style="margin:0 0 14px;color:#475569;font-size:15px;line-height:1.55;">Studybase online services are suspended during scheduled maintenance.</p>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.5;">Please try again after 4:00 AM.</p>
        <div style="font-size:12.5px;font-weight:700;color:#991b1b;background:#fef2f2;border:1px solid #fecaca;padding:9px 12px;border-radius:10px;margin-bottom:20px;">
          Reaching out to the site owner by email will lead to a permanent account ban.
        </div>
        <button type="button" style="background:#0f172a;color:#fff;border:none;border-radius:12px;padding:11px 22px;font-size:14px;font-weight:800;cursor:pointer;width:100%;">Understood</button>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('button');
    const close = () => modal.remove();

    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', esc);
      }
    }, { once: true });
  }

  function render() {
    if (document.getElementById("sbx-navbar")) return;

    const currentPath = normalPath(window.location.pathname);
    const isResourceDatabasePage = currentPath === "/r/index.html" || currentPath === "/r";
    const nav = document.createElement("header");
    nav.id = "sbx-navbar";
    nav.className = `sbx-navbar ${isResourceDatabasePage ? "is-resource-database" : ""}`;

    // Load the unified premium design system
    if (!document.getElementById("sbx-premium-system")) {
      const link = document.createElement("link");
      link.id = "sbx-premium-system";
      link.rel = "stylesheet";
      link.href = "/assets/css/premium-system.css";
      document.head.appendChild(link);
    }
    nav.innerHTML = `
      <div class="sbx-nav-inner">
        <a class="sbx-nav-brand" href="/index.html" aria-label="StudyBase home">
          <img class="sbx-nav-brand-lockup" src="/assets/images/site-icons/navbar-lockup.svg" alt="StudyBase" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
          <span class="sbx-nav-brand-fallback">
            <strong>StudyBase</strong>
            <small>A-Level paper ops</small>
          </span>
        </a>
        <nav class="sbx-nav-links" aria-label="Primary navigation">
          ${navGroups.map(groupMarkup).join("")}
          <div class="sbx-nav-group ${isActive("/docs/") ? "is-active" : ""}">
            <button class="sbx-nav-link sbx-nav-dropdown-trigger" type="button" aria-label="Open Doc Tools menu" aria-expanded="false">
              <span>Doc Tools</span>
              <span class="sbx-nav-caret" aria-hidden="true"></span>
            </button>
            <div class="sbx-nav-dropdown">
              <div class="sbx-nav-dropdown-head">
                <strong>Doc Tools</strong>
                <small>Offline document apps</small>
              </div>
              <a class="sbx-nav-dropdown-link is-primary" href="/docs/">
                <span>All Doc Tools</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
              <a class="sbx-nav-dropdown-link" href="/docs/text-editor/">
                <span>Text Editor</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
              <a class="sbx-nav-dropdown-link" href="/docs/pdf-editor/">
                <span>PDF Annotator</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </nav>
        ${authMarkup()}
        <button class="sbx-nav-toggle" type="button" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
      <nav class="sbx-mobile-menu" aria-label="Mobile navigation" hidden>
        <details class="sbx-mobile-group">
          <summary>Doc Tools</summary>
          <a href="/docs/">All Doc Tools</a>
          <a href="/docs/text-editor/">Text Editor</a>
          <a href="/docs/pdf-editor/">PDF Annotator</a>
        </details>
        ${mobileMarkup()}
        ${authMarkup()}
      </nav>
    `;

    document.body.insertAdjacentElement("afterbegin", nav);

    // Check the live service state endpoint. Only reveal the Login button if it returns the exact healthy response.
    checkLoginAvailability().then((available) => {
      loginAvailable = available;
      nav.querySelectorAll("[data-sbx-auth]").forEach((container) => {
        container.outerHTML = authMarkup();
      });
    });

    // React to maintenance banner state changes (from timeCheck.js)
    document.addEventListener('sb-maintenance-banner-shown', () => {
      // Login buttons will automatically respect isMaintenanceActive() on next click
    });
    document.addEventListener('sb-maintenance-banner-hidden', () => {
      // No action needed
    });

    // Initial check in case the banner was already visible when navbar rendered
    if (isMaintenanceActive()) {
      // State is live-checked on click, nothing extra required here
    }

    function updateAuthState() {
      if (!loginAvailable) {
        // Re-check availability (e.g. services may have recovered after previous failure)
        checkLoginAvailability().then((available) => {
          if (available) {
            loginAvailable = true;
            nav.querySelectorAll("[data-sbx-auth]").forEach((container) => {
              container.outerHTML = authMarkup();
            });
          }
        });
        return;
      }

      nav.querySelectorAll("[data-sbx-auth]").forEach((container) => {
        container.outerHTML = authMarkup();
      });
      // Re-apply maintenance login blocking if active (new buttons may have been rendered)
      if (isMaintenanceActive()) {
        // No extra work needed — the click handler above already checks isMaintenanceActive live
      }
    }

    function ensureAccountModal() {
      let modal = document.getElementById("sbx-login-modal");
      if (modal) return modal;

      modal = document.createElement("div");
      modal.id = "sbx-login-modal";
      modal.className = "sbx-login-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("aria-label", "StudyBase account");
      modal.innerHTML = `
        <div class="sbx-login-dialog">
          <button class="sbx-login-close" type="button" aria-label="Close account window">&times;</button>
          <iframe class="sbx-login-frame" title="StudyBase account" src="about:blank"></iframe>
        </div>
      `;
      document.body.appendChild(modal);

      const frame = modal.querySelector(".sbx-login-frame");
      const close = () => {
        modal.classList.remove("is-open");
        document.body.classList.remove("sbx-modal-lock");
        setTimeout(updateAuthState, 120);
      };

      modal.querySelector(".sbx-login-close").addEventListener("click", close);
      modal.addEventListener("click", (event) => {
        if (event.target === modal) close();
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("is-open")) close();
      });

      modal.openPage = (pageUrl, titleText = "StudyBase account") => {
        frame.setAttribute("title", titleText);
        frame.setAttribute("src", pageUrl);
        modal.classList.add("is-open");
        document.body.classList.add("sbx-modal-lock");
        modal.querySelector(".sbx-login-close").focus();
      };

      return modal;
    }

    nav.addEventListener("click", (event) => {
      const login = event.target.closest("[data-sbx-login]");
      const account = event.target.closest("[data-sbx-account]");
      const signout = event.target.closest("[data-sbx-signout]");

      if (login) {
        event.preventDefault();
        if (isMaintenanceActive()) {
          showMaintenanceLoginErrorModal();
        } else {
          ensureAccountModal().openPage("/myaccount/login.html", "StudyBase login");
        }
      }

      if (account) {
        event.preventDefault();
        ensureAccountModal().openPage("/myaccount/account.html", "My account");
      }

      if (signout) {
        event.preventDefault();
        clearAuthSession();
        updateAuthState();
      }
    });

    const toggle = nav.querySelector(".sbx-nav-toggle");
    const menu = nav.querySelector(".sbx-mobile-menu");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      if (menu) menu.hidden = !open;
    });

    nav.querySelectorAll(".sbx-nav-dropdown-trigger").forEach((button) => {
      button.addEventListener("click", () => {
        const group = button.closest(".sbx-nav-group");
        const open = !group.classList.contains("is-open");
        nav.querySelectorAll(".sbx-nav-group.is-open").forEach((item) => {
          item.classList.remove("is-open");
          item.querySelector(".sbx-nav-dropdown-trigger")?.setAttribute("aria-expanded", "false");
        });
        group.classList.toggle("is-open", open);
        button.setAttribute("aria-expanded", String(open));
      });
    });

    nav.querySelectorAll(".sbx-mobile-group").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (!details.open) return;
        nav.querySelectorAll(".sbx-mobile-group[open]").forEach((item) => {
          if (item !== details) item.open = false;
        });
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      nav.querySelectorAll(".sbx-nav-group.is-open").forEach((item) => {
        item.classList.remove("is-open");
        item.querySelector(".sbx-nav-dropdown-trigger")?.setAttribute("aria-expanded", "false");
      });
      const themeModal = document.getElementById("sbx-theme-modal");
      if (themeModal && themeModal.classList.contains("is-open")) {
        themeModal.remove();
        document.body.classList.remove("sbx-modal-lock");
      }
    });

    document.addEventListener("click", (event) => {
      if (nav.contains(event.target)) return;
      nav.querySelectorAll(".sbx-nav-group.is-open").forEach((item) => {
        item.classList.remove("is-open");
        item.querySelector(".sbx-nav-dropdown-trigger")?.setAttribute("aria-expanded", "false");
      });
    });

    window.addEventListener("storage", updateAuthState);
    window.addEventListener("focus", updateAuthState);
    window.addEventListener("studybase:account-session-cleared", updateAuthState);

    // Handle ?sessionExpired=true (or the configured param name).
    // Opens the standard navbar login modal and cleans the URL parameter.
    function handleSessionExpiredParam() {
      try {
        const configParam =
          (window.SB_CONFIG && window.SB_CONFIG.account && window.SB_CONFIG.account.sessionExpiredParam) ||
          "sessionExpired";

        const params = new URLSearchParams(window.location.search);
        if (params.get("signup") === "true") {
          const username = (params.get("username") || "").trim();
          const url = new URL(window.location.href);
          url.searchParams.delete("signup");
          url.searchParams.delete("username");
          window.history.replaceState({}, "", url.pathname + url.search + url.hash);
          setTimeout(() => {
            if (!isMaintenanceActive()) {
              const loginUrl = `/myaccount/login.html${username ? `?username=${encodeURIComponent(username)}` : ""}`;
              ensureAccountModal().openPage(loginUrl, "StudyBase login");
            }
          }, 80);
          return;
        }
        if (params.get(configParam) === "true") {
          // Clean the parameter from the URL immediately (no reload)
          const url = new URL(window.location.href);
          url.searchParams.delete(configParam);
          const cleanUrl = url.pathname + url.search + url.hash;
          window.history.replaceState({}, "", cleanUrl);

          // Open the normal login modal (iframe) shortly after navbar is ready.
          // Respect the existing maintenance gate so we don't show login during shutdown.
          setTimeout(() => {
            if (!isMaintenanceActive()) {
              ensureAccountModal().openPage("/myaccount/login.html", "StudyBase login");
            }
          }, 80);
        }
      } catch (_) {
        // Never let a bad/malformed param break the navbar
      }
    }

    handleSessionExpiredParam();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
