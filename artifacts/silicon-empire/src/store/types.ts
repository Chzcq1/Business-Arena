export type GamePhase = "intel" | "event" | "action" | "resolution" | "gameover";
export type GameResult = "playing" | "won_instant" | "won_timeout" | "won_timeout_lost" | "bankrupt";

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
  hasFactory: boolean;
}

export interface Executives {
  cfo: boolean;
  coo: boolean;
}

export interface Upgrades {
  componentFactory: boolean;
  legendaryEngineer: boolean;
}

export interface LoanState {
  outstanding: number;
  quartersRemaining: number;
  repaymentPerQuarter: number;
}

export interface BiddingWar {
  active: boolean;
  engineerSigned: boolean | null;
}

export interface SabotageState {
  ddosPending: boolean;
  prPending: boolean;
  cooldown: boolean;
}

export interface EventLocale {
  title: string;
  description: string;
}

export interface ChoiceLocale {
  label: string;
  description: string;
}

export interface QuarterEvent {
  id: string;
  type: "supply" | "regulation" | "market" | "tech";
  en: EventLocale;
  th: EventLocale;
  choices: EventChoice[];
}

export interface EventChoice {
  id: string;
  effect: Partial<PlayerMetrics> & { intelBonus?: number };
  en: ChoiceLocale;
  th: ChoiceLocale;
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
  grossProfit: number;
  playerProfit: number;
  botProfit: number;
  newPlayerMarketShare: number;
  newBotMarketShare: number;
  capitalChange: number;
  moraleChange: number;
  eWastePenalty: number;
  eWasteUnits: number;
  debtRepayment: number;
  techGrowth: number;
  effectiveUnitCost: number;
  playerCapacity: number;
  playerRawDemand: number;
  demandFactor: number;
  summaryKey: string;
}

export interface MarketIntel {
  demandTrend: "rising" | "stable" | "falling";
  competitorActivity: "aggressive" | "passive" | "unknown";
  hintKey: string;
  botHintKey: string | null;
}

export interface BotScheduledAction {
  triggerAtSecond: number;
  executed: boolean;
  label: string;
  type: "price" | "production" | "strategy";
  delta: Partial<BotState>;
}
