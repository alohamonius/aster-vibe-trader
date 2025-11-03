import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import { HttpsProxyAgent } from "https-proxy-agent";
import { ApiCredentials, ProxyConfig } from "@/shared/types";
import { logger } from "@/shared/utils/logger";
import { SymbolPrecisionManager } from "@/shared/utils/SymbolPrecisionManager";
import {
  AccountInfo,
  AsterBalanceV2,
  AsterFundingRate,
  AsterIncomeRecord,
  AsterPosition,
  OrderRequest,
  OrderResponse,
  PnLSummary,
} from "./types";

export class V1FuturesClient {
  private http: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private precisionManager: SymbolPrecisionManager;
  private agentName?: string;

  constructor(
    credentials: ApiCredentials,
    baseUrl: string = "https://fapi.asterdex.com",
    proxyConfig?: ProxyConfig,
    agentName?: string
  ) {
    if (!credentials.apiKey || !credentials.apiSecret) {
      throw new Error("API key and secret are required for V1 client");
    }

    this.apiKey = credentials.apiKey;
    this.apiSecret = credentials.apiSecret;
    this.baseUrl = baseUrl;
    this.agentName = agentName;
    this.precisionManager = SymbolPrecisionManager.getInstance();

    // Configure axios with optional proxy support
    const axiosConfig: any = {
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-MBX-APIKEY": this.apiKey,
      },
    };

    if (proxyConfig) {
      let proxyUrl: string;

      if (proxyConfig.username && proxyConfig.password) {
        const url = new URL(proxyConfig.url);
        proxyUrl = `${url.protocol}//${proxyConfig.username}:${proxyConfig.password}@${url.host}`;
        logger.info(
          `Configuring V1FuturesClient with proxy: ${proxyConfig.url} (with auth)`
        );
      } else {
        proxyUrl = proxyConfig.url;
        logger.info(
          `Configuring V1FuturesClient with proxy: ${proxyConfig.url}`
        );
      }

      const agent = new HttpsProxyAgent(proxyUrl);
      axiosConfig.httpsAgent = agent;
      axiosConfig.httpAgent = agent;
    }

