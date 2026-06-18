export const stockData = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    market: "NASDAQ",
    sector: "Consumer Technology",
    price: 214.35,
    change: 2.14,
    changePct: 1.01,
    volume: "58.2M",
    risk: "中等",
    note: "样例数据，用来演示页面和回测流程。",
    closes: [198, 201, 204, 206, 208, 210, 212, 214],
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft",
    market: "NASDAQ",
    sector: "Cloud Software",
    price: 441.18,
    change: -1.02,
    changePct: -0.23,
    volume: "24.7M",
    risk: "偏低",
    note: "走势较平滑，适合观察买入并持有策略。",
    closes: [425, 428, 432, 435, 438, 439, 442, 441],
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla",
    market: "NASDAQ",
    sector: "EV & Energy",
    price: 186.72,
    change: 4.56,
    changePct: 2.5,
    volume: "91.5M",
    risk: "偏高",
    note: "波动更明显，适合观察策略信号变化。",
    closes: [172, 175, 179, 181, 183, 184, 185, 187],
  },
};

export function movingAverage(values, windowSize) {
  return values.map((_, index) => {
    if (index < windowSize - 1) return null;
    const slice = values.slice(index - windowSize + 1, index + 1);
    const total = slice.reduce((sum, value) => sum + value, 0);
    return total / windowSize;
  });
}

export function runBacktest(prices, initialCapital, strategy) {
  if (!Array.isArray(prices) || prices.length < 2) {
    throw new Error("价格数据至少需要 2 个点");
  }

  if (!Number.isFinite(initialCapital) || initialCapital <= 0) {
    throw new Error("初始资金必须大于 0");
  }

  if (strategy === "buy-and-hold") {
    return runBuyAndHold(prices, initialCapital);
  }

  return runMovingAverageCross(prices, initialCapital);
}

function runBuyAndHold(prices, initialCapital) {
  const shares = Math.floor(initialCapital / prices[0]);
  const cash = initialCapital - shares * prices[0];
  const equity = prices.map((price) => cash + shares * price);
  const finalValue = equity[equity.length - 1];

  return {
    finalValue,
    returnPct: ((finalValue - initialCapital) / initialCapital) * 100,
    maxDrawdown: calculateMaxDrawdown(equity),
    trades: [`买入 ${shares} 股，持有到最后一天`],
    equity,
  };
}

function runMovingAverageCross(prices, initialCapital) {
  const shortMa = movingAverage(prices, 3);
  const longMa = movingAverage(prices, 5);
  let cash = initialCapital;
  let shares = 0;
  const trades = [];
  const equity = [];

  prices.forEach((price, index) => {
    const hasSignal = shortMa[index] !== null && longMa[index] !== null;
    const shouldBuy = hasSignal && shortMa[index] > longMa[index] && shares === 0;
    const shouldSell = hasSignal && shortMa[index] < longMa[index] && shares > 0;

    if (shouldBuy && cash >= price) {
      shares = Math.floor(cash / price);
      cash -= shares * price;
      trades.push(`第 ${index + 1} 天买入 ${shares} 股，价格 ${price.toFixed(2)}`);
    }

    if (shouldSell) {
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
    maxDrawdown: calculateMaxDrawdown(equity),
    trades,
    equity,
  };
}

function calculateMaxDrawdown(equity) {
  let peak = equity[0];
  let maxDrawdown = 0;

  equity.forEach((value) => {
    peak = Math.max(peak, value);
    const drawdown = peak === 0 ? 0 : ((peak - value) / peak) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  });

  return maxDrawdown;
}
