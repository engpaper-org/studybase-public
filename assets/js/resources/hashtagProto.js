// access-control.js
(function () {
  window.CurrentScriptVersions = window.CurrentScriptVersions || {};
  window.CurrentScriptVersions['hashtagProto'] = '1.0.0';
  // Configuration
  var REQUIRED_HASH = "#client-preflight";
  var LOGIN_HASH = "#logged-in";
  var SECONDARY_HASH = "#trusted-session";
  var ANIMATION_PAGE = "/myaccount/settings.html?from=login";
  var GRACE_MS = 5000;
  var STORAGE_KEY = "gcsehelpLastPrimaryAccess";

  // User toggles
  var LS_REDIRECT_TOGGLE = "sb_redirectFromHistory";   // default true
  var LS_LOGOUT_TOGGLE = "sb_logoutAfterRedirect";     // default false

  function readBool(key, fallback) {
    try {
      var v = (localStorage.getItem(key) || "").toLowerCase().trim();
      if (v === "true") return true;
      if (v === "false") return false;
    } catch (e) {}
    return fallback;
  }

  function shouldRedirectFromHistory() {
    return readBool(LS_REDIRECT_TOGGLE, true);
  }

  function shouldLogoutAfterRedirect() {
    return readBool(LS_LOGOUT_TOGGLE, false);
  }

  // ---------------------------
  // ROUTES: separate jsons for gcse & alevel
  // mode -> type -> subject -> url
  // ---------------------------
  var ROUTES = {
    gcse: {
      specification: {
        maths: "/study_pages/e/gcse/specification/maths.pdf",
        english: "/study_pages/e/gcse/specification/english.pdf",
        biology: "/study_pages/e/gcse/specification/biology.pdf",
        chemistry: "/study_pages/e/gcse/specification/chemistry.pdf",
        physics: "/study_pages/e/gcse/specification/physics.pdf",
        geography: "/study_pages/e/gcse/specification/geography.pdf",
        computer_science: "/study_pages/e/gcse/specification/computer_science.pdf",
        history: "/study_pages/e/gcse/specification/history.pdf",
      },
      subject_overview: {
        maths: "/study_pages/e/gcse/subject_overview.html?subject=maths",
        english: "/study_pages/e/gcse/subject_overview.html?subject=english",
        biology: "/study_pages/e/gcse/subject_overview.html?subject=biology",
        chemistry: "/study_pages/e/gcse/subject_overview.html?subject=chemistry",
        physics: "/study_pages/e/gcse/subject_overview.html?subject=physics",
        geography: "/study_pages/e/gcse/subject_overview.html?subject=geography",
        computer_science: "/study_pages/e/gcse/subject_overview.html?subject=computer_science",
        history: "/study_pages/e/gcse/subject_overview.html?subject=history",
      },
      past_paper: {
        maths: "/study_pages/e/gcse/past_paper/maths.pdf",
        english: "/study_pages/e/gcse/past_paper/english.pdf",
        biology: "/study_pages/e/gcse/past_paper/biology.pdf",
        chemistry: "/study_pages/e/gcse/past_paper/chemistry.pdf",
        physics: "/study_pages/e/gcse/past_paper/physics.pdf",
        geography: "/study_pages/e/gcse/past_paper/geography.pdf",
        computer_science: "/study_pages/e/gcse/past_paper/computer_science.pdf",
        history: "/study_pages/e/gcse/past_paper/history.pdf",
      },
    },
    alevel: {
      specification: {
        maths: "/study_pages/e/alevel/specification/maths.pdf",
        english: "/study_pages/e/alevel/specification/english.pdf",
        biology: "/study_pages/e/alevel/specification/biology.pdf",
        chemistry: "/study_pages/e/alevel/specification/chemistry.pdf",
        physics: "/study_pages/e/alevel/specification/physics.pdf",
        geography: "/study_pages/e/alevel/specification/geography.pdf",
        computer_science: "/study_pages/e/alevel/specification/computer_science.pdf",
        history: "/study_pages/e/alevel/specification/history.pdf",
      },
      subject_overview: {
        maths: "/study_pages/e/alevel/subject_overview.html?subject=maths",
        english: "/study_pages/e/alevel/subject_overview.html?subject=english",
        biology: "/study_pages/e/alevel/subject_overview.html?subject=biology",
        chemistry: "/study_pages/e/alevel/subject_overview.html?subject=chemistry",
        physics: "/study_pages/e/alevel/subject_overview.html?subject=physics",
        geography: "/study_pages/e/alevel/subject_overview.html?subject=geography",
        computer_science: "/study_pages/e/alevel/subject_overview.html?subject=computer_science",
        history: "/study_pages/e/alevel/subject_overview.html?subject=history",
      },
      past_paper: {
        maths: "/study_pages/e/alevel/past_paper/maths.pdf",
        english: "/study_pages/e/alevel/past_paper/english.pdf",
        biology: "/study_pages/e/alevel/past_paper/biology.pdf",
        chemistry: "/study_pages/e/alevel/past_paper/chemistry.pdf",
        physics: "/study_pages/e/alevel/past_paper/physics.pdf",
        geography: "/study_pages/e/alevel/past_paper/geography.pdf",
        computer_science: "/study_pages/e/alevel/past_paper/computer_science.pdf",
        history: "/study_pages/e/alevel/past_paper/history.pdf",
      },
    },
  };

  // Only clears auth keys (logout). Does NOT touch grace timer.
  function clearAuthData() {
    try {
      [
        "studybase_session_active",
        "studybase_session_expiry",
        "studybase_user",
        "get_help_data"
      ].forEach(function (key) {
        localStorage.removeItem(key);
      });
    } catch (e) {}
  }

  // Clears grace (used when we actually redirect)
  function clearGrace() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function isProbablyUrl(value) {
    if (!value) return false;
    var v = String(value).trim();
    if (v.startsWith("/")) return true; // root-relative
    try {
      var u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  function normKey(v) {
    return String(v || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
  }

  function getModeFromPath() {
    var path = (window.location.pathname || "").toLowerCase();
    if (path.includes("alevel")) return "alevel";
    if (path.includes("gcse")) return "gcse";
    return null;
  }

  function handleRedirect() {
    let type = "";
    let subject = "";
    try {
      type = (localStorage.getItem("type") || "").toString();
      subject = (localStorage.getItem("subject") || "").toString();
    } catch (e) {}

    // 1) If type is a URL, clear and go there
    if (isProbablyUrl(type)) {
      var target = type.trim().startsWith("/")
        ? type.trim()
        : new URL(type.trim()).toString();

      if (shouldLogoutAfterRedirect()) clearAuthData();
      clearGrace();
      window.location.href = target;
      return;
    }

    // 2) Route map lookup using mode derived from path
    var mode = getModeFromPath();
    var tKey = normKey(type);
    var sKey = normKey(subject);

    if (mode && tKey && sKey) {
      var target = ROUTES?.[mode]?.[tKey]?.[sKey];
      if (target && isProbablyUrl(target)) {
        if (shouldLogoutAfterRedirect()) clearAuthData();
        clearGrace();
        window.location.href = target;
        return;
      }
    }

    // 3) Fallback
    var path = (window.location.pathname || "").toLowerCase();
    if (shouldLogoutAfterRedirect()) clearAuthData();
    clearGrace();

    if (path.includes("alevel")) window.location.href = "/alevel/index.html";
    else if (path.includes("gcse")) window.location.href = "/gcse/index.html";
    else window.location.href = "/index.html";
  }

  function grantAccess() {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (e) {
      console.error("Storage access failed", e);
    }
  }

  function swapHashToSecondary() {
    try {
      var url = new URL(window.location.href);
      url.hash = SECONDARY_HASH;
      history.replaceState(null, "", url.toString());
    } catch (e) {
      window.location.hash = SECONDARY_HASH;
    }
  }

  function playWelcomeAnimation() {
    var onReady = () => {
      var iframe = document.createElement("iframe");
      iframe.src = ANIMATION_PAGE;
      iframe.style.position = "fixed";
      iframe.style.top = "0";
      iframe.style.left = "0";
      iframe.style.width = "100vw";
      iframe.style.height = "100vh";
      iframe.style.border = "none";
      iframe.style.zIndex = "999999";
      iframe.style.backgroundColor = "white";
      iframe.id = "gcse-welcome-frame";

      document.body.appendChild(iframe);

      var messageHandler = (event) => {
        if (event.data === "animation_complete") {
          iframe.style.transition = "opacity 0.5s ease";
          iframe.style.opacity = "0";
          setTimeout(() => iframe.parentNode && iframe.parentNode.removeChild(iframe), 500);
          window.removeEventListener("message", messageHandler);
        }
      };

      window.addEventListener("message", messageHandler);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onReady);
    } else {
      onReady();
    }
  }

  // --- MAIN LOGIC ---
  var now = Date.now();
  var currentHash = window.location.hash;

  // Login success
  if (currentHash === LOGIN_HASH) {
    grantAccess();
    swapHashToSecondary();
    playWelcomeAnimation();
    return;
  }

  // Primary access
  if (currentHash === REQUIRED_HASH) {
    grantAccess();
    swapHashToSecondary();
    return;
  }

  // No primary tag path:
  // If logout-after-redirect is enabled, log out immediately.
  if (shouldLogoutAfterRedirect()) {
    clearAuthData();
  }

  let lastSeen = null;
  try {
    var stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) lastSeen = parseInt(stored, 10);
  } catch (e) {}

  if (!lastSeen || isNaN(lastSeen) || now - lastSeen > GRACE_MS) {
    // Redirect behaviour controlled by toggle
    if (!shouldRedirectFromHistory()) {
      // Do nothing: allow the page to stay open
      return;
    }
    handleRedirect();
  }
})();
