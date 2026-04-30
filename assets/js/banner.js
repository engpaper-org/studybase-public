(() => {
  const DEVICE_KEY = "gh_device";
  const USER_KEY = "gh_username";
  const PASS_KEY = "gh_password";
  const TIME_KEY = "siteActiveTime";

  const BLOCK_REQUEST_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSe8Zez4T6HS93vLmEBYPzfHg4hTnA_fILHzTSHqDZU1vAX-kw/viewform?usp=publish-editor";

  let tickTimer = null;
  let baseData = null;
  let liveSeconds = {
    dailySeconds: 0,
    weeklySeconds: 0,
    monthlySeconds: 0
  };

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const safeStr = (v) => (v ?? "").toString().trim();

  function getDevice() {
    return safeStr(localStorage.getItem(DEVICE_KEY));
  }

  function getUsername() {
    return safeStr(localStorage.getItem(USER_KEY));
  }

  function getPassword() {
    return safeStr(localStorage.getItem(PASS_KEY));
  }

  function looksLoggedIn() {
    return !!(getDevice() && getUsername() && getPassword());
  }

  function isPrivateResourceMode() {
    return safeStr(window.SB_RESOURCE_OPEN_MODE).toLowerCase() === "access_only";
  }

  function shouldShowBanner() {
    return looksLoggedIn() && isPrivateResourceMode();
  }

  function getNow() {
    return new Date();
  }

  function getDayKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getMonthKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }

  function getWeekKey(date) {
    const copy = new Date(date);
    const day = copy.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + diffToMonday);

    const y = copy.getFullYear();
    const m = String(copy.getMonth() + 1).padStart(2, "0");
    const d = String(copy.getDate()).padStart(2, "0");
    return `${y}-WEEK-${m}-${d}`;
  }

  function getDefaultTimeData() {
    const now = getNow();
    return {
      totalSeconds: 0,
      dailySeconds: 0,
      weeklySeconds: 0,
      monthlySeconds: 0,
      currentDay: getDayKey(now),
      currentWeek: getWeekKey(now),
      currentMonth: getMonthKey(now),
      updatedAt: now.toISOString()
    };
  }

  function loadTimeData() {
    try {
      const raw = localStorage.getItem(TIME_KEY);
      if (!raw) return getDefaultTimeData();

      const parsed = JSON.parse(raw);
      return {
        totalSeconds: Number(parsed.totalSeconds) || 0,
        dailySeconds: Number(parsed.dailySeconds) || 0,
        weeklySeconds: Number(parsed.weeklySeconds) || 0,
        monthlySeconds: Number(parsed.monthlySeconds) || 0,
        currentDay: parsed.currentDay || getDayKey(getNow()),
        currentWeek: parsed.currentWeek || getWeekKey(getNow()),
        currentMonth: parsed.currentMonth || getMonthKey(getNow()),
        updatedAt: parsed.updatedAt || getNow().toISOString()
      };
    } catch {
      return getDefaultTimeData();
    }
  }

  function saveTimeData(data) {
    data.updatedAt = getNow().toISOString();
    localStorage.setItem(TIME_KEY, JSON.stringify(data));
  }

  function resetPeriodsIfNeeded(data) {
    const now = getNow();
    const dayKey = getDayKey(now);
    const weekKey = getWeekKey(now);
    const monthKey = getMonthKey(now);

    if (data.currentDay !== dayKey) {
      data.dailySeconds = 0;
      data.currentDay = dayKey;
    }

    if (data.currentWeek !== weekKey) {
      data.weeklySeconds = 0;
      data.currentWeek = weekKey;
    }

    if (data.currentMonth !== monthKey) {
      data.monthlySeconds = 0;
      data.currentMonth = monthKey;
    }

    return data;
  }

  function ensureWrap() {
    const marker = document.getElementById("global-banner-marker");
    if (!marker) return null;

    let wrap = document.getElementById("sb-banner-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "sb-banner-wrap";
      marker.appendChild(wrap);
    }

    let mount = document.getElementById("sb-active-banner-mount");
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "sb-active-banner-mount";
      wrap.appendChild(mount);
    }

    return { wrap, mount };
  }

  function tryMoveWrapUnderNavbar() {
    const nav = qs("#navbar-placeholder");
    const wrap = qs("#sb-banner-wrap");
    if (!nav || !wrap) return false;
    if (wrap.previousElementSibling === nav) return true;
    nav.insertAdjacentElement("afterend", wrap);
    return true;
  }

  function removeSingleEntryBanner() {
    qsa("#sb-banner-wrap > *").forEach((el) => {
      if (el.id === "sb-active-banner-mount") return;

      const txt = (el.textContent || "").toLowerCase();
      if (
        txt.includes("single entry browsing") ||
        txt.includes("new browsing mode") ||
        txt.includes("free beta feature")
      ) {
        el.remove();
      }
    });

    qsa("#sb-banner-wrap .mb-6").forEach((el) => {
      const txt = (el.textContent || "").toLowerCase();
      if (
        txt.includes("single entry browsing") ||
        txt.includes("new browsing mode") ||
        txt.includes("free beta feature")
      ) {
        el.remove();
      }
    });
  }

  function ensureStyles() {
    if (document.getElementById("sb-usage-banner-style")) return;

    const style = document.createElement("style");
    style.id = "sb-usage-banner-style";
    style.textContent = `
      #sb-usage-banner {
        position: relative;
        overflow: hidden;
        margin: 0 0 1rem 0;
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.08);
        background:
          radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 26%),
          radial-gradient(circle at bottom right, rgba(139,92,246,0.18), transparent 30%),
          linear-gradient(135deg, #071327 0%, #08152d 45%, #162454 100%);
        box-shadow:
          0 18px 60px -28px rgba(2, 6, 23, 0.65),
          inset 0 1px 0 rgba(255,255,255,0.05);
        color: white;
      }

      #sb-usage-banner::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, rgba(255,255,255,0.04), transparent 15%, transparent 85%, rgba(255,255,255,0.03));
        pointer-events: none;
      }

      .sb-usage-inner {
        position: relative;
        z-index: 1;
        padding: 16px 18px 14px;
      }

      .sb-usage-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 14px;
        flex-wrap: wrap;
      }

      .sb-usage-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.08);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.9);
        margin-bottom: 10px;
      }

      .sb-usage-title {
        margin: 0;
        font-size: clamp(1.35rem, 1.1rem + 1vw, 2.1rem);
        font-weight: 900;
        line-height: 1;
        letter-spacing: -0.04em;
      }

      .sb-usage-sub {
        margin: 8px 0 0 0;
        font-size: 0.98rem;
        line-height: 1.45;
        color: rgba(255,255,255,0.7);
        max-width: 760px;
      }

      .sb-usage-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .sb-time-card {
        min-width: 0;
        border-radius: 20px;
        background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.04));
        border: 1px solid rgba(255,255,255,0.08);
        padding: 14px;
        overflow: hidden;
      }

      .sb-time-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 12px;
      }

      .sb-time-label {
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.74);
      }

      .sb-time-tag {
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.08);
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.72);
      }

      .sb-time-row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex-wrap: wrap;
      }

      .sb-time-block {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }

      .sb-time-value {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 56px;
        height: 44px;
        padding: 0 12px;
        border-radius: 12px;
        background: linear-gradient(180deg, #f8fbff 0%, #ecf3ff 100%);
        color: #0f172a;
        border: 1px solid rgba(255,255,255,0.4);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
        font-size: 1.2rem;
        font-weight: 900;
        letter-spacing: -0.03em;
        font-variant-numeric: tabular-nums;
      }

      .sb-time-unit {
        font-size: 0.74rem;
        font-weight: 800;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.5);
        white-space: nowrap;
      }

      .sb-time-sep {
        font-size: 1rem;
        font-weight: 900;
        color: rgba(255,255,255,0.3);
      }

      .sb-usage-actions {
        margin-top: 14px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .sb-usage-btn {
        appearance: none;
        border: 0;
        cursor: pointer;
        border-radius: 14px;
        padding: 11px 16px;
        font-size: 0.92rem;
        font-weight: 800;
        letter-spacing: -0.01em;
        transition: transform 0.16s ease, opacity 0.16s ease, box-shadow 0.16s ease;
      }

      .sb-usage-btn:hover {
        transform: translateY(-1px);
      }

      .sb-usage-btn:active {
        transform: translateY(0);
      }

      .sb-usage-btn-primary {
        background: linear-gradient(180deg, #ffffff 0%, #e9f1ff 100%);
        color: #0f172a;
        box-shadow: 0 10px 25px -14px rgba(255,255,255,0.55);
      }

      .sb-usage-btn-secondary {
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.94);
        border: 1px solid rgba(255,255,255,0.1);
      }

      #sb-block-modal {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(2, 6, 23, 0.72);
        backdrop-filter: blur(8px);
      }

      #sb-block-modal.sb-open {
        display: flex;
      }

      .sb-block-panel {
        width: 90vw;
        height: 90vh;
        max-width: 1400px;
        background: #ffffff;
        color: #0f172a;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 30px 80px -30px rgba(0,0,0,0.45);
        border: 1px solid rgba(15,23,42,0.08);
        display: flex;
        flex-direction: column;
      }

      .sb-block-head {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 18px 20px;
        border-bottom: 1px solid rgba(15,23,42,0.08);
        background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
      }

      .sb-block-head-left {
        min-width: 0;
      }

      .sb-block-kicker {
        margin: 0 0 4px 0;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #2563eb;
      }

      .sb-block-title {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 900;
        letter-spacing: -0.03em;
      }

      .sb-block-sub {
        margin: 4px 0 0 0;
        font-size: 0.92rem;
        color: #475569;
      }

      .sb-block-close {
        appearance: none;
        border: 1px solid rgba(15,23,42,0.1);
        background: #fff;
        color: #0f172a;
        border-radius: 12px;
        padding: 10px 14px;
        cursor: pointer;
        font-weight: 800;
        font-size: 0.92rem;
      }

      .sb-block-body {
        flex: 1 1 auto;
        min-height: 0;
        background: #f8fafc;
      }

      .sb-block-frame {
        width: 100%;
        height: 100%;
        border: 0;
        background: #fff;
      }

      body.sb-modal-open {
        overflow: hidden !important;
      }

      @media (max-width: 1180px) {
        .sb-usage-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .sb-usage-inner {
          padding: 14px;
        }

        .sb-time-card {
          padding: 12px;
        }

        .sb-time-row {
          gap: 8px;
        }

        .sb-time-value {
          min-width: 50px;
          height: 40px;
          padding: 0 10px;
          font-size: 1.05rem;
        }

        .sb-time-unit {
          font-size: 0.68rem;
        }

        .sb-block-panel {
          width: 94vw;
          height: 92vh;
          border-radius: 18px;
        }

        .sb-block-head {
          padding: 14px;
          align-items: flex-start;
        }

        .sb-block-close {
          padding: 9px 12px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function cardMarkup(prefix, title, tag) {
    return `
      <div class="sb-time-card">
        <div class="sb-time-head">
          <div class="sb-time-label">${title}</div>
          <div class="sb-time-tag">${tag}</div>
        </div>

        <div class="sb-time-row">
          <div class="sb-time-block">
            <div class="sb-time-value" data-time="${prefix}-hh">00</div>
            <div class="sb-time-unit">Hours</div>
          </div>

          <div class="sb-time-sep">:</div>

          <div class="sb-time-block">
            <div class="sb-time-value" data-time="${prefix}-mm">00</div>
            <div class="sb-time-unit">Minutes</div>
          </div>

          <div class="sb-time-sep">:</div>

          <div class="sb-time-block">
            <div class="sb-time-value" data-time="${prefix}-ss">00</div>
            <div class="sb-time-unit">Seconds</div>
          </div>
        </div>
      </div>
    `;
  }

  function ensureModal() {
    let modal = document.getElementById("sb-block-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "sb-block-modal";
    modal.innerHTML = `
      <div class="sb-block-panel" role="dialog" aria-modal="true" aria-labelledby="sb-block-modal-title">
        <div class="sb-block-head">
          <div class="sb-block-head-left">
            <p class="sb-block-kicker">RevisionBase Support</p>
            <h2 class="sb-block-title" id="sb-block-modal-title">Request we block your account</h2>
            <p class="sb-block-sub">
              Fill in this form if you want us to restrict your access to help you stop using this part of the site.
            </p>
          </div>
          <button type="button" class="sb-block-close" id="sb-block-close-btn">Close</button>
        </div>
        <div class="sb-block-body">
          <iframe
            class="sb-block-frame"
            id="sb-block-form-frame"
            src="about:blank"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            title="Request account block form"
          ></iframe>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeBlockModal();
    });

    const closeBtn = modal.querySelector("#sb-block-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeBlockModal);
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("sb-open")) {
        closeBlockModal();
      }
    });

    return modal;
  }

  function openBlockModal() {
    const modal = ensureModal();
    const frame = qs("#sb-block-form-frame", modal);
    if (frame && frame.src !== BLOCK_REQUEST_FORM_URL) {
      frame.src = BLOCK_REQUEST_FORM_URL;
    }
    modal.classList.add("sb-open");
    document.body.classList.add("sb-modal-open");
  }

  function closeBlockModal() {
    const modal = document.getElementById("sb-block-modal");
    if (!modal) return;
    modal.classList.remove("sb-open");
    document.body.classList.remove("sb-modal-open");
  }

  function renderBanner(mount) {
    mount.innerHTML = `
      <div id="sb-usage-banner">
        <div class="sb-usage-inner">
          <div class="sb-usage-top">
            <div>
              <div class="sb-usage-pill">RevisionBase • Usage Tracker</div>
              <h3 class="sb-usage-title">Your study time, live.</h3>
              <p class="sb-usage-sub">
                If you are spending alot of time here, please consider taking a break. Over 3 hours a week isn't good.
              </p>
            </div>
          </div>

          <div class="sb-usage-grid">
            ${cardMarkup("today", "Today", "Daily")}
            ${cardMarkup("week", "This Week", "Weekly")}
            ${cardMarkup("month", "This Month", "Monthly")}
          </div>

          <div class="sb-usage-actions">
            <button type="button" class="sb-usage-btn sb-usage-btn-primary" id="sb-open-block-form-btn">
              Can't focus at school? Click to request we block your account
            </button>
            
          </div>
        </div>
      </div>
    `;

    const blockBtn = qs("#sb-open-block-form-btn", mount);
    if (blockBtn) {
      blockBtn.addEventListener("click", openBlockModal);
    }

    
  }

  function twoDigits(n) {
    return String(Math.max(0, Math.floor(n))).padStart(2, "0").slice(-2);
  }

  function secondsToDisplayParts(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds || 0));
    return {
      hh: twoDigits(Math.floor(s / 3600)),
      mm: twoDigits(Math.floor((s % 3600) / 60)),
      ss: twoDigits(s % 60)
    };
  }

  function setTimeValue(key, value) {
    const el = qs(`[data-time="${key}"]`);
    if (!el) return;
    el.textContent = value;
  }

  function updateClock(prefix, seconds) {
    const parts = secondsToDisplayParts(seconds);
    setTimeValue(`${prefix}-hh`, parts.hh);
    setTimeValue(`${prefix}-mm`, parts.mm);
    setTimeValue(`${prefix}-ss`, parts.ss);
  }

  function syncBaseData() {
    baseData = resetPeriodsIfNeeded(loadTimeData());
    saveTimeData(baseData);

    liveSeconds.dailySeconds = baseData.dailySeconds;
    liveSeconds.weeklySeconds = baseData.weeklySeconds;
    liveSeconds.monthlySeconds = baseData.monthlySeconds;
  }

  function isActivelyCounting() {
    return document.visibilityState === "visible" && document.hasFocus();
  }

  function renderLiveTimes() {
    updateClock("today", liveSeconds.dailySeconds);
    updateClock("week", liveSeconds.weeklySeconds);
    updateClock("month", liveSeconds.monthlySeconds);
  }

  function tick() {
    if (!shouldShowBanner()) return;

    const fresh = resetPeriodsIfNeeded(loadTimeData());
    const nowDay = getDayKey(getNow());
    const nowWeek = getWeekKey(getNow());
    const nowMonth = getMonthKey(getNow());

    if (
      !baseData ||
      fresh.currentDay !== baseData.currentDay ||
      fresh.currentWeek !== baseData.currentWeek ||
      fresh.currentMonth !== baseData.currentMonth ||
      nowDay !== baseData.currentDay ||
      nowWeek !== baseData.currentWeek ||
      nowMonth !== baseData.currentMonth
    ) {
      syncBaseData();
      renderLiveTimes();
      return;
    }

    if (isActivelyCounting()) {
      liveSeconds.dailySeconds += 1;
      liveSeconds.weeklySeconds += 1;
      liveSeconds.monthlySeconds += 1;
    }

    renderLiveTimes();
  }

  function stopTicker() {
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  }

  function startTicker() {
    stopTicker();
    tickTimer = setInterval(tick, 1000);
  }

  function clearBanner(mount) {
    if (mount) mount.innerHTML = "";
  }

  function rerender(mount) {
    removeSingleEntryBanner();

    if (!shouldShowBanner()) {
      stopTicker();
      clearBanner(mount);
      closeBlockModal();
      return;
    }

    ensureStyles();
    ensureModal();
    renderBanner(mount);
    syncBaseData();
    renderLiveTimes();
    startTicker();
  }

  function run() {
    const mounts = ensureWrap();
    if (!mounts) return;

    tryMoveWrapUnderNavbar();

    const moveTimer = setInterval(() => {
      const moved = tryMoveWrapUnderNavbar();
      if (moved) clearInterval(moveTimer);
    }, 250);

    setTimeout(() => clearInterval(moveTimer), 6000);

    rerender(mounts.mount);

    window.addEventListener("sb:resource-mode-changed", () => {
      rerender(mounts.mount);
    });

    window.addEventListener("storage", (e) => {
      if (![DEVICE_KEY, USER_KEY, PASS_KEY, TIME_KEY].includes(e.key)) return;
      rerender(mounts.mount);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        syncBaseData();
        renderLiveTimes();
      }
    });

    window.addEventListener("focus", () => {
      syncBaseData();
      renderLiveTimes();
    });

    window.addEventListener("beforeunload", stopTicker);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();