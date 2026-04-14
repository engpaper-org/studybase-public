/**
 * StudyBase.site Global Footer Injection
 * Features: Randomized Pre-Footer (1 of 3) and Unified Footer Navigation
 * Updated for the A-Level Premium Aesthetic
 */

function injectGlobalFooter() {
    // 1. Define the 3 different Pre-Footer options (Styled to match the new design)
    const preFooters = [
        // Option A: Focus Room / Productivity
        `
        <section class="sb-prefooter sb-prefooter-light py-24 bg-white border-t border-slate-200 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-[100px] opacity-60 pointer-events-none -mr-20 -mt-20"></div>
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div class="max-w-xl">
                    <span class="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3 block"><i class="fa-solid fa-clock mr-1"></i> Productivity Tool</span>
                    <h2 class="text-3xl md:text-4xl font-black mb-4 text-slate-900 tracking-tight">Struggling to stay focused?</h2>
                    <p class="text-slate-500 text-lg font-body leading-relaxed">Join hundreds of A-Level students in our virtual Focus Room. Designed to minimize distractions and maximize your deep work.</p>
                </div>
                <a href="/toolkit/focusRoom.html" class="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20 whitespace-nowrap hover:-translate-y-1">Enter Focus Room</a>
            </div>
        </section>
        `,
        // Option B: Wellbeing / Mental Health
        `
        <section class="sb-prefooter sb-prefooter-dark py-24 bg-emerald-900 border-t border-emerald-800 relative overflow-hidden text-white">
            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            <div class="absolute top-0 right-0 p-32 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div class="max-w-xl">
                    <span class="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-3 block"><i class="fa-solid fa-leaf mr-1"></i> Mental Health</span>
                    <h2 class="text-3xl md:text-4xl font-black mb-4 tracking-tight">A-Levels are stressful.</h2>
                    <p class="text-emerald-100/80 text-lg font-body leading-relaxed">Don't burn out before the finish line. Explore our wellbeing guides for managing UCAS anxiety and maintaining balance.</p>
                </div>
                <a href="/toolkit/wellbeingHub.html" class="px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-900/50 whitespace-nowrap hover:-translate-y-1">Visit Wellbeing Hub</a>
            </div>
        </section>
        `,
        // Option C: Resource Upsell
        `
        <section class="sb-prefooter sb-prefooter-light py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
            <div class="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-[100px] opacity-40 pointer-events-none -ml-20 -mb-20"></div>
            <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div class="max-w-xl">
                    <span class="text-purple-600 font-bold uppercase tracking-widest text-xs mb-3 block"><i class="fa-solid fa-vault mr-1"></i> Resource Vault</span>
                    <h2 class="text-3xl md:text-4xl font-black mb-4 text-slate-900 tracking-tight">Missing something?</h2>
                    <p class="text-slate-500 text-lg font-body leading-relaxed">Our database is constantly updated with new 2026 predicted papers, A* exemplar essays, and mark schemes.</p>
                </div>
                <a href="/alevel/resources.html#primary-access" class="px-8 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-600/20 whitespace-nowrap hover:-translate-y-1">Browse A-Level Vault</a>
            </div>
        </section>
        `
    ];

    // 2. Select one at random
    const randomPreFooter = preFooters[Math.floor(Math.random() * preFooters.length)];

    // 3. Define the Main Footer (Removed GCSE, added Toolkit)
    const mainFooterHTML = `
    <footer class="bg-slate-950 text-slate-400 py-20 border-t border-slate-900 font-sans relative overflow-hidden">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div class="absolute top-0 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div class="max-w-7xl mx-auto px-6 relative z-10">
            <div class="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
                
                <div class="col-span-2 md:col-span-2 pr-8">
                    <div class="flex items-center gap-2 mb-6 text-white group">
                        <img src="/assets/siteIcons/main.ico" alt="Logo" class="w-8 h-8 rounded shadow-sm group-hover:scale-110 transition-transform">
                        <span class="text-2xl font-black tracking-tighter">StudyBase<span class="text-indigo-500">.site</span></span>
                    </div>
                    <p class="text-sm leading-relaxed max-w-sm mb-8 text-slate-500 font-body">
                        The ultimate open-source revision platform for UK A-Level students. Smart tools, active recall, and university preparation.
                    </p>
                </div>
                
                <div>
                    <h4 class="font-bold mb-6 text-white uppercase text-xs tracking-widest text-indigo-400">A-Level Portal</h4>
                    <ul class="space-y-4 text-sm font-medium font-body">
                        <li><a href="/index.html" class="hover:text-indigo-400 transition-colors">Portal Home</a></li>
                        <li><a href="/resource_database/index.html#primary-access" class="hover:text-indigo-400 transition-colors">Resource Vault</a></li>
                        <li><a href="/study_pages/ucasHub.html" class="hover:text-indigo-400 transition-colors">UCAS & Futures</a></li>
                        <li><a href="/study_pages/aoGuide.html" class="hover:text-indigo-400 transition-colors">Assessment Objectives</a></li>
                        <li><a href="/blogs/index.html" class="hover:text-indigo-400 transition-colors">Revision Insights</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold mb-6 text-white uppercase text-xs tracking-widest text-purple-400">The Toolkit</h4>
                    <ul class="space-y-4 text-sm font-medium font-body">
                        <li><a href="/toolkit.html" class="hover:text-purple-400 transition-colors">View All Tools</a></li>
                        <li><a href="/toolkit/focusRoom.html" class="hover:text-purple-400 transition-colors">The Focus Room</a></li>
                        <li><a href="/toolkit/flashcards.html" class="hover:text-purple-400 transition-colors">Flashcard Builder</a></li>
                        <li><a href="/toolkit/timetable.html" class="hover:text-purple-400 transition-colors">Smart Planner</a></li>
                        <li><a href="/toolkit/ucasCalculator.html" class="hover:text-purple-400 transition-colors">UCAS Calculator</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold mb-6 text-white uppercase text-xs tracking-widest text-slate-300">Platform</h4>
                    <ul class="space-y-4 text-sm font-medium font-body">
                        <li><a href="/faq.html" class="hover:text-white transition-colors">Help Center</a></li>
                        <li><a href="/legal/index.html" class="hover:text-white transition-colors">Privacy & Terms</a></li>
                        <li><a href="/legal/contributions.html" class="hover:text-white transition-colors">Contributions</a></li>
                        <li><a href="/contact.html" class="hover:text-white transition-colors">Contact Us</a></li>
                    </ul>
                </div>

            </div>
            
            <div class="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-widest gap-4 font-body">
                <p>&copy; 2026 StudyBase.site</p>
                <div class="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                    <span class="text-[10px] text-slate-400">Systems Operational</span>
                </div>
            </div>
        </div>
    </footer>
    `;

    // Combine them
    const fullInjectedContent = randomPreFooter + mainFooterHTML;

    // 4. Inject into the page
    const existingFooter = document.querySelector('footer');
    if (existingFooter) {
        existingFooter.remove();
        document.body.insertAdjacentHTML('beforeend', fullInjectedContent);
    } else {
        document.body.insertAdjacentHTML('beforeend', fullInjectedContent);
    }
}

// Execute when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectGlobalFooter);
} else {
    injectGlobalFooter();
}
