import { runBacktest, stockData } from "./quant.mjs";

const symbolSelect = document.querySelector("#symbol-select");
const stockInfo = document.querySelector("#stock-info");
const miniChart = document.querySelector("#mini-chart");
const form = document.querySelector("#simulator-form");
const initialCapitalInput = document.querySelector("#initial-capital");
const strategySelect = document.querySelector("#strategy-select");
const summary = document.querySelector("#summary");
const equityCurve = document.querySelector("#equity-curve");
const tradeLog = document.querySelector("#trade-log");

function formatCurrency(value) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercent(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function renderStockList() {
  symbolSelect.innerHTML = Object.values(stockData)
    .map((stock) => `<option value="${stock.symbol}">${stock.symbol}</option>`)
    .join("");
}

function renderStockInfo(symbol) {
  const stock = stockData[symbol];
  const directionClass = stock.change >= 0 ? "up" : "down";

  stockInfo.innerHTML = `
    <div class="stock-card">
      <div>
        <h3>${stock.name} (${stock.symbol})</h3>
        <p class="muted">${stock.market} · ${stock.sector}</p>
        <p class="price">${formatCurrency(stock.price)}</p>
        <p class="${directionClass}">
          ${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}
          (${formatPercent(stock.changePct)})
        </p>
      </div>
      <span class="badge">风险：${stock.risk}</span>
    </div>
    <div class="meta-grid">
      <div><strong>成交量</strong><span>${stock.volume}</span></div>
      <div><strong>收盘点数</strong><span>${stock.closes.length}</span></div>
      <div><strong>备注</strong><span>${stock.note}</span></div>
    </div>
  `;
  renderBars(miniChart, stock.closes, "bar-chart");
}

function renderBars(target, values, className) {
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = Math.max(1, maxValue - minValue);

  target.innerHTML = `
    <div class="${className}" style="--bar-count: ${values.length}">
      ${values
        .map((value) => {
          const height = 28 + ((value - minValue) / range) * 150;
          return `<span title="${value.toFixed(2)}" style="height: ${height}px"></span>`;
        })
        .join("")}
    </div>
  `;
}

function renderEmptyResult() {
  summary.innerHTML = `
    <div>
      <strong>期末资产</strong>
      <span>等待模拟</span>
    </div>
    <div>
      <strong>总收益率</strong>
      <span>等待模拟</span>
    </div>
    <div>
      <strong>最大回撤</strong>
      <span>等待模拟</span>
    </div>
  `;
  equityCurve.innerHTML = '<p class="empty-state">点击“开始模拟”后，这里会显示收益曲线。</p>';
  tradeLog.innerHTML = "";
}

function renderResults(result, initialCapital) {
  const returnClass = result.returnPct >= 0 ? "up" : "down";

  summary.innerHTML = `
    <div><strong>期末资产</strong><span>${formatCurrency(result.finalValue)}</span></div>
    <div><strong>总收益率</strong><span class="${returnClass}">${formatPercent(result.returnPct)}</span></div>
    <div><strong>最大回撤</strong><span>${result.maxDrawdown.toFixed(2)}%</span></div>
  `;
  renderBars(equityCurve, result.equity, "bar-chart equity-chart");
  tradeLog.innerHTML = `
    <h3>交易记录</h3>
    <ul>
      <li>初始资金 ${formatCurrency(initialCapital)}</li>
      ${result.trades.map((trade) => `<li>${trade}</li>`).join("") || "<li>没有触发交易</li>"}
    </ul>
  `;
}

function handleSubmit(event) {
  event.preventDefault();
  const symbol = symbolSelect.value;
  const initialCapital = Number(initialCapitalInput.value);
  const strategy = strategySelect.value;
  const result = runBacktest(stockData[symbol].closes, initialCapital, strategy);

  renderResults(result, initialCapital);
}

renderStockList();
renderStockInfo("AAPL");
renderEmptyResult();

symbolSelect.addEventListener("change", (event) => {
  renderStockInfo(event.target.value);
  renderEmptyResult();
});

form.addEventListener("submit", handleSubmit);
