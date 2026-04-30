document.addEventListener("DOMContentLoaded", () => {
  // 1. Check for the query parameter ?source=fromold
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get("source") === "fromold") {
    
    // 2. Instantly remove 'source=fromold' from the URL without reloading!
    urlParams.delete("source");
    
    // Reconstruct the URL (keeps other parameters if they exist, otherwise clears the '?')
    const newSearch = urlParams.toString() ? '?' + urlParams.toString() : '';
    const newUrl = window.location.pathname + newSearch + window.location.hash;
    
    // Silently update the address bar
    history.replaceState(null, '', newUrl);

    // 3. Lock the background site
    document.body.style.overflow = "hidden";

    // 4. Inject custom CSS for confetti and animations
    const style = document.createElement("style");
    style.id = "migration-styles";
    style.innerHTML = `
      @keyframes confetti-fall {
        0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
      }
      .confetti-piece {
        position: absolute;
        top: -10vh;
        width: 10px;
        height: 10px;
        border-radius: 3px;
        animation: confetti-fall linear infinite;
        z-index: 10000;
      }
      .scene {
        transition: opacity 0.6s ease-in-out, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
    `;
    document.head.appendChild(style);

    // 5. Create the master overlay
    const overlay = document.createElement("div");
    overlay.id = "migration-overlay";
    overlay.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl opacity-0 transition-opacity duration-700 p-4 pointer-events-auto";

    // 6. Build the UI with 3 separate scenes
    overlay.innerHTML = `
      <div id="confetti-container" class="absolute inset-0 pointer-events-none overflow-hidden"></div>

      <div id="overlay-card" class="relative max-w-2xl w-full h-[400px] bg-slate-900 border border-slate-700/50 rounded-[2rem] shadow-2xl overflow-hidden transform scale-90 transition-all duration-1000 z-[10001] flex flex-col text-center">
        
        <div id="scene-1" class="scene absolute inset-0 flex flex-col items-center justify-center p-8 opacity-0 translate-y-8">
          <div class="w-20 h-20 rounded-full bg-blue-500/20 text-blue-400 mb-6 flex items-center justify-center">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          </div>
          <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-4">
            Welcome to RevisionBase!
          </h1>
          <p class="text-xl text-slate-300">We've officially moved to <strong class="text-white">revisionbase.site</strong></p>
        </div>

        <div id="scene-2" class="scene absolute inset-0 flex flex-col items-center justify-center p-8 opacity-0 translate-y-8 pointer-events-none">
          <h2 class="text-3xl font-bold text-white mb-8">Enjoy a Massively Upgraded Experience</h2>
          <div class="grid grid-cols-3 gap-4 w-full">
            <div class="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 transform hover:scale-105 transition-transform">
              <div class="text-purple-400 text-3xl mb-2">✨</div>
              <h3 class="text-white font-bold">Better UI</h3>
            </div>
            <div class="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 transform hover:scale-105 transition-transform">
              <div class="text-green-400 text-3xl mb-2">⚡</div>
              <h3 class="text-white font-bold">Faster</h3>
            </div>
            <div class="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 transform hover:scale-105 transition-transform">
              <div class="text-amber-400 text-3xl mb-2">📚</div>
              <h3 class="text-white font-bold">More Resources</h3>
            </div>
          </div>
        </div>

        <div id="scene-3" class="scene absolute inset-0 flex flex-col items-center justify-center p-8 opacity-0 translate-y-8 pointer-events-none">
          <div class="text-red-400 text-5xl mb-4">🔖</div>
          <h2 class="text-3xl font-bold text-white mb-4">One Last Thing...</h2>
          <p class="text-lg text-slate-300 mb-8 max-w-md">
            Please <strong>remove your old bookmarks</strong> and save this new URL so you don't lose access!
          </p>
          
          <div id="button-container" class="w-full max-w-sm opacity-0 scale-95 transition-all duration-500">
            <button id="continue-btn" class="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all rounded-xl font-bold text-white text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
              Enter the New RevisionBase
            </button>
          </div>
        </div>

        <div class="absolute bottom-0 left-0 w-full bg-slate-800 h-2">
          <div id="progress-bar" class="bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 h-2 w-0 transition-all duration-[10000ms] ease-linear shadow-[0_0_15px_rgba(56,189,248,0.8)]"></div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // 7. Generate Confetti
    const confettiContainer = document.getElementById("confetti-container");
    const colors = ['#60a5fa', '#22d3ee', '#c084fc', '#f472b6', '#fbbf24']; 
    for (let i = 0; i < 60; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti-piece";
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (Math.random() * 3 + 2) + "s";
      confetti.style.animationDelay = (Math.random() * 5) + "s";
      confettiContainer.appendChild(confetti);
    }

    // 8. Scene Management Helper
    const switchScene = (hideId, showId) => {
      const hideEl = document.getElementById(hideId);
      const showEl = document.getElementById(showId);
      
      if (hideEl) {
        hideEl.classList.remove("opacity-100", "translate-y-0");
        hideEl.classList.add("opacity-0", "-translate-y-8", "pointer-events-none");
      }
      if (showEl) {
        showEl.classList.remove("pointer-events-none", "opacity-0", "translate-y-8");
        showEl.classList.add("opacity-100", "translate-y-0");
      }
    };

    // 9. Master Timeline
    requestAnimationFrame(() => {
      overlay.classList.remove("opacity-0");
      overlay.classList.add("opacity-100");
      document.getElementById("overlay-card").classList.remove("scale-90");
      document.getElementById("overlay-card").classList.add("scale-100");

      requestAnimationFrame(() => {
        document.getElementById("progress-bar").classList.remove("w-0");
        document.getElementById("progress-bar").classList.add("w-full");
      });

      // Show Scene 1
      setTimeout(() => switchScene(null, "scene-1"), 300);
      // Show Scene 2
      setTimeout(() => switchScene("scene-1", "scene-2"), 3500);
      // Show Scene 3
      setTimeout(() => switchScene("scene-2", "scene-3"), 7000);

      // Unlock Button at 10s
      setTimeout(() => {
        const btnContainer = document.getElementById("button-container");
        btnContainer.classList.remove("opacity-0", "scale-95");
        btnContainer.classList.add("opacity-100", "scale-100");
        
        document.getElementById("continue-btn").addEventListener("click", () => {
          overlay.classList.remove("opacity-100");
          overlay.classList.add("opacity-0");
          document.getElementById("overlay-card").classList.remove("scale-100");
          document.getElementById("overlay-card").classList.add("scale-90");
          
          setTimeout(() => {
            overlay.remove();
            document.getElementById("migration-styles").remove();
            document.body.style.overflow = "auto";
          }, 700);
        });
      }, 10000);
    });
  }
});