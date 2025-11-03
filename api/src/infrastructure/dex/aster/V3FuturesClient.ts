import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ApiCredentials, SignatureParams } from "@/shared/types";
import { EthereumSigner, SolanaSigner } from "@/infrastructure/api/Signer";
import { logger } from "@/shared/utils/logger";
import { SymbolPrecisionManager } from "@/shared/utils/SymbolPrecisionManager";
import {
  AsterFundingRate,
  AsterFundingPayment,
  AsterPosition,
  OrderRequest,
  OrderResponse,
} from "./types";

export class V3FuturesClient {
  private http: AxiosInstance;
  private signer?: EthereumSigner | SolanaSigner;
  private credentials: ApiCredentials;
  private baseUrl: string;
  private precisionManager: SymbolPrecisionManager;

  constructor(
    credentials: ApiCredentials,
    baseUrl: string = "https://fapi.asterdex.com"
  ) {
    this.credentials = credentials;
    this.baseUrl = baseUrl;
    this.precisionManager = SymbolPrecisionManager.getInstance();

    if (credentials.privateKey) {
      if (credentials.authType === "ethereum") {
        this.signer = new EthereumSigner(credentials.privateKey);
      } else if (credentials.authType === "solana") {
        this.signer = new SolanaSigner(credentials.privateKey);
      }
    }

    this.http = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "AsterVolumeBot/1.0",
      },
    });

    // Add request interceptor for logging
    this.http.interceptors.request.use(
      (config) => {
        logger.debug(
          `API Request: ${config.method?.toUpperCase()} ${config.url}`,
          {
            params: config.params,
            data: config.data,
          }
        );
        return config;
      },
      (error) => {
        logger.error("Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.http.interceptors.response.use(
      (response) => {
        logger.debug(
          `API Response: ${response.status} ${response.config.url}`,
          {
            data: response.data,
          }
        );
        return response;
      },
      (error) => {
        logger.error("API Error:", {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
        return Promise.reject(error);
      }
    );
  }

  private generateNonce(): number {
    return Math.trunc(Date.now() * 1000);
  }

  private async signRequest(params: any): Promise<any> {
    const timestamp = Date.now();
    const recvWindow = 50000;

    // Filter out null/undefined values
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== null && value !== undefined
      )
    );

    if (
      this.credentials.authType === "ethereum" ||
      this.credentials.authType === "solana"
    ) {
      // Wallet-based authentication (Ethereum or Solana)
      const nonce = this.generateNonce();

      // For Solana, signerAddress defaults to walletAddress if not provided
      const signerAddress =
        this.credentials.authType === "solana"
          ? this.credentials.signerAddress || this.credentials.walletAddress!
          : this.credentials.signerAddress!;

      const signatureParams: SignatureParams = {
        ...filteredParams,
        nonce,
        timestamp,
        recvWindow,
        user: this.credentials.walletAddress!,
        signer: signerAddress,
      };

      try {
        const signature = await this.signer!.signParameters(signatureParams);

        return {
          ...filteredParams,
          nonce,
          user: this.credentials.walletAddress,
          signer: signerAddress,
          signature,
          timestamp,
          recvWindow,
        };
      } catch (error) {
        logger.error(
          `Error signing request with ${this.credentials.authType}:`,
          error
        );
        throw error;
      }
    } else {
      // API key authentication
      return {
        ...filteredParams,
        apiKey: this.credentials.apiKey,
        timestamp,
        recvWindow,
        // Add any additional API key auth headers as needed
      };
    }
  }

  // Market Data Endpoints
  public async ping(): Promise<any> {
    try {
      const response = await this.http.get("/fapi/v3/ping");
      return response.data;
    } catch (error) {
      logger.error("Ping failed:", error);
      throw error;
    }
  }

  public async getServerTime(): Promise<any> {
    try {
      const response = await this.http.get("/fapi/v3/time");
      return response.data;
    } catch (error) {
      logger.error("Get server time failed:", error);
      throw error;
    }
  }

  public async getExchangeInfo(): Promise<any> {
    try {
      const response = await this.http.get("/fapi/v3/exchangeInfo");
      return response.data;
    } catch (error) {
      logger.error("Get exchange info failed:", error);
      throw error;
    }
  }

  public async getOrderBook(symbol: string, limit: number = 100): Promise<any> {
    try {
      const response = await this.http.get("/fapi/v3/depth", {
        params: { symbol, limit },
      });
      return response.data;
    } catch (error) {
      logger.error("Get order book failed:", error);
      throw error;
    }
  }

  public async getMarkPrice(symbol?: string): Promise<any> {
    try {
      const params = symbol ? { symbol } : {};
      const response = await this.http.get("/fapi/v3/premiumIndex", { params });
      return response.data;
    } catch (error) {
      logger.error("Get mark price failed:", error);
      throw error;
    }
  }

  // Trading Endpoints
  public async placeOrder(orderRequest: OrderRequest): Promise<OrderResponse> {
    try {
      const signedParams = await this.signRequest(orderRequest);

      const response = await this.http.post("/fapi/v3/order", signedParams);

      logger.info(
        `Order placed: ${orderRequest.side} ${orderRequest.quantity} ${orderRequest.symbol}`,
        {
          orderId: response.data.orderId,
          status: response.data.status,
        }
      );

      return response.data;
    } catch (error) {
      logger.error("Place order failed:", error);
      throw error;
    }
  }

  public async cancelOrder(symbol: string, orderId: number): Promise<any> {
    try {
      const params = { symbol, orderId };
      const signedParams = await this.signRequest(params);

      const response = await this.http.delete("/fapi/v3/order", {
        data: signedParams,
      });

      logger.info(`Order cancelled: ${orderId} for ${symbol}`);

      return response.data;
    } catch (error) {
      logger.error("Cancel order failed:", error);
      throw error;
    }
  }

  public async getOrder(symbol: string, orderId: number): Promise<any> {
    try {
      const params = { symbol, orderId };
      const signedParams = await this.signRequest(params);

      const response = await this.http.get("/fapi/v3/order", {
        params: signedParams,
      });
      return response.data;
    } catch (error) {
      logger.error("Get order failed:", error);
      throw error;
    }
  }

  public async getAllOpenOrders(symbol?: string): Promise<any> {
    try {
      const params = symbol ? { symbol } : {};
      const signedParams = await this.signRequest(params);

      const response = await this.http.get("/fapi/v3/openOrders", {
        params: signedParams,
      });
      return response.data;
    } catch (error) {
      logger.error("Get open orders failed:", error);
      throw error;
    }
  }

  public async cancelAllOpenOrders(symbol: string): Promise<any> {
    try {
      const params = { symbol };
      const signedParams = await this.signRequest(params);

      const response = await this.http.delete("/fapi/v3/allOpenOrders", {
        data: signedParams,
      });

      logger.info(`All open orders cancelled for ${symbol}`);

      return response.data;
    } catch (error) {
      logger.error("Cancel all open orders failed:", error);
      throw error;
    }
  }

  // Account Endpoints
  public async getAccountInfo(): Promise<any> {
    try {
      const signedParams = await this.signRequest({});

      const response = await this.http.get("/fapi/v3/account", {
        params: signedParams,
      });
      return response.data;
    } catch (error) {
      logger.error("Get account info failed:", error);
      throw error;
    }
  }

  public async getPositions(): Promise<AsterPosition[]> {
    try {
      const signedParams = await this.signRequest({});

      const response = await this.http.get("/fapi/v3/positionRisk", {
        params: signedParams,
      });

      // Filter out zero positions and map to our AsterPosition interface
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
      logger.error("Get positions failed:", error);
      throw error;
    }
  }

  public async getBalance(): Promise<any> {
    try {
      const signedParams = await this.signRequest({});

      const response = await this.http.get("/fapi/v3/balance", {
        params: signedParams,
      });
      return response.data;
    } catch (error) {
      logger.error("Get balance failed:", error);
      throw error;
    }
  }

  public async changeLeverage(symbol: string, leverage: number): Promise<any> {
    try {
      const params = { symbol, leverage };
      const signedParams = await this.signRequest(params);

      const response = await this.http.post("/fapi/v3/leverage", signedParams);

      logger.info(`Leverage changed to ${leverage}x for ${symbol}`);

      return response.data;
    } catch (error) {
      logger.error("Change leverage failed:", error);
      throw error;
    }
  }

  // Funding Rate Endpoints
  public async getFundingRate(symbol?: string): Promise<AsterFundingRate[]> {
    try {
      const params = symbol ? { symbol } : {};
      const response = await this.http.get("/fapi/v3/fundingRate", { params });

      const fundingRates: AsterFundingRate[] = (
        Array.isArray(response.data) ? response.data : [response.data]
      ).map((rate: any) => ({
        symbol: rate.symbol,
        fundingRate: parseFloat(rate.fundingRate),
        fundingTime: rate.fundingTime,
        markPrice: parseFloat(rate.markPrice || "0"),
      }));

      return fundingRates;
    } catch (error) {
      logger.error("Get funding rate failed:", error);
      throw error;
    }
  }

  public async getFundingHistory(
    symbol: string,
    startTime?: number,
    endTime?: number,
    limit: number = 100
  ): Promise<AsterFundingPayment[]> {
    try {
      const params: any = { symbol, limit };
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;

      const signedParams = await this.signRequest(params);
      const response = await this.http.get("/fapi/v3/income", {
        params: signedParams,
      });

      // Filter for funding payments only
      const fundingPayments: AsterFundingPayment[] = response.data
        .filter((payment: any) => payment.incomeType === "FUNDING_FEE")
        .map((payment: any) => ({
          symbol: payment.symbol,
          income: parseFloat(payment.income),
          asset: payment.asset,
          time: payment.time,
          info: payment.info,
          tranId: payment.tranId,
          tradeId: payment.tradeId,
        }));

      return fundingPayments;
    } catch (error) {
      logger.error("Get funding history failed:", error);
      throw error;
    }
  }

  public async getCurrentFundingRate(symbol: string): Promise<number> {
    try {
      const response = await this.http.get("/fapi/v3/premiumIndex", {
        params: { symbol },
      });

      return parseFloat(response.data.lastFundingRate || "0");
    } catch (error) {
      logger.error("Get current funding rate failed:", error);
      throw error;
    }
  }

  // Trade History and Volume Endpoints
  public async getUserTrades(
    symbol: string,
    startTime?: number,
    endTime?: number,
    limit: number = 500
  ): Promise<any[]> {
    try {
      const params: any = { symbol, limit };
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;

      const signedParams = await this.signRequest(params);
      const response = await this.http.get("/fapi/v3/userTrades", {
        params: signedParams,
      });

      return response.data;
    } catch (error) {
      logger.error("Get user trades failed:", error);
      throw error;
    }
  }

  public async getDailyVolume(
    symbol?: string
  ): Promise<{ symbol: string; volume: number; quoteVolume: number }[]> {
    try {
      // Get 24hr ticker statistics which includes volume
      const response = await this.http.get("/fapi/v3/ticker/24hr", {
        params: symbol ? { symbol } : {},
      });

      const tickers = Array.isArray(response.data)
        ? response.data
        : [response.data];

      return tickers.map((ticker: any) => ({
        symbol: ticker.symbol,
        volume: parseFloat(ticker.volume),
        quoteVolume: parseFloat(ticker.quoteVolume),
      }));
    } catch (error) {
      logger.error("Get daily volume failed:", error);
      throw error;
    }
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
          logger.debug(`No trades found for ${symbol}: ${error}`);
        }
      }

      return {
        totalVolume,
        totalQuoteVolume,
        tradeCount,
      };
    } catch (error) {
      logger.error("Get account trade volume failed:", error);
      throw error;
    }
  }

  public async getCommissionRates(symbol?: string): Promise<any> {
    try {
      const params = symbol ? { symbol } : {};
      const signedParams = await this.signRequest(params);

      const response = await this.http.get("/fapi/v3/commissionRate", {
        params: signedParams,
      });
      return response.data;
    } catch (error) {
      logger.error("Get commission rates failed:", error);
      throw error;
    }
  }

  // Precision Management Methods
  public async ensurePrecisionData(): Promise<void> {
    try {
      if (
        this.precisionManager.isDataStale() ||
        this.precisionManager.getLoadedSymbols().length === 0
      ) {
        logger.info("Loading fresh exchange info for precision data...");
        const exchangeInfo = await this.getExchangeInfo();
        await this.precisionManager.loadExchangeInfo(exchangeInfo);
      }
    } catch (error) {
      logger.error("Failed to ensure precision data:", error);
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
  ): Promise<OrderResponse> {
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
            `Adjusting quantity from ${quantity} to ${validation.adjustedQuantity} for ${orderRequest.symbol}`
          );
          orderRequest.quantity = this.formatQuantityForSymbol(
            validation.adjustedQuantity,
            orderRequest.symbol
          );
        } else {
          throw new Error(
            `Order validation failed for ${
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
    } catch (error) {
      logger.error("Place order with precision validation failed:", error);
      throw error;
    }
  }
}
