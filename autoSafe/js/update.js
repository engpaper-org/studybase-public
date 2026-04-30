(function() {
  // --- 1. CONFIGURATION ---
  let scriptRegistry = {
    "deviceCheck": "/assets/js/deviceCheck.js",
    "timeCheck": "/assets/js/timeCheck.js",
    "loginAnimationCheck": "/assets/js/loginAnimationCheck.js",
    "timeRecords": "/myaccount/js/timeRecords.js",
    "timeWarn": "/myaccount/js/timeWarn.js",
    "playHistory": "/assets/js/playHistory.js",
    "checkVerification": "/assets/js/checkVerification.js",
    "envCheck": "/assets/js/envCheck.js",
    "hashtagProto": "/assets/js/hashtagProto.js",
    "settingsSafetyWarning": "/myaccount/js/settingsSafetyWarning.js",
    "analytics": "/assets/js/analytics.js"
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
  let updateEndpoint = "https://update.revisionbase.site";

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
      <div id="update-modal-overlay" class="hidden fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-md items-center justify-center transition-opacity duration-300 opacity-0 font-sans">
        <div id="update-modal-box" class="bg-white rounded-2xl shadow-2xl w-[400px] overflow-hidden transform scale-95 transition-transform duration-300">
          <div class="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          <div class="p-8 text-center relative">
            
            <div class="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center bg-blue-50 rounded-full">
              <div id="update-spinner" class="absolute inset-0 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <svg id="update-success-icon" class="hidden w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <h3 id="update-status" class="text-[1.35rem] font-extrabold text-slate-900 tracking-tight mb-2">Checking system state</h3>
            <p id="update-subtext" class="text-sm font-medium text-slate-500 mb-6 h-10 flex items-center justify-center leading-relaxed">Connecting to update servers...</p>
            
            <div id="update-progress-container" class="hidden w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden shadow-inner">
              <div id="update-progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out w-0"></div>
            </div>

            <button id="update-close-btn" class="hidden w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
              Return to Resource
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
    const closeBtn = document.getElementById('update-close-btn');

    // Reset UI state for subsequent runs
    spinner.classList.remove('hidden');
    successIcon.classList.add('hidden');
    progressContainer.classList.add('hidden');
    closeBtn.classList.add('hidden');
    progressBar.style.width = '0%';
    statusEl.innerText = 'Checking system state';
    subtextEl.innerText = 'Connecting to update servers...';

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
        statusEl.innerText = 'Installing updates';
        progressContainer.classList.remove('hidden'); 
        await sleep(500);

        for (let i = 0; i < updatesToApply.length; i++) {
          const update = updatesToApply[i];
          subtextEl.innerText = `Updating module: ${update.key}...`;
          
          await injectScript(update.url, update.version);
          window.CurrentScriptVersions[update.key] = update.version;
          
          const percentage = ((i + 1) / updatesToApply.length) * 100;
          progressBar.style.width = `${percentage}%`;
          
          await sleep(UPDATE_PER_MODULE_DELAY_MS); 
        }
      } else {
        statusEl.innerText = 'System optimized';
        subtextEl.innerText = 'All resources are on the latest version.';
        await sleep(1000);
      }

      progressContainer.classList.add('hidden'); 
      statusEl.innerText = 'Finalizing configuration';
      subtextEl.innerText = 'Applying final settings. Please wait...';
      
      await runPostUpdateExec();

      spinner.classList.add('hidden');
      successIcon.classList.remove('hidden');
      statusEl.innerText = 'Updates complete';
      subtextEl.innerText = 'Your session is ready to continue.';
      closeBtn.classList.remove('hidden');

      // Clear any previous failure cooldowns and log the success
      lastFailedAttempt = 0;
      localStorage.setItem(UPDATE_SUCCESS_STORAGE_KEY, Date.now().toString());

    } catch (error) {
      console.error("Update failed:", error);
      spinner.classList.add('hidden');
      statusEl.innerText = 'Network Error';
      subtextEl.innerText = 'Could not verify updates. Will retry later.';
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
