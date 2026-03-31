(function() {
    const TRIGGER_HASH = "#logged-in";
    const CHECK_INTERVAL = 1000;
    const COOLDOWN_MS = 3000; // 3 seconds
    const STORAGE_KEY = "last_login_reload";

    let checkTimer = null;

    function checkHash() {
        if (window.location.hash === TRIGGER_HASH) {
            const lastReload = localStorage.getItem(STORAGE_KEY);
            const currentTime = Date.now();

            // Only reload if we haven't reloaded in the last 3 seconds
            if (!lastReload || (currentTime - lastReload) > COOLDOWN_MS) {
                
                // Stop the timer
                if (checkTimer) clearInterval(checkTimer);

                // Save current timestamp before reloading
                localStorage.setItem(STORAGE_KEY, currentTime);

                // Reload the page
                window.location.reload();
            }
        }
    }

    checkTimer = setInterval(checkHash, CHECK_INTERVAL);
    checkHash();
})();