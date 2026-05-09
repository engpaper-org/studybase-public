let LOG_URL = 'https://script.google.com/macros/s/AKfycbyW-AQ4JeYOMujbXToocpkXPH_GMYxhJTqViDOkoPyXYrpcaMvFuxnVjtWQx-ot6T3L/exec';
let PRIVACY_URL = '/legal/index.html#privacy';
let TERMS_URL = '/legal/index.html#terms';
let GOOGLE_TAG_ID = 'G-N7LHC0S1T1';

if (window.SiteConfig && window.SiteConfig.ready) {
    window.SiteConfig.ready.then((config) => {
        LOG_URL = config?.endpoints?.consentLog || LOG_URL;
        PRIVACY_URL = config?.urls?.privacy || PRIVACY_URL;
        TERMS_URL = config?.urls?.terms || TERMS_URL;
        GOOGLE_TAG_ID = config?.analytics?.googleTagId || GOOGLE_TAG_ID;
    });
}

function removeConsentModal() {
    const modal = document.getElementById('sb-consent-modal');
    if (modal) modal.remove();
    document.documentElement.classList.remove('sb-consent-pending');
    document.body.classList.remove('overflow-hidden');
}

async function acceptAll() {
    const btn = document.getElementById('accept-btn');
    const btnText = document.getElementById('btn-text');
    const loader = document.getElementById('btn-loader');

    if (!btn || btn.disabled) return;

    btn.disabled = true;
    if (btnText) btnText.classList.add('opacity-0');
    if (loader) loader.classList.remove('hidden');

    const uid = localStorage.getItem('consent_uid') || ('uid_' + Math.random().toString(36).slice(2, 11));
    localStorage.setItem('consent_uid', uid);
    localStorage.setItem('site_consent_granted', 'true');

    if (typeof gtag === 'function') {
        gtag('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'granted'
        });

        gtag('config', GOOGLE_TAG_ID, { update: true });
    }

    try {
        await fetch(LOG_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                userId: uid,
                consent: 'STUDYBASE_CONSENT_2026',
                page: window.location.href,
                userAgent: navigator.userAgent
            })
        });
    } catch (err) {}

    removeConsentModal();
}

function buildConsentModal() {
    if (document.getElementById('sb-consent-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'sb-consent-modal';
    modal.className = 'fixed inset-0 z-[100000] flex items-center justify-center px-4 py-6';
    modal.innerHTML = `
        <div class="absolute inset-0 bg-slate-950/72 backdrop-blur-md"></div>
        <div class="relative w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-[0_40px_120px_rgba(0,0,0,0.45)] overflow-hidden">
            <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300"></div>
            <div class="p-8 md:p-10">
                <div class="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center mb-6">
                    <svg class="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <p class="text-[11px] uppercase tracking-[0.24em] text-blue-200 font-bold mb-4">Consent required</p>
                <h2 class="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-4">Agree to continue to StudyBase.</h2>
                <p class="text-slate-300 text-sm md:text-base leading-relaxed">
                    StudyBase uses local storage for essential site behaviour and may send consent, analytics, account,
                    resource-access and security-verification data as described in the legal centre.
                </p>
                <p class="mt-4 text-slate-400 text-sm leading-relaxed">
                    Continuing means you accept the <a href="${PRIVACY_URL}" class="text-white font-semibold underline decoration-blue-400/70 underline-offset-4">Privacy Policy</a>
                    and <a href="${TERMS_URL}" class="text-white font-semibold underline decoration-blue-400/70 underline-offset-4">Terms &amp; Conditions</a>.
                </p>

                <button
                    id="accept-btn"
                    type="button"
                    onclick="acceptAll()"
                    class="relative mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-blue-500 px-6 py-4 text-base font-black text-white transition hover:bg-blue-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                    <span id="btn-text">Agree</span>
                    <span id="btn-loader" class="hidden absolute inset-0 flex items-center justify-center">
                        <svg class="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" aria-hidden="true">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.documentElement.classList.add('sb-consent-pending');
    document.body.classList.add('overflow-hidden');
}

window.addEventListener('load', () => {
    if (typeof SHOW_CONSENT_BANNER !== 'undefined' && SHOW_CONSENT_BANNER === false) {
        return;
    }

    if (localStorage.getItem('site_consent_granted') === 'true') {
        removeConsentModal();
        return;
    }

    buildConsentModal();
});
