(function() {
    // 1. Check and Decode Logic
    window.CurrentScriptVersions = window.CurrentScriptVersions || {};
    window.CurrentScriptVersions['checkVerification'] = '1.0.0';

    var params = new URLSearchParams(window.location.search);
    var materialID = params.get('material-ID');

    if (!materialID) return;

    try {
        var decoded = atob(materialID);
        
        // Check verification status
        if (decoded.includes('-v-')) {
            // VERIFIED CONFIG
            triggerPopup({
                type: 'verified',
                color: '#2196F3', // Blue
                title: 'Verified Resource',
                message: 'This resource has been verified by the RevisionBase.site team, meaning limited ad interruptions and a safer service.',
                iconSVG: '<polyline points="20 6 9 17 4 12"></polyline>' // Checkmark
            });
        } else {
            // UNVERIFIED CONFIG
            triggerPopup({
                type: 'warning',
                color: '#FF9800', // Amber/Orange
                title: 'Unverified Resource',
                message: 'This resource has NOT been verified by the RevisionBase.site team. Proceed with caution as checks are incomplete.',
                iconSVG: '<line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' // Exclamation
            });
        }
    } catch (e) {
        // Invalid Base64 - do nothing
    }

    function triggerPopup(config) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => createPopup(config));
        } else {
            createPopup(config);
        }
    }

    // 2. Popup Creation Function
    function createPopup(config) {
        // --- CSS Styles ---
        var style = document.createElement('style');
        style.innerHTML = `
            #gh-status-popup {
                position: fixed;
                top: -150px; /* Hidden initially */
                left: 50%;
                transform: translateX(-50%);
                width: auto;
                max-width: 90%;
                min-width: 320px;
                background: #ffffff;
                border-radius: 50px; /* Fully rounded pill shape */
                box-shadow: 0 8px 20px rgba(0,0,0,0.12);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                z-index: 10000;
                overflow: hidden;
                transition: top 0.6s cubic-bezier(0.22, 1, 0.36, 1);
                border: 1px solid rgba(0,0,0,0.05);
                display: flex;
                flex-direction: column;
            }
            #gh-status-popup.show {
                top: 24px;
            }
            .gh-content {
                display: flex;
                align-items: center;
                padding: 14px 24px 14px 16px;
                gap: 14px;
            }
            .gh-icon {
                flex-shrink: 0;
                width: 28px;
                height: 28px;
                background: ${config.color};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                box-shadow: 0 2px 5px ${config.color}4d; /* 4d = 30% opacity hex */
            }
            .gh-text h4 {
                margin: 0 0 3px 0;
                font-size: 15px;
                color: ${config.color};
                font-weight: 600;
                letter-spacing: -0.3px;
            }
            .gh-text p {
                margin: 0;
                font-size: 12px;
                color: #666;
                line-height: 1.4;
            }
            .gh-progress-container {
                width: 100%;
                height: 4px;
                background: #edf2f7;
            }
            .gh-progress-bar {
                height: 100%;
                background: ${config.color};
                width: 0%;
                transition: width 5s linear;
            }
        `;
        document.head.appendChild(style);

        // --- HTML Structure ---
        var popup = document.createElement('div');
        popup.id = 'gh-status-popup';
        
        popup.innerHTML = `
            <div class="gh-content">
                <div class="gh-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                        ${config.iconSVG}
                    </svg>
                </div>
                <div class="gh-text">
                    <h4>${config.title}</h4>
                    <p>${config.message}</p>
                </div>
            </div>
            <div class="gh-progress-container">
                <div class="gh-progress-bar" id="gh-progress"></div>
            </div>
        `;

        document.body.appendChild(popup);

        // --- Animation Logic ---
        requestAnimationFrame(() => {
            popup.classList.add('show');
            setTimeout(() => {
                var progressBar = document.getElementById('gh-progress');
                if (progressBar) progressBar.style.width = '100%';
            }, 300);
        });

        // Remove after 5 seconds
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                if (popup.parentNode) popup.parentNode.removeChild(popup);
                if (style.parentNode) style.parentNode.removeChild(style);
            }, 600); 
        }, 5300);
    }
})();