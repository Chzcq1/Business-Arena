// ===== SILICON EMPIRE v5 — Game Store =====
// v5.0: Data extracted to src/game-data/, Black Market + Action Cards + Time-Freeze Events

import { create } from "zustand";
import type {
  GamePhase, GameResult, PlayerMetrics, PlayerDraft, BotState,
  Executives, Upgrades, LoanState, BiddingWar, SabotageState,
  AntitrustState, ComponentsState, BoardDirective, QuarterEvent,
  IntelAlert, ResolutionResult, MarketIntel, BotScheduledAction,
  CapitalHistoryEntry, CEOBackgroundType, CEOBackground,
  BotPersonaType, HypeCampaignState, ActiveCardEffects,
} from "./types";
import { INIT_ACTIVE_EFFECTS, INIT_CEO_SKILL } from "./types";
import type { CEOActiveSkill, CEOSkillEffectType } from "./types";

// v5.0: All game data lives in src/game-data/ — easy to edit, no coding required
import { EVENTS, BOT_POSITIVE_EVENTS, BOT_NEGATIVE_EVENTS, TIME_FREEZE_EVENTS } from "@/game-data/eventsData";
import type { TimeFreezeEventData } from "@/game-data/eventsData";
import { pickDirectives } from "@/game-data/directivesData";
import { CEO_BACKGROUNDS } from "@/game-data/ceoClasses";
import { PERSONA_TYPES, BOT_PERSONA_META } from "@/game-data/botPersonas";
import { ACTION_CARDS, BLACK_MARKET_CARD_COUNT, MAX_EQUIPPED_CARDS } from "@/game-data/actionCards";
import type { ActionCard, EquippedCard } from "@/game-data/actionCards";

// ===== CONSTANTS =====
const QUARTER_DURATION = 60;
const MAX_QUARTERS = 16;
const INSTANT_WIN_CAPITAL = 1_000_000_000;
const BASE_UNIT_COST = 200;
const TOTAL_MARKET = 5_000_000;

// Component upgrade costs stay here — tightly coupled to resolution engine
const COMPONENT_UPGRADE_COSTS: Record<keyof ComponentsState, number[]> = {
  chip:    [0, 0, 3, 5, 8, 12],
  battery: [0, 0, 2, 4, 6, 9],
  display: [0, 0, 3, 5, 8, 11],
  memory:  [0, 0, 2, 3, 5, 8],
};

// ===== HELPERS =====
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function generateMarketIntel(player: PlayerMetrics): MarketIntel {
  const trends = ["rising", "stable", "falling"] as const;
  const activities = ["aggressive", "passive", "unknown"] as const;
  const hintKeys = ["hints.h1", "hints.h2", "hints.h3", "hints.h4", "hints.h5"];
  const botHintKeys = ["hints.b1", "hints.b2", "hints.b3", "hints.b4"];
  return {
    demandTrend: pickRandom([...trends]),
    competitorActivity: pickRandom([...activities]),
    hintKey: pickRandom(hintKeys),
    botHintKey: player.intelPoints > 0 ? pickRandom(botHintKeys) : null,
  };
}

// v5.0: Bot schedule uses persona behavior from botPersonas.ts config
function generateBotSchedule(
  bot: BotState,
  quarter: number,
  persona: BotPersonaType | null,
  playerPrice: number,
): BotScheduledAction[] {
  const actions: BotScheduledAction[] = [];
  const aggression = Math.min(0.3 + quarter * 0.04, 0.85);
  const behavior = persona ? BOT_PERSONA_META[persona]?.behavior : null;

  if (Math.random() < 0.8) {
    let targetPrice: number;
    if (behavior?.priceBehavior === "undercut" && behavior.priceUndercutRange) {
      const [min, max] = behavior.priceUndercutRange;
      const discount = min + Math.random() * (max - min);
      targetPrice = Math.floor(playerPrice * (1 - discount));
    } else if (behavior?.priceBehavior === "premium" && behavior.pricePremiumRange) {
      const [min, max] = behavior.pricePremiumRange;
      const premium = min + Math.random() * (max - min);
      targetPrice = Math.floor(Math.max(bot.price, playerPrice) * (1 + premium));
    } else if (behavior?.priceBehavior === "mirror" && behavior.priceMirrorNoise !== undefined) {
      const noise = Math.floor(Math.random() * (behavior.priceMirrorNoise * 2 + 1)) - behavior.priceMirrorNoise;
      targetPrice = playerPrice + noise;
    } else {
      const delta = (Math.random() < aggression ? -1 : 1) * (Math.floor(Math.random() * 6) + 2) * 10;
      targetPrice = bot.price + delta;
    }
    const clampedTarget = clamp(targetPrice, 299, 2500);
    const diff = clampedTarget - bot.price;
    actions.push({
      triggerAtSecond: Math.floor(Math.random() * 25) + 20,
      executed: false,
      label: diff < 0 ? `Bot cut price by $${Math.abs(diff)}!` : `Bot raised price $${Math.abs(diff)}`,
      type: "price",
      delta: { price: clampedTarget },
    });
  }

  if (Math.random() < 0.7) {
    const [prodMin, prodMax] = behavior?.prodChangeRange ?? [1, 3];
    const incChance = behavior?.prodIncreaseChance ?? 0.55;
    const dir = Math.random() < incChance ? 1 : -1;
    const prodShift = dir * Math.floor(Math.random() * (prodMax - prodMin) + prodMin) * 1_000_000;
    actions.push({
      triggerAtSecond: Math.floor(Math.random() * 20) + 5,
      executed: false,
      label: prodShift > 0 ? "Bot ramped up production!" : "Bot trimmed production budget.",
      type: "production",
      delta: { productionBudget: clamp(bot.productionBudget + prodShift, 1_000_000, 20_000_000) },
    });
  }

  return actions.sort((a, b) => a.triggerAtSecond - b.triggerAtSecond);
}

// ===== v6.0 CONSTANTS =====
const CFO_SALARY_PER_QUARTER = 5_000_000;
const COO_SALARY_PER_QUARTER = 3_000_000;

