import test from "node:test";
import assert from "node:assert/strict";
import { movingAverage, runBacktest } from "../quant.mjs";

test("movingAverage returns null before there is enough data", () => {
  assert.deepEqual(movingAverage([1, 2, 3, 4], 3), [null, null, 2, 3]);
});

test("runBacktest buy and hold uses all available cash", () => {
  const result = runBacktest([100, 120], 1000, "buy-and-hold");
  assert.equal(result.finalValue, 1200);
  assert.equal(result.returnPct, 20);
  assert.deepEqual(result.trades, ["买入 10 股，持有到最后一天"]);
});

test("runBacktest moving average strategy records buy signals", () => {
  const result = runBacktest([10, 10, 11, 12, 13, 14], 1000, "ma-cross");
  assert.equal(result.trades.length, 1);
  assert.match(result.trades[0], /买入/);
  assert.equal(result.equity.length, 6);
  assert.ok(result.finalValue > 1000);
});

test("runBacktest rejects invalid capital", () => {
  assert.throws(() => runBacktest([100, 120], 0, "buy-and-hold"), /初始资金/);
});
