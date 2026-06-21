(function () {
    function releaseScrollLock() {
        document.documentElement.classList.remove('sb-consent-pending');
        document.body?.classList.remove('overflow-hidden');
    }

    if (localStorage.getItem('site_consent_granted') === 'true') {
        releaseScrollLock();
        return;
    }

    document.documentElement.classList.add('sb-consent-pending');

    if (!document.getElementById('sb-consent-pending-style')) {
        const style = document.createElement('style');
        style.id = 'sb-consent-pending-style';
        style.textContent = `
            html.sb-consent-pending,
            html.sb-consent-pending body {
                overflow: hidden !important;
            }
        `;
        document.head.appendChild(style);
    }

    function initialiseConsent() {
        if (window.StudyBaseConsent?.init) {
            window.StudyBaseConsent.init();
            return true;
        }
        return false;
    }

    if (initialiseConsent()) return;

    const loader = document.createElement('script');
    loader.src = '/assets/js/privacy/cookieConsent.js';
    loader.defer = true;
    loader.dataset.sbConsentLoader = 'true';
    loader.addEventListener('load', () => {
        if (!initialiseConsent()) releaseScrollLock();
    }, { once: true });
    loader.addEventListener('error', releaseScrollLock, { once: true });
    document.head.appendChild(loader);

    // Consent must never leave the site unusable if the dialog script fails.
    window.setTimeout(() => {
        if (!document.getElementById('sb-consent-modal')) releaseScrollLock();
    }, 5000);
})();
