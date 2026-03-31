(function () {
    function initNavbar() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get("category");
        const isSupport =
            window.location.pathname.includes("support") ||
            categoryParam === "support";

        let brandNameHTML = `
            <div class="flex flex-col leading-none min-w-0">
                <span class="text-[1.05rem] md:text-[1.2rem] font-black text-slate-900 tracking-[-0.03em]">
                    StudyBase<span class="text-indigo-600">.site</span>
                </span>
                <span class="text-[11px] md:text-xs text-slate-400 font-semibold tracking-wide mt-1">
                    Modern learning, refined
                </span>
            </div>
        `;

        if (isSupport) {
            brandNameHTML = `
                <div class="flex flex-col leading-none min-w-0">
                    <span class="text-[1.05rem] md:text-[1.2rem] font-black text-slate-900 tracking-[-0.03em]">
                        StudyBase<span class="text-indigo-600">.site</span>
                    </span>
                    <span class="text-[11px] md:text-xs text-slate-400 font-semibold tracking-wide mt-1">
                        Support Centre
                    </span>
                </div>
            `;
        }

        const navHTML = `
        <header class="relative z-50">
            <div class="px-3 md:px-5 pt-2">
                <nav id="sb-nav-shell" class="relative max-w-7xl mx-auto rounded-[1.45rem] border border-slate-200/90 bg-white shadow-[0_6px_26px_rgba(15,23,42,0.06)] transition-all font-sans">
                    <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80 pointer-events-none"></div>

                    <div class="px-4 sm:px-6 lg:px-7">
                        <div class="h-[74px] flex items-center justify-between gap-4">
                            <a href="/index.html" class="flex items-center gap-3 min-w-0 group">
                                <div class="relative shrink-0">
                                    <div class="absolute inset-0 rounded-2xl bg-indigo-500/10 blur-md scale-110 group-hover:scale-125 transition-transform duration-300"></div>
                                    <img
                                        src="/assets/siteIcons/main.ico"
                                        alt="Logo"
                                        class="relative w-10 h-10 rounded-2xl shadow-sm ring-1 ring-slate-200 bg-white object-cover group-hover:scale-[1.04] transition-transform duration-300"
                                    >
                                </div>
                                ${brandNameHTML}
                            </a>

                            <div class="hidden md:flex items-center gap-3">
                                <div class="flex items-center rounded-full border border-slate-200/80 bg-white shadow-sm px-2 py-1.5">
                                    
                                    <button
                                        type="button"
                                        data-dropdown-trigger="student-tools"
                                        class="sb-nav-trigger h-11 px-4 rounded-full flex items-center gap-2 text-[13px] lg:text-sm font-bold text-slate-600 hover:text-purple-600 hover:bg-purple-50/80 transition-all outline-none"
                                    >
                                        <span>Student Tools</span>
                                        <i class="fa-solid fa-chevron-down text-[10px] transition-transform duration-200"></i>
                                    </button>

                                    <button
                                        type="button"
                                        data-dropdown-trigger="resources"
                                        class="sb-nav-trigger h-11 px-4 rounded-full flex items-center gap-2 text-[13px] lg:text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 transition-all outline-none"
                                    >
                                        <span>Resources</span>
                                        <i class="fa-solid fa-chevron-down text-[10px] transition-transform duration-200"></i>
                                    </button>

                                    <button
                                        type="button"
                                        data-dropdown-trigger="support"
                                        class="sb-nav-trigger h-11 px-4 rounded-full flex items-center gap-2 text-[13px] lg:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all outline-none"
                                    >
                                        <span>Support</span>
                                        <i class="fa-solid fa-chevron-down text-[10px] transition-transform duration-200"></i>
                                    </button>
                                </div>

                                <div class="pl-1">
                                    <div id="loginBtnContainer" class="flex items-center gap-2"></div>
                                </div>
                            </div>

                            <div class="md:hidden flex items-center gap-2">
                                <div id="loginBtnContainer" class="hidden"></div>
                                <button id="mobile-menu-btn" class="w-11 h-11 rounded-2xl border border-slate-200 bg-white/90 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm outline-none flex items-center justify-center">
                                    <i class="fa-solid fa-bars text-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div id="mobile-menu" class="hidden md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-2xl">
                        <div class="px-4 pb-5 pt-3 space-y-4">
                            <div class="rounded-[1.4rem] border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4">
                                <div class="mb-3">
                                    <h4 class="text-sm font-black text-slate-900">Student Toolbox</h4>
                                    <p class="text-xs text-slate-500 font-medium mt-1">View all our available tools</p>
                                </div>
                                <div class="space-y-2">
                                    <a href="/toolkit/index.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black text-purple-600 hover:bg-white transition-colors">
                                        <span>Student Toolbox</span>
                                        <i class="fa-solid fa-arrow-right text-xs"></i>
                                    </a>
                                    <a href="/toolkit/focusRoom.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white transition-colors">
                                        <span>The Focus Room</span>
                                        <i class="fa-solid fa-bullseye text-xs opacity-60"></i>
                                    </a>
                                    <a href="/toolkit/timetable.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white transition-colors">
                                        <span>Timetable Generator</span>
                                        <i class="fa-solid fa-calendar-days text-xs opacity-60"></i>
                                    </a>
                                    <a href="/toolkit/countdown.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white transition-colors">
                                        <span>Countdowns</span>
                                        <i class="fa-solid fa-hourglass-half text-xs opacity-60"></i>
                                    </a>
                                    <a href="/toolkit/mindmap.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white transition-colors">
                                        <span>Mindmaps</span>
                                        <i class="fa-solid fa-diagram-project text-xs opacity-60"></i>
                                    </a>
                                </div>
                            </div>

                            <div class="rounded-[1.4rem] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4">
                                <div class="mb-3">
                                    <h4 class="text-sm font-black text-slate-900">Resources</h4>
                                    <p class="text-xs text-slate-500 font-medium mt-1">Explore revision materials and guides</p>
                                </div>
                                <div class="space-y-2">
                                    <a href="/resource_database/index.html#primary-access" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black text-indigo-600 hover:bg-white transition-colors">
                                        <span>Full Resource Database</span>
                                        <i class="fa-solid fa-database text-xs opacity-70"></i>
                                    </a>
                                    <a href="/subjects/index.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white transition-colors">
                                        <span>Subject Specific Resources</span>
                                        <i class="fa-solid fa-book-open text-xs opacity-60"></i>
                                    </a>
                                    <a href="/blogs/index.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white transition-colors">
                                        <span>StudyBase Blogs</span>
                                        <i class="fa-solid fa-pen-nib text-xs opacity-60"></i>
                                    </a>
                                </div>
                            </div>

                            <div class="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                                <div class="mb-3">
                                    <h4 class="text-sm font-black text-slate-900">Support</h4>
                                    <p class="text-xs text-slate-500 font-medium mt-1">Help, policies and ways to contribute</p>
                                </div>
                                <div class="space-y-2">
                                    <a href="/legal/index.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white transition-colors">
                                        <span>Privacy & Terms</span>
                                        <i class="fa-solid fa-shield-halved text-xs opacity-60"></i>
                                    </a>
                                    <a href="/faq.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white transition-colors">
                                        <span>Help Center</span>
                                        <i class="fa-solid fa-circle-question text-xs opacity-60"></i>
                                    </a>
                                    <a href="/legal/contributions.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-white transition-colors">
                                        <span>Contributions</span>
                                        <i class="fa-solid fa-hand-holding-heart text-xs opacity-60"></i>
                                    </a>
                                </div>
                            </div>

                            <div id="mobileLoginBtnContainer" class="pt-1"></div>
                        </div>
                    </div>
                </nav>
            </div>
        </header>

        <!-- DESKTOP DROPDOWNS -->
        <div id="sb-dropdown-student-tools" data-dropdown-menu="student-tools" class="fixed z-[80] hidden opacity-0 pointer-events-none transition-opacity duration-150">
            <div class="w-[320px] rounded-[1.4rem] border border-slate-200/90 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] p-3">
                <div class="px-3 pb-3">
                    <p class="text-sm font-black text-slate-900">Student Toolbox</p>
                    <p class="text-xs text-slate-500 font-medium mt-1">View all our available tools</p>
                </div>
                <div class="space-y-1">
                    <a href="/toolkit/index.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-purple-600 hover:bg-purple-50 transition-colors">
                        <span>Student Toolbox</span>
                        <i class="fa-solid fa-arrow-right text-xs"></i>
                    </a>
                    <a href="/toolkit/focusRoom.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <span>The Focus Room</span>
                        <i class="fa-solid fa-bullseye text-xs opacity-60"></i>
                    </a>
                    <a href="/toolkit/timetable.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <span>Timetable Generator</span>
                        <i class="fa-solid fa-calendar-days text-xs opacity-60"></i>
                    </a>
                    <a href="/toolkit/countdown.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <span>Countdowns</span>
                        <i class="fa-solid fa-hourglass-half text-xs opacity-60"></i>
                    </a>
                    <a href="/toolkit/mindmap.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <span>Mindmaps</span>
                        <i class="fa-solid fa-diagram-project text-xs opacity-60"></i>
                    </a>
                </div>
            </div>
        </div>

        <div id="sb-dropdown-resources" data-dropdown-menu="resources" class="fixed z-[80] hidden opacity-0 pointer-events-none transition-opacity duration-150">
            <div class="w-[320px] rounded-[1.4rem] border border-slate-200/90 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] p-3">
                <div class="px-3 pb-3">
                    <p class="text-sm font-black text-slate-900">Resources</p>
                    <p class="text-xs text-slate-500 font-medium mt-1">Explore revision materials and guides</p>
                </div>
                <div class="space-y-1">
                    <a href="/resource_database/index.html#primary-access" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <span>Full Resource Database</span>
                        <i class="fa-solid fa-database text-xs opacity-70"></i>
                    </a>
                    <a href="/subjects/index.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <span>Subject Specific Resources</span>
                        <i class="fa-solid fa-book-open text-xs opacity-60"></i>
                    </a>
                    <a href="/blogs/index.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <span>StudyBase Blogs</span>
                        <i class="fa-solid fa-pen-nib text-xs opacity-60"></i>
                    </a>
                </div>
            </div>
        </div>

        <div id="sb-dropdown-support" data-dropdown-menu="support" class="fixed z-[80] hidden opacity-0 pointer-events-none transition-opacity duration-150">
            <div class="w-[300px] rounded-[1.4rem] border border-slate-200/90 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] p-3">
                <div class="px-3 pb-3">
                    <p class="text-sm font-black text-slate-900">Support</p>
                    <p class="text-xs text-slate-500 font-medium mt-1">Help, policies and ways to contribute</p>
                </div>
                <div class="space-y-1">
                    <a href="/legal/index.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <span>Privacy & Terms</span>
                        <i class="fa-solid fa-shield-halved text-xs opacity-60"></i>
                    </a>
                    <a href="/support/help_center.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <span>Help Center</span>
                        <i class="fa-solid fa-circle-question text-xs opacity-60"></i>
                    </a>
                    <a href="/legal/contributions.html" class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
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
            const menuWidth = menu.offsetWidth || (id === "support" ? 300 : 320);
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
                menu.classList.add("hidden", "pointer-events-none");
                menu.classList.remove("opacity-100");
                menu.classList.add("opacity-0");
            });

            triggers.forEach((trigger) => {
                trigger.classList.remove("bg-slate-100", "bg-indigo-50/80", "bg-purple-50/80", "text-slate-900", "text-indigo-600", "text-purple-600");
                const icon = trigger.querySelector("i");
                if (icon) icon.style.transform = "";
            });

            activeId = null;
        }

        function styleActiveTrigger(id) {
            triggers.forEach((trigger) => {
                const triggerId = trigger.getAttribute("data-dropdown-trigger");
                const icon = trigger.querySelector("i");

                trigger.classList.remove("bg-slate-100", "bg-indigo-50/80", "bg-purple-50/80", "text-slate-900", "text-indigo-600", "text-purple-600");
                if (icon) icon.style.transform = "";

                if (triggerId === id) {
                    if (id === "student-tools") {
                        trigger.classList.add("bg-purple-50/80", "text-purple-600");
                    } else if (id === "resources") {
                        trigger.classList.add("bg-indigo-50/80", "text-indigo-600");
                    } else {
                        trigger.classList.add("bg-slate-100", "text-slate-900");
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
                menu.classList.remove("pointer-events-none", "opacity-0");
                menu.classList.add("opacity-100");
            });

            styleActiveTrigger(id);
            activeId = id;
        }

        function scheduleClose() {
            clearTimeout(closeTimer);
            closeTimer = setTimeout(() => {
                hideAllMenus();
            }, 220);
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

        window.addEventListener(
            "scroll",
            () => {
                if (activeId) positionMenu(activeId);
            },
            { passive: true }
        );

        window.addEventListener("resize", () => {
            if (activeId) positionMenu(activeId);
        });

        document.addEventListener("click", (e) => {
            const insideTrigger = e.target.closest("[data-dropdown-trigger]");
            const insideMenu = e.target.closest("[data-dropdown-menu]");
            if (!insideTrigger && !insideMenu) {
                hideAllMenus();
            }
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
                accountBtn.className =
                    "h-11 px-5 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors text-sm shadow-md shadow-indigo-200/70";
                accountBtn.addEventListener("click", openAccountModal);

                const logoutBtn = document.createElement("button");
                logoutBtn.innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket"></i>`;
                logoutBtn.className =
                    "w-11 h-11 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 font-bold transition-colors text-sm shadow-sm";
                logoutBtn.onclick = handleLogout;

                desktopContainer.classList.add("flex", "items-center", "gap-2");
                desktopContainer.appendChild(accountBtn);
                desktopContainer.appendChild(logoutBtn);

                if (mobileContainer) {
                    const mobAccountBtn = document.createElement("button");
                    mobAccountBtn.innerHTML = `<i class="fa-solid fa-user mr-2"></i> My Account`;
                    mobAccountBtn.className =
                        "w-full bg-indigo-600 text-white px-4 py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-indigo-200/70";
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
                btn.className =
                    "h-11 px-6 rounded-full bg-slate-900 text-white font-bold hover:bg-indigo-600 transition-colors text-sm shadow-md";
                btn.onclick = createLoginOverlay;
                desktopContainer.appendChild(btn);

                if (mobileContainer) {
                    const mobBtn = document.createElement("button");
                    mobBtn.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket mr-2"></i> Log in`;
                    mobBtn.className =
                        "w-full bg-slate-900 text-white px-4 py-3.5 rounded-2xl font-bold text-sm shadow-md";
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