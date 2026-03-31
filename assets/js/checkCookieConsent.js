(function () {
    if (!localStorage.getItem('site_consent_granted')) {

        document.documentElement.style.display = 'none';

        window.addEventListener('DOMContentLoaded', () => {

            const overlay = document.createElement('div');

            // Fully centered layout
            overlay.className = `
                fixed inset-0 z-[99998] 
                bg-[#020617] 
                flex items-center justify-center 
                px-6
            `;

            overlay.innerHTML = `
                <div class="
                    w-full max-w-lg 
                    bg-slate-900 
                    rounded-3xl 
                    border border-white/5 
                    shadow-2xl 
                    p-10 md:p-12 
                    text-center
                ">
                    
                    <div class="mb-8 flex justify-center">
                        <div class="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>

                    <h1 class="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tight">
                        Privacy & Consent Required
                    </h1>

                    <div class="space-y-4 text-slate-400 text-sm leading-relaxed">
                        <p>
                            To ensure security, maintain performance, and comply with UK data protection regulations,
                            we require your consent before enabling full site functionality.
                        </p>
                        <p>
                            Cookies and local storage are used for essential operations, traffic monitoring,
                            and protecting platform integrity.
                        </p>
                    </div>

                    <div class="mt-10 pt-6 border-t border-white/5">
                        <p class="text-[11px] text-blue-400 font-bold uppercase tracking-[0.2em] animate-pulse">
                            Press 'I agree' on the banner bellow to continue
                        </p>
                    </div>

                </div>
            `;

            document.body.appendChild(overlay);
            document.documentElement.style.display = 'block';
        });
    }
})();