# Stock Quant Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a simple single-page stock quant simulation and information website with sample stock data, a basic backtest workflow, and a clean browser-friendly layout.

**Architecture:** The app will be a small static web app with one HTML entry point, one stylesheet, one browser logic file, and one shared quant logic module. The page will render a stock info panel, a simulator panel, and a results panel. All data will start with local sample data so the page works without external services, and the shared quant module keeps the backtest rules testable before the UI uses them.

**Tech Stack:** HTML, CSS, vanilla JavaScript, local sample data.

---

### Task 1: Build the page shell

**Files:**
- Create: `index.html`
- Create: `styles.css`

- [ ] **Step 1: Write the page structure**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>股票量化模拟</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <main class="app">
      <header class="hero">
        <div>
          <p class="eyebrow">股票量化模拟</p>
          <h1>简单的股票信息和策略回测页</h1>
          <p class="lead">先用本地示例数据，页面可以直接打开使用。</p>
        </div>
      </header>

      <section class="grid">
        <article class="panel" id="stock-panel">
          <h2>股票信息</h2>
          <div id="stock-info"></div>
          <div id="mini-chart" class="chart"></div>
        </article>

        <article class="panel" id="simulator-panel">
          <h2>量化模拟</h2>
          <form id="simulator-form" class="form">
            <label>
              选择股票
              <select id="symbol-select"></select>
            </label>
            <label>
              初始资金
              <input id="initial-capital" type="number" min="1000" step="1000" value="100000" />
            </label>
            <label>
              策略类型
              <select id="strategy-select">
                <option value="ma-cross">均线交叉</option>
                <option value="buy-and-hold">买入并持有</option>
              </select>
            </label>
            <button type="submit">开始模拟</button>
          </form>
        </article>
      </section>

      <section class="panel" id="results-panel">
        <h2>模拟结果</h2>
        <div id="summary"></div>
        <div id="equity-curve" class="chart"></div>
        <div id="trade-log"></div>
      </section>
    </main>
    <script type="module" src="./app.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Write the page styles**

```css
:root {
  color-scheme: light;
  --bg: #f4f7fb;
  --panel: #ffffff;
  --text: #102033;
  --muted: #5d6b7a;
  --primary: #2f6fed;
  --accent: #18a999;
  --border: #d8e1ea;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: linear-gradient(180deg, #eef3f9 0%, #f7f9fc 100%);
  color: var(--text);
}

.app {
  width: min(1200px, calc(100% - 32px));
  margin: 0 auto;
  padding: 24px 0 40px;
}

.hero,
.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(16, 32, 51, 0.06);
}

.hero {
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--primary);
  font-weight: 700;
  letter-spacing: 0.02em;
}

.lead,
.muted {
  color: var(--muted);
}

.grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
  margin-bottom: 20px;
}

.panel h2 {
  margin: 0 0 16px;
  font-size: 1.1rem;
}

.form {
  display: grid;
  gap: 12px;
}

.form label {
  display: grid;
  gap: 6px;
  font-size: 0.95rem;
}

.form input,
.form select,
.form button {
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 10px 12px;
  font: inherit;
}

.form button {
  background: var(--primary);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.chart {
  margin-top: 16px;
  min-height: 220px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #f9fbfd;
  padding: 12px;
  overflow: hidden;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Run a browser check on the shell**

Run: open `index.html` in a browser
Expected: title, hero, stock panel, simulator panel, and results panel are all visible without overlap.

### Task 2: Add sample stock data and render logic

**Files:**
- Create: `app.js`
- Create: `quant.mjs`
- Create: `tests/quant.test.mjs`

- [ ] **Step 1: Write the sample data and render helpers**

```javascript
const stockData = {
  AAPL: {
    name: "Apple Inc.",
    price: 214.35,
    change: +2.14,
    volume: "58.2M",
    closes: [198, 201, 204, 206, 208, 210, 212, 214],
  },
  MSFT: {
    name: "Microsoft",
    price: 441.18,
    change: -1.02,
    volume: "24.7M",
    closes: [425, 428, 432, 435, 438, 439, 442, 441],
  },
  TSLA: {
    name: "Tesla",
    price: 186.72,
    change: +4.56,
    volume: "91.5M",
    closes: [172, 175, 179, 181, 183, 184, 185, 187],
  },
};

const symbolSelect = document.querySelector("#symbol-select");
const stockInfo = document.querySelector("#stock-info");
const miniChart = document.querySelector("#mini-chart");

function renderStockList() {
  symbolSelect.innerHTML = Object.keys(stockData)
    .map((symbol) => `<option value="${symbol}">${symbol}</option>`)
    .join("");
}

function renderStockInfo(symbol) {
  const stock = stockData[symbol];
  stockInfo.innerHTML = `
    <div class="stock-card">
      <h3>${stock.name} (${symbol})</h3>
      <p class="price">$${stock.price.toFixed(2)}</p>
      <p class="${stock.change >= 0 ? "up" : "down"}">
        ${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}
      </p>
      <p class="muted">成交量 ${stock.volume}</p>
    </div>
  `;
  miniChart.innerHTML = `
    <div class="sparkline">
      ${stock.closes.map((value) => `<span style="height:${value / 2}px"></span>`).join("")}
    </div>
  `;
}

renderStockList();
renderStockInfo("AAPL");
symbolSelect.addEventListener("change", (event) => renderStockInfo(event.target.value));
```

- [ ] **Step 2: Add the stock info styles**

```css
.stock-card h3 {
  margin: 0 0 8px;
}

