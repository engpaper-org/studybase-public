"use strict";

const STORAGE_KEY = "simstreet-exchange-save-v1";
const WARNING_KEY = "simstreet-exchange-warning-v1";
const PHASES = ["Opening Bell", "Midday Rush", "Power Hour", "After Hours"];

const MODE_DEFS = {
  sandbox: {
    name: "Sandbox",
    tag: "Best for learning",
    startingCash: 25000,
    volatility: 0.85,
    eventChance: 0.22,
    description: "Low-pressure free play with plenty of fake cash so you can test ideas without worrying about a fail state.",
    objective: "Try all three simulator styles: a market order, a limit order, and an auto-invest plan."
  },
  career: {
    name: "Career Run",
    tag: "Clear target",
    startingCash: 15000,
    volatility: 1,
    eventChance: 0.28,
    description: "Balanced session pacing with sharper swings and a score chase. Reach your paper goal before the clock does.",
    objective: "Grow your fake account to $30,000 before Day 35."
  },
  frenzy: {
    name: "Chaos Cup",
    tag: "Maximum swings",
    startingCash: 12000,
    volatility: 1.55,
    eventChance: 0.42,
    description: "Wild headlines, bigger squeezes, and louder momentum. Built for fast-moving pretend traders.",
    objective: "Survive to Day 25 and stay above your starting paper balance."
  }
};

const STOCKS = [
  {
    symbol: "NVA",
    name: "Nova Dynamics",
    sector: "AI Infrastructure",
    basePrice: 132,
    drift: 0.0016,
    volatility: 1.25,
    dividend: 0,
    tint: "#55dbc9",
    blurb: "Builds model-serving chips and data-center cooling rigs."
  },
  {
    symbol: "KOI",
    name: "Koi Cloud",
    sector: "Consumer Tech",
    basePrice: 84,
    drift: 0.0011,
    volatility: 1.1,
    dividend: 0.0004,
    tint: "#f4c55f",
    blurb: "Runs shopping streams, creator tools, and social storefront software."
  },
  {
    symbol: "LUX",
    name: "Luma Health",
    sector: "Health Tech",
    basePrice: 63,
    drift: 0.0013,
    volatility: 0.9,
    dividend: 0.0008,
    tint: "#ff8d73",
    blurb: "Designs wearable diagnostics and living-room wellness scanners."
  },
  {
    symbol: "TMB",
    name: "Timber Rail",
    sector: "Mobility",
    basePrice: 47,
    drift: 0.0009,
    volatility: 0.85,
    dividend: 0.0011,
    tint: "#8fa8ff",
    blurb: "Ships autonomous freight pods and port robotics systems."
  },
  {
    symbol: "SOL",
    name: "Solstice Grid",
    sector: "Energy",
    basePrice: 95,
    drift: 0.0012,
    volatility: 1,
    dividend: 0.0014,
    tint: "#ffd166",
    blurb: "Sells battery farms and long-duration solar storage packs."
  },
  {
    symbol: "VTX",
    name: "Vertex Fin",
    sector: "Fintech",
    basePrice: 56,
    drift: 0.001,
    volatility: 1.3,
    dividend: 0,
    tint: "#ff6f91",
    blurb: "Moves instant payments for games, creators, and digital tips."
  },
  {
    symbol: "ORB",
    name: "Orbit Atlas",
    sector: "Space & Telecom",
    basePrice: 118,
    drift: 0.0014,
    volatility: 1.4,
    dividend: 0,
    tint: "#7ce0ff",
    blurb: "Launches tiny satellites that sell weather and mapping data."
  },
  {
    symbol: "RIO",
    name: "Riot Media",
    sector: "Media",
    basePrice: 36,
    drift: 0.0008,
    volatility: 1.6,
    dividend: 0,
    tint: "#b5f36d",
    blurb: "Owns sports clips, gaming highlights, and chaotic meme channels."
  }
];

const STOCK_BY_SYMBOL = Object.fromEntries(STOCKS.map((stock) => [stock.symbol, stock]));

const GLOBAL_EVENTS = [
  {
    headline: "Cooling inflation rumor brightens the tape",
    detail: "Speculators decide lower pressure might be coming for the pretend economy.",
    shift: 0.62,
    tone: "positive"
  },
  {
    headline: "Bond scare shakes risk appetite",
    detail: "Fast money rotates into safety and hits growth names across the board.",
    shift: -0.58,
    tone: "negative"
  },
  {
    headline: "Sideways session leaves traders guessing",
    detail: "Volume cools and the fake market drifts without conviction.",
    shift: 0.04,
    tone: "neutral"
  },
  {
    headline: "Mega-fund rumor triggers broad buying spree",
    detail: "Momentum desks race to front-run a story nobody can verify because this is all simulated.",
    shift: 0.74,
    tone: "positive"
  }
];

