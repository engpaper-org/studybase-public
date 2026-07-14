(function () {
  "use strict";

  function isUnsupportedMobile() {
    if (navigator.userAgentData?.mobile === true) return true;
    const userAgent = String(navigator.userAgent || "");
    if (/Android|iPhone|iPod|IEMobile|Windows Phone|Opera Mini|Mobile/i.test(userAgent)) return true;
    if (/Macintosh/i.test(userAgent) && Number(navigator.maxTouchPoints || 0) > 1) return true;
    const shortestScreenSide = Math.min(Number(screen.width || 0), Number(screen.height || 0));
    return Number(navigator.maxTouchPoints || 0) > 0 && shortestScreenSide > 0 && shortestScreenSide < 600;
  }

  function blockMobile() {
    if (!isUnsupportedMobile() || document.getElementById("sbx-mobile-unsupported")) return;
    const overlay = document.createElement("div");
    overlay.id = "sbx-mobile-unsupported";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "sbx-mobile-title");
    overlay.tabIndex = -1;
    overlay.style.cssText = "position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;overflow:auto;padding:24px;background:linear-gradient(145deg,#eef2ff,#f8fafc 52%,#ecfeff);font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#0f172a";
    overlay.innerHTML = `<section style="width:min(100%,460px);border:1px solid #cbd5e1;border-radius:28px;background:#fff;padding:30px;text-align:center;box-shadow:0 30px 90px rgba(15,23,42,.2)"><div aria-hidden="true" style="margin:auto;display:grid;width:64px;height:64px;place-items:center;border-radius:20px;background:#4f46e5;color:#fff;font-size:28px;font-weight:950">!</div><p style="margin:20px 0 0;color:#4f46e5;font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase">Unsupported device</p><h1 id="sbx-mobile-title" style="margin:8px 0 0;font-size:36px;line-height:1.05;letter-spacing:-.035em">StudyBase is not available on mobile</h1><p style="margin:15px auto 0;max-width:360px;color:#64748b;font-size:15px;font-weight:600;line-height:1.65">Open StudyBase on a Chromebook, laptop, or desktop browser to continue.</p></section>`;
    document.documentElement.style.overflow = "hidden";
    document.body.appendChild(overlay);
    overlay.focus();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", blockMobile, { once: true });
  else blockMobile();
})();