    this.http = axios.create(axiosConfig);
    this.http.interceptors.request.use(
      (config) => {
        (config as any).metadata = { startTime: Date.now() };
        return config;
      },
      (error) => {
        logger.error("V1 Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    this.http.interceptors.response.use(
      (response) => {
        const startTime = (response.config as any).metadata?.startTime;
        const duration = startTime ? Date.now() - startTime : 0;

        const prefix = this.agentName
          ? `[Agent: ${this.agentName}]`
          : "[V1 API]";
        const method = response.config.method?.toUpperCase() || "GET";
        const url = response.config.url || "";

        logger.info(
          `${prefix} ${method} ${url} - ${duration}ms - ${response.status} OK`
        );

        return response;
      },
      (error) => {
        const startTime = (error.config as any)?.metadata?.startTime;
        const duration = startTime ? Date.now() - startTime : 0;

        const prefix = this.agentName
          ? `[Agent: ${this.agentName}]`
          : "[V1 API]";
        const method = error.config?.method?.toUpperCase() || "GET";
        const url = error.config?.url || "";
        const status = error.response?.status || "Network Error";
        const statusText = error.response?.statusText || error.message;

        logger.info(
          `${prefix} ${method} ${url} - ${duration}ms - ${status} ${statusText}`
        );

        return Promise.reject(error);
      }
    );
  }

  private createSignature(queryString: string): string {
    return crypto
      .createHmac("sha256", this.apiSecret)
      .update(queryString)
      .digest("hex");
  }

  private createSignedParams(params: any): string {
    const timestamp = Date.now();
    const recvWindow = 50000;

    const allParams = {
      ...params,
      timestamp,
      recvWindow,
    };

    const queryString = Object.keys(allParams)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(allParams[key])}`)
      .join("&");

    const signature = this.createSignature(queryString);

    return `${queryString}&signature=${signature}`;
  }

  private getDayBoundaries(days: number): {
    startTime: number;
    endTime: number;
  } {
    const now = new Date();

    logger.debug("getDayBoundaries input:", {
      days,
      nowLocal: now.toISOString(),
      nowUTC: new Date(now.getTime()).toUTCString(),
      UTCDate: now.getUTCDate(),
      UTCMonth: now.getUTCMonth(),
      UTCYear: now.getUTCFullYear(),
    });

    // End of yesterday (last completed day) in UTC - matches Aster's server time
    const endOfYesterday = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - 1,
      23,
      59,
      59,
      999 // Last millisecond of the day
    );

    // Start of N days ago from yesterday (not from today!)
    // For 7 days: yesterday - 6 days = 7 days total
    const startOfPeriod = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - 1 - (days - 1), // yesterday minus (days - 1)
      0,
      0,
      0,
      0
    );

    logger.debug("getDayBoundaries output:", {
      startTime: startOfPeriod,
      startISO: new Date(startOfPeriod).toISOString(),
      endTime: endOfYesterday,
      endISO: new Date(endOfYesterday).toISOString(),
    });

    return {
      startTime: startOfPeriod,
      endTime: endOfYesterday,
    };
  }

  public async ping(): Promise<any> {
    try {
      const response = await this.http.get("/fapi/v1/ping");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async getServerTime(): Promise<any> {
    try {
      const response = await this.http.get("/fapi/v1/time");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async getExchangeInfo(): Promise<any> {
    try {
      const response = await this.http.get("/fapi/v1/exchangeInfo");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async getMarkPrice(symbol?: string): Promise<any> {
    try {
      const params = symbol ? { symbol } : {};
      const response = await this.http.get("/fapi/v1/premiumIndex", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async placeOrder(orderRequest: OrderRequest): Promise<OrderResponse> {
    try {
      const signedParams = this.createSignedParams(orderRequest);

      const response = await this.http.post("/fapi/v1/order", signedParams);

      logger.info(
        `V1 Order placed: ${orderRequest.side} ${orderRequest.quantity} ${orderRequest.symbol}`,
        {
          orderId: response.data.orderId,
          status: response.data.status,
        }
      );

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  public async cancelOrder(symbol: string, orderId: number): Promise<any> {
    try {
      const params = { symbol, orderId };
      const signedParams = this.createSignedParams(params);

      const response = await this.http.delete(`/fapi/v1/order?${signedParams}`);

      logger.info(`V1 Order cancelled: ${orderId} for ${symbol}`);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async getOrder(symbol: string, orderId: number): Promise<any> {
    try {
      const params = { symbol, orderId };
      const signedParams = this.createSignedParams(params);

      const response = await this.http.get(`/fapi/v1/order?${signedParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async getAllOpenOrders(symbol?: string): Promise<any> {
    try {
      const params = symbol ? { symbol } : {};
      const signedParams = this.createSignedParams(params);

      const response = await this.http.get(
        `/fapi/v1/openOrders?${signedParams}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  //TODO: This is working? Not sure
  public async cancelAllOpenOrders(symbol: string): Promise<any> {
    try {
      const params = { symbol };
      const signedParams = this.createSignedParams(params);

      const response = await this.http.delete(
        `/fapi/v1/allOpenOrders?${signedParams}`
      );

      logger.info(`V1 All open orders cancelled for ${symbol}`);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async cancelAllOrdersAcrossSymbols(): Promise<any> {
    try {
      const params = { type: null };
      const signedParams = this.createSignedParams(params);

      const response = await this.http.post(
        "/bapi/futures/v1/private/future/order/cancel-orders",
        signedParams
      );

      if (response.data.success) {
        const cancelledCount = response.data.data?.length || 0;
        logger.info(
          `Successfully cancelled ${cancelledCount} order(s) across all symbols`
        );
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Account Endpoints
  public async getAccountInfo(): Promise<AccountInfo> {
    try {
      const signedParams = this.createSignedParams({});

      const response = await this.http.get(`/fapi/v1/account?${signedParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get portfolio line chart data (balance/PnL over time)
   * @param period - Time period (e.g., "D_7" for 7 days)
   */
  public async getPortfolioLineChart(period: string = "D_7"): Promise<any> {
    try {
      const signedParams = this.createSignedParams({ period });
      const response = await this.http.post(
        "/bapi/futures/v1/private/future/portfolio/overview/line/chart",
        signedParams
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get portfolio balance breakdown
   * @param period - Time period (e.g., "D_7" for 7 days)
   */
  public async getPortfolioBalance(period: string = "D_7"): Promise<any> {
    try {
      const signedParams = this.createSignedParams(period);
      const response = await this.http.post(
        "/bapi/futures/v1/private/future/portfolio/overview/balance",
        signedParams
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Aster's official portfolio summary (for comparison)
   * @param period - Time period (e.g., "D_7", "D_14", "D_30")
   */
  public async getAsterPortfolioSummary(period: string = "D_7"): Promise<any> {
    try {
      const signedParams = this.createSignedParams({ period });
      const response = await this.http.post(
        "/bapi/futures/v1/private/future/portfolio/summary/pro",
        signedParams
      );

      logger.info(
        `Aster Portfolio Summary (${period}):`,
        JSON.stringify(response.data, null, 2)
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async getAvailableBalance(): Promise<number> {
    try {
      const account = await this.getAccountInfo();
      return parseFloat(account.availableBalance || "0");
    } catch (error) {
      throw error;
    }
  }

  public async getPositions(): Promise<AsterPosition[]> {
    try {
      const signedParams = this.createSignedParams({});

      const response = await this.http.get(
        `/fapi/v1/positionRisk?${signedParams}`
      );

      // Filter out zero positions and map to our Position interface
      const positions: AsterPosition[] = response.data
        .filter((pos: any) => parseFloat(pos.positionAmt) !== 0)
        .map((pos: any) => ({
          symbol: pos.symbol,
          side: parseFloat(pos.positionAmt) > 0 ? "LONG" : "SHORT",
          size: Math.abs(parseFloat(pos.positionAmt)),
          entryPrice: parseFloat(pos.entryPrice),
          markPrice: parseFloat(pos.markPrice),
          unrealizedPnl: parseFloat(pos.unRealizedProfit),
          positionAmt: pos.positionAmt,
          leverage: pos.leverage ? parseFloat(pos.leverage) : undefined,
          isolatedMargin: pos.isolatedMargin
            ? parseFloat(pos.isolatedMargin)
            : undefined,
          liquidationPrice: pos.liquidationPrice
            ? parseFloat(pos.liquidationPrice)
            : undefined,
          updateTime: pos.updateTime ? parseInt(pos.updateTime) : undefined,
        }));

      return positions;
    } catch (error) {
      throw error;
    }
  }

  public async clearAllPositions(): Promise<boolean> {
    try {
      // Get current positions
      const positions = await this.getPositions();
      const positionsToClose = positions.filter(
        (position) => Math.abs(parseFloat(position.positionAmt)) > 0
      );

      if (positionsToClose.length === 0) {
        logger.info("No positions to close");
        return true;
      }

      logger.info(`Found ${positionsToClose.length} position(s) to close`);

      // Close each position using the proven test method approach
      for (const position of positionsToClose) {
        try {
          const closeSide = position.side === "LONG" ? "SELL" : "BUY";
          const orderRequest = {
            symbol: position.symbol,
            side: closeSide as "SELL" | "BUY",
            type: "MARKET" as any,
            quantity: position.size.toString(),
            reduceOnly: true,
          };

          logger.info(
            `Closing ${position.symbol} position: ${closeSide} ${position.size}`
          );

          const order = await this.placeOrder(orderRequest);
          logger.info(
            `Position closed: ${position.symbol} order ID ${order.orderId}`
          );
        } catch (error: any) {
          // Continue with other positions even if one fails
        }
      }

      return true;
    } catch (error: any) {
      logger.error(
        "Clear all positions failed:",
        error.response?.data || error.message
      );
      return false;
    }
  }

  public async getBalance(): Promise<
    Omit<
      AsterBalanceV2,
      | "crossUnPnl"
      | "marginAvailable"
      | "maxWithdrawAmount"
      | "availableBalance"
      | "crossWalletBalance"
      | "updateTime"
    > & {
      withdrawAvailable: string;
    }
  > {
    const signedParams = this.createSignedParams({});

    const response = await this.http.get(`/fapi/v1/balance?${signedParams}`);
    return response.data;
  }

  public async getBalanceV2(): Promise<AsterBalanceV2[]> {
    const signedParams = this.createSignedParams({});

    const response = await this.http.get(`/fapi/v2/balance?${signedParams}`);

    // Map API response to AsterBalanceV2 interface
    const balances: AsterBalanceV2[] = response.data.map((balance: any) => ({
      accountAlias: balance.accountAlias,
      asset: balance.asset,
      balance: parseFloat(balance.balance),
      crossWalletBalance: parseFloat(balance.crossWalletBalance),
      crossUnPnl: parseFloat(balance.crossUnPnl),
      availableBalance: parseFloat(balance.availableBalance),
      maxWithdrawAmount: parseFloat(balance.maxWithdrawAmount),
      marginAvailable: balance.marginAvailable,
      updateTime: balance.updateTime,
    }));

    return balances;
  }

  public async changeLeverage(symbol: string, leverage: number): Promise<any> {
    const params = { symbol, leverage };
    const signedParams = this.createSignedParams(params);

    const response = await this.http.post("/fapi/v1/leverage", signedParams);

    logger.info(`V1 Leverage changed to ${leverage}x for ${symbol}`);

    return response.data;
  }

  // Funding Rate Endpoints
  public async getFundingRate(symbol?: string): Promise<AsterFundingRate[]> {
    const params = symbol ? { symbol } : {};
    const response = await this.http.get("/fapi/v1/fundingRate", { params });

    const fundingRates: AsterFundingRate[] = (
      Array.isArray(response.data) ? response.data : [response.data]
    ).map((rate: any) => ({
      symbol: rate.symbol,
      fundingRate: parseFloat(rate.fundingRate),
      fundingTime: rate.fundingTime,
      markPrice: parseFloat(rate.markPrice || "0"),
    }));

    return fundingRates;
  }

  public async getCurrentFundingRate(symbol: string): Promise<number> {
    try {
      const response = await this.http.get("/fapi/v1/premiumIndex", {
        params: { symbol },
      });

      return parseFloat(response.data.lastFundingRate || "0");
    } catch (error) {
      throw error;
    }
  }

  public async getIncomeHistory(
    symbol?: string,
    incomeType?: string,
    startTime?: number,
    endTime?: number,
    limit: number = 1000
  ): Promise<AsterIncomeRecord[]> {
    const params: any = { limit };
    if (symbol) params.symbol = symbol;
    if (incomeType) params.incomeType = incomeType;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const signedParams = this.createSignedParams(params);
    const response = await this.http.get(`/fapi/v1/income?${signedParams}`);

    const incomeRecords: AsterIncomeRecord[] = response.data.map(
      (record: any) => ({
        symbol: record.symbol || "",
        incomeType: record.incomeType,
        income: parseFloat(record.income),
        asset: record.asset,
        info: record.info,
        time: record.time,
        tranId: record.tranId,
        tradeId: record.tradeId || undefined,
      })
    );

    return incomeRecords;
  }

  public async getPnL(
    periodHours?: number,
    symbol?: string,
    includeUnrealizedPnL: boolean = false
  ): Promise<PnLSummary> {
    try {
      let startTime: number | undefined;
      let endTime: number | undefined;
      let periodLabel: string;

      if (periodHours) {
        endTime = Date.now();
        startTime = endTime - periodHours * 60 * 60 * 1000;
        periodLabel =
          periodHours === 24 ? "24H" : `${Math.floor(periodHours / 24)}D`;
      } else {
        // No time range = API returns 7-day data by default
        periodLabel = "7D";
      }

      // Call getIncomeHistory with calculated time range
      const incomeRecords = await this.getIncomeHistory(
        symbol,
        undefined,
        startTime,
        endTime
      );

      // Initialize accumulators
      let realizedPnL = 0;
      let fundingFees = 0;
      let commissions = 0;
      let autoExchange = 0;
      let rebates = 0;
      let deposits = 0;
      let withdrawals = 0;
      let minTime = Date.now();
      let maxTime = 0;

      // Aggregate by income type
      for (const record of incomeRecords) {
        // Track time range
        if (record.time < minTime) minTime = record.time;
        if (record.time > maxTime) maxTime = record.time;

        // Sum by type
        switch (record.incomeType) {
          case "REALIZED_PNL":
            realizedPnL += record.income;
            break;
          case "FUNDING_FEE":
            fundingFees += record.income;
            break;
          case "COMMISSION":
            commissions += record.income;
            break;
          case "AUTO_EXCHANGE":
            autoExchange += record.income;
            break;
          case "APOLLOX_DEX_REBATE":
          case "REBATE":
          case "REFERRAL_REBATE":
            rebates += record.income;
            break;
          case "TRANSFER":
          case "TRANSFER_SPOT_TO_FUTURE":
          case "TRANSFER_FUTURE_TO_SPOT":
            // Separate deposits (positive) from withdrawals (negative)
            if (record.income > 0) {
              deposits += record.income;
            } else {
              withdrawals += record.income;
            }
            break;
        }
      }

      // Get unrealized PnL from open positions if requested
      let unrealizedPnL = 0;
      if (includeUnrealizedPnL) {
        try {
          const positions = await this.getPositions();
          unrealizedPnL = positions.reduce(
            (sum, pos) => sum + pos.unrealizedPnl,
            0
          );
          logger.debug(
            `Fetched unrealized PnL: ${unrealizedPnL.toFixed(4)} from ${
              positions.length
            } position(s)`
          );
        } catch (error) {
          logger.warn("Failed to fetch unrealized PnL:", error);
        }
      }

      // Calculate PnL components
      const netTransfers = deposits + withdrawals;
      const tradingPnL =
        realizedPnL + fundingFees + commissions + autoExchange + rebates;
      const totalPnL = tradingPnL + unrealizedPnL;
      const netPnL = totalPnL + netTransfers;

      const summary: PnLSummary = {
        realizedPnL,
        fundingFees,
        commissions,
        autoExchange,
        rebates,
        unrealizedPnL,
        tradingPnL,
        totalPnL,
        deposits,
        withdrawals,
        netTransfers,
        netPnL,
        recordCount: incomeRecords.length,
        startTime: minTime,
        endTime: maxTime,
        period: periodLabel,
      };

      logger.info(
        `${periodLabel} PnL Summary: ` +
          `TradingPnL=${tradingPnL.toFixed(4)} ` +
          `(Realized=${realizedPnL.toFixed(4)}, ` +
          `Funding=${fundingFees.toFixed(4)}, ` +
          `Commission=${commissions.toFixed(4)}, ` +
          `AutoExchange=${autoExchange.toFixed(4)}, ` +
          `Rebates=${rebates.toFixed(4)}), ` +
          `UnrealizedPnL=${unrealizedPnL.toFixed(4)}, ` +
          `TotalPnL=${totalPnL.toFixed(4)}, ` +
          `Deposits=${deposits.toFixed(4)}, ` +
          `Withdrawals=${withdrawals.toFixed(4)}, ` +
          `NetTransfers=${netTransfers.toFixed(4)}, ` +
          `NetPnL=${netPnL.toFixed(4)}, ` +
          `Records=${incomeRecords.length}`
      );

      return summary;
    } catch (error) {
      throw error;
    }
  }

  public async getPnLByDays(
    days: number,
    symbol?: string,
    includeUnrealizedPnL: boolean = false
  ): Promise<PnLSummary> {
    try {
      const { startTime, endTime } = this.getDayBoundaries(days);
      const periodLabel = `D_${days}`;

      logger.info(`Calculating PnL for ${periodLabel} (day boundaries):`, {
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        days,
      });

      const incomeRecords = await this.getIncomeHistory(
        symbol,
        undefined,
        startTime,
        endTime
      );

      let realizedPnL = 0;
      let fundingFees = 0;
      let commissions = 0;
      let autoExchange = 0;
      let rebates = 0;
      let deposits = 0;
      let withdrawals = 0;

      for (const record of incomeRecords) {
        switch (record.incomeType) {
          case "REALIZED_PNL":
            realizedPnL += record.income;
            break;
          case "FUNDING_FEE":
            fundingFees += record.income;
            break;
          case "COMMISSION":
            commissions += record.income;
            break;
          case "AUTO_EXCHANGE":
            autoExchange += record.income;
            break;
          case "APOLLOX_DEX_REBATE":
          case "REBATE":
          case "REFERRAL_REBATE":
            rebates += record.income;
            break;
          case "TRANSFER":
          case "TRANSFER_SPOT_TO_FUTURE":
          case "TRANSFER_FUTURE_TO_SPOT":
            if (record.income > 0) {
              deposits += record.income;
            } else {
              withdrawals += record.income;
            }
            break;
        }
      }

      let unrealizedPnL = 0;
      if (includeUnrealizedPnL) {
        try {
          const positions = await this.getPositions();
          unrealizedPnL = positions.reduce(
            (sum, pos) => sum + pos.unrealizedPnl,
            0
          );
          logger.debug(
            `Fetched unrealized PnL: ${unrealizedPnL.toFixed(4)} from ${
              positions.length
            } position(s)`
          );
        } catch (error) {
          logger.warn("Failed to fetch unrealized PnL:", error);
        }
      }

      const netTransfers = deposits + withdrawals;
      const tradingPnL =
        realizedPnL + fundingFees + commissions + autoExchange + rebates;
      const totalPnL = tradingPnL + unrealizedPnL;
      const netPnL = totalPnL + netTransfers;

      const summary: PnLSummary = {
        realizedPnL,
        fundingFees,
        commissions,
        autoExchange,
        rebates,
        unrealizedPnL,
        tradingPnL,
        totalPnL,
        deposits,
        withdrawals,
        netTransfers,
        netPnL,
        recordCount: incomeRecords.length,
        startTime, // Use query boundary to match Aster exactly
        endTime, // Use query boundary to match Aster exactly
        period: periodLabel,
      };

      return summary;
    } catch (error) {
      throw error;
    }
  }

  public async getUserTrades(
    symbol: string,
    startTime?: number,
    endTime?: number,
    limit: number = 500
  ): Promise<any[]> {
    const params: any = { symbol, limit };
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const signedParams = this.createSignedParams(params);
    const response = await this.http.get(`/fapi/v1/userTrades?${signedParams}`);

    return response.data;
  }

  public async getAccountTradeVolume(
    startTime?: number,
    endTime?: number
  ): Promise<{
    totalVolume: number;
    totalQuoteVolume: number;
    tradeCount: number;
  }> {
    try {
      // If no time range specified, use last 24 hours
      if (!startTime) {
        startTime = Date.now() - 24 * 60 * 60 * 1000;
      }
      if (!endTime) {
        endTime = Date.now();
      }

      // Get trades for all symbols (we'll aggregate)
      const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "DOGEUSDT"]; // Add more as needed
      let totalVolume = 0;
      let totalQuoteVolume = 0;
      let tradeCount = 0;

      for (const symbol of symbols) {
        try {
          const trades = await this.getUserTrades(symbol, startTime, endTime);

          for (const trade of trades) {
            tradeCount++;
            totalVolume += parseFloat(trade.qty);
            totalQuoteVolume += parseFloat(trade.quoteQty);
          }
        } catch (error) {
          // Continue if symbol not available or no trades
          logger.debug(`V1 No trades found for ${symbol}: ${error}`);
        }
      }

      return {
        totalVolume,
        totalQuoteVolume,
        tradeCount,
      };
    } catch (error) {
      throw error;
    }
  }

  public async getCommissionRates(symbol?: string): Promise<any> {
    try {
      const params = symbol ? { symbol } : {};
      const signedParams = this.createSignedParams(params);

      const response = await this.http.get(
        `/fapi/v1/commissionRate?${signedParams}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  //MOVE OUT THIS METHOD
  public async getCurrentIP(): Promise<string> {
    try {
      const response = await this.http.get("https://ident.me", {
        timeout: 5000,
      });
      const ip = response.data.trim();
      logger.debug(`V1 Current IP detected: ${ip}`);
      return ip;
    } catch (error) {
      logger.debug("V1 IP detection failed:", error);
      return "unknown";
    }
  }

  public async ensurePrecisionData(): Promise<void> {
    try {
      if (
        this.precisionManager.isDataStale() ||
        this.precisionManager.getLoadedSymbols().length === 0
      ) {
        logger.info("V1 Loading fresh exchange info for precision data...");
        const exchangeInfo = await this.getExchangeInfo();
        await this.precisionManager.loadExchangeInfo(exchangeInfo);
      }
    } catch (error) {
      throw error;
    }
  }

  public formatQuantityForSymbol(quantity: number, symbol: string): string {
    return this.precisionManager.formatQuantity(quantity, symbol);
  }

  public formatPriceForSymbol(price: number, symbol: string): string {
    return this.precisionManager.formatPrice(price, symbol);
  }

  public validateOrderPrecision(
    symbol: string,
    quantity: number,
    price?: number
  ): { valid: boolean; errors: string[]; adjustedQuantity?: number } {
    const errors: string[] = [];
    let adjustedQuantity: number | undefined;

    // Validate quantity
    const quantityValidation = this.precisionManager.validateQuantity(
      quantity,
      symbol
    );
    if (!quantityValidation.valid) {
      errors.push(quantityValidation.reason || "Invalid quantity");
      adjustedQuantity = quantityValidation.adjustedQuantity;
    }

    // Validate notional if price is provided
    if (price !== undefined) {
      const notionalValidation = this.precisionManager.validateNotional(
        quantity,
        price,
        symbol
      );
      if (!notionalValidation.valid) {
        errors.push(notionalValidation.reason || "Invalid notional value");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      adjustedQuantity,
    };
  }

  public async placeOrderWithPrecisionValidation(
    orderRequest: OrderRequest
  ): Promise<any> {
    try {
      // Ensure we have precision data
      await this.ensurePrecisionData();

      // Validate and format the order parameters
      const quantity = parseFloat(orderRequest.quantity || "0");
      const price = orderRequest.price
        ? parseFloat(orderRequest.price)
        : undefined;

      // Validate precision
      const validation = this.validateOrderPrecision(
        orderRequest.symbol,
        quantity,
        price
      );
      if (!validation.valid) {
        // Try to use adjusted quantity if available
        if (validation.adjustedQuantity !== undefined) {
          logger.warn(
            `V1 Adjusting quantity from ${quantity} to ${validation.adjustedQuantity} for ${orderRequest.symbol}`
          );
          orderRequest.quantity = this.formatQuantityForSymbol(
            validation.adjustedQuantity,
            orderRequest.symbol
          );
        } else {
          throw new Error(
            `V1 Order validation failed for ${
              orderRequest.symbol
            }: ${validation.errors.join(", ")}`
          );
        }
      } else {
        // Format with correct precision
        orderRequest.quantity = this.formatQuantityForSymbol(
          quantity,
          orderRequest.symbol
        );
      }

      // Format price if provided
      if (orderRequest.price) {
        orderRequest.price = this.formatPriceForSymbol(
          parseFloat(orderRequest.price),
          orderRequest.symbol
        );
      }

      // Place the order with validated parameters
      return await this.placeOrder(orderRequest);
    } catch (error: any) {
      throw error;
    }
  }
}
