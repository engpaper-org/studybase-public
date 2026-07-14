"use strict";

const STORAGE_KEY = "paper-market-sim-simple-v1";
const STARTING_CASH = 10000;
const TICKS_PER_DAY = 4;

const STOCKS = [
  { symbol: "NVA", name: "Nova Dynamics", sector: "AI", basePrice: 132, drift: 0.0015, volatility: 1.2 },
  { symbol: "KOI", name: "Koi Cloud", sector: "Tech", basePrice: 84, drift: 0.0011, volatility: 1.05 },
  { symbol: "LUX", name: "Luma Health", sector: "Health", basePrice: 63, drift: 0.001, volatility: 0.9 },
  { symbol: "SOL", name: "Solstice Grid", sector: "Energy", basePrice: 95, drift: 0.0012, volatility: 1.1 },
  { symbol: "VTX", name: "Vertex Fin", sector: "Finance", basePrice: 56, drift: 0.0009, volatility: 1.15 },
  { symbol: "RIO", name: "Riot Media", sector: "Media", basePrice: 36, drift: 0.001, volatility: 1.35 }
];

const STOCK_BY_SYMBOL = Object.fromEntries(STOCKS.map((stock) => [stock.symbol, stock]));

const dom = {
  cashValue: document.querySelector("#cashValue"),
  holdingsValue: document.querySelector("#holdingsValue"),
  netWorthValue: document.querySelector("#netWorthValue"),
  pnlValue: document.querySelector("#pnlValue"),
  dayValue: document.querySelector("#dayValue"),
  activityScoreValue: document.querySelector("#activityScoreValue"),
  selectedTitle: document.querySelector("#selectedTitle"),
  selectedCompany: document.querySelector("#selectedCompany"),
  selectedPrice: document.querySelector("#selectedPrice"),
  selectedMove: document.querySelector("#selectedMove"),
  chartSvg: document.querySelector("#chartSvg"),
  chartLow: document.querySelector("#chartLow"),
  chartMid: document.querySelector("#chartMid"),
  chartHigh: document.querySelector("#chartHigh"),
  stepButton: document.querySelector("#stepButton"),
  dayButton: document.querySelector("#dayButton"),
  autoButton: document.querySelector("#autoButton"),
  resetButton: document.querySelector("#resetButton"),
  stockList: document.querySelector("#stockList"),
  tradeSymbol: document.querySelector("#tradeSymbol"),
  sharesInput: document.querySelector("#sharesInput"),
  buyButton: document.querySelector("#buyButton"),
  sellButton: document.querySelector("#sellButton"),
  holdingsList: document.querySelector("#holdingsList"),
  tickUpButton: document.querySelector("#tickUpButton"),
  tickDownButton: document.querySelector("#tickDownButton"),
  tickWins: document.querySelector("#tickWins"),
  tickLosses: document.querySelector("#tickLosses"),
  tickResult: document.querySelector("#tickResult"),
  marketUpButton: document.querySelector("#marketUpButton"),
  marketDownButton: document.querySelector("#marketDownButton"),
  marketWins: document.querySelector("#marketWins"),
  marketLosses: document.querySelector("#marketLosses"),
  marketResult: document.querySelector("#marketResult"),
  topPickSymbol: document.querySelector("#topPickSymbol"),
  topPickButton: document.querySelector("#topPickButton"),
  topWins: document.querySelector("#topWins"),
  topLosses: document.querySelector("#topLosses"),
  topResult: document.querySelector("#topResult"),
  toastStack: document.querySelector("#toastStack")
};

let autoplayHandle = null;
let toastId = 1;
let toasts = [];
let state = loadState() || createState();

function createActivitiesState() {
  return {
    score: 0,
    topPickSymbol: STOCKS[0].symbol,
    tick: {
      wins: 0,
      losses: 0,
      last: "Pick a direction and the sim will move one tick."
    },
    market: {
      wins: 0,
      losses: 0,
      last: "Make a call and the sim will jump ahead one day."
    },
    top: {
      wins: 0,
      losses: 0,
      last: "Pick a stock and the sim will run one full day."
    }
  };
}