// ===== RESOLUTION ENGINE v6.0 =====
function resolveQuarter(
  player: PlayerMetrics,
  draft: PlayerDraft,
  bot: BotState,
  executives: Executives,
  upgrades: Upgrades,
  loans: LoanState,
  sabotage: SabotageState,
  components: ComponentsState,
  boardDirective: BoardDirective | null,
  quarter: number,
  ceoBackground: CEOBackground,
  hypeCampaignActive: boolean,
  tradeBanActive: boolean,
  prDisasterActive: boolean,
  cardEffects: ActiveCardEffects = INIT_ACTIVE_EFFECTS,
): Omit<ResolutionResult, "botEventLabel" | "darkTacticsCaught" | "darkTacticsLabel" | "tradeBanApplied" | "prDisasterApplied" | "hypeFulfilled"> {

  const factoryDiscount = upgrades.componentFactory ? 0.75 : 1.0;
  const memoryDiscount = [1.0, 1.0, 1.0, 0.97, 0.95, 0.93][clamp(components.memory, 0, 5)];
  const baseCost = BASE_UNIT_COST * factoryDiscount * memoryDiscount * ceoBackground.productionCostModifier;

  const prodRatio = draft.productionBudget / 10_000_000;
  let costMultiplier = 1 + Math.pow(prodRatio, 2) * 0.4;
  if (executives.coo) costMultiplier = Math.min(costMultiplier, 1.5);
  if (boardDirective === "aggressive_rd")      costMultiplier *= 1.10;
  if (boardDirective === "cost_cutting")       costMultiplier *= 0.85;
  if (boardDirective === "supply_chain_deal")  costMultiplier *= 0.85;
  // v6.0: Operator Emergency Cut active skill — reduce unit cost by 20% this quarter
  const emergencyCutMod = (draft as PlayerDraft & { _emergencyCutCostMod?: number })._emergencyCutCostMod ?? 1.0;
  const effectiveUnitCost = Math.round(baseCost * costMultiplier * emergencyCutMod);

  // Player capacity
  let playerCapacity = Math.floor(draft.productionBudget * 0.8 / effectiveUnitCost);
  if (tradeBanActive) playerCapacity = 0;

  // Bot capacity (v5.0: reduced by action card botCapacityMult)
  const botBaseCost = bot.hasFactory ? BASE_UNIT_COST * 0.75 : BASE_UNIT_COST;
  const botCapacityRaw = Math.floor(bot.productionBudget * 0.8 / botBaseCost);
  const botCapacityWithCards = Math.floor(botCapacityRaw * cardEffects.botCapacityMult);
  const botCapacity = sabotage.ddosPending ? Math.floor(botCapacityWithCards * 0.70) : botCapacityWithCards;

  const BUDGET_SEG = TOTAL_MARKET * 0.40;
  const TECH_SEG   = TOTAL_MARKET * 0.30;
  const BRAND_SEG  = TOTAL_MARKET * 0.30;

  const budgetShare = clamp(0.5 + (bot.price - draft.price) / 300, 0.05, 0.95);

  // Tech share (v5.0: playerTechBonus from cards)
  const espionageTechBonus = boardDirective === "industrial_espionage" ? 2 : 0;
  const chipMultiplier = [1.0, 1.0, 1.12, 1.25, 1.40, 1.60][clamp(components.chip, 0, 5)];
  const effectiveTech = player.techLevel + cardEffects.playerTechBonus;
  const rawTechShare = 0.5 + (effectiveTech + espionageTechBonus - (bot.techLevel + (bot.components?.chip ?? 1) * 0.2)) * 0.10;
  const techShare = clamp(rawTechShare * chipMultiplier, 0.05, 0.97);

  // Brand share (v5.0: botBrandDelta reduces bot brand)
  const displayBrandBonus = components.display >= 5 ? 1.20 : components.display >= 4 ? 1.10 : 1.0;
  const effectiveBotBrand = bot.brandPerception + cardEffects.botBrandDelta;
  const brandShare = clamp(
    (0.5 + (player.brandPerception - effectiveBotBrand) * 0.008) * displayBrandBonus * ceoBackground.brandLoyalistBonus,
    0.05, 0.95
  );

  const displayCeilingMult = [1.0, 1.0, 1.15, 1.35, 1.60, 2.00][clamp(components.display, 0, 5)];
  let maxViablePrice = player.techLevel * 200 * displayCeilingMult * ceoBackground.priceCeilingModifier;
  if (boardDirective === "premium_focus") maxViablePrice *= 1.15;

  let demandFactor = 1.0;
  if (draft.price > maxViablePrice) {
    demandFactor = Math.max(0.02, 1 - (draft.price - maxViablePrice) / 700);
  }

  const batteryPenaltyApplied = quarter >= 3 && components.battery < 2;
  let revenueMultiplier = batteryPenaltyApplied ? 0.80 : 1.0;
  if (boardDirective === "flash_sale") revenueMultiplier *= 0.80;

  const memBudgetBonus = [1.0, 1.0, 1.06, 1.12, 1.18, 1.25][clamp(components.memory, 0, 5)];
  const batteryBudgetBonus = components.battery >= 4 ? 1.08 : 1.0;

  // Demand multipliers (v5.0: playerDemandMult from cards applied last)
  let demandMult = 1.0;
  if (boardDirective === "market_expansion")     demandMult = 1.12;
  if (boardDirective === "planned_obsolescence") demandMult = 1.30;
  if (boardDirective === "flash_sale")           demandMult = 1.25;
  if (boardDirective === "viral_launch")         demandMult *= 1.10;
  if (prDisasterActive)   demandMult *= 0.50;
  if (hypeCampaignActive) demandMult *= 1.40;
  demandMult *= cardEffects.playerDemandMult;

  const budgetVolumeMult  = boardDirective === "volume_play" ? 1.15 : 1.0;
  const techVolumePenalty = boardDirective === "volume_play" ? 0.95 : 1.0;

  const playerBudgetDemand = BUDGET_SEG * budgetShare * memBudgetBonus * batteryBudgetBonus * budgetVolumeMult * demandMult;
  const playerTechDemand   = TECH_SEG   * techShare   * demandFactor * techVolumePenalty * demandMult;
  const playerBrandDemand  = BRAND_SEG  * brandShare  * demandMult;
  const playerRawDemand    = tradeBanActive ? 0 : Math.floor(playerBudgetDemand + playerTechDemand + playerBrandDemand);

  const botBrandMod = sabotage.prPending ? 0.93 : 1.0;
  const botRawDemand = Math.floor(
    BUDGET_SEG * (1 - budgetShare) +
    TECH_SEG   * (1 - techShare) +
    BRAND_SEG  * (1 - brandShare) * botBrandMod
  );

  // v6.0: Hard Price Cap — defined FIRST before playerSales (fix TDZ bug)
  const priceRatio = bot.price > 0 ? draft.price / bot.price : 1;
  const hardPricePenaltyApplied = !tradeBanActive && priceRatio > 1.25;
  const brandBurnApplied = !tradeBanActive && priceRatio > 1.30;
  const finalPlayerRawDemand = hardPricePenaltyApplied
    ? Math.floor(playerRawDemand * 0.10)
    : playerRawDemand;

  const playerSales = Math.min(playerCapacity, finalPlayerRawDemand);
  const botSales    = Math.min(botCapacity, botRawDemand);

  const demandTotal = Math.max(finalPlayerRawDemand, 1);
  const segBudget = Math.floor(playerSales * (playerBudgetDemand / demandTotal));
  const segTech   = Math.floor(playerSales * (playerTechDemand   / demandTotal));
  const segBrand  = Math.max(0, playerSales - segBudget - segTech);

  const playerUnsold = Math.max(0, playerCapacity - finalPlayerRawDemand);
  // v6.0: CFO nerf — cap E-Waste reduction to 15% (was 30%). 2× fine multiplier (was 1.5×)
  const cfoEWaste = executives.cfo ? 0.85 : 1.0;
  const eWastePenalty = Math.floor(playerUnsold * effectiveUnitCost * 3.0 * ceoBackground.eWastePenaltyReduction * cfoEWaste);

  const playerRevenue = Math.floor(playerSales * draft.price * revenueMultiplier);
  const playerVariableCost = playerSales * effectiveUnitCost;
  let playerFixedCost = draft.productionBudget * 0.2;
  if (boardDirective === "austerity")        playerFixedCost *= 0.85;
  if (boardDirective === "headcount_freeze") playerFixedCost *= 0.75;
  const grossProfit = playerRevenue - playerVariableCost - playerFixedCost;
  const playerProfit = grossProfit - eWastePenalty;

  const directiveCost = boardDirective === "brand_campaign"    ? 5_000_000
    : boardDirective === "talent_retention" ? 3_000_000
    : boardDirective === "viral_launch"     ? 8_000_000 : 0;

  const debtRepayment = loans.quartersRemaining > 0 ? loans.repaymentPerQuarter : 0;
  // v6.0: Staff salaries deducted every quarter
  const staffSalaryDeducted = (executives.cfo ? CFO_SALARY_PER_QUARTER : 0) + (executives.coo ? COO_SALARY_PER_QUARTER : 0);
  const capitalChange = playerProfit - debtRepayment - directiveCost - staffSalaryDeducted;

  const botRevenue = botSales * bot.price;
  const botCost    = botSales * botBaseCost + bot.productionBudget * 0.2;
  const botProfit  = botRevenue - botCost;

  const newPlayerShare = (playerSales + botSales) > 0
    ? (playerSales / (playerSales + botSales)) * 100
    : player.marketShare;

  const techGrowth = upgrades.legendaryEngineer ? 2 : boardDirective === "aggressive_rd" ? 1 : 0;

  let brandChange = playerSales > botSales ? 4 : playerSales < botSales ? -3 : 0;
  if (boardDirective === "brand_campaign") brandChange += 15;
  if (boardDirective === "cost_cutting")   brandChange -= 5;
  if (boardDirective === "viral_launch")   brandChange += 20;
  if (components.battery >= 3) brandChange += 3;
  // v6.0: Brand Burn — price gouging destroys brand trust
  if (brandBurnApplied) brandChange -= 30;

  let moraleChange = playerSales > botSales * 1.1 ? 8 : playerSales < botSales * 0.9 ? -8 : 0;
  if (boardDirective === "austerity")        moraleChange -= 5;
  if (boardDirective === "talent_retention") moraleChange += 10;
  if (boardDirective === "headcount_freeze") moraleChange -= 10;

  let ecotechEarned = 2;
  if (upgrades.legendaryEngineer) ecotechEarned += 2;
  if (components.chip >= 4) ecotechEarned += 1;
  if (boardDirective === "aggressive_rd")    ecotechEarned += 3;
  if (boardDirective === "green_initiative") ecotechEarned += 3;
  ecotechEarned = Math.round(ecotechEarned * ceoBackground.ecotechModifier);

  let summaryKey = "summaries.default";
  if (tradeBanActive)                                                summaryKey = "summaries.espionage_banned";
  else if (prDisasterActive)                                         summaryKey = "summaries.hype_disaster";
  else if (batteryPenaltyApplied)                                    summaryKey = "summaries.battery_penalty";
  else if (demandFactor < 0.3)                                       summaryKey = "summaries.elasticity";
  else if (eWastePenalty > 0 && eWastePenalty > playerRevenue * 0.20) summaryKey = "summaries.ewaste";
  else if (playerSales > botSales * 1.35)                            summaryKey = "summaries.dominant";
  else if (playerSales < botSales * 0.65)                            summaryKey = "summaries.rough";
  else if (capitalChange < 0)                                        summaryKey = "summaries.burning";
  else if (playerSales > botSales && capitalChange > 2_000_000)      summaryKey = "summaries.strong";
  else                                                               summaryKey = "summaries.neckAndNeck";

  return {
    playerSalesUnits: playerSales, botSalesUnits: botSales,
    playerRevenue, botRevenue, grossProfit, playerProfit, botProfit,
    newPlayerMarketShare: clamp(newPlayerShare, 3, 97),
    newBotMarketShare: clamp(100 - newPlayerShare, 3, 97),
    capitalChange, moraleChange, brandChange, ecotechEarned,
    eWastePenalty, eWasteUnits: playerUnsold, debtRepayment, techGrowth,
    effectiveUnitCost, playerCapacity, playerRawDemand: finalPlayerRawDemand, demandFactor,
    segmentBudget: segBudget, segmentTech: segTech, segmentBrand: segBrand,
    batteryPenaltyApplied, summaryKey,
    staffSalaryDeducted, hardPricePenaltyApplied, brandBurnApplied,
  };
}

