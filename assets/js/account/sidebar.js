(function () {
  const links = [
    ["Overview", "/myaccount/account.html", "Account summary"],
    ["Settings", "/myaccount/settings.html", "Synced preferences"],
    ["Password", "https://auth.studybase.site/change-password", "Security credentials"],
    ["Delete", "https://auth.studybase.site/delete", "Permanent removal"]
  ];

  function init() {
    if (document.getElementById("sb-account-sidebar")) return;
    let user = null;
    try { user = JSON.parse(localStorage.getItem("studybase_user") || "null"); } catch (_) {}
    const username = user?.username || "account";
    const current = location.pathname.replace(/\/+$/, "");
    const style = document.createElement("style");
    style.textContent = `
      @media (min-width: 900px) { body { padding-left: 250px; } #sb-account-sidebar { position: fixed; inset: 0 auto 0 0; width: 250px; } }
      @media (max-width: 899px) { #sb-account-sidebar nav { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); } #sb-account-sidebar small { display:none; } }
    `;
    document.head.appendChild(style);
    const aside = document.createElement("aside");
    aside.id = "sb-account-sidebar";
    aside.className = "z-40 border-r border-slate-200 bg-white p-4 text-slate-900";
    aside.innerHTML = `<div class="mb-5 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-950 p-4 text-white"><strong class="block text-lg">StudyBase</strong><small class="mt-1 block text-purple-200">@${username}</small></div><nav class="space-y-2">${links.map(([label, href, sub]) => { const target = href.startsWith("https://auth.studybase.site") ? `${href}?username=${encodeURIComponent(username)}` : href; const active = new URL(target, location.href).pathname.replace(/\/+$/, "") === current; return `<a href="${target}" class="block rounded-xl px-4 py-3 ${active ? "bg-purple-50 text-purple-800" : "text-slate-600 hover:bg-slate-50"}"><strong class="block text-sm">${label}</strong><small class="text-xs text-slate-400">${sub}</small></a>`; }).join("")}</nav>`;
    document.body.prepend(aside);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
