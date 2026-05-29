window.SUPPORT_ARTICLES = {
  "getting-started": {
    path: "/support/getting-started.html",
    title: "Getting started",
    eyebrow: "Getting started",
    icon: "fa-play",
    accent: "blue",
    description: "Learn the basics of RevisionBase, where to find resources, and how to settle in quickly.",
    intro:
      "If you are new to RevisionBase, start here. This page shows you the easiest places to begin, what each section does, and where to go next if something feels confusing.",
    readTime: "3 min read",
    category: "New users",
    updated: "April 2026",
    summary:
      "Start with the resource vault, study tools, and support pages. You do not need to use everything at once.",
    sections: [
      {
        id: "start-here",
        title: "Start here",
        cards: [
          {
            title: "Resource vault",
            body: "Browse subjects, revision materials, and study content from the main database.",
            icon: "fa-book-open",
            href: "/r/index.html#client-preflight",
            label: "Open resource vault",
          },
          {
            title: "Study study tools",
            body: "Use timers, planners, breathing tools, and study methods when you need structure.",
            icon: "fa-toolbox",
            href: "/tools/",
            label: "Open study tools",
          },
          {
            title: "My account",
            body: "Sign in, manage your account, and access account pages when you need them.",
            icon: "fa-user-gear",
            href: "/myaccount/login.html",
            label: "Open login",
          },
        ],
        columns: 3,
      },
      {
        id: "first-five-minutes",
        title: "Your first five minutes",
        orderedList: [
          "Open the <a href='/r/index.html#client-preflight'>resource vault</a> or <a href='/subjects/index.html'>subject pages</a> and pick one subject.",
          "Open the <a href='/tools/'>study tools</a> only when you want extra structure, not because you feel you have to use every tool.",
          "If you want saved settings or account features, sign in through <a href='/myaccount/login.html'>the login page</a>.",
          "Bookmark the <a href='/support/help_center.html'>help centre</a> so you have a clear fallback if a page is confusing or not loading.",
        ],
      },
      {
        id: "need-help",
        title: "If you get stuck",
        bullets: [
          "Use the search box on the help centre to find support pages quickly.",
          "If a resource is broken or missing, send it through <a href='/report.html'>the issue report form</a>.",
          "If the site looks unavailable overnight, check the <a href='/support/info/time.html'>maintenance article</a> before retrying.",
        ],
      },
    ],
    related: ["resources", "faq", "account"],
    sidebarCard: {
      eyebrow: "Good next step",
      title: "Start simple",
      body: "Choose one subject page or one tool. You can always come back later for the rest.",
      href: "/r/index.html#client-preflight",
      label: "Browse resources",
    },
    cta: {
      title: "Ready to explore?",
      body: "Start with the areas most students use first.",
      buttons: [
        { label: "Browse resources", href: "/r/index.html#client-preflight", primary: true },
        { label: "Open study tools", href: "/tools/" },
      ],
    },
  },
  account: {
    path: "/support/account.html",
    title: "Account help",
    eyebrow: "Account",
    icon: "fa-user-gear",
    accent: "blue",
    description: "Get help with sign in, device access, verification, and common account routes.",
    intro:
      "Use this page for the most common account issues: signing in, checking device access, updating details, and finding the right route if the issue is a restriction rather than a normal login problem.",
    readTime: "4 min read",
    category: "Account support",
    updated: "April 2026",
    summary:
      "Start with login, your current browser session, and device checks. If the issue looks like a ban or restriction, use the dedicated support pages instead of repeatedly retrying.",
    sections: [
      {
        id: "common-account-issues",
        title: "Common account issues",
        cards: [
          {
            title: "Cannot sign in",
            body: "Check the login route first, then try a fresh browser session before assuming the account is broken.",
            icon: "fa-key",
          },
          {
            title: "Device not recognised",
            body: "Some account features depend on device checks. If your device is blocked, review the compatibility guidance.",
            icon: "fa-laptop",
            href: "/support/info/restricted_device_type.html",
            label: "Read device guidance",
          },
          {
            title: "Restriction or ban notice",
            body: "If you are seeing a moderation or ban message, the next step is the account restriction guidance or an appeal.",
            icon: "fa-ban",
            href: "/support/ban/account_ban.html",
            label: "Read restriction article",
          },
        ],
        columns: 3,
      },
      {
        id: "steps-to-try",
        title: "Steps to try",
        orderedList: [
          "Open <a href='/myaccount/login.html'>the login page</a> and try a fresh sign-in.",
          "Double-check that your saved details, browser profile, or autofill are not sending the wrong account information.",
          "If the page loads but account tools behave oddly, sign out, reload, and sign back in once.",
          "If the site is unavailable late at night, check the <a href='/support/info/time.html'>maintenance page</a> before retrying.",
          "If the message mentions moderation, restriction, or a ban, use the correct support route instead of repeating login attempts.",
        ],
      },
      {
        id: "extra-checks",
        title: "Extra checks",
        bullets: [
          "Make sure your browser is up to date and not blocking essential scripts for the login page.",
          "If you use a shared device, confirm that another person's saved login is not interfering.",
          "If the problem follows one device only, compare it with the <a href='/support/info/restricted_device_type.html'>device restriction article</a>.",
        ],
      },
    ],
    related: ["login", "privacy", "contact"],
    sidebarCard: {
      eyebrow: "Account routes",
      title: "Need to appeal instead?",
      body: "If the issue is a ban or restriction, head to the appeal page rather than retrying the login flow.",
      href: "/support/ban/appeal.html",
      label: "Open appeal page",
    },
    cta: {
      title: "Open the right route",
      body: "Choose the route that matches what you are seeing.",
      buttons: [
        { label: "Open login", href: "/myaccount/login.html", primary: true },
        { label: "Read ban guidance", href: "/support/ban/account_ban.html" },
      ],
    },
  },
  login: {
    path: "/support/login.html",
    title: "Login and access",
    eyebrow: "Login",
    icon: "fa-key",
    accent: "blue",
    description: "Troubleshoot sign-in issues, blocked sessions, and account entry problems.",
    intro:
      "This page focuses on getting into your account safely. If the sign-in flow is failing, use these steps before assuming your account has been deleted or permanently blocked.",
    readTime: "4 min read",
    category: "Sign in help",
    updated: "April 2026",
    summary:
      "Most sign-in issues come from the current browser session, saved details, maintenance windows, or device restrictions.",
    sections: [
      {
        id: "quick-fixes",
        title: "Quick fixes",
        orderedList: [
          "Try <a href='/myaccount/login.html'>the login page</a> in a fresh tab.",
          "Check that the right account details are being entered and that old autofill values are not being reused.",
          "Reload the page once, then try again in a private window or a second browser if the first attempt still fails.",
          "If the entire site feels unavailable late at night, check the <a href='/support/info/time.html'>maintenance article</a>.",
          "If the page says your device or account is restricted, switch to the matching support article instead of retrying the same step.",
        ],
      },
      {
        id: "if-you-still-cannot-sign-in",
        title: "If you still cannot sign in",
        cards: [
          {
            title: "Maintenance window",
            body: "Late-night downtime can temporarily block account access while the site is being updated.",
            icon: "fa-clock",
            href: "/support/info/time.html",
            label: "Check maintenance article",
          },
          {
            title: "Device restriction",
            body: "Some devices or environments are blocked to protect platform stability and account safety.",
            icon: "fa-shield-halved",
            href: "/support/info/restricted_device_type.html",
            label: "Read device guidance",
          },
          {
            title: "Restriction or ban",
            body: "If a moderation action is involved, use the dedicated restriction and appeal pages.",
            icon: "fa-ban",
            href: "/support/ban/account_ban.html",
            label: "Open restriction article",
          },
        ],
        columns: 3,
      },
      {
        id: "safe-login-habits",
        title: "Safe login habits",
        bullets: [
          "Do not share account details or rely on a shared browser profile if you can avoid it.",
          "Log out properly if you move between shared devices.",
          "If you think account access has changed unexpectedly, review the <a href='/support/privacy.html'>privacy and safety page</a> as well.",
        ],
      },
    ],
    related: ["account", "privacy", "contact"],
    sidebarCard: {
      eyebrow: "Still blocked?",
      title: "Use the best route next",
      body: "If sign-in is failing because of a restriction, go straight to the relevant guidance instead of retrying.",
      href: "/support/account.html",
      label: "Open account help",
    },
    cta: {
      title: "Try again with the correct context",
      body: "Use the login page if it is a normal access problem, or switch to account support if the issue looks wider.",
      buttons: [
        { label: "Open login page", href: "/myaccount/login.html", primary: true },
        { label: "Account help", href: "/support/account.html" },
      ],
    },
  },
  resources: {
    path: "/support/resources.html",
    title: "Resources support",
    eyebrow: "Resources",
    icon: "fa-book-open",
    accent: "purple",
    description: "Find materials faster and troubleshoot resource pages that do not open correctly.",
    intro:
      "Use this page to understand where resources live on RevisionBase, what to do if a page or file does not load, and when to report a problem instead of retrying the same route.",
    readTime: "4 min read",
    category: "Resource support",
    updated: "April 2026",
    summary:
      "Most resource issues are routing problems, browser issues, missing files, or maintenance. Start with the correct content area, then report broken items clearly.",
    sections: [
      {
        id: "where-to-look",
        title: "Where to look",
        cards: [
          {
            title: "Resource vault",
            body: "The main database is the quickest way to browse structured materials.",
            icon: "fa-database",
            href: "/r/index.html#client-preflight",
            label: "Open vault",
          },
          {
            title: "Subject pages",
            body: "If you already know the subject, use the subject index to jump directly to it.",
            icon: "fa-folder-open",
            href: "/subjects/index.html",
            label: "Open subjects",
          },
          {
            title: "Study pages",
            body: "Broader guidance, hubs, and planning content live in the study pages area.",
            icon: "fa-compass",
            href: "/study_pages/wellbeingHub.html",
            label: "Open study pages",
          },
        ],
        columns: 3,
      },
      {
        id: "resource-wont-load",
        title: "If a resource will not load",
        orderedList: [
          "Refresh the page once and confirm that the route is correct.",
          "Try opening the same item from the nearest index page, such as <a href='/r/index.html#client-preflight'>the resource vault</a> or <a href='/subjects/index.html'>subject pages</a>.",
          "Check whether the problem only happens in one browser or one device.",
          "If the issue is a specific missing file, 404, or broken control, report it through <a href='/report.html'>the issue report form</a>.",
        ],
      },
      {
        id: "common-reasons",
        title: "Common reasons",
        bullets: [
          "The page link is outdated or the file has moved.",
          "A browser extension is blocking something important on the page.",
          "The resource depends on older content that your browser is handling poorly.",
          "The site is inside a maintenance window and access is temporarily limited.",
        ],
      },
    ],
    related: ["getting-started", "faq", "contact"],
    sidebarCard: {
      eyebrow: "Report route",
      title: "Broken page or missing file?",
      body: "The report form is the fastest route if one specific item is failing to load.",
      href: "/report.html",
      label: "Report an issue",
    },
    cta: {
      title: "Use the right resource route",
      body: "Start from an index page when possible, then report anything that still looks broken.",
      buttons: [
        { label: "Open resource vault", href: "/r/index.html#client-preflight", primary: true },
        { label: "Report an issue", href: "/report.html" },
      ],
    },
  },
  privacy: {
    path: "/support/privacy.html",
    title: "Privacy and safety",
    eyebrow: "Safety",
    icon: "fa-shield-halved",
    accent: "emerald",
    description: "Understand online privacy, personal details, secrecy, and the main safeguarding routes for worrying online situations.",
    intro:
      "This page is about keeping yourself safer online. If someone is pushing for personal details, secrecy, or a more private chat, these are the clearest next routes to use.",
    readTime: "4 min read",
    category: "Privacy and safety",
    updated: "April 2026",
    summary:
      "Protect your details, trust warning signs, and move to the matching safeguarding page when a conversation starts feeling wrong.",
    sections: [
      {
        id: "pages-to-read",
        title: "Safety pages to open",
        cards: [
          {
            title: "If something online feels wrong",
            body: "Use this when a chat becomes pushy, unsettling, secretive, or manipulative.",
            icon: "fa-triangle-exclamation",
            href: "/support/online-warning-signs.html",
            label: "Open warning signs page",
          },
          {
            title: "Keep personal details private",
            body: "A clear page on what counts as personal information and what to do if someone keeps pushing for it.",
            icon: "fa-id-card",
            href: "/support/personal-details-safety.html",
            label: "Open details safety page",
          },
          {
            title: "Private chat pressure",
            body: "Use this if someone is trying to move you somewhere more private or urgent.",
            icon: "fa-comments",
            href: "/support/private-chat-pressure.html",
            label: "Open private chat page",
          },
        ],
        columns: 3,
      },
      {
        id: "keep-yourself-safer-online",
        title: "Keep yourself safer online",
        bullets: [
          "Be careful with your full name, school, address, phone number, passwords, private links, photos, and live location.",
          "Pressure to keep things secret or move chats somewhere more private can be a warning sign, not a reason to trust someone more.",
          "You do not have to stay in a chat that feels wrong just because the other person keeps replying.",
        ],
      },
      {
        id: "if-a-chat-feels-wrong",
        title: "If a chat or request feels wrong",
        orderedList: [
          "Pause the conversation and stop sending anything personal.",
          "Keep screenshots, usernames, or messages if that may help later.",
          "Open the page that best fits what is happening, such as <a href='/support/keep-it-secret.html'>keep it secret</a>, <a href='/support/private-chat-pressure.html'>private chat pressure</a>, or <a href='/support/threats-and-blackmail.html'>threats and blackmail</a>.",
          "Tell a trusted adult or person if the pressure keeps building or fear is involved.",
        ],
      },
    ],
    related: ["online-warning-signs", "personal-details-safety", "private-chat-pressure"],
    sidebarCard: {
      eyebrow: "If fear is involved",
      title: "Use the threats page next",
      body: "If the pressure has turned into fear, exposure, or blackmail, move straight to the dedicated page.",
      href: "/support/threats-and-blackmail.html",
      label: "Threats and blackmail",
    },
    cta: {
      title: "Pick the clearest safety route",
      body: "Use the page that matches the pressure you are seeing, not the one that feels closest by accident.",
      buttons: [
        { label: "Online warning signs", href: "/support/online-warning-signs.html", primary: true },
        { label: "Threats and blackmail", href: "/support/threats-and-blackmail.html" },
      ],
    },
  },
  faq: {
    path: "/support/faq.html",
    title: "Support FAQs",
    eyebrow: "FAQs",
    icon: "fa-circle-question",
    accent: "purple",
    description: "Quick answers to common safeguarding, friend-support, and sensitive support questions.",
    intro:
      "This page gives you fast answers for the kinds of worries that usually show up first: something online feels wrong, a friend seems different, or you need a safer support route quickly.",
    readTime: "3 min read",
    category: "Common answers",
    updated: "April 2026",
    summary:
      "Use these short answers to get to the right safeguarding or wellbeing page fast.",
    sections: [
      {
        id: "quick-answers",
        title: "Quick answers",
        faq: [
          {
            question: "Where should I start if something online feels wrong?",
            answer:
              "Start with <a href='/support/online-warning-signs.html'>if something online feels wrong</a>. It helps you slow things down and work out the safest next step.",
          },
          {
            question: "What if someone tells me to keep something secret?",
            answer:
              "Use <a href='/support/keep-it-secret.html'>if someone tells you to keep it secret</a>. If fear, threats, or blackmail are involved, switch to <a href='/support/threats-and-blackmail.html'>threats and blackmail</a>.",
          },
          {
            question: "What if a friend seems different lately?",
            answer:
              "Open <a href='/support/friend-acting-different.html'>when a friend is acting different</a> for signs to notice and what to do next.",
          },
          {
            question: "What if a friend said something worrying?",
            answer:
              "Use <a href='/support/friend-said-something-worrying.html'>if a friend said something worrying</a>. If things feel urgent, move to <a href='/support/youre-not-alone.html'>you are not alone</a> as well.",
          },
          {
            question: "Where can I find pages with quick exit?",
            answer:
              "Use <a href='/support/mental-health.html'>mental health support</a> or <a href='/support/youre-not-alone.html'>you are not alone</a>. Both explain the quick-exit shortcut when you arrive.",
          },
          {
            question: "What if someone is threatening or blackmailing me?",
            answer:
              "Go straight to <a href='/support/threats-and-blackmail.html'>threats and blackmail</a> and get another trusted person involved quickly.",
          },
        ],
      },
      {
        id: "more-help",
        title: "Need more than a quick answer?",
        cards: [
          {
            title: "Help centre",
            body: "Use the full support directory if you want to browse every safeguarding and support page in one place.",
            icon: "fa-life-ring",
            href: "/support/help_center.html",
            label: "Open help centre",
          },
          {
            title: "Support routes",
            body: "Use the route page if you know something is wrong but you are not sure which guide fits best.",
            icon: "fa-compass",
            href: "/support/contact.html",
            label: "Open support routes",
          },
        ],
      },
    ],
    related: ["online-warning-signs", "check-in-on-friends", "contact"],
    sidebarCard: {
      eyebrow: "Still unsure?",
      title: "Use the full help centre",
      body: "The help centre is the best place to scan all the safety and friend-support pages together.",
      href: "/support/help_center.html",
      label: "Open help centre",
    },
    cta: {
      title: "Choose your next route",
      body: "Jump from the short answer to the page that matches your concern best.",
      buttons: [
        { label: "Help centre", href: "/support/help_center.html", primary: true },
        { label: "Support routes", href: "/support/contact.html" },
      ],
    },
  },
  contact: {
    path: "/support/contact.html",
    title: "Support routes and who to tell",
    eyebrow: "Contact",
    icon: "fa-envelope",
    accent: "blue",
    description: "Find the safest next route when something online feels wrong, a friend worries you, or you need private support.",
    intro:
      "This page helps you choose the right support route without having to explain everything perfectly first. Use it when something feels off online, you are worried about a friend, or you need more private help yourself.",
    readTime: "3 min read",
    category: "Support routes",
    updated: "April 2026",
    summary:
      "Pick the route that matches the concern: online warning signs, friend support, private support for yourself, or threats and blackmail.",
    sections: [
      {
        id: "best-route",
        title: "Choose the best route",
        cards: [
          {
            title: "Something online feels wrong",
            body: "Use this when a conversation feels pushy, secretive, manipulative, or just wrong.",
            icon: "fa-triangle-exclamation",
            href: "/support/online-warning-signs.html",
            label: "Open warning signs page",
          },
          {
            title: "Worried about a friend",
            body: "Use this if a friend seems different, has gone very quiet, or said something that stuck with you.",
            icon: "fa-user-group",
            href: "/support/friend-acting-different.html",
            label: "Open friend support page",
          },
          {
            title: "Need private support for yourself",
            body: "Use the sensitive support pages if you feel overwhelmed, unsafe, or need a quick exit option.",
            icon: "fa-heart",
            href: "/support/mental-health.html",
            label: "Open mental health page",
          },
          {
            title: "Threats and blackmail",
            body: "Use this if someone is threatening to expose you, share something, or force you into doing more.",
            icon: "fa-octagon-exclamation",
            href: "/support/threats-and-blackmail.html",
            label: "Open threats page",
          },
        ],
        columns: 2,
      },
      {
        id: "before-you-tell-someone",
        title: "Before you tell someone",
        orderedList: [
          "Save screenshots, usernames, or key messages if the situation is online and the evidence may matter.",
          "Write down what changed or what was said if your worry is about a friend.",
          "Mention clearly if someone asked for secrecy, tried to move you to a private chat, or made you feel scared.",
          "If anyone feels unsafe right now, stop reading and get real-world urgent help involved straight away.",
        ],
      },
      {
        id: "when-to-escalate",
        title: "When to get more support involved",
        bullets: [
          "If fear, threats, blackmail, images, or exposure are involved, do not try to manage it on your own.",
          "If a friend says something seriously worrying or seems unsafe, tell a trusted adult or person rather than carrying it alone.",
          "If you do not feel safe being alone right now, use the sensitive pages with quick exit and move closer to another person.",
        ],
      },
    ],
    related: ["online-warning-signs", "friend-acting-different", "mental-health"],
    sidebarCard: {
      eyebrow: "Not sure which fits?",
      title: "Use the full help centre",
      body: "If you are choosing between a few different worries, the help centre makes it easier to compare the pages.",
      href: "/support/help_center.html",
      label: "Open help centre",
    },
    cta: {
      title: "Open the route you need",
      body: "Pick the clearest next page, even if you are still not sure about every detail yet.",
      buttons: [
        { label: "Online warning signs", href: "/support/online-warning-signs.html", primary: true },
        { label: "Mental health support", href: "/support/mental-health.html" },
      ],
    },
  },
  "mental-health": {
    path: "/support/mental-health.html",
    title: "Mental health support",
    eyebrow: "Sensitive support",
    icon: "fa-heart",
    accent: "emerald",
    description: "Gentle support for when study pressure, anxiety, or overwhelm starts to feel too heavy.",
    intro:
      "You do not have to carry exam pressure on your own. This page is here to help you pause, steady yourself, and choose one safe next step. Quick exit is enabled on this page.",
    readTime: "4 min read",
    category: "Sensitive support",
    updated: "April 2026",
    summary:
      "Put the work down for a moment, slow things down, and get another person aware of what is going on if the pressure is building.",
    sensitive: {
      popupTitle: "Quick exit is turned on",
      popupBody:
        "If you need to leave this page quickly, press Esc three times to switch away to Google. You can also use the Quick exit button in the corner.",
    },
    sections: [
      {
        id: "right-now",
        title: "What to do right now",
        orderedList: [
          "Put the work down for five minutes. You are allowed to pause before trying to solve anything.",
          "Take slower breaths or open the <a href='/study tools/breathing.html'>breathing tool</a> for a guided reset.",
          "Get a glass of water, move to a different room, or sit nearer to another person if being alone feels heavier right now.",
          "Tell one trusted person today that things feel like too much. You do not need a polished explanation.",
        ],
      },
      {
        id: "gentle-reminders",
        title: "Gentle reminders",
        cards: [
          {
            title: "Rest counts",
            body: "Stopping for a while is not failing. A burnt-out brain cannot revise well.",
            icon: "fa-moon",
          },
          {
            title: "One small step is enough",
            body: "You do not need to fix the whole week tonight. One calm next step is enough.",
            icon: "fa-seedling",
          },
          {
            title: "Support is part of coping",
            body: "Telling someone is not making a fuss. It is how pressure gets shared and reduced.",
            icon: "fa-users",
          },
        ],
        columns: 3,
      },
      {
        id: "signs-to-slow-down",
        title: "Signs to slow down and reach out",
        bullets: [
          "You are crying often, panicking, or feeling constantly on edge.",
          "You cannot settle enough to study, sleep, or eat normally.",
          "You keep isolating yourself because everything feels too big.",
          "You feel numb, trapped, or like you have to keep pushing even though your body is clearly struggling.",
        ],
      },
      {
        id: "urgent-help",
        title: "If you feel unsafe",
        callout: {
          tone: "rose",
          title: "Get real-world help right away",
          body:
            "If you think you might act on thoughts of harming yourself or someone else, call your local emergency services now, go to the nearest emergency department, or get a trusted adult or person to stay with you while you get help.",
        },
      },
    ],
    related: [
      "youre-not-alone",
      "contact",
      {
        title: "Wellbeing hub",
        path: "/study_pages/wellbeingHub.html",
        description: "Breathing exercises, calmer tools, and wellbeing guidance.",
      },
    ],
    sidebarCard: {
      eyebrow: "Quick exit",
      title: "Need to leave fast?",
      body: "Press Esc three times at any point to switch away from this page quickly.",
      href: "/study tools/breathing.html",
      label: "Open breathing tool",
    },
    cta: {
      title: "Choose a safer next step",
      body: "You do not need to figure everything out at once.",
      buttons: [
        { label: "Open breathing tool", href: "/study tools/breathing.html", primary: true },
        { label: "You are not alone", href: "/support/youre-not-alone.html" },
      ],
    },
  },
  "youre-not-alone": {
    path: "/support/youre-not-alone.html",
    title: "You are not alone",
    eyebrow: "Sensitive support",
    icon: "fa-hand-holding-heart",
    accent: "emerald",
    description: "A gentle page for when things feel too heavy and you need help from another person now.",
    intro:
      "If things feel too heavy right now, the next job is not to solve everything. The next job is to get through the next few minutes with another person aware of what is going on. Quick exit is enabled on this page.",
    readTime: "4 min read",
    category: "Sensitive support",
    updated: "April 2026",
    summary:
      "Move closer to support, tell someone clearly that you need them, and stay with other people if being alone does not feel safe.",
    sensitive: {
      popupTitle: "Quick exit is turned on",
      popupBody:
        "This page includes a quick exit. Press Esc three times to switch away to Google if you need privacy fast.",
    },
    sections: [
      {
        id: "next-ten-minutes",
        title: "The next ten minutes",
        orderedList: [
          "Move to a place where another person is nearby, or call or message someone straight away.",
          "Say one clear sentence such as: <strong>I am not okay and I need you with me right now.</strong>",
          "Keep your phone with you and stay around people if being on your own feels unsafe.",
          "If the danger feels immediate, call your local emergency services now or go to the nearest emergency department with someone.",
        ],
      },
      {
        id: "words-you-can-use",
        title: "Words you can use",
        cards: [
          {
            title: "Simple and direct",
            body: '"I am not doing well and I need you to stay with me for a bit."',
            icon: "fa-message",
          },
          {
            title: "If you feel unsafe",
            body: '"I do not feel safe being on my own right now. Can you help me get support?"',
            icon: "fa-shield-halved",
          },
          {
            title: "If talking is hard",
            body: '"I cannot explain it properly, but I need you with me and I need help."',
            icon: "fa-phone",
          },
        ],
        columns: 3,
      },
      {
        id: "support-can-look-like",
        title: "Support can look like",
        bullets: [
          "A parent, carer, sibling, or another trusted adult staying with you.",
          "A friend helping you get to a safer place or making a call with you.",
          "A teacher, school counsellor, GP, doctor, or another professional who can help you move from private stress to real support.",
        ],
      },
      {
        id: "urgent-help",
        title: "If you need immediate help",
        callout: {
          tone: "rose",
          title: "Do not stay alone with it",
          body:
            "If you think you might act on thoughts of harming yourself or someone else, call your local emergency services now, go to the nearest emergency department, or tell the nearest trusted adult or person that you need urgent help right away.",
        },
      },
    ],
    related: [
      "mental-health",
      {
        title: "Breathing tool",
        path: "/study tools/breathing.html",
        description: "A simple breathing page if you need a slower moment.",
      },
      "contact",
    ],
    sidebarCard: {
      eyebrow: "Stay with support",
      title: "Tell one person now",
      body: "You do not need the perfect words. One clear sentence is enough to start.",
      href: "/study tools/breathing.html",
      label: "Open breathing tool",
    },
    cta: {
      title: "Choose the next safe move",
      body: "Use a calming tool or return to the wider wellbeing guidance.",
      buttons: [
        { label: "Open breathing tool", href: "/study tools/breathing.html", primary: true },
        { label: "Visit wellbeing hub", href: "/study_pages/wellbeingHub.html" },
      ],
    },
  },
  "check-in-on-friends": {
    path: "/support/check-in-on-friends.html",
    title: "Check in on your friends",
    eyebrow: "Friends",
    icon: "fa-comments",
    accent: "blue",
    description: "A simple page for checking in with a friend when you think they may be under pressure.",
    intro:
      "Checking in does not have to be dramatic to matter. A quiet message, a second follow-up, or making time to listen can help a friend feel less alone.",
    readTime: "3 min read",
    category: "Friend support",
    updated: "April 2026",
    summary:
      "Keep it simple, ask directly how they are doing, and pay attention if they brush things off too quickly.",
    sections: [
      {
        id: "how-to-start",
        title: "How to start",
        orderedList: [
          "Send something simple like <strong>just checking in, how are you doing really?</strong> or <strong>you seemed a bit off, want to talk?</strong>.",
          "Ask somewhere calm and private where they do not feel watched or rushed.",
          "Listen more than you talk. You do not need a perfect answer ready.",
          "If they say they are fine but you are still worried, check again later instead of assuming it is nothing.",
        ],
      },
      {
        id: "helpful-things-to-say",
        title: "Helpful things to say",
        cards: [
          {
            title: "Keep it gentle",
            body: '"No pressure, I just wanted to check in because I care."',
            icon: "fa-message",
          },
          {
            title: "Be specific",
            body: '"You have seemed quieter lately, so I wanted to ask how you are doing."',
            icon: "fa-eye",
          },
          {
            title: "Leave the door open",
            body: '"You do not have to talk now, but I am here if you want to later."',
            icon: "fa-door-open",
          },
        ],
        columns: 3,
      },
      {
        id: "when-to-get-help",
        title: "When to get help from someone else",
        bullets: [
          "They say something that makes you worry they are not safe.",
          "They seem very different for a while and keep getting harder to reach.",
          "You feel out of your depth and do not know how to hold it on your own.",
        ],
      },
    ],
    related: ["friend-acting-different", "friend-said-something-worrying", "contact"],
    sidebarCard: {
      eyebrow: "Keep it simple",
      title: "You do not need perfect words",
      body: "A calm message and real attention are usually more useful than a big speech.",
      href: "/support/friend-acting-different.html",
      label: "Signs to look for",
    },
    cta: {
      title: "If your worry is growing",
      body: "Move from a simple check-in to getting more support involved.",
      buttons: [
        { label: "Friend acting different", href: "/support/friend-acting-different.html", primary: true },
        { label: "Support routes", href: "/support/contact.html" },
      ],
    },
  },
  "friend-acting-different": {
    path: "/support/friend-acting-different.html",
    title: "When a friend is acting different",
    eyebrow: "Friends",
    icon: "fa-user-group",
    accent: "blue",
    description: "What to look for when a friend suddenly seems different and how to respond carefully.",
    intro:
      "One sign on its own does not prove everything, but a clear change in someone's mood, energy, or behaviour can be worth taking seriously.",
    readTime: "4 min read",
    category: "Friend support",
    updated: "April 2026",
    summary:
      "Notice the pattern, check in calmly, and get a trusted adult or person involved if your worry keeps building.",
    sections: [
      {
        id: "changes-you-might-notice",
        title: "Changes you might notice",
        bullets: [
          "They go very quiet, pull away, or stop replying like they usually do.",
          "They seem flatter, more irritable, more secretive, or suddenly unlike themselves.",
          "They stop showing up, stop caring about things they normally care about, or keep joking about heavy things in a way that does not feel like a joke.",
        ],
      },
      {
        id: "what-to-do",
        title: "What to do",
        orderedList: [
          "Ask gently and directly how they are doing.",
          "Stay calm and avoid turning it into an interrogation.",
          "If you are still worried after checking in, tell a trusted adult or person instead of carrying it alone.",
          "If you think they might not be safe, treat it as urgent and get help straight away.",
        ],
      },
      {
        id: "what-not-to-do",
        title: "What not to do",
        bullets: [
          "Do not promise to keep serious safety worries secret.",
          "Do not assume they are just being dramatic because they laugh it off later.",
          "Do not wait for the perfect amount of proof before telling someone if your concern is real.",
        ],
      },
    ],
    related: ["check-in-on-friends", "friend-said-something-worrying", "youre-not-alone"],
    sidebarCard: {
      eyebrow: "Trust your concern",
      title: "Patterns matter",
      body: "If someone feels different in a way you cannot shake off, it is okay to act on that concern.",
      href: "/support/friend-said-something-worrying.html",
      label: "Worrying things they said",
    },
    cta: {
      title: "Take the next step",
      body: "If you are worried enough to keep thinking about it, you are worried enough to get support involved.",
      buttons: [
        { label: "Support routes", href: "/support/contact.html", primary: true },
        { label: "You are not alone", href: "/support/youre-not-alone.html" },
      ],
    },
  },
  "online-warning-signs": {
    path: "/support/online-warning-signs.html",
    title: "If something online feels wrong",
    eyebrow: "Safeguarding",
    icon: "fa-triangle-exclamation",
    accent: "rose",
    description: "Warning signs in online chats or messages and what to do when something feels off.",
    intro:
      "You do not need to prove that something is wrong before treating it seriously. If a conversation feels pushy, secretive, manipulative, or unsettling, that matters.",
    readTime: "4 min read",
    category: "Online safety",
    updated: "April 2026",
    summary:
      "Trust the feeling, slow everything down, stop replying if needed, and show it to a trusted adult or person.",
    sections: [
      {
        id: "warning-signs",
        title: "Warning signs",
        bullets: [
          "They pressure you to reply quickly or keep things secret.",
          "They move from normal chat to personal questions very fast.",
          "They guilt you, threaten you, flatter you heavily, or try to isolate you from other people.",
          "They ask to move somewhere more private or make you feel like you owe them something.",
        ],
      },
      {
        id: "what-to-do-next",
        title: "What to do next",
        orderedList: [
          "Slow it down. You do not owe them an instant reply.",
          "Stop sending anything personal and step back from the chat if needed.",
          "Keep screenshots or evidence if it feels important.",
          "Tell a trusted adult or person rather than trying to manage it on your own.",
        ],
      },
      {
        id: "remember",
        title: "Remember",
        callout: {
          tone: "rose",
          title: "Discomfort counts",
          body:
            "You do not need a perfect explanation for why a conversation feels wrong. Feeling pressured, trapped, or unsettled is enough reason to get help.",
        },
      },
    ],
    related: ["keep-it-secret", "private-chat-pressure", "personal-details-safety"],
    sidebarCard: {
      eyebrow: "Do this first",
      title: "Slow it down",
      body: "Urgency is often part of the pressure. Pausing is a safety step, not a mistake.",
      href: "/support/private-chat-pressure.html",
      label: "Private chat pressure",
    },
    cta: {
      title: "Use the clearer safety route",
      body: "If you can name the pattern, pick the matching page. If not, use support routes.",
      buttons: [
        { label: "Keep it secret?", href: "/support/keep-it-secret.html", primary: true },
        { label: "Support routes", href: "/support/contact.html" },
      ],
    },
  },
  "keep-it-secret": {
    path: "/support/keep-it-secret.html",
    title: "If someone tells you to keep it secret",
    eyebrow: "Safeguarding",
    icon: "fa-user-secret",
    accent: "rose",
    description: "What to do when someone asks you to keep something secret and it does not feel safe.",
    intro:
      "Safe adults and safe friends do not use secrecy to trap you. If a secret feels personal, scary, or uncomfortable, you do not have to carry it alone.",
    readTime: "4 min read",
    category: "Online safety",
    updated: "April 2026",
    summary:
      "If the secret feels wrong, tell a trusted adult or person even if someone asked you not to.",
    sections: [
      {
        id: "why-secrecy-is-used",
        title: "Why secrecy is used",
        bullets: [
          "To stop you getting another opinion.",
          "To make you feel guilty about telling someone safer.",
          "To keep control over you or the situation.",
        ],
      },
      {
        id: "what-to-do",
        title: "What to do",
        orderedList: [
          "Pause before replying or agreeing to anything else.",
          "Do not promise to keep it secret just because you are being pressured.",
          "Tell a trusted adult or person what was said, even if you feel awkward doing it.",
          "If the secret involves threats, images, sexual pressure, or fear, treat it as urgent.",
        ],
      },
      {
        id: "simple-rule",
        title: "A simple rule",
        callout: {
          tone: "rose",
          title: "Secrets that make you feel trapped are not yours to keep",
          body:
            "If keeping the secret makes you feel scared, pressured, or responsible for someone else's behaviour, that is a strong sign you should tell someone safer.",
        },
      },
    ],
    related: ["online-warning-signs", "threats-and-blackmail", "contact"],
    sidebarCard: {
      eyebrow: "Next route",
      title: "If the secret includes threats",
      body: "Move straight to the threats and blackmail page if fear or pressure is involved.",
      href: "/support/threats-and-blackmail.html",
      label: "Threats and blackmail",
    },
    cta: {
      title: "Get another person involved",
      body: "Unsafe secrecy gets smaller when another safe person knows.",
      buttons: [
        { label: "Support routes", href: "/support/contact.html", primary: true },
        { label: "Privacy and safety", href: "/support/privacy.html" },
      ],
    },
  },
  "personal-details-safety": {
    path: "/support/personal-details-safety.html",
    title: "Keep personal details private",
    eyebrow: "Safety",
    icon: "fa-id-card",
    accent: "emerald",
    description: "Why personal details matter online and what to do when someone is pushing for them.",
    intro:
      "Personal details can feel small when shared one at a time, but they add up quickly. If someone is pushing for private information, it is okay to stop and step back.",
    readTime: "3 min read",
    category: "Online safety",
    updated: "April 2026",
    summary:
      "You do not need to prove yourself by sharing personal information, passwords, photos, or location details.",
    sections: [
      {
        id: "what-counts",
        title: "What counts as personal details",
        bullets: [
          "Your full name, address, school, phone number, or exact location.",
          "Passwords, codes, account logins, or private links.",
          "Private photos, identity documents, or proof-style images.",
        ],
      },
      {
        id: "if-someone-is-pushing",
        title: "If someone is pushing for details",
        orderedList: [
          "Stop replying to the request straight away.",
          "Do not send anything just to keep the conversation calm.",
          "Show the messages to a trusted adult or person if the pressure continues.",
          "If you already sent something, get help quickly rather than hiding it.",
        ],
      },
      {
        id: "important-reminder",
        title: "Important reminder",
        callout: {
          tone: "emerald",
          title: "You do not owe proof",
          body:
            "People who pressure you for private information, pictures, or location details are asking for too much. Saying no or stepping away is a safety choice.",
        },
      },
    ],
    related: ["online-warning-signs", "private-chat-pressure", "threats-and-blackmail"],
    sidebarCard: {
      eyebrow: "Related risk",
      title: "Private chat pressure",
      body: "Pressure often increases when someone tries to move you into a more private space.",
      href: "/support/private-chat-pressure.html",
      label: "Read that page",
    },
    cta: {
      title: "If the pressure keeps growing",
      body: "Use the next page when the chat turns more secretive, urgent, or controlling.",
      buttons: [
        { label: "Private chat pressure", href: "/support/private-chat-pressure.html", primary: true },
        { label: "Privacy and safety", href: "/support/privacy.html" },
      ],
    },
  },
  "private-chat-pressure": {
    path: "/support/private-chat-pressure.html",
    title: "If someone is pushing you into a private chat",
    eyebrow: "Safety",
    icon: "fa-comments",
    accent: "rose",
    description: "What to do when someone tries to move you into a more private space or makes the conversation feel urgent.",
    intro:
      "Moving you away from public, normal, or visible spaces can be part of building pressure. You do not need to follow someone into a private chat just because they insist.",
    readTime: "4 min read",
    category: "Online safety",
    updated: "April 2026",
    summary:
      "Slowing it down is a good sign, not a rude one. Private pressure is often the point where you should step back.",
    sections: [
      {
        id: "common-patterns",
        title: "Common patterns",
        bullets: [
          "They push to move the chat elsewhere quickly.",
          "They say it has to stay between you and them.",
          "They make it feel urgent, emotional, or like you will hurt them if you do not follow along.",
        ],
      },
      {
        id: "what-to-do",
        title: "What to do",
        orderedList: [
          "Stay where you feel safer, or stop replying entirely.",
          "Do not send anything new while you are feeling pressured.",
          "Keep evidence if the messages feel important.",
          "Tell a trusted adult or person if the pressure keeps building.",
        ],
      },
      {
        id: "you-can-leave",
        title: "You can leave the chat",
        callout: {
          tone: "rose",
          title: "You do not owe access",
          body:
            "You do not have to move the conversation, explain yourself perfectly, or keep someone calm when they are the one making things feel unsafe.",
        },
      },
    ],
    related: ["online-warning-signs", "personal-details-safety", "keep-it-secret"],
    sidebarCard: {
      eyebrow: "Escalation",
      title: "If fear is involved",
      body: "If the pressure turns into threats, switch to the threats and blackmail page next.",
      href: "/support/threats-and-blackmail.html",
      label: "Threats and blackmail",
    },
    cta: {
      title: "Take the safer route",
      body: "Pressure, secrecy, and urgency together are a strong reason to get help involved.",
      buttons: [
        { label: "Threats and blackmail", href: "/support/threats-and-blackmail.html", primary: true },
        { label: "Support routes", href: "/support/contact.html" },
      ],
    },
  },
  "friend-said-something-worrying": {
    path: "/support/friend-said-something-worrying.html",
    title: "If a friend said something worrying",
    eyebrow: "Friends",
    icon: "fa-heart",
    accent: "blue",
    description: "What to do when a friend says something that makes you stop and think they may not be okay.",
    intro:
      "Even if they laugh it off later, it still matters if what they said made you worry. You do not have to decide alone whether it was serious enough.",
    readTime: "4 min read",
    category: "Friend support",
    updated: "April 2026",
    summary:
      "Take it seriously, stay calm, and get another trusted person involved if your worry is real.",
    sections: [
      {
        id: "take-it-seriously",
        title: "Take it seriously",
        bullets: [
          "Comments about not wanting to be here, hurting themselves, giving up, or feeling trapped matter.",
          "Dark jokes can still be worth acting on if the tone or timing worries you.",
          "You do not need certainty before you ask for help.",
        ],
      },
      {
        id: "what-to-do-next",
        title: "What to do next",
        orderedList: [
          "Stay calm and check in with them directly.",
          "Do not agree to keep serious safety worries secret.",
          "Tell a trusted adult or person if you think they may not be safe.",
          "If you think the risk is immediate, treat it as urgent and get emergency help involved straight away.",
        ],
      },
      {
        id: "important-note",
        title: "Important note",
        callout: {
          tone: "rose",
          title: "You are not overreacting by acting on concern",
          body:
            "When someone says something worrying enough to stay in your head, it is okay to involve another safe person. That is part of protecting them, not betraying them.",
        },
      },
    ],
    related: ["friend-acting-different", "check-in-on-friends", "youre-not-alone"],
    sidebarCard: {
      eyebrow: "If it feels urgent",
      title: "Do not hold it alone",
      body: "Serious safety worries should not stay between just the two of you.",
      href: "/support/youre-not-alone.html",
      label: "Urgent support page",
    },
    cta: {
      title: "Get support involved",
      body: "If it is serious enough to worry you, it is serious enough to share with a safer adult or person.",
      buttons: [
        { label: "You are not alone", href: "/support/youre-not-alone.html", primary: true },
        { label: "Support routes", href: "/support/contact.html" },
      ],
    },
  },
  "threats-and-blackmail": {
    path: "/support/threats-and-blackmail.html",
    title: "Threats and blackmail",
    eyebrow: "Safety",
    icon: "fa-octagon-exclamation",
    accent: "rose",
    description: "What to do if someone is threatening you, exposing you, or trying to control you through fear.",
    intro:
      "If someone is threatening to expose you, share something, punish you, or force you into doing more, do not try to manage it alone.",
    readTime: "4 min read",
    category: "Online safety",
    updated: "April 2026",
    summary:
      "Threats and blackmail grow in secrecy. Save what you can, stop negotiating alone, and get help involved quickly.",
    sections: [
      {
        id: "what-this-can-look-like",
        title: "What this can look like",
        bullets: [
          "Threats to share messages, images, or information unless you comply.",
          "Pressure to send more, do more, or stay quiet.",
          "Fear-based messages designed to make you panic and obey.",
        ],
      },
      {
        id: "what-to-do-now",
        title: "What to do now",
        orderedList: [
          "Stop handling it on your own if you can.",
          "Keep screenshots, usernames, or any evidence you still have access to.",
          "Tell a trusted adult or person quickly.",
          "If you feel in immediate danger, contact emergency help straight away.",
        ],
      },
      {
        id: "what-not-to-do",
        title: "What not to do",
        bullets: [
          "Do not keep sending more just to buy time.",
          "Do not delete everything before another safe person has seen it if evidence may help.",
          "Do not assume you have to fix it perfectly before asking for help.",
        ],
      },
    ],
    related: ["keep-it-secret", "private-chat-pressure", "contact"],
    sidebarCard: {
      eyebrow: "Move fast",
      title: "Fear is the control",
      body: "Threats work by making you feel isolated and urgent. Getting another person involved interrupts that control.",
      href: "/support/contact.html",
      label: "Open support routes",
    },
    cta: {
      title: "Get help involved now",
      body: "This is the kind of situation where support matters more than trying to contain it alone.",
      buttons: [
        { label: "Support routes", href: "/support/contact.html", primary: true },
        { label: "Privacy and safety", href: "/support/privacy.html" },
      ],
    },
  },
};
