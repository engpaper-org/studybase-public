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

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

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
      modal.closeAccountModal = close;

      return modal;
    }

    const subscriptionProducts = [
      { name: "Games Plus", price: "£1.99/month", note: "Leaderboard submissions, verified scores, badges, and stats.", tone: "#7c3aed" },
      { name: "Proxy Plus", price: "£3.99/month", note: "Private proxy access with fair-use limits.", tone: "#2563eb" },
      { name: "Music Plus", price: "£1.99/month", note: "Music player, playlists, favourites, and a saved library.", tone: "#db2777" },
      { name: "Chat Plus", price: "£1.49/month", note: "Chat with other users, profile badges, and private rooms.", tone: "#059669" },
      { name: "Custom Domain", price: "£30/year", note: "One included domain from approved low-cost TLDs.", tone: "#d97706" },
      { name: "All Access", price: "£6.99/month", note: "Proxy, music, leaderboards, and chat in one plan.", tone: "#6d28d9", featured: true },
      { name: "All Access + Domain", price: "£49.99/year", note: "Everything in All Access, plus an included custom domain.", tone: "#0f172a" }
    ];

    function showSubscriptions() {
      document.getElementById("sbx-subscriptions-modal")?.remove();
      const modal = document.createElement("div");
      modal.id = "sbx-subscriptions-modal";
      modal.className = "sbx-login-modal is-open";
      modal.innerHTML = `<div role="dialog" aria-modal="true" aria-labelledby="sbx-subscriptions-title" style="width:min(1040px,calc(100vw - 28px));max-height:calc(100vh - 28px);overflow:auto;background:linear-gradient(145deg,#fff,#f5f3ff);border-radius:28px;padding:clamp(22px,4vw,38px);box-shadow:0 30px 90px rgba(15,23,42,.35)"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:20px"><div><span style="display:inline-flex;padding:7px 11px;border-radius:999px;background:#ede9fe;color:#6d28d9;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase">StudyBase Plus preview</span><h2 id="sbx-subscriptions-title" style="margin:13px 0 0;font-size:clamp(28px,4vw,42px);line-height:1.05;color:#0f172a;font-weight:950">Enjoy StudyBase with more features</h2><p style="margin:12px 0 0;max-width:720px;color:#64748b;line-height:1.65">Explore upcoming optional plans. Purchases are not available yet. Plans do not renew automatically; access lasts for the monthly or annual period shown and must be purchased again when it expires.</p></div><button type="button" data-subscription-close aria-label="Close subscriptions" style="flex:0 0 auto;width:42px;height:42px;border:1px solid #e2e8f0;border-radius:14px;background:#fff;color:#475569;font-size:24px;cursor:pointer">&times;</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:26px">${subscriptionProducts.map(product => `<article style="position:relative;display:flex;min-height:230px;flex-direction:column;border:${product.featured ? "2px solid #8b5cf6" : "1px solid #e2e8f0"};border-radius:22px;background:#fff;padding:21px;box-shadow:0 12px 35px rgba(15,23,42,.07)">${product.featured ? '<span style="position:absolute;right:16px;top:16px;border-radius:999px;background:#7c3aed;padding:5px 9px;color:white;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.08em">Best value</span>' : ""}<div style="width:42px;height:42px;border-radius:14px;background:${product.tone}18;color:${product.tone};display:grid;place-items:center;font-weight:950">+</div><h3 style="margin:17px 0 0;color:#0f172a;font-size:20px;font-weight:950">${escapeHtml(product.name)}</h3><p style="margin:7px 0 0;color:${product.tone};font-size:18px;font-weight:950">${escapeHtml(product.price)}</p><p style="margin:11px 0 18px;color:#64748b;font-size:13px;line-height:1.55">${escapeHtml(product.note)}</p><button type="button" disabled style="margin-top:auto;width:100%;border:0;border-radius:12px;padding:11px;background:#e2e8f0;color:#64748b;font-weight:850;cursor:not-allowed">Not available yet</button></article>`).join("")}</div><div style="margin-top:20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;border-radius:18px;background:#0f172a;padding:16px 18px;color:#cbd5e1;font-size:12px;line-height:1.55"><span>Future checkout and payment processing will be provided through Sellbase.gg.</span><a href="/legal/tos.html#subscriptions" style="color:#c4b5fd;font-weight:850">Read purchase terms</a></div></div>`;
      document.body.appendChild(modal);
      const close = () => { document.removeEventListener("keydown", onKeydown); modal.remove(); };
      const onKeydown = event => { if (event.key === "Escape") close(); };
      modal.querySelector("[data-subscription-close]").onclick = close;
      modal.onclick = event => { if (event.target === modal) close(); };
      document.addEventListener("keydown", onKeydown);
    }

    window.StudyBaseSubscriptions = { show: showSubscriptions, products: subscriptionProducts.map(product => ({ ...product })) };
    window.dispatchEvent(new CustomEvent("studybase:subscriptions-ready"));

    function showLoginSuccess(user) {
      document.getElementById("sbx-login-success-modal")?.remove();
      const success = document.createElement("div");
      success.id = "sbx-login-success-modal";
      success.className = "sbx-login-modal is-open";
      success.innerHTML = `<div class="sbx-login-dialog" style="max-width:460px;height:auto;padding:32px;background:#fff;border-radius:24px;text-align:center"><div style="width:56px;height:56px;margin:0 auto 16px;border-radius:18px;background:#dcfce7;color:#15803d;display:grid;place-items:center;font-size:28px;font-weight:900">&#10003;</div><h2 style="font-size:26px;font-weight:900;color:#0f172a">You are signed in</h2><p style="margin-top:10px;color:#64748b">Welcome back, <strong style="color:#0f172a">${escapeHtml(user?.name || "StudyBase user")}</strong>.</p><p style="margin-top:5px;color:#64748b">Logged in as <strong style="color:#6d28d9">@${escapeHtml(user?.username || "user")}</strong></p><button type="button" style="margin-top:24px;width:100%;border:0;border-radius:14px;padding:13px;background:#7c3aed;color:#fff;font-weight:800;cursor:pointer">Continue</button></div>`;
      document.body.appendChild(success);
      const closeSuccess = () => success.remove();
      success.querySelector("button").onclick = () => { closeSuccess(); showSubscriptions(); };
      success.onclick = event => { if (event.target === success) closeSuccess(); };
    }

    function showAccountStatus({ title, message, buttonLabel = "Continue", onButton }) {
      document.getElementById("sbx-account-status-modal")?.remove();
      const status = document.createElement("div");
      status.id = "sbx-account-status-modal";
      status.className = "sbx-login-modal is-open";
      status.innerHTML = `<div class="sbx-login-dialog" style="max-width:480px;height:auto;padding:32px;background:#fff;border-radius:24px;text-align:center"><div style="width:56px;height:56px;margin:0 auto 16px;border-radius:18px;background:#ede9fe;color:#6d28d9;display:grid;place-items:center;font-size:28px;font-weight:900">&#10003;</div><h2 style="font-size:26px;font-weight:900;color:#0f172a">${escapeHtml(title)}</h2><p style="margin-top:10px;color:#64748b;line-height:1.6">${escapeHtml(message)}</p><button type="button" style="margin-top:24px;width:100%;border:0;border-radius:14px;padding:13px;background:#7c3aed;color:#fff;font-weight:800;cursor:pointer">${escapeHtml(buttonLabel)}</button></div>`;
      document.body.appendChild(status);
      status.querySelector("button").onclick = () => { status.remove(); onButton?.(); };
      status.onclick = event => { if (event.target === status) status.remove(); };
    }

    window.addEventListener("message", event => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "studybase:login-success") {
        ensureAccountModal().closeAccountModal?.();
        updateAuthState();
        window.dispatchEvent(new CustomEvent("studybase:account-session-updated"));
        showLoginSuccess(event.data.user);
        return;
      }
      if (event.data?.type === "studybase:account-status") {
        ensureAccountModal().closeAccountModal?.();
        if (["deleted", "signedout", "passwordChanged"].includes(event.data.status)) clearAuthSession();
        updateAuthState();
        if (event.data.status === "deleted") showAccountStatus({ title: "Account deleted", message: "Your account and related account data have been deleted." });
        if (event.data.status === "signedout") showAccountStatus({ title: "Signed out", message: "You have been securely signed out of StudyBase." });
        if (event.data.status === "passwordChanged") showAccountStatus({ title: "Password changed", message: "Your password was changed and existing sessions were signed out.", buttonLabel: "Log in", onButton: () => ensureAccountModal().openPage(`/myaccount/login.html${event.data.username ? `?username=${encodeURIComponent(event.data.username)}` : ""}`, "StudyBase login") });
      }
    });

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
        const finish = () => { clearAuthSession(); window.location.href = "/?signedout=true"; };
        if (window.StudyBaseServices?.logout) window.StudyBaseServices.logout().finally(finish);
        else fetch("https://api.studybase.site/api/logout", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: "{}" }).finally(finish);
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
        const statusParam = ["loggedin", "deleted", "signedout", "passwordChanged"].find(name => params.get(name) === "true");
        if (statusParam) {
          const username = (params.get("username") || "").trim();
          const url = new URL(window.location.href);
          ["loggedin", "deleted", "signedout", "passwordChanged", "username"].forEach(name => url.searchParams.delete(name));
          window.history.replaceState({}, "", url.pathname + url.search + url.hash);
          if (window.parent !== window) {
            window.parent.postMessage({ type: "studybase:account-status", status: statusParam, username }, window.location.origin);
            return;
          }
          setTimeout(() => {
            if (statusParam === "loggedin") {
              showAccountStatus({ title: "Account created", message: "Your StudyBase account is ready. Log in to start using it.", buttonLabel: "Log in", onButton: () => ensureAccountModal().openPage(`/myaccount/login.html${username ? `?username=${encodeURIComponent(username)}` : ""}`, "StudyBase login") });
            } else if (statusParam === "deleted") {
              showAccountStatus({ title: "Account deleted", message: "Your account and related account data have been deleted." });
            } else if (statusParam === "signedout") {
              showAccountStatus({ title: "Signed out", message: "You have been securely signed out of StudyBase." });
            } else {
              showAccountStatus({ title: "Password changed", message: "Your password was changed. Log in again with the new password.", buttonLabel: "Log in", onButton: () => ensureAccountModal().openPage(`/myaccount/login.html${username ? `?username=${encodeURIComponent(username)}` : ""}`, "StudyBase login") });
            }
          }, 80);
          return;
        }
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
