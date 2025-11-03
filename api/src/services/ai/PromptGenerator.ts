import { CombinedMarketData } from "./trading/models/MarketData";
import { AgentBalance } from "@/shared/types";
import { AITradingConfig } from "@/core/types/AITradingConfig";

export class PromptGenerator {
  public static generateTradingPrompt(
    config: AITradingConfig,
    marketData: CombinedMarketData[],
    balanceInfo: AgentBalance,
    currentPositions?: any[],
    recentDecisions?: Map<string, any[]>
  ): string {
    const indicators = Object.keys(config.indicatorIntervals);
    const allIntervals = new Set<string>();
    indicators.forEach((indicator) => {
      config.indicatorIntervals[indicator].forEach((interval) =>
        allIntervals.add(interval)
      );
    });

    const prompt = `# AI Trading Analysis Request

You are an expert cryptocurrency trader analyzing market data to generate trading signals.

## Trading Configuration
- Per-Indicator Timeframes:
${indicators
  .map(
    (indicator) =>
      `  • ${indicator.toUpperCase()}: ${config.indicatorIntervals[
        indicator
      ].join(", ")}`
  )
  .join("\n")}

## Per-Symbol Leverage Configuration
${this.formatSymbolLeverages(config.symbolLeverages, config.tradingPairs)}

## Account Balance
${this.formatBalance(balanceInfo, currentPositions)}

## Current Positions
${this.formatCurrentPositions(currentPositions, config.symbolLeverages)}

## AI Decision History (Your Previous Reasoning)
${this.formatDecisionHistory(
  recentDecisions,
  currentPositions,
  config.symbolLeverages
)}

## 🚨 CRITICAL TRADING CONSTRAINTS 🚨

### MINIMUM NOTIONAL VALUE REQUIREMENT
**EVERY ORDER MUST MEET: Notional Value ≥ $5.00**

Formula: **Notional = Quantity × Current Price** (leverage does NOT affect this!)

**CRITICAL: Notional value is calculated as quantity × price ONLY (leverage does NOT increase notional)**

Leverage affects MARGIN required, not notional value:
- Notional = quantity × price (must be ≥ $5)
- Margin = notional / leverage (what you need in your account)

Examples of MINIMUM quantities needed for $5 notional:
- BTCUSDT at $50,000: quantity ≥ 0.0001 (0.0001 × 50,000 = $5)
- ETHUSDT at $2,500: quantity ≥ 0.002 (0.002 × 2,500 = $5)
- SOLUSDT at $100: quantity ≥ 0.05 (0.05 × 100 = $5)
- ASTERUSDT at $1: quantity ≥ 5.0 (5.0 × 1 = $5)

**CRITICAL: Your balance must cover the MARGIN, not the notional!**
- Margin needed = $5 notional / SYMBOL_LEVERAGE
- Example: BTCUSDT at 10x requires only $0.50 margin ($5 ÷ 10) for minimum $5 notional trade
- With $4 balance, you CAN trade all symbols since max margin needed is $1.00 (at 5x leverage)

### Balance Management Rules
- NEVER exceed available balance
- Account for margin requirements: (Quantity × Price) / Symbol_Leverage
- Reserve funds for existing positions
- Each new position requires: Position Value / Symbol_Leverage in available balance

## Market Data Analysis
${this.formatMarketDataForPrompt(marketData)}

## Trading Rules
${this.generateTradingRules(config)}

## IMPORTANT CONSTRAINTS
- Generate signals ONLY for these symbols: ${config.tradingPairs.join(", ")}
- Maximum 1 signal per symbol
- Do not include any symbols not in the trading pairs list above
- **USE CORRECT LEVERAGE FOR EACH SYMBOL** (see leverage table above)
- **Notional requirement**: quantity × price ≥ $5.00 (leverage does NOT affect notional)
- **Margin check**: (quantity × price) / SYMBOL_LEVERAGE ≤ available balance

## Output Format
Provide your analysis in CSV format with exactly these columns:
symbol,action,quantity,confidence,reasoning

Requirements:
- symbol: Must be one of ${config.tradingPairs.join(", ")}
- action: BUY, SELL, HOLD, WAIT, or CLOSE only
  - **BUY**: Open new long (no position)
  - **SELL**: Open new short (no position)
  - **HOLD**: Keep existing position (has long/short)
  - **WAIT**: No position → monitor, no action
  - **CLOSE**: Exit current position fully
- quantity: 
  - BUY/SELL: >0, meets $5 notional with symbol leverage
  - HOLD/WAIT/CLOSE: 0 (system uses current position)
- confidence: integer 0-100
  - Only >= ${config.minConfidenceThreshold} will execute
  - < threshold → must use WAIT (or HOLD if currently holding position with low confidence)
- reasoning: DETAILED technical
  - **WHY**: Specific indicators + values + signals
  - **WHAT**: Current price, support/resistance, trend
  - **HOW confident**: Volume, momentum, risk of reversal
  - **CRITICAL FOR POSITIONS**: Always reference ACTUAL ROI% (shown in Current Positions), not just price change%
  - **LEVERAGE IMPACT**: With leverage, small price moves = large ROI impact (-5% price = -30% ROI at 6x leverage)
  - Example (NEW POSITION): "RSI(32) exiting oversold, MACD bullish crossover at 15:10, volume +42% on breakout above $27.5k resistance, strong bid depth — high conviction long setup"
  - Example (EXISTING POSITION): "Position ROI -33.5% despite only -5.5% price move due to 6x leverage. RSI(11.5) extreme oversold with weakening volume 83K declining — technical deterioration continuing, considering CLOSE"
- Generate exactly 1 signal per symbol in trading pairs list

${this.generateExamples(config.tradingPairs, config.symbolLeverages)}

⚠️ **VALIDATE EVERY QUANTITY:**
For each BUY/SELL signal, ensure:
1. **Notional check**: quantity × current_price ≥ $5.00 (must always meet this minimum)
2. **Margin check**: (quantity × current_price) / SYMBOL_LEVERAGE ≤ available balance
(Use the correct leverage for each symbol from the table above!)

Analyze ONLY the symbols in the trading pairs list: ${config.tradingPairs.join(
      ", "
    )}.`;

    return prompt;
  }
  public static generateMarketContextPrompt(
    data: CombinedMarketData[]
  ): string {
    const totalSymbols = data.length;
    const avgVolatility =
      data.reduce((sum, d) => sum + (d.marketData.volatility || 0), 0) /
      totalSymbols;
    const bullishCount = data.filter(
      (d) => d.marketData.priceChangePercent24h > 0
    ).length;
    const bearishCount = totalSymbols - bullishCount;

    return `
## Market Overview
- Total symbols analyzed: ${totalSymbols}
- Average volatility: ${avgVolatility.toFixed(2)}%
- Bullish symbols: ${bullishCount} (${(
      (bullishCount / totalSymbols) *
      100
    ).toFixed(1)}%)
- Bearish symbols: ${bearishCount} (${(
      (bearishCount / totalSymbols) *
      100
    ).toFixed(1)}%)
- Market sentiment: ${
      bullishCount > bearishCount
        ? "BULLISH"
        : bearishCount > bullishCount
        ? "BEARISH"
        : "NEUTRAL"
    }
    `.trim();
  }
  private static formatSymbolLeverages(
    symbolLeverages: { [symbol: string]: number },
    tradingPairs: string[]
  ): string {
    const lines = tradingPairs.map((symbol) => {
      const leverage = symbolLeverages[symbol] || 1; // Default to 1x if not configured
      return `- ${symbol}: **${leverage}x** leverage`;
    });

    return lines.join("\n");
  }

