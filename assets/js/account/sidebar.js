(function () {
  const links = [
    { label: "Overview", href: "/myaccount/account.html", sub: "Account summary" },
    { label: "Settings", href: "/myaccount/settings.html", sub: "Profile and preferences" },
    { label: "Privacy", href: "/myaccount/privacy.html", sub: "View and export your data" },
    { label: "Leaderboard", action: "coming", sub: "Ranking preferences" },
    { label: "Password", href: "https://auth.platformbase.online/change-password", action: "security", sub: "Security credentials" },
    { label: "Delete", href: "https://auth.platformbase.online/delete", action: "security", sub: "Permanent removal" }
  ];

  function openPanel({ title, url, comingSoon = false }) {
    document.getElementById("sb-account-panel")?.remove();
    const panel = document.createElement("div");
    panel.id = "sb-account-panel";
    panel.className = "fixed inset-0 z-30 bg-slate-100/95 backdrop-blur-sm lg:left-[250px]";
    panel.innerHTML = `<div class="flex h-full flex-col"><header class="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4"><div><p class="text-xs font-black uppercase tracking-[.16em] text-purple-600">Account management</p><h2 class="mt-1 text-xl font-black text-slate-900">${title}</h2></div><button type="button" class="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700">Close</button></header>${comingSoon ? `<div class="grid flex-1 place-items-center p-6"><div class="max-w-md rounded-3xl border border-purple-100 bg-white p-8 text-center shadow-xl"><div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-purple-100 text-2xl font-black text-purple-700">S</div><h3 class="mt-5 text-3xl font-black text-slate-900">Coming soon</h3><p class="mt-3 leading-7 text-slate-500">${title} settings are being prepared for a future StudyBase update.</p></div></div>` : `<iframe class="min-h-0 flex-1 w-full border-0 bg-white" title="${title}" src="${url}"></iframe>`}</div>`;
    document.body.appendChild(panel);
    panel.querySelector("button").onclick = () => panel.remove();
  }

  window.StudyBaseAccountSidebar = { openPanel };

  document.addEventListener("click", event => {
    if (event.defaultPrevented) return;
    const anchor = event.target.closest?.('a[href^="https://auth.platformbase.online/"]');
    if (!anchor) return;
    event.preventDefault();
    const deleting = new URL(anchor.href).pathname === "/delete";
    openPanel({ title: deleting ? "Delete account" : "Change password", url: anchor.href });
  });

  window.addEventListener("message", event => {
    if (event.origin !== "https://auth.platformbase.online") return;
    if (event.data?.type === "studybase:navigate-top") {
      try {
        const target = new URL(String(event.data.url || ""));
        if (target.origin !== window.location.origin) return;
        window.top.location.replace(target.href);
      } catch (_) {}
      return;
    }
    if (event.data?.type !== "studybase:account-status") return;
    document.getElementById("sb-account-panel")?.remove();
    window.parent.postMessage(event.data, window.location.origin);
  });

  function init() {
    if (document.getElementById("sb-account-sidebar")) return;
    let user = null;
    try { user = JSON.parse(localStorage.getItem("studybase_user") || "null"); } catch (_) {}
    const username = user?.username || "account";
    const initial = ((String(user?.name || username || "s").trim().toLowerCase().match(/[a-z]/) || ["s"])[0]);
    const profilePicture = /^[a-z0-9-]{1,32}\/[a-z0-9-]{1,32}\.jpg$/.test(String(user?.profilePicture || "").toLowerCase()) ? String(user.profilePicture).toLowerCase() : "sbo/1.jpg";
    const pfpUrl = `/assets/images/profile/pfp/${profilePicture}`;
    const current = location.pathname.replace(/\/+$/, "");
    const style = document.createElement("style");
    style.textContent = `
      @media (min-width: 900px) { body { padding-left: 250px; } #sb-account-sidebar { position: fixed; inset: 0 auto 0 0; width: 250px; overflow-y:auto; } }
      @media (max-width: 899px) { #sb-account-sidebar nav { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px; } #sb-account-sidebar small { display:none; } #sb-account-sidebar .sb-brand { margin-bottom:10px; } #sb-account-panel { padding-top:172px; } }
    `;
    document.head.appendChild(style);
    const aside = document.createElement("aside");
    aside.id = "sb-account-sidebar";
    aside.className = "z-40 border-r border-slate-200 bg-white p-4 text-slate-900";
    aside.innerHTML = `<div class="sb-brand mb-5 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-950 p-4 text-white"><div class="flex items-center gap-3"><div class="grid h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/20"><img src="${pfpUrl}" alt="" class="h-full w-full object-cover" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='/assets/images/profile/pfp/sbo/1.jpg'}else{this.hidden=true;this.nextElementSibling.hidden=false}"><span hidden class="grid h-full w-full place-items-center text-lg font-black">${initial.toUpperCase()}</span></div><div><strong class="block text-lg">StudyBase</strong><small class="mt-1 block text-purple-200">@${username}</small></div></div></div><nav class="space-y-2">${links.map((link, index) => { const target = link.href?.startsWith("https://auth.platformbase.online") ? `${link.href}?username=${encodeURIComponent(username)}&site=${encodeURIComponent(location.hostname)}` : link.href || "#"; const active = link.href && new URL(target, location.href).pathname.replace(/\/+$/, "") === current; return `<a href="${target}" data-index="${index}" class="block rounded-xl px-4 py-3 ${active ? "bg-purple-50 text-purple-800" : "text-slate-600 hover:bg-slate-50"}"><strong class="block text-sm">${link.label}</strong><small class="text-xs text-slate-400">${link.sub}</small></a>`; }).join("")}</nav>`;
    document.body.prepend(aside);
    aside.querySelectorAll("[data-index]").forEach(anchor => {
      const link = links[Number(anchor.dataset.index)];
      if (!link.action) return;
      anchor.onclick = event => {
        event.preventDefault();
        openPanel({ title: `${link.label} settings`, url: anchor.href, comingSoon: link.action === "coming" });
      };
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
