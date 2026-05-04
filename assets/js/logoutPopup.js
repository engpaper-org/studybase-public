(function () {
  console.log("[Logout popup] Script loaded");

  function hasLogoutParam() {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("logout");

    console.log("[Logout popup] Current URL:", window.location.href);
    console.log("[Logout popup] logout param value:", value);

    return value === "true";
  }

  function removeLogoutParamFromUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("logout");

    const newUrl = url.pathname + url.search + url.hash;
    window.history.replaceState({}, "", newUrl);

    console.log("[Logout popup] Removed logout=true from URL");
  }

  function showLogoutSuccessPopup() {
    console.log("[Logout popup] Attempting to show popup");

    if (document.getElementById("gh-logout-overlay")) {
      console.warn("[Logout popup] Popup already exists, not creating another one");
      return;
    }

    if (!document.body) {
      console.error("[Logout popup] document.body does not exist yet");
      return;
    }

    const overlay = document.createElement("div");
    overlay.id = "gh-logout-overlay";

    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "999999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "16px";
    overlay.style.background = "rgba(15, 23, 42, 0.45)";
    overlay.style.backdropFilter = "blur(6px)";

    overlay.innerHTML = `
      <div style="
        width: 100%;
        max-width: 420px;
        background: white;
        border-radius: 24px;
        box-shadow: 0 25px 80px rgba(15, 23, 42, 0.25);
        border: 1px solid rgba(226, 232, 240, 1);
        overflow: hidden;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">
        <div style="padding: 22px;">
          <div style="display: flex; gap: 14px; align-items: flex-start;">
            <div style="
              width: 42px;
              height: 42px;
              min-width: 42px;
              border-radius: 14px;
              background: #ecfdf5;
              color: #059669;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <div style="flex: 1;">
              <h3 style="
                margin: 0;
                color: #0f172a;
                font-size: 18px;
                line-height: 1.25;
                font-weight: 900;
              ">
                Successfully logged out
              </h3>

              <p style="
                margin: 6px 0 0;
                color: #64748b;
                font-size: 14px;
                line-height: 1.6;
              ">
                You have been logged out safely.
              </p>
            </div>
          </div>

          <div style="
            margin-top: 22px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          ">
            <button id="gh-logout-close" style="
              border: 0;
              cursor: pointer;
              border-radius: 14px;
              padding: 13px 16px;
              background: #f1f5f9;
              color: #1e293b;
              font-weight: 800;
              font-size: 14px;
            ">
              Close
            </button>

            <button id="gh-logout-login" style="
              border: 0;
              cursor: pointer;
              border-radius: 14px;
              padding: 13px 16px;
              background: #0f172a;
              color: white;
              font-weight: 800;
              font-size: 14px;
            ">
              Login again
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    console.log("[Logout popup] Popup added to page");

    const closeBtn = document.getElementById("gh-logout-close");
    const loginBtn = document.getElementById("gh-logout-login");

    if (!closeBtn) {
      console.error("[Logout popup] Close button was not found");
    }

    if (!loginBtn) {
      console.error("[Logout popup] Login again button was not found");
    }

    closeBtn?.addEventListener("click", function () {
      console.log("[Logout popup] Close clicked");

      overlay.remove();
      removeLogoutParamFromUrl();
    });

    loginBtn?.addEventListener("click", function () {
      console.log("[Logout popup] Login again clicked, redirecting");

      window.location.href = "/index.html?sessionExpired=true";
    });
  }

  function initLogoutPopup() {
    console.log("[Logout popup] Init running");
    console.log("[Logout popup] document.readyState:", document.readyState);

    if (!hasLogoutParam()) {
      console.log("[Logout popup] logout=true not found, popup will not show");
      return;
    }

    console.log("[Logout popup] logout=true found");

    showLogoutSuccessPopup();
  }

  if (document.readyState === "loading") {
    console.log("[Logout popup] Waiting for DOMContentLoaded");

    document.addEventListener("DOMContentLoaded", initLogoutPopup);
  } else {
    initLogoutPopup();
  }
})();