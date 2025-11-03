export interface ArenaTrade {
  id: string | number;
  agent: string; // Dynamic agent ID
  agentName: string;
  displayName: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  value: number;
  commission: number;
  timestamp: number;
  tradeTime: string;
  action: "bought" | "sold";
  // AI decision data
  confidence?: number;
  reasoning?: string;
  // Complete AI decision array (trades have 1:1 mapping)
  aiDecisions?: any[];
}
