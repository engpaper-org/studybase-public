(function () {
  "use strict";

  const STORAGE_KEY = "get_help_data";
  const DATA_VERSION = 2;
  const MAX_INTERACTIONS = 60;
  const DEFAULT_INTERVAL = 5;
  const MIN_LEARNING_VIEWS = 3;

  function emptyData() {
    return {
      version: DATA_VERSION,
      experiences: {},
      interactions: {},
      materialSchedule: null
    };
  }

  function readData() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const data = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : emptyData();
      data.version = DATA_VERSION;
      data.experiences = data.experiences && typeof data.experiences === "object" && !Array.isArray(data.experiences)
        ? data.experiences
        : {};
      data.interactions = data.interactions && typeof data.interactions === "object" && !Array.isArray(data.interactions)
        ? data.interactions
        : {};
      data.materialSchedule = data.materialSchedule && typeof data.materialSchedule === "object" && !Array.isArray(data.materialSchedule)
        ? data.materialSchedule
        : null;
      return data;
    } catch (_) {
      return emptyData();
    }
  }

  function writeData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (_) {
      return false;
    }
  }

  function makeInteractionId() {
    try {
      if (crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    } catch (_) {}
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }

  function experienceForGender(profile) {
    const gender = String(profile?.gender || "").trim().toLowerCase();
    if (gender === "male") return "m1";
    if (gender === "female") return "f1";
    return null;
  }

  function validInteractions(data, experienceId) {
    const interactions = Array.isArray(data.interactions[experienceId]) ? data.interactions[experienceId] : [];
    return interactions.filter(item => item && typeof item === "object").slice(-MAX_INTERACTIONS);
  }

  function interactionDuration(item) {
    const started = Number(item?.shownAtMs);
    const finished = Number(item?.continuedAtMs);
    return Number.isFinite(started) && Number.isFinite(finished) && finished >= started ? finished - started : null;
  }

  function learnedInterval(data, experienceId) {
    const interactions = validInteractions(data, experienceId).slice(-10);
    if (interactions.length < MIN_LEARNING_VIEWS) return DEFAULT_INTERVAL;

    const helpOpens = interactions.filter(item => Number.isFinite(Number(item.helpOpenedAtMs))).length;
    const explanationOpens = interactions.filter(item => Number.isFinite(Number(item.explanationOpenedAtMs))).length;
    const durations = interactions.map(interactionDuration).filter(Number.isFinite);
    const immediateContinues = durations.filter(duration => duration <= 10000).length;

    if (helpOpens >= 2 || helpOpens / interactions.length >= 0.34) return 3;
    if (explanationOpens >= 2 || explanationOpens / interactions.length >= 0.4) return 4;
    if (durations.length >= 3 && helpOpens === 0 && immediateContinues / durations.length >= 0.75) return 7;
    return DEFAULT_INTERVAL;
  }

  function categoryWeight(data, experienceId, categoryId, lastCategoryId) {
    const interactions = validInteractions(data, experienceId).slice(-12);
    if (interactions.length < MIN_LEARNING_VIEWS) return 1;

    let score = 1;
    interactions.forEach(item => {
      if (item.categoryId !== categoryId) return;
      if (Number.isFinite(Number(item.helpOpenedAtMs))) score += 3;
      if (Number.isFinite(Number(item.explanationOpenedAtMs))) score += 1;
      const duration = interactionDuration(item);
      if (Number.isFinite(duration) && duration >= 16000) score += 0.75;
      if (Number.isFinite(duration) && duration <= 10000 && !Number.isFinite(Number(item.helpOpenedAtMs))) score -= 0.25;
    });

    if (categoryId === lastCategoryId) score *= 0.7;
    return Math.max(0.5, score);
  }

  function weightedChoice(items, getWeight) {
    if (!items.length) return null;
    const weighted = items.map(item => ({ item, weight: Math.max(0.01, Number(getWeight(item)) || 0.01) }));
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    let cursor = Math.random() * total;
    for (const entry of weighted) {
      cursor -= entry.weight;
      if (cursor <= 0) return entry.item;
    }
    return weighted[weighted.length - 1].item;
  }

  function selectMessage(experienceId, entries) {
    const safeExperienceId = String(experienceId || "").trim().toLowerCase();
    const safeEntries = Array.isArray(entries) ? entries.filter(entry => entry && typeof entry.id === "string") : [];
    if (!safeExperienceId || !safeEntries.length) return { entry: null, interactionId: null };

    const data = readData();
    const savedExperience = data.experiences[safeExperienceId];
    const experience = savedExperience && typeof savedExperience === "object" && !Array.isArray(savedExperience)
      ? savedExperience
      : {};
    const validIds = new Set(safeEntries.map(entry => entry.id));
    let seenIds = Array.isArray(experience.seenIds)
      ? [...new Set(experience.seenIds.filter(id => validIds.has(id)))]
      : [];
    let available = safeEntries.filter(entry => !seenIds.includes(entry.id));

    if (!available.length) {
      const lastShownId = validIds.has(experience.lastShownId) ? experience.lastShownId : null;
      seenIds = [];
      available = safeEntries.filter(entry => entry.id !== lastShownId);
      if (!available.length) available = safeEntries.slice();
    }

    const entry = weightedChoice(
      available,
      item => categoryWeight(data, safeExperienceId, item.categoryId, experience.lastCategoryId)
    );
    const interactionId = makeInteractionId();
    const shownAtMs = Date.now();
    const interactions = validInteractions(data, safeExperienceId);
    interactions.push({
      id: interactionId,
      experienceId: safeExperienceId,
      contentId: entry.id,
      categoryId: String(entry.categoryId || ""),
      shownAt: new Date(shownAtMs).toISOString(),
      shownAtMs
    });

    data.experiences[safeExperienceId] = {
      seenIds: [...seenIds, entry.id],
      lastShownId: entry.id,
      lastCategoryId: String(entry.categoryId || "")
    };
    data.interactions[safeExperienceId] = interactions.slice(-MAX_INTERACTIONS);
    writeData(data);
    return { entry, interactionId };
  }

  function recordInteraction(experienceId, interactionId, action) {
    const safeExperienceId = String(experienceId || "").trim().toLowerCase();
    const safeInteractionId = String(interactionId || "").trim();
    const fields = {
      "help-opened": ["helpOpenedAt", "helpOpenedAtMs"],
      "explanation-opened": ["explanationOpenedAt", "explanationOpenedAtMs"],
      continued: ["continuedAt", "continuedAtMs"]
    };
    const field = fields[action];
    if (!safeExperienceId || !safeInteractionId || !field) return false;

    const data = readData();
    const interactions = validInteractions(data, safeExperienceId);
    const item = interactions.find(entry => entry.id === safeInteractionId);
    if (!item) return false;
    if (!Number.isFinite(Number(item[field[1]]))) {
      const now = Date.now();
      item[field[0]] = new Date(now).toISOString();
      item[field[1]] = now;
    }
    data.interactions[safeExperienceId] = interactions;
    return writeData(data);
  }

  function shouldShowForMaterial(profile) {
    const experienceId = experienceForGender(profile);
    if (!experienceId) return { show: false, experienceId: null, url: null, interval: DEFAULT_INTERVAL };

    const data = readData();
    const interval = learnedInterval(data, experienceId);
    const schedule = data.materialSchedule;
    let show = false;

    if (!schedule) {
      data.materialSchedule = {
        totalEligibleOpens: 1,
        totalShown: 1,
        opensSinceShown: 0,
        targetInterval: interval,
        lastExperienceId: experienceId,
        lastShownAt: new Date().toISOString()
      };
      show = true;
    } else {
      schedule.totalEligibleOpens = Math.max(0, Number(schedule.totalEligibleOpens) || 0) + 1;
      schedule.opensSinceShown = Math.max(0, Number(schedule.opensSinceShown) || 0) + 1;
      schedule.targetInterval = interval;
      schedule.lastExperienceId = experienceId;
      if (schedule.opensSinceShown >= interval) {
        show = true;
        schedule.opensSinceShown = 0;
        schedule.totalShown = Math.max(0, Number(schedule.totalShown) || 0) + 1;
        schedule.lastShownAt = new Date().toISOString();
      }
    }

    writeData(data);
    return {
      show,
      experienceId,
      interval,
      url: show ? `/internal/get_help/${experienceId}.html` : null
    };
  }

  window.StudyBaseGetHelp = Object.freeze({
    storageKey: STORAGE_KEY,
    selectMessage,
    recordInteraction,
    shouldShowForMaterial
  });
})();
