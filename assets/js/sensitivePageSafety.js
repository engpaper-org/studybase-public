(function () {
  function initSensitivePageSafety(options) {
    const config = Object.assign(
      {
        exitUrl: "https://www.google.com/",
        fallbackUrl: "/index.html",
        popupTitle: "Quick exit is available",
        popupBody:
          "If you need to leave this page quickly, press Esc three times to switch away straight away.",
        exitLabel: "Leave now",
        stayLabel: "Stay on page",
        escWindowMs: 4500,
      },
      options || {}
    );

    if (document.getElementById("support-quick-exit-btn")) {
      return;
    }

    let escTimes = [];
    let exited = false;
    let redirectTimers = [];

    function clearRedirectTimers() {
      redirectTimers.forEach(function (timer) {
        window.clearTimeout(timer);
      });
      redirectTimers = [];
    }

    function hideSensitiveContent() {
      dismissPopup();

      if (document.getElementById("support-exit-cover")) {
        return;
      }

      const cover = document.createElement("div");
      cover.id = "support-exit-cover";
      cover.className = "support-exit-cover";
      document.body.appendChild(cover);
    }

    function forceNavigation(url) {
      try {
        window.location.replace(url);
      } catch (error) {
        // Fall through to the next method.
      }

      try {
        window.location.assign(url);
      } catch (error) {
        // Fall through to the next method.
      }

      try {
        window.location.href = url;
      } catch (error) {
        // Ignore and allow later fallbacks.
      }
    }

    function clickNavigationLink(url) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_self";
      link.rel = "noreferrer noopener";
      link.className = "support-sr-only";
      document.body.appendChild(link);
      link.click();
      window.setTimeout(function () {
        link.remove();
      }, 50);
    }

    function quickExit() {
      if (exited) {
        return;
      }

      exited = true;
      hideSensitiveContent();
      clearRedirectTimers();

      forceNavigation(config.exitUrl);

      redirectTimers.push(
        window.setTimeout(function () {
          forceNavigation(config.exitUrl);
        }, 120)
      );

      redirectTimers.push(
        window.setTimeout(function () {
          clickNavigationLink(config.exitUrl);
        }, 220)
      );

      redirectTimers.push(
        window.setTimeout(function () {
          forceNavigation(config.fallbackUrl);
        }, 900)
      );
    }

    function dismissPopup() {
      const popup = document.getElementById("support-safety-popup");
      if (popup) {
        popup.remove();
      }
    }

    function showPopup() {
      const popup = document.createElement("div");
      popup.id = "support-safety-popup";
      popup.className = "support-safety-backdrop";
      popup.innerHTML = [
        '<div class="support-safety-dialog p-7 md:p-8 support-animate-enter">',
        '  <div class="flex items-start gap-4 mb-5">',
        '    <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">',
        '      <i class="fa-solid fa-person-shelter text-xl"></i>',
        "    </div>",
        "    <div>",
        '      <p class="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-600 mb-2">Sensitive support page</p>',
        '      <h2 class="text-2xl font-black text-slate-900 leading-tight">' + config.popupTitle + "</h2>",
        "    </div>",
        "  </div>",
        '  <p class="text-slate-600 leading-7 mb-5">' + config.popupBody + "</p>",
        '  <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 mb-6">',
        '    <div class="flex items-center gap-3 text-slate-700 font-bold">',
        '      <span class="support-kbd">Esc</span>',
        '      <span class="support-kbd">Esc</span>',
        '      <span class="support-kbd">Esc</span>',
        '      <span class="text-sm font-semibold text-slate-500">Press three times to leave quickly</span>',
        "    </div>",
        "  </div>",
        '  <div class="flex flex-col sm:flex-row gap-3">',
        '    <button type="button" id="support-safety-stay" class="flex-1 rounded-2xl border border-slate-200 bg-white text-slate-700 px-5 py-3.5 font-bold hover:bg-slate-50 transition-colors">' +
          config.stayLabel +
          "</button>",
        '    <button type="button" id="support-safety-exit" class="flex-1 rounded-2xl bg-slate-900 text-white px-5 py-3.5 font-bold hover:bg-slate-800 transition-colors">' +
          config.exitLabel +
          "</button>",
        "  </div>",
        "</div>",
      ].join("");

      popup.addEventListener("click", function (event) {
        if (event.target === popup) {
          dismissPopup();
        }
      });

      document.body.appendChild(popup);

      const stayBtn = document.getElementById("support-safety-stay");
      const exitBtn = document.getElementById("support-safety-exit");

      if (stayBtn) {
        stayBtn.addEventListener("click", dismissPopup);
        stayBtn.focus();
      }

      if (exitBtn) {
        exitBtn.addEventListener("click", quickExit);
      }
    }

    function createQuickExitButton() {
      const button = document.createElement("button");
      button.id = "support-quick-exit-btn";
      button.type = "button";
      button.className =
        "support-quick-exit rounded-2xl bg-slate-900 text-white px-5 py-3.5 font-bold shadow-[0_18px_40px_rgba(15,23,42,0.22)] hover:bg-slate-800 transition-colors";
      button.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket mr-2"></i>Quick exit';
      button.setAttribute("aria-label", "Leave this page quickly");
      button.addEventListener("click", quickExit);
      document.body.appendChild(button);
    }

    function handleEscape(event) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const now = Date.now();
      escTimes = escTimes.filter(function (time) {
        return now - time < config.escWindowMs;
      });
      escTimes.push(now);

      if (escTimes.length >= 3) {
        quickExit();
      }
    }

    window.addEventListener("keydown", handleEscape, true);

    createQuickExitButton();
    showPopup();
  }

  window.initSensitivePageSafety = initSensitivePageSafety;
})();