.price {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
}

.up {
  color: #178a5f;
  margin: 8px 0 0;
  font-weight: 700;
}

.down {
  color: #c23a3a;
  margin: 8px 0 0;
  font-weight: 700;
}

.sparkline {
  height: 180px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  align-items: end;
  gap: 8px;
}

.sparkline span {
  display: block;
  background: linear-gradient(180deg, var(--accent), var(--primary));
  border-radius: 8px 8px 2px 2px;
}
```

- [ ] **Step 3: Check stock switching**

Run: open `index.html` and switch the stock selector
Expected: stock info and the mini chart update when a different symbol is chosen.

### Task 3: Add the backtest simulator

**Files:**
- Modify: `app.js`
- Modify: `styles.css`

- [ ] **Step 1: Write the simulator logic**

```javascript
const form = document.querySelector("#simulator-form");
const summary = document.querySelector("#summary");
const equityCurve = document.querySelector("#equity-curve");
const tradeLog = document.querySelector("#trade-log");

function movingAverage(values, windowSize) {
  return values.map((_, index) => {
    if (index < windowSize - 1) return null;
    const slice = values.slice(index - windowSize + 1, index + 1);
    const total = slice.reduce((sum, value) => sum + value, 0);
    return total / windowSize;
  });
}

function runBacktest(prices, initialCapital, strategy) {
  if (strategy === "buy-and-hold") {
    const shares = Math.floor(initialCapital / prices[0]);
    const finalValue = shares * prices[prices.length - 1];
    return {
      finalValue,
      returnPct: ((finalValue - initialCapital) / initialCapital) * 100,
      trades: [`买入 ${shares} 股，持有到最后一天`],
      equity: prices.map((price) => shares * price),
    };
  }

  const shortMa = movingAverage(prices, 3);
  const longMa = movingAverage(prices, 5);
  let cash = initialCapital;
  let shares = 0;
  const trades = [];
  const equity = [];

  prices.forEach((price, index) => {
    const signalBuy = shortMa[index] && longMa[index] && shortMa[index] > longMa[index];
    const signalSell = shortMa[index] && longMa[index] && shortMa[index] < longMa[index];

    if (signalBuy && cash >= price) {
      shares = Math.floor(cash / price);
      cash -= shares * price;
      trades.push(`第 ${index + 1} 天买入 ${shares} 股，价格 ${price.toFixed(2)}`);
    } else if (signalSell && shares > 0) {
      cash += shares * price;
      trades.push(`第 ${index + 1} 天卖出 ${shares} 股，价格 ${price.toFixed(2)}`);
      shares = 0;
    }

    equity.push(cash + shares * price);
  });

  const finalValue = equity[equity.length - 1];
  return {
    finalValue,
    returnPct: ((finalValue - initialCapital) / initialCapital) * 100,
    trades,
    equity,
  };
}

function renderResults(result, initialCapital) {
  summary.innerHTML = `
    <div class="summary-grid">
      <div><strong>期末资产</strong><span>$${result.finalValue.toFixed(2)}</span></div>
      <div><strong>总收益率</strong><span>${result.returnPct.toFixed(2)}%</span></div>
      <div><strong>初始资金</strong><span>$${initialCapital.toFixed(2)}</span></div>
    </div>
  `;
  equityCurve.innerHTML = `
    <div class="equity-bars">
      ${result.equity.map((value) => `<span style="height:${Math.max(20, value / 500)}px"></span>`).join("")}
    </div>
  `;
  tradeLog.innerHTML = `
    <h3>交易记录</h3>
    <ul>${result.trades.map((trade) => `<li>${trade}</li>`).join("") || "<li>没有触发交易</li>"}</ul>
  `;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const symbol = symbolSelect.value;
  const initialCapital = Number(document.querySelector("#initial-capital").value);
  const strategy = document.querySelector("#strategy-select").value;
  const result = runBacktest(stockData[symbol].closes, initialCapital, strategy);
  renderResults(result, initialCapital);
});
```

- [ ] **Step 2: Add result styles**

```css
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.summary-grid div {
  background: #f7f9fc;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  display: grid;
  gap: 6px;
}

.summary-grid span {
  font-size: 1.25rem;
  font-weight: 800;
}

.equity-bars {
  height: 220px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  align-items: end;
  gap: 8px;
}

.equity-bars span {
  display: block;
  background: linear-gradient(180deg, #6d8efb, #2f6fed);
  border-radius: 8px 8px 2px 2px;
}

#trade-log ul {
  margin: 12px 0 0;
  padding-left: 20px;
}
```

- [ ] **Step 3: Run the simulator**

Run: open `index.html`, choose a stock, set capital, and click the simulate button
Expected: summary cards, an equity curve, and trade records appear on the page.

### Task 4: Verify the page in a browser and prepare commit

**Files:**
- Modify if needed: `index.html`, `styles.css`, `app.js`

- [ ] **Step 1: Open the page in a browser and inspect layout**

Run: open `index.html`
Expected: no overlapping sections, readable text, and the full flow works on a narrow window too.

- [ ] **Step 2: Fix any rendering or interaction issues**

Run: repeat the same browser check after each change
Expected: the page stays usable and the simulator still runs.

- [ ] **Step 3: Commit the finished work**

```bash
git add index.html styles.css app.js quant.mjs tests/quant.test.mjs favicon.svg docs/superpowers/plans/2026-06-18-stock-quant-web.md
git commit -m "feat: build stock quant simulation page"
```