  private static generateExamples(
    tradingPairs: string[],
    symbolLeverages?: { [symbol: string]: number }
  ): string {
    const exampleSymbols = tradingPairs.slice(
      0,
      Math.min(5, tradingPairs.length)
    );

    if (exampleSymbols.length === 0) {
      return "Example:\nSYMBOLUSDT,WAIT,0,0,No trading pairs configured";
    }

    const examples: string[] = [];

    // Example 1 - BUY (notional = qty × price, NO leverage!)
    if (exampleSymbols[0]) {
      const symbol = exampleSymbols[0];
      const price = symbol.includes("BTC")
        ? 50000
        : symbol.includes("ETH")
        ? 2500
        : 100;
      const qty = symbol.includes("BTC")
        ? 0.001
        : symbol.includes("ETH")
        ? 0.01
        : 0.05;
      const notional = (qty * price).toFixed(2);
      const leverage = symbolLeverages?.[symbol] || 1;
      const margin = ((qty * price) / leverage).toFixed(2);
      examples.push(
        `${symbol},BUY,${qty},85,Strong bullish momentum. Notional: ${qty}×${price}=$${notional}, Margin @ ${leverage}x: $${notional}/${leverage}=$${margin}`
      );
    }

    // Example 2 - SELL (notional = qty × price, NO leverage!)
    if (exampleSymbols[1]) {
      const symbol = exampleSymbols[1];
      const price = symbol.includes("BTC")
        ? 50000
        : symbol.includes("ETH")
        ? 2500
        : 100;
      const qty = symbol.includes("BTC")
        ? 0.001
        : symbol.includes("ETH")
        ? 0.01
        : 0.05;
      const notional = (qty * price).toFixed(2);
      const leverage = symbolLeverages?.[symbol] || 1;
      const margin = ((qty * price) / leverage).toFixed(2);
      examples.push(
        `${symbol},SELL,${qty},72,Bearish breakout. Notional: ${qty}×${price}=$${notional}, Margin @ ${leverage}x: $${notional}/${leverage}=$${margin}`
      );
    }

    // Example 3 - HOLD (specific, contextual reasoning)
    if (exampleSymbols[2]) {
      const symbol = exampleSymbols[2];
      examples.push(
        `${symbol},HOLD,0,68,Position +1.2% from entry but below profit target, MACD still bullish at 15.3, holding for $52k resistance test`
      );
    }

    // Example 4 - WAIT (specific, contextual reasoning)
    if (exampleSymbols[3]) {
      const symbol = exampleSymbols[3];
      examples.push(
        `${symbol},WAIT,0,45,Consolidating after initial entry signal faded, RSI neutral at 52 (was 38), waiting for clear directional break above $2,600 or below $2,450`
      );
    }

    // Example 5 - CLOSE
    if (exampleSymbols[4]) {
      const symbol = exampleSymbols[4];
      examples.push(
        `${symbol},CLOSE,0,70,Exit signal triggered, closing existing position`
      );
    }

    return "Example:\n" + examples.join("\n");
  }

  private static formatBalance(
    balanceInfo: AgentBalance,
    currentPositions?: any[]
  ): string {
    const marginUtilization =
      balanceInfo.total > 0
        ? (balanceInfo.usedMargin / balanceInfo.total) * 100
        : 0;

    return `
**Total Portfolio:** $${balanceInfo.total.toFixed(2)}
**Available for Trading:** $${balanceInfo.available.toFixed(2)} (${(
      100 - marginUtilization
    ).toFixed(1)}% free)
**Used in Positions:** $${balanceInfo.usedMargin.toFixed(
      2
    )} (${marginUtilization.toFixed(1)}% utilized)

⚠️ **AVAILABLE MARGIN FOR NEW POSITIONS:** $${balanceInfo.available.toFixed(2)}
With leverage, you can open $5+ notional positions! Example: $5 notional at 10x = $0.50 margin needed
Formula: Margin Needed = (Quantity × Price) / Symbol_Leverage
`.trim();
  }

  private static formatCurrentPositions(
    positions?: any[],
    symbolLeverages?: { [symbol: string]: number }
  ): string {
    if (!positions || positions.length === 0) {
      return `No current positions - all balance is available for trading

⚠️ **CRITICAL**: Since there are NO POSITIONS, you must use WAIT for all symbols (NEVER use HOLD when no position exists)`;
    }

    let totalExposure = 0;
    let totalMarginUsed = 0;
    let totalPnl = 0;
    let winners = 0;
    let losers = 0;

    const positionLines = [
      `=== CURRENT POSITIONS (${positions.length} active) ===\n`,
    ];

    positions.forEach((pos, index) => {
      const exposure = pos.size * pos.entryPrice;
      const leverage = symbolLeverages?.[pos.symbol] || pos.leverage || 1;

      // Use API's isolatedMargin for accurate ROI calculation (matches Aster UI)
      // Fallback to calculated margin only if API doesn't provide it
      const marginUsed = pos.isolatedMargin || exposure / leverage;

      // Calculate price movement percentage
      const priceMove =
        ((pos.markPrice - pos.entryPrice) / pos.entryPrice) * 100;
      const priceMoveSign = priceMove >= 0 ? "+" : "";

      // Calculate ROI percentage using actual margin (this matches Aster UI's calculation)
      const roi = (pos.unrealizedPnl / marginUsed) * 100;
      const roiSign = roi >= 0 ? "+" : "";

      // Calculate position age
      const ageMs = Date.now() - pos.updateTime;
      const ageSec = Math.floor(ageMs / 1000);
      const ageMin = Math.floor(ageSec / 60);
      const ageSec2 = ageSec % 60;
      const ageStr = ageMin > 0 ? `${ageMin}m ${ageSec2}s` : `${ageSec}s`;

      // Track totals
      totalExposure += exposure;
      totalMarginUsed += marginUsed;
      totalPnl += pos.unrealizedPnl;
      if (pos.unrealizedPnl >= 0) winners++;
      else losers++;

      positionLines.push(
        `[${index + 1}] ${pos.symbol} ${pos.side} | ${leverage}x leverage`,
        `    Entry: $${pos.entryPrice.toFixed(
          4
        )} → Mark: $${pos.markPrice.toFixed(
          4
        )} [${priceMoveSign}${priceMove.toFixed(2)}% price move]`,
        `    Size: ${pos.size} | Exposure: $${exposure.toFixed(
          2
        )} | Margin: $${marginUsed.toFixed(2)}`,
        `    P&L: ${roiSign}$${pos.unrealizedPnl.toFixed(
          4
        )} [${roiSign}${roi.toFixed(2)}% ROI] | Age: ${ageStr}\n`
      );
    });

    // Portfolio summary
    const netRoi = (totalPnl / totalMarginUsed) * 100;
    const netRoiSign = netRoi >= 0 ? "+" : "";

    positionLines.push(
      `PORTFOLIO SUMMARY:`,
      `Total Positions: ${
        positions.length
      } | Exposure: $${totalExposure.toFixed(
        2
      )} | Margin Used: $${totalMarginUsed.toFixed(2)}`,
      `Net P&L: ${netRoiSign}$${totalPnl.toFixed(
        4
      )} [${netRoiSign}${netRoi.toFixed(2)}% ROI]`,
      `Winners: ${winners} | Losers: ${losers}`
    );

    return positionLines.join("\n");
  }

