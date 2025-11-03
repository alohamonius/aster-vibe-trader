import { logger } from './logger';

export interface SymbolInfo {
  symbol: string;
  quantityPrecision: number;
  pricePrecision: number;
  minQty: number;
  maxQty: number;
  stepSize: number;
  minNotional: number;
  tickSize: number;
}

export class SymbolPrecisionManager {
  private static instance: SymbolPrecisionManager;
  private symbolCache: Map<string, SymbolInfo> = new Map();
  private lastUpdate: number = 0;
  private cacheValidityMs: number = 60 * 60 * 1000; // 1 hour

  private constructor() {}

  public static getInstance(): SymbolPrecisionManager {
    if (!SymbolPrecisionManager.instance) {
      SymbolPrecisionManager.instance = new SymbolPrecisionManager();
    }
    return SymbolPrecisionManager.instance;
  }

  public async loadExchangeInfo(exchangeInfoData: any): Promise<void> {
    try {
      logger.info('Loading symbol precision data from exchange info...');

      if (!exchangeInfoData.symbols || !Array.isArray(exchangeInfoData.symbols)) {
        throw new Error('Invalid exchange info format - missing symbols array');
      }

      let loadedCount = 0;

      for (const symbolData of exchangeInfoData.symbols) {
        try {
          const symbolInfo = this.parseSymbolData(symbolData);
          this.symbolCache.set(symbolInfo.symbol, symbolInfo);
          loadedCount++;
        } catch (error) {
          logger.warn(`Failed to parse symbol data for ${symbolData.symbol}:`, error);
        }
      }

      this.lastUpdate = Date.now();
      logger.info(`Loaded precision data for ${loadedCount} symbols`);

    } catch (error) {
      logger.error('Failed to load exchange info:', error);
      throw error;
    }
  }

  private parseSymbolData(symbolData: any): SymbolInfo {
    // Parse filters to extract precision and limits
    let quantityPrecision = 3; // Default fallback
    let pricePrecision = 4; // Default fallback
    let minQty = 0.001; // Default fallback
    let maxQty = 1000000; // Default fallback
    let stepSize = 0.001; // Default fallback
    let minNotional = 5.0; // Default fallback
    let tickSize = 0.0001; // Default fallback

    if (symbolData.filters && Array.isArray(symbolData.filters)) {
      for (const filter of symbolData.filters) {
        switch (filter.filterType) {
          case 'LOT_SIZE':
            minQty = parseFloat(filter.minQty || '0.001');
            maxQty = parseFloat(filter.maxQty || '1000000');
            stepSize = parseFloat(filter.stepSize || '0.001');
            // Calculate precision from stepSize
            quantityPrecision = this.calculatePrecision(stepSize);
            break;

          case 'PRICE_FILTER':
            tickSize = parseFloat(filter.tickSize || '0.0001');
            // Calculate precision from tickSize
            pricePrecision = this.calculatePrecision(tickSize);
            break;

          case 'MIN_NOTIONAL':
            minNotional = parseFloat(filter.notional || filter.minNotional || '5.0');
            break;
        }
      }
    }

    // Fallback to direct precision fields if available
    if (symbolData.quantityPrecision !== undefined) {
      quantityPrecision = parseInt(symbolData.quantityPrecision);
    }
    if (symbolData.pricePrecision !== undefined) {
      pricePrecision = parseInt(symbolData.pricePrecision);
    }

    return {
      symbol: symbolData.symbol,
      quantityPrecision,
      pricePrecision,
      minQty,
      maxQty,
      stepSize,
      minNotional,
      tickSize
    };
  }

  private calculatePrecision(stepSize: number): number {
    if (stepSize >= 1) return 0;

    const stepStr = stepSize.toString();
    if (stepStr.includes('e-')) {
      // Handle scientific notation like 1e-8
      const exponent = parseInt(stepStr.split('e-')[1]);
      return exponent;
    }

    if (stepStr.includes('.')) {
      // Count decimal places
      return stepStr.split('.')[1].length;
    }

    return 0;
  }

  public getSymbolInfo(symbol: string): SymbolInfo | null {
    return this.symbolCache.get(symbol) || null;
  }

  public formatQuantity(quantity: number, symbol: string): string {
    const symbolInfo = this.getSymbolInfo(symbol);
    if (!symbolInfo) {
      logger.warn(`No precision data for ${symbol}, using default 3 decimals`);
      return quantity.toFixed(3);
    }

    // Round to step size to ensure compliance
    const rounded = Math.round(quantity / symbolInfo.stepSize) * symbolInfo.stepSize;
    return rounded.toFixed(symbolInfo.quantityPrecision);
  }

  public formatPrice(price: number, symbol: string): string {
    const symbolInfo = this.getSymbolInfo(symbol);
    if (!symbolInfo) {
      logger.warn(`No precision data for ${symbol}, using default 4 decimals`);
      return price.toFixed(4);
    }

    // Round to tick size to ensure compliance
    const rounded = Math.round(price / symbolInfo.tickSize) * symbolInfo.tickSize;
    return rounded.toFixed(symbolInfo.pricePrecision);
  }

  public validateQuantity(quantity: number, symbol: string): { valid: boolean; reason?: string; adjustedQuantity?: number } {
    const symbolInfo = this.getSymbolInfo(symbol);
    if (!symbolInfo) {
      return { valid: true }; // No validation data available
    }

    if (quantity < symbolInfo.minQty) {
      return {
        valid: false,
        reason: `Quantity ${quantity} below minimum ${symbolInfo.minQty}`,
        adjustedQuantity: symbolInfo.minQty
      };
    }

    if (quantity > symbolInfo.maxQty) {
      return {
        valid: false,
        reason: `Quantity ${quantity} above maximum ${symbolInfo.maxQty}`,
        adjustedQuantity: symbolInfo.maxQty
      };
    }

    // Check if quantity is multiple of step size
    const remainder = quantity % symbolInfo.stepSize;
    if (remainder > 0.0000001) { // Allow for floating point precision
      const adjustedQuantity = Math.round(quantity / symbolInfo.stepSize) * symbolInfo.stepSize;
      return {
        valid: false,
        reason: `Quantity must be multiple of step size ${symbolInfo.stepSize}`,
        adjustedQuantity
      };
    }

    return { valid: true };
  }

  public validateNotional(quantity: number, price: number, symbol: string): { valid: boolean; reason?: string } {
    const symbolInfo = this.getSymbolInfo(symbol);
    if (!symbolInfo) {
      return { valid: true }; // No validation data available
    }

    const notional = quantity * price;
    if (notional < symbolInfo.minNotional) {
      return {
        valid: false,
        reason: `Notional value ${notional.toFixed(2)} below minimum ${symbolInfo.minNotional}`
      };
    }

    return { valid: true };
  }

  public isDataStale(): boolean {
    return Date.now() - this.lastUpdate > this.cacheValidityMs;
  }

  public getLoadedSymbols(): string[] {
    return Array.from(this.symbolCache.keys());
  }

  public getCacheStatus(): { symbolCount: number; lastUpdate: number; isStale: boolean } {
    return {
      symbolCount: this.symbolCache.size,
      lastUpdate: this.lastUpdate,
      isStale: this.isDataStale()
    };
  }
}