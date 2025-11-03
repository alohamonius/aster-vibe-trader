import {
  CombinedMarketData,
  MarketData,
  TechnicalIndicator,
} from "./trading/models/MarketData";
import { MarketDataProvider } from "./trading/providers/MarketDataProvider";
import { SymbolConverter } from "./utils/SymbolConverter";
import { logger } from "@/shared/utils/logger";

export interface DataCollectionConfig {
  symbols: string[];
  indicatorIntervals: Record<string, string[]>; // Per-indicator intervals (e.g., { rsi: ["1h"], macd: ["4h"] })
  includeOrderBook?: boolean;
}

export class DataCollectionService {
  private marketDataProvider: MarketDataProvider;

  constructor() {
    this.marketDataProvider = MarketDataProvider.getInstance();
  }

  public async collectMarketData(
    config: DataCollectionConfig
  ): Promise<CombinedMarketData[]> {
    const startTime = Date.now();

    try {
      const results: CombinedMarketData[] = [];

      // Process each symbol
      for (const symbol of config.symbols) {
        try {
          const combinedData = await this.collectSymbolData(symbol, config);
          results.push(combinedData);
        } catch (error) {
          logger.error(`Failed to collect data for ${symbol}:`, error);
          // Continue with other symbols even if one fails
        }
      }

      const endTime = Date.now();
      logger.info(
        `Market data collection completed in ${endTime - startTime}ms`,
        {
          symbolsProcessed: results.length,
          totalSymbols: config.symbols.length,
        }
      );

      return results;
    } catch (error) {
      logger.error("Error in market data collection:", error);
      throw error;
    }
  }

  private async collectSymbolData(
    symbol: string,
    config: DataCollectionConfig
  ): Promise<CombinedMarketData> {
    const timestamp = Date.now();

    const marketData = await this.marketDataProvider.getMarketData(symbol);

    let orderBook;
    if (config.includeOrderBook) {
      try {
        orderBook = await this.marketDataProvider.getOrderBookData(symbol, 10);
      } catch (error) {
        logger.warn(`Failed to collect order book for ${symbol}:`, error);
      }
    }

    return {
      symbol,
      timestamp,
      marketData,
      indicators: [],
      orderBook,
    };
  }

  public async collectSingleSymbolData(
    symbol: string,
    indicatorIntervals: Record<string, string[]> = {
      RSI: ["1h"],
      MACD: ["1h"],
      EMA: ["1h"],
    }
  ): Promise<CombinedMarketData> {
    const config: DataCollectionConfig = {
      symbols: [symbol],
      indicatorIntervals,
      includeOrderBook: false,
    };

    const results = await this.collectMarketData(config);
    return results[0];
  }

  public formatDataForAI(data: CombinedMarketData[]): string {
    const lines: string[] = [];
    lines.push("# Market Analysis Data");
    lines.push("");

    for (const symbolData of data) {
      const { symbol, marketData, indicators } = symbolData;

      lines.push(`## ${symbol}`);
      lines.push(`Price: $${marketData.price.toFixed(4)}`);
      lines.push(`24h Change: ${marketData.priceChangePercent24h.toFixed(2)}%`);
      lines.push(`Volume: ${marketData.volume24h.toLocaleString()}`);
      lines.push(`Volatility: ${marketData.volatility?.toFixed(2)}%`);
      lines.push("");

      // Group indicators by type
      const indicatorGroups = this.groupIndicatorsByType(indicators);

      for (const [indicatorType, indicatorList] of Object.entries(
        indicatorGroups
      )) {
        lines.push(`### ${indicatorType}`);
        for (const indicator of indicatorList) {
          const value = Array.isArray(indicator.value)
            ? indicator.value.map((v) => v.toFixed(4)).join(", ")
            : indicator.value.toFixed(4);
          lines.push(`${indicator.intervals.join(",")}: ${value}`);
        }
        lines.push("");
      }
    }

    return lines.join("\n");
  }

  private groupIndicatorsByType(
    indicators: TechnicalIndicator[]
  ): Record<string, TechnicalIndicator[]> {
    const groups: Record<string, TechnicalIndicator[]> = {};

    for (const indicator of indicators) {
      if (!groups[indicator.indicator]) {
        groups[indicator.indicator] = [];
      }
      groups[indicator.indicator].push(indicator);
    }

    return groups;
  }

  public validateConfig(config: DataCollectionConfig): string[] {
    const errors: string[] = [];

    if (!config.symbols || config.symbols.length === 0) {
      errors.push("At least one symbol is required");
    }

    // Validate symbol format (should be like BTCUSDT)
    const validSymbols = config.symbols?.filter((symbol) =>
      /^[A-Z]+USDT?$/.test(symbol)
    );

    if (validSymbols && validSymbols.length !== config.symbols.length) {
      errors.push("Some symbols have invalid format (should be like BTCUSDT)");
    }

    // Validate indicatorIntervals
    if (config.indicatorIntervals) {
      const indicators = Object.keys(config.indicatorIntervals);

      // Check if any indicator has no intervals
      const indicatorsWithoutIntervals = indicators.filter((indicator) => {
        const intervals = config.indicatorIntervals[indicator] || [];
        return intervals.length === 0;
      });

      if (indicatorsWithoutIntervals.length > 0) {
        errors.push(
          `Indicators missing intervals: ${indicatorsWithoutIntervals.join(
            ", "
          )}`
        );
      }

      // Validate interval values
      const validIntervals = ["1m", "5m", "15m", "1h", "4h", "1d"];
      const allIntervals = new Set<string>();
      indicators.forEach((indicator) => {
        config.indicatorIntervals[indicator].forEach((interval) =>
          allIntervals.add(interval)
        );
      });

      const invalidIntervals = Array.from(allIntervals).filter(
        (interval) => !validIntervals.includes(interval)
      );

      if (invalidIntervals.length > 0) {
        errors.push(`Invalid intervals: ${invalidIntervals.join(", ")}`);
      }
    }

    return errors;
  }
}