const SECTOR_EVENTS = {
  "AI Infrastructure": [
    {
      headline: "Chip shortage chatter lights up AI hardware names",
      detail: "Traders bet scarce parts will push up margins for select suppliers.",
      shift: 0.72,
      tone: "positive"
    },
    {
      headline: "Data-center power costs scare AI builders",
      detail: "Operators slash forecasts and investors cut risk on heavy compute plays.",
      shift: -0.74,
      tone: "negative"
    }
  ],
  "Consumer Tech": [
    {
      headline: "Creator economy boom boosts consumer platforms",
      detail: "Advertisers pile into digital storefront and streaming names.",
      shift: 0.66,
      tone: "positive"
    },
    {
      headline: "App fatigue hits consumer-tech sentiment",
      detail: "Engagement worries spark a broad pullback in trend-driven names.",
      shift: -0.64,
      tone: "negative"
    }
  ],
  "Health Tech": [
    {
      headline: "Breakthrough trial result lifts health-tech leaders",
      detail: "Investors love the idea of faster diagnostics and home-screening tools.",
      shift: 0.68,
      tone: "positive"
    },
    {
      headline: "Regulatory questions pressure digital health names",
      detail: "Paper traders suddenly care about approval timelines.",
      shift: -0.7,
      tone: "negative"
    }
  ],
  Mobility: [
    {
      headline: "Freight demand rebound sparks mobility rally",
      detail: "Autonomous logistics stories catch a strong bid.",
      shift: 0.58,
      tone: "positive"
    },
    {
      headline: "Port delays snarl logistics expectations",
      detail: "Route disruptions weigh on transport hardware and fleet software.",
      shift: -0.62,
      tone: "negative"
    }
  ],
  Energy: [
    {
      headline: "Grid subsidy rumor boosts energy storage",
      detail: "Battery and solar operators rise on fake policy optimism.",
      shift: 0.64,
      tone: "positive"
    },
    {
      headline: "Commodity dip dents energy-transition names",
      detail: "Investors question near-term project spending.",
      shift: -0.6,
      tone: "negative"
    }
  ],
  Fintech: [
    {
      headline: "Checkout volume spike cheers fintech bulls",
      detail: "Payments growth stories get another jolt higher.",
      shift: 0.7,
      tone: "positive"
    },
    {
      headline: "Chargeback worries smack digital payment plays",
      detail: "Risk desks tighten up as transaction quality comes into question.",
      shift: -0.72,
      tone: "negative"
    }
  ],
  "Space & Telecom": [
    {
      headline: "Satellite contract chatter boosts orbital operators",
      detail: "Connectivity names lift as traders price in fresh demand.",
      shift: 0.73,
      tone: "positive"
    },
    {
      headline: "Launch window setback rattles telecom satellites",
      detail: "Bad weather and delays throw cold water on the sector.",
      shift: -0.76,
      tone: "negative"
    }
  ],
  Media: [
    {
      headline: "Streaming rights frenzy lifts media momentum",
      detail: "Ad buyers chase attention and sports clips catch fire.",
      shift: 0.67,
      tone: "positive"
    },
    {
      headline: "Audience churn sparks media sell-off",
      detail: "Trend-sensitive subscribers vanish as fast as they arrived.",
      shift: -0.69,
      tone: "negative"
    }
  ]
};

const COMPANY_EVENT_PATTERNS = [
  {
    headline: "{name} teases a surprise keynote",
    detail: "Speculators pile in ahead of a reveal that may or may not matter.",
    shift: 0.86,
    tone: "positive"
  },
  {
    headline: "{name} misses its whispered target",
    detail: "Momentum traders bail out while skeptics celebrate being early.",
    shift: -0.92,
    tone: "negative"
  },
  {
    headline: "{name} lands a giant fictional partnership",
    detail: "The market loves the story and buys first, asks questions later.",
    shift: 0.9,
    tone: "positive"
  },
  {
    headline: "{name} faces a product delay rumor",
    detail: "Fear spreads quickly and price targets get clipped.",
    shift: -0.88,
    tone: "negative"
  }
];

const CHALLENGES = [
  {
    id: "green-start",
    title: "Green Start",
    description: "Grow your paper account 5% above the starting balance.",
    check: (sim) => getNetWorth(sim) >= sim.startingCash * 1.05
  },
  {
    id: "sector-hopper",
    title: "Sector Hopper",
    description: "Hold at least 4 tickers across 3 different sectors.",
    check: (sim) => {
      const symbols = Object.keys(sim.portfolio);
      const sectors = new Set(symbols.map((symbol) => STOCK_BY_SYMBOL[symbol].sector));
      return symbols.length >= 4 && sectors.size >= 3;
    }
  },
  {
    id: "income-tour",
    title: "Income Tour",
    description: "Collect at least $50 in fake dividends.",
    check: (sim) => sim.dividendsCollected >= 50
  },
  {
    id: "steady-hands",
    title: "Steady Hands",
    description: "Finish 3 portfolio-positive sessions in a row.",
    check: (sim) => sim.sessionStreak >= 3
  },
  {
    id: "mode-objective",
    title: "Mode Objective",
    description: "Complete the active mode's main goal.",
    check: (sim) => isObjectiveMet(sim)
  }
];

const BADGES = [
  {
    id: "first-fill",
    title: "First Fill",
    description: "Place your first pretend trade.",
    check: (sim) => sim.tradeCount >= 1
  },
  {
    id: "strategist",
    title: "Strategist",
    description: "Use both a limit order and an auto-invest plan.",
    check: (sim) => sim.usedFeatures.limit && sim.usedFeatures.plan
  },
  {
    id: "storm-caller",
    title: "Storm Caller",
    description: "Hit Shock The Tape 3 times.",
    check: (sim) => sim.surprisesTriggered >= 3
  },
  {
    id: "turbo-account",
    title: "Turbo Account",
    description: "Reach a net worth 20% above the starting balance.",
    check: (sim) => getNetWorth(sim) >= sim.startingCash * 1.2
  },
  {
    id: "survivor",
    title: "Tape Survivor",
    description: "Stay in the simulation for at least 15 days.",
    check: (sim) => sim.day >= 15
  }
];

const dom = {
  modeSelect: document.querySelector("#modeSelect"),
  modeCard: document.querySelector("#modeCard"),
  warningButton: document.querySelector("#warningButton"),
  resetButton: document.querySelector("#resetButton"),
  advanceStep: document.querySelector("#advanceStep"),
  advanceDay: document.querySelector("#advanceDay"),
  advanceWeek: document.querySelector("#advanceWeek"),
  surpriseEvent: document.querySelector("#surpriseEvent"),
  autoPlayToggle: document.querySelector("#autoPlayToggle"),
  cashValue: document.querySelector("#cashValue"),
  cashHint: document.querySelector("#cashHint"),
  netWorthValue: document.querySelector("#netWorthValue"),
  netWorthHint: document.querySelector("#netWorthHint"),
  pnlValue: document.querySelector("#pnlValue"),
  pnlHint: document.querySelector("#pnlHint"),
  indexValue: document.querySelector("#indexValue"),
  indexHint: document.querySelector("#indexHint"),
  heatValue: document.querySelector("#heatValue"),
  heatHint: document.querySelector("#heatHint"),
  streakValue: document.querySelector("#streakValue"),
  streakHint: document.querySelector("#streakHint"),
  dayValue: document.querySelector("#dayValue"),
  sessionValue: document.querySelector("#sessionValue"),
  pulseValue: document.querySelector("#pulseValue"),
  scoreValue: document.querySelector("#scoreValue"),
  objectiveValue: document.querySelector("#objectiveValue"),
  selectedTitle: document.querySelector("#selectedTitle"),
  selectedPrice: document.querySelector("#selectedPrice"),
  selectedChange: document.querySelector("#selectedChange"),
  selectedStory: document.querySelector("#selectedStory"),
  selectedFacts: document.querySelector("#selectedFacts"),
  chartSvg: document.querySelector("#chartSvg"),
  chartLow: document.querySelector("#chartLow"),
  chartRange: document.querySelector("#chartRange"),
  chartHigh: document.querySelector("#chartHigh"),
  tickerGrid: document.querySelector("#tickerGrid"),
  tradeForm: document.querySelector("#tradeForm"),
  tradeSymbol: document.querySelector("#tradeSymbol"),
  tradeSide: document.querySelector("#tradeSide"),
  orderType: document.querySelector("#orderType"),
  quantityInput: document.querySelector("#quantityInput"),
  limitField: document.querySelector("#limitField"),
  limitInput: document.querySelector("#limitInput"),
  planForm: document.querySelector("#planForm"),
  planSymbol: document.querySelector("#planSymbol"),
  planAmount: document.querySelector("#planAmount"),
  planFrequency: document.querySelector("#planFrequency"),
  holdingsList: document.querySelector("#holdingsList"),
  newsList: document.querySelector("#newsList"),
  ordersList: document.querySelector("#ordersList"),
  plansList: document.querySelector("#plansList"),
  challengesList: document.querySelector("#challengesList"),
  badgesList: document.querySelector("#badgesList"),
  warningDialog: document.querySelector("#warningDialog"),
  warningClose: document.querySelector("#warningClose"),
  toastStack: document.querySelector("#toastStack")
};

let autoPlayHandle = null;
let toastCounter = 1;
let activeToasts = [];
let state = loadState() || createState("sandbox");

function createState(modeKey) {
  const mode = MODE_DEFS[modeKey];
  const sectorTilt = {};
  const prices = {};
  const prevPrices = {};
  const history = {};

  STOCKS.forEach((stock) => {
    const seeded = roundPrice(stock.basePrice * (1 + randomBetween(-0.07, 0.07)));
    sectorTilt[stock.sector] = 0;
    prices[stock.symbol] = seeded;
    prevPrices[stock.symbol] = seeded;
    history[stock.symbol] = buildSeedHistory(seeded, stock.volatility);
  });

  return {
    modeKey,
    tick: 0,
    day: 1,
    sessionIndex: 0,
    startingCash: mode.startingCash,
    cash: mode.startingCash,
    prices,
    prevPrices,
    history,
    sectorTilt,
    stockShock: {},
    selectedSymbol: STOCKS[0].symbol,
    marketMood: 0.04,
    marketHeat: 18,
    indexLevel: 100,
    peakValue: mode.startingCash,
    portfolio: {},
    orders: [],
    recurringPlans: [],
    news: [makeBootHeadline(modeKey)],
    achievements: [],
    completedChallenges: [],
    nextId: 1,
    tradeCount: 0,
    dividendsCollected: 0,
    totalRealized: 0,
    sessionStreak: 0,
    surprisesTriggered: 0,
    usedFeatures: {
      market: false,
      limit: false,
      plan: false
    },
    score: 0
  };
}

function buildSeedHistory(price, volatility) {
  let current = price;
  const values = [];

  for (let index = 0; index < 24; index += 1) {
    current = roundPrice(Math.max(5, current * (1 + randomBetween(-0.014, 0.014) * volatility)));
    values.push(current);
  }

  values[values.length - 1] = price;
  return values;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !MODE_DEFS[parsed.modeKey]) {
      return null;
    }

    const fresh = createState(parsed.modeKey);
    return {
      ...fresh,
      ...parsed,
      prices: { ...fresh.prices, ...(parsed.prices || {}) },
      prevPrices: { ...fresh.prevPrices, ...(parsed.prevPrices || {}) },
      history: { ...fresh.history, ...(parsed.history || {}) },
      sectorTilt: { ...fresh.sectorTilt, ...(parsed.sectorTilt || {}) },
      stockShock: parsed.stockShock || {},
      portfolio: parsed.portfolio || {},
      orders: parsed.orders || [],
      recurringPlans: parsed.recurringPlans || [],
      news: Array.isArray(parsed.news) && parsed.news.length ? parsed.news : fresh.news,
      achievements: parsed.achievements || [],
      completedChallenges: parsed.completedChallenges || [],
      usedFeatures: { ...fresh.usedFeatures, ...(parsed.usedFeatures || {}) },
      selectedSymbol: STOCK_BY_SYMBOL[parsed.selectedSymbol] ? parsed.selectedSymbol : fresh.selectedSymbol
    };
  } catch (error) {
    return null;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Ignore storage errors and keep the simulator usable.
  }
}

