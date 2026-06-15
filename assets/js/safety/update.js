(function() {
  // --- 1. CONFIGURATION ---
  let scriptRegistry = {
    "deviceCheck": "/assets/js/monitoring/deviceCheck.js",
    "timeCheck": "/assets/js/monitoring/timeCheck.js",
    "loginAnimationCheck": "/assets/js/auth/loginAnimationCheck.js",
    "timeRecords": "/assets/js/account/timeRecords.js",
    "timeWarn": "/assets/js/account/timeWarn.js",
    "playHistory": "/assets/js/monitoring/playHistory.js",
    "checkVerification": "/assets/js/auth/checkVerification.js",
    "envCheck": "/assets/js/monitoring/envCheck.js",
    "hashtagProto": "/assets/js/resources/hashtagProto.js",
    "settingsSafetyWarning": "/assets/js/account/settingsSafetyWarning.js",
    "analytics": "/assets/js/monitoring/analytics.js"
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  let UPDATER_ENABLED = true;
  let UPDATE_MODAL_ENABLED = true;
  let UPDATE_EXEC_ENABLED = true;
  let UPDATE_VERSION_PATH = "/version";
  let UPDATE_EXEC_PATH = "/exec";
  let UPDATE_CHECK_INTERVAL_MS = 1000;
  let UPDATE_FAILURE_COOLDOWN_MS = 300000;
  let UPDATE_SUCCESS_STORAGE_KEY = "studybase_last_update_check";
  let UPDATE_DAILY_CHECK_HOUR = 3;
  let UPDATE_DAILY_CHECK_MINUTE = 0;
  let UPDATE_MINIMUM_VISIBLE_STEP_MS = 2000;
  let UPDATE_PER_MODULE_DELAY_MS = 1000;
  let isUpdating = false;
  let lastFailedAttempt = 0; // Tracks failures to prevent infinite loops
  let updateEndpoint = window.SB_CONFIG?.endpoints?.update || window.SiteConfig?.defaults?.endpoints?.update || "";

  function formatModuleName(key) {
    return String(key || "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  async function applyUpdateConfig() {
    if (!window.SiteConfig?.ready) return;

    try {
      const config = await window.SiteConfig.ready;
      const updates = config?.updates || {};

      UPDATER_ENABLED = updates.enabled !== false;
      UPDATE_MODAL_ENABLED = updates.modalEnabled !== false;
      UPDATE_EXEC_ENABLED = updates.execEnabled !== false;
      updateEndpoint = updates.endpoint || config?.endpoints?.update || updateEndpoint;
      UPDATE_VERSION_PATH = updates.versionPath || UPDATE_VERSION_PATH;
      UPDATE_EXEC_PATH = updates.execPath || UPDATE_EXEC_PATH;
      UPDATE_CHECK_INTERVAL_MS = Number(updates.checkIntervalMs) || UPDATE_CHECK_INTERVAL_MS;
      UPDATE_FAILURE_COOLDOWN_MS = Number(updates.failureCooldownMs) || UPDATE_FAILURE_COOLDOWN_MS;
      UPDATE_SUCCESS_STORAGE_KEY = updates.successStorageKey || UPDATE_SUCCESS_STORAGE_KEY;
      UPDATE_DAILY_CHECK_HOUR = Number.isFinite(Number(updates.dailyCheckHour)) ? Number(updates.dailyCheckHour) : UPDATE_DAILY_CHECK_HOUR;
      UPDATE_DAILY_CHECK_MINUTE = Number.isFinite(Number(updates.dailyCheckMinute)) ? Number(updates.dailyCheckMinute) : UPDATE_DAILY_CHECK_MINUTE;
      UPDATE_MINIMUM_VISIBLE_STEP_MS = Number(updates.minimumVisibleStepMs) || UPDATE_MINIMUM_VISIBLE_STEP_MS;
      UPDATE_PER_MODULE_DELAY_MS = Number(updates.perModuleDelayMs) || UPDATE_PER_MODULE_DELAY_MS;

      if (updates.registry && typeof updates.registry === "object" && !Array.isArray(updates.registry)) {
        scriptRegistry = updates.registry;
      }
    } catch (error) {
      console.warn("Using fallback update config:", error);
    }
  }

  async function getUpdateEndpoint(path) {
    if (window.SiteConfig && window.SiteConfig.ready) {
      const config = await window.SiteConfig.ready;
      updateEndpoint = config?.updates?.endpoint || config?.endpoints?.update || updateEndpoint;
    } else if (window.SB_CONFIG?.endpoints?.update) {
      updateEndpoint = window.SB_CONFIG.endpoints.update;
    }

    return `${updateEndpoint.replace(/\/$/, "")}${path}`;
  }

  // --- 2. TIME LOGIC ---
  function getMostRecentUpdateTime() {
    const now = new Date();
    const mostRecentUpdateTime = new Date(now);
    mostRecentUpdateTime.setHours(UPDATE_DAILY_CHECK_HOUR, UPDATE_DAILY_CHECK_MINUTE, 0, 0); 
    if (now < mostRecentUpdateTime) {
      mostRecentUpdateTime.setDate(mostRecentUpdateTime.getDate() - 1);
    }
    return mostRecentUpdateTime.getTime();
  }

  // --- 3. INJECT THE COMPLEX TAILWIND MODAL UI ---
  function injectModalUI() {
    if (document.getElementById('update-modal-overlay')) return;

    const modalHTML = `
      <div id="update-modal-overlay" class="hidden fixed inset-0 z-[9999] bg-slate-950/48 backdrop-blur-xl items-center justify-center transition-opacity duration-300 opacity-0 font-sans p-4">
        <div id="update-modal-box" class="relative w-full max-w-[34rem] overflow-hidden rounded-[2rem] border border-white/65 bg-white/82 shadow-[0_40px_120px_-24px_rgba(15,23,42,0.45)] backdrop-blur-2xl transform scale-95 transition-transform duration-300">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(129,140,248,0.12),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.94),rgba(248,250,252,0.88))] pointer-events-none"></div>
          <div class="absolute -top-20 right-[-2rem] h-56 w-56 rounded-full bg-blue-300/35 blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-20 left-[-2rem] h-56 w-56 rounded-full bg-indigo-300/25 blur-3xl pointer-events-none"></div>

          <div class="relative p-6 md:p-8">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/76 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-700 shadow-sm backdrop-blur-xl">
              <span class="inline-flex h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(255,255,255,0.55)]"></span>
              AutoSafe Update
            </div>

            <div class="mt-5 flex items-start gap-4">
              <div class="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] border border-white/80 bg-white/90 shadow-lg shadow-slate-900/5">
                <div id="update-spinner" class="absolute inset-[6px] rounded-full border-[3px] border-slate-200 border-t-blue-600 animate-spin"></div>
                <svg id="update-success-icon" class="hidden w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>

              <div class="min-w-0 flex-1 pt-1">
                <h3 id="update-status" class="text-[1.8rem] font-black tracking-[-0.04em] leading-none text-slate-950">Checking for updates</h3>
                <p id="update-subtext" class="mt-3 min-h-[3rem] max-w-xl text-sm leading-6 text-slate-600 md:text-[15px]">Connecting to the update service and reviewing installed modules.</p>
              </div>
            </div>

            <div id="update-progress-container" class="hidden mt-6">
              <div class="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                <span>Progress</span>
                <span id="update-progress-label">0%</span>
              </div>
              <div class="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200/80 shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)]">
                <div id="update-progress-bar" class="h-full w-0 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500 transition-all duration-300 ease-out"></div>
              </div>
            </div>

            <div class="mt-6 rounded-[1.4rem] border border-white/80 bg-white/72 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl">
              <p class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">What this does</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">AutoSafe checks whether any client-side modules need to be refreshed, applies them quietly, and then restores the page when everything is ready.</p>
            </div>

            <button id="update-close-btn" class="hidden mt-6 w-full rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-extrabold tracking-tight text-white shadow-[0_18px_38px_-20px_rgba(15,23,42,0.95)] transition-all hover:-translate-y-0.5 hover:bg-slate-900 active:translate-y-0">
              Continue
            </button>
          </div>
        </div>
      </div>
    `;
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalHTML;
    document.body.appendChild(wrapper);

    document.getElementById('update-close-btn').addEventListener('click', hideModal);
  }

  function showModal() {
    const overlay = document.getElementById('update-modal-overlay');
    const box = document.getElementById('update-modal-box');
    
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    
    setTimeout(() => {
      overlay.classList.remove('opacity-0');
      overlay.classList.add('opacity-100');
      box.classList.remove('scale-95');
      box.classList.add('scale-100');
    }, 20);
  }

  function hideModal() {
    const overlay = document.getElementById('update-modal-overlay');
    const box = document.getElementById('update-modal-box');
    
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');
    box.classList.remove('scale-100');
    box.classList.add('scale-95');
    
    setTimeout(() => {
      overlay.classList.remove('flex');
      overlay.classList.add('hidden');
    }, 300);
  }

  // --- 4. SCRIPT INJECTION LOGIC ---
  function injectScript(url, version) {
    return new Promise((resolve, reject) => {
      const existingScripts = document.querySelectorAll(`script[src^="${url}"]`);
      existingScripts.forEach(script => script.remove());

      const newScript = document.createElement('script');
      newScript.src = `${url}?v=${version}`;
      newScript.defer = true;
      newScript.onload = () => resolve();
      newScript.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.body.appendChild(newScript);
    });
  }

  // --- 5. EXECUTE POST-UPDATE SCRIPT ---
  async function runPostUpdateExec() {
    if (!UPDATE_EXEC_ENABLED) return;

    const execStartTime = Date.now();
    try {
      const response = await fetch(await getUpdateEndpoint(UPDATE_EXEC_PATH));
      if (response.ok) {
        const jsCode = await response.text();
        
        // Clean up the old exec script if this is the second time running today
        const oldExec = document.getElementById('studybase-post-exec-script');
        if (oldExec) oldExec.remove();

        const execScript = document.createElement('script');
        execScript.id = 'studybase-post-exec-script';
        execScript.textContent = jsCode;
        document.body.appendChild(execScript);
      }
    } catch (error) {
      console.error("Failed to fetch exec script:", error);
    }
    
    const elapsed = Date.now() - execStartTime;
    if (elapsed < UPDATE_MINIMUM_VISIBLE_STEP_MS) {
      await sleep(UPDATE_MINIMUM_VISIBLE_STEP_MS - elapsed);
    }
  }

  // --- 6. MAIN UPDATE ROUTINE ---
  async function runUpdater() {
    if (!UPDATER_ENABLED) return;

    injectModalUI();
    if (UPDATE_MODAL_ENABLED) showModal();
    
    const statusEl = document.getElementById('update-status');
    const subtextEl = document.getElementById('update-subtext');
    const spinner = document.getElementById('update-spinner');
    const successIcon = document.getElementById('update-success-icon');
    const progressContainer = document.getElementById('update-progress-container');
    const progressBar = document.getElementById('update-progress-bar');
    const progressLabel = document.getElementById('update-progress-label');
    const closeBtn = document.getElementById('update-close-btn');

    // Reset UI state for subsequent runs
    spinner.classList.remove('hidden');
    successIcon.classList.add('hidden');
    progressContainer.classList.add('hidden');
    closeBtn.classList.add('hidden');
    progressBar.style.width = '0%';
    if (progressLabel) progressLabel.innerText = '0%';
    statusEl.innerText = 'Checking for updates';
    subtextEl.innerText = 'Connecting to the update service and reviewing installed modules.';

    const checkStartTime = Date.now();

    try {
      const response = await fetch(await getUpdateEndpoint(UPDATE_VERSION_PATH));
      const remoteVersions = await response.json();

      const elapsed = Date.now() - checkStartTime;
      if (elapsed < UPDATE_MINIMUM_VISIBLE_STEP_MS) await sleep(UPDATE_MINIMUM_VISIBLE_STEP_MS - elapsed);

      const updatesToApply = [];
      window.CurrentScriptVersions = window.CurrentScriptVersions || {};

      for (const [scriptKey, latestVersion] of Object.entries(remoteVersions)) {
        const currentVersion = window.CurrentScriptVersions[scriptKey];
        const scriptUrl = scriptRegistry[scriptKey];
        if (!scriptUrl) continue;
        if (!currentVersion || currentVersion !== latestVersion) {
          updatesToApply.push({ key: scriptKey, url: scriptUrl, version: latestVersion });
        }
      }

      if (updatesToApply.length > 0) {
        statusEl.innerText = 'Applying updates';
        progressContainer.classList.remove('hidden'); 
        await sleep(500);

        for (let i = 0; i < updatesToApply.length; i++) {
          const update = updatesToApply[i];
          subtextEl.innerText = `Refreshing ${formatModuleName(update.key)}.`;
          
          await injectScript(update.url, update.version);
          window.CurrentScriptVersions[update.key] = update.version;
          
          const percentage = ((i + 1) / updatesToApply.length) * 100;
          progressBar.style.width = `${percentage}%`;
          if (progressLabel) progressLabel.innerText = `${Math.round(percentage)}%`;
          
          await sleep(UPDATE_PER_MODULE_DELAY_MS); 
        }
      } else {
        statusEl.innerText = 'Everything is up to date';
        subtextEl.innerText = 'No changes were needed for this session.';
        await sleep(1000);
      }

      progressContainer.classList.add('hidden'); 
      statusEl.innerText = 'Finalizing';
      subtextEl.innerText = 'Applying the last configuration steps.';
      
      await runPostUpdateExec();

      spinner.classList.add('hidden');
      successIcon.classList.remove('hidden');
      statusEl.innerText = 'Update complete';
      subtextEl.innerText = 'This page is ready to continue.';
      closeBtn.classList.remove('hidden');

      // Clear any previous failure cooldowns and log the success
      lastFailedAttempt = 0;
      localStorage.setItem(UPDATE_SUCCESS_STORAGE_KEY, Date.now().toString());

    } catch (error) {
      console.error("Update failed:", error);
      spinner.classList.add('hidden');
      statusEl.innerText = 'Update check unavailable';
      subtextEl.innerText = 'We could not reach the update service just now. The page will retry later.';
      closeBtn.classList.remove('hidden');
      
      // Crucial Fix: Set a cooldown so we don't spam the user every 1 second
      lastFailedAttempt = Date.now(); 
    }
  }

  // --- 7. THE 1-SECOND INTERVAL SCHEDULER ---
  function checkSchedule() {
    if (isUpdating) return; 
    if (document.readyState === 'loading') return;

    if (!UPDATER_ENABLED) return;

    if (lastFailedAttempt && (Date.now() - lastFailedAttempt < UPDATE_FAILURE_COOLDOWN_MS)) {
      return; 
    }

    const lastCheck = localStorage.getItem(UPDATE_SUCCESS_STORAGE_KEY);
    const mostRecentUpdateTime = getMostRecentUpdateTime();

    if (!lastCheck || parseInt(lastCheck) < mostRecentUpdateTime) {
      isUpdating = true; 
      runUpdater().finally(() => {
        isUpdating = false; 
      });
    }
  }

  applyUpdateConfig().then(() => {
    if (UPDATER_ENABLED) setInterval(checkSchedule, UPDATE_CHECK_INTERVAL_MS);
  });
  
})();
