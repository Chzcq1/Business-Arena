// ===== SILICON EMPIRE v4 — Type Definitions =====

export type GamePhase =
  | "ceoselect"
  | "intel"
  | "boardmeeting"
  | "event"
  | "action"
  | "resolution"
  | "gameover";

export type GameResult =
  | "playing"
  | "won_instant"
  | "won_timeout"
  | "won_timeout_lost"
  | "bankrupt";

// v4.0: Bot personality
export type BotPersonaType = "discount_king" | "tech_premium" | "copycat";

export type BoardDirective =
  | "aggressive_rd"
  | "austerity"
  | "market_expansion"
  | "brand_campaign"
  | "cost_cutting"
  | "talent_retention"
  | "premium_focus"
  | "volume_play"
  // v4.0 — Dark Tactics
  | "planned_obsolescence"
  | "industrial_espionage"
  // v4.0 — New Directives
  | "flash_sale"
  | "viral_launch"
  | "headcount_freeze"
  | "supply_chain_deal"
  | "green_initiative";

export interface ComponentsState {
  chip: number;
  battery: number;
  display: number;
  memory: number;
}

export type CEOBackgroundType = "visionary" | "marketer" | "operator";

export interface CEOBackground {
  type: CEOBackgroundType;
  productionCostModifier: number;
  ecotechModifier: number;
  ecotechCostModifier: number;     // v4.0: × EcoTech upgrade costs
  brandLoyalistBonus: number;
  eWastePenaltyReduction: number;
  priceCeilingModifier: number;
}

// v4.0: Hype Campaign state
export interface HypeCampaignState {
  active: boolean;
  deadline: number;
  techLevelAtLaunch: number;
  componentTotalAtLaunch: number;
  fulfilled: boolean;
}

export interface PlayerMetrics {
  capital: number;
  morale: number;
  techLevel: number;
  marketShare: number;
  intelPoints: number;
  brandPerception: number;
  ecotech: number;
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
  techLevel: number;
  brandPerception: number;
  ecotech: number;
  components: ComponentsState;
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
  totalLoansEver: number;
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

export interface AntitrustState {
  playerHighShareStreak: number;
  playerBlocked: boolean;
  playerBlockedQuartersLeft: number;
}

export interface CapitalHistoryEntry {
  quarter: number;
  playerCapital: number;
  botCapital: number;
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
  type: "supply" | "regulation" | "market" | "tech" | "research";
  en: EventLocale;
  th: EventLocale;
  choices: EventChoice[];
}

export interface EventChoice {
  id: string;
  effect: Partial<PlayerMetrics> & {
    intelBonus?: number;
    ecotechBonus?: number;
  };
  en: ChoiceLocale;
  th: ChoiceLocale;
}

export interface IntelAlert {
  id: string;
  message: string;
  timestamp: number;
  type: "price" | "production" | "strategy" | "bot_event";
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
  brandChange: number;
  ecotechEarned: number;
  eWastePenalty: number;
  eWasteUnits: number;
  debtRepayment: number;
  techGrowth: number;
  effectiveUnitCost: number;
  playerCapacity: number;
  playerRawDemand: number;
  demandFactor: number;
  segmentBudget: number;
  segmentTech: number;
  segmentBrand: number;
  batteryPenaltyApplied: boolean;
  botEventLabel: string | null;
  summaryKey: string;
  // v4.0
  darkTacticsCaught: boolean;
  darkTacticsLabel: string | null;
  tradeBanApplied: boolean;
  prDisasterApplied: boolean;
  hypeFulfilled: boolean;
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
