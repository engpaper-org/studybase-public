(function() {
    // Configuration
    window.CurrentScriptVersions = window.CurrentScriptVersions || {};
    window.CurrentScriptVersions['loginAnimationCheck'] = '1.0.0';

    var TRIGGER_HASH = "#logged-in";
    var ANIMATION_PATH = "/myaccount/settings.html?from=login"; 
    var CHECK_INTERVAL = 1000; // Check every 1 second

    let checkTimer = null;

    function checkHash() {
        // 1. Check if the specific hash is present
        if (window.location.hash === TRIGGER_HASH) {
            
            // 2. Stop checking immediately so it doesn't loop
            if (checkTimer) clearInterval(checkTimer);

            // 3. Clean the URL (remove #logged-in)
            history.replaceState(null, null, window.location.pathname + window.location.search);

            // 4. Launch the Animation
            playAnimation();
        }
    }

    function playAnimation() {
        // Create the iframe
        var iframe = document.createElement('iframe');
        iframe.src = ANIMATION_PATH;
        iframe.id = 'gcse-welcome-frame';
        
        // Style it to cover the WHOLE screen
        Object.assign(iframe.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            border: 'none',
            zIndex: '2147483647', // Max integer value
            backgroundColor: '#ffffff',
            transition: 'opacity 0.5s ease'
        });

        // Inject into the page
        document.body.appendChild(iframe);

        // 5. Listen for the 'animation_complete' signal
        window.addEventListener('message', function(event) {
            if (event.data === 'animation_complete') {
                iframe.style.opacity = '0';
                setTimeout(() => {
                    iframe.remove();
                }, 500);
            }
        }, { once: true });
    }

    // Start the interval loop
    checkTimer = setInterval(checkHash, CHECK_INTERVAL);

    // Also run one immediate check in case it's already there
    checkHash();

})();