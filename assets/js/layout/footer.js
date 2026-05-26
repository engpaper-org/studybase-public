(function () {
  const columns = [
    {
      title: "Revise",
      links: [
        ["/r/index.html#client-preflight", "Resource Database"],
        ["/past_papers/index.html", "Past papers"],
        ["/subjects/index.html", "Subjects"]
      ]
    },
    {
      title: "Plan",
      links: [
        ["/alevel.html", "A-Level route"],
        ["/exam-planner.html", "Exam planner"],
        ["/mistake-log.html", "Mistake log"]
      ]
    },
    {
      title: "Help",
      links: [
        ["/support/help_center.html", "Support"],
        ["/faq.html", "FAQ"],
        ["/contact.html", "Contact"]
      ]
    },
    {
      title: "Legal",
      links: [
        ["/legal/privacy.html", "Privacy"],
        ["/legal/tos.html", "Terms"],
        ["/legal/disclaimer.html", "Disclaimer"]
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
          <img src="/assets/images/site-icons/navbar.png" alt="StudyBase logo">
          <div>
            <strong>StudyBase</strong>
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
