(function () {
  const navGroups = [
    {
      label: "Resource Database",
      href: "/r/index.html#client-preflight",
      featured: true,
      links: [
        ["Open database", "/r/index.html#client-preflight"],
        ["Subjects", "/subjects/index.html"],
        ["Revision guides", "/blogs/index.html"]
      ]
    },
    {
      label: "Papers",
      href: "/past_papers/index.html",
      links: [
        ["Past paper finder", "/past_papers/index.html"],
        ["Paper tracker", "/paper-tracker.html"],
        ["Mistake log", "/mistake-log.html"]
      ]
    },
    {
      label: "Study Tools",
      href: "/study-tools.html",
      links: [
        ["Study tools home", "/study-tools.html"],
        ["Exam planner", "/exam-planner.html"],
        ["Focus timer", "/focus-timer.html"],
        ["Recall builder", "/recall-builder.html"],
        ["Revision checklist", "/revision-checklist.html"]
      ]
    },
    {
      label: "Support",
      href: "/support/help_center.html",
      links: [
        ["Help centre", "/support/help_center.html"],
        ["FAQ", "/faq.html"],
        ["Contact", "/contact.html"],
        ["Report issue", "/report.html"]
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

    return Boolean(
      readAuthKey("studybase_username", "gh_username") &&
      readAuthKey("studybase_password", "gh_password") &&
      readAuthKey("studybase_device", "gh_device")
    );
  }

  function clearAuthSession() {
    try {
      if (window.StudyBaseServices?.clearAccountSession) {
        window.StudyBaseServices.clearAccountSession();
      }
    } catch (_) {}

    [
      "studybase_username",
      "studybase_password",
      "studybase_device",
      "studybase_device_b64",
      "studybase_session_expiry",
      "studybase_session_expiry_set_at",
      "gh_username",
      "gh_password",
      "gh_device",
      "gh_device_b64",
      "gh_session_expiry",
      "gh_session_expiry_set_at"
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

    return `
      <div class="sbx-nav-auth" data-sbx-auth>
        <a class="sbx-nav-access" href="/myaccount/login.html" data-sbx-login>Login</a>
      </div>
    `;
  }

  function render() {
    if (document.getElementById("sbx-navbar")) return;

    const currentPath = normalPath(window.location.pathname);
    const isResourceDatabasePage = currentPath === "/r/index.html" || currentPath === "/r";
    const nav = document.createElement("header");
    nav.id = "sbx-navbar";
    nav.className = `sbx-navbar ${isResourceDatabasePage ? "is-resource-database" : ""}`;
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
          <a class="sbx-nav-link ${isActive("/alevel.html") ? "is-active" : ""}" href="/alevel.html">A-Level Route</a>
          ${navGroups.map(groupMarkup).join("")}
        </nav>
        ${authMarkup()}
        <button class="sbx-nav-toggle" type="button" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
      <nav class="sbx-mobile-menu" aria-label="Mobile navigation" hidden>
        <a class="sbx-mobile-link" href="/alevel.html">A-Level Route</a>
        ${mobileMarkup()}
        ${authMarkup()}
      </nav>
    `;

    document.body.insertAdjacentElement("afterbegin", nav);

    function updateAuthState() {
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

      return modal;
    }

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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
