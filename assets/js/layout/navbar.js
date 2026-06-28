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
  let serviceShutdown = false;

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
      serviceShutdown = Boolean(data && data.ok === true && data.shutdown === true);
      if (serviceShutdown) {
        ["studybase_session_active", "studybase_session_expiry", "studybase_user"].forEach((key) => {
          try { localStorage.removeItem(key); } catch (_) {}
        });
        return false;
      }
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

  function getStoredUser() {
    try { return JSON.parse(localStorage.getItem("studybase_user") || "null"); }
    catch (_) { return null; }
  }

  function profileInitial(user) {
    const value = String(user?.name || user?.username || "s").trim().toLowerCase();
    const match = value.match(/[a-z]/);
    return match ? match[0] : "s";
  }

  function profilePictureUrl(user) {
    const value = String(user?.profilePicture || "sbo/1.jpg").trim().toLowerCase();
    const safe = /^[a-z0-9-]{1,32}\/[a-z0-9-]{1,32}\.jpg$/.test(value) ? value : "sbo/1.jpg";
    return `/assets/images/profile/pfp/${safe}`;
  }

  function authMarkup() {
    if (serviceShutdown) {
      return `<div class="sbx-nav-auth" data-sbx-auth></div>`;
    }

    if (isLoggedIn()) {
      const user = getStoredUser();
      const initial = profileInitial(user);
      return `
        <div class="sbx-nav-auth" data-sbx-auth>
          <a class="sbx-nav-pfp" href="/myaccount/account.html" data-sbx-account aria-label="Open my account">
            <img src="${profilePictureUrl(user)}" alt="" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='/assets/images/profile/pfp/sbo/1.jpg'}else{this.hidden=true;this.nextElementSibling.hidden=false}">
            <span hidden>${initial.toUpperCase()}</span>
          </a>
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
    return false;
  }

  function showMaintenanceLoginErrorModal() {}

  function isMobileDevice() {
    if (navigator.userAgentData?.mobile === true) return true;
    const userAgent = String(navigator.userAgent || "");
    if (/Android|iPhone|iPod|IEMobile|Windows Phone|Opera Mini|Mobile/i.test(userAgent)) return true;
    return /Macintosh/i.test(userAgent) && Number(navigator.maxTouchPoints || 0) > 1;
  }

  function showMobileUnsupported() {
    if (!isMobileDevice()) return false;
    if (document.getElementById("sbx-mobile-unsupported")) return true;
    const overlay = document.createElement("div");
    overlay.id = "sbx-mobile-unsupported";
    overlay.setAttribute("role", "alertdialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "sbx-mobile-title");
    overlay.style.cssText = "position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;overflow:hidden;padding:22px;background:linear-gradient(145deg,rgba(226,232,240,.94),rgba(241,245,249,.97) 45%,rgba(221,214,254,.94));backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#0f172a";
    overlay.innerHTML = `<div aria-hidden="true" style="position:absolute;left:-90px;top:8%;width:270px;height:150px;border-radius:999px;background:rgba(255,255,255,.72);filter:blur(14px);box-shadow:120px 25px 0 rgba(255,255,255,.48)"></div><div aria-hidden="true" style="position:absolute;right:-100px;bottom:7%;width:300px;height:170px;border-radius:999px;background:rgba(255,255,255,.65);filter:blur(18px);box-shadow:-135px -20px 0 rgba(255,255,255,.38)"></div><section style="position:relative;width:min(100%,460px);overflow:hidden;border:1px solid rgba(255,255,255,.85);border-radius:30px;background:rgba(255,255,255,.82);padding:30px;text-align:center;box-shadow:0 35px 100px rgba(51,65,85,.24);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)"><div style="margin:0 auto;width:68px;height:68px;border-radius:22px;background:linear-gradient(135deg,#7c3aed,#4338ca);display:grid;place-items:center;color:#fff;font-size:30px;font-weight:950;box-shadow:0 16px 35px rgba(109,40,217,.3)">!</div><p style="margin:22px 0 0;color:#7c3aed;font-size:11px;font-weight:900;letter-spacing:.2em;text-transform:uppercase">Unsupported device</p><h1 id="sbx-mobile-title" style="margin:8px 0 0;font-size:clamp(30px,9vw,42px);line-height:1.05;font-weight:950;letter-spacing:-.035em">StudyBase is not available on mobile</h1><p style="margin:15px auto 0;max-width:360px;color:#64748b;font-size:15px;font-weight:600;line-height:1.7">This version of StudyBase requires a desktop or laptop browser. Please open the site on a supported computer to continue.</p><div style="margin-top:22px;border-radius:16px;background:#f1f5f9;padding:14px;color:#475569;font-size:13px;font-weight:800">Mobile access is currently blocked.</div></section>`;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.appendChild(overlay);
    return true;
  }

  function render() {
    if (showMobileUnsupported()) return;
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
      { name: "Leaderboards Plus", price: "£1.99/month", note: "Leaderboard submissions, verified scores, badges, and stats.", tone: "#ff5b6b", priceTone: "#7c3aed", image: "/assets/images/subscriptions/leaderboards-plus.jpg", terms: ["Leaderboard submissions may be checked for fairness and abuse prevention.", "Verified scores, badges, and stats are account-bound and must not be shared or manipulated.", "Access lasts for the stated monthly period and does not auto-renew."] },
      { name: "Proxy Plus", price: "£3.99/month", note: "Private proxy access with fair-use limits.", tone: "#2563eb", priceTone: "#2563eb", image: "/assets/images/subscriptions/proxy-plus.jpg", terms: ["Proxy Plus is for safer content viewing through StudyBase-approved routes only.", "Fair-use limits, rate limits, and safety checks apply to protect service stability.", "Illegal, unsafe, abusive, or school-policy-evading use may result in account restriction."] },
      { name: "Music Plus", price: "£1.99/month", note: "Music player, playlists, favourites, and a saved library.", tone: "#db2777", priceTone: "#db2777", image: "/assets/images/subscriptions/music-plus.jpg", terms: ["Music Plus unlocks personal listening features such as playlists, favourites, and saved library tools.", "Rights, availability, and playlist features may change depending on content restrictions.", "Access lasts for the stated monthly period and does not auto-renew."] },
      { name: "Chat Plus", price: "£1.49/month", note: "Chat with other users, profile badges, and private rooms.", tone: "#059669", priceTone: "#059669", image: "/assets/images/subscriptions/chat-plus.jpg", terms: ["Chat features are moderated and may be scanned for safety, abuse, and safeguarding risks.", "Private rooms are still subject to reporting, moderation, and account safety rules.", "Misuse, harassment, or unsafe behaviour can remove access without appeal."] },
      { name: "Custom Domain", price: "£30/year", note: "One included domain from approved low-cost TLDs.", tone: "#d97706", priceTone: "#d97706", image: "/assets/images/subscriptions/custom-domain.jpg", terms: ["Includes one approved low-cost domain for the stated annual period.", "Domain names must be approved by StudyBase and may be rejected for safety, abuse, or brand reasons.", "Domain provisioning is a digital service and may begin soon after purchase through Sellbase.gg."] },
      { name: "All Access", price: "£6.99/month", note: "Proxy, music, leaderboards, and chat in one plan.", tone: "#7c3aed", priceTone: "#7c3aed", image: "/assets/images/subscriptions/all-access.jpg", featured: true, terms: ["Includes Proxy Plus, Music Plus, Leaderboards Plus, and Chat Plus for the stated monthly period.", "Does not include AI Credit Packs or custom domains unless separately stated.", "All included services remain subject to their individual fair-use, safety, and moderation terms."] },
      { name: "All Access + Domain", price: "£49.99/year", note: "Everything in All Access, plus an included custom domain.", tone: "#4c1d95", priceTone: "#0f172a", image: "/assets/images/subscriptions/all-access-domain.jpg", terms: ["Includes All Access features plus one approved custom domain for the stated annual period.", "AI Credit Packs are not included unless separately purchased.", "Domain approval, fair-use limits, safety checks, and service availability rules still apply."] },
      { name: "AI Credit Pack", price: "£4.99 one-off", note: "200,000 AI credits for sending AI messages. Not included in All Access and does not auto-renew.", tone: "#0891b2", priceTone: "#0891b2", image: "/assets/images/subscriptions/ai-credit-pack.jpg", terms: ["Provides 200,000 one-off AI credits for sending AI messages.", "Credits are consumed based on message length, model, and tool usage.", "Credits do not auto-renew and are not included in All Access."] }
    ];

    function normaliseSubscriptionPrice(value) {
      return String(value || "").replace(/(?:Ãƒâ€š)?Ã‚Â£|Â£/g, "\u00a3");
    }

    function showPurchaseTerms(productName) {
      const product = subscriptionProducts.find(item => item.name === productName) || subscriptionProducts[0];
      document.getElementById("sbx-purchase-terms-modal")?.remove();
      const modal = document.createElement("div");
      modal.id = "sbx-purchase-terms-modal";
      modal.className = "sbx-login-modal is-open";
      const terms = Array.isArray(product.terms) && product.terms.length ? product.terms : ["Purchases are not available yet.", "Future checkout and payment processing will be provided through Sellbase.gg.", "Nothing renews automatically unless stated otherwise."];
      const priceTone = product.priceTone || product.tone;
      modal.innerHTML = `<div role="dialog" aria-modal="true" aria-labelledby="sbx-purchase-terms-title" style="width:min(620px,calc(100vw - 28px));background:#fff;border-radius:26px;padding:clamp(22px,4vw,34px);box-shadow:0 30px 90px rgba(15,23,42,.35);color:#0f172a"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px"><div><span style="display:inline-flex;padding:7px 11px;border-radius:999px;background:#ede9fe;color:#6d28d9;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase">Purchase terms</span><h2 id="sbx-purchase-terms-title" style="margin:13px 0 0;font-size:clamp(25px,4vw,34px);line-height:1.08;font-weight:950">${escapeHtml(product.name)}</h2><p style="margin:8px 0 0;color:${priceTone};font-size:18px;font-weight:950">${escapeHtml(normaliseSubscriptionPrice(product.price))}</p></div><button type="button" data-terms-close aria-label="Close purchase terms" style="flex:0 0 auto;width:42px;height:42px;border:1px solid #e2e8f0;border-radius:14px;background:#fff;color:#475569;font-size:24px;cursor:pointer">&times;</button></div><div style="margin-top:20px;display:grid;gap:10px">${terms.map(term => `<div style="display:flex;gap:10px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;padding:13px;color:#475569;font-size:13px;line-height:1.55"><span style="margin-top:2px;display:grid;width:18px;height:18px;place-items:center;border-radius:999px;background:${priceTone};color:#fff;font-size:11px;font-weight:900;flex:0 0 auto">✓</span><span>${escapeHtml(term)}</span></div>`).join("")}</div><div style="margin-top:18px;border-radius:18px;background:#0f172a;padding:15px;color:#cbd5e1;font-size:12px;line-height:1.55">Future checkout and payment processing will be provided through Sellbase.gg. Purchases are not available yet.</div></div>`;
      document.body.appendChild(modal);
      const close = () => { document.removeEventListener("keydown", onKeydown); modal.remove(); };
      const onKeydown = event => { if (event.key === "Escape") close(); };
      modal.querySelector("[data-terms-close]").onclick = close;
      modal.onclick = event => { if (event.target === modal) close(); };
      document.addEventListener("keydown", onKeydown);
    }

    function subscriptionCard(product) {
      const priceTone = product.priceTone || product.tone;
      return `<article style="position:relative;display:flex;min-height:370px;overflow:hidden;flex-direction:column;border:${product.featured ? "2px solid #8b5cf6" : "1px solid #e2e8f0"};border-radius:22px;background:#fff;box-shadow:0 12px 35px rgba(15,23,42,.07)">${product.featured ? '<span style="position:absolute;right:14px;top:14px;z-index:2;border-radius:999px;background:#7c3aed;padding:5px 9px;color:white;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.08em">Best value</span>' : ""}<div style="position:relative;aspect-ratio:16/9;overflow:hidden;background:linear-gradient(135deg,${product.tone},#0f172a)"><img src="${escapeHtml(product.image)}" alt="" loading="lazy" onerror="this.style.display='none'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></div><div style="display:flex;flex:1;flex-direction:column;padding:19px"><h3 style="margin:0;color:#0f172a;font-size:20px;font-weight:950">${escapeHtml(product.name)}</h3><p style="margin:7px 0 0;color:${priceTone};font-size:18px;font-weight:950">${escapeHtml(normaliseSubscriptionPrice(product.price))}</p><p style="margin:11px 0 18px;color:#64748b;font-size:13px;line-height:1.55">${escapeHtml(product.note)}</p><button type="button" data-purchase-terms="${escapeHtml(product.name)}" style="margin-top:auto;margin-bottom:10px;width:100%;border:0;background:transparent;color:${priceTone};font-size:12px;font-weight:950;cursor:pointer">Purchase Terms</button><button type="button" disabled style="width:100%;border:0;border-radius:12px;padding:11px;background:#e2e8f0;color:#64748b;font-weight:850;cursor:not-allowed">Not available yet</button></div></article>`;
    }

    function showSubscriptions() {
      document.getElementById("sbx-subscriptions-modal")?.remove();
      const modal = document.createElement("div");
      modal.id = "sbx-subscriptions-modal";
      modal.className = "sbx-login-modal is-open";
      modal.innerHTML = `<div role="dialog" aria-modal="true" aria-labelledby="sbx-subscriptions-title" style="width:min(1120px,calc(100vw - 28px));max-height:calc(100vh - 28px);overflow:auto;background:linear-gradient(145deg,#fff,#f5f3ff);border-radius:28px;padding:clamp(22px,4vw,38px);box-shadow:0 30px 90px rgba(15,23,42,.35)"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:20px"><div><span style="display:inline-flex;padding:7px 11px;border-radius:999px;background:#ede9fe;color:#6d28d9;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase">StudyBase Plus preview</span><h2 id="sbx-subscriptions-title" style="margin:13px 0 0;font-size:clamp(28px,4vw,42px);line-height:1.05;color:#0f172a;font-weight:950">Enjoy StudyBase with more features</h2><p style="margin:12px 0 0;max-width:760px;color:#64748b;line-height:1.65">Explore upcoming optional plans and the one-off AI Credit Pack. Purchases are not available yet. Nothing renews automatically: timed access ends after the period shown, while AI credits are consumed when AI messages are sent.</p></div><button type="button" data-subscription-close aria-label="Close subscriptions" style="flex:0 0 auto;width:42px;height:42px;border:1px solid #e2e8f0;border-radius:14px;background:#fff;color:#475569;font-size:24px;cursor:pointer">&times;</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:16px;margin-top:26px">${subscriptionProducts.map(subscriptionCard).join("")}</div><div style="margin-top:20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;border-radius:18px;background:#0f172a;padding:16px 18px;color:#cbd5e1;font-size:12px;line-height:1.55"><span>Future checkout and payment processing will be provided through Sellbase.gg.</span><a href="/legal/tos.html#subscriptions" style="color:#c4b5fd;font-weight:850">Read purchase terms</a></div></div>`;
      document.body.appendChild(modal);
      const close = () => { document.removeEventListener("keydown", onKeydown); modal.remove(); };
      const onKeydown = event => { if (event.key === "Escape") close(); };
      modal.querySelector("[data-subscription-close]").onclick = close;
      modal.querySelectorAll("[data-purchase-terms]").forEach(button => {
        button.onclick = event => {
          event.stopPropagation();
          showPurchaseTerms(button.dataset.purchaseTerms || "");
        };
      });
      modal.onclick = event => { if (event.target === modal) close(); };
      document.addEventListener("keydown", onKeydown);
    }

    window.StudyBaseSubscriptions = { show: showSubscriptions, showTerms: showPurchaseTerms, products: subscriptionProducts.map(product => ({ ...product })) };
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

    function showLoggedOutStatus() {
      showAccountStatus({
        title: "Account logged out",
        message: "Your StudyBase session is no longer valid. Log in again to continue using account features.",
        buttonLabel: "Log in again",
        onButton: () => ensureAccountModal().openPage("/myaccount/login.html", "StudyBase login")
      });
    }

    function showBanStatus(reason) {
      document.getElementById("sbx-ban-status-modal")?.remove();
      const modal = document.createElement("div");
      modal.id = "sbx-ban-status-modal";
      modal.className = "sbx-login-modal is-open";
      const safeReason = escapeHtml(String(reason || "This account has been banned.").slice(0, 500));
      modal.innerHTML = `<div role="dialog" aria-modal="true" aria-labelledby="sbx-ban-title" style="width:min(540px,calc(100vw - 28px));overflow:hidden;border:1px solid #fecaca;border-radius:28px;background:#fff;box-shadow:0 35px 100px rgba(69,10,10,.38)"><div style="position:relative;overflow:hidden;background:linear-gradient(135deg,#450a0a,#991b1b 62%,#dc2626);padding:32px;color:#fff"><div style="position:absolute;right:-45px;top:-55px;width:170px;height:170px;border-radius:999px;background:rgba(255,255,255,.08)"></div><div style="position:relative;width:62px;height:62px;border:1px solid rgba(255,255,255,.22);border-radius:20px;background:rgba(255,255,255,.12);display:grid;place-items:center;font-size:30px;font-weight:950">!</div><p style="position:relative;margin:22px 0 0;color:#fecaca;font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase">StudyBase account enforcement</p><h2 id="sbx-ban-title" style="position:relative;margin:7px 0 0;font-size:34px;line-height:1.05;font-weight:950">Account banned</h2><p style="position:relative;margin:10px 0 0;color:#fee2e2;line-height:1.6">Access to StudyBase services has been disabled for this account.</p></div><div style="padding:27px"><p style="margin:0;color:#64748b;font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase">Reason</p><div style="margin-top:10px;border:1px solid #fecaca;border-radius:16px;background:#fef2f2;padding:17px;color:#7f1d1d;font-weight:800;line-height:1.6;overflow-wrap:anywhere">${safeReason}</div><p style="margin:16px 0 0;color:#64748b;font-size:13px;line-height:1.6">StudyBase does not provide a user ban appeal process. An administrator can remove the ban where appropriate.</p><button type="button" style="margin-top:22px;width:100%;border:0;border-radius:14px;background:#0f172a;padding:13px;color:#fff;font-weight:900;cursor:pointer">Close</button></div></div>`;
      document.body.appendChild(modal);
      const close = () => { document.removeEventListener("keydown", onKeydown); modal.remove(); };
      const onKeydown = event => { if (event.key === "Escape") close(); };
      modal.querySelector("button").onclick = close;
      modal.onclick = event => { if (event.target === modal) close(); };
      document.addEventListener("keydown", onKeydown);
    }

    function showSignupRestrictedStatus(reason) {
      document.getElementById("sbx-signup-restricted-modal")?.remove();
      const modal = document.createElement("div");
      modal.id = "sbx-signup-restricted-modal";
      modal.className = "sbx-login-modal is-open";
      const safeReason = escapeHtml(String(reason || "This email address is not permitted to create a StudyBase account.").slice(0, 500));
      modal.innerHTML = `<div role="dialog" aria-modal="true" aria-labelledby="sbx-signup-restricted-title" style="width:min(540px,calc(100vw - 28px));overflow:hidden;border:1px solid #bae6fd;border-radius:28px;background:#fff;box-shadow:0 35px 100px rgba(12,74,110,.34)"><div style="position:relative;overflow:hidden;background:linear-gradient(135deg,#0c4a6e,#0369a1 58%,#2563eb);padding:32px;color:#fff"><div style="position:absolute;right:-45px;top:-55px;width:170px;height:170px;border-radius:999px;background:rgba(255,255,255,.1)"></div><div style="position:relative;width:62px;height:62px;border:1px solid rgba(255,255,255,.24);border-radius:20px;background:rgba(255,255,255,.13);display:grid;place-items:center;font-size:30px;font-weight:950">!</div><p style="position:relative;margin:22px 0 0;color:#bae6fd;font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase">StudyBase signup access</p><h2 id="sbx-signup-restricted-title" style="position:relative;margin:7px 0 0;font-size:34px;line-height:1.05;font-weight:950">Signup restricted</h2><p style="position:relative;margin:10px 0 0;color:#e0f2fe;line-height:1.6">This email cannot be used to create a StudyBase account.</p></div><div style="padding:27px"><p style="margin:0;color:#64748b;font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase">Reason</p><div style="margin-top:10px;border:1px solid #bae6fd;border-radius:16px;background:#f0f9ff;padding:17px;color:#0c4a6e;font-weight:800;line-height:1.6;overflow-wrap:anywhere">${safeReason}</div><button type="button" style="margin-top:22px;width:100%;border:0;border-radius:14px;background:#0f172a;padding:13px;color:#fff;font-weight:900;cursor:pointer">Close</button></div></div>`;
      document.body.appendChild(modal);
      const close = () => { document.removeEventListener("keydown", onKeydown); modal.remove(); };
      const onKeydown = event => { if (event.key === "Escape") close(); };
      modal.querySelector("button").onclick = close;
      modal.onclick = event => { if (event.target === modal) close(); };
      document.addEventListener("keydown", onKeydown);
    }

    window.addEventListener("message", event => {
      const trustedAuthOrigins = new Set([window.location.origin, "https://auth.platformbase.online"]);
      if (!trustedAuthOrigins.has(event.origin)) return;
      if (event.data?.type === "studybase:session-ended" && event.data.reason === "authentication-required") {
        ensureAccountModal().closeAccountModal?.();
        updateAuthState();
        showLoggedOutStatus();
        return;
      }
      if (event.data?.type === "studybase:login-success") {
        ensureAccountModal().closeAccountModal?.();
        updateAuthState();
        window.dispatchEvent(new CustomEvent("studybase:account-session-updated"));
        showLoginSuccess(event.data.user);
        return;
      }
      if (event.data?.type === "studybase:account-status") {
        ensureAccountModal().closeAccountModal?.();
        if (["deleted", "signedout", "passwordChanged", "ban"].includes(event.data.status)) clearAuthSession();
        updateAuthState();
        if (event.data.status === "loggedin") showAccountStatus({ title: "Account created", message: "Your StudyBase account is ready. Log in to start using it.", buttonLabel: "Log in", onButton: () => ensureAccountModal().openPage(`/myaccount/login.html${event.data.username ? `?username=${encodeURIComponent(event.data.username)}` : ""}`, "StudyBase login") });
        if (event.data.status === "deleted") showAccountStatus({ title: "Account deleted", message: "Your account and related account data have been deleted." });
        if (event.data.status === "signedout") showAccountStatus({ title: "Signed out", message: "You have been securely signed out of StudyBase." });
        if (event.data.status === "passwordChanged") showAccountStatus({ title: "Password changed", message: "Your password was changed and existing sessions were signed out.", buttonLabel: "Log in", onButton: () => ensureAccountModal().openPage(`/myaccount/login.html${event.data.username ? `?username=${encodeURIComponent(event.data.username)}` : ""}`, "StudyBase login") });
        if (event.data.status === "ban") showBanStatus(event.data.reason);
        if (event.data.status === "signupRestricted") showSignupRestrictedStatus(event.data.reason);
      }
    });

    nav.addEventListener("click", (event) => {
      const login = event.target.closest("[data-sbx-login]");
      const account = event.target.closest("[data-sbx-account]");
      const signout = event.target.closest("[data-sbx-signout]");

      if (login) {
        event.preventDefault();
        ensureAccountModal().openPage("/myaccount/login.html", "StudyBase login");
      }

      if (account) {
        event.preventDefault();
        ensureAccountModal().openPage("/myaccount/account.html", "My account");
      }

      if (signout) {
        event.preventDefault();
        const finish = () => { clearAuthSession(); window.location.href = "/?signedout=true"; };
        if (window.StudyBaseServices?.logout) window.StudyBaseServices.logout().finally(finish);
        else fetch("https://api.platformbase.online/api/logout", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: "{}" }).finally(finish);
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
    window.addEventListener("studybase:account-session-cleared", event => {
      updateAuthState();
      if (event.detail?.reason === "authentication-required") showLoggedOutStatus();
    });

    // Handle ?sessionExpired=true (or the configured param name).
    // Opens the standard navbar login modal and cleans the URL parameter.
    function handleSessionExpiredParam() {
      try {
        const configParam =
          (window.SB_CONFIG && window.SB_CONFIG.account && window.SB_CONFIG.account.sessionExpiredParam) ||
          "sessionExpired";

        const params = new URLSearchParams(window.location.search);
        const statusParam = ["loggedin", "deleted", "signedout", "passwordChanged", "ban", "signupRestricted"].find(name => params.get(name) === "true");
        if (statusParam) {
          const username = (params.get("username") || "").trim();
          const reasonFallback = statusParam === "signupRestricted" ? "This email address is not permitted to create a StudyBase account." : "This account has been banned.";
          const reason = (params.get("reason") || reasonFallback).slice(0, 500);
          const url = new URL(window.location.href);
          ["loggedin", "deleted", "signedout", "passwordChanged", "ban", "signupRestricted", "username", "reason"].forEach(name => url.searchParams.delete(name));
          window.history.replaceState({}, "", url.pathname + url.search + url.hash);
          if (window.parent !== window) {
            window.parent.postMessage({ type: "studybase:account-status", status: statusParam, username, reason }, window.location.origin);
            return;
          }
          setTimeout(() => {
            if (statusParam === "loggedin") {
              showAccountStatus({ title: "Account created", message: "Your StudyBase account is ready. Log in to start using it.", buttonLabel: "Log in", onButton: () => ensureAccountModal().openPage(`/myaccount/login.html${username ? `?username=${encodeURIComponent(username)}` : ""}`, "StudyBase login") });
            } else if (statusParam === "deleted") {
              showAccountStatus({ title: "Account deleted", message: "Your account and related account data have been deleted." });
            } else if (statusParam === "signedout") {
              showAccountStatus({ title: "Signed out", message: "You have been securely signed out of StudyBase." });
            } else if (statusParam === "ban") {
              clearAuthSession();
              updateAuthState();
              showBanStatus(reason);
            } else if (statusParam === "signupRestricted") {
              showSignupRestrictedStatus(reason);
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
            showAccountStatus({
              title: "Account created",
              message: "Your StudyBase account is ready. Log in to start using it.",
              buttonLabel: "Log in",
              onButton: () => {
                const loginUrl = `/myaccount/login.html${username ? `?username=${encodeURIComponent(username)}` : ""}`;
                ensureAccountModal().openPage(loginUrl, "StudyBase login");
              }
            });
          }, 80);
          return;
        }
        if (params.get(configParam) === "true") {
          const url = new URL(window.location.href);
          url.searchParams.delete(configParam);
          const cleanUrl = url.pathname + url.search + url.hash;
          window.history.replaceState({}, "", cleanUrl);
          if (window.parent !== window) {
            window.parent.postMessage({ type: "studybase:session-ended", reason: "authentication-required" }, window.location.origin);
            return;
          }
          setTimeout(() => {
            clearAuthSession(); updateAuthState(); showLoggedOutStatus();
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
