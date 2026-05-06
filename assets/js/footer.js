/**
 * Site-wide global footer injection.
 * Paper-first A-Level footer and pre-footer.
 */

function escapeFooterHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

async function getFooterConfig() {
    if (window.SiteConfig && window.SiteConfig.ready) {
        return window.SiteConfig.ready;
    }

    return window.SB_CONFIG || {
        brand: {
            name: "RevisionBase",
            suffix: ".site",
            displayName: "RevisionBase.site",
            tagline:
                "A paper-first A-Level revision service for finding past papers, marking with purpose and using focused tools to improve the next attempt."
        },
        urls: {
            home: "/index.html"
        },
        icons: {
            footer: "/assets/siteIcons/main.ico"
        }
    };
}

function getFooterBrandTitle(config) {
    const brand = config.brand || {};
    const name = brand.name || brand.shortName || "RevisionBase";
    let suffix = brand.suffix || "";
    const displayName = brand.displayName || `${name}${suffix}`;

    if (!suffix && displayName.startsWith(name)) {
        suffix = displayName.slice(name.length);
    }

    return `${escapeFooterHtml(name)}${suffix ? `<span class="text-blue-400">${escapeFooterHtml(suffix)}</span>` : ""}`;
}

async function injectGlobalFooter() {
    const siteConfig = await getFooterConfig();
    const footerConfig = siteConfig.footer || {};
    if (footerConfig.enabled === false) return;

    const brand = siteConfig.brand || {};
    const icons = siteConfig.icons || {};
    const urls = siteConfig.urls || {};
    const brandDisplayName = brand.displayName || brand.name || "RevisionBase";
    const brandName = brand.name || brand.shortName || "RevisionBase";
    const brandTitle = getFooterBrandTitle(siteConfig);
    const brandTagline =
        brand.tagline ||
        "A paper-first A-Level revision service for finding past papers, marking with purpose and using focused tools to improve the next attempt.";
    const footerIcon = icons.footer || icons.favicon || "/assets/siteIcons/main.ico";
    const homeUrl = urls.home || "/index.html";
    const cycleStartMonth = Number.isFinite(Number(footerConfig.cycleStartMonth))
        ? Math.max(0, Math.min(11, Number(footerConfig.cycleStartMonth)))
        : 6;
    const cycleYear = new Date().getMonth() >= cycleStartMonth ? new Date().getFullYear() + 1 : new Date().getFullYear();

    const preFooters = [
        `
        <section class="sb-prefooter py-20 bg-white border-t border-slate-200 font-sans">
            <div class="max-w-7xl mx-auto px-6">
                <div class="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-center">
                    <div>
                        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-black uppercase tracking-[0.18em]">
                            <i class="fa-solid fa-file-lines text-[10px]"></i>
                            A-Level papers
                        </span>
                        <h2 class="mt-5 text-3xl md:text-5xl font-black tracking-tight text-slate-950">Start your next revision block with the right paper.</h2>
                        <p class="mt-4 max-w-2xl text-slate-600 text-base md:text-lg font-body leading-relaxed">
                            Choose a subject, exam board and year, then open the paper set before moving into marking and targeted revision.
                        </p>
                    </div>
                    <div class="grid sm:grid-cols-3 gap-3">
                        <a href="/past_papers/index.html" class="group rounded-lg border border-slate-200 bg-slate-950 p-5 text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700">
                            <i class="fa-solid fa-magnifying-glass text-blue-200"></i>
                            <h3 class="mt-4 font-black">Find papers</h3>
                            <p class="mt-2 text-sm text-slate-300 font-body">Filter A-Level papers fast.</p>
                        </a>
                        <a href="/toolkit/paperTracker.html" class="group rounded-lg border border-slate-200 bg-white p-5 text-slate-900 transition-all hover:-translate-y-0.5 hover:border-blue-300">
                            <i class="fa-solid fa-chart-simple text-teal-700"></i>
                            <h3 class="mt-4 font-black">Track marks</h3>
                            <p class="mt-2 text-sm text-slate-600 font-body">Turn scores into progress.</p>
                        </a>
                        <a href="/toolkit/index.html" class="group rounded-lg border border-slate-200 bg-white p-5 text-slate-900 transition-all hover:-translate-y-0.5 hover:border-blue-300">
                            <i class="fa-solid fa-screwdriver-wrench text-violet-700"></i>
                            <h3 class="mt-4 font-black">Revise gaps</h3>
                            <p class="mt-2 text-sm text-slate-600 font-body">Use tools after marking.</p>
                        </a>
                    </div>
                </div>
            </div>
        </section>
        `,
        `
        <section class="sb-prefooter py-20 bg-slate-950 border-t border-slate-900 text-white font-sans relative overflow-hidden">
            <div class="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
            <div class="max-w-7xl mx-auto px-6 relative">
                <div class="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
                    <div class="max-w-3xl">
                        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 border border-white/15 text-white/75 text-[11px] font-black uppercase tracking-[0.18em]">
                            <i class="fa-solid fa-calendar-check text-[10px]"></i>
                            ${cycleYear} exam cycle
                        </span>
                        <h2 class="mt-5 text-3xl md:text-5xl font-black tracking-tight">Practise, mark, then revise with evidence.</h2>
                        <p class="mt-4 text-slate-300 text-base md:text-lg font-body leading-relaxed">
                            ${escapeFooterHtml(brandName)} is built around the paper loop: find the right A-Level paper, attempt it properly, mark it, then use the toolkit to fix the weak spots.
                        </p>
                    </div>
                    <a href="/past_papers/index.html" class="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-slate-950 font-black hover:bg-blue-50 transition-colors">
                        Open Past Papers <i class="fa-solid fa-arrow-right text-xs"></i>
                    </a>
                </div>
            </div>
        </section>
        `,
        `
        <section class="sb-prefooter py-20 bg-slate-50 border-t border-slate-200 font-sans">
            <div class="max-w-7xl mx-auto px-6">
                <div class="grid lg:grid-cols-[1fr_0.9fr] gap-8 items-center">
                    <div>
                        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-violet-50 border border-violet-100 text-violet-700 text-[11px] font-black uppercase tracking-[0.18em]">
                            <i class="fa-solid fa-database text-[10px]"></i>
                            Resource database
                        </span>
                        <h2 class="mt-5 text-3xl md:text-5xl font-black tracking-tight text-slate-950">Need more than the paper?</h2>
                        <p class="mt-4 max-w-2xl text-slate-600 text-base md:text-lg font-body leading-relaxed">
                            The resource database stays available for specifications, notes, links and wider A-Level revision materials.
                        </p>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-3 lg:justify-end">
                        <a href="/resource_database/index.html#primary-access" class="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3 text-white font-black hover:bg-violet-700 transition-colors">
                            Browse Resources <i class="fa-solid fa-arrow-right text-xs"></i>
                        </a>
                        <a href="/past_papers/index.html" class="inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-slate-200 px-6 py-3 text-slate-900 font-black hover:border-violet-300 transition-colors">
                            Find Papers <i class="fa-solid fa-file-lines text-xs"></i>
                        </a>
                    </div>
                </div>
            </div>
        </section>
        `
    ];

    let randomPreFooter = "";
    if (footerConfig.preFooterEnabled !== false) {
        randomPreFooter = footerConfig.randomizePreFooter === false
            ? preFooters[0]
            : preFooters[Math.floor(Math.random() * preFooters.length)];
    }

    const mainFooterHTML = `
    <footer class="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 font-sans relative overflow-hidden">
        <div class="absolute inset-0 opacity-[0.14] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div class="max-w-7xl mx-auto px-6 relative">
            <div class="grid grid-cols-1 lg:grid-cols-[1.25fr_2fr] gap-12 mb-12">
                <div>
                    <a href="${escapeFooterHtml(homeUrl)}" class="inline-flex items-center gap-3 text-white">
                        <img src="${escapeFooterHtml(footerIcon)}" alt="${escapeFooterHtml(brandDisplayName)} logo" class="w-9 h-9 rounded-md bg-white shadow-sm">
                        <span class="text-2xl font-black tracking-tight">${brandTitle}</span>
                    </a>
                    <p class="mt-5 text-sm leading-relaxed max-w-md text-slate-500 font-body">
                        ${escapeFooterHtml(brandTagline)}
                    </p>
                    <div class="mt-6 inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span class="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">${cycleYear} exam cycle</span>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h4 class="font-black mb-5 text-white uppercase text-xs tracking-widest">Papers</h4>
                        <ul class="space-y-3 text-sm font-medium font-body">
                            <li><a href="/past_papers/index.html" class="hover:text-blue-300 transition-colors">Past Paper Finder</a></li>
                            <li><a href="/toolkit/paperTracker.html" class="hover:text-blue-300 transition-colors">Paper Tracker</a></li>
                            <li><a href="/subjects/index.html" class="hover:text-blue-300 transition-colors">Subject Guides</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="font-black mb-5 text-white uppercase text-xs tracking-widest">Toolkit</h4>
                        <ul class="space-y-3 text-sm font-medium font-body">
                            <li><a href="/toolkit/index.html" class="hover:text-teal-300 transition-colors">All Tools</a></li>
                            <li><a href="/toolkit/focusRoom.html" class="hover:text-teal-300 transition-colors">Focus Room</a></li>
                            <li><a href="/toolkit/flashcards.html" class="hover:text-teal-300 transition-colors">Flashcards</a></li>
                            <li><a href="/toolkit/timetable.html" class="hover:text-teal-300 transition-colors">Timetable</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="font-black mb-5 text-white uppercase text-xs tracking-widest">Resources</h4>
                        <ul class="space-y-3 text-sm font-medium font-body">
                            <li><a href="/resource_database/index.html#primary-access" class="hover:text-violet-300 transition-colors">Database</a></li>
                            <li><a href="/blogs/index.html" class="hover:text-violet-300 transition-colors">Journal</a></li>
                            <li><a href="/study_pages/ucasHub.html" class="hover:text-violet-300 transition-colors">UCAS Hub</a></li>
                            <li><a href="/study_pages/aoGuide.html" class="hover:text-violet-300 transition-colors">Assessment Objectives</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="font-black mb-5 text-white uppercase text-xs tracking-widest">Platform</h4>
                        <ul class="space-y-3 text-sm font-medium font-body">
                            <li><a href="/legal/index.html#privacy" class="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="/legal/index.html#terms" class="hover:text-white transition-colors">Terms & Conditions</a></li>
                            <li><a href="/legal/contributions.html" class="hover:text-white transition-colors">Contributions</a></li>
                            <li><a href="/contact.html" class="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="pt-8 border-t border-slate-800/70 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                <p>&copy; <span data-rb-year>${cycleYear}</span> ${escapeFooterHtml(brandDisplayName)}</p>
                <div class="flex flex-wrap items-center justify-center gap-4">
                    <a href="/past_papers/index.html" class="hover:text-blue-300 transition-colors">A-Level Papers</a>
                    <a href="/toolkit/index.html" class="hover:text-teal-300 transition-colors">Toolkit</a>
                    <a href="/resource_database/index.html#primary-access" class="hover:text-violet-300 transition-colors">Resources</a>
                </div>
            </div>
        </div>
    </footer>
    `;

    const fullInjectedContent = randomPreFooter + mainFooterHTML;
    const existingFooter = document.querySelector("footer");
    if (existingFooter) {
        existingFooter.remove();
    }
    document.body.insertAdjacentHTML("beforeend", fullInjectedContent);

    document.querySelectorAll("[data-rb-year]").forEach((el) => {
        el.textContent = cycleYear;
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectGlobalFooter);
} else {
    injectGlobalFooter();
}