function makeBootHeadline(modeKey) {
  const mode = MODE_DEFS[modeKey];
  return {
    headline: "SimStreet opens for paper trading",
    detail: `${mode.name} is live. Reminder: every quote and result on this screen is fictional, and no real money is involved.`,
    tone: "neutral",
    channel: "House Notice",
    stamp: "Day 1 · Opening Bell"
  };
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function roundPrice(value) {
  return Math.round(value * 100) / 100;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function signedCurrency(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${currency(value)}`;
}

function formatPercent(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(2)}%`;
}

function getCurrentMode() {
  return MODE_DEFS[state.modeKey];
}

function getPortfolioValue(sim = state) {
  return Object.entries(sim.portfolio).reduce((total, [symbol, holding]) => {
    return total + holding.shares * sim.prices[symbol];
  }, 0);
}

function getNetWorth(sim = state) {
  return sim.cash + getPortfolioValue(sim);
}

function getAverageMarketChange() {
  const total = STOCKS.reduce((sum, stock) => {
    const previous = state.prevPrices[stock.symbol] || state.prices[stock.symbol];
    return sum + (state.prices[stock.symbol] - previous) / previous;
  }, 0);

  return total / STOCKS.length;
}

function getPulseLabel() {
  if (state.marketHeat >= 70) {
    return "Wild";
  }
  if (state.marketHeat >= 45) {
    return state.marketMood >= 0 ? "Fast Bulls" : "Fast Bears";
  }
  if (state.marketMood > 0.1) {
    return "Upbeat";
  }
  if (state.marketMood < -0.1) {
    return "Defensive";
  }
  return "Steady";
}

function getObjectiveText(sim = state) {
  if (sim.modeKey === "sandbox") {
    const completed = [sim.usedFeatures.market, sim.usedFeatures.limit, sim.usedFeatures.plan].filter(Boolean).length;
    return `${completed}/3 practice styles used`;
  }

  if (sim.modeKey === "career") {
    return `${currency(getNetWorth(sim))} of ${currency(30000)} by Day 35`;
  }

  return `Day ${sim.day}/25 and ${getNetWorth(sim) >= sim.startingCash ? "above water" : "below start"}`;
}

function isObjectiveMet(sim = state) {
  if (sim.modeKey === "sandbox") {
    return sim.usedFeatures.market && sim.usedFeatures.limit && sim.usedFeatures.plan;
  }

  if (sim.modeKey === "career") {
    return getNetWorth(sim) >= 30000 && sim.day <= 35;
  }

  return sim.day >= 25 && getNetWorth(sim) > sim.startingCash;
}

function computeScore() {
  const profit = Math.max(0, getNetWorth() - state.startingCash);
  const challengeBonus = state.completedChallenges.length * 500;
  const badgeBonus = state.achievements.length * 280;
  const resilience = state.day * 45 + state.sessionStreak * 70;
  const income = state.dividendsCollected * 6;
  state.score = Math.round(profit + challengeBonus + badgeBonus + resilience + income);
}

function getSelectedHolding() {
  return state.portfolio[state.selectedSymbol] || null;
}

function getChangeForSymbol(symbol) {
  const current = state.prices[symbol];
  const previous = state.prevPrices[symbol] || current;
  const delta = current - previous;
  return {
    delta,
    pct: previous ? delta / previous : 0
  };
}

function pushToast(title, body, tone = "accent") {
  const id = toastCounter;
  toastCounter += 1;
  activeToasts.unshift({ id, title, body, tone });
  activeToasts = activeToasts.slice(0, 4);
  renderToasts();

  window.setTimeout(() => {
    activeToasts = activeToasts.filter((toast) => toast.id !== id);
    renderToasts();
  }, 3800);
}

function renderToasts() {
  dom.toastStack.innerHTML = activeToasts
    .map(
      (toast) => `
        <article class="toast toast--${toast.tone}">
          <strong>${toast.title}</strong>
          <p>${toast.body}</p>
        </article>
      `
    )
    .join("");
}

function nextId() {
  const id = state.nextId;
  state.nextId += 1;
  return id;
}

function currentStamp() {
  return `Day ${state.day} · ${PHASES[state.sessionIndex]}`;
}

function spawnEvent(force = false) {
  const pick = Math.random();
  let entry;

  if (pick < 0.25) {
    const event = GLOBAL_EVENTS[Math.floor(Math.random() * GLOBAL_EVENTS.length)];
    state.marketMood = clamp(state.marketMood + event.shift * 0.32, -1.2, 1.2);
    entry = {
      headline: event.headline,
      detail: event.detail,
      tone: event.tone,
      channel: force ? "Shock Tape" : "Macro Tape",
      stamp: currentStamp()
    };
  } else if (pick < 0.7) {
    const sector = STOCKS[Math.floor(Math.random() * STOCKS.length)].sector;
    const eventPool = SECTOR_EVENTS[sector];
    const event = eventPool[Math.floor(Math.random() * eventPool.length)];
    state.sectorTilt[sector] = clamp((state.sectorTilt[sector] || 0) + event.shift, -1.5, 1.5);
    entry = {
      headline: event.headline,
      detail: `${event.detail} Sector: ${sector}.`,
      tone: event.tone,
      channel: force ? "Shock Tape" : "Sector Flash",
      stamp: currentStamp()
    };
  } else {
    const stock = STOCKS[Math.floor(Math.random() * STOCKS.length)];
    const template = COMPANY_EVENT_PATTERNS[Math.floor(Math.random() * COMPANY_EVENT_PATTERNS.length)];
    const shift = template.shift * (force ? 1.12 : 1);
    state.stockShock[stock.symbol] = clamp((state.stockShock[stock.symbol] || 0) + shift, -2.2, 2.2);
    entry = {
      headline: template.headline.replace("{name}", stock.name),
      detail: `${template.detail} Target ticker: ${stock.symbol}.`,
      tone: template.tone,
      channel: force ? "Shock Tape" : "Ticker Flash",
      stamp: currentStamp()
    };
  }

  state.news.unshift(entry);
  state.news = state.news.slice(0, 12);
}

function executeTrade(symbol, side, shares, price, source) {
  const holding = state.portfolio[symbol] || { shares: 0, avgCost: 0, daysHeld: 0 };
  const roundedShares = Math.floor(Number(shares));

  if (!Number.isFinite(roundedShares) || roundedShares <= 0) {
    return { ok: false, message: "Share count must be at least 1." };
  }

  if (side === "buy") {
    const cost = roundPrice(roundedShares * price);
    if (cost > state.cash) {
      return { ok: false, message: "Not enough paper cash for that pretend buy." };
    }

    const totalCost = holding.avgCost * holding.shares + cost;
    holding.shares += roundedShares;
    holding.avgCost = holding.shares ? totalCost / holding.shares : 0;
    holding.daysHeld = holding.daysHeld || 0;
    state.portfolio[symbol] = holding;
    state.cash = roundPrice(state.cash - cost);
  } else {
    if (holding.shares < roundedShares) {
      return { ok: false, message: "You do not own enough simulated shares to sell that amount." };
    }

    const proceeds = roundPrice(roundedShares * price);
    state.cash = roundPrice(state.cash + proceeds);
    state.totalRealized = roundPrice(state.totalRealized + (price - holding.avgCost) * roundedShares);
    holding.shares -= roundedShares;

    if (holding.shares <= 0) {
      delete state.portfolio[symbol];
    } else {
      state.portfolio[symbol] = holding;
    }
  }

  state.tradeCount += 1;
  if (source === "market") {
    state.usedFeatures.market = true;
  }

  return { ok: true };
}

function processLimitOrders() {
  const remaining = [];

  state.orders.forEach((order) => {
    const price = state.prices[order.symbol];
    const shouldFill =
      (order.side === "buy" && price <= order.limit) ||
      (order.side === "sell" && price >= order.limit);

    if (!shouldFill) {
      remaining.push(order);
      return;
    }

    const result = executeTrade(order.symbol, order.side, order.shares, price, "limit");
    if (result.ok) {
      state.usedFeatures.limit = true;
      pushToast(
        "Limit order filled",
        `${order.side === "buy" ? "Bought" : "Sold"} ${order.shares} ${order.symbol} at ${currency(price)} in the simulation.`,
        "accent"
      );
    } else {
      pushToast("Limit order cancelled", result.message, "warning");
    }
  });

  state.orders = remaining;
}

function processRecurringPlans() {
  state.recurringPlans.forEach((plan) => {
    if (state.tick < plan.nextTick) {
      return;
    }

    const interval = plan.frequency === "daily" ? PHASES.length : PHASES.length * 5;
    const price = state.prices[plan.symbol];
    const shares = Math.floor(plan.amount / price);

    if (shares >= 1) {
      const result = executeTrade(plan.symbol, "buy", shares, price, "plan");
      if (result.ok) {
        state.usedFeatures.plan = true;
        pushToast(
          "Auto-invest filled",
          `Your ${plan.frequency} paper plan bought ${shares} ${plan.symbol} at ${currency(price)}.`,
          "success"
        );
      } else {
        pushToast("Auto-invest skipped", result.message, "warning");
      }
    } else {
      pushToast("Auto-invest skipped", `${plan.symbol} costs more than your plan budget right now.`, "warning");
    }

    plan.nextTick += interval;
  });
}

function distributeDividends() {
  let total = 0;

  Object.entries(state.portfolio).forEach(([symbol, holding]) => {
    const stock = STOCK_BY_SYMBOL[symbol];
    if (!stock.dividend) {
      return;
    }

    total += holding.shares * state.prices[symbol] * stock.dividend * 5;
  });

  if (total <= 0) {
    return;
  }

  const rounded = roundPrice(total);
  state.cash += rounded;
  state.dividendsCollected += rounded;
  pushToast("Fake dividends paid", `${currency(rounded)} landed in your paper cash balance.`, "success");
}

function checkProgress() {
  CHALLENGES.forEach((challenge) => {
    if (!state.completedChallenges.includes(challenge.id) && challenge.check(state)) {
      state.completedChallenges.push(challenge.id);
      pushToast("Challenge cleared", challenge.title, "success");
    }
  });

  BADGES.forEach((badge) => {
    if (!state.achievements.includes(badge.id) && badge.check(state)) {
      state.achievements.push(badge.id);
      pushToast("Badge unlocked", badge.title, "accent");
    }
  });
}

function advanceSimulation(steps, forceShock = false) {
  for (let count = 0; count < steps; count += 1) {
    const previousWorth = getNetWorth();
    const mode = getCurrentMode();

    state.tick += 1;
    state.sessionIndex = (state.sessionIndex + 1) % PHASES.length;

    if (state.sessionIndex === 0) {
      state.day += 1;
      Object.values(state.portfolio).forEach((holding) => {
        holding.daysHeld = (holding.daysHeld || 0) + 1;
      });
    }

    state.marketMood = clamp(state.marketMood * 0.72 + randomBetween(-0.18, 0.18), -1.2, 1.2);

    if (forceShock || Math.random() < mode.eventChance) {
      spawnEvent(forceShock);
      forceShock = false;
    }

    if (state.modeKey === "frenzy" && Math.random() < 0.16) {
      spawnEvent(false);
    }

    STOCKS.forEach((stock) => {
      const current = state.prices[stock.symbol];
      state.prevPrices[stock.symbol] = current;

      const sectorDrift = (state.sectorTilt[stock.sector] || 0) * 0.0054;
      const stockDrift = (state.stockShock[stock.symbol] || 0) * 0.0068;
      const macroDrift = state.marketMood * 0.0038;
      const randomMove = randomBetween(-0.011, 0.011) * stock.volatility * mode.volatility;
      const frenzyKick = state.modeKey === "frenzy" && Math.random() < 0.06 ? randomBetween(-0.05, 0.05) : 0;
      const pctMove = clamp(stock.drift + sectorDrift + stockDrift + macroDrift + randomMove + frenzyKick, -0.18, 0.18);
      const nextPrice = roundPrice(Math.max(5, current * (1 + pctMove)));

      state.prices[stock.symbol] = nextPrice;
      state.history[stock.symbol].push(nextPrice);
      state.history[stock.symbol] = state.history[stock.symbol].slice(-36);
    });

    Object.keys(state.sectorTilt).forEach((sector) => {
      state.sectorTilt[sector] *= 0.56;
    });

    Object.keys(state.stockShock).forEach((symbol) => {
      state.stockShock[symbol] *= 0.44;
    });

    processRecurringPlans();
    processLimitOrders();

    if (state.sessionIndex === PHASES.length - 1 && state.day % 5 === 0) {
      distributeDividends();
    }

    const averageChange = getAverageMarketChange();
    state.indexLevel = roundPrice(Math.max(60, state.indexLevel * (1 + averageChange * 0.62 + state.marketMood * 0.002)));
    state.marketHeat = Math.round(clamp(Math.abs(averageChange) * 2600, 10, 99));
    state.peakValue = Math.max(state.peakValue, getNetWorth());

    const worthDelta = getNetWorth() - previousWorth;
    state.sessionStreak = worthDelta > 0 ? state.sessionStreak + 1 : 0;
  }

  checkProgress();
  computeScore();
  saveState();
  render();
}

function placeTrade(event) {
  event.preventDefault();
  const symbol = dom.tradeSymbol.value;
  const side = dom.tradeSide.value;
  const orderType = dom.orderType.value;
  const shares = Number(dom.quantityInput.value);
  const price = state.prices[symbol];

  if (!Number.isFinite(shares) || Math.floor(shares) <= 0) {
    pushToast("Invalid order", "Enter at least 1 share for the pretend order.", "warning");
    return;
  }

  if (orderType === "market") {
    const result = executeTrade(symbol, side, shares, price, "market");
    if (!result.ok) {
      pushToast("Order rejected", result.message, "warning");
      return;
    }

    pushToast(
      "Order filled",
      `${side === "buy" ? "Bought" : "Sold"} ${Math.floor(shares)} ${symbol} at ${currency(price)}. Still just paper trading.`,
      "success"
    );
    checkProgress();
    computeScore();
    saveState();
    render();
    return;
  }

  const limit = Number(dom.limitInput.value);
  if (!Number.isFinite(limit) || limit <= 0) {
    pushToast("Invalid limit", "Enter a valid limit price for the pretend order.", "warning");
    return;
  }

  state.orders.unshift({
    id: nextId(),
    symbol,
    side,
    shares: Math.floor(shares),
    limit: roundPrice(limit),
    createdAt: currentStamp()
  });

  pushToast(
    "Limit order queued",
    `${side === "buy" ? "Buy" : "Sell"} ${Math.floor(shares)} ${symbol} ${side === "buy" ? "at or below" : "at or above"} ${currency(limit)}.`,
    "accent"
  );
  checkProgress();
  computeScore();
  saveState();
  render();
}

function addPlan(event) {
  event.preventDefault();
  const symbol = dom.planSymbol.value;
  const amount = Number(dom.planAmount.value);
  const frequency = dom.planFrequency.value;

  if (!Number.isFinite(amount) || amount < 10) {
    pushToast("Plan rejected", "Recurring paper plans need a budget of at least $10.", "warning");
    return;
  }

  state.recurringPlans.unshift({
    id: nextId(),
    symbol,
    amount: roundPrice(amount),
    frequency,
    nextTick: state.tick + (frequency === "daily" ? PHASES.length : PHASES.length * 5)
  });

  pushToast(
    "Plan added",
    `${frequency === "daily" ? "Daily" : "Weekly"} paper buys for ${symbol} will start on the next cycle.`,
    "accent"
  );
  checkProgress();
  computeScore();
  saveState();
  render();
}

function cancelOrder(orderId) {
  state.orders = state.orders.filter((order) => order.id !== orderId);
  saveState();
  render();
}

function cancelPlan(planId) {
  state.recurringPlans = state.recurringPlans.filter((plan) => plan.id !== planId);
  saveState();
  render();
}

function resetSimulation(modeKey = state.modeKey) {
  stopAutoplay();
  state = createState(modeKey);
  saveState();
  render();
}

function stopAutoplay() {
  if (autoPlayHandle) {
    window.clearInterval(autoPlayHandle);
    autoPlayHandle = null;
  }
}

function toggleAutoplay() {
  if (autoPlayHandle) {
    stopAutoplay();
    render();
    return;
  }

  autoPlayHandle = window.setInterval(() => {
    advanceSimulation(1);
  }, 1200);
  render();
}

function renderModeOptions() {
  dom.modeSelect.innerHTML = Object.entries(MODE_DEFS)
    .map(([key, mode]) => `<option value="${key}">${mode.name}</option>`)
    .join("");
  dom.modeSelect.value = state.modeKey;
}

function renderModeCard() {
  const mode = getCurrentMode();
  dom.modeCard.innerHTML = `
    <span class="mode-card__pill">${mode.tag}</span>
    <h3>${mode.name}</h3>
    <p>${mode.description}</p>
    <p><strong>Objective:</strong> ${mode.objective}</p>
  `;
}

function renderSummary() {
  const netWorth = getNetWorth();
  const pnl = netWorth - state.startingCash;

  dom.cashValue.textContent = currency(state.cash);
  dom.cashHint.textContent = `${currency(state.startingCash)} fake starting balance`;
  dom.netWorthValue.textContent = currency(netWorth);
  dom.netWorthHint.textContent = `${currency(getPortfolioValue())} in pretend holdings`;
  dom.pnlValue.textContent = signedCurrency(pnl);
  dom.pnlValue.className = pnl >= 0 ? "positive" : "negative";
  dom.pnlHint.textContent = `${formatPercent(pnl / state.startingCash)} from the start`;
  dom.indexValue.textContent = state.indexLevel.toFixed(1);
  dom.indexHint.textContent = `${state.marketMood >= 0 ? "Risk-on" : "Risk-off"} fake market mood`;
  dom.heatValue.textContent = `${state.marketHeat}`;
  dom.heatHint.textContent = state.marketHeat >= 70 ? "High volatility session" : "Controlled tape";
  dom.streakValue.textContent = `${state.sessionStreak}`;
  dom.streakHint.textContent = `Peak value ${currency(state.peakValue)}`;
  dom.dayValue.textContent = `${state.day}`;
  dom.sessionValue.textContent = PHASES[state.sessionIndex];
  dom.pulseValue.textContent = getPulseLabel();
  dom.scoreValue.textContent = state.score.toLocaleString();
  dom.objectiveValue.textContent = getObjectiveText();
}

function drawChart(symbol) {
  const stock = STOCK_BY_SYMBOL[symbol];
  const values = state.history[symbol];
  const width = 640;
  const height = 260;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const stepX = width / Math.max(1, values.length - 1);
  const points = values.map((value, index) => {
    const x = Math.round(index * stepX);
    const y = Math.round(height - ((value - min) / range) * (height - 24) - 12);
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
  const [lastX, lastY] = points[points.length - 1].split(",");

  dom.chartSvg.innerHTML = `
    <defs>
      <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${stock.tint}" stop-opacity="0.9"></stop>
        <stop offset="100%" stop-color="${stock.tint}" stop-opacity="0.05"></stop>
      </linearGradient>
    </defs>
    <line class="chart-grid" x1="0" x2="${width}" y1="${height / 4}" y2="${height / 4}"></line>
    <line class="chart-grid" x1="0" x2="${width}" y1="${height / 2}" y2="${height / 2}"></line>
    <line class="chart-grid" x1="0" x2="${width}" y1="${(height / 4) * 3}" y2="${(height / 4) * 3}"></line>
    <path class="chart-area" d="${areaPath}" fill="url(#chartFill)"></path>
    <path class="chart-line" d="${linePath}" stroke="${stock.tint}"></path>
    <circle class="chart-dot" cx="${lastX}" cy="${lastY}" r="7" fill="${stock.tint}"></circle>
  `;

  dom.chartLow.textContent = `Low ${currency(min)}`;
  dom.chartRange.textContent = `Range ${currency(max - min)}`;
  dom.chartHigh.textContent = `High ${currency(max)}`;
}

function renderSelectedStock() {
  const stock = STOCK_BY_SYMBOL[state.selectedSymbol];
  const change = getChangeForSymbol(stock.symbol);
  const holding = getSelectedHolding();
  const value = holding ? holding.shares * state.prices[stock.symbol] : 0;
  const unrealized = holding ? value - holding.avgCost * holding.shares : 0;

  dom.selectedTitle.textContent = `${stock.symbol} · ${stock.name}`;
  dom.selectedPrice.textContent = currency(state.prices[stock.symbol]);
  dom.selectedChange.textContent = `${formatPercent(change.pct)} this session`;
  dom.selectedChange.className = change.pct >= 0 ? "positive" : "negative";
  dom.selectedStory.textContent = `${stock.sector} · ${stock.blurb}`;

  dom.selectedFacts.innerHTML = `
    <article class="fact-pill">
      <span>Sector</span>
      <strong>${stock.sector}</strong>
    </article>
    <article class="fact-pill">
      <span>Shares owned</span>
      <strong>${holding ? holding.shares : 0}</strong>
    </article>
    <article class="fact-pill">
      <span>Average cost</span>
      <strong>${holding ? currency(holding.avgCost) : "No position"}</strong>
    </article>
    <article class="fact-pill">
      <span>Position P/L</span>
      <strong class="${unrealized >= 0 ? "positive" : "negative"}">${holding ? signedCurrency(unrealized) : currency(0)}</strong>
    </article>
  `;

  drawChart(stock.symbol);
}

function sparklineSvg(symbol) {
  const stock = STOCK_BY_SYMBOL[symbol];
  const values = state.history[symbol].slice(-12);
  const width = 100;
  const height = 42;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const step = width / Math.max(1, values.length - 1);
  const d = values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 6) - 3;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <path d="${d}" stroke="${stock.tint}"></path>
    </svg>
  `;
}

function renderTickerGrid() {
  dom.tickerGrid.innerHTML = STOCKS.map((stock) => {
    const change = getChangeForSymbol(stock.symbol);
    return `
      <button class="ticker-card ${stock.symbol === state.selectedSymbol ? "is-selected" : ""}" type="button" data-symbol="${stock.symbol}">
        <div class="ticker-card__top">
          <div>
            <strong>${stock.symbol}</strong>
            <p class="ticker-card__name">${stock.name}</p>
          </div>
          <span class="sector-chip">${stock.sector}</span>
        </div>
        <div class="sparkline">${sparklineSvg(stock.symbol)}</div>
        <div class="ticker-card__bottom">
          <strong>${currency(state.prices[stock.symbol])}</strong>
          <span class="${change.pct >= 0 ? "positive" : "negative"}">${formatPercent(change.pct)}</span>
        </div>
      </button>
    `;
  }).join("");
}

function renderHoldings() {
  const entries = Object.entries(state.portfolio);

  if (!entries.length) {
    dom.holdingsList.innerHTML = `<div class="empty-state">No positions yet. Buy a few fake shares to start tracking a portfolio.</div>`;
    return;
  }

  dom.holdingsList.innerHTML = entries
    .sort((left, right) => right[1].shares * state.prices[right[0]] - left[1].shares * state.prices[left[0]])
    .map(([symbol, holding]) => {
      const value = holding.shares * state.prices[symbol];
      const pnl = value - holding.avgCost * holding.shares;

      return `
        <article class="holding-card">
          <div class="holding-card__top">
            <div>
              <strong>${symbol} · ${STOCK_BY_SYMBOL[symbol].name}</strong>
              <p>${holding.shares} shares · Avg ${currency(holding.avgCost)}</p>
            </div>
            <div>
              <strong>${currency(value)}</strong>
              <p class="${pnl >= 0 ? "positive" : "negative"}">${signedCurrency(pnl)}</p>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderNews() {
  dom.newsList.innerHTML = state.news
    .map(
      (item) => `
        <article class="news-card">
          <div class="news-card__meta">
            <span>${item.channel}</span>
            <span>${item.stamp}</span>
            <span class="tone-pill tone-pill--${item.tone}">${item.tone}</span>
          </div>
          <strong>${item.headline}</strong>
          <p>${item.detail}</p>
        </article>
      `
    )
    .join("");
}

function renderOrders() {
  if (!state.orders.length) {
    dom.ordersList.innerHTML = `<div class="empty-state">No pending limit orders. Queue one from the trade desk to wait for a price target.</div>`;
    return;
  }

  dom.ordersList.innerHTML = state.orders
    .map(
      (order) => `
        <article class="status-card">
          <div class="status-card__top">
            <div>
              <strong>${order.side === "buy" ? "Buy" : "Sell"} ${order.shares} ${order.symbol}</strong>
              <p>${order.side === "buy" ? "At or below" : "At or above"} ${currency(order.limit)} · ${order.createdAt}</p>
            </div>
          </div>
          <div class="status-card__action">
            <button class="inline-button" type="button" data-order-id="${order.id}">Cancel</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderPlans() {
  if (!state.recurringPlans.length) {
    dom.plansList.innerHTML = `<div class="empty-state">No recurring paper plans yet. Add one to simulate slow and steady investing.</div>`;
    return;
  }

  dom.plansList.innerHTML = state.recurringPlans
    .map(
      (plan) => `
        <article class="status-card">
          <div class="status-card__top">
            <div>
              <strong>${plan.symbol} · ${plan.frequency === "daily" ? "Daily" : "Weekly"} plan</strong>
              <p>${currency(plan.amount)} budget · Next trigger on session ${plan.nextTick}</p>
            </div>
          </div>
          <div class="status-card__action">
            <button class="inline-button" type="button" data-plan-id="${plan.id}">Cancel</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderChallenges() {
  dom.challengesList.innerHTML = CHALLENGES.map((challenge) => {
    const complete = state.completedChallenges.includes(challenge.id);
    return `
      <article class="status-card ${complete ? "is-complete" : ""}">
        <div class="status-card__top">
          <div>
            <strong>${challenge.title}</strong>
            <p>${challenge.description}</p>
          </div>
          <span class="tone-pill tone-pill--${complete ? "positive" : "neutral"}">${complete ? "Done" : "Open"}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderBadges() {
  if (!state.achievements.length) {
    dom.badgesList.innerHTML = `<div class="empty-state">No badges yet. Try different strategies and keep advancing the market.</div>`;
    return;
  }

  dom.badgesList.innerHTML = BADGES.filter((badge) => state.achievements.includes(badge.id))
    .map(
      (badge) => `
        <article class="status-card is-complete">
          <div class="status-card__top">
            <div>
              <strong>${badge.title}</strong>
              <p>${badge.description}</p>
            </div>
            <span class="tone-pill tone-pill--positive">Unlocked</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderTradeSelectors() {
  const options = STOCKS.map((stock) => `<option value="${stock.symbol}">${stock.symbol} · ${stock.name}</option>`).join("");
  dom.tradeSymbol.innerHTML = options;
  dom.planSymbol.innerHTML = options;
  dom.tradeSymbol.value = state.selectedSymbol;
  dom.planSymbol.value = state.selectedSymbol;
}

function updateLimitVisibility() {
  const isLimit = dom.orderType.value === "limit";
  dom.limitField.hidden = !isLimit;
  if (isLimit && !dom.limitInput.value) {
    dom.limitInput.value = state.prices[dom.tradeSymbol.value].toFixed(2);
  }
}

function renderAutoplayState() {
  dom.autoPlayToggle.textContent = autoPlayHandle ? "Autoplay On" : "Autoplay Off";
}

function render() {
  renderModeOptions();
  renderModeCard();
  renderSummary();
  renderTradeSelectors();
  renderSelectedStock();
  renderTickerGrid();
  renderHoldings();
  renderNews();
  renderOrders();
  renderPlans();
  renderChallenges();
  renderBadges();
  renderAutoplayState();
  updateLimitVisibility();
}

function openWarningDialog() {
  if (dom.warningDialog.open) {
    return;
  }

  if (typeof dom.warningDialog.showModal === "function") {
    dom.warningDialog.showModal();
  } else {
    dom.warningDialog.setAttribute("open", "");
  }
}

function closeWarningDialog() {
  if (typeof dom.warningDialog.close === "function") {
    dom.warningDialog.close();
  } else {
    dom.warningDialog.removeAttribute("open");
  }
}

dom.warningButton.addEventListener("click", openWarningDialog);

dom.warningClose.addEventListener("click", () => {
  localStorage.setItem(WARNING_KEY, "seen");
  closeWarningDialog();
});

dom.resetButton.addEventListener("click", () => {
  const confirmed = window.confirm("Restart this simulated account? Your current paper portfolio will be reset.");
  if (confirmed) {
    resetSimulation(state.modeKey);
    pushToast("Simulation reset", "Fresh paper cash loaded. Still no real money involved.", "accent");
  }
});

dom.modeSelect.addEventListener("change", (event) => {
  const nextMode = event.target.value;
  if (nextMode === state.modeKey) {
    return;
  }

  const confirmed = window.confirm(`Switch to ${MODE_DEFS[nextMode].name}? This restarts the current simulated portfolio.`);
  if (!confirmed) {
    dom.modeSelect.value = state.modeKey;
    return;
  }

  resetSimulation(nextMode);
  pushToast("Mode switched", `${MODE_DEFS[nextMode].name} is live. Objective updated.`, "accent");
});

dom.advanceStep.addEventListener("click", () => advanceSimulation(1));
dom.advanceDay.addEventListener("click", () => advanceSimulation(PHASES.length));
dom.advanceWeek.addEventListener("click", () => advanceSimulation(PHASES.length * 5));
dom.autoPlayToggle.addEventListener("click", toggleAutoplay);

dom.surpriseEvent.addEventListener("click", () => {
  state.surprisesTriggered += 1;
  advanceSimulation(1, true);
});

dom.tradeForm.addEventListener("submit", placeTrade);
dom.planForm.addEventListener("submit", addPlan);
dom.orderType.addEventListener("change", updateLimitVisibility);

dom.tradeSymbol.addEventListener("change", () => {
  state.selectedSymbol = dom.tradeSymbol.value;
  if (dom.orderType.value === "limit") {
    dom.limitInput.value = state.prices[dom.tradeSymbol.value].toFixed(2);
  }
  render();
});

dom.tickerGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-symbol]");
  if (!card) {
    return;
  }

  state.selectedSymbol = card.dataset.symbol;
  if (dom.orderType.value === "limit") {
    dom.limitInput.value = state.prices[state.selectedSymbol].toFixed(2);
  }
  render();
});

dom.ordersList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-order-id]");
  if (!button) {
    return;
  }

  cancelOrder(Number(button.dataset.orderId));
});

dom.plansList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-plan-id]");
  if (!button) {
    return;
  }

  cancelPlan(Number(button.dataset.planId));
});

checkProgress();
computeScore();
render();

if (!localStorage.getItem(WARNING_KEY)) {
  openWarningDialog();
}