function createState() {
  const prices = {};
  const previousPrices = {};
  const history = {};

  STOCKS.forEach((stock) => {
    const start = round(stock.basePrice * (1 + randomBetween(-0.05, 0.05)));
    prices[stock.symbol] = start;
    previousPrices[stock.symbol] = start;
    history[stock.symbol] = seedHistory(start, stock.volatility);
  });

  return {
    day: 1,
    tickInDay: 0,
    cash: STARTING_CASH,
    startingCash: STARTING_CASH,
    prices,
    previousPrices,
    history,
    portfolio: {},
    selectedSymbol: STOCKS[0].symbol,
    marketDrift: 0,
    activities: createActivitiesState()
  };
}

function seedHistory(price, volatility) {
  const values = [];
  let current = price;

  for (let index = 0; index < 28; index += 1) {
    current = round(Math.max(5, current * (1 + randomBetween(-0.012, 0.012) * volatility)));
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
    if (!parsed || !parsed.selectedSymbol || !parsed.prices) {
      return null;
    }

    const fresh = createState();
    const freshActivities = createActivitiesState();
    const parsedActivities = parsed.activities || parsed["g" + "ames"] || {};
    return {
      ...fresh,
      ...parsed,
      prices: { ...fresh.prices, ...parsed.prices },
      previousPrices: { ...fresh.previousPrices, ...parsed.previousPrices },
      history: { ...fresh.history, ...parsed.history },
      portfolio: parsed.portfolio || {},
      selectedSymbol: STOCK_BY_SYMBOL[parsed.selectedSymbol] ? parsed.selectedSymbol : fresh.selectedSymbol,
      activities: {
        ...freshActivities,
        ...parsedActivities,
        topPickSymbol: STOCK_BY_SYMBOL[parsedActivities.topPickSymbol] ? parsedActivities.topPickSymbol : freshActivities.topPickSymbol,
        tick: { ...freshActivities.tick, ...(parsedActivities.tick || {}) },
        market: { ...freshActivities.market, ...(parsedActivities.market || {}) },
        top: { ...freshActivities.top, ...(parsedActivities.top || {}) }
      }
    };
  } catch (error) {
    return null;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(value * 100) / 100;
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

function signedPercent(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(2)}%`;
}

function holdingsValue() {
  return Object.entries(state.portfolio).reduce((total, [symbol, holding]) => {
    return total + holding.shares * state.prices[symbol];
  }, 0);
}

function netWorth() {
  return state.cash + holdingsValue();
}

function changeFor(symbol) {
  const current = state.prices[symbol];
  const previous = state.previousPrices[symbol] || current;
  const delta = current - previous;
  return {
    delta,
    percent: previous ? delta / previous : 0
  };
}

function lineColor(values) {
  return values[values.length - 1] >= values[0] ? "#2bc46d" : "#e25555";
}

function pushToast(title, body) {
  const id = toastId;
  toastId += 1;
  toasts.unshift({ id, title, body });
  toasts = toasts.slice(0, 4);
  renderToasts();

  window.setTimeout(() => {
    toasts = toasts.filter((toast) => toast.id !== id);
    renderToasts();
  }, 3200);
}

function renderToasts() {
  dom.toastStack.innerHTML = toasts
    .map(
      (toast) => `
        <article class="toast">
          <strong>${toast.title}</strong>
          <p>${toast.body}</p>
        </article>
      `
    )
    .join("");
}

function snapshotPrices() {
  return STOCKS.reduce((map, stock) => {
    map[stock.symbol] = state.prices[stock.symbol];
    return map;
  }, {});
}

function runSingleTick() {
  state.marketDrift = clamp(state.marketDrift * 0.7 + randomBetween(-0.004, 0.004), -0.02, 0.02);

  STOCKS.forEach((stock) => {
    const current = state.prices[stock.symbol];
    state.previousPrices[stock.symbol] = current;

    const move =
      stock.drift +
      state.marketDrift +
      randomBetween(-0.018, 0.018) * stock.volatility;

    const next = round(Math.max(5, current * (1 + clamp(move, -0.12, 0.12))));
    state.prices[stock.symbol] = next;
    state.history[stock.symbol].push(next);
    state.history[stock.symbol] = state.history[stock.symbol].slice(-40);
  });

  state.tickInDay += 1;
  if (state.tickInDay >= TICKS_PER_DAY) {
    state.tickInDay = 0;
    state.day += 1;
  }
}

function advanceTicks(count) {
  for (let index = 0; index < count; index += 1) {
    runSingleTick();
  }

  saveState();
  render();
}

function simulateTick() {
  advanceTicks(1);
}

function simulateDay() {
  advanceTicks(TICKS_PER_DAY);
}

function toggleAutoplay() {
  if (autoplayHandle) {
    window.clearInterval(autoplayHandle);
    autoplayHandle = null;
    renderControls();
    return;
  }

  autoplayHandle = window.setInterval(() => {
    simulateTick();
  }, 1200);
  renderControls();
}

function stopAutoplay() {
  if (!autoplayHandle) {
    return;
  }

  window.clearInterval(autoplayHandle);
  autoplayHandle = null;
}

function buyShares() {
  const symbol = dom.tradeSymbol.value;
  const shares = Math.floor(Number(dom.sharesInput.value));
  const price = state.prices[symbol];

  if (!Number.isFinite(shares) || shares < 1) {
    pushToast("Invalid trade", "Enter at least 1 fake share.");
    return;
  }

  const cost = round(shares * price);
  if (cost > state.cash) {
    pushToast("Not enough fake cash", "This simulator order costs more than your paper balance.");
    return;
  }

  const holding = state.portfolio[symbol] || { shares: 0, averageCost: 0 };
  const totalCost = holding.averageCost * holding.shares + cost;
  holding.shares += shares;
  holding.averageCost = totalCost / holding.shares;
  state.portfolio[symbol] = holding;
  state.cash = round(state.cash - cost);

  saveState();
  render();
  pushToast("Bought shares", `Bought ${shares} ${symbol} with fake money only.`);
}

function sellShares() {
  const symbol = dom.tradeSymbol.value;
  const shares = Math.floor(Number(dom.sharesInput.value));
  const holding = state.portfolio[symbol];

  if (!Number.isFinite(shares) || shares < 1) {
    pushToast("Invalid trade", "Enter at least 1 fake share.");
    return;
  }

  if (!holding || holding.shares < shares) {
    pushToast("Not enough shares", "You do not own that many simulated shares.");
    return;
  }

  const proceeds = round(shares * state.prices[symbol]);
  holding.shares -= shares;
  state.cash = round(state.cash + proceeds);

  if (holding.shares <= 0) {
    delete state.portfolio[symbol];
  } else {
    state.portfolio[symbol] = holding;
  }

  saveState();
  render();
  pushToast("Sold shares", `Sold ${shares} ${symbol}. Still just a simulation.`);
}

function resetSimulation() {
  stopAutoplay();
  state = createState();
  saveState();
  render();
  pushToast("Simulation reset", "Fresh paper balance loaded. No real money involved.");
}

function finishActivityRound(activityKey, won, message, points) {
  const activity = state.activities[activityKey];

  if (won) {
    activity.wins += 1;
    state.activities.score += points;
  } else {
    activity.losses += 1;
  }

  activity.last = message;
  saveState();
  render();
  pushToast(won ? "Round won" : "Round missed", won ? `+${points} activity points.` : message);
}

function playTickGuess(direction) {
  stopAutoplay();
  const symbol = state.selectedSymbol;
  const before = state.prices[symbol];
  advanceTicks(1);
  const after = state.prices[symbol];
  const outcome = after > before ? "up" : after < before ? "down" : "flat";
  const won = outcome === direction;
  const message = outcome === "flat"
    ? `${symbol} stayed flat from ${currency(before)} to ${currency(after)}. No green or red break this tick.`
    : `${symbol} moved ${outcome} from ${currency(before)} to ${currency(after)}. ${won ? "Nice call." : "Wrong side this time."}`;

  finishActivityRound("tick", won, message, 10);
}

function playMarketGuess(direction) {
  stopAutoplay();
  const before = snapshotPrices();
  advanceTicks(TICKS_PER_DAY);

  const averageMove = STOCKS.reduce((total, stock) => {
    const start = before[stock.symbol];
    const end = state.prices[stock.symbol];
    return total + (end - start) / start;
  }, 0) / STOCKS.length;

  const outcome = averageMove > 0 ? "up" : averageMove < 0 ? "down" : "flat";
  const won = outcome === direction;
  const message = outcome === "flat"
    ? `The fake market finished almost flat over the day at ${signedPercent(averageMove)} average change.`
    : `The fake market finished ${outcome} over the day with an average move of ${signedPercent(averageMove)}. ${won ? "Good read." : "That one slipped away."}`;

  finishActivityRound("market", won, message, 15);
}

function playTopGainer() {
  stopAutoplay();
  const pick = state.activities.topPickSymbol;
  const before = snapshotPrices();
  advanceTicks(TICKS_PER_DAY);

  const ranked = STOCKS.map((stock) => {
    const start = before[stock.symbol];
    const end = state.prices[stock.symbol];
    return {
      symbol: stock.symbol,
      percent: (end - start) / start
    };
  }).sort((left, right) => right.percent - left.percent);

  const winner = ranked[0];
  const won = pick === winner.symbol;
  const message = `${winner.symbol} was the top gainer at ${signedPercent(winner.percent)}. ${won ? "You picked the winner." : `Your pick was ${pick}.`}`;

  finishActivityRound("top", won, message, 25);
}

function chartPath(values, width, height, padding) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const step = (width - padding * 2) / Math.max(1, values.length - 1);

  return values
    .map((value, index) => {
      const x = padding + index * step;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function drawMainChart() {
  const values = state.history[state.selectedSymbol];
  const color = lineColor(values);
  const width = 760;
  const height = 320;
  const padding = 20;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const path = chartPath(values, width, height, padding);
  const lastValue = values[values.length - 1];
  const range = Math.max(1, max - min);
  const lastX = width - padding;
  const lastY = height - padding - ((lastValue - min) / range) * (height - padding * 2);
  const areaPath = `${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

  dom.chartSvg.innerHTML = `
    <defs>
      <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.42"></stop>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.02"></stop>
      </linearGradient>
    </defs>
    <line class="chart-grid" x1="${padding}" y1="80" x2="${width - padding}" y2="80"></line>
    <line class="chart-grid" x1="${padding}" y1="160" x2="${width - padding}" y2="160"></line>
    <line class="chart-grid" x1="${padding}" y1="240" x2="${width - padding}" y2="240"></line>
    <path class="chart-area" d="${areaPath}" fill="url(#chartFill)"></path>
    <path class="chart-line" d="${path}" stroke="${color}"></path>
    <circle class="chart-dot" cx="${lastX}" cy="${lastY.toFixed(2)}" r="6" fill="${color}"></circle>
  `;

  dom.chartLow.textContent = `Low ${currency(min)}`;
  dom.chartMid.textContent = `Mid ${currency((min + max) / 2)}`;
  dom.chartHigh.textContent = `High ${currency(max)}`;
}

function miniChart(symbol) {
  const values = state.history[symbol].slice(-16);
  const color = lineColor(values);
  const path = chartPath(values, 100, 48, 3);

  return `
    <svg viewBox="0 0 100 48" preserveAspectRatio="none" aria-hidden="true">
      <path d="${path}" stroke="${color}"></path>
    </svg>
  `;
}

function renderSummary() {
  const holdings = holdingsValue();
  const worth = netWorth();
  const pnl = worth - state.startingCash;

  dom.cashValue.textContent = currency(state.cash);
  dom.holdingsValue.textContent = currency(holdings);
  dom.netWorthValue.textContent = currency(worth);
  dom.pnlValue.textContent = signedCurrency(pnl);
  dom.pnlValue.className = pnl >= 0 ? "positive" : "negative";
  dom.dayValue.textContent = String(state.day);
  dom.activityScoreValue.textContent = state.activities.score.toLocaleString();
}

function renderSelectedStock() {
  const stock = STOCK_BY_SYMBOL[state.selectedSymbol];
  const move = changeFor(stock.symbol);

  dom.selectedTitle.textContent = stock.symbol;
  dom.selectedCompany.textContent = `${stock.name} - ${stock.sector}`;
  dom.selectedPrice.textContent = currency(state.prices[stock.symbol]);
  dom.selectedMove.textContent = signedPercent(move.percent);
  dom.selectedMove.className = move.percent >= 0 ? "positive" : "negative";

  drawMainChart();
}

function renderStockList() {
  dom.stockList.innerHTML = STOCKS.map((stock) => {
    const move = changeFor(stock.symbol);
    return `
      <button class="stock-card ${state.selectedSymbol === stock.symbol ? "is-selected" : ""}" type="button" data-symbol="${stock.symbol}">
        <div class="stock-top">
          <div>
            <strong>${stock.symbol}</strong>
            <p>${stock.name}</p>
          </div>
          <strong class="${move.percent >= 0 ? "positive" : "negative"}">${signedPercent(move.percent)}</strong>
        </div>
        <div class="mini-chart">${miniChart(stock.symbol)}</div>
        <div class="stock-bottom">
          <span>${stock.sector}</span>
          <strong>${currency(state.prices[stock.symbol])}</strong>
        </div>
      </button>
    `;
  }).join("");
}

function renderTradeOptions() {
  const options = STOCKS.map((stock) => {
    return `<option value="${stock.symbol}">${stock.symbol} - ${stock.name}</option>`;
  }).join("");

  dom.tradeSymbol.innerHTML = options;
  dom.topPickSymbol.innerHTML = options;
  dom.tradeSymbol.value = state.selectedSymbol;
  dom.topPickSymbol.value = state.activities.topPickSymbol;
}

function renderHoldings() {
  const entries = Object.entries(state.portfolio);

  if (!entries.length) {
    dom.holdingsList.innerHTML = `<div class="empty-state">You do not own any fake shares yet.</div>`;
    return;
  }

  dom.holdingsList.innerHTML = entries
    .sort((left, right) => right[1].shares * state.prices[right[0]] - left[1].shares * state.prices[left[0]])
    .map(([symbol, holding]) => {
      const value = holding.shares * state.prices[symbol];
      const profit = value - holding.averageCost * holding.shares;
      return `
        <article class="holding-card">
          <div class="holding-top">
            <div>
              <strong>${symbol} - ${STOCK_BY_SYMBOL[symbol].name}</strong>
              <p>${holding.shares} shares at avg ${currency(holding.averageCost)}</p>
            </div>
            <div>
              <strong>${currency(value)}</strong>
              <p class="${profit >= 0 ? "positive" : "negative"}">${signedCurrency(profit)}</p>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderControls() {
  dom.autoButton.textContent = autoplayHandle ? "Auto On" : "Auto Off";
}

function renderGames() {
  dom.tickWins.textContent = String(state.activities.tick.wins);
  dom.tickLosses.textContent = String(state.activities.tick.losses);
  dom.tickResult.textContent = state.activities.tick.last;
  dom.marketWins.textContent = String(state.activities.market.wins);
  dom.marketLosses.textContent = String(state.activities.market.losses);
  dom.marketResult.textContent = state.activities.market.last;
  dom.topWins.textContent = String(state.activities.top.wins);
  dom.topLosses.textContent = String(state.activities.top.losses);
  dom.topResult.textContent = state.activities.top.last;
}

function render() {
  renderSummary();
  renderSelectedStock();
  renderStockList();
  renderTradeOptions();
  renderHoldings();
  renderControls();
  renderGames();
}

dom.stepButton.addEventListener("click", simulateTick);
dom.dayButton.addEventListener("click", simulateDay);
dom.autoButton.addEventListener("click", toggleAutoplay);
dom.resetButton.addEventListener("click", () => {
  const confirmed = window.confirm("Reset the simulation and clear your fake portfolio?");
  if (confirmed) {
    resetSimulation();
  }
});

dom.buyButton.addEventListener("click", buyShares);
dom.sellButton.addEventListener("click", sellShares);
dom.tickUpButton.addEventListener("click", () => playTickGuess("up"));
dom.tickDownButton.addEventListener("click", () => playTickGuess("down"));
dom.marketUpButton.addEventListener("click", () => playMarketGuess("up"));
dom.marketDownButton.addEventListener("click", () => playMarketGuess("down"));
dom.topPickButton.addEventListener("click", playTopGainer);

dom.tradeSymbol.addEventListener("change", () => {
  state.selectedSymbol = dom.tradeSymbol.value;
  saveState();
  render();
});

dom.topPickSymbol.addEventListener("change", () => {
  state.activities.topPickSymbol = dom.topPickSymbol.value;
  saveState();
  renderGames();
});

dom.stockList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-symbol]");
  if (!button) {
    return;
  }

  state.selectedSymbol = button.dataset.symbol;
  saveState();
  render();
});

render();
