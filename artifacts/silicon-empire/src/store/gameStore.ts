import { create } from "zustand";
import type {
  GamePhase,
  PlayerMetrics,
  PlayerDraft,
  BotState,
  QuarterEvent,
  IntelAlert,
  ResolutionResult,
  MarketIntel,
} from "./types";

const QUARTER_DURATION = 60;
const MAX_QUARTERS = 16;

const EVENTS: QuarterEvent[] = [
  {
    id: "supply_crunch",
    title: "Supply Chain Disruption",
    description: "A major chip supplier is facing shortages. Production costs will spike unless you act now.",
    type: "supply",
    choices: [
      { id: "stockpile", label: "Pre-buy Components (+$2M)", effect: { capital: -2000000, morale: 5 }, description: "Secure supply at current prices" },
      { id: "pivot", label: "Pivot to Alternative Supplier", effect: { techLevel: -1, morale: -5 }, description: "Slower chips, but stable supply" },
      { id: "wait", label: "Absorb the Impact", effect: { capital: -500000, morale: -10 }, description: "Hope the crisis resolves quickly" },
    ],
  },
  {
    id: "viral_buzz",
    title: "Viral Product Leak",
    description: "An unannounced feature leaked online and is trending. Consumer demand is surging.",
    type: "market",
    choices: [
      { id: "capitalize", label: "Launch Teaser Campaign (+Morale)", effect: { morale: 15, marketShare: 3 }, description: "Ride the hype wave" },
      { id: "deny", label: "Issue Official Denial", effect: { morale: -5, capital: -200000 }, description: "Protect the surprise factor" },
      { id: "ignore", label: "Ignore the Buzz", effect: { morale: 5 }, description: "Let the market speculate" },
    ],
  },
  {
    id: "regulation_warning",
    title: "New Data Privacy Regulation",
    description: "Government signals upcoming data privacy laws. Early compliance costs capital but avoids future fines.",
    type: "regulation",
    choices: [
      { id: "early_comply", label: "Comply Early (-$1.5M, +Morale)", effect: { capital: -1500000, morale: 20 }, description: "Lead with responsibility" },
      { id: "wait_watch", label: "Monitor the Situation", effect: { morale: -5 }, description: "Defer until law passes" },
      { id: "lobby", label: "Lobby Against It (-$800k)", effect: { capital: -800000, morale: -10 }, description: "Fight the regulation" },
    ],
  },
  {
    id: "tech_breakthrough",
    title: "R&D Breakthrough",
    description: "Your engineers have made an unexpected breakthrough in battery technology.",
    type: "tech",
    choices: [
      { id: "integrate", label: "Fast-Track Integration (-$2M)", effect: { capital: -2000000, techLevel: 2, morale: 15 }, description: "Push it to market immediately" },
      { id: "patent", label: "Patent & License Out (+$1M)", effect: { capital: 1000000, techLevel: 1, intelBonus: 2 }, description: "Monetize without full integration" },
      { id: "shelve", label: "Shelve for Later", effect: { morale: -5 }, description: "Wait for the right moment" },
    ],
  },
  {
    id: "talent_war",
    title: "Talent War Heats Up",
    description: "A competitor is poaching your key engineers with 50% salary bumps.",
    type: "market",
    choices: [
      { id: "counter_offer", label: "Counter-Offer Team (-$1M)", effect: { capital: -1000000, morale: 20 }, description: "Match competitor packages" },
      { id: "recruit", label: "Aggressive Recruiting (-$500k)", effect: { capital: -500000, techLevel: 1 }, description: "Fill gaps with new talent" },
      { id: "culture", label: "Invest in Culture & Equity", effect: { morale: 15, capital: -300000 }, description: "Long-term retention strategy" },
    ],
  },
];

