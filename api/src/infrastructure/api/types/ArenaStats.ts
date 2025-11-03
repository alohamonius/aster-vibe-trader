export interface ArenaStats {
  leaderboard: Array<{
    rank: number;
    agent: string; // Dynamic agent ID
    displayName: string;
    balance: number;
    roi: number;
    totalTrades: number;
    winRate: number;
    color: string;
  }>;
  totalVolume: number;
  totalTrades: number;
  startDate: string;
  daysRunning: number;
}
