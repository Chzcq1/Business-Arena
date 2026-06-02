export type GamePhase = "intel" | "event" | "action" | "resolution" | "gameover";

export interface PlayerMetrics {
  capital: number;
  morale: number;
  techLevel: number;
  marketShare: number;
  intelPoints: number;
}

export interface PlayerDraft {
  price: number;
  productionBudget: number;
  intelAllocation: number;
}

export interface BotState {
  price: number;
  productionBudget: number;
  capital: number;
  marketShare: number;
  lastMoveLabel: string | null;
  lastMoveTime: number | null;
}

export interface QuarterEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  type: "supply" | "regulation" | "market" | "tech";
}

export interface EventChoice {
  id: string;
  label: string;
  effect: Partial<PlayerMetrics> & { intelBonus?: number };
  description: string;
}

export interface IntelAlert {
  id: string;
  message: string;
  timestamp: number;
  type: "price" | "production" | "strategy";
}

export interface ResolutionResult {
  playerSalesUnits: number;
  botSalesUnits: number;
  playerRevenue: number;
  botRevenue: number;
  playerProfit: number;
  botProfit: number;
  newPlayerMarketShare: number;
  newBotMarketShare: number;
  capitalChange: number;
  moraleChange: number;
  summary: string;
}

export interface MarketIntel {
  demandTrend: "rising" | "stable" | "falling";
  competitorActivity: "aggressive" | "passive" | "unknown";
  hint: string;
  botHint: string | null;
}

export interface BotScheduledAction {
  triggerAtSecond: number;
  executed: boolean;
  action: () => void;
}