// ===== INITIAL STATE =====
const INIT_COMPONENTS: ComponentsState = { chip: 1, battery: 1, display: 1, memory: 1 };
const INIT_PLAYER: PlayerMetrics = {
  capital: 50_000_000, morale: 65, techLevel: 3,
  marketShare: 45, intelPoints: 3, brandPerception: 50, ecotech: 5,
};
const INIT_DRAFT: PlayerDraft = { price: 699, productionBudget: 5_000_000, intelAllocation: 0 };
const INIT_BOT: BotState = {
  price: 749, productionBudget: 4_000_000, capital: 50_000_000,
  marketShare: 55, techLevel: 3, brandPerception: 50, ecotech: 0,
  components: { ...INIT_COMPONENTS },
  lastMoveLabel: null, lastMoveTime: null, hasFactory: false,
};
const INIT_LOANS: LoanState = { outstanding: 0, quartersRemaining: 0, repaymentPerQuarter: 0, totalLoansEver: 0 };
const INIT_ANTITRUST: AntitrustState = { playerHighShareStreak: 0, playerBlocked: false, playerBlockedQuartersLeft: 0 };

// ===== GAME STATE INTERFACE =====
interface GameState {
  phase: GamePhase;
  quarter: number;
  gameResult: GameResult;
  language: "en" | "th";

