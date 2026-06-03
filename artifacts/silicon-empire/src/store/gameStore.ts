import { create } from "zustand";
import type {
  GamePhase,
  GameResult,
  PlayerMetrics,
  PlayerDraft,
  BotState,
  Executives,
  Upgrades,
  LoanState,
  BiddingWar,
  SabotageState,
  QuarterEvent,
  IntelAlert,
  ResolutionResult,
  MarketIntel,
  BotScheduledAction,
} from "./types";

const QUARTER_DURATION = 60;
const MAX_QUARTERS = 16;
const INSTANT_WIN_CAPITAL = 50_000_000;

const EVENTS: QuarterEvent[] = [
  {
    id: "supply_crunch", type: "supply",
    en: { title: "Supply Chain Disruption", description: "A major chip supplier is facing shortages. Production costs will spike unless you act now." },
    th: { title: "ปัญหาซัพพลายเชน", description: "ผู้จัดจำหน่ายชิพรายสำคัญกำลังเผชิญกับการขาดแคลน ต้นทุนการผลิตจะพุ่งสูงขึ้นหากคุณไม่ดำเนินการตอนนี้" },
    choices: [
      { id: "stockpile", effect: { capital: -2000000, morale: 5 }, en: { label: "Pre-buy Components (−$2M)", description: "Secure supply at current prices" }, th: { label: "ซื้อชิ้นส่วนล่วงหน้า (−$2M)", description: "ล็อคราคาซัพพลายก่อนที่จะแพงขึ้น" } },
      { id: "pivot", effect: { techLevel: -1, morale: -5 }, en: { label: "Pivot to Alternative Supplier", description: "Slower chips, but stable supply" }, th: { label: "เปลี่ยนไปใช้ซัพพลายเออร์อื่น", description: "ชิพช้ากว่าแต่ซัพพลายมั่นคง" } },
      { id: "wait", effect: { capital: -500000, morale: -10 }, en: { label: "Absorb the Impact", description: "Hope the crisis resolves quickly" }, th: { label: "รับผลกระทบ", description: "หวังว่าวิกฤติจะผ่านไปเร็วๆ" } },
    ],
  },
  {
    id: "viral_buzz", type: "market",
    en: { title: "Viral Product Leak", description: "An unannounced feature leaked online and is trending. Consumer demand is surging." },
    th: { title: "การรั่วไหลของผลิตภัณฑ์ที่กลายเป็นไวรัล", description: "ฟีเจอร์ที่ยังไม่ประกาศรั่วไหลและกำลังเป็นกระแส ความต้องการของผู้บริโภคกำลังพุ่งสูง" },
    choices: [
      { id: "capitalize", effect: { morale: 15, marketShare: 3 }, en: { label: "Launch Teaser Campaign", description: "Ride the hype wave" }, th: { label: "เปิดตัวแคมเปญทีเซอร์", description: "ขี่กระแสความฮือฮา" } },
      { id: "deny", effect: { morale: -5, capital: -200000 }, en: { label: "Issue Official Denial", description: "Protect the surprise factor" }, th: { label: "ออกแถลงการณ์ปฏิเสธ", description: "ปกป้องความเซอร์ไพรส์" } },
      { id: "ignore", effect: { morale: 5 }, en: { label: "Ignore the Buzz", description: "Let the market speculate" }, th: { label: "เพิกเฉยต่อกระแส", description: "ให้ตลาดคาดเดา" } },
    ],
  },
  {
    id: "regulation_warning", type: "regulation",
    en: { title: "New Data Privacy Regulation", description: "Government signals upcoming data privacy laws. Early compliance costs capital but avoids future fines." },
    th: { title: "กฎระเบียบความเป็นส่วนตัวของข้อมูลใหม่", description: "รัฐบาลส่งสัญญาณเกี่ยวกับกฎหมายที่กำลังจะมา การปฏิบัติตามแต่เนิ่นๆ มีต้นทุนแต่หลีกเลี่ยงค่าปรับ" },
    choices: [
      { id: "early_comply", effect: { capital: -1500000, morale: 20 }, en: { label: "Comply Early (−$1.5M, +Morale)", description: "Lead with responsibility" }, th: { label: "ปฏิบัติตามแต่เนิ่นๆ (−$1.5M)", description: "นำด้วยความรับผิดชอบ" } },
      { id: "wait_watch", effect: { morale: -5 }, en: { label: "Monitor the Situation", description: "Defer until law passes" }, th: { label: "ติดตามสถานการณ์", description: "รอจนกฎหมายผ่าน" } },
      { id: "lobby", effect: { capital: -800000, morale: -10 }, en: { label: "Lobby Against It (−$800K)", description: "Fight the regulation" }, th: { label: "ล็อบบี้คัดค้าน (−$800K)", description: "ต่อสู้กับกฎระเบียบ" } },
    ],
  },
  {
    id: "tech_breakthrough", type: "tech",
    en: { title: "R&D Breakthrough", description: "Your engineers made an unexpected breakthrough in battery technology." },
    th: { title: "การก้าวหน้าทางด้าน R&D", description: "วิศวกรของคุณค้นพบความก้าวหน้าที่ไม่คาดคิดเกี่ยวกับเทคโนโลยีแบตเตอรี่" },
    choices: [
      { id: "integrate", effect: { capital: -2000000, techLevel: 2, morale: 15 }, en: { label: "Fast-Track Integration (−$2M)", description: "Push it to market immediately" }, th: { label: "เร่งนำไปใช้ (−$2M)", description: "ผลักดันสู่ตลาดทันที" } },
      { id: "patent", effect: { capital: 1000000, techLevel: 1, intelBonus: 2 }, en: { label: "Patent & License Out (+$1M)", description: "Monetize without full integration" }, th: { label: "จดสิทธิบัตรและอนุญาต (+$1M)", description: "สร้างรายได้โดยไม่ต้องรวมทั้งหมด" } },
      { id: "shelve", effect: { morale: -5 }, en: { label: "Shelve for Later", description: "Wait for the right moment" }, th: { label: "เก็บไว้ก่อน", description: "รอเวลาที่เหมาะสม" } },
    ],
  },
  {
    id: "talent_war", type: "market",
    en: { title: "Talent War Heats Up", description: "A competitor is poaching your key engineers with 50% salary bumps." },
    th: { title: "การแย่งชิงความสามารถ", description: "คู่แข่งกำลังดึงวิศวกรหลักของคุณด้วยการขึ้นเงินเดือน 50%" },
    choices: [
      { id: "counter_offer", effect: { capital: -1000000, morale: 20 }, en: { label: "Counter-Offer Team (−$1M)", description: "Match competitor packages" }, th: { label: "เสนอค่าตอบแทนสูงกว่า (−$1M)", description: "แข่งกับแพ็คเกจคู่แข่ง" } },
      { id: "recruit", effect: { capital: -500000, techLevel: 1 }, en: { label: "Aggressive Recruiting (−$500K)", description: "Fill gaps with new talent" }, th: { label: "สรรหาแบบเชิงรุก (−$500K)", description: "เติมช่องว่างด้วยบุคลากรใหม่" } },
      { id: "culture", effect: { morale: 15, capital: -300000 }, en: { label: "Invest in Culture & Equity", description: "Long-term retention strategy" }, th: { label: "ลงทุนในวัฒนธรรมองค์กร", description: "กลยุทธ์ retention ระยะยาว" } },
    ],
  },
  {
    id: "ai_revolution", 
    type: "tech",
    en: { 
      title: "The AI Smartphone Revolution", 
      description: "Generative AI is the new trend! Investors demand an AI-powered flagship phone immediately." 
    },
    th: { 
      title: "การปฏิวัติสมาร์ทโฟน AI", 
      description: "Generative AI กำลังเป็นกระแสหลัก! นักลงทุนเรียกร้องให้เปิดตัวมือถือเรือธงที่ขับเคลื่อนด้วย AI ทันที" 
    },
    choices: [
      { 
        id: "inhouse_ai", 
        effect: { capital: -4000000, techLevel: 3, morale: 10 }, 
        en: { label: "Develop In-House AI (−$4M)", description: "Massive cost, but secures long-term tech dominance." }, 
        th: { label: "พัฒนา AI ของตัวเอง (−$4M)", description: "ต้นทุนมหาศาล แต่ครองความยิ่งใหญ่ทางเทคโนโลยีระยะยาว" } 
      },
      { 
        id: "license_ai", 
        effect: { capital: -1000000, techLevel: 1 }, 
        en: { label: "License 3rd-Party AI (−$1M)", description: "Quick and cheap, but less innovative." }, 
        th: { label: "ซื้อลิขสิทธิ์ AI สำเร็จรูป (−$1M)", description: "รวดเร็วและราคาถูก แต่ขาดนวัตกรรมที่โดดเด่น" } 
      },
      { 
        id: "ignore_ai", 
        effect: { techLevel: -1, morale: -15 }, 
        en: { label: "Ignore the Trend", description: "Save money, but staff feel the company is falling behind." }, 
        th: { label: "เพิกเฉยต่อกระแส", description: "ประหยัดเงิน แต่พนักงานรู้สึกว่าบริษัทกำลังล้าหลัง" } 
      }
    ],
  },
  {
    id: "spy_caught", 
    type: "market",
    en: { 
      title: "Corporate Spy Compromised!", 
      description: "One of your data analysts was caught trying to hack a competitor. The press is calling." 
    },
    th: { 
      title: "สายลับองค์กรถูกจับได้!", 
      description: "นักวิเคราะห์ข้อมูลของคุณคนหนึ่งถูกจับได้ว่าพยายามแฮกข้อมูลคู่แข่ง นักข่าวเตรียมแฉเรื่องนี้แล้ว" 
    },
    choices: [
      { 
        id: "pay_hush", 
        effect: { capital: -2500000, morale: 5 }, 
        en: { label: "Pay Hush Money (−$2.5M)", description: "Bury the story using expensive lawyers." }, 
        th: { label: "จ่ายค่าปิดปากสื่อ (−$2.5M)", description: "ฝังข่าวนี้ทิ้งด้วยทนายความราคาแพง" } 
      },
      { 
        id: "scapegoat", 
        effect: { capital: 0, morale: -25 }, 
        en: { label: "Scapegoat the Analyst", description: "Save capital, but destroy company morale and trust." }, 
        th: { label: "โยนความผิดให้พนักงาน", description: "รักษางบประมาณไว้ แต่ทำลายความเชื่อมั่นและกำลังใจขั้นสุด" } 
      }
    ],
  },
  {
    id: "grey_market", 
    type: "supply",
    en: { 
      title: "The Grey Market Offer", 
      description: "A shady supplier offers a massive batch of unverified components at a dirt-cheap price." 
    },
    th: { 
      title: "ข้อเสนอจากตลาดมืด", 
      description: "ซัพพลายเออร์ลึกลับเสนอขายชิ้นส่วนจำนวนมหาศาลที่ไม่ได้ตรวจสอบคุณภาพ ในราคาถูกแสนถูก" 
    },
    choices: [
      { 
        id: "accept_shady", 
        effect: { capital: 1500000, techLevel: -1, morale: -10 }, 
        en: { label: "Accept Offer (+$1.5M)", description: "Pocket the savings, but risk quality issues." }, 
        th: { label: "รับข้อเสนอ (+$1.5M)", description: "เก็บเงินส่วนต่างเข้ากระเป๋า แต่ยอมลดคุณภาพสินค้า" } 
      },
      { 
        id: "report_shady", 
        effect: { capital: -200000, morale: 5, intelBonus: 2 }, 
        en: { label: "Report to Authorities (−$200K)", description: "Small cost to assist police, rewards you with Intel Points." }, 
        th: { label: "แจ้งเบาะแสให้ทางการ (−$200K)", description: "มีค่าดำเนินการเล็กน้อย แต่ได้แต้มข่าวกรองเป็นรางวัล" } 
      }
    ],
  }
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

const HINT_KEYS = ["h1", "h2", "h3", "h4", "h5"] as const;
const BOT_HINT_KEYS = ["b1", "b2", "b3", "b4"] as const;
const MID_KEYS = ["m1", "m2", "m3", "m4", "m5", "m6", "m7"] as const;

function generateMarketIntel(playerMetrics: PlayerMetrics): MarketIntel {
  const trends = ["rising", "stable", "falling"] as const;
  const activities = ["aggressive", "passive", "unknown"] as const;
  return {
    demandTrend: trends[Math.floor(Math.random() * 3)],
    competitorActivity: activities[Math.floor(Math.random() * 3)],
    hintKey: `hints.${pickRandom([...HINT_KEYS])}`,
    botHintKey: playerMetrics.intelPoints > 0 ? `hints.${pickRandom([...BOT_HINT_KEYS])}` : null,
  };
}

function generateBotSchedule(botState: BotState, quarter: number): BotScheduledAction[] {
  const actions: BotScheduledAction[] = [];
  const aggression = Math.min(0.3 + quarter * 0.05, 0.9);

  if (Math.random() < 0.8) {
    const priceChange = (Math.random() < aggression ? -1 : 1) * (Math.floor(Math.random() * 5) + 2) * 10;
    actions.push({
      triggerAtSecond: Math.floor(Math.random() * 25) + 30,
      executed: false,
      label: priceChange < 0 ? `Bot slashed price by $${Math.abs(priceChange)}!` : `Bot raised price by $${Math.abs(priceChange)}`,
      type: "price",
      delta: { price: clamp(botState.price + priceChange, 299, 1499) },
    });
  }

  if (Math.random() < 0.7) {
    const shift = (Math.random() < 0.55 ? -1 : 1) * Math.floor(Math.random() * 20 + 5) * 1000;
    actions.push({
      triggerAtSecond: Math.floor(Math.random() * 20) + 5,
      executed: false,
      label: shift > 0 ? "Bot ramped up production!" : "Bot cut production — going lean.",
      type: "production",
      delta: { productionBudget: clamp(botState.productionBudget + shift, 30000, 200000) },
    });
  }

  return actions.sort((a, b) => a.triggerAtSecond - b.triggerAtSecond);
}

  function resolveQuarter(
    player: PlayerMetrics,
    draft: PlayerDraft,
    bot: BotState,
    executives: Executives,
    upgrades: Upgrades,
    loans: LoanState,
    sabotage: SabotageState,
  ): ResolutionResult {
    const BASE_UNIT_COST = 200;
    const factoryDiscount = upgrades.componentFactory ? 0.75 : 1.0;
    const baseUnitCost = BASE_UNIT_COST * factoryDiscount;

    let unitCostMultiplier = 1.0;
    if (draft.productionBudget > 500_000) { 
        const excessRatio = (draft.productionBudget - 500_000) / 500_000;
        unitCostMultiplier = 1 + Math.pow(excessRatio, 1.2) * 0.3; 
        if (executives.coo) unitCostMultiplier = Math.min(unitCostMultiplier, 1.20);
    }

    const effectiveUnitCost = baseUnitCost * unitCostMultiplier;

    const playerCapacity = Math.floor(draft.productionBudget * 0.8 / effectiveUnitCost);

    const botBaseCost = bot.hasFactory ? BASE_UNIT_COST * 0.75 : BASE_UNIT_COST;
    const botCapacityRaw = Math.floor(bot.productionBudget * 0.8 / botBaseCost);
    const botCapacity = sabotage.ddosPending ? Math.floor(botCapacityRaw * 0.7) : botCapacityRaw;

    const baseMarket = 1_000_000; 
    const maxViablePrice = 500 + (player.techLevel * 300); 
    const techMultiplier = Math.pow(1.5, player.techLevel - 1); 
    const TOTAL_MARKET = Math.floor(baseMarket * techMultiplier);

    let demandFactor = 1.0;
    if (draft.price > maxViablePrice) {
      demandFactor = Math.max(0.02, 1 - (draft.price - maxViablePrice) / 700);
    }

    const priceDiff = bot.price - draft.price;
    const priceAdvantage = clamp(priceDiff / 200, -0.45, 0.45);
    const techBonus = (player.techLevel - 3) * 0.05;
    const moraleBonus = (player.morale - 50) * 0.002;
    const playerShareFactor = clamp(0.5 + priceAdvantage + techBonus + moraleBonus, 0.05, 0.95);

    const playerRawDemand = Math.floor(TOTAL_MARKET * playerShareFactor * demandFactor);
    const botShareFactor = sabotage.prPending ? (1 - playerShareFactor) * 0.93 : (1 - playerShareFactor);
    const botRawDemand = Math.floor(TOTAL_MARKET * botShareFactor);

    const playerSales = Math.min(playerCapacity, playerRawDemand);
    const botSales = Math.min(botCapacity, botRawDemand);

    const playerUnsold = Math.max(0, playerCapacity - playerRawDemand);
    const eWasteRate = executives.cfo ? 0.7 : 1.0;
    const eWastePenalty = Math.floor(playerUnsold / 100_000) * 5_000_000 * eWasteRate;

    // ---------------------------------------------------------
    // ส่วนที่แก้ใหม่: คิดต้นทุนตามจำนวนที่ผลิตจริง (Capacity) ไม่ใช่ยอดขาย (Sales)
    // ---------------------------------------------------------
    const playerRevenue = playerSales * draft.price;
    const playerVariableCost = playerCapacity * effectiveUnitCost; // <-- แก้ตรงนี้แล้ว
    const playerFixedCost = draft.productionBudget * 0.2;
    const grossProfit = playerRevenue - playerVariableCost - playerFixedCost;
    const playerProfit = grossProfit - eWastePenalty;

    const debtRepayment = loans.quartersRemaining > 0 ? loans.repaymentPerQuarter : 0;
    const capitalChange = playerProfit - debtRepayment;

    const botRevenue = botSales * bot.price;
    const botCost = (botCapacity * botBaseCost) + (bot.productionBudget * 0.2); // <-- แก้ตรงนี้แล้ว
    const botProfit = botRevenue - botCost;
    // ---------------------------------------------------------

    const totalSales = playerSales + botSales;
    const newPlayerShare = totalSales > 0 ? (playerSales / totalSales) * 100 : player.marketShare;
    const newBotShare = 100 - newPlayerShare;

    const moraleChange = playerSales > botSales * 1.1 ? 8 : playerSales < botSales * 0.9 ? -8 : 0;
    const techGrowth = upgrades.legendaryEngineer ? 2 : 0;

    let summaryKey = "summaries.default";
    if (demandFactor < 0.3) summaryKey = "summaries.elasticity";
    else if (eWastePenalty > 2_000_000) summaryKey = "summaries.ewaste";
    else if (playerSales > botSales * 1.3) summaryKey = "summaries.dominant";
    else if (playerSales < botSales * 0.7) summaryKey = "summaries.rough";
    else if (debtRepayment > 0) summaryKey = "summaries.debt";
    else if (capitalChange < 0) summaryKey = "summaries.burning";
    else if (playerSales > botSales && capitalChange > 500_000) summaryKey = "summaries.strong";
    else summaryKey = "summaries.neckAndNeck";

  return {
    playerSalesUnits: playerSales,
    botSalesUnits: botSales,
    playerRevenue,
    botRevenue,
    grossProfit,
    playerProfit,
    botProfit,
    newPlayerMarketShare: clamp(newPlayerShare, 3, 97),
    newBotMarketShare: clamp(newBotShare, 3, 97),
    capitalChange,
    moraleChange,
    eWastePenalty,
    eWasteUnits: playerUnsold,
    debtRepayment,
    techGrowth,
    effectiveUnitCost,
    playerCapacity,
    playerRawDemand,
    demandFactor,
    summaryKey,
  };
}

const INITIAL_PLAYER: PlayerMetrics = { capital: 10_000_000, morale: 65, techLevel: 3, marketShare: 45, intelPoints: 3 };
const INITIAL_DRAFT: PlayerDraft = { price: 699, productionBudget: 80_000, intelAllocation: 0 };
const INITIAL_BOT: BotState = { price: 749, productionBudget: 75_000, capital: 10_000_000, marketShare: 55, lastMoveLabel: null, lastMoveTime: null, hasFactory: false };
const INITIAL_EXECUTIVES: Executives = { cfo: false, coo: false };
const INITIAL_UPGRADES: Upgrades = { componentFactory: false, legendaryEngineer: false };
const INITIAL_LOANS: LoanState = { outstanding: 0, quartersRemaining: 0, repaymentPerQuarter: 0 };
const INITIAL_SABOTAGE: SabotageState = { ddosPending: false, prPending: false, cooldown: false };

interface GameState {
  phase: GamePhase;
  quarter: number;
  gameResult: GameResult;
  language: "en" | "th";

  player: PlayerMetrics;
  draft: PlayerDraft;
  bot: BotState;

  quarterTimer: number;
  timerRunning: boolean;
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

  lastResolution: ResolutionResult | null;

  startGame: () => void;
  advanceToEvent: () => void;
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
  resetGame: () => void;

  playHoverSound: () => void;
  playClickSound: () => void;
  playTurnEndSound: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: "intel",
  quarter: 1,
  gameResult: "playing",
  language: "en",

  player: { ...INITIAL_PLAYER },
  draft: { ...INITIAL_DRAFT },
  bot: { ...INITIAL_BOT },

  quarterTimer: QUARTER_DURATION,
  timerRunning: false,
  playerReady: false,
  botLocked: false,
  botLockTime: 20,

  currentEvent: null,
  marketIntel: null,
  intelAlerts: [],
  midQuarterEventKey: null,
  botSchedule: [],

  executives: { ...INITIAL_EXECUTIVES },
  upgrades: { ...INITIAL_UPGRADES },
  loans: { ...INITIAL_LOANS },
  biddingWar: null,
  sabotage: { ...INITIAL_SABOTAGE },

  lastResolution: null,

  startGame: () => {
    const state = get();
    const intel = generateMarketIntel(state.player);
    set({ phase: "intel", quarter: 1, marketIntel: intel, gameResult: "playing" });
  },

  advanceToEvent: () => {
    const event = pickRandom(EVENTS);
    set({ phase: "event", currentEvent: event });
  },

  resolveEvent: (choiceId) => {
    const { currentEvent, player } = get();
    if (!currentEvent) return;
    const choice = currentEvent.choices.find((c) => c.id === choiceId);
    if (!choice) return;
    set({
      player: {
        capital: clamp(player.capital + (choice.effect.capital || 0), 0, Infinity),
        morale: clamp(player.morale + (choice.effect.morale || 0), 0, 100),
        techLevel: clamp(player.techLevel + (choice.effect.techLevel || 0), 1, 10),
        marketShare: clamp(player.marketShare + (choice.effect.marketShare || 0), 0, 100),
        intelPoints: clamp(player.intelPoints + (choice.effect.intelBonus || 0), 0, 20),
      },
      currentEvent: null,
    });
  },

  startActionPhase: () => {
    const { bot, quarter } = get();
    const schedule = generateBotSchedule(bot, quarter);
    const midKey = Math.random() < 0.6 ? `mid_events.${pickRandom([...MID_KEYS])}` : null;
    const botLockTime = Math.floor(Math.random() * 16) + 15;
    set({
      phase: "action",
      quarterTimer: QUARTER_DURATION,
      timerRunning: true,
      botSchedule: schedule,
      midQuarterEventKey: midKey,
      intelAlerts: [],
      playerReady: false,
      botLocked: false,
      botLockTime,
      bot: { ...bot, lastMoveLabel: null, lastMoveTime: null },
    });
  },

  tickTimer: () => {
    const state = get();
    if (!state.timerRunning || state.phase !== "action") return;

    const newTimer = state.quarterTimer - 1;
    if (newTimer <= 0) {
      set({ quarterTimer: 0, timerRunning: false, playerReady: false, botLocked: false });
      get().lockAndResolve();
      return;
    }

    const elapsed = QUARTER_DURATION - newTimer;

    let newBotLocked = state.botLocked;
    if (!state.botLocked && elapsed >= state.botLockTime) {
      newBotLocked = true;
      if (state.playerReady) {
        set({ quarterTimer: 0, timerRunning: false, playerReady: false, botLocked: false });
        get().lockAndResolve();
        return;
      }
    }

    const pendingActions = state.botSchedule.filter((a) => !a.executed && a.triggerAtSecond <= elapsed);
    let newBot = { ...state.bot };
    let newSchedule = [...state.botSchedule];
    const newAlerts: IntelAlert[] = [];

    for (const action of pendingActions) {
      newBot = { ...newBot, ...action.delta, lastMoveLabel: action.label, lastMoveTime: elapsed };
      newSchedule = newSchedule.map((a) =>
        a.triggerAtSecond === action.triggerAtSecond ? { ...a, executed: true } : a
      );
      if (state.draft.intelAllocation > 0) {
        newAlerts.push({ id: `alert-${Date.now()}-${action.triggerAtSecond}`, message: `INTEL: ${action.label}`, timestamp: Date.now(), type: action.type });
      }
    }

    if (newTimer === 30 && state.midQuarterEventKey) {
      newAlerts.push({ id: `mid-${Date.now()}`, message: `MARKET: [mid-quarter event]`, timestamp: Date.now(), type: "strategy" });
    }

    set({
      quarterTimer: newTimer,
      bot: newBot,
      botSchedule: newSchedule,
      botLocked: newBotLocked,
      intelAlerts: [...state.intelAlerts, ...newAlerts].slice(-6),
    });
  },

  updateDraft: (partial) => set((s) => ({ draft: { ...s.draft, ...partial } })),

  addIntelAlert: (alert) => set((s) => ({
    intelAlerts: [...s.intelAlerts, { ...alert, id: `alert-${Date.now()}`, timestamp: Date.now() }].slice(-6),
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

  lockAndResolve: () => {
    const { player, draft, bot, executives, upgrades, loans, sabotage, quarter } = get();
    get().playTurnEndSound();
    const result = resolveQuarter(player, draft, bot, executives, upgrades, loans, sabotage);

    const newCapital = clamp(player.capital + result.capitalChange, 0, Infinity);
    const newTech = clamp(player.techLevel + result.techGrowth, 1, 10);
    const newPlayer: PlayerMetrics = {
      capital: newCapital,
      morale: clamp(player.morale + result.moraleChange, 0, 100),
      techLevel: newTech,
      marketShare: result.newPlayerMarketShare,
      intelPoints: clamp(player.intelPoints - draft.intelAllocation + 1, 0, 20),
    };

    let newLoans = { ...loans };
    if (loans.quartersRemaining > 0) {
      newLoans = { ...loans, quartersRemaining: loans.quartersRemaining - 1, outstanding: Math.max(0, loans.outstanding - loans.repaymentPerQuarter) };
    }

    const botCapitalGain = result.botProfit;
    const newBot: BotState = { ...bot, capital: clamp(bot.capital + botCapitalGain, 0, Infinity), marketShare: result.newBotMarketShare };

    let newBotWithFactory = newBot;
    if (!bot.hasFactory && newBot.capital > 150_000_000 && quarter > 4 && Math.random() < 0.3) {
      newBotWithFactory = { ...newBot, hasFactory: true };
      if (draft.intelAllocation > 0) {
        get().addIntelAlert({ message: "ALERT: Competitor acquired a Component Factory!", type: "strategy" });
      }
    }

    let gameResult: GameResult = "playing";
    if (newCapital <= 0) gameResult = "bankrupt";
    else if (newCapital >= INSTANT_WIN_CAPITAL) gameResult = "won_instant";

    set({
      phase: "resolution",
      player: newPlayer,
      bot: newBotWithFactory,
      loans: newLoans,
      lastResolution: result,
      gameResult,
      sabotage: { ...sabotage, ddosPending: false, prPending: false },
    });
  },

  nextQuarter: () => {
    const { quarter, player, bot, gameResult } = get();

    if (gameResult !== "playing") {
      set({ phase: "gameover" });
      return;
    }

    if (quarter >= MAX_QUARTERS) {
      const finalResult: GameResult = player.capital > bot.capital ? "won_timeout" : "won_timeout_lost";
      set({ phase: "gameover", gameResult: finalResult });
      return;
    }

    const nextQ = quarter + 1;
    const intel = generateMarketIntel(player);
    set({
      phase: "intel",
      quarter: nextQ,
      marketIntel: intel,
      lastResolution: null,
      sabotage: { ddosPending: false, prPending: false, cooldown: false },
    });
  },

  toggleLanguage: () => set((s) => ({ language: s.language === "en" ? "th" : "en" })),

  hireExecutive: (type) => {
    const { player, executives, phase } = get();
    if (phase === "action") return;
    if (executives[type]) return;
    const cost = 40_000_000;
    if (player.capital < cost) return;
    set({ player: { ...player, capital: player.capital - cost }, executives: { ...executives, [type]: true } });
  },

  purchaseUpgrade: (type) => {
    const { player, upgrades, executives, phase } = get();
    if (phase === "action") return;
    if (upgrades[type]) return;
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
    // ห้ามกู้เงินตอนที่เวลากำลังเดินอยู่ (ต้องกู้ตอนช่วงสรุปผลหรือเตรียมความพร้อม)
    if (phase === "action") return;

    // ยอดผ่อนต่อไตรมาส: มี CFO จ่าย 2.5 ล้าน / ไม่มี CFO จ่าย 3 ล้าน
    const repayment = executives.cfo ? 2_500_000 : 3_000_000;

    set({
      player: { ...player, capital: player.capital + 10_000_000 },
      loans: {
        outstanding: loans.outstanding + 10_000_000, // หนี้ตั้งต้นเพิ่ม 10 ล้าน
        quartersRemaining: loans.quartersRemaining + 4,
        // สำคัญ: บวกทบยอดผ่อนเดิมเข้าไปด้วย เผื่อผู้เล่นกดกู้ซ้อนกันหลายรอบ
        repaymentPerQuarter: loans.repaymentPerQuarter + repayment, 
      },
    });
  },


  acceptBiddingWar: () => {
    const { player, upgrades } = get();
    const extraCost = 20_000_000;
    if (player.capital < extraCost) {
      set({ biddingWar: { active: false, engineerSigned: false } });
      return;
    }
    set({
      player: { ...player, capital: player.capital - extraCost },
      upgrades: { ...upgrades, legendaryEngineer: true },
      biddingWar: { active: false, engineerSigned: true },
    });
  },

  withdrawBiddingWar: () => {
    const { player } = get();
    set({
      player: { ...player, capital: player.capital + 80_000_000 },
      biddingWar: { active: false, engineerSigned: false },
    });
  },

  launchSabotage: (type) => {
    const { player, sabotage, phase } = get();
    if (phase === "action" || sabotage.cooldown) return;
    if (type === "ddos") {
      if (player.capital < 10_000_000 || player.intelPoints < 3) return;
      set({ player: { ...player, capital: player.capital - 10_000_000, intelPoints: player.intelPoints - 3 }, sabotage: { ...sabotage, ddosPending: true, cooldown: true } });
    } else {
      if (player.capital < 5_000_000 || player.intelPoints < 2) return;
      set({ player: { ...player, capital: player.capital - 5_000_000, intelPoints: player.intelPoints - 2 }, sabotage: { ...sabotage, prPending: true, cooldown: true } });
    }
  },

  resetGame: () => {
    set({
      phase: "intel",
      quarter: 1,
      gameResult: "playing",
      player: { ...INITIAL_PLAYER },
      draft: { ...INITIAL_DRAFT },
      bot: { ...INITIAL_BOT },
      quarterTimer: QUARTER_DURATION,
      timerRunning: false,
      playerReady: false,
      botLocked: false,
      botLockTime: 20,
      currentEvent: null,
      marketIntel: generateMarketIntel(INITIAL_PLAYER),
      intelAlerts: [],
      midQuarterEventKey: null,
      botSchedule: [],
      executives: { ...INITIAL_EXECUTIVES },
      upgrades: { ...INITIAL_UPGRADES },
      loans: { ...INITIAL_LOANS },
      biddingWar: null,
      sabotage: { ...INITIAL_SABOTAGE },
      lastResolution: null,
    });
  },

  playHoverSound: () => {},
  playClickSound: () => {},
  playTurnEndSound: () => {},
}));
