(function () {
  const TRIGGER_HASH = "#logged-in";
  const NAME_KEY = "sb_firstName";
  const QUICK_LOGIN_ENABLED_KEY = "sb_quickLogin";
  const QUICK_LOGIN_HASH_KEY = "sb_quickLoginCodeHash";
  const GENDER_KEY = "sb_gender"; // local only, never sent to server

  let modal = null;

  function cleanHash() {
    try {
      const clean = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", clean);
    } catch (_) {}
  }

  async function sha256(text) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    } catch (_) {
      // Fallback (very rare)
      return btoa(text).slice(0, 64);
    }
  }

  function digitsOnly(str) {
    return String(str || "").replace(/\D/g, "").slice(0, 6);
  }

  function getStoredGender() {
    const g = (localStorage.getItem(GENDER_KEY) || "").toLowerCase();
    return (g === "male" || g === "female") ? g : "";
  }

  function saveGender(gender) {
    if (gender === "male" || gender === "female") {
      localStorage.setItem(GENDER_KEY, gender);
    }
  }

  // Returns the first step that still needs to be completed, or null if everything is done.
  function getMissingSetupStep() {
    const hasName = (localStorage.getItem(NAME_KEY) || "").trim().length > 0;
    const hasQuickLogin = (localStorage.getItem(QUICK_LOGIN_HASH_KEY) || "").length > 0;
    const hasGender = ["male", "female"].includes(localStorage.getItem(GENDER_KEY) || "");

    if (!hasName) return 1;
    if (!hasQuickLogin) return 2;
    if (!hasGender) return 3;
    return null; // All data present → don't show popup
  }

  function createModal(startStep = 1) {
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "sb-login-welcome-modal";
    modal.style.cssText = "position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,0.78);backdrop-filter:blur(8px);padding:16px;";

    const storedName = (localStorage.getItem(NAME_KEY) || "").trim();
    const storedGender = getStoredGender();

    modal.innerHTML = `
      <div style="width:100%;max-width:360px;background:#fff;border-radius:24px;box-shadow:0 25px 70px -15px rgba(0,0,0,0.35);border:1px solid #e2e8f0;overflow:hidden;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-sizing:border-box;">
        
        <!-- Header with progress -->
        <div style="padding:18px 20px 12px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:12px;font-weight:700;color:#64748b;letter-spacing:0.5px;" id="sbw-progress">1 of 3</div>
          <div style="font-size:11px;color:#94a3b8;">Post-login setup</div>
        </div>

        <div style="padding:22px 20px 24px;">

          <!-- STEP 1: Name -->
          <div id="sbw-step-1" class="sbw-step">
            <div style="text-align:center;margin-bottom:18px;">
              <div style="width:48px;height:48px;margin:0 auto 10px;border-radius:9999px;background:linear-gradient(135deg,#0ea5e9,#6366f1);display:flex;align-items:center;justify-content:center;color:white;font-size:24px;">👋</div>
              <h2 style="margin:0 0 6px;font-size:20px;font-weight:900;color:#0f172a;letter-spacing:-0.02em;">What's your first name?</h2>
              <p style="margin:0;font-size:13.5px;color:#64748b;line-height:1.4;">We'll use this to personalise StudyBase for you.</p>
            </div>

            <div style="margin:16px 0 8px;">
              <input id="sbw-name" type="text" placeholder="Alex" value="${storedName}" 
                     style="width:100%;max-width:100%;padding:14px 16px;border:1px solid #cbd5e1;border-radius:14px;font-size:17px;font-weight:600;outline:none;box-sizing:border-box;">
              <div id="sbw-name-hint" style="display:none;margin-top:6px;font-size:12.5px;color:#dc2626;font-weight:600;">Please enter your first name</div>
            </div>

            <button id="sbw-next-1" type="button"
                    style="width:100%;margin-top:12px;padding:13px 18px;border-radius:14px;border:none;background:#0f172a;color:#fff;font-weight:800;font-size:15px;cursor:pointer;">
              Continue
            </button>
          </div>

          <!-- STEP 2: Quick Login Code -->
          <div id="sbw-step-2" class="sbw-step" style="display:none;">
            <div style="text-align:center;margin-bottom:16px;">
              <h2 style="margin:0 0 6px;font-size:19px;font-weight:900;color:#0f172a;letter-spacing:-0.02em;">Quick Login Code</h2>
              <p style="margin:0;font-size:13.5px;color:#64748b;line-height:1.4;">Set a 6-digit code so you can log in faster in future.</p>
            </div>

            <div style="margin:12px 0 4px;">
              <label style="display:block;font-size:12px;font-weight:700;color:#475569;margin-bottom:6px;letter-spacing:0.4px;">ENTER CODE</label>
              <input id="sbw-q1" type="text" inputmode="numeric" maxlength="6" placeholder="123456"
                     style="width:100%;max-width:100%;padding:13px 14px;border:1px solid #cbd5e1;border-radius:12px;font-size:20px;letter-spacing:6px;font-weight:700;text-align:center;box-sizing:border-box;margin-bottom:8px;">
              
              <label style="display:block;font-size:12px;font-weight:700;color:#475569;margin-bottom:6px;letter-spacing:0.4px;">CONFIRM CODE</label>
              <input id="sbw-q2" type="text" inputmode="numeric" maxlength="6" placeholder="123456"
                     style="width:100%;max-width:100%;padding:13px 14px;border:1px solid #cbd5e1;border-radius:12px;font-size:20px;letter-spacing:6px;font-weight:700;text-align:center;box-sizing:border-box;">
            </div>

            <div id="sbw-q-hint" style="margin:8px 0 4px;font-size:12.5px;color:#64748b;line-height:1.35;">
              Leave both fields blank if you don't want to set one right now.
            </div>

            <div style="display:flex;gap:10px;margin-top:14px;">
              <button id="sbw-back-2" type="button"
                      style="flex:1;padding:12px 16px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;font-weight:700;font-size:14px;color:#475569;cursor:pointer;">
                Back
              </button>
              <button id="sbw-next-2" type="button"
                      style="flex:2;padding:12px 18px;border-radius:12px;border:none;background:#0f172a;color:#fff;font-weight:800;font-size:14.5px;cursor:pointer;">
                Continue
              </button>
            </div>
          </div>

          <!-- STEP 3: Gender -->
          <div id="sbw-step-3" class="sbw-step" style="display:none;">
            <div style="text-align:center;margin-bottom:14px;">
              <h2 style="margin:0 0 6px;font-size:19px;font-weight:900;color:#0f172a;letter-spacing:-0.02em;">How do you identify?</h2>
              <p style="margin:0;font-size:13.5px;color:#64748b;">This is stored only on this device and is never sent to any server.</p>
            </div>

            <div style="display:flex;gap:10px;margin:16px 0 8px;">
              <div id="sbw-gender-male" data-gender="male"
                   style="flex:1;padding:16px 10px;border:2px solid #e2e8f0;background:#fff;border-radius:16px;text-align:center;cursor:pointer;transition:all .1s ease;">
                <div style="font-size:26px;line-height:1;margin-bottom:4px;">♂</div>
                <div style="font-size:14.5px;font-weight:800;color:#334155;">Male</div>
              </div>
              <div id="sbw-gender-female" data-gender="female"
                   style="flex:1;padding:16px 10px;border:2px solid #e2e8f0;background:#fff;border-radius:16px;text-align:center;cursor:pointer;transition:all .1s ease;">
                <div style="font-size:26px;line-height:1;margin-bottom:4px;">♀</div>
                <div style="font-size:14.5px;font-weight:800;color:#334155;">Female</div>
              </div>
            </div>

            <div style="display:flex;gap:10px;margin-top:16px;">
              <button id="sbw-back-3" type="button"
                      style="flex:1;padding:12px 16px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;font-weight:700;font-size:14px;color:#475569;cursor:pointer;">
                Back
              </button>
              <button id="sbw-save" type="button"
                      style="flex:2;padding:12px 18px;border-radius:12px;border:none;background:#0f172a;color:#fff;font-weight:800;font-size:14.5px;cursor:pointer;">
                Save my details
              </button>
            </div>

            <div style="margin-top:12px;text-align:center;font-size:10.5px;color:#94a3b8;font-weight:600;">
              You can change these later in Settings
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // === Wizard State ===
    let currentStep = 1;
    let selectedGender = storedGender;

    const progressEl = modal.querySelector("#sbw-progress");
    const step1 = modal.querySelector("#sbw-step-1");
    const step2 = modal.querySelector("#sbw-step-2");
    const step3 = modal.querySelector("#sbw-step-3");

    function showStep(step) {
      currentStep = step;
      step1.style.display = step === 1 ? "block" : "none";
      step2.style.display = step === 2 ? "block" : "none";
      step3.style.display = step === 3 ? "block" : "none";

      if (progressEl) {
        progressEl.textContent = `${step} of 3`;
      }

      // Focus logic
      if (step === 1) {
        setTimeout(() => modal.querySelector("#sbw-name")?.focus(), 50);
      }
      if (step === 2) {
        setTimeout(() => modal.querySelector("#sbw-q1")?.focus(), 50);
      }
    }

    // === Gender UI (Step 3) ===
    const maleEl = modal.querySelector("#sbw-gender-male");
    const femaleEl = modal.querySelector("#sbw-gender-female");

    function updateGenderUI() {
      if (!maleEl || !femaleEl) return;

      const isMale = selectedGender === "male";
      const isFemale = selectedGender === "female";

      maleEl.style.border = isMale ? "2px solid #3b82f6" : "2px solid #e2e8f0";
      maleEl.style.background = isMale ? "#eff6ff" : "#fff";
      maleEl.querySelector("div:last-child").style.color = isMale ? "#1e40af" : "#334155";

      femaleEl.style.border = isFemale ? "2px solid #ec4899" : "2px solid #e2e8f0";
      femaleEl.style.background = isFemale ? "#fdf2f8" : "#fff";
      femaleEl.querySelector("div:last-child").style.color = isFemale ? "#9d174d" : "#334155";
    }

    maleEl?.addEventListener("click", () => {
      selectedGender = "male";
      updateGenderUI();
    });
    femaleEl?.addEventListener("click", () => {
      selectedGender = "female";
      updateGenderUI();
    });
    updateGenderUI();

    // === Input sanitization for quick login (Step 2) ===
    const q1 = modal.querySelector("#sbw-q1");
    const q2 = modal.querySelector("#sbw-q2");
    const qHint = modal.querySelector("#sbw-q-hint");

    function sanitizeQuick(el) {
      if (el) el.value = digitsOnly(el.value);
    }
    q1?.addEventListener("input", () => sanitizeQuick(q1));
    q2?.addEventListener("input", () => sanitizeQuick(q2));

    // === Navigation Buttons ===
    const next1 = modal.querySelector("#sbw-next-1");
    const nameInput = modal.querySelector("#sbw-name");
    const nameHint = modal.querySelector("#sbw-name-hint");

    next1?.addEventListener("click", () => {
      const name = (nameInput?.value || "").trim();
      if (!name) {
        if (nameHint) nameHint.style.display = "block";
        nameInput?.focus();
        return;
      }
      if (nameHint) nameHint.style.display = "none";
      showStep(2);
    });

    // Allow Enter on name field
    nameInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        next1?.click();
      }
    });

    const back2 = modal.querySelector("#sbw-back-2");
    const next2 = modal.querySelector("#sbw-next-2");

    back2?.addEventListener("click", () => showStep(1));
    next2?.addEventListener("click", () => showStep(3));

    // Enter support on step 2
    [q1, q2].forEach(input => {
      input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          next2?.click();
        }
      });
    });

    const back3 = modal.querySelector("#sbw-back-3");
    const saveBtn = modal.querySelector("#sbw-save");

    back3?.addEventListener("click", () => showStep(2));

    // === Final Save ===
    saveBtn?.addEventListener("click", async () => {
      // Save name (from step 1)
      const finalName = (nameInput?.value || "").trim();
      if (finalName) {
        localStorage.setItem(NAME_KEY, finalName);
      }

      // Save gender
      if (selectedGender === "male" || selectedGender === "female") {
        saveGender(selectedGender);
      }

      // Save quick login code if both fields are filled and match
      const code1 = digitsOnly(q1?.value || "");
      const code2 = digitsOnly(q2?.value || "");

      if (code1.length === 6 && code2.length === 6 && code1 === code2) {
        try {
          const hash = await sha256(code1);
          localStorage.setItem(QUICK_LOGIN_HASH_KEY, hash);
          localStorage.setItem(QUICK_LOGIN_ENABLED_KEY, "true");
        } catch (e) {}
      }

      closeModal(true);
    });

    // Global keyboard handling
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal(false);
      }
    });

    // Start on the appropriate step (could be 1, 2, or 3 depending on what's missing)
    const initialStep = (startStep >= 1 && startStep <= 3) ? startStep : 1;
    showStep(initialStep);

    return modal;
  }

  function closeModal(saved = false) {
    if (!modal) return;
    modal.style.transition = "opacity 0.2s ease";
    modal.style.opacity = "0";
    setTimeout(() => {
      if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
      modal = null;

      // Optional event for other scripts
      try {
        window.dispatchEvent(new CustomEvent("studybase:login-welcome-complete", {
          detail: { saved }
        }));
      } catch (_) {}
    }, 180);
  }

  function checkAndShow() {
    if (window.location.hash !== TRIGGER_HASH) return;
    if (document.getElementById("sb-login-welcome-modal")) return; // already open

    cleanHash();

    const startStep = getMissingSetupStep();
    if (!startStep) {
      // User already has name + quick login + gender saved → don't bother them
      return;
    }

    // Small delay so the page feels settled
    setTimeout(() => {
      createModal(startStep);
    }, 40);
  }

  // Run immediately + on hash change (in case)
  function init() {
    checkAndShow();

    window.addEventListener("hashchange", () => {
      if (window.location.hash === TRIGGER_HASH) {
        checkAndShow();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for debugging
  window.StudyBaseLoginWelcome = { show: () => createModal() };
})();