  private static formatMarketDataForPrompt(data: CombinedMarketData[]): string {
    const sections: string[] = [];

    for (const symbolData of data) {
      const { symbol, marketData, indicators } = symbolData;

      sections.push(`### ${symbol}`);
      sections.push(
        `Price: $${marketData.price.toFixed(4)} (${
          marketData.priceChangePercent24h >= 0 ? "+" : ""
        }${marketData.priceChangePercent24h.toFixed(2)}%)`
      );
      sections.push(
        `Volume: ${marketData.volume24h.toLocaleString()} | Volatility: ${marketData.volatility?.toFixed(
          2
        )}%`
      );
      sections.push(
        `Range: $${marketData.low24h.toFixed(
          4
        )} - $${marketData.high24h.toFixed(4)}`
      );

      if (indicators.length > 0) {
        sections.push("Technical Indicators:");
        for (const indicator of indicators) {
          const interval = indicator.intervals[0];
          const name = indicator.indicator;

          let valueStr = "";
          const value = indicator.value;

          if (typeof value === "number") {
            valueStr = String(value);
          } else if (typeof value === "object" && value !== null) {
            const parts: string[] = [];
            for (const [key, val] of Object.entries(value)) {
              parts.push(`${key}: ${val}`);
            }
            valueStr = parts.join(", ");
          } else {
            valueStr = String(value);
          }

          sections.push(`  ${name} (${interval}): ${valueStr}`);
        }
      }
    }

    return sections.join("\n");
  }

