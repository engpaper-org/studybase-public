(function () {
  if (window.StudybaseEndpointPopup) return;

  const POPUP_ID = "sb-endpoint-error-popup";
  const TOAST_ID = "sb-endpoint-error-toast";
  const STYLE_ID = "sb-endpoint-error-popup-style";
  const MAINTENANCE_CODE = "MAINTENANCE_MODE";
  const DEFAULT_HOSTS = ["api.studybase.site", "api.revisionbase.site"];
  const monitoredHosts = new Set(DEFAULT_HOSTS);
  const originalFetch = window.fetch ? window.fetch.bind(window) : null;

  if (!originalFetch) return;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#" + TOAST_ID + "{position:fixed;right:20px;bottom:20px;z-index:2147483647;display:none;width:min(420px,calc(100vw - 24px));font-family:Arial,sans-serif;}",
      "#" + TOAST_ID + ".is-open{display:block;}",
      "#" + TOAST_ID + " .sb-endpoint-toast-card{background:linear-gradient(180deg,#0f172a 0%,#111827 100%);color:#fff;border:1px solid rgba(148,163,184,.28);border-radius:20px;box-shadow:0 24px 60px rgba(15,23,42,.45);padding:16px 18px;}",
      "#" + TOAST_ID + " .sb-endpoint-toast-top{display:flex;align-items:flex-start;gap:12px;}",
      "#" + TOAST_ID + " .sb-endpoint-toast-icon{width:38px;height:38px;flex:0 0 auto;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(239,68,68,.18);font-size:18px;}",
      "#" + TOAST_ID + " .sb-endpoint-toast-title{margin:0;font-size:15px;font-weight:700;line-height:1.35;}",
      "#" + TOAST_ID + " .sb-endpoint-toast-copy{margin:4px 0 0;color:rgba(255,255,255,.72);font-size:13px;line-height:1.45;}",
      "#" + TOAST_ID + " .sb-endpoint-toast-code{display:inline-flex;align-items:center;margin-top:10px;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.08);color:#f8fafc;font-size:12px;font-weight:700;letter-spacing:.04em;}",
      "#" + TOAST_ID + " .sb-endpoint-toast-actions{display:flex;gap:10px;margin-top:14px;}",
      "#" + TOAST_ID + " .sb-endpoint-toast-btn{appearance:none;border:none;cursor:pointer;border-radius:12px;padding:10px 14px;font-size:13px;font-weight:700;}",
      "#" + TOAST_ID + " .sb-endpoint-toast-btn-primary{background:#fff;color:#0f172a;}",
      "#" + TOAST_ID + " .sb-endpoint-toast-btn-secondary{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.12);}",
      "#" + TOAST_ID + " .sb-endpoint-toast-card.is-maintenance{background:linear-gradient(180deg,#0f172a 0%,#172033 100%);border-color:rgba(96,165,250,.34);box-shadow:0 18px 46px rgba(2,6,23,.38);}",
      "#" + TOAST_ID + " .sb-endpoint-toast-card.is-maintenance .sb-endpoint-toast-icon{background:rgba(96,165,250,.18);color:#bfdbfe;}",
      "#" + TOAST_ID + " .sb-endpoint-toast-card.is-maintenance .sb-endpoint-toast-code{background:rgba(96,165,250,.14);color:#dbeafe;}",
      "#" + POPUP_ID + "{position:fixed;inset:0;z-index:2147483646;display:none;align-items:flex-start;justify-content:center;padding:20px;background:rgba(2,6,23,.72);backdrop-filter:blur(10px);font-family:Arial,sans-serif;overflow:auto;}",
      "#" + POPUP_ID + ".is-open{display:flex;}",
      "#" + POPUP_ID + " .sb-endpoint-card{width:min(720px,100%);max-height:min(88vh,900px);margin:auto 0;overflow:auto;background:linear-gradient(180deg,#fff 0%,#f8fafc 100%);border:1px solid rgba(148,163,184,.35);border-radius:24px;box-shadow:0 30px 80px rgba(15,23,42,.35);color:#0f172a;}",
      "#" + POPUP_ID + " .sb-endpoint-inner{padding:24px;}",
      "#" + POPUP_ID + " .sb-endpoint-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:#fee2e2;color:#b91c1c;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}",
      "#" + POPUP_ID + " h2{margin:16px 0 10px;font-size:29px;line-height:1.1;}",
      "#" + POPUP_ID + " p{margin:0;color:#475569;font-size:15px;line-height:1.65;}",
      "#" + POPUP_ID + " .sb-endpoint-grid{display:grid;gap:14px;margin-top:20px;}",
      "#" + POPUP_ID + " .sb-endpoint-panel{padding:14px 16px;border-radius:16px;background:#fff;border:1px solid #e2e8f0;}",
      "#" + POPUP_ID + " .sb-endpoint-label{margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748b;}",
      "#" + POPUP_ID + " .sb-endpoint-value{margin:0;font-size:14px;line-height:1.55;color:#0f172a;word-break:break-word;}",
      "#" + POPUP_ID + " pre.sb-endpoint-value{white-space:pre-wrap;font-family:Consolas,'Courier New',monospace;max-height:240px;overflow:auto;}",
      "#" + POPUP_ID + " .sb-endpoint-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px;}",
      "#" + POPUP_ID + " button{appearance:none;border:none;cursor:pointer;border-radius:14px;padding:12px 16px;font-size:14px;font-weight:700;}",
      "#" + POPUP_ID + " .sb-endpoint-primary{background:#0f172a;color:#fff;}",
      "#" + POPUP_ID + " .sb-endpoint-secondary{background:#fff;color:#334155;border:1px solid #cbd5e1;}",
      "@media (max-width: 640px){#" + TOAST_ID + "{right:12px;bottom:12px;width:calc(100vw - 24px);}#" + POPUP_ID + " .sb-endpoint-inner{padding:18px;}#" + POPUP_ID + " h2{font-size:24px;}}"
    ].join("");
    document.head.appendChild(style);
  }

  function ensureToast() {
    ensureStyles();

    let toast = document.getElementById(TOAST_ID);
    if (toast) return toast;

    toast = document.createElement("div");
    toast.id = TOAST_ID;
    toast.innerHTML = [
      '<div class="sb-endpoint-toast-card" role="status" aria-live="polite">',
      '  <div class="sb-endpoint-toast-top">',
      '    <div class="sb-endpoint-toast-icon" aria-hidden="true">!</div>',
      "    <div>",
      '      <p class="sb-endpoint-toast-title" data-field="toast-title">An unexpected endpoint error occurred</p>',
      '      <p class="sb-endpoint-toast-copy" data-field="toast-copy">Click for more details.</p>',
      '      <div class="sb-endpoint-toast-code" data-field="toast-code">Code: Unknown</div>',
      "    </div>",
      "  </div>",
      '  <div class="sb-endpoint-toast-actions" data-field="toast-actions">',
      '    <button type="button" class="sb-endpoint-toast-btn sb-endpoint-toast-btn-primary" data-action="details">More details</button>',
      '    <button type="button" class="sb-endpoint-toast-btn sb-endpoint-toast-btn-secondary" data-action="dismiss-toast">Dismiss</button>',
      "  </div>",
      "</div>"
    ].join("");

    toast.addEventListener("click", function (event) {
      if (event.target === toast) return;
      const action = event.target && event.target.getAttribute ? event.target.getAttribute("data-action") : null;
      if (action === "dismiss-toast") {
        closeToast();
        return;
      }
      if (toast.dataset.kind === "maintenance") {
        return;
      }
      if (action === "details") {
        openDetailsFromToast();
        return;
      }
      openDetailsFromToast();
    });

    document.body.appendChild(toast);
    return toast;
  }

  function ensurePopup() {
    ensureStyles();

    let host = document.getElementById(POPUP_ID);
    if (host) return host;

    host = document.createElement("div");
    host.id = POPUP_ID;
    host.innerHTML = [
      '<div class="sb-endpoint-card" role="alertdialog" aria-modal="true" aria-labelledby="sb-endpoint-title">',
      '  <div class="sb-endpoint-inner">',
      '    <div class="sb-endpoint-badge">Endpoint warning</div>',
      '    <h2 id="sb-endpoint-title">A problem occurred with the Studybase endpoint</h2>',
      '    <p id="sb-endpoint-summary">A request to the Studybase API failed.</p>',
      '    <div class="sb-endpoint-grid">',
      '      <div class="sb-endpoint-panel">',
      '        <p class="sb-endpoint-label">Error code</p>',
      '        <p class="sb-endpoint-value" data-field="code">Unknown</p>',
      "      </div>",
      '      <div class="sb-endpoint-panel">',
      '        <p class="sb-endpoint-label">Endpoint</p>',
      '        <p class="sb-endpoint-value" data-field="endpoint">Unknown</p>',
      "      </div>",
      '      <div class="sb-endpoint-panel">',
      '        <p class="sb-endpoint-label">Details</p>',
      '        <pre class="sb-endpoint-value" data-field="details">No extra details were returned.</pre>',
      "      </div>",
      "    </div>",
      '    <div class="sb-endpoint-actions">',
      '      <button type="button" class="sb-endpoint-primary" data-action="dismiss">Close</button>',
      '      <button type="button" class="sb-endpoint-secondary" data-action="reload">Reload page</button>',
      "    </div>",
      "  </div>",
      "</div>"
    ].join("");

    host.addEventListener("click", function (event) {
      if (event.target === host) closePopup();
    });

    host.querySelector('[data-action="dismiss"]').addEventListener("click", closePopup);
    host.querySelector('[data-action="reload"]').addEventListener("click", function () {
      closePopup();
      window.location.reload();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closePopup();
    });

    document.body.appendChild(host);
    return host;
  }

  function closePopup() {
    const popup = document.getElementById(POPUP_ID);
    if (!popup) return;
    popup.classList.remove("is-open");
  }

  function closeToast() {
    const toast = document.getElementById(TOAST_ID);
    if (!toast) return;
    toast.classList.remove("is-open");
    toast.dataset.kind = "";
    if (window.StudybaseEndpointPopup) {
      window.StudybaseEndpointPopup.activeSignature = null;
    }
  }

  function openDetailsFromToast() {
    if (!window.StudybaseEndpointPopup || !window.StudybaseEndpointPopup.lastError) return;
    const payload = window.StudybaseEndpointPopup.lastError;
    const popup = ensurePopup();
    popup.querySelector('[data-field="code"]').textContent = payload.code || "Unknown";
    popup.querySelector('[data-field="endpoint"]').textContent = payload.endpoint || "Unknown";
    popup.querySelector('[data-field="details"]').textContent =
      payload.details || "No extra details were returned.";
    popup.querySelector("#sb-endpoint-summary").textContent =
      payload.summary || "A request to the Studybase API failed.";
    popup.classList.add("is-open");
  }

  function openPopup(payload) {
    const signature = [payload.code, payload.endpoint, payload.details].join("|");
    if (window.StudybaseEndpointPopup && window.StudybaseEndpointPopup.activeSignature === signature) {
      return;
    }
    window.StudybaseEndpointPopup.lastError = payload;
    window.StudybaseEndpointPopup.activeSignature = signature;

    const render = function () {
      const toast = ensureToast();
      toast.dataset.kind = "endpoint";
      toast.querySelector(".sb-endpoint-toast-card")?.classList.remove("is-maintenance");
      toast.querySelector(".sb-endpoint-toast-icon").textContent = "!";
      toast.querySelector('[data-field="toast-title"]').textContent =
        "An unexpected endpoint error occurred";
      toast.querySelector('[data-field="toast-copy"]').textContent = "Click for more details.";
      toast.querySelector('[data-field="toast-code"]').textContent =
        "Code: " + (payload.code || "Unknown");
      toast.querySelector('[data-field="toast-actions"]').innerHTML = [
        '<button type="button" class="sb-endpoint-toast-btn sb-endpoint-toast-btn-primary" data-action="details">More details</button>',
        '<button type="button" class="sb-endpoint-toast-btn sb-endpoint-toast-btn-secondary" data-action="dismiss-toast">Dismiss</button>'
      ].join("");
      toast.classList.add("is-open");
    };

    if (document.readyState === "loading" || !document.body) {
      document.addEventListener("DOMContentLoaded", render, { once: true });
    } else {
      render();
    }
  }

  function openMaintenanceToast(payload, endpoint) {
    const message =
      payload && typeof payload.message === "string" && payload.message.trim()
        ? payload.message.trim()
        : "Service is offline between 11:02pm and 4:00am.";
    const signature = [MAINTENANCE_CODE, endpoint, message].join("|");

    if (window.StudybaseEndpointPopup && window.StudybaseEndpointPopup.activeSignature === signature) {
      return;
    }

    if (window.StudybaseEndpointPopup) {
      window.StudybaseEndpointPopup.lastError = null;
      window.StudybaseEndpointPopup.activeSignature = signature;
    }

    const render = function () {
      const toast = ensureToast();
      toast.dataset.kind = "maintenance";
      toast.querySelector(".sb-endpoint-toast-card")?.classList.add("is-maintenance");
      toast.querySelector(".sb-endpoint-toast-icon").textContent = "i";
      toast.querySelector('[data-field="toast-title"]').textContent =
        "StudyBase is in maintenance mode";
      toast.querySelector('[data-field="toast-copy"]').textContent =
        "Overnight updates are running. " + message;
      toast.querySelector('[data-field="toast-code"]').textContent = "Maintenance mode";
      toast.querySelector('[data-field="toast-actions"]').innerHTML =
        '<button type="button" class="sb-endpoint-toast-btn sb-endpoint-toast-btn-secondary" data-action="dismiss-toast">Dismiss</button>';
      toast.classList.add("is-open");
    };

    if (document.readyState === "loading" || !document.body) {
      document.addEventListener("DOMContentLoaded", render, { once: true });
    } else {
      render();
    }
  }

  function addMonitoredHost(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return;

    try {
      const parsed = new URL(rawUrl, window.location.origin);
      if (parsed.hostname) monitoredHosts.add(parsed.hostname);
    } catch (error) {
      console.warn("Unable to monitor endpoint host:", rawUrl, error);
    }
  }

  function configure(config) {
    const endpoints = config && config.endpoints ? config.endpoints : null;
    if (!endpoints) return;

    Object.keys(endpoints).forEach(function (key) {
      const value = endpoints[key];
      if (typeof value !== "string") return;
      if (!/^https?:\/\//i.test(value)) return;
      if (!/api/i.test(value)) return;
      addMonitoredHost(value);
    });
  }

  function shouldInspect(input) {
    try {
      const requestUrl =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";

      if (!requestUrl) return false;

      const parsed = new URL(requestUrl, window.location.origin);
      return monitoredHosts.has(parsed.hostname);
    } catch (error) {
      return false;
    }
  }

  function normaliseDetails(raw) {
    if (!raw) return "";
    const text = String(raw).trim();
    if (!text) return "";
    return text.length > 1500 ? text.slice(0, 1500) + "..." : text;
  }

  async function getResponseDetails(response) {
    try {
      const clone = response.clone();
      const contentType = clone.headers.get("content-type") || "";

      if (contentType.indexOf("application/json") !== -1) {
        const json = await clone.json();
        return normaliseDetails(JSON.stringify(json, null, 2));
      }

      return normaliseDetails(await clone.text());
    } catch (error) {
      return "";
    }
  }

  async function shouldIgnoreStateShutdownResponse(input, response) {
    try {
      const requestUrl =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";

      const parsed = new URL(requestUrl, window.location.origin);
      if (parsed.hostname !== "api.studybase.site" && parsed.hostname !== "api.revisionbase.site") {
        return false;
      }

      if (parsed.pathname !== "/state") return false;
      if (!response.ok) return false;

      const payload = await response.clone().json();
      return Boolean(
        payload &&
        payload.ok === true &&
        payload.shutdown === true &&
        payload.reason === "protoThree"
      );
    } catch (error) {
      return false;
    }
  }

  async function getStateMaintenancePayload(input, response) {
    try {
      const requestUrl =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";

      const parsed = new URL(requestUrl, window.location.origin);
      if (parsed.hostname !== "api.studybase.site" && parsed.hostname !== "api.revisionbase.site") {
        return null;
      }

      if (parsed.pathname !== "/state") return null;

      const payload = await response.clone().json();
      if (payload && payload.ok === false && payload.error === MAINTENANCE_CODE) {
        return payload;
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  function shouldIgnoreEndpoint(input) {
    try {
      const requestUrl =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";

      const parsed = new URL(requestUrl, window.location.origin);
      if (parsed.pathname === "/auth/check") return true;
      return false;
    } catch (error) {
      return false;
    }
  }

  function buildEndpointLabel(input) {
    try {
      const requestUrl =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";

      const parsed = new URL(requestUrl, window.location.origin);
      return parsed.href;
    } catch (error) {
      return String(input && input.url ? input.url : input || "Unknown");
    }
  }

  window.fetch = async function (input, init) {
    if (!shouldInspect(input)) {
      return originalFetch(input, init);
    }

    if (shouldIgnoreEndpoint(input)) {
      return originalFetch(input, init);
    }

    try {
      const response = await originalFetch(input, init);

      const maintenancePayload = await getStateMaintenancePayload(input, response);
      if (maintenancePayload) {
        openMaintenanceToast(maintenancePayload, buildEndpointLabel(input));
        return response;
      }

      if (await shouldIgnoreStateShutdownResponse(input, response)) {
        return response;
      }

      if (!response.ok) {
        const details = await getResponseDetails(response);
        openPopup({
          code: String(response.status),
          endpoint: buildEndpointLabel(input),
          details: details || response.statusText || "The endpoint returned an error response."
        });
      }

      return response;
    } catch (error) {
      openPopup({
        code: error && error.name ? error.name : "NETWORK_ERROR",
        endpoint: buildEndpointLabel(input),
        details: normaliseDetails(error && error.message ? error.message : String(error)),
        summary:
          "The request could not reach the Studybase endpoint successfully. This usually means a network failure, a blocked request, or the endpoint being unavailable."
      });
      throw error;
    }
  };

  window.addEventListener("site-config-ready", function (event) {
    configure(event.detail || {});
  });

  if (window.SB_CONFIG) {
    configure(window.SB_CONFIG);
  }

  window.StudybaseEndpointPopup = {
    configure: configure,
    open: openPopup,
    showMaintenance: openMaintenanceToast,
    close: closePopup,
    closeToast: closeToast,
    showDetails: openDetailsFromToast,
    lastError: null,
    activeSignature: null
  };
})();
