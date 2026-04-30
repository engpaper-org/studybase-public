(function () {
  const ACCENTS = {
    blue: {
      chip: "bg-blue-50 text-blue-600 border-blue-100",
      gradient: "from-blue-600 to-cyan-500",
      button: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
      subtle: "bg-blue-50 border-blue-100",
      emphasis: "text-blue-600",
    },
    purple: {
      chip: "bg-purple-50 text-purple-600 border-purple-100",
      gradient: "from-purple-600 to-fuchsia-500",
      button: "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20",
      subtle: "bg-purple-50 border-purple-100",
      emphasis: "text-purple-600",
    },
    emerald: {
      chip: "bg-emerald-50 text-emerald-600 border-emerald-100",
      gradient: "from-emerald-600 to-teal-500",
      button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
      subtle: "bg-emerald-50 border-emerald-100",
      emphasis: "text-emerald-600",
    },
    rose: {
      chip: "bg-rose-50 text-rose-600 border-rose-100",
      gradient: "from-rose-600 to-orange-500",
      button: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20",
      subtle: "bg-rose-50 border-rose-100",
      emphasis: "text-rose-600",
    },
  };

  const CALLOUT_STYLES = {
    blue: "border-blue-100 bg-blue-50/80",
    purple: "border-purple-100 bg-purple-50/80",
    emerald: "border-emerald-100 bg-emerald-50/80",
    rose: "border-rose-100 bg-rose-50/80",
    amber: "border-amber-100 bg-amber-50/80",
  };

  function renderRelatedItem(item, library) {
    const related = typeof item === "string" ? library[item] : item;
    if (!related) {
      return "";
    }

    const href = related.path || related.href;
    return [
      '<a href="' + href + '" class="support-side-link block rounded-2xl border border-slate-100 px-4 py-4">',
      '  <p class="font-bold text-slate-800 mb-1">' + related.title + "</p>",
      '  <p class="text-sm text-slate-500 leading-6">' + (related.description || "") + "</p>",
      "</a>",
    ].join("");
  }

  function renderButtons(buttons, accent) {
    if (!buttons || !buttons.length) {
      return "";
    }

    return buttons
      .map(function (button) {
        const className = button.primary
          ? "inline-flex items-center gap-2 rounded-2xl text-white px-5 py-3.5 font-bold shadow-lg transition-colors " + accent.button
          : "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white text-slate-700 px-5 py-3.5 font-bold hover:bg-slate-50 transition-colors";

        return (
          '<a href="' +
          button.href +
          '" class="' +
          className +
          '">' +
          button.label +
          ' <i class="fa-solid fa-arrow-right"></i></a>'
        );
      })
      .join("");
  }

  function renderCards(cards, columns) {
    if (!cards || !cards.length) {
      return "";
    }

    const columnClass = columns === 3 ? "lg:grid-cols-3" : "md:grid-cols-2";

    return [
      '<div class="grid grid-cols-1 ' + columnClass + ' gap-4 my-6">',
      cards
        .map(function (card) {
          const inner = [
            '<div class="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">',
            '  <i class="fa-solid ' + (card.icon || "fa-circle-info") + '"></i>',
            "</div>",
            '<h3 class="!mt-0 !mb-2">' + card.title + "</h3>",
            '<p class="!mb-0">' + card.body + "</p>",
            card.href
              ? '<div class="mt-4"><span class="inline-flex items-center gap-2 text-sm font-bold text-blue-600">' +
                (card.label || "Open page") +
                ' <i class="fa-solid fa-arrow-right text-xs"></i></span></div>'
              : "",
          ].join("");

          if (card.href) {
            return (
              '<a href="' +
              card.href +
              '" class="support-card-shell block rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">' +
              inner +
              "</a>"
            );
          }

          return (
            '<div class="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">' +
            inner +
            "</div>"
          );
        })
        .join(""),
      "</div>",
    ].join("");
  }

  function renderList(items, ordered) {
    if (!items || !items.length) {
      return "";
    }

    const tag = ordered ? "ol" : "ul";
    const listClass = ordered ? "list-decimal" : "list-disc";

    return (
      "<" +
      tag +
      ' class="' +
      listClass +
      '">' +
      items.map(function (item) {
        return "<li>" + item + "</li>";
      }).join("") +
      "</" +
      tag +
      ">"
    );
  }

  function renderFaq(faq) {
    if (!faq || !faq.length) {
      return "";
    }

    return [
      '<div class="space-y-4 my-6">',
      faq
        .map(function (item) {
          return [
            '<details class="support-faq-item rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">',
            '  <summary class="support-faq-summary flex cursor-pointer items-center justify-between gap-4 font-bold text-slate-900">',
            "    <span>" + item.question + "</span>",
            '    <i class="fa-solid fa-chevron-down text-xs text-slate-400"></i>',
            "  </summary>",
            '  <div class="pt-4 text-sm text-slate-600 leading-7">' + item.answer + "</div>",
            "</details>",
          ].join("");
        })
        .join(""),
      "</div>",
    ].join("");
  }

  function renderCallout(callout, accentName) {
    if (!callout) {
      return "";
    }

    const tone = CALLOUT_STYLES[callout.tone || accentName] || CALLOUT_STYLES.blue;

    return [
      '<div class="support-callout rounded-[1.5rem] border p-5 my-6 ' + tone + '">',
      '  <div class="flex items-start gap-4">',
      '    <div class="w-11 h-11 rounded-2xl bg-white text-slate-700 flex items-center justify-center shrink-0">',
      '      <i class="fa-solid fa-circle-info"></i>',
      "    </div>",
      "    <div>",
      '      <h3 class="!mt-0 !mb-2">' + callout.title + "</h3>",
      '      <p class="!mb-0">' + callout.body + "</p>",
      "    </div>",
      "  </div>",
      "</div>",
    ].join("");
  }

  function renderSection(section, accentName) {
    return [
      '<section id="' + section.id + '" class="scroll-mt-32">',
      "  <h2>" + section.title + "</h2>",
      (section.paragraphs || [])
        .map(function (paragraph) {
          return "<p>" + paragraph + "</p>";
        })
        .join(""),
      renderCards(section.cards, section.columns),
      renderList(section.orderedList, true),
      renderList(section.bullets, false),
      renderFaq(section.faq),
      renderCallout(section.callout, accentName),
      "</section>",
    ].join("");
  }

  function fallbackMarkup() {
    return [
      '<main class="flex-grow py-32 px-6">',
      '  <div class="max-w-3xl mx-auto bg-white border border-slate-200 rounded-[2rem] p-10 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">',
      '    <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-6">',
      '      <i class="fa-solid fa-circle-exclamation text-2xl"></i>',
      "    </div>",
      '    <h1 class="text-3xl font-black text-slate-900 mb-4">Support page not found</h1>',
      '    <p class="text-slate-500 leading-7 mb-8">This support article could not be loaded. Head back to the help centre and choose another route.</p>',
      '    <a href="/support/help_center.html" class="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-6 py-3.5 font-bold hover:bg-slate-800 transition-colors">Back to help centre <i class="fa-solid fa-arrow-right"></i></a>',
      "  </div>",
      "</main>",
    ].join("");
  }

  function initPage() {
    const root = document.getElementById("support-article-app");
    const library = window.SUPPORT_ARTICLES || {};
    const article = library[window.SUPPORT_ARTICLE_KEY];

    if (!root || !article) {
      if (root) {
        root.innerHTML = fallbackMarkup();
      }
      return;
    }

    const accent = ACCENTS[article.accent] || ACCENTS.blue;
    const sensitiveChip = article.sensitive
      ? '<div class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"><i class="fa-solid fa-arrow-right-from-bracket ' +
        accent.emphasis +
        '"></i>Quick exit enabled</div>'
      : "";

    document.title =
      article.title + " | " + (window.SiteConfig?.get("brand.name", "RevisionBase") || "RevisionBase") + " Support";

    root.innerHTML = [
      '<header class="relative overflow-hidden pt-32 pb-12 px-6 border-b border-slate-200/80">',
      '  <div class="max-w-7xl mx-auto relative">',
      '    <div class="support-glass-panel rounded-[2rem] border border-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.06)] px-6 py-10 md:px-10 md:py-12 support-animate-enter">',
      '      <div class="max-w-4xl">',
      '        <a href="/support/help_center.html" class="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-5"><i class="fa-solid fa-arrow-left"></i>Back to Help Centre</a>',
      '        <span class="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border text-[11px] font-extrabold uppercase tracking-[0.2em] mb-5 ' +
        accent.chip +
        '"><i class="fa-solid ' +
        article.icon +
        ' text-[10px]"></i>' +
        article.eyebrow +
        "</span>",
      '        <h1 class="text-4xl md:text-5xl font-black mb-4 tracking-tight text-slate-900 leading-tight">' +
        article.title +
        ' <span class="text-transparent bg-clip-text bg-gradient-to-r ' +
        accent.gradient +
        '">guide.</span></h1>',
      '        <p class="text-base md:text-lg text-slate-500 max-w-3xl leading-relaxed mb-6">' + article.intro + "</p>",
      '        <div class="flex flex-wrap gap-3">',
      '          <div class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"><i class="fa-regular fa-clock ' +
        accent.emphasis +
        '"></i>' +
        article.readTime +
        "</div>",
      '          <div class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"><i class="fa-solid fa-folder-open ' +
        accent.emphasis +
        '"></i>' +
        article.category +
        "</div>",
      '          <div class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"><i class="fa-solid fa-wand-magic-sparkles ' +
        accent.emphasis +
        '"></i>Last updated: ' +
        article.updated +
        "</div>",
      sensitiveChip,
      "        </div>",
      "      </div>",
      "    </div>",
      "  </div>",
      "</header>",
      '<main class="flex-grow py-16 px-6">',
      '  <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10">',
      '    <article class="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgba(15,23,42,0.04)] support-prose support-animate-enter">',
      '      <div class="support-callout rounded-[1.5rem] border p-5 mb-8 ' + accent.subtle + '">',
      '        <div class="flex items-start gap-4">',
      '          <div class="w-11 h-11 rounded-2xl bg-white ' + accent.emphasis + ' flex items-center justify-center shrink-0"><i class="fa-solid fa-lightbulb"></i></div>',
      "          <div>",
      '            <h3 class="!mt-0 !mb-2">Quick summary</h3>',
      '            <p class="!mb-0">' + article.summary + "</p>",
      "          </div>",
      "        </div>",
      "      </div>",
      article.sections
        .map(function (section) {
          return renderSection(section, article.accent);
        })
        .join(""),
      article.cta
        ? [
            '<div class="support-callout rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 mt-8">',
            "  <div>",
            '    <h3 class="!mt-0 !mb-2">' + article.cta.title + "</h3>",
            '    <p>' + article.cta.body + "</p>",
            '    <div class="flex flex-wrap gap-3 mt-4">' + renderButtons(article.cta.buttons, accent) + "</div>",
            "  </div>",
            "</div>",
          ].join("")
        : "",
      "    </article>",
      '    <aside class="space-y-6 support-animate-enter" style="animation-delay: 70ms;">',
      '      <div class="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">',
      '        <p class="text-sm font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">On this page</p>',
      '        <nav class="space-y-2">',
      article.sections
        .map(function (section) {
          return (
            '<a href="#' +
            section.id +
            '" class="support-side-link flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-100">' +
            section.title +
            '<i class="fa-solid fa-chevron-right text-slate-300 text-xs"></i></a>'
          );
        })
        .join(""),
      "        </nav>",
      "      </div>",
      article.related && article.related.length
        ? [
            '<div class="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">',
            '  <p class="text-sm font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">Related pages</p>',
            '  <div class="space-y-3">',
            article.related
              .map(function (item) {
                return renderRelatedItem(item, library);
              })
              .join(""),
            "  </div>",
            "</div>",
          ].join("")
        : "",
      article.sidebarCard
        ? [
            '<div class="rounded-[2rem] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)] bg-gradient-to-br ' +
              accent.gradient +
              '">',
            '  <p class="text-xs font-black uppercase tracking-[0.18em] text-white/70 mb-2">' + article.sidebarCard.eyebrow + "</p>",
            '  <h3 class="text-2xl font-black mb-3">' + article.sidebarCard.title + "</h3>",
            '  <p class="text-white/85 leading-7 text-sm mb-5">' + article.sidebarCard.body + "</p>",
            article.sidebarCard.href
              ? '<a href="' +
                article.sidebarCard.href +
                '" class="inline-flex items-center gap-2 rounded-2xl bg-white text-slate-900 px-5 py-3 font-bold hover:bg-slate-100 transition-colors">' +
                article.sidebarCard.label +
                ' <i class="fa-solid fa-arrow-right"></i></a>'
              : "",
            "</div>",
          ].join("")
        : "",
      "    </aside>",
      "  </div>",
      "</main>",
    ].join("");

    if (article.sensitive && typeof window.initSensitivePageSafety === "function") {
      window.initSensitivePageSafety(article.sensitive);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
