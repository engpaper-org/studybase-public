(function () {
  const ENDPOINT =
    window.SB_APG_ENDPOINT ||
    "https://alert-api.revisionbase.site/apg/list";

  const REQUEST_PAGE = "/assets/apg/request.html";

  let apgItems = [];

  async function getApgEndpoint() {
    if (window.SB_APG_ENDPOINT) return window.SB_APG_ENDPOINT;

    if (window.SiteConfig && window.SiteConfig.ready) {
      const config = await window.SiteConfig.ready;
      return config?.endpoints?.apgList || ENDPOINT;
    }

    return window.SB_CONFIG?.endpoints?.apgList || ENDPOINT;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getDeviceCode() {
    return (localStorage.getItem("gh_device") || "").trim();
  }

  function getInitials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "AP";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

    function hideSection() {
    const section = document.getElementById("apg-section");
    const rail = document.getElementById("apg-rail");
    const subtitle = document.getElementById("apg-subtitle");

    if (rail) rail.innerHTML = "";
    if (subtitle) subtitle.textContent = "There are no birthdays this week yet. You can request one to be added.";
    if (section) section.classList.remove("hidden");
  }

  function showSection() {
    const section = document.getElementById("apg-section");
    if (section) section.classList.remove("hidden");
  }

  function isImageUrl(url) {
  const clean = String(url || "").split("?")[0].split("#")[0].toLowerCase();
  return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(clean);
}

function openApgModal(item) {
  if (!item || !item.imageUrl) return;

  const modal = document.getElementById("apg-modal");
  const iframe = document.getElementById("apg-iframe");
  const image = document.getElementById("apg-image");
  const name = document.getElementById("apg-modal-name");
  const date = document.getElementById("apg-modal-date");

  if (!modal || !iframe || !image || !name || !date) return;

  name.textContent = item.name || "Birthday story";
  date.textContent = item.date || "This week";

  iframe.classList.add("hidden");
  image.classList.add("hidden");
  iframe.src = "";
  image.src = "";
  image.alt = item.name || "Birthday story";

  if (isImageUrl(item.imageUrl)) {
    image.src = item.imageUrl;
    image.classList.remove("hidden");
  } else {
    iframe.src = item.imageUrl;
    iframe.classList.remove("hidden");
  }

  modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

  function closeApgModal() {
  const modal = document.getElementById("apg-modal");
  const iframe = document.getElementById("apg-iframe");
  const image = document.getElementById("apg-image");
  const name = document.getElementById("apg-modal-name");
  const date = document.getElementById("apg-modal-date");

  if (modal) modal.classList.add("hidden");
  if (iframe) {
    iframe.src = "";
    iframe.classList.add("hidden");
  }
  if (image) {
    image.src = "";
    image.classList.add("hidden");
  }
  if (name) name.textContent = "Birthday story";
  if (date) date.textContent = "This week";

  document.body.classList.remove("overflow-hidden");
}

  function openApgRequestModal() {
    const modal = document.getElementById("apg-request-modal");
    const iframe = document.getElementById("apg-request-iframe");

    if (!modal || !iframe) return;

    iframe.src = REQUEST_PAGE;
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }

  function closeApgRequestModal() {
    const modal = document.getElementById("apg-request-modal");
    const iframe = document.getElementById("apg-request-iframe");

    if (modal) modal.classList.add("hidden");
    if (iframe) iframe.src = "";
    document.body.classList.remove("overflow-hidden");
  }

  function createStoryButton(item, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "apg-story-btn animate-enter";
    button.style.animationDelay = `${Math.min(index, 12) * 45}ms`;

    const safeName = escapeHtml(item.name || "Birthday");
    const safeDate = escapeHtml(item.date || "");
    const initials = escapeHtml(getInitials(item.name));

    button.innerHTML = `
      <div class="apg-story-ring">
        <div class="apg-story-inner">
          <img
            src="${escapeHtml(item.thumbUrl || item.imageUrl)}"
            alt="${safeName}"
            loading="lazy"
            onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: 'apg-story-fallback', textContent: '${initials}' }))"
          >
        </div>
      </div>
      <span class="apg-story-name">${safeName}</span>
      <span class="apg-story-date">${safeDate}</span>
    `;

    button.addEventListener("click", () => openApgModal(item));
    return button;
  }

  function createRequestButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "apg-request-btn animate-enter";
    button.style.animationDelay = "0ms";

    button.innerHTML = `
      <div class="apg-request-ring">
        <div class="apg-request-inner">
          <i class="fas fa-plus"></i>
        </div>
      </div>
      <span class="apg-story-name">Request</span>
      <span class="apg-story-date">Be added</span>
    `;

    button.addEventListener("click", openApgRequestModal);
    return button;
  }

    function renderApg(items) {
    const rail = document.getElementById("apg-rail");
    const subtitle = document.getElementById("apg-subtitle");

    if (!rail) return;

    rail.innerHTML = "";

    const fragment = document.createDocumentFragment();
    fragment.appendChild(createRequestButton());

    items.forEach((item, index) => {
      fragment.appendChild(createStoryButton(item, index + 1));
    });

    rail.appendChild(fragment);

    if (subtitle) {
      if (!items.length) {
        subtitle.textContent = "There are no birthdays this week yet. You can request one to be added.";
      } else if (items.length === 1) {
        subtitle.textContent = "1 birthday this week. Closest first.";
      } else {
        subtitle.textContent = `${items.length} birthdays this week. Closest first.`;
      }
    }

    showSection();
  }

  async function loadApg() {
  const endpoint = await getApgEndpoint();
  const deviceCode = getDeviceCode();

  if (!deviceCode) {
    // no device at all → definitely not authorised
    const section = document.getElementById("apg-section");
    if (section) section.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ deviceCode })
    });

    // hard block for unauthorised responses
    if (res.status === 401 || res.status === 403) {
      const section = document.getElementById("apg-section");
      if (section) section.classList.add("hidden");
      return;
    }

    if (!res.ok) {
      throw new Error(`APG request failed with ${res.status}`);
    }

    const data = await res.json();

    // 🔑 THIS IS THE IMPORTANT PART
    if (!data || data.authorised !== true) {
      const section = document.getElementById("apg-section");
      if (section) section.classList.add("hidden");
      return;
    }

    const cards = Array.isArray(data.cards) ? data.cards : [];

    apgItems = cards
      .filter(item => item && item.name && item.imageUrl)
      .map(item => ({
        name: String(item.name || "").trim(),
        birthday: String(item.birthday || "").trim(),
        date: String(item.date || "").trim(),
        imageUrl: String(item.imageUrl || "").trim(),
        thumbUrl: String(item.thumbUrl || item.imageUrl || "").trim()
      }));

    // always render (even if empty → shows request button)
    renderApg(apgItems);

  } catch (error) {
    console.error("Failed to load APG:", error);

    // on error → hide completely
    const section = document.getElementById("apg-section");
    if (section) section.classList.add("hidden");
  }
}

  document.addEventListener("click", function (event) {
    if (event.target && event.target.id === "apg-modal") {
      closeApgModal();
    }
    if (event.target && event.target.id === "apg-request-modal") {
      closeApgRequestModal();
    }
  });

  window.addEventListener("storage", function (event) {
    if (event.key === "gh_device") {
      loadApg();
    }
  });

  window.openApgModal = openApgModal;
  window.closeApgModal = closeApgModal;
  window.openApgRequestModal = openApgRequestModal;
  window.closeApgRequestModal = closeApgRequestModal;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadApg);
  } else {
    loadApg();
  }
})();
