(function () {
    if (localStorage.getItem('site_consent_granted') === 'true') {
        document.documentElement.classList.remove('sb-consent-pending');
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
})();
