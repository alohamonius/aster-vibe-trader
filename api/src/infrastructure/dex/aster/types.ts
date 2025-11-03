export interface AsterPosition {
  symbol: string;
  side: "LONG" | "SHORT";
  size: number;
  entryPrice: number;
  unrealizedPnl: number;
  positionAmt: string;
  markPrice: number;
  leverage?: number;
  isolatedMargin?: number;
  liquidationPrice?: number;
  updateTime?: number;
  orderId?: string; // Optional - tracks the order that opened this position
}

export type AccountInfo = {
  assets: any[];
  availableBalance: string;
  canDeposit: boolean;
  canTrade: boolean;
  canWithdraw: boolean;
  feeTier: number;
  maxWithdrawAmount: string;
  positions: any[];
  totalCrossUnPnl: string;
  totalCrossWalletBalance: string;
  totalInitialMargin: string;
  totalMaintMargin: string;
  totalMarginBalance: string;
  totalOpenOrderInitialMargin: string;
  totalPositionInitialMargin: string;

  totalUnrealizedProfit: string;
  totalWalletBalance: string;
  updateTime: number;
};

export interface AsterFundingRate {
  symbol: string;
  fundingRate: number;
  fundingTime: number;
  markPrice: number;
}

export interface AsterFundingPayment {
  symbol: string;
  income: number;
  asset: string;
  time: number;
  info: string;
  tranId: number;
  tradeId: string;
}

export interface AsterBalanceV2 {
  accountAlias: string;
  asset: string;
  availableBalance: number;
  balance: number;
  crossUnPnl: number; // unrealized profit of crossed positions
  crossWalletBalance: number;
  marginAvailable: boolean;
  maxWithdrawAmount: number;
  updateTime: number;
}

export interface AsterIncomeRecord {
  symbol: string;
  incomeType: string; // "REALIZED_PNL", "FUNDING_FEE", "COMMISSION", "TRANSFER", etc.
  income: number;
  asset: string;
  info: string;
  time: number;
  tranId: string;
  tradeId?: string;
}

export interface PnLSummary {
  // Trading performance components
  realizedPnL: number; // Sum of REALIZED_PNL
  fundingFees: number; // Sum of FUNDING_FEE
  commissions: number; // Sum of COMMISSION (negative)
  autoExchange: number; // Sum of AUTO_EXCHANGE (currency swaps)
  rebates: number; // Sum of rebates (APOLLOX_DEX_REBATE, REFERRAL_REBATE, etc.)
  unrealizedPnL: number; // Unrealized PnL from open positions

  // Trading performance totals (excluding transfers)
  tradingPnL: number; // realizedPnL + fundingFees + commissions + autoExchange + rebates
  totalPnL: number; // tradingPnL + unrealizedPnL (total trading performance)

  // Account transfers
  deposits: number; // Sum of positive transfers (money added to account)
  withdrawals: number; // Sum of negative transfers (money removed from account)
  netTransfers: number; // deposits + withdrawals (net change from transfers)

  // Total account change
  netPnL: number; // totalPnL + netTransfers (total account change)

  recordCount: number;
  startTime: number;
  endTime: number;
  period: string; // Time period: "24H", "7D", "14D", "30D", or "CUSTOM"
}

export interface ClearPositionResponse {
  code: string;
  message: string | null;
  messageDetail?: string | null;
  data: {
    newOrderResponseList: OrderResponse[];
  };
  success: boolean;
}

export interface OrderRequest {
  symbol: string;
  side: "BUY" | "SELL";
  type:
    | "LIMIT"
    | "MARKET"
    | "TAKE_PROFIT"
    | "STOP"
    | "TAKE_PROFIT_MARKET"
    | "STOP_MARKET";
  quantity: string;
  price?: string;
  stopPrice?: string; // For STOP and TAKE_PROFIT orders
  timeInForce?: "GTC" | "IOC" | "FOK";
  positionSide?: "BOTH" | "LONG" | "SHORT";
  reduceOnly?: boolean;
  workingType?: "MARK_PRICE" | "CONTRACT_PRICE"; // Price type for stop orders
  priceProtect?: boolean; // Price protection for stop orders
}

export interface OrderResponse {
  orderId: number;
  symbol: string;
  status: string;
  clientOrderId: string;
  price: string;
  avgPrice: string;
  origQty: string;
  executedQty: string;
  cumQuote: string;
  timeInForce: string;
  type: string;
  side: string;
  updateTime: number;
}