  player: PlayerMetrics;
  draft: PlayerDraft;
  ceoBackground: CEOBackground | null;
  botPersona: BotPersonaType | null;
  bot: BotState;

  quarterTimer: number;
  timerRunning: boolean;
  timerPaused: boolean;            // v5.0: true during time-freeze event
  pendingTimeFreezeAt: number | null; // v5.0: elapsed seconds when freeze triggers
  playerReady: boolean;
  botLocked: boolean;
  botLockTime: number;

  currentEvent: QuarterEvent | null;
  marketIntel: MarketIntel | null;
  intelAlerts: IntelAlert[];
  midQuarterEventKey: string | null;
  botSchedule: BotScheduledAction[];

  executives: Executives;
  upgrades: Upgrades;
  loans: LoanState;
  biddingWar: BiddingWar | null;
  sabotage: SabotageState;

  components: ComponentsState;
  boardDirective: BoardDirective | null;
  pendingDirectives: BoardDirective[];
  antitrust: AntitrustState;
  capitalHistory: CapitalHistoryEntry[];
  lastResolution: ResolutionResult | null;

  // v4.0
  hypeCampaign: HypeCampaignState | null;
  tradeBanActive: boolean;
  prDisasterActive: boolean;

  // v5.0 Black Market & Action Cards
  blackMarketCards: ActionCard[];
  equippedCards: EquippedCard[];
  activeCardEffects: ActiveCardEffects;

  // v5.0 Time-Freeze Events
  timeFreezeEvent: TimeFreezeEventData | null;

  // v6.0 CEO Active Skill
  ceoActiveSkill: CEOActiveSkill;

  // ===== ACTIONS =====
  startGame: () => void;
  selectCEOBackground: (type: CEOBackgroundType) => void;
  useCEOSkill: () => void;
  advanceToBoardMeeting: () => void;
  chooseBoardDirective: (d: BoardDirective) => void;
  buyActionCard: (cardId: string) => void;       // v5.0
  proceedFromBlackMarket: () => void;             // v5.0
  resolveEvent: (choiceId: string) => void;
  startActionPhase: () => void;
  tickTimer: () => void;
  updateDraft: (partial: Partial<PlayerDraft>) => void;
  addIntelAlert: (alert: Omit<IntelAlert, "id" | "timestamp">) => void;
  dismissIntelAlert: (id: string) => void;
  submitReady: () => void;
  lockAndResolve: () => void;
  nextQuarter: () => void;
  toggleLanguage: () => void;
  hireExecutive: (type: "cfo" | "coo") => void;
  purchaseUpgrade: (type: "componentFactory" | "legendaryEngineer") => void;
  takeOutLoan: () => void;
  acceptBiddingWar: () => void;
  withdrawBiddingWar: () => void;
  launchSabotage: (type: "ddos" | "pr") => void;
  upgradeComponent: (comp: keyof ComponentsState) => void;
  launchHypeCampaign: () => void;
  useActionCard: (cardId: string) => void;         // v5.0
  resolveTimeFreezeEvent: (choiceId: string) => void; // v5.0
  resetGame: () => void;
}

