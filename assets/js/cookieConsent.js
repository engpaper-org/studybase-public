let LOG_URL = 'https://script.google.com/macros/s/AKfycbyW-AQ4JeYOMujbXToocpkXPH_GMYxhJTqViDOkoPyXYrpcaMvFuxnVjtWQx-ot6T3L/exec';
let POLICY_URL = 'https://revisionbase.site/legal';
let GOOGLE_TAG_ID = 'G-N7LHC0S1T1';

if (window.SiteConfig && window.SiteConfig.ready) {
    window.SiteConfig.ready.then((config) => {
        LOG_URL = config?.endpoints?.consentLog || LOG_URL;
        POLICY_URL = config?.urls?.privacy || POLICY_URL;
        GOOGLE_TAG_ID = config?.analytics?.googleTagId || GOOGLE_TAG_ID;
    });
}

async function acceptAll() {
    const btn = document.getElementById('accept-btn');
    const btnText = document.getElementById('btn-text');
    const loader = document.getElementById('btn-loader');
    
    btn.disabled = true;
    btnText.classList.add('opacity-0');
    loader.classList.remove('hidden');

    let uid = localStorage.getItem('consent_uid') || 'uid_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('consent_uid', uid);

    // Update Google Consent Mode v2
    gtag('consent', 'update', {
        'ad_storage': 'granted', 'ad_user_data': 'granted',
        'ad_personalization': 'granted', 'analytics_storage': 'granted'
    });

    // Refresh Google Config immediately
    gtag('config', GOOGLE_TAG_ID, { 'update': true });

    localStorage.setItem('site_consent_granted', 'true');

    try {
        await fetch(LOG_URL, {
            method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
            userId: uid,
            consent: 'CORPORATE_AUTH_2026',
            page: window.location.href, 
            userAgent: navigator.userAgent
            })
        });
        setTimeout(() => { location.reload(); }, 500);
    } catch (err) {
        location.reload();
    }
}

window.addEventListener('load', () => {
    if (typeof SHOW_CONSENT_BANNER !== "undefined" && SHOW_CONSENT_BANNER === false) {
        return;
    }

    if (!localStorage.getItem('site_consent_granted')) {

    const banner = document.createElement('div');
    banner.className = `
        fixed bottom-0 left-0 w-full 
        bg-white border-t border-slate-200 
        shadow-[0_-10px_30px_rgba(0,0,0,0.15)] 
        z-[100000]
        max-h-[20vh]
        overflow-y-auto
        transition-all duration-300
    `;

    banner.innerHTML = `
        <div class="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
            
            <div class="flex-1 text-sm text-slate-600 leading-snug">
                <span class="font-bold text-slate-800">Consent Required.</span>
                We use cookies and local storage to maintain security, analyse usage, 
                and confirm compliance with our full Terms of Use and Privacy Policy.
                Continued access requires acceptance.
                <a href="${POLICY_URL}" target="_blank" class="text-blue-600 font-semibold hover:underline ml-1">
                    View Policy
                </a>
            </div>

            <div class="flex-shrink-0">
                <button 
                    id="accept-btn" 
                    onclick="acceptAll()" 
                    class="relative bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition active:scale-95 disabled:opacity-70 text-sm shadow-md"
                >
                    <span id="btn-text">I Agree</span>
                    <div id="btn-loader" class="hidden absolute inset-0 flex items-center justify-center">
                        <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z">
                            </path>
                        </svg>
                    </div>
                </button>
            </div>

        </div>
    `;

    document.body.appendChild(banner);
}
});
