// /assets/js/account-sidebar.js
(function () {
  const LINKS = [
    { href: "/myaccount/account.html", label: "Overview", icon: "fa-solid fa-house" },
    { href: "/myaccount/settings.html", label: "Settings", icon: "fa-solid fa-sliders" },
    { href: "/myaccount/flags.html", label: "Flags", icon: "fa-solid fa-flag" },
    { href: "/myaccount/history.html", label: "History", icon: "fa-solid fa-clock-rotate-left" },
    { href: "/myaccount/plan.html", label: "Upgrade", icon: "fa-solid fa-crown" }, // <-- Added Upgrade Plan here
  ];

  function samePath(a, b) {
    const pa = new URL(a, location.origin).pathname.replace(/\/+$/, "");
    const pb = new URL(b, location.origin).pathname.replace(/\/+$/, "");
    return pa === pb;
  }

  function injectSidebar() {
    if (document.getElementById("sb-account-sidebar")) return;

    // Add left padding on desktop so content doesn't sit under sidebar
    document.documentElement.style.scrollBehavior = "smooth";
    const style = document.createElement("style");
    style.textContent = `
      @media (min-width: 1024px) {
        body { padding-left: 19rem; }
      }
    `;
    document.head.appendChild(style);

    const activeHref = LINKS.find(l => samePath(l.href, location.pathname))?.href || "";

    const navLinks = LINKS.map(l => {
      const active = l.href === activeHref;
      // Add a special text color for the upgrade button if you want it to stand out, 
      // or keep it standard. It currently matches the rest of the nav.
      return `
        <a href="${l.href}"
           class="group flex items-center gap-3 px-3 py-2 rounded-2xl border transition-all
           ${active
             ? "bg-slate-900 text-white border-slate-900 shadow-sm"
             : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"}">
          <span class="w-9 h-9 rounded-xl flex items-center justify-center
            ${active ? "bg-white/10" : "bg-slate-100 border border-slate-200"}">
            <i class="${l.icon} ${active ? "text-white" : "text-slate-700"}"></i>
          </span>
          <span class="font-extrabold">${l.label}</span>
        </a>
      `;
    }).join("");

    const sidebarHTML = `
      <div id="sb-account-topbar" class="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <i class="fa-solid fa-user"></i>
            </span>
            <div class="leading-tight">
              <p class="font-black">Account</p>
              <p class="text-xs text-slate-500 font-body">StudyBase</p>
            </div>
          </div>
          <button id="sb-account-open" class="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold">
            <i class="fa-solid fa-bars mr-2"></i>Menu
          </button>
        </div>
      </div>

      <aside id="sb-account-sidebar"
        class="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 z-50">
        <div class="w-full p-5 flex flex-col gap-4">
          

          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-bold uppercase tracking-widest text-slate-500">Signed in as</p>
            <p id="sb-account-name" class="mt-1 font-extrabold text-slate-900">—</p>
            <p class="text-xs text-slate-500 font-body mt-1">This device</p>
          </div>

          <nav class="flex flex-col gap-2">
            ${navLinks}
          </nav>

          <div class="mt-auto flex flex-col gap-2">
            <button id="sb-account-logout"
              class="w-full px-4 py-2 rounded-2xl bg-white border border-red-200 text-red-600 font-extrabold hover:bg-red-50 transition">
              <i class="fa-solid fa-right-from-bracket mr-2"></i>Logout
            </button>
          </div>
        </div>
      </aside>

      <div id="sb-account-drawer" class="fixed inset-0 z-[999] hidden">
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-2xl border-l border-slate-200 p-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <i class="fa-solid fa-user"></i>
              </span>
              <div class="leading-tight">
                <p class="font-black">Account</p>
                <p id="sb-account-name-m" class="text-xs text-slate-500 font-body">—</p>
              </div>
            </div>
            <button id="sb-account-close" class="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="mt-5 flex flex-col gap-2">
            ${navLinks}
          </div>

          <button id="sb-account-logout-m"
            class="mt-6 w-full px-4 py-2 rounded-2xl bg-white border border-red-200 text-red-600 font-extrabold hover:bg-red-50 transition">
            <i class="fa-solid fa-right-from-bracket mr-2"></i>Logout
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("afterbegin", sidebarHTML);

    // Fill name from your settings key
    const name = (localStorage.getItem("sb_firstName") || "").trim() || "User";
    const a = document.getElementById("sb-account-name");
    const b = document.getElementById("sb-account-name-m");
    if (a) a.textContent = name;
    if (b) b.textContent = name;

    // Drawer controls
    const drawer = document.getElementById("sb-account-drawer");
    const openBtn = document.getElementById("sb-account-open");
    const closeBtn = document.getElementById("sb-account-close");

    function openDrawer() { if (drawer) drawer.classList.remove("hidden"); }
    function closeDrawer() { if (drawer) drawer.classList.add("hidden"); }

    openBtn?.addEventListener("click", openDrawer);
    closeBtn?.addEventListener("click", closeDrawer);
    drawer?.addEventListener("click", (e) => {
      if (e.target === drawer.firstElementChild) closeDrawer();
    });

    // Logout (uses AccountAuth if present)
    const logoutBtn = document.getElementById("sb-account-logout");
    const logoutBtnM = document.getElementById("sb-account-logout-m");
    const doLogout = () => (window.AccountAuth?.logout ? window.AccountAuth.logout() : location.replace("/index.html?error=AUTH_001"));
    logoutBtn?.addEventListener("click", doLogout);
    logoutBtnM?.addEventListener("click", doLogout);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectSidebar);
  } else {
    injectSidebar();
  }
})();