  private static formatDecisionHistory(
    decisions?: Map<string, any[]>,
    currentPositions?: any[],
    symbolLeverages?: { [symbol: string]: number }
  ): string {
    if (!decisions || decisions.size === 0) {
      return "No previous decisions - this is your first analysis for these positions";
    }

    const lines: string[] = [];

    // Create a map of current positions by symbol for quick lookup
    const positionMap = new Map<string, any>();
    if (currentPositions) {
      currentPositions.forEach((pos) => positionMap.set(pos.symbol, pos));
    }

    for (const [symbol, symbolDecisions] of decisions.entries()) {
      lines.push(`\n**${symbol} Decision History:**`);

      // Get current position for this symbol to show ROI evolution
      const currentPos = positionMap.get(symbol);
      let currentRoi: number | null = null;

      if (currentPos) {
        const exposure = currentPos.size * currentPos.entryPrice;
        const leverage =
          symbolLeverages?.[currentPos.symbol] || currentPos.leverage || 1;
        const marginUsed = currentPos.isolatedMargin || exposure / leverage;
        currentRoi = (currentPos.unrealizedPnl / marginUsed) * 100;
      }

      symbolDecisions.forEach((decision, idx) => {
        const time = new Date(decision.timestamp).toLocaleTimeString();
        const label =
          idx === 0 ? "[INITIAL]" : `[${symbolDecisions.length - idx} ago]`;

        // Format the decision line with action and confidence
        let decisionLine = `${label} ${time} - ${decision.decisionAction.toUpperCase()} (${
          decision.decisionConfidence
        }%)`;

        // Add ROI context for positions (not for WAIT actions)
        if (
          currentRoi !== null &&
          decision.decisionAction !== "wait" &&
          idx > 0
        ) {
          // Show that this was a historical decision when position ROI was different
          decisionLine += ` | Position had deteriorated from entry`;
        } else if (idx === 0 && decision.decisionAction !== "wait") {
          // Initial entry decision
          decisionLine += ` | Entry decision`;
        }

        lines.push(decisionLine, `  "${decision.decisionReasoning}"`);
      });

      // Show current ROI after decision history for context
      if (currentRoi !== null) {
        const roiSign = currentRoi >= 0 ? "+" : "";
        const roiTrend =
          currentRoi < -20
            ? "⚠️ SEVERE LOSS"
            : currentRoi < -10
            ? "📉 Significant loss"
            : currentRoi < 0
            ? "📊 Minor loss"
            : currentRoi > 20
            ? "🚀 Strong profit"
            : currentRoi > 10
            ? "📈 Good profit"
            : "📊 Small profit";

        lines.push(
          `[CURRENT] Position ROI: ${roiSign}${currentRoi.toFixed(
            2
          )}% ${roiTrend}`
        );
      }
    }

    lines.push(
      `\n⚠️ **Use this context to provide BETTER, MORE SPECIFIC reasoning for HOLD/WAIT:**`
    );
    lines.push(
      `- **CRITICAL**: Reference ACTUAL ROI% (account impact with leverage), not just price change%`
    );
    lines.push(
      `- For leveraged positions: a -5% price move can mean -30% to -40% ROI - this is SEVERE!`
    );
    lines.push(`- Explain what's different from previous decision`);
    lines.push(`- Mention new technical signals or changes in indicators`);
    lines.push(
      `- For HOLD: explain why you're still holding despite ROI deterioration (or improvement)`
    );
    lines.push(
      `- For WAIT: explain what you're waiting for that's different from before`
    );
    lines.push(
      `- Provide UNIQUE reasoning each time - don't repeat generic statements!`
    );
    lines.push(
      `- **Consider closing positions with ROI < -20% unless strong recovery signals present**`
    );

    return lines.join("\n");
  }

  private static generateTradingRules(config: AITradingConfig): string {
    const rules: string[] = [];

    // CRITICAL RULE - Always first
    rules.push(
      "🚨 **MANDATORY:** Every BUY/SELL order must have notional ≥ $5.00 (quantity × price ≥ 5)"
    );
    rules.push(
      "🚨 **MANDATORY:** Notional does NOT include leverage. Formula: notional = quantity × price"
    );
    rules.push(
      "🚨 **MANDATORY:** Calculate margin needed: (quantity × price) / SYMBOL_LEVERAGE"
    );
    rules.push(
      "🚨 **MANDATORY:** Never exceed available balance (check margin, not notional)"
    );

    // Risk-based rules
    switch (config.riskTolerance) {
      case "conservative":
        rules.push(
          "- Prefer high-confidence signals (80%+) with strong technical confirmation"
        );
        rules.push("- Avoid trading during high volatility periods");
        rules.push(
          "- Use smaller position sizes (but still ≥ $5 notional) and maintain tight risk management"
        );
        break;
      case "moderate":
        rules.push(
          "- Balance risk and reward with medium-confidence signals (60%+)"
        );
        rules.push("- Consider both technical and volume indicators");
        rules.push(
          "- Use standard position sizing with reasonable stop-losses"
        );
        break;
      case "aggressive":
        rules.push(
          "- Accept higher-risk opportunities with lower confidence (40%+)"
        );
        rules.push("- React quickly to momentum and breakout patterns");
        rules.push(
          "- Use larger position sizes but maintain overall portfolio risk"
        );
        break;
    }

    // Per-symbol leverage rules
    rules.push("- Each symbol has different leverage - check the table above!");
    rules.push("- Margin calculation: (quantity × price) / SYMBOL_LEVERAGE");
    rules.push(
      "- Minimum quantity for $5 notional: 5 / price (leverage does NOT affect notional)"
    );
    rules.push("- Margin needed: (quantity × price) / SYMBOL_LEVERAGE");
    rules.push("- Higher leverage = less margin but more risk");

    // General rules
    rules.push("- Never exceed maximum position size limits");
    rules.push("- Consider current positions when suggesting new trades");
    rules.push("- Provide clear reasoning for each trading decision");
    rules.push(
      "- Use HOLD when: (1) market conditions unclear, (2) insufficient margin after calculating (notional/leverage), or (3) risk too high"
    );

    return rules.join("\n");
  }
}