const MID_QUARTER_EVENTS = [
  "Retail channels are reporting stronger-than-expected sell-through.",
  "A trade publication just ranked your device #1 in value.",
  "Consumer sentiment index ticked up 3 points this quarter.",
  "Supply logistics are running ahead of schedule.",
  "An industry report warns of market saturation in the mid-range tier.",
  "Your brand recall score hit an all-time high in surveys.",
  "Component costs dropped 8% due to oversupply in the market.",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function generateMarketIntel(quarter: number, playerMetrics: PlayerMetrics): MarketIntel {
  const trends = ["rising", "stable", "falling"] as const;
  const activities = ["aggressive", "passive", "unknown"] as const;
  const demandTrend = trends[Math.floor(Math.random() * 3)];
  const competitorActivity = activities[Math.floor(Math.random() * 3)];
  const hints = [
    "Component costs are stabilizing — margins may improve this quarter.",
    "Consumer confidence is up. Premium pricing could outperform.",
    "Emerging markets are heating up. Volume over margin might pay off.",
    "Supply chain pressures easing. Competitors likely increasing production.",
    "Tech media cycle favors innovation narratives this quarter.",
  ];
  const botHints = playerMetrics.intelPoints > 0
    ? [
        "Intercepted: Competitor is holding price steady.",
        "Intel: Competitor is ramping production aggressively.",
        "Signal: Competitor reducing R&D spend — defensive mode.",
        "Chatter: Competitor board pushing for market share gains.",
      ]
    : null;

  return {
    demandTrend,
    competitorActivity,
    hint: pickRandom(hints),
    botHint: botHints ? pickRandom(botHints) : null,
  };
}

function generateBotSchedule(botState: BotState, quarter: number) {
  const actions: { triggerAtSecond: number; label: string; type: "price" | "production" | "strategy"; delta: Partial<BotState> }[] = [];

  const aggression = Math.min(0.3 + quarter * 0.05, 0.9);

  if (Math.random() < 0.8) {
    const priceChange = (Math.random() < aggression ? -1 : 1) * (Math.floor(Math.random() * 5) + 2) * 10;
    actions.push({
      triggerAtSecond: Math.floor(Math.random() * 25) + 30,
      label: priceChange < 0 ? `Bot slashed price by $${Math.abs(priceChange)}!` : `Bot raised price by $${Math.abs(priceChange)}`,
      type: "price",
      delta: { price: clamp(botState.price + priceChange, 299, 1499) },
    });
  }

  if (Math.random() < 0.6) {
    const shift = (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * 15 + 5) * 1000;
    actions.push({
      triggerAtSecond: Math.floor(Math.random() * 20) + 5,
      label: shift > 0 ? "Bot ramped up production budget!" : "Bot cut production — going lean.",
      type: "production",
      delta: { productionBudget: clamp(botState.productionBudget + shift, 30000, 150000) },
    });
  }

  return actions.sort((a, b) => a.triggerAtSecond - b.triggerAtSecond);
}

function resolveQuarter(
  player: PlayerMetrics,
  draft: PlayerDraft,
  bot: BotState,
  quarter: number
): ResolutionResult {
  const MARKET_SIZE = 1000000;
  const UNIT_COST = 200;
  const MIN_PRICE = 299;

  const playerPrice = Math.max(draft.price, MIN_PRICE);
  const botPrice = Math.max(bot.price, MIN_PRICE);

  const playerUnitsCapacity = Math.floor((draft.productionBudget * 0.8) / UNIT_COST);
  const botUnitsCapacity = Math.floor((bot.productionBudget * 0.8) / UNIT_COST);

  const priceDiff = botPrice - playerPrice;
  const priceAdvantage = clamp(priceDiff / 200, -0.4, 0.4);
  const techBonus = (player.techLevel - 3) * 0.05;
  const moraleBonus = (player.morale - 50) * 0.002;

  const playerDemandShare = clamp(0.5 + priceAdvantage + techBonus + moraleBonus, 0.15, 0.85);
  const botDemandShare = 1 - playerDemandShare;

  const totalDemand = Math.floor(MARKET_SIZE * 0.005 * (1 + (100 - playerPrice / 15) * 0.002));

  const playerSales = Math.min(playerUnitsCapacity, Math.floor(totalDemand * playerDemandShare));
  const botSales = Math.min(botUnitsCapacity, Math.floor(totalDemand * botDemandShare));

  const playerRevenue = playerSales * playerPrice;
  const playerCost = playerSales * UNIT_COST + draft.productionBudget * 0.2;
  const playerProfit = playerRevenue - playerCost;

  const botRevenue = botSales * botPrice;
  const botCost = botSales * UNIT_COST + bot.productionBudget * 0.2;
  const botProfit = botRevenue - botCost;

  const totalSales = playerSales + botSales;
  const newPlayerShare = totalSales > 0 ? (playerSales / totalSales) * 100 : player.marketShare;
  const newBotShare = totalSales > 0 ? (botSales / totalSales) * 100 : bot.marketShare;

  const moraleChange = playerSales > botSales ? 5 : playerSales < botSales ? -5 : 0;

  const summaries = [
    playerSales > botSales * 1.2 ? "Dominant quarter — your pricing strategy crushed the competition." : "",
    playerSales < botSales * 0.8 ? "Rough quarter. The bot outmaneuvered you on volume." : "",
    Math.abs(playerSales - botSales) < botSales * 0.1 ? "Neck-and-neck. Both sides fought hard for every unit." : "",
    playerProfit > 500000 ? "Strong margins. Premium strategy paying off." : "",
    playerProfit < 0 ? "You're burning cash. Reassess your cost structure." : "",
  ].filter(Boolean);

  return {
    playerSalesUnits: playerSales,
    botSalesUnits: botSales,
    playerRevenue,
    botRevenue,
    playerProfit,
    botProfit,
    newPlayerMarketShare: clamp(newPlayerShare, 5, 95),
    newBotMarketShare: clamp(newBotShare, 5, 95),
    capitalChange: playerProfit,
    moraleChange,
    summary: summaries[0] || "Quarter resolved. Study the numbers.",
  };
}

interface GameState {
  phase: GamePhase;
  quarter: number;
  player: PlayerMetrics;
  draft: PlayerDraft;
  bot: BotState;
  quarterTimer: number;
  timerRunning: boolean;
  currentEvent: QuarterEvent | null;
  marketIntel: MarketIntel | null;
  intelAlerts: IntelAlert[];
  lastResolution: ResolutionResult | null;
  midQuarterEvents: string[];
  botSchedule: { triggerAtSecond: number; label: string; type: "price" | "production" | "strategy"; delta: Partial<BotState>; executed: boolean }[];
  language: "en" | "th";

  startGame: () => void;
  advanceToEvent: () => void;
  resolveEvent: (choiceId: string) => void;
  startActionPhase: () => void;
  tickTimer: () => void;
  updateDraft: (partial: Partial<PlayerDraft>) => void;
  triggerBotAction: (index: number) => void;
  addIntelAlert: (alert: Omit<IntelAlert, "id" | "timestamp">) => void;
  dismissIntelAlert: (id: string) => void;
  lockAndResolve: () => void;
  nextQuarter: () => void;
  toggleLanguage: () => void;
  playHoverSound: () => void;
  playClickSound: () => void;
  playTurnEndSound: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: "intel",
  quarter: 1,
  player: {
    capital: 10000000,
    morale: 65,
    techLevel: 3,
    marketShare: 45,
    intelPoints: 3,
  },
  draft: {
    price: 699,
    productionBudget: 80000,
    intelAllocation: 0,
  },
  bot: {
    price: 749,
    productionBudget: 75000,
    capital: 10000000,
    marketShare: 55,
    lastMoveLabel: null,
    lastMoveTime: null,
  },
  quarterTimer: QUARTER_DURATION,
  timerRunning: false,
  currentEvent: null,
  marketIntel: null,
  intelAlerts: [],
  lastResolution: null,
  midQuarterEvents: [],
  botSchedule: [],
  language: "en",

  startGame: () => {
    const state = get();
    const intel = generateMarketIntel(1, state.player);
    set({ phase: "intel", quarter: 1, marketIntel: intel });
  },

  advanceToEvent: () => {
    const event = pickRandom(EVENTS);
    set({ phase: "event", currentEvent: event });
  },

  resolveEvent: (choiceId: string) => {
    const { currentEvent, player } = get();
    if (!currentEvent) return;
    const choice = currentEvent.choices.find((c) => c.id === choiceId);
    if (!choice) return;
    const newPlayer: PlayerMetrics = {
      capital: clamp((player.capital + (choice.effect.capital || 0)), 0, Infinity),
      morale: clamp(player.morale + (choice.effect.morale || 0), 0, 100),
      techLevel: clamp(player.techLevel + (choice.effect.techLevel || 0), 1, 10),
      marketShare: clamp(player.marketShare + (choice.effect.marketShare || 0), 0, 100),
      intelPoints: clamp(player.intelPoints + (choice.effect.intelBonus || 0), 0, 20),
    };
    set({ player: newPlayer, currentEvent: null });
    get().playClickSound();
  },

  startActionPhase: () => {
    const { bot, quarter } = get();
    const schedule = generateBotSchedule(bot, quarter).map((a) => ({ ...a, executed: false }));
    const midEvents = Math.random() < 0.5 ? [pickRandom(MID_QUARTER_EVENTS)] : [];
    set({
      phase: "action",
      quarterTimer: QUARTER_DURATION,
      timerRunning: true,
      botSchedule: schedule,
      midQuarterEvents: midEvents,
      intelAlerts: [],
      bot: { ...bot, lastMoveLabel: null, lastMoveTime: null },
    });
  },

  tickTimer: () => {
    const state = get();
    if (!state.timerRunning || state.phase !== "action") return;

    const newTimer = state.quarterTimer - 1;

    if (newTimer <= 0) {
      set({ quarterTimer: 0, timerRunning: false });
      get().lockAndResolve();
      return;
    }

    const elapsed = QUARTER_DURATION - newTimer;
    const pendingActions = state.botSchedule.filter(
      (a) => !a.executed && a.triggerAtSecond <= elapsed
    );

    let newBot = { ...state.bot };
    let newSchedule = [...state.botSchedule];
    const newAlerts: IntelAlert[] = [];

    for (const action of pendingActions) {
      newBot = { ...newBot, ...action.delta, lastMoveLabel: action.label, lastMoveTime: elapsed };
      newSchedule = newSchedule.map((a) =>
        a.triggerAtSecond === action.triggerAtSecond ? { ...a, executed: true } : a
      );
      if (state.draft.intelAllocation > 0) {
        newAlerts.push({
          id: `alert-${Date.now()}-${action.triggerAtSecond}`,
          message: `INTEL: ${action.label}`,
          timestamp: Date.now(),
          type: action.type,
        });
      }
    }

    if (newTimer === 30 && state.midQuarterEvents.length > 0) {
      newAlerts.push({
        id: `mid-${Date.now()}`,
        message: `MARKET: ${state.midQuarterEvents[0]}`,
        timestamp: Date.now(),
        type: "strategy",
      });
    }

    set({
      quarterTimer: newTimer,
      bot: newBot,
      botSchedule: newSchedule,
      intelAlerts: [...state.intelAlerts, ...newAlerts].slice(-5),
    });
  },

  updateDraft: (partial) => {
    set((s) => ({ draft: { ...s.draft, ...partial } }));
  },

  triggerBotAction: () => {},

  addIntelAlert: (alert) => {
    set((s) => ({
      intelAlerts: [
        ...s.intelAlerts,
        { ...alert, id: `alert-${Date.now()}`, timestamp: Date.now() },
      ].slice(-5),
    }));
  },

  dismissIntelAlert: (id) => {
    set((s) => ({ intelAlerts: s.intelAlerts.filter((a) => a.id !== id) }));
  },

  lockAndResolve: () => {
    const { player, draft, bot, quarter } = get();
    get().playTurnEndSound();
    const result = resolveQuarter(player, draft, bot, quarter);
    const newPlayer: PlayerMetrics = {
      capital: clamp(player.capital + result.capitalChange, 0, Infinity),
      morale: clamp(player.morale + result.moraleChange, 0, 100),
      techLevel: player.techLevel,
      marketShare: result.newPlayerMarketShare,
      intelPoints: clamp(player.intelPoints - draft.intelAllocation + 1, 0, 20),
    };
    const newBot: BotState = {
      ...bot,
      capital: clamp(bot.capital + result.botProfit, 0, Infinity),
      marketShare: result.newBotMarketShare,
    };
    set({ phase: "resolution", player: newPlayer, bot: newBot, lastResolution: result });
  },

  nextQuarter: () => {
    const { quarter, player } = get();
    if (quarter >= MAX_QUARTERS || player.capital <= 0) {
      set({ phase: "gameover" });
      return;
    }
    const nextQ = quarter + 1;
    const intel = generateMarketIntel(nextQ, player);
    set({ phase: "intel", quarter: nextQ, marketIntel: intel, lastResolution: null });
  },

  toggleLanguage: () => {
    set((s) => ({ language: s.language === "en" ? "th" : "en" }));
  },

  playHoverSound: () => {},
  playClickSound: () => {},
  playTurnEndSound: () => {},
}));
