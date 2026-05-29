(function () {
  const columns = [
    {
      title: "Revise",
      links: [
        ["/r/index.html#client-preflight", "Resource Database"],
        ["/past_papers/index.html", "Past Papers"],
        ["/subjects/index.html", "Subject Routes"]
      ]
    },
    {
      title: "Tools",
      links: [
        ["/tools/", "All Study Tools"],
        ["/tools/planning/", "Planning & Command Centre"],
        ["/tools/mathematics/", "Mathematics Tools"],
        ["/tools/sciences/", "Sciences Tools"]
      ]
    },
    {
      title: "More Tools",
      links: [
        ["/tools/humanities/", "Humanities & Essays"],
        ["/tools/compsci/", "Computer Science"],
        ["/tools/languages/", "Languages & EPQ"]
      ]
    },
    {
      title: "Support",
      links: [
        ["/support/help_center.html", "Help Centre"],
        ["/faq.html", "FAQ"],
        ["/support/contact.html", "Contact support"]
      ]
    }
  ];

  function render() {
    if (document.getElementById("sbx-footer")) return;
    const footer = document.createElement("footer");
    footer.id = "sbx-footer";
    footer.className = "sbx-footer";
    footer.innerHTML = `
      <div class="sbx-footer-inner">
        <div class="sbx-footer-brand">
          <img src="/assets/images/site-icons/genie-avatar.svg" alt="StudyBase logo" style="border:none;">
          <div>
            <strong data-brand>StudyBase</strong>
            <p>A-Level revision remastered around papers, marking and useful next steps.</p>
          </div>
        </div>
        <div class="sbx-footer-grid">
          ${columns.map((column) => `
            <div>
              <h3>${column.title}</h3>
              ${column.links.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}
            </div>
          `).join("")}
        </div>
      </div>
    `;
    document.body.appendChild(footer);
  }

  function ensureStyles() {
    return;
  }

  function start() {
    ensureStyles();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
