(function () {
    function initNavbar() {
        const faHref = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
        if (!document.querySelector('link[rel="stylesheet"][href*="font-awesome"]')) {
            const faLink = document.createElement("link");
            faLink.rel = "stylesheet";
            faLink.href = faHref;
            document.head.appendChild(faLink);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get("category");
        const isSupport =
            window.location.pathname.includes("support") ||
            categoryParam === "support";

        const navStyles = `
    <style id="sb-navbar-enhanced-styles">
        .sb-nav-wrap {
            position: relative !important;
            z-index: 90 !important;
            width: 100% !important;
            display: block;
            isolation: isolate;
            border-bottom: 1px solid rgba(226,232,240,0.75) !important;
            background:
                radial-gradient(circle at top center, rgba(99,102,241,0.08), transparent 42%),
                linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.92)) !important;
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            box-shadow: 0 8px 24px rgba(15,23,42,0.04);
        }

        #sb-nav-shell {
            position: relative;
            width: 100%;
            margin: 0;
            padding: 0;
            font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif;
        }

        #sb-nav-shell,
        #sb-nav-shell * {
            box-sizing: border-box;
        }

        .sb-nav-inner {
            max-width: 84rem;
            margin: 0 auto;
            padding-left: 1rem;
            padding-right: 1rem;
        }

        @media (min-width: 640px) {
            .sb-nav-inner {
                padding-left: 1.5rem;
                padding-right: 1.5rem;
            }
        }

        @media (min-width: 1024px) {
            .sb-nav-inner {
                padding-left: 2rem;
                padding-right: 2rem;
            }
        }

        .sb-nav-panel {
            min-height: 78px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }

        .sb-nav-content {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding: 0.85rem 0;
        }

        .sb-nav-desktop {
            display: none !important;
            align-items: center;
            gap: 1rem;
        }

        .sb-nav-mobile-toggle {
            display: flex !important;
            align-items: center;
            gap: 0.5rem;
        }

        .sb-mobile-menu-inner {
            padding: 0.75rem 1rem 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .sb-mobile-card h4 {
            font-size: 0.875rem;
            font-weight: 800;
            color: #0f172a;
        }

        .sb-mobile-card p {
            font-size: 0.75rem;
            font-weight: 600;
            color: #64748b;
            margin-top: 0.25rem;
            line-height: 1.4;
        }

        .sb-mobile-card .space-y-2 > * + * {
            margin-top: 0.5rem;
        }

        .sb-mobile-card a {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.8rem;
            border-radius: 1rem;
            padding: 0.85rem 1rem;
            font-size: 0.875rem;
            font-weight: 700;
            color: #334155;
            transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
        }

        .sb-mobile-card a:hover {
            background: rgba(248,250,252,0.95);
            color: #0f172a;
            transform: translateX(2px);
        }

        @media (min-width: 768px) {
            .sb-nav-desktop {
                display: flex !important;
            }

            .sb-nav-mobile-toggle {
                display: none !important;
            }
        }

        .sb-brand {
            display: flex;
            align-items: center;
            gap: 0.85rem;
            min-width: 0;
            border-radius: 1rem;
            padding: 0.3rem 0;
            transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .sb-brand:hover {
            opacity: 0.92;
        }

        .sb-brand-logo-shell {
            position: relative;
            flex-shrink: 0;
        }

        .sb-brand-logo-shell::before {
            content: "";
            position: absolute;
            inset: -6px;
            border-radius: 1.3rem;
            background: radial-gradient(circle, rgba(99,102,241,0.14), transparent 70%);
            pointer-events: none;
        }

        .sb-brand-logo {
            position: relative;
            width: 2.65rem;
            height: 2.65rem;
            border-radius: 1rem;
            object-fit: cover;
            background: white;
            border: 1px solid rgba(226,232,240,0.9);
            box-shadow:
                0 8px 22px rgba(15,23,42,0.08),
                inset 0 1px 0 rgba(255,255,255,0.9);
        }

        .sb-brand-title {
            font-weight: 900;
            font-size: 1.08rem;
            line-height: 1;
            letter-spacing: -0.03em;
            color: #0f172a;
            white-space: nowrap;
        }

        .sb-brand-title span {
            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 55%, #4f46e5 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .sb-brand-subtitle {
            margin-top: 0.32rem;
            font-size: 11px;
            line-height: 1;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #94a3b8;
            white-space: nowrap;
        }

        .sb-nav-links {
            display: flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.2rem;
            border-radius: 1rem;
            background: transparent;
            border: none;
            box-shadow: none;
        }

        .sb-nav-trigger {
            height: 2.75rem;
            padding: 0 1rem;
            border-radius: 0.95rem;
            display: inline-flex;
            align-items: center;
            gap: 0.55rem;
            font-size: 0.875rem;
            font-weight: 800;
            color: #475569;
            transition:
                background-color 0.18s ease,
                color 0.18s ease,
                transform 0.18s ease,
                box-shadow 0.18s ease;
            outline: none;
        }

        .sb-nav-trigger:hover {
            transform: translateY(-1px);
            background: rgba(255,255,255,0.78);
            box-shadow: 0 8px 18px rgba(15,23,42,0.05);
        }

        .sb-nav-trigger i {
            font-size: 10px;
            transition: transform 0.2s ease;
        }

        .sb-nav-trigger-purple:hover {
            color: #7c3aed;
        }

        .sb-nav-trigger-indigo:hover {
            color: #4f46e5;
        }

        .sb-nav-trigger-slate:hover {
            color: #0f172a;
        }

        .sb-mobile-icon-btn {
            width: 2.75rem;
            height: 2.75rem;
            border-radius: 0.95rem;
            border: 1px solid rgba(226,232,240,0.9);
            background: rgba(255,255,255,0.84);
            color: #334155;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 20px rgba(15,23,42,0.05);
            transition: all 0.18s ease;
        }

        .sb-mobile-icon-btn:hover {
            color: #4f46e5;
            border-color: rgba(165,180,252,0.9);
            background: white;
        }

        .sb-floating-menu {
            position: fixed;
            z-index: 80;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.16s ease, transform 0.16s ease;
            transform: translateY(6px);
        }

        .sb-floating-menu.sb-menu-open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
        }

        .sb-dropdown-card {
            border-radius: 1.35rem;
            border: 1px solid rgba(226,232,240,0.85);
            background:
                radial-gradient(circle at top left, rgba(99,102,241,0.06), transparent 32%),
                linear-gradient(180deg, rgba(255,255,255,0.97), rgba(255,255,255,0.94));
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            box-shadow:
                0 24px 60px rgba(15,23,42,0.12),
                inset 0 1px 0 rgba(255,255,255,0.8);
            padding: 0.8rem;
        }

        .sb-dropdown-head {
            padding: 0.45rem 0.7rem 0.75rem;
        }

        .sb-dropdown-title {
            font-size: 0.95rem;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.02em;
        }

        .sb-dropdown-subtitle {
            margin-top: 0.2rem;
            font-size: 0.76rem;
            font-weight: 600;
            color: #64748b;
            line-height: 1.4;
        }

        .sb-dropdown-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.8rem;
            border-radius: 1rem;
            padding: 0.9rem 1rem;
            font-size: 0.9rem;
            font-weight: 700;
            color: #334155;
            transition:
                background-color 0.18s ease,
                color 0.18s ease,
                transform 0.18s ease;
        }

        .sb-dropdown-link:hover {
            background: rgba(248,250,252,0.95);
            color: #0f172a;
            transform: translateX(2px);
        }

        .sb-dropdown-link-primary-purple {
            color: #7c3aed;
            background: rgba(245,243,255,0.78);
        }

        .sb-dropdown-link-primary-purple:hover {
            background: rgba(243,232,255,0.95);
            color: #6d28d9;
        }

        .sb-dropdown-link-primary-indigo {
            color: #4f46e5;
            background: rgba(238,242,255,0.8);
        }

        .sb-dropdown-link-primary-indigo:hover {
            background: rgba(224,231,255,0.95);
            color: #4338ca;
        }

        .sb-mobile-menu-shell {
            border-top: 1px solid rgba(226,232,240,0.75);
            background:
                linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.94));
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
        }

        .sb-mobile-card {
            border-radius: 1.2rem;
            border: 1px solid rgba(226,232,240,0.75);
            background: rgba(255,255,255,0.82);
            box-shadow:
                0 10px 30px rgba(15,23,42,0.06),
                inset 0 1px 0 rgba(255,255,255,0.8);
            padding: 1rem;
        }

        .sb-login-primary {
            height: 2.75rem;
            padding: 0 1.3rem;
            border-radius: 0.95rem;
            background: linear-gradient(135deg, #111827 0%, #312e81 100%);
            color: white;
            font-weight: 800;
            font-size: 0.875rem;
            box-shadow: 0 12px 24px rgba(79,70,229,0.20);
            transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .sb-login-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 28px rgba(79,70,229,0.28);
            background: linear-gradient(135deg, #111827 0%, #4338ca 100%);
        }

        .sb-account-primary {
            height: 2.75rem;
            padding: 0 1.2rem;
            border-radius: 0.95rem;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            font-weight: 800;
            font-size: 0.875rem;
            box-shadow: 0 12px 24px rgba(99,102,241,0.24);
            transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .sb-account-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 30px rgba(99,102,241,0.3);
        }

        .sb-logout-btn {
            width: 2.75rem;
            height: 2.75rem;
            border-radius: 0.95rem;
            border: 1px solid rgba(226,232,240,0.9);
            background: rgba(255,255,255,0.84);
            color: #64748b;
            transition: all 0.18s ease;
        }

        .sb-logout-btn:hover {
            color: #dc2626;
            border-color: rgba(254,202,202,0.9);
            background: rgba(254,242,242,0.95);
        }
    </style>
`;

        if (!document.getElementById("sb-navbar-enhanced-styles")) {
            document.head.insertAdjacentHTML("beforeend", navStyles);
        }

        let brandNameHTML = `
            <div class="flex flex-col leading-none min-w-0">
                <span class="sb-brand-title">
                    StudyBase<span>.site</span>
                </span>
                <span class="sb-brand-subtitle">
                    Modern learning, refined
                </span>
            </div>
        `;

        if (isSupport) {
            brandNameHTML = `
                <div class="flex flex-col leading-none min-w-0">
                    <span class="sb-brand-title">
                        StudyBase<span>.site</span>
                    </span>
                    <span class="sb-brand-subtitle">
                        Support Centre
                    </span>
                </div>
            `;
        }

        const navHTML = `
        <div class="sb-nav-wrap" role="banner">
            <div id="sb-nav-shell" class="sb-nav-shell relative w-full font-sans" role="navigation">
                <div class="sb-nav-inner">
                    <div class="sb-nav-panel">
                        <div class="sb-nav-content">
                            <a href="/index.html" class="sb-brand">
                                <div class="sb-brand-logo-shell">
                                    <img
                                        src="/assets/siteIcons/navbar.png"
                                        alt="Logo"
                                        class="sb-brand-logo"
                                    >
                                </div>
                                ${brandNameHTML}
                            </a>

                            <div class="sb-nav-desktop hidden md:flex items-center gap-4">
                                <div class="sb-nav-links">
                                    <button
                                        type="button"
                                        data-dropdown-trigger="student-tools"
                                        class="sb-nav-trigger sb-nav-trigger-purple"
                                    >
                                        <span>Toolkit</span>
                                        <i class="fa-solid fa-chevron-down"></i>
                                    </button>

                                    <button
                                        type="button"
                                        data-dropdown-trigger="resources"
                                        class="sb-nav-trigger sb-nav-trigger-indigo"
                                    >
                                        <span>Resources</span>
                                        <i class="fa-solid fa-chevron-down"></i>
                                    </button>

                                    <button
                                        type="button"
                                        data-dropdown-trigger="support"
                                        class="sb-nav-trigger sb-nav-trigger-slate"
                                    >
                                        <span>Support</span>
                                        <i class="fa-solid fa-chevron-down"></i>
                                    </button>
                                </div>

                                <div id="loginBtnContainer" class="flex items-center gap-2"></div>
                            </div>

                            <div class="sb-nav-mobile-toggle md:hidden flex items-center gap-2">
                                <button id="mobile-menu-btn" class="sb-mobile-icon-btn" aria-label="Open menu">
                                    <i class="fa-solid fa-bars text-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="mobile-menu" class="hidden md:hidden sb-mobile-menu-shell">
                    <div class="sb-nav-inner sb-mobile-menu-inner px-4 pb-5 pt-3 space-y-4">
                        <div class="sb-mobile-card">
                            <div class="mb-3">
                                <h4 class="text-sm font-black text-slate-900">Toolkit</h4>
                                <p class="text-xs text-slate-500 font-medium mt-1">Open focused revision tools</p>
                            </div>
                            <div class="space-y-2">
                                <a href="/toolkit/index.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black text-purple-600 hover:bg-purple-50 transition-colors">
                                    <span>Toolkit Home</span>
                                    <i class="fa-solid fa-arrow-right text-xs"></i>
                                </a>
                                <a href="/toolkit/focusRoom.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    <span>The Focus Room</span>
                                    <i class="fa-solid fa-bullseye text-xs opacity-60"></i>
                                </a>
                                <a href="/toolkit/timetable.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    <span>Timetable Generator</span>
                                    <i class="fa-solid fa-calendar-days text-xs opacity-60"></i>
                                </a>
                                <a href="/toolkit/flashcards.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    <span>Flashcard Builder</span>
                                    <i class="fa-solid fa-layer-group text-xs opacity-60"></i>
                                </a>
                                <a href="/toolkit/paperTracker.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    <span>Past Paper Tracker</span>
                                    <i class="fa-solid fa-file-contract text-xs opacity-60"></i>
                                </a>
                                <a href="/toolkit/countdown.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    <span>Countdowns</span>
                                    <i class="fa-solid fa-hourglass-half text-xs opacity-60"></i>
                                </a>
                                <a href="/toolkit/mindmap.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    <span>Mindmaps</span>
                                    <i class="fa-solid fa-diagram-project text-xs opacity-60"></i>
                                </a>
                            </div>
                        </div>

                        <div class="sb-mobile-card">
                            <div class="mb-3">
                                <h4 class="text-sm font-black text-slate-900">Resources</h4>
                                <p class="text-xs text-slate-500 font-medium mt-1">Explore revision materials and guides</p>
                            </div>
                            <div class="space-y-2">
                                <a href="/resource_database/index.html#primary-access" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black text-indigo-600 hover:bg-indigo-50 transition-colors">
                                    <span>Full Resource Database</span>
                                    <i class="fa-solid fa-database text-xs opacity-70"></i>
                                </a>
                                <a href="/subjects/index.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    <span>Subject Specific Resources</span>
                                    <i class="fa-solid fa-book-open text-xs opacity-60"></i>
                                </a>
                                <a href="/blogs/index.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    <span>StudyBase Blogs</span>
                                    <i class="fa-solid fa-pen-nib text-xs opacity-60"></i>
                                </a>
                            </div>
                        </div>

                        <div class="sb-mobile-card">
                            <div class="mb-3">
                                <h4 class="text-sm font-black text-slate-900">Support</h4>
                                <p class="text-xs text-slate-500 font-medium mt-1">Help, policies and ways to contribute</p>
                            </div>
                            <div class="space-y-2">
                                <a href="/legal/index.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    <span>Privacy & Terms</span>
                                    <i class="fa-solid fa-shield-halved text-xs opacity-60"></i>
                                </a>
                                <a href="/support/help_center.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    <span>Help Center</span>
                                    <i class="fa-solid fa-circle-question text-xs opacity-60"></i>
                                </a>
                                <a href="/legal/contributions.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    <span>Contributions</span>
                                    <i class="fa-solid fa-hand-holding-heart text-xs opacity-60"></i>
                                </a>
                            </div>
                        </div>

                        <div id="mobileLoginBtnContainer" class="pt-1"></div>
                    </div>
                </div>
            </div>
        </div>

        <div id="sb-dropdown-student-tools" data-dropdown-menu="student-tools" class="sb-floating-menu hidden">
            <div class="sb-dropdown-card w-[350px]">
                <div class="sb-dropdown-head">
                    <p class="sb-dropdown-title">Toolkit</p>
                    <p class="sb-dropdown-subtitle">Open focused revision tools</p>
                </div>
                <div class="space-y-1">
                    <a href="/toolkit/index.html" class="sb-dropdown-link sb-dropdown-link-primary-purple">
                        <span>Toolkit Home</span>
                        <i class="fa-solid fa-arrow-right text-xs"></i>
                    </a>
                    <a href="/toolkit/focusRoom.html" class="sb-dropdown-link">
                        <span>Focus Room</span>
                        <i class="fa-solid fa-bullseye text-xs opacity-60"></i>
                    </a>
                    <a href="/toolkit/timetable.html" class="sb-dropdown-link">
                        <span>Timetable Generator</span>
                        <i class="fa-solid fa-calendar-days text-xs opacity-60"></i>
                    </a>
                    <a href="/toolkit/flashcards.html" class="sb-dropdown-link">
                        <span>Flashcard Builder</span>
                        <i class="fa-solid fa-layer-group text-xs opacity-60"></i>
                    </a>
                    <a href="/toolkit/paperTracker.html" class="sb-dropdown-link">
                        <span>Past Paper Tracker</span>
                        <i class="fa-solid fa-file-contract text-xs opacity-60"></i>
                    </a>
                    <a href="/toolkit/ucasCalculator.html" class="sb-dropdown-link">
                        <span>UCAS Calculator</span>
                        <i class="fa-solid fa-calculator text-xs opacity-60"></i>
                    </a>
                </div>
            </div>
        </div>

        <div id="sb-dropdown-resources" data-dropdown-menu="resources" class="sb-floating-menu hidden">
            <div class="sb-dropdown-card w-[330px]">
                <div class="sb-dropdown-head">
                    <p class="sb-dropdown-title">Resources</p>
                    <p class="sb-dropdown-subtitle">Explore revision materials and guides</p>
                </div>
                <div class="space-y-1">
                    <a href="/resource_database/index.html#primary-access" class="sb-dropdown-link sb-dropdown-link-primary-indigo">
                        <span>Full Resource Database</span>
                        <i class="fa-solid fa-database text-xs opacity-70"></i>
                    </a>
                    <a href="/subjects/index.html" class="sb-dropdown-link">
                        <span>Subject Specific Resources</span>
                        <i class="fa-solid fa-book-open text-xs opacity-60"></i>
                    </a>
                    <a href="/blogs/index.html" class="sb-dropdown-link">
                        <span>StudyBase Blogs</span>
                        <i class="fa-solid fa-pen-nib text-xs opacity-60"></i>
                    </a>
                </div>
            </div>
        </div>

        <div id="sb-dropdown-support" data-dropdown-menu="support" class="sb-floating-menu hidden">
            <div class="sb-dropdown-card w-[305px]">
                <div class="sb-dropdown-head">
                    <p class="sb-dropdown-title">Support</p>
                    <p class="sb-dropdown-subtitle">Help, policies and ways to contribute</p>
                </div>
                <div class="space-y-1">
                    <a href="/legal/index.html" class="sb-dropdown-link">
                        <span>Privacy & Terms</span>
                        <i class="fa-solid fa-shield-halved text-xs opacity-60"></i>
                    </a>
                    <a href="/support/help_center.html" class="sb-dropdown-link">
                        <span>Help Center</span>
                        <i class="fa-solid fa-circle-question text-xs opacity-60"></i>
                    </a>
                    <a href="/legal/contributions.html" class="sb-dropdown-link">
                        <span>Contributions</span>
                        <i class="fa-solid fa-hand-holding-heart text-xs opacity-60"></i>
                    </a>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML("afterbegin", navHTML);

        const mobileBtn = document.getElementById("mobile-menu-btn");
        const mobileMenu = document.getElementById("mobile-menu");

        if (mobileBtn && mobileMenu) {
            mobileBtn.addEventListener("click", () => {
                mobileMenu.classList.toggle("hidden");

                const icon = mobileBtn.querySelector("i");
                if (mobileMenu.classList.contains("hidden")) {
                    icon.classList.remove("fa-xmark");
                    icon.classList.add("fa-bars");
                } else {
                    icon.classList.remove("fa-bars");
                    icon.classList.add("fa-xmark");
                }
            });
        }

        const triggers = [...document.querySelectorAll("[data-dropdown-trigger]")];
        const menus = [...document.querySelectorAll("[data-dropdown-menu]")];
        let activeId = null;
        let closeTimer = null;

        function getMenu(id) {
            return document.querySelector(`[data-dropdown-menu="${id}"]`);
        }

        function getTrigger(id) {
            return document.querySelector(`[data-dropdown-trigger="${id}"]`);
        }

        function positionMenu(id) {
            const trigger = getTrigger(id);
            const menu = getMenu(id);
            if (!trigger || !menu) return;

            const rect = trigger.getBoundingClientRect();
            const menuWidth = menu.offsetWidth || (id === "support" ? 305 : 330);
            const gap = 10;

            let left = rect.left;
            if (id === "support") {
                left = rect.right - menuWidth;
            }

            const maxLeft = window.innerWidth - menuWidth - 12;
            left = Math.max(12, Math.min(left, maxLeft));

            menu.style.left = `${left}px`;
            menu.style.top = `${rect.bottom + gap}px`;
        }

        function hideAllMenus() {
            menus.forEach((menu) => {
                menu.classList.add("hidden");
                menu.classList.remove("sb-menu-open");
            });

            triggers.forEach((trigger) => {
                trigger.classList.remove("bg-white", "text-slate-900", "text-indigo-600", "text-purple-600", "shadow-sm");
                const icon = trigger.querySelector("i");
                if (icon) icon.style.transform = "";
            });

            activeId = null;
        }

        function styleActiveTrigger(id) {
            triggers.forEach((trigger) => {
                const triggerId = trigger.getAttribute("data-dropdown-trigger");
                const icon = trigger.querySelector("i");

                trigger.classList.remove("bg-white", "text-slate-900", "text-indigo-600", "text-purple-600", "shadow-sm");
                if (icon) icon.style.transform = "";

                if (triggerId === id) {
                    trigger.classList.add("bg-white", "shadow-sm");

                    if (id === "student-tools") {
                        trigger.classList.add("text-purple-600");
                    } else if (id === "resources") {
                        trigger.classList.add("text-indigo-600");
                    } else {
                        trigger.classList.add("text-slate-900");
                    }

                    if (icon) icon.style.transform = "rotate(180deg)";
                }
            });
        }

        function openMenu(id) {
            clearTimeout(closeTimer);

            if (activeId === id) {
                positionMenu(id);
                return;
            }

            hideAllMenus();

            const menu = getMenu(id);
            if (!menu) return;

            menu.classList.remove("hidden");
            positionMenu(id);

            requestAnimationFrame(() => {
                menu.classList.add("sb-menu-open");
            });

            styleActiveTrigger(id);
            activeId = id;
        }

        function scheduleClose() {
            clearTimeout(closeTimer);
            closeTimer = setTimeout(() => {
                hideAllMenus();
            }, 180);
        }

        function cancelClose() {
            clearTimeout(closeTimer);
        }

        triggers.forEach((trigger) => {
            const id = trigger.getAttribute("data-dropdown-trigger");

            trigger.addEventListener("mouseenter", () => openMenu(id));
            trigger.addEventListener("mouseleave", scheduleClose);
            trigger.addEventListener("focus", () => openMenu(id));

            trigger.addEventListener("click", (e) => {
                e.preventDefault();
                if (activeId === id) {
                    hideAllMenus();
                } else {
                    openMenu(id);
                }
            });
        });

        menus.forEach((menu) => {
            menu.addEventListener("mouseenter", cancelClose);
            menu.addEventListener("mouseleave", scheduleClose);
        });

        window.addEventListener("scroll", () => {
            if (activeId) positionMenu(activeId);
        }, { passive: true });

        window.addEventListener("resize", () => {
            if (activeId) positionMenu(activeId);
        });

        document.addEventListener("click", (e) => {
            const insideTrigger = e.target.closest("[data-dropdown-trigger]");
            const insideMenu = e.target.closest("[data-dropdown-menu]");
            if (!insideTrigger && !insideMenu) hideAllMenus();
        });

        function closeLoginOverlay() {
            const overlay = document.getElementById("gh-login-overlay");
            if (overlay) {
                overlay.classList.remove("opacity-100");
                overlay.classList.add("opacity-0");

                setTimeout(() => {
                    overlay.remove();
                    checkLoginAvailability();
                }, 300);
            }
        }

        function askToClose() {
            if (document.getElementById("gh-confirm-popup")) return;

            const confirmHTML = `
            <div id="gh-confirm-popup" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/45 backdrop-blur-md opacity-0 transition-opacity duration-200">
                <div class="bg-white p-8 rounded-[2rem] shadow-[0_20px_60px_rgba(15,23,42,0.18)] border border-slate-200 w-[22rem] max-w-[92vw] transform scale-95 transition-all duration-200" id="gh-confirm-box">
                    <div class="mx-auto mb-4 w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                        <i class="fa-solid fa-xmark text-xl"></i>
                    </div>
                    <h3 class="text-xl font-black text-slate-900 mb-2 text-center tracking-tight">Stop logging in?</h3>
                    <p class="text-slate-500 text-sm text-center mb-8 font-medium">Are you sure you want to close the login window?</p>
                    <div class="flex flex-col space-y-3">
                        <button id="gh-confirm-stay" class="w-full py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-colors text-sm">No, stay here</button>
                        <button id="gh-confirm-close-btn" class="w-full py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-md transition-colors text-sm">Yes, close it</button>
                    </div>
                </div>
            </div>
            `;

            document.body.insertAdjacentHTML("beforeend", confirmHTML);

            requestAnimationFrame(() => {
                const popup = document.getElementById("gh-confirm-popup");
                const box = document.getElementById("gh-confirm-box");
                if (popup && box) {
                    popup.classList.remove("opacity-0");
                    box.classList.remove("scale-95");
                    box.classList.add("scale-100");
                }
            });

            document.getElementById("gh-confirm-stay").onclick = removeConfirmPopup;
            document.getElementById("gh-confirm-close-btn").onclick = () => {
                removeConfirmPopup();
                closeLoginOverlay();
            };

            document.getElementById("gh-confirm-popup").onclick = (e) => {
                if (e.target.id === "gh-confirm-popup") removeConfirmPopup();
            };
        }

        function removeConfirmPopup() {
            const popup = document.getElementById("gh-confirm-popup");
            if (popup) {
                popup.classList.add("opacity-0");
                setTimeout(() => popup.remove(), 200);
            }
        }

        function createLoginOverlay() {
            if (document.getElementById("gh-login-overlay")) return;

            const overlayHTML = `
            <div id="gh-login-overlay" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 backdrop-blur-lg transition-opacity duration-300 opacity-0">
                <div class="relative w-[94%] md:w-[88%] h-[92%] md:h-[88%] bg-slate-50 rounded-[2rem] shadow-[0_24px_80px_rgba(15,23,42,0.28)] flex flex-col overflow-hidden border border-white/20 transform transition-all scale-100">
                    <div class="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/60 to-transparent pointer-events-none z-[1]"></div>
                    <div class="absolute top-4 right-4 z-10">
                        <button id="gh-close-overlay" class="bg-white/95 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-2xl w-11 h-11 flex items-center justify-center shadow-md border border-slate-200 transition-all duration-200">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>
                    <iframe src="/myaccount/login.html" class="w-full h-full border-0 bg-white" title="Login"></iframe>
                </div>
            </div>
            `;

            document.body.insertAdjacentHTML("beforeend", overlayHTML);

            requestAnimationFrame(() => {
                const overlay = document.getElementById("gh-login-overlay");
                if (overlay) {
                    overlay.classList.remove("opacity-0");
                    overlay.classList.add("opacity-100");
                }
            });

            document.getElementById("gh-close-overlay").onclick = askToClose;
            document.getElementById("gh-login-overlay").addEventListener("click", (e) => {
                if (e.target.id === "gh-login-overlay") askToClose();
            });
        }

        function createLoginButton() {
            const desktopContainer = document.getElementById("loginBtnContainer");
            const mobileContainer = document.getElementById("mobileLoginBtnContainer");

            if (!desktopContainer) return;

            desktopContainer.innerHTML = "";
            if (mobileContainer) mobileContainer.innerHTML = "";

            const u = localStorage.getItem("gh_username");
            const p = localStorage.getItem("gh_password");
            const d = localStorage.getItem("gh_device");
            const isLoggedIn = u && p && d;

            if (isLoggedIn) {
                const openAccountModal = (e) => {
                    e.preventDefault();

                    const modalBackdrop = document.createElement("div");
                    modalBackdrop.className =
                        "fixed inset-0 z-[9999] bg-slate-950/55 backdrop-blur-lg flex items-center justify-center opacity-0 transition-opacity duration-300";

                    const modalContainer = document.createElement("div");
                    modalContainer.className =
                        "relative w-[96%] md:w-[90%] h-[95%] md:h-[90%] bg-slate-50 rounded-[2rem] shadow-[0_24px_80px_rgba(15,23,42,0.28)] flex flex-col overflow-hidden scale-95 transition-transform duration-300 border border-white/20";

                    const modalHeader = document.createElement("div");
                    modalHeader.className =
                        "flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur-xl border-b border-slate-200 z-10";
                    modalHeader.innerHTML = `
                        <span class="font-black text-slate-900 text-lg tracking-tight">My Settings</span>
                        <button id="close-settings-modal" class="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    `;

                    const iframe = document.createElement("iframe");
                    iframe.src = "/myaccount/account.html";
                    iframe.className = "w-full flex-grow border-none bg-slate-50";

                    modalContainer.appendChild(modalHeader);
                    modalContainer.appendChild(iframe);
                    modalBackdrop.appendChild(modalContainer);
                    document.body.appendChild(modalBackdrop);

                    document.body.style.overflow = "hidden";

                    setTimeout(() => {
                        modalBackdrop.classList.remove("opacity-0");
                        modalContainer.classList.remove("scale-95");
                    }, 10);

                    const closeModal = () => {
                        modalBackdrop.classList.add("opacity-0");
                        modalContainer.classList.add("scale-95");

                        setTimeout(() => {
                            modalBackdrop.remove();
                            document.body.style.overflow = "";
                        }, 300);
                    };

                    modalHeader
                        .querySelector("#close-settings-modal")
                        .addEventListener("click", closeModal);

                    modalBackdrop.addEventListener("click", (e) => {
                        if (e.target === modalBackdrop) closeModal();
                    });
                };

                const handleLogout = () => {
                    ["gh_username", "gh_password", "gh_device"].forEach((k) =>
                        localStorage.removeItem(k)
                    );
                    window.location.reload();
                };

                const accountBtn = document.createElement("button");
                accountBtn.innerHTML = `<i class="fa-solid fa-user mr-2"></i> Account`;
                accountBtn.className = "sb-account-primary";
                accountBtn.addEventListener("click", openAccountModal);

                const logoutBtn = document.createElement("button");
                logoutBtn.innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket"></i>`;
                logoutBtn.className = "sb-logout-btn";
                logoutBtn.onclick = handleLogout;

                desktopContainer.classList.add("flex", "items-center", "gap-2");
                desktopContainer.appendChild(accountBtn);
                desktopContainer.appendChild(logoutBtn);

                if (mobileContainer) {
                    const mobAccountBtn = document.createElement("button");
                    mobAccountBtn.innerHTML = `<i class="fa-solid fa-user mr-2"></i> My Account`;
                    mobAccountBtn.className =
                        "w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3.5 rounded-2xl font-bold text-sm shadow-md";
                    mobAccountBtn.addEventListener("click", openAccountModal);

                    const mobLogoutBtn = document.createElement("button");
                    mobLogoutBtn.innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket mr-2"></i> Log out`;
                    mobLogoutBtn.className =
                        "w-full mt-3 border border-slate-200 bg-white text-slate-600 px-4 py-3.5 rounded-2xl font-bold text-sm";
                    mobLogoutBtn.onclick = handleLogout;

                    mobileContainer.appendChild(mobAccountBtn);
                    mobileContainer.appendChild(mobLogoutBtn);
                }
            } else {
                const btn = document.createElement("button");
                btn.innerHTML = `Log in <i class="fa-solid fa-arrow-right ml-1"></i>`;
                btn.className = "sb-login-primary";
                btn.onclick = createLoginOverlay;
                desktopContainer.appendChild(btn);

                if (mobileContainer) {
                    const mobBtn = document.createElement("button");
                    mobBtn.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket mr-2"></i> Log in`;
                    mobBtn.className =
                        "w-full bg-gradient-to-r from-slate-900 to-indigo-700 text-white px-4 py-3.5 rounded-2xl font-bold text-sm shadow-md";
                    mobBtn.onclick = createLoginOverlay;
                    mobileContainer.appendChild(mobBtn);
                }
            }
        }

        async function checkLoginAvailability() {
            try {
                const res = await fetch("https://api.studybase.site/state");
                const data = await res.json();

                if (data.ok && data.shutdown === false) {
                    createLoginButton();
                } else {
                    const desktopContainer = document.getElementById("loginBtnContainer");
                    const mobileContainer = document.getElementById("mobileLoginBtnContainer");
                    if (desktopContainer) desktopContainer.innerHTML = "";
                    if (mobileContainer) mobileContainer.innerHTML = "";
                }
            } catch (err) {
                console.error("Failed to fetch login state:", err);
            }
        }

        checkLoginAvailability();
        setInterval(checkLoginAvailability, 90000);

        window.addEventListener("message", (event) => {
            if (event.data === "login-success") {
                closeLoginOverlay();
                window.location.href =
                    window.location.pathname + window.location.search + "#logged-in";
            }
        });

        const params = new URLSearchParams(window.location.search);
        if (params.get("sessionExpired") === "true") {
            createLoginOverlay();
            params.delete("sessionExpired");
            const newUrl =
                window.location.pathname +
                (params.toString() ? "?" + params.toString() : "") +
                window.location.hash;
            window.history.replaceState({}, "", newUrl);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initNavbar);
    } else {
        initNavbar();
    }
})();