// ===== STORE =====
export const useGameStore = create<GameState>((set, get) => ({
  phase: "ceoselect",
  quarter: 1,
  gameResult: "playing",
  language: "en",

  player: { ...INIT_PLAYER },
  draft: { ...INIT_DRAFT },
  ceoBackground: null,
  botPersona: null,
  bot: { ...INIT_BOT },

  quarterTimer: QUARTER_DURATION,
  timerRunning: false,
  timerPaused: false,
  pendingTimeFreezeAt: null,
  playerReady: false,
  botLocked: false,
  botLockTime: 20,

  currentEvent: null,
  marketIntel: null,
  intelAlerts: [],
  midQuarterEventKey: null,
  botSchedule: [],

  executives: { cfo: false, coo: false },
  upgrades: { componentFactory: false, legendaryEngineer: false },
  loans: { ...INIT_LOANS },
  biddingWar: null,
  sabotage: { ddosPending: false, prPending: false, cooldown: false },

  components: { ...INIT_COMPONENTS },
  boardDirective: null,
  pendingDirectives: [],
  antitrust: { ...INIT_ANTITRUST },
  capitalHistory: [],
  lastResolution: null,

  hypeCampaign: null,
  tradeBanActive: false,
  prDisasterActive: false,

  blackMarketCards: [],
  equippedCards: [],
  activeCardEffects: { ...INIT_ACTIVE_EFFECTS },
  timeFreezeEvent: null,
  ceoActiveSkill: { ...INIT_CEO_SKILL },

  // ===== ACTIONS =====

  startGame: () => {},

  selectCEOBackground: (type) => {
    const ceoBackground = CEO_BACKGROUNDS[type];
    const botPersona = PERSONA_TYPES[Math.floor(Math.random() * PERSONA_TYPES.length)];
    const intel = generateMarketIntel(INIT_PLAYER);
    set({
      ceoBackground, botPersona, phase: "intel",
      quarter: 1, gameResult: "playing", marketIntel: intel,
      capitalHistory: [{ quarter: 0, playerCapital: INIT_PLAYER.capital, botCapital: INIT_BOT.capital }],
      player: { ...INIT_PLAYER }, draft: { ...INIT_DRAFT }, bot: { ...INIT_BOT },
      components: { ...INIT_COMPONENTS },
      executives: { cfo: false, coo: false },
      upgrades: { componentFactory: false, legendaryEngineer: false },
      loans: { ...INIT_LOANS }, antitrust: { ...INIT_ANTITRUST },
      hypeCampaign: null, tradeBanActive: false, prDisasterActive: false,
      boardDirective: null, lastResolution: null,
      blackMarketCards: [], equippedCards: [],
      activeCardEffects: { ...INIT_ACTIVE_EFFECTS },
      timeFreezeEvent: null, timerPaused: false, pendingTimeFreezeAt: null,
    });
  },

  advanceToBoardMeeting: () => {
    set({ phase: "boardmeeting", pendingDirectives: pickDirectives() });
  },

  // v5.0: After selecting a directive, go to Black Market (not event)
  chooseBoardDirective: (d) => {
    const shopCards = [...ACTION_CARDS]
      .sort(() => Math.random() - 0.5)
      .slice(0, BLACK_MARKET_CARD_COUNT);
    set({
      boardDirective: d,
      phase: "blackmarket",
      blackMarketCards: shopCards,
      equippedCards: [],
      activeCardEffects: { ...INIT_ACTIVE_EFFECTS },
    });
  },

  // v5.0: Buy a card from the Black Market (up to MAX_EQUIPPED_CARDS)
  buyActionCard: (cardId) => {
    const { player, blackMarketCards, equippedCards } = get();
    if (equippedCards.length >= MAX_EQUIPPED_CARDS) return;
    const card = blackMarketCards.find((c) => c.id === cardId);
    if (!card) return;
    if (player.capital < card.cost) return;
    if (equippedCards.find((c) => c.id === cardId)) return;
    const newCard: EquippedCard = { ...card, usedAt: null };
    set({
      player: { ...player, capital: player.capital - card.cost },
      equippedCards: [...equippedCards, newCard],
    });
  },

  // v5.0: Leave the Black Market and proceed to Event phase
  proceedFromBlackMarket: () => {
    const event = pickRandom(EVENTS);
    set({ phase: "event", currentEvent: event });
  },

  resolveEvent: (choiceId) => {
    const { currentEvent, player } = get();
    if (!currentEvent) return;
    const choice = currentEvent.choices.find((c) => c.id === choiceId);
    if (!choice) return;
    const e = choice.effect;
    set({
      player: {
        ...player,
        capital:         clamp(player.capital + (e.capital || 0), 0, Infinity),
        morale:          clamp(player.morale + (e.morale || 0), 0, 100),
        techLevel:       clamp(player.techLevel + (e.techLevel || 0), 1, 10),
        marketShare:     clamp(player.marketShare + (e.marketShare || 0), 0, 100),
        intelPoints:     clamp(player.intelPoints + (e.intelBonus || 0), 0, 20),
        brandPerception: clamp(player.brandPerception, 0, 100),
        ecotech:         clamp(player.ecotech + (e.ecotechBonus || 0), 0, 99),
      },
      currentEvent: null,
    });
  },

  // v5.0: Set pendingTimeFreezeAt (70% chance) to surprise the player mid-phase
  startActionPhase: () => {
    const { bot, quarter, botPersona, draft } = get();
    const schedule = generateBotSchedule(bot, quarter, botPersona, draft.price);
    const midKey = Math.random() < 0.55
      ? `mid_events.m${Math.floor(Math.random() * 7) + 1}`
      : null;
    const botLockTime = Math.floor(Math.random() * 16) + 15;
    const pendingTimeFreezeAt = Math.random() < 0.70
      ? Math.floor(Math.random() * 28) + 12   // triggers 12-40 seconds in
      : null;
    const { ceoActiveSkill } = get();
    set({
      phase: "action",
      quarterTimer: QUARTER_DURATION,
      timerRunning: true,
      timerPaused: false,
      botSchedule: schedule,
      midQuarterEventKey: midKey,
      intelAlerts: [],
      playerReady: false,
      botLocked: false,
      botLockTime,
      pendingTimeFreezeAt,
      bot: { ...bot, lastMoveLabel: null, lastMoveTime: null },
      // v6.0: reset per-quarter skill usage flag
      ceoActiveSkill: { ...ceoActiveSkill, usedThisQuarter: false, effectType: null },
    });
  },

  // v6.0: CEO Active Skill — 3 charges per game
  useCEOSkill: () => {
    const { ceoBackground, ceoActiveSkill, quarter, timerRunning, timerPaused } = get();
    if (!ceoBackground) return;
    if (ceoActiveSkill.chargesLeft <= 0) return;
    if (ceoActiveSkill.usedThisQuarter) return;
    if (!timerRunning || timerPaused) return;

    let effectType: CEOSkillEffectType;
    if (ceoBackground.type === "visionary") effectType = "tech_surge";
    else if (ceoBackground.type === "marketer") effectType = "flash_pr";
    else effectType = "emergency_cut";

    set((state) => ({
      ceoActiveSkill: {
        chargesLeft: state.ceoActiveSkill.chargesLeft - 1,
        usedThisQuarter: true,
        effectType,
      },
      // Immediate brand boost for Marketer
      player: ceoBackground.type === "marketer"
        ? { ...state.player, brandPerception: Math.min(100, state.player.brandPerception + 8) }
        : state.player,
    }));
  },

  // v5.0: Handles time-freeze pause + botFrozenSecondsLeft countdown
  tickTimer: () => {
    const state = get();
    if (!state.timerRunning || state.phase !== "action") return;
    if (state.timerPaused) return; // PAUSED — don't tick

    const newTimer = state.quarterTimer - 1;
    if (newTimer <= 0) {
      set({ quarterTimer: 0, timerRunning: false, playerReady: false, botLocked: false });
      get().lockAndResolve();
      return;
    }

    const elapsed = QUARTER_DURATION - newTimer;

    // v5.0: Trigger time-freeze event
    if (state.pendingTimeFreezeAt !== null && elapsed >= state.pendingTimeFreezeAt) {
      const freezeEvent = pickRandom(TIME_FREEZE_EVENTS);
      set({
        quarterTimer: newTimer,
        timerPaused: true,
        timeFreezeEvent: freezeEvent,
        pendingTimeFreezeAt: null,
      });
      return;
    }

    // v5.0: Decrement bot freeze visual countdown
    let newEffects = state.activeCardEffects;
    if (newEffects.botFrozenSecondsLeft > 0) {
      newEffects = { ...newEffects, botFrozenSecondsLeft: newEffects.botFrozenSecondsLeft - 1 };
    }

    let newBotLocked = state.botLocked;
    if (!state.botLocked && elapsed >= state.botLockTime) {
      newBotLocked = true;
      if (state.playerReady) {
        set({ quarterTimer: 0, timerRunning: false, playerReady: false, botLocked: false });
        get().lockAndResolve();
        return;
      }
    }

    // v5.0: Skip bot actions while frozen
    const isBotFrozen = newEffects.botFrozenSecondsLeft > 0;
    const pendingActions = isBotFrozen
      ? []
      : state.botSchedule.filter((a) => !a.executed && a.triggerAtSecond <= elapsed);
    let newBot = { ...state.bot };
    let newSchedule = [...state.botSchedule];
    const newAlerts: IntelAlert[] = [];

    for (const action of pendingActions) {
      newBot = { ...newBot, ...action.delta, lastMoveLabel: action.label, lastMoveTime: elapsed };
      newSchedule = newSchedule.map((a) =>
        a.triggerAtSecond === action.triggerAtSecond ? { ...a, executed: true } : a
      );
      if (state.draft.intelAllocation > 0) {
        const fuzzedPrice = action.type === "price"
          ? `~$${Math.round((newBot.price + (Math.random() - 0.5) * 100) / 10) * 10}–$${Math.round((newBot.price + (Math.random() + 0.5) * 100) / 10) * 10}`
          : "";
        const msg = action.type === "price"
          ? `INTEL: Bot adjusted pricing (est. ${fuzzedPrice})`
          : `INTEL: ${action.label}`;
        newAlerts.push({
          id: `alert-${Date.now()}-${action.triggerAtSecond}`,
          message: msg, timestamp: Date.now(), type: action.type,
        });
      }
    }

    set({
      quarterTimer: newTimer,
      bot: newBot,
      botSchedule: newSchedule,
      botLocked: newBotLocked,
      activeCardEffects: newEffects,
      intelAlerts: [...state.intelAlerts, ...newAlerts].slice(-6),
    });
  },

  // v5.0: Activate an equipped card during the 60-second phase
  useActionCard: (cardId) => {
    const state = get();
    if (state.phase !== "action") return;
    const card = state.equippedCards.find((c) => c.id === cardId);
    if (!card || card.usedAt !== null) return;
    const e = card.effect;
    const cur = state.activeCardEffects;
    const newEffects: ActiveCardEffects = {
      botCapacityMult:      cur.botCapacityMult * (e.botCapacityMult ?? 1.0),
      botBrandDelta:        cur.botBrandDelta + (e.botBrandDelta ?? 0),
      playerDemandMult:     cur.playerDemandMult * (e.playerDemandMult ?? 1.0),
      playerTechBonus:      cur.playerTechBonus + (e.playerTechBonus ?? 0),
      playerBrandBonus:     cur.playerBrandBonus + (e.playerBrandBonus ?? 0),
      revealBotExact:       cur.revealBotExact || (e.revealBotExact ?? false),
      botFrozenSecondsLeft: cur.botFrozenSecondsLeft + (e.botFreezeSeconds ?? 0),
      cyberShield:          cur.cyberShield || (e.cyberShield ?? false),
    };
    const newEquipped = state.equippedCards.map((c) =>
      c.id === cardId ? { ...c, usedAt: state.quarterTimer } : c
    );
    set({ equippedCards: newEquipped, activeCardEffects: newEffects });
  },

  // v5.0: Resolve a time-freeze mini-event, apply its effect, resume timer
  resolveTimeFreezeEvent: (choiceId) => {
    const state = get();
    if (!state.timeFreezeEvent) return;
    const choice = state.timeFreezeEvent.choices.find((c) => c.id === choiceId);
    if (!choice) return;
    const e = choice.effect;
    const newEffects = { ...state.activeCardEffects };
    if (e.playerDemandMult) newEffects.playerDemandMult *= e.playerDemandMult;
    set({
      player: {
        ...state.player,
        capital:         clamp(state.player.capital + (e.capital || 0), 0, Infinity),
        techLevel:       clamp(state.player.techLevel + (e.techLevel || 0), 1, 10),
        morale:          clamp(state.player.morale + (e.morale || 0), 0, 100),
        brandPerception: clamp(state.player.brandPerception + (e.brandPerception || 0), 0, 100),
      },
      activeCardEffects: newEffects,
      timeFreezeEvent: null,
      timerPaused: false,
    });
  },

  updateDraft: (partial) => set((s) => ({ draft: { ...s.draft, ...partial } })),

  addIntelAlert: (alert) => set((s) => ({
    intelAlerts: [...s.intelAlerts, { ...alert, id: `a-${Date.now()}`, timestamp: Date.now() }].slice(-6),
  })),

  dismissIntelAlert: (id) => set((s) => ({ intelAlerts: s.intelAlerts.filter((a) => a.id !== id) })),

  submitReady: () => {
    const { botLocked } = get();
    set({ playerReady: true });
    if (botLocked) {
      set({ quarterTimer: 0, timerRunning: false, playerReady: false, botLocked: false });
      get().lockAndResolve();
    }
  },

  // ===== LOCK AND RESOLVE v5.0 =====
  lockAndResolve: () => {
    const {
      player, draft, bot, executives, upgrades, loans, sabotage,
      components, boardDirective, quarter, antitrust, capitalHistory,
      ceoBackground, hypeCampaign, tradeBanActive, prDisasterActive,
      botPersona, activeCardEffects, ceoActiveSkill,
    } = get();
    if (!ceoBackground) return;

    // v5.0: Cyber Shield blocks Trade Ban and PR Disaster
    const shielded = activeCardEffects.cyberShield;
    const effectiveTradeBan    = tradeBanActive && !shielded;
    const effectivePrDisaster  = prDisasterActive && !shielded;

    // v6.0: CEO Active Skill — apply effects this quarter
    let skillCardEffects = { ...activeCardEffects };
    if (ceoActiveSkill.usedThisQuarter && ceoActiveSkill.effectType) {
      if (ceoActiveSkill.effectType === "tech_surge") {
        skillCardEffects = { ...skillCardEffects, playerDemandMult: skillCardEffects.playerDemandMult * 1.20 };
      } else if (ceoActiveSkill.effectType === "flash_pr") {
        skillCardEffects = { ...skillCardEffects, playerDemandMult: skillCardEffects.playerDemandMult * 1.15 };
      } else if (ceoActiveSkill.effectType === "emergency_cut") {
        // cost reduction handled via a modified draft passed to resolveQuarter below
      }
    }
    const emergencyCutActive = ceoActiveSkill.usedThisQuarter && ceoActiveSkill.effectType === "emergency_cut";
    const resolvedDraft = emergencyCutActive
      ? { ...draft, _emergencyCutCostMod: 0.80 }
      : draft;

    const rawResult = resolveQuarter(
      player, draft, bot, executives, upgrades, loans, sabotage,
      components, boardDirective, quarter, ceoBackground,
      !!(hypeCampaign?.active && !hypeCampaign?.fulfilled),
      effectiveTradeBan, effectivePrDisaster, skillCardEffects,
    );

    // Bot Events
    let botEventLabel: string | null = null;
    let botCapitalDelta = 0;
    const roll = Math.random();
    if (roll < 0.25)       { const ev = pickRandom(BOT_POSITIVE_EVENTS); botEventLabel = ev.label; botCapitalDelta = ev.capitalDelta; }
    else if (roll < 0.42)  { const ev = pickRandom(BOT_NEGATIVE_EVENTS); botEventLabel = ev.label; botCapitalDelta = ev.capitalDelta; }

    // Bot Auto-Upgrade (uses persona config from botPersonas.ts)
    const personaMeta = botPersona ? BOT_PERSONA_META[botPersona] : null;
    const maxBotUpgrades = personaMeta?.behavior.maxUpgradesPerQuarter ?? 1;
    const techGrowthInterval = personaMeta?.behavior.techGrowthInterval ?? 4;

    const newBotEcotech = (bot.ecotech || 0) + 2 + Math.floor(bot.techLevel / 3);
    const botComponents = { ...bot.components };
    let spentEco = newBotEcotech;
    let botUpgradeCount = 0;
    for (const comp of ["chip", "display", "memory", "battery"] as (keyof ComponentsState)[]) {
      if (botUpgradeCount >= maxBotUpgrades) break;
      const lvl = botComponents[comp];
      if (lvl < 5) {
        const cost = COMPONENT_UPGRADE_COSTS[comp][lvl + 1] ?? 99;
        if (spentEco >= cost) {
          (botComponents as Record<string, number>)[comp] = lvl + 1;
          spentEco -= cost;
          botUpgradeCount++;
        }
      }
    }

    const botTechGrowth = quarter % techGrowthInterval === 0 ? 1 : 0;
    const newBotCapital = clamp(bot.capital + rawResult.botProfit + botCapitalDelta, 0, Infinity);
    const newBot: BotState = {
      ...bot,
      capital: newBotCapital,
      marketShare: rawResult.newBotMarketShare,
      components: botComponents,
      ecotech: spentEco,
      techLevel: Math.min(bot.techLevel + botTechGrowth, 10),
    };

    // Antitrust
    let newAntitrust = { ...antitrust };
    let antitrustFine = 0;
    if (rawResult.newPlayerMarketShare > 60) {
      newAntitrust.playerHighShareStreak++;
      if (newAntitrust.playerHighShareStreak >= 2 && !newAntitrust.playerBlocked) {
        antitrustFine = Math.floor(player.capital * 0.15);
        newAntitrust.playerBlocked = true;
        newAntitrust.playerBlockedQuartersLeft = 2;
      }
    } else {
      newAntitrust.playerHighShareStreak = 0;
    }
    if (newAntitrust.playerBlocked && newAntitrust.playerBlockedQuartersLeft > 0) {
      newAntitrust.playerBlockedQuartersLeft--;
      if (newAntitrust.playerBlockedQuartersLeft <= 0) newAntitrust.playerBlocked = false;
    }

    // Loan
    let newLoans = { ...loans };
    if (loans.quartersRemaining > 0) {
      newLoans.quartersRemaining--;
      newLoans.outstanding = Math.max(0, newLoans.outstanding - newLoans.repaymentPerQuarter);
    }

    // Player update (v5.0: playerBrandBonus from action cards)
    let newPlayer: PlayerMetrics = {
      capital:         clamp(player.capital + rawResult.capitalChange - antitrustFine, 0, Infinity),
      morale:          clamp(player.morale + rawResult.moraleChange, 0, 100),
      techLevel:       clamp(player.techLevel + rawResult.techGrowth, 1, 10),
      marketShare:     rawResult.newPlayerMarketShare,
      intelPoints:     clamp(player.intelPoints - draft.intelAllocation + 1, 0, 20),
      brandPerception: clamp(player.brandPerception + rawResult.brandChange + activeCardEffects.playerBrandBonus, 0, 100),
      ecotech:         player.ecotech + rawResult.ecotechEarned,
    };

    // Dark Tactics
    let newTradeBanActive = false;
    let newPrDisasterActive = false;
    let darkTacticsCaught = false;
    let darkTacticsLabel: string | null = null;

    if (boardDirective === "planned_obsolescence" && Math.random() < 0.15) {
      darkTacticsCaught = true;
      darkTacticsLabel = "summaries.planned_obs_caught";
      newPlayer = {
        ...newPlayer,
        capital:     clamp(newPlayer.capital - 10_000_000, 0, Infinity),
        marketShare: clamp(newPlayer.marketShare - 20, 0, 100),
        morale:      clamp(newPlayer.morale - 30, 0, 100),
      };
    }
    if (boardDirective === "industrial_espionage" && Math.random() < 0.20) {
      darkTacticsCaught = true;
      if (!shielded) newTradeBanActive = true;
      darkTacticsLabel = "summaries.espionage_banned";
    }
    if (effectivePrDisaster) {
      newPlayer = { ...newPlayer, capital: clamp(newPlayer.capital - 10_000_000, 0, Infinity) };
    }

    // Hype Campaign
    let newHypeCampaign: HypeCampaignState | null = hypeCampaign ? { ...hypeCampaign } : null;
    let hypeFulfilled = false;
    if (hypeCampaign?.active && !hypeCampaign.fulfilled) {
      const compTotal = components.chip + components.battery + components.display + components.memory;
      const techImproved = newPlayer.techLevel > hypeCampaign.techLevelAtLaunch
        || compTotal > hypeCampaign.componentTotalAtLaunch;
      if (techImproved) {
        newHypeCampaign = { ...hypeCampaign, fulfilled: true };
        hypeFulfilled = true;
      } else if (quarter >= hypeCampaign.deadline) {
        newPrDisasterActive = true;
        newHypeCampaign = null;
      }
    }

    // Green Initiative free battery
    let newComponents = { ...components };
    if (boardDirective === "green_initiative" && components.battery < 2) {
      newComponents = { ...newComponents, battery: 2 };
    }

    const newHistory = [
      ...capitalHistory,
      { quarter, playerCapital: newPlayer.capital, botCapital: newBotCapital },
    ];

    let finalSummaryKey = rawResult.summaryKey;
    if (antitrustFine > 0)        finalSummaryKey = "summaries.antitrust";
    else if (darkTacticsLabel)    finalSummaryKey = darkTacticsLabel;
    else if (hypeFulfilled)       finalSummaryKey = "summaries.hype_fulfilled";
    else if (effectivePrDisaster) finalSummaryKey = "summaries.hype_disaster";

    const finalResult: ResolutionResult = {
      ...rawResult,
      botEventLabel, summaryKey: finalSummaryKey,
      darkTacticsCaught, darkTacticsLabel,
      tradeBanApplied: effectiveTradeBan,
      prDisasterApplied: effectivePrDisaster,
      hypeFulfilled,
    };

    // v6.0: Bankruptcy check AFTER all deductions (e-waste fines + salaries + debt)
    let gameResult: GameResult = "playing";
    if (newPlayer.capital <= 0)                     gameResult = "bankrupt";
    else if (newPlayer.capital >= INSTANT_WIN_CAPITAL) gameResult = "won_instant";

    set({
      phase: "resolution",
      player: newPlayer, bot: newBot, loans: newLoans,
      antitrust: newAntitrust, capitalHistory: newHistory,
      lastResolution: finalResult, gameResult,
      components: newComponents,
      sabotage: { ...get().sabotage, ddosPending: false, prPending: false },
      tradeBanActive: newTradeBanActive,
      prDisasterActive: newPrDisasterActive,
      hypeCampaign: newHypeCampaign,
      // v5.0: Clear for next quarter
      equippedCards: [], activeCardEffects: { ...INIT_ACTIVE_EFFECTS },
      timeFreezeEvent: null, timerPaused: false, blackMarketCards: [],
    });
  },

  nextQuarter: () => {
    const { quarter, player, bot, gameResult } = get();
    if (gameResult !== "playing") { set({ phase: "gameover" }); return; }
    if (quarter >= MAX_QUARTERS) {
      const finalResult: GameResult = player.capital > bot.capital ? "won_timeout" : "won_timeout_lost";
      set({ phase: "gameover", gameResult: finalResult });
      return;
    }
    const intel = generateMarketIntel(player);
    set({
      phase: "intel",
      quarter: quarter + 1,
      marketIntel: intel,
      lastResolution: null,
      boardDirective: null,
      sabotage: { ddosPending: false, prPending: false, cooldown: false },
      equippedCards: [], activeCardEffects: { ...INIT_ACTIVE_EFFECTS },
      timeFreezeEvent: null, timerPaused: false,
      pendingTimeFreezeAt: null, blackMarketCards: [],
    });
  },

  toggleLanguage: () => set((s) => ({ language: s.language === "en" ? "th" : "en" })),

  hireExecutive: (type) => {
    const { player, executives, phase, antitrust } = get();
    if (phase === "action" || antitrust.playerBlocked || executives[type]) return;
    const cost = 40_000_000;
    if (player.capital < cost) return;
    set({ player: { ...player, capital: player.capital - cost }, executives: { ...executives, [type]: true } });
  },

  purchaseUpgrade: (type) => {
    const { player, upgrades, phase, antitrust } = get();
    if (phase === "action" || upgrades[type]) return;
    if (type === "componentFactory" && antitrust.playerBlocked) return;
    const costs: Record<string, number> = { componentFactory: 150_000_000, legendaryEngineer: 80_000_000 };
    const cost = costs[type];
    if (player.capital < cost) return;
    if (type === "legendaryEngineer" && Math.random() < 0.4) {
      set({ player: { ...player, capital: player.capital - cost }, biddingWar: { active: true, engineerSigned: null } });
      return;
    }
    set({ player: { ...player, capital: player.capital - cost }, upgrades: { ...upgrades, [type]: true } });
  },

  takeOutLoan: () => {
    const { player, loans, executives, phase } = get();
    if (phase === "action" || loans.quartersRemaining > 0 || loans.totalLoansEver >= 3) return;
    const repayment = executives.cfo ? 25_000_000 : 30_000_000;
    set({
      player: { ...player, capital: player.capital + 100_000_000 },
      loans: { outstanding: 100_000_000, quartersRemaining: 4, repaymentPerQuarter: repayment, totalLoansEver: loans.totalLoansEver + 1 },
    });
  },

  acceptBiddingWar: () => {
    const { player, upgrades } = get();
    if (player.capital < 20_000_000) {
      set({ biddingWar: { active: false, engineerSigned: false } });
      return;
    }
    set({
      player: { ...player, capital: player.capital - 20_000_000 },
      upgrades: { ...upgrades, legendaryEngineer: true },
      biddingWar: { active: false, engineerSigned: true },
    });
  },

  withdrawBiddingWar: () => {
    const { player } = get();
    set({ player: { ...player, capital: player.capital + 80_000_000 }, biddingWar: { active: false, engineerSigned: false } });
  },

  launchSabotage: (type) => {
    const { player, sabotage, phase, antitrust } = get();
    if (phase === "action" || sabotage.cooldown || antitrust.playerBlocked) return;
    if (type === "ddos") {
      if (player.capital < 10_000_000 || player.intelPoints < 3) return;
      set({ player: { ...player, capital: player.capital - 10_000_000, intelPoints: player.intelPoints - 3 }, sabotage: { ...sabotage, ddosPending: true, cooldown: true } });
    } else {
      if (player.capital < 5_000_000 || player.intelPoints < 2) return;
      set({ player: { ...player, capital: player.capital - 5_000_000, intelPoints: player.intelPoints - 2 }, sabotage: { ...sabotage, prPending: true, cooldown: true } });
    }
  },

  upgradeComponent: (comp) => {
    const { player, components, phase, ceoBackground } = get();
    if (phase === "action") return;
    const currentLevel = components[comp];
    if (currentLevel >= 5) return;
    const baseCost = COMPONENT_UPGRADE_COSTS[comp][currentLevel + 1];
    if (!baseCost) return;
    const costMod = ceoBackground?.ecotechCostModifier ?? 1.0;
    const actualCost = Math.ceil(baseCost * costMod);
    if (player.ecotech < actualCost) return;
    set({ components: { ...components, [comp]: currentLevel + 1 }, player: { ...player, ecotech: player.ecotech - actualCost } });
  },

  launchHypeCampaign: () => {
    const { player, quarter, components, hypeCampaign, phase } = get();
    if (phase !== "action") return;
    if (hypeCampaign?.active && !hypeCampaign.fulfilled) return;
    if (player.capital < 5_000_000) return;
    const compTotal = components.chip + components.battery + components.display + components.memory;
    set({
      player: { ...player, capital: player.capital - 5_000_000 },
      hypeCampaign: { active: true, deadline: quarter + 2, techLevelAtLaunch: player.techLevel, componentTotalAtLaunch: compTotal, fulfilled: false },
    });
  },

  resetGame: () => {
    set({
      phase: "ceoselect", quarter: 1, gameResult: "playing",
      player: { ...INIT_PLAYER }, draft: { ...INIT_DRAFT },
      ceoBackground: null, botPersona: null, bot: { ...INIT_BOT },
      quarterTimer: QUARTER_DURATION, timerRunning: false,
      timerPaused: false, pendingTimeFreezeAt: null,
      playerReady: false, botLocked: false, botLockTime: 20,
      currentEvent: null, marketIntel: generateMarketIntel(INIT_PLAYER),
      intelAlerts: [], midQuarterEventKey: null, botSchedule: [],
      executives: { cfo: false, coo: false },
      upgrades: { componentFactory: false, legendaryEngineer: false },
      loans: { ...INIT_LOANS }, biddingWar: null,
      sabotage: { ddosPending: false, prPending: false, cooldown: false },
      components: { ...INIT_COMPONENTS }, boardDirective: null,
      pendingDirectives: [], antitrust: { ...INIT_ANTITRUST },
      capitalHistory: [{ quarter: 0, playerCapital: INIT_PLAYER.capital, botCapital: INIT_BOT.capital }],
      lastResolution: null, hypeCampaign: null,
      tradeBanActive: false, prDisasterActive: false,
      blackMarketCards: [], equippedCards: [],
      activeCardEffects: { ...INIT_ACTIVE_EFFECTS },
      timeFreezeEvent: null,
      ceoActiveSkill: { ...INIT_CEO_SKILL },
    });
  },
}));

export { COMPONENT_UPGRADE_COSTS };
