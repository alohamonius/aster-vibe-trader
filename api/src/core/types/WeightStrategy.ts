export type WeightStrategy = {
  agentProfile: {
    type: "degen" | "conservative" | "balanced" | "event_driven" | "techincal";
    riskAppetite: number; // 0-100, where 0 is extremely conservative, 100 is full degen
    decisionStyle: "impulsive" | "analytical" | "consensus_seeking";
  };
  dataSourceWeights: Record<string, number>;
  executionRules: {
    minConfidence: number; // 0-100, how confident before taking action
    speedVsAccuracy: number; // 0-100, 0=wait for all signals, 100=act on first signal
    conflictTolerance: "high" | "medium" | "low"; // How to handle conflicting signals
  };
  exitStrategy: {
    stopLoss: {
      base: number;
      style: "tight" | "normal" | "loose";
    };
    takeProfit: {
      targets: number[];
      partialExits: number[];
      style: "quick" | "normal" | "runner";
    };
  };
  tradingPhilosophy: {
    approach: string; // Overall strategy approach
    indicators: Record<string, string>; // How to use each selected indicator
  };
  tradingPreference: {
    direction:
      | "long_only"
      | "short_only"
      | "neutral"
      | "long_bias"
      | "short_bias";
  };
  entryStyle: {
    type: "aggressive" | "patient" | "opportunistic";
  };
};

export const DEFAULT_WEIGHT_STRATEGY: WeightStrategy = {
  agentProfile: {
    type: "balanced",
    riskAppetite: 50,
    decisionStyle: "consensus_seeking",
  },
  dataSourceWeights: {},
  executionRules: {
    minConfidence: 50,
    speedVsAccuracy: 50,
    conflictTolerance: "medium",
  },
  exitStrategy: {
    stopLoss: {
      base: 5,
      style: "normal",
    },
    takeProfit: {
      targets: [6, 12, 18],
      partialExits: [33, 33, 34],
      style: "normal",
    },
  },
  tradingPhilosophy: {
    approach:
      "Balanced approach using technical indicators with moderate risk management and multi-timeframe confirmation",
    indicators: {
      rsi: "Use for overbought/oversold conditions at extremes",
      macd: "Enter on signal line crossovers with histogram confirmation",
      bollinger_bands: "Trade bounces off bands in ranging markets",
    },
  },
  tradingPreference: {
    direction: "neutral",
  },
  entryStyle: {
    type: "opportunistic",
  },
};
