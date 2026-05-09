(async function () {
  var STORAGE_KEY = "siteActiveTime";
  var TRACKING_ENABLED = true;
  var TICK_MS = 1000;
  var REQUIRE_VISIBLE = true;
  var REQUIRE_FOCUS = true;
  var WEEK_STARTS_ON = 1;
  window.CurrentScriptVersions = window.CurrentScriptVersions || {};
  window.CurrentScriptVersions['timeRecords'] = '1.0.0';

  let intervalId = null;
  let lastTick = null;

  function getNow() {
    return new Date();
  }

  function getDayKey(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, "0");
    var d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function getMonthKey(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }

  function getWeekKey(date) {
    var copy = new Date(date);
    var day = copy.getDay();
    var diffToWeekStart = day - WEEK_STARTS_ON;
    if (diffToWeekStart < 0) diffToWeekStart += 7;
    copy.setDate(copy.getDate() - diffToWeekStart);

    var y = copy.getFullYear();
    var m = String(copy.getMonth() + 1).padStart(2, "0");
    var d = String(copy.getDate()).padStart(2, "0");

    return `${y}-WEEK-${m}-${d}`; // week starts Monday
  }

  function getDefaultData() {
    var now = getNow();
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

  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultData();

      var parsed = JSON.parse(raw);

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
      return getDefaultData();
    }
  }

  function saveData(data) {
    data.updatedAt = getNow().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function resetPeriodsIfNeeded(data) {
    var now = getNow();
    var dayKey = getDayKey(now);
    var weekKey = getWeekKey(now);
    var monthKey = getMonthKey(now);

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

  function isPageActive() {
    if (REQUIRE_VISIBLE && document.visibilityState !== "visible") return false;
    if (REQUIRE_FOCUS && !document.hasFocus()) return false;
    return true;
  }

  function tick() {
    var nowMs = Date.now();

    if (!lastTick) {
      lastTick = nowMs;
      return;
    }

    var diffSeconds = Math.floor((nowMs - lastTick) / 1000);

    if (diffSeconds <= 0) return;

    lastTick = nowMs;

    if (!isPageActive()) return;

    var data = resetPeriodsIfNeeded(loadData());

    data.totalSeconds += diffSeconds;
    data.dailySeconds += diffSeconds;
    data.weeklySeconds += diffSeconds;
    data.monthlySeconds += diffSeconds;

    saveData(data);
  }

  function startTracking() {
    if (intervalId) return;
    lastTick = Date.now();
    intervalId = setInterval(tick, TICK_MS);
  }

  function stopTracking() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    lastTick = null;
  }

  function handleStateChange() {
    if (!TRACKING_ENABLED) {
      stopTracking();
      return;
    }

    var data = resetPeriodsIfNeeded(loadData());
    saveData(data);

    if (isPageActive()) {
      startTracking();
    } else {
      stopTracking();
    }
  }

  async function applyUsageTrackingConfig() {
    if (!window.SiteConfig?.ready) return;

    try {
      var config = await window.SiteConfig.ready;
      var tracking = config?.timeLimits?.usageTracking || {};

      TRACKING_ENABLED = tracking.enabled !== false;
      STORAGE_KEY = tracking.storageKey || STORAGE_KEY;
      TICK_MS = Number(tracking.tickMs) || TICK_MS;
      REQUIRE_VISIBLE = tracking.requireVisible !== false;
      REQUIRE_FOCUS = tracking.requireFocus !== false;
      WEEK_STARTS_ON = Number.isFinite(Number(tracking.weekStartsOn))
        ? Math.max(0, Math.min(6, Number(tracking.weekStartsOn)))
        : WEEK_STARTS_ON;
    } catch (error) {
      console.warn("Using fallback usage tracking config:", error);
    }
  }

  await applyUsageTrackingConfig();
  if (!TRACKING_ENABLED) return;

  document.addEventListener("visibilitychange", handleStateChange);
  window.addEventListener("focus", handleStateChange);
  window.addEventListener("blur", handleStateChange);

  window.addEventListener("beforeunload", function () {
    if (!isPageActive()) return;

    var data = resetPeriodsIfNeeded(loadData());
    data.updatedAt = getNow().toISOString();
    saveData(data);
  });

  var initialData = resetPeriodsIfNeeded(loadData());
  saveData(initialData);
  handleStateChange();

  window.getSiteActiveTime = function () {
    var data = resetPeriodsIfNeeded(loadData());
    saveData(data);
    return data;
  };
})();
