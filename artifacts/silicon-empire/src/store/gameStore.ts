// ===== SILICON EMPIRE v4 — Game Store =====
// Zustand store หลักของเกม ควบคุมทุก state และ action

import { create } from "zustand";
import type {
  GamePhase, GameResult, PlayerMetrics, PlayerDraft, BotState,
  Executives, Upgrades, LoanState, BiddingWar, SabotageState,
  AntitrustState, ComponentsState, BoardDirective, QuarterEvent,
  IntelAlert, ResolutionResult, MarketIntel, BotScheduledAction,
  CapitalHistoryEntry, CEOBackgroundType, CEOBackground,
  BotPersonaType, HypeCampaignState,
} from "./types";

// ===== CONSTANTS =====
const QUARTER_DURATION = 60;
const MAX_QUARTERS = 16;
const INSTANT_WIN_CAPITAL = 1_000_000_000;
const BASE_UNIT_COST = 200;
const TOTAL_MARKET = 5_000_000;

// ===== CEO BACKGROUND DEFINITIONS v4.0 =====
const CEO_BACKGROUNDS: Record<CEOBackgroundType, CEOBackground> = {
  visionary: {
    type: "visionary",
    productionCostModifier: 1.15,  // base cost +15% (spec)
    ecotechModifier: 1.0,
    ecotechCostModifier: 0.80,     // upgrade costs -20% (spec)
    brandLoyalistBonus: 1.0,
    eWastePenaltyReduction: 1.0,
    priceCeilingModifier: 1.0,
  },
  marketer: {
    type: "marketer",
    productionCostModifier: 1.0,
    ecotechModifier: 1.0,
    ecotechCostModifier: 1.20,     // upgrade costs +20% (spec)
    brandLoyalistBonus: 1.15,      // brand loyalists +15% (spec)
    eWastePenaltyReduction: 1.0,
    priceCeilingModifier: 1.0,
  },
  operator: {
    type: "operator",
    productionCostModifier: 0.85,  // base cost -15% (spec)
    ecotechModifier: 1.0,
    ecotechCostModifier: 1.0,
    brandLoyalistBonus: 1.0,
    eWastePenaltyReduction: 0.50,  // E-Waste -50% (spec)
    priceCeilingModifier: 0.90,    // price ceiling reduced (spec)
  },
};

const COMPONENT_UPGRADE_COSTS: Record<keyof ComponentsState, number[]> = {
  chip:    [0, 0, 3, 5, 8, 12],
  battery: [0, 0, 2, 4, 6, 9],
  display: [0, 0, 3, 5, 8, 11],
  memory:  [0, 0, 2, 3, 5, 8],
};

// ===== v4.0: 15 Board Directives =====
const ALL_DIRECTIVES: BoardDirective[] = [
  "aggressive_rd", "austerity", "market_expansion",
  "brand_campaign", "cost_cutting", "talent_retention",
  "premium_focus", "volume_play",
  // Dark Tactics
  "planned_obsolescence", "industrial_espionage",
  // New
  "flash_sale", "viral_launch", "headcount_freeze",
  "supply_chain_deal", "green_initiative",
];

// ===== EVENTS =====
const EVENTS: QuarterEvent[] = [
  {
    id: "supply_crunch", type: "supply",
    en: { title: "Supply Chain Disruption", description: "A major chip supplier faces shortages. Production costs will spike unless you act now." },
    th: { title: "ปัญหาซัพพลายเชน", description: "ผู้จัดจำหน่ายชิพรายสำคัญขาดแคลน ต้นทุนการผลิตจะพุ่งสูงหากคุณไม่ดำเนินการ" },
    choices: [
      { id: "stockpile", effect: { capital: -5_000_000, morale: 5 }, en: { label: "Pre-buy Components (−$5M)", description: "Lock in current pricing" }, th: { label: "ซื้อชิ้นส่วนล่วงหน้า (−$5M)", description: "ล็อคราคาก่อนที่จะแพงขึ้น" } },
      { id: "pivot", effect: { techLevel: -1, morale: -5 }, en: { label: "Use Alternative Supplier", description: "Slower components, stable supply" }, th: { label: "เปลี่ยนซัพพลายเออร์", description: "ชิ้นส่วนช้าลงแต่ซัพพลายมั่นคง" } },
      { id: "absorb", effect: { capital: -2_000_000, morale: -10 }, en: { label: "Absorb the Cost (−$2M)", description: "Pay the premium, hope it resolves" }, th: { label: "รับต้นทุนเพิ่ม (−$2M)", description: "จ่ายส่วนต่าง หวังว่าจะผ่านเร็วๆ" } },
    ],
  },
  {
    id: "viral_buzz", type: "market",
    en: { title: "Viral Product Leak", description: "An unannounced feature leaked online and is trending. Consumer demand is surging." },
    th: { title: "ผลิตภัณฑ์รั่วไหลเป็นไวรัล", description: "ฟีเจอร์ที่ยังไม่ประกาศรั่วไหลและกำลังเป็นกระแส ความต้องการพุ่งสูง" },
    choices: [
      { id: "capitalize", effect: { morale: 15, marketShare: 3 }, en: { label: "Launch Teaser Campaign", description: "Ride the hype wave (+Brand)" }, th: { label: "เปิดตัวแคมเปญทีเซอร์", description: "ขี่กระแสความฮือฮา (+แบรนด์)" } },
      { id: "deny", effect: { morale: -5, capital: -1_000_000 }, en: { label: "Issue Denial (−$1M)", description: "Protect the surprise" }, th: { label: "ออกแถลงการณ์ปฏิเสธ (−$1M)", description: "ปกป้องความเซอร์ไพรส์" } },
    ],
  },
  {
    id: "hire_researcher", type: "research",
    en: { title: "Top Researcher Available", description: "A senior AI researcher from a failing startup wants to join your R&D team. Cost: $8M. Grants +6 EcoTech." },
    th: { title: "นักวิจัยชั้นนำพร้อมรับสมัคร", description: "นักวิจัย AI อาวุโสจาก startup ที่กำลังล้มต้องการเข้าร่วม R&D ค่าจ้าง $8M รับ +6 EcoTech" },
    choices: [
      { id: "hire", effect: { capital: -8_000_000, ecotechBonus: 6 }, en: { label: "Hire Researcher (−$8M, +6 EcoTech)", description: "Long-term R&D investment" }, th: { label: "จ้างนักวิจัย (−$8M, +6 EcoTech)", description: "การลงทุน R&D ระยะยาว" } },
      { id: "poach_for_less", effect: { capital: -4_000_000, ecotechBonus: 2 }, en: { label: "Hire as Contractor (−$4M, +2 EcoTech)", description: "Partial benefit, lower commitment" }, th: { label: "จ้างแบบ Contract (−$4M, +2 EcoTech)", description: "ได้ประโยชน์บางส่วน ลงทุนน้อยกว่า" } },
      { id: "pass", effect: { morale: -3 }, en: { label: "Pass on this Opportunity", description: "Miss the chance, team morale drops" }, th: { label: "ปฏิเสธโอกาสนี้", description: "พลาดโอกาส ขวัญกำลังใจลดลง" } },
    ],
  },
  {
    id: "regulation_warning", type: "regulation",
    en: { title: "Data Privacy Regulation Incoming", description: "Government signals upcoming privacy laws. Early compliance costs capital but avoids future penalties." },
    th: { title: "กฎระเบียบความเป็นส่วนตัวกำลังมา", description: "รัฐบาลส่งสัญญาณกฎหมาย privacy ที่กำลังจะมา ปฏิบัติตามเนิ่นๆ เสียเงินแต่หลีกเลี่ยงค่าปรับในอนาคต" },
    choices: [
      { id: "early_comply", effect: { capital: -3_000_000, morale: 15 }, en: { label: "Comply Early (−$3M, +Morale)", description: "Show leadership in responsibility" }, th: { label: "ปฏิบัติตามเนิ่นๆ (−$3M, +ขวัญกำลังใจ)", description: "แสดงความเป็นผู้นำด้านความรับผิดชอบ" } },
      { id: "wait_watch", effect: { morale: -5 }, en: { label: "Monitor & Wait", description: "Defer until law passes" }, th: { label: "ติดตามและรอ", description: "รอจนกฎหมายผ่าน" } },
      { id: "lobby", effect: { capital: -1_500_000, morale: -10 }, en: { label: "Lobby Against It (−$1.5M)", description: "Fight the regulation, reputational risk" }, th: { label: "ล็อบบี้คัดค้าน (−$1.5M)", description: "ต่อสู้กับกฎระเบียบ เสี่ยงด้านชื่อเสียง" } },
    ],
  },
  {
    id: "tech_breakthrough_event", type: "tech",
    en: { title: "R&D Breakthrough Opportunity", description: "Your team discovered a new battery chemistry. Invest heavily to commercialize it and gain a competitive edge." },
    th: { title: "โอกาสก้าวหน้าทาง R&D", description: "ทีมของคุณค้นพบเคมีแบตเตอรี่ใหม่ ลงทุนเพื่อนำมาใช้เชิงพาณิชย์และได้เปรียบการแข่งขัน" },
    choices: [
      { id: "invest_heavy", effect: { capital: -10_000_000, ecotechBonus: 5, techLevel: 1 }, en: { label: "Full Investment (−$10M, +5 EcoTech, +1 Tech)", description: "Fast-track to market, high cost" }, th: { label: "ลงทุนเต็มที่ (−$10M, +5 EcoTech, +1 Tech)", description: "รีบนำสู่ตลาด ต้นทุนสูง" } },
      { id: "invest_modest", effect: { capital: -4_000_000, ecotechBonus: 2 }, en: { label: "Modest Investment (−$4M, +2 EcoTech)", description: "Slower but sustainable" }, th: { label: "ลงทุนพอประมาณ (−$4M, +2 EcoTech)", description: "ช้ากว่าแต่ยั่งยืนกว่า" } },
      { id: "license_out", effect: { capital: 3_000_000 }, en: { label: "License the Patent (+$3M)", description: "Sell the rights, don't build in-house" }, th: { label: "อนุญาตสิทธิบัตร (+$3M)", description: "ขายสิทธิ์ ไม่พัฒนาภายใน" } },
    ],
  },
  {
    id: "talent_war", type: "market",
    en: { title: "Talent War", description: "A competitor is poaching your senior engineers with 60% salary bumps." },
    th: { title: "สงครามแย่งชิงความสามารถ", description: "คู่แข่งดึงวิศวกรอาวุโสของคุณด้วยการขึ้นเงินเดือน 60%" },
    choices: [
      { id: "counter_offer", effect: { capital: -6_000_000, morale: 20 }, en: { label: "Counter-Offer Team (−$6M)", description: "Match competitor packages" }, th: { label: "เสนอค่าตอบแทนสูงกว่า (−$6M)", description: "แข่งกับแพ็คเกจคู่แข่ง" } },
      { id: "let_go", effect: { morale: -20, ecotechBonus: -2 }, en: { label: "Let Some Engineers Go", description: "Lose talent, lose research speed" }, th: { label: "ปล่อยวิศวกรบางส่วนไป", description: "สูญเสียความสามารถและความเร็ว R&D" } },
      { id: "culture_fix", effect: { capital: -2_000_000, morale: 12 }, en: { label: "Invest in Culture (−$2M, +Morale)", description: "Long-term retention strategy" }, th: { label: "ลงทุนในวัฒนธรรมองค์กร (−$2M, +ขวัญกำลังใจ)", description: "กลยุทธ์ retention ระยะยาว" } },
    ],
  },
  {
    id: "market_bubble", type: "market",
    en: { title: "Speculative Market Bubble", description: "Analyst predictions show a 30% demand surge for premium devices. Do you ramp up or stay cautious?" },
    th: { title: "ฟองสบู่ตลาดแบบ speculative", description: "นักวิเคราะห์คาดการณ์ความต้องการ premium device เพิ่ม 30% คุณจะเพิ่มหรือรอดู?" },
    choices: [
      { id: "ramp_up", effect: { capital: -8_000_000, morale: 10, marketShare: 5 }, en: { label: "Aggressively Ramp Production (−$8M)", description: "High risk, high reward" }, th: { label: "เพิ่มการผลิตเชิงรุก (−$8M)", description: "ความเสี่ยงสูง ผลตอบแทนสูง" } },
      { id: "stay_cautious", effect: { capital: 2_000_000 }, en: { label: "Stay Conservative (+$2M from efficiency)", description: "No risk, moderate reward" }, th: { label: "รอดูสถานการณ์ (+$2M จากประสิทธิภาพ)", description: "ไม่เสี่ยง ผลตอบแทนพอควร" } },
    ],
  },
  {
    id: "patent_war", type: "regulation",
    en: { title: "Patent Infringement Claim", description: "A tech giant is threatening a lawsuit over your display technology. Settle or fight." },
    th: { title: "คดีละเมิดสิทธิบัตร", description: "บริษัทเทคยักษ์ใหญ่กำลังขู่ฟ้องเกี่ยวกับเทคโนโลยีหน้าจอของคุณ จะยอมความหรือสู้?" },
    choices: [
      { id: "settle", effect: { capital: -12_000_000 }, en: { label: "Settle Out of Court (−$12M)", description: "Expensive but quick resolution" }, th: { label: "ยอมความนอกศาล (−$12M)", description: "แพงแต่จบเร็ว" } },
      { id: "fight", effect: { capital: -5_000_000, morale: -15 }, en: { label: "Fight in Court (−$5M upfront, risky)", description: "Cheaper if you win, catastrophic if you lose" }, th: { label: "สู้ในศาล (−$5M ล่วงหน้า เสี่ยง)", description: "ถูกกว่าถ้าชนะ แต่หายนะถ้าแพ้" } },
      { id: "pivot_tech", effect: { capital: -3_000_000, techLevel: -1 }, en: { label: "Redesign to Avoid Patent (−$3M, −1 Tech)", description: "Safe but sets you back technically" }, th: { label: "ออกแบบใหม่หลีกเลี่ยงสิทธิบัตร (−$3M, −1 Tech)", description: "ปลอดภัย แต่ถดถอยเชิงเทค" } },
    ],
  },
];

const BOT_POSITIVE_EVENTS = [
  { label: "Bot received $20M investor injection", capitalDelta: 20_000_000 },
  { label: "Bot supply deal locked in — costs −10%", capitalDelta: 8_000_000 },
  { label: "Bot brand partnership — market share +2%", capitalDelta: 5_000_000 },
  { label: "Bot government contract secured: +$15M", capitalDelta: 15_000_000 },
];

const BOT_NEGATIVE_EVENTS = [
  { label: "Bot hit with $12M regulatory fine", capitalDelta: -12_000_000 },
  { label: "Bot supply crisis — revenue impact −$8M", capitalDelta: -8_000_000 },
  { label: "Bot executive scandal — capital penalty −$15M", capitalDelta: -15_000_000 },
  { label: "Bot product recall — $10M liability", capitalDelta: -10_000_000 },
];

// ===== HELPERS =====
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickDirectives(): BoardDirective[] {
  // Always include 1 dark tactic in the pool after Q4 (25% chance)
  const darkTactics: BoardDirective[] = ["planned_obsolescence", "industrial_espionage"];
  const normal = ALL_DIRECTIVES.filter((d) => !darkTactics.includes(d));
  const pool = [...normal].sort(() => Math.random() - 0.5).slice(0, 3);
  // 30% chance to swap one slot for a dark tactic
  if (Math.random() < 0.30) {
    pool[Math.floor(Math.random() * 3)] = pickRandom(darkTactics);
  }
  return pool;
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

// ===== v4.0: Bot Schedule — Persona Aware =====
function generateBotSchedule(
  bot: BotState,
  quarter: number,
  persona: BotPersonaType | null,
  playerPrice: number,
): BotScheduledAction[] {
  const actions: BotScheduledAction[] = [];
  const aggression = Math.min(0.3 + quarter * 0.04, 0.85);

  if (Math.random() < 0.8) {
    let targetPrice: number;
    if (persona === "discount_king") {
      const discount = 0.15 + Math.random() * 0.10;
      targetPrice = Math.floor(playerPrice * (1 - discount));
    } else if (persona === "tech_premium") {
      const premium = 0.15 + Math.random() * 0.10;
      targetPrice = Math.floor(Math.max(bot.price, playerPrice) * (1 + premium));
    } else if (persona === "copycat") {
      const noise = Math.floor(Math.random() * 41) - 20;
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
    let prodShift: number;
    if (persona === "discount_king") {
      prodShift = Math.floor(Math.random() * 3 + 1) * 1_000_000;
    } else if (persona === "tech_premium") {
      prodShift = (Math.random() < 0.35 ? -1 : 1) * Math.floor(Math.random() * 2 + 1) * 500_000;
    } else {
      const dir = Math.random() < 0.55 ? -1 : 1;
      prodShift = dir * Math.floor(Math.random() * 3 + 1) * 1_000_000;
    }
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

// ===== RESOLUTION ENGINE v4.0 =====
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
): Omit<ResolutionResult, "botEventLabel" | "darkTacticsCaught" | "darkTacticsLabel" | "tradeBanApplied" | "prDisasterApplied" | "hypeFulfilled"> {

  // === Unit Cost (Exponential Bottleneck + CEO modifier) ===
  const factoryDiscount = upgrades.componentFactory ? 0.75 : 1.0;
  const memoryDiscount = [1.0, 1.0, 1.0, 0.97, 0.95, 0.93][clamp(components.memory, 0, 5)];
  const baseCost = BASE_UNIT_COST * factoryDiscount * memoryDiscount * ceoBackground.productionCostModifier;

  const prodRatio = draft.productionBudget / 10_000_000;
  let costMultiplier = 1 + Math.pow(prodRatio, 2) * 0.4;
  if (executives.coo) costMultiplier = Math.min(costMultiplier, 1.5);
  if (boardDirective === "aggressive_rd") costMultiplier *= 1.10;
  if (boardDirective === "cost_cutting")  costMultiplier *= 0.85;
  if (boardDirective === "supply_chain_deal") costMultiplier *= 0.85;

  const effectiveUnitCost = Math.round(baseCost * costMultiplier);

  // === Capacity ===
  let playerCapacity = Math.floor(draft.productionBudget * 0.8 / effectiveUnitCost);
  // Trade ban: player cannot sell this quarter
  if (tradeBanActive) playerCapacity = 0;

  const botBaseCost = bot.hasFactory ? BASE_UNIT_COST * 0.75 : BASE_UNIT_COST;
  const botCapacityRaw = Math.floor(bot.productionBudget * 0.8 / botBaseCost);
  const botCapacity = sabotage.ddosPending ? Math.floor(botCapacityRaw * 0.70) : botCapacityRaw;

  // === 3-Segment Market ===
  const BUDGET_SEG = TOTAL_MARKET * 0.40;
  const TECH_SEG   = TOTAL_MARKET * 0.30;
  const BRAND_SEG  = TOTAL_MARKET * 0.30;

  // Budget share: lower price wins
  const budgetShare = clamp(0.5 + (bot.price - draft.price) / 300, 0.05, 0.95);

  // Tech share: tech level + espionage bonus
  const espionageTechBonus = boardDirective === "industrial_espionage" ? 2 : 0;
  const chipMultiplier = [1.0, 1.0, 1.12, 1.25, 1.40, 1.60][clamp(components.chip, 0, 5)];
  const rawTechShare = 0.5 + (player.techLevel + espionageTechBonus - (bot.techLevel + (bot.components?.chip ?? 1) * 0.2)) * 0.10;
  const techShare = clamp(rawTechShare * chipMultiplier, 0.05, 0.97);

  // Brand share + CEO modifier
  const displayBrandBonus = components.display >= 5 ? 1.20 : components.display >= 4 ? 1.10 : 1.0;
  const brandShare = clamp(
    (0.5 + (player.brandPerception - bot.brandPerception) * 0.008) * displayBrandBonus * ceoBackground.brandLoyalistBonus,
    0.05, 0.95
  );

  // Price elasticity (CEO priceCeilingModifier + premium_focus directive)
  const displayCeilingMult = [1.0, 1.0, 1.15, 1.35, 1.60, 2.00][clamp(components.display, 0, 5)];
  let maxViablePrice = player.techLevel * 200 * displayCeilingMult * ceoBackground.priceCeilingModifier;
  if (boardDirective === "premium_focus") maxViablePrice *= 1.15; // premium focus lifts ceiling

  let demandFactor = 1.0;
  if (draft.price > maxViablePrice) {
    demandFactor = Math.max(0.02, 1 - (draft.price - maxViablePrice) / 700);
  }

  // Battery milestone penalty
  const batteryPenaltyApplied = quarter >= 3 && components.battery < 2;
  let revenueMultiplier = batteryPenaltyApplied ? 0.80 : 1.0;

  // Flash sale: revenue per unit × 0.80
  if (boardDirective === "flash_sale") revenueMultiplier *= 0.80;

  // Memory + Battery demand bonuses
  const memBudgetBonus = [1.0, 1.0, 1.06, 1.12, 1.18, 1.25][clamp(components.memory, 0, 5)];
  const batteryBudgetBonus = components.battery >= 4 ? 1.08 : 1.0;

  // === Demand Multipliers ===
  let demandMult = 1.0;
  if (boardDirective === "market_expansion")    demandMult = 1.12;
  if (boardDirective === "planned_obsolescence") demandMult = 1.30; // dark tactic demand boost
  if (boardDirective === "flash_sale")           demandMult = 1.25;
  if (boardDirective === "viral_launch")         demandMult *= 1.10;
  if (prDisasterActive)   demandMult *= 0.50; // PR Disaster halves all demand
  if (hypeCampaignActive) demandMult *= 1.40; // Hype campaign boosts demand

  const budgetVolumeMult = boardDirective === "volume_play" ? 1.15 : 1.0;
  const techVolumePenalty = boardDirective === "volume_play" ? 0.95 : 1.0;

  // === Raw Demand per Segment ===
  const playerBudgetDemand = BUDGET_SEG * budgetShare * memBudgetBonus * batteryBudgetBonus * budgetVolumeMult * demandMult;
  const playerTechDemand   = TECH_SEG   * techShare   * demandFactor * techVolumePenalty * demandMult;
  const playerBrandDemand  = BRAND_SEG  * brandShare  * demandMult;
  const playerRawDemand = tradeBanActive ? 0 : Math.floor(playerBudgetDemand + playerTechDemand + playerBrandDemand);

  const botBrandMod = sabotage.prPending ? 0.93 : 1.0;
  const botRawDemand = Math.floor(
    BUDGET_SEG * (1 - budgetShare) +
    TECH_SEG   * (1 - techShare) +
    BRAND_SEG  * (1 - brandShare) * botBrandMod
  );

  // === Sales ===
  const playerSales = Math.min(playerCapacity, playerRawDemand);
  const botSales    = Math.min(botCapacity, botRawDemand);

  // Segment breakdown
  const demandTotal = Math.max(playerRawDemand, 1);
  const segBudget = Math.floor(playerSales * (playerBudgetDemand / demandTotal));
  const segTech   = Math.floor(playerSales * (playerTechDemand   / demandTotal));
  const segBrand  = Math.max(0, playerSales - segBudget - segTech);

  // === E-Waste (CEO eWastePenaltyReduction) ===
  const playerUnsold = Math.max(0, playerCapacity - playerRawDemand);
  const cfoEWaste = executives.cfo ? 0.70 : 1.0;
  const eWastePenalty = Math.floor(playerUnsold * effectiveUnitCost * 1.5 * ceoBackground.eWastePenaltyReduction * cfoEWaste);

  // === Revenue & Profit ===
  const playerRevenue = Math.floor(playerSales * draft.price * revenueMultiplier);
  const playerVariableCost = playerSales * effectiveUnitCost;
  let playerFixedCost = draft.productionBudget * 0.2;
  if (boardDirective === "austerity")        playerFixedCost *= 0.85;
  if (boardDirective === "headcount_freeze") playerFixedCost *= 0.75;
  const grossProfit = playerRevenue - playerVariableCost - playerFixedCost;
  const playerProfit = grossProfit - eWastePenalty;

  // Directive direct costs
  const directiveCost = boardDirective === "brand_campaign"    ? 5_000_000
    : boardDirective === "talent_retention" ? 3_000_000
    : boardDirective === "viral_launch"     ? 8_000_000 : 0;

  const debtRepayment = loans.quartersRemaining > 0 ? loans.repaymentPerQuarter : 0;
  const capitalChange = playerProfit - debtRepayment - directiveCost;

  // Bot financials
  const botRevenue = botSales * bot.price;
  const botCost = botSales * botBaseCost + bot.productionBudget * 0.2;
  const botProfit = botRevenue - botCost;

  // === Market share ===
  const newPlayerShare = (playerSales + botSales) > 0
    ? (playerSales / (playerSales + botSales)) * 100
    : player.marketShare;

  // === Metrics Changes ===
  const techGrowth = upgrades.legendaryEngineer ? 2
    : boardDirective === "aggressive_rd" ? 1 : 0;

  let brandChange = playerSales > botSales ? 4 : playerSales < botSales ? -3 : 0;
  if (boardDirective === "brand_campaign") brandChange += 15;
  if (boardDirective === "cost_cutting")   brandChange -= 5;
  if (boardDirective === "viral_launch")   brandChange += 20;
  if (components.battery >= 3) brandChange += 3;

  let moraleChange = playerSales > botSales * 1.1 ? 8 : playerSales < botSales * 0.9 ? -8 : 0;
  if (boardDirective === "austerity")        moraleChange -= 5;
  if (boardDirective === "talent_retention") moraleChange += 10;
  if (boardDirective === "headcount_freeze") moraleChange -= 10;

  // === EcoTech Earned ===
  let ecotechEarned = 2; // base
  if (upgrades.legendaryEngineer) ecotechEarned += 2;
  if (components.chip >= 4) ecotechEarned += 1;
  if (boardDirective === "aggressive_rd")   ecotechEarned += 3;
  if (boardDirective === "green_initiative") ecotechEarned += 3;
  ecotechEarned = Math.round(ecotechEarned * ceoBackground.ecotechModifier);

  // === Summary ===
  let summaryKey = "summaries.default";
  if (tradeBanActive)                                              summaryKey = "summaries.espionage_banned";
  else if (prDisasterActive)                                       summaryKey = "summaries.hype_disaster";
  else if (batteryPenaltyApplied)                                  summaryKey = "summaries.battery_penalty";
  else if (demandFactor < 0.3)                                     summaryKey = "summaries.elasticity";
  else if (eWastePenalty > 0 && eWastePenalty > playerRevenue * 0.20) summaryKey = "summaries.ewaste";
  else if (playerSales > botSales * 1.35)                          summaryKey = "summaries.dominant";
  else if (playerSales < botSales * 0.65)                          summaryKey = "summaries.rough";
  else if (capitalChange < 0)                                      summaryKey = "summaries.burning";
  else if (playerSales > botSales && capitalChange > 2_000_000)    summaryKey = "summaries.strong";
  else                                                             summaryKey = "summaries.neckAndNeck";

  return {
    playerSalesUnits: playerSales, botSalesUnits: botSales,
    playerRevenue, botRevenue, grossProfit, playerProfit, botProfit,
    newPlayerMarketShare: clamp(newPlayerShare, 3, 97),
    newBotMarketShare: clamp(100 - newPlayerShare, 3, 97),
    capitalChange, moraleChange, brandChange, ecotechEarned,
    eWastePenalty, eWasteUnits: playerUnsold, debtRepayment, techGrowth,
    effectiveUnitCost, playerCapacity, playerRawDemand, demandFactor,
    segmentBudget: segBudget, segmentTech: segTech, segmentBrand: segBrand,
    batteryPenaltyApplied, summaryKey,
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

  // v4.0 Bot Persona
  botPersona: BotPersonaType | null;

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

  components: ComponentsState;
  boardDirective: BoardDirective | null;
  pendingDirectives: BoardDirective[];
  antitrust: AntitrustState;
  capitalHistory: CapitalHistoryEntry[];

  lastResolution: ResolutionResult | null;

  // v4.0 Special States
  hypeCampaign: HypeCampaignState | null;
  tradeBanActive: boolean;     // active this quarter (set from previous quarter's espionage catch)
  prDisasterActive: boolean;   // active this quarter (set from previous quarter's hype fail)

  // ===== ACTIONS =====
  startGame: () => void;
  selectCEOBackground: (type: CEOBackgroundType) => void;
  advanceToBoardMeeting: () => void;
  chooseBoardDirective: (d: BoardDirective) => void;
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

  // v4.0
  launchHypeCampaign: () => void;

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

  // ===== ACTIONS =====

  // Legacy startGame — now a no-op; game starts at ceoselect and player calls selectCEOBackground
  startGame: () => {
    // Do nothing; selectCEOBackground handles game start
  },

  // v4.0: CEO Selection — assigns random bot persona, starts intel phase
  selectCEOBackground: (type) => {
    const ceoBackground = CEO_BACKGROUNDS[type];
    const personaTypes: BotPersonaType[] = ["discount_king", "tech_premium", "copycat"];
    const botPersona = personaTypes[Math.floor(Math.random() * 3)];
    const intel = generateMarketIntel(INIT_PLAYER);
    set({
      ceoBackground,
      botPersona,
      phase: "intel",
      quarter: 1,
      gameResult: "playing",
      marketIntel: intel,
      capitalHistory: [{ quarter: 0, playerCapital: INIT_PLAYER.capital, botCapital: INIT_BOT.capital }],
      player: { ...INIT_PLAYER },
      draft: { ...INIT_DRAFT },
      bot: { ...INIT_BOT },
      components: { ...INIT_COMPONENTS },
      executives: { cfo: false, coo: false },
      upgrades: { componentFactory: false, legendaryEngineer: false },
      loans: { ...INIT_LOANS },
      antitrust: { ...INIT_ANTITRUST },
      hypeCampaign: null,
      tradeBanActive: false,
      prDisasterActive: false,
      boardDirective: null,
      lastResolution: null,
    });
  },

  advanceToBoardMeeting: () => {
    set({ phase: "boardmeeting", pendingDirectives: pickDirectives() });
  },

  chooseBoardDirective: (d) => {
    const event = pickRandom(EVENTS);
    set({ boardDirective: d, phase: "event", currentEvent: event });
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

  // v4.0: pass persona + current player price to bot schedule generator
  startActionPhase: () => {
    const { bot, quarter, botPersona, draft } = get();
    const schedule = generateBotSchedule(bot, quarter, botPersona, draft.price);
    const midKey = Math.random() < 0.55
      ? `mid_events.m${Math.floor(Math.random() * 7) + 1}`
      : null;
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
        const fuzzedPrice = action.type === "price"
          ? `~$${Math.round((newBot.price + (Math.random() - 0.5) * 100) / 10) * 10}–$${Math.round((newBot.price + (Math.random() + 0.5) * 100) / 10) * 10}`
          : "";
        const msg = action.type === "price"
          ? `INTEL: Bot adjusted pricing (est. ${fuzzedPrice})`
          : `INTEL: ${action.label}`;
        newAlerts.push({
          id: `alert-${Date.now()}-${action.triggerAtSecond}`,
          message: msg,
          timestamp: Date.now(),
          type: action.type,
        });
      }
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

  // ===== LOCK AND RESOLVE v4.0 =====
  lockAndResolve: () => {
    const {
      player, draft, bot, executives, upgrades, loans, sabotage,
      components, boardDirective, quarter, antitrust, capitalHistory,
      ceoBackground, hypeCampaign, tradeBanActive, prDisasterActive, botPersona,
    } = get();

    if (!ceoBackground) return;

    // === Core resolution ===
    const rawResult = resolveQuarter(
      player, draft, bot, executives, upgrades, loans, sabotage,
      components, boardDirective, quarter, ceoBackground,
      !!(hypeCampaign?.active && !hypeCampaign?.fulfilled),
      tradeBanActive,
      prDisasterActive,
    );

    // === Bot Events ===
    let botEventLabel: string | null = null;
    let botCapitalDelta = 0;
    const botEventRoll = Math.random();
    if (botEventRoll < 0.25) {
      const ev = pickRandom(BOT_POSITIVE_EVENTS);
      botEventLabel = ev.label;
      botCapitalDelta = ev.capitalDelta;
    } else if (botEventRoll < 0.42) {
      const ev = pickRandom(BOT_NEGATIVE_EVENTS);
      botEventLabel = ev.label;
      botCapitalDelta = ev.capitalDelta;
    }

    // === Bot Auto-Upgrade (Tech Premium gets 2 upgrades per quarter) ===
    const maxBotUpgrades = botPersona === "tech_premium" ? 2 : 1;
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

    // Bot tech growth (Tech Premium grows faster)
    const botTechGrowth = botPersona === "tech_premium"
      ? (quarter % 2 === 0 ? 1 : 0)
      : (quarter % 4 === 0 ? 1 : 0);

    const newBotCapital = clamp(bot.capital + rawResult.botProfit + botCapitalDelta, 0, Infinity);
    const newBot: BotState = {
      ...bot,
      capital: newBotCapital,
      marketShare: rawResult.newBotMarketShare,
      components: botComponents,
      ecotech: spentEco,
      techLevel: Math.min(bot.techLevel + botTechGrowth, 10),
    };

    // === Antitrust ===
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
      if (newAntitrust.playerBlockedQuartersLeft <= 0) {
        newAntitrust.playerBlocked = false;
      }
    }

    // === Loan Update ===
    let newLoans = { ...loans };
    if (loans.quartersRemaining > 0) {
      newLoans.quartersRemaining--;
      newLoans.outstanding = Math.max(0, newLoans.outstanding - newLoans.repaymentPerQuarter);
    }

    // === Player Base Update ===
    let newPlayerCapital = clamp(
      player.capital + rawResult.capitalChange - antitrustFine,
      0, Infinity
    );
    let newPlayer: PlayerMetrics = {
      capital: newPlayerCapital,
      morale: clamp(player.morale + rawResult.moraleChange, 0, 100),
      techLevel: clamp(player.techLevel + rawResult.techGrowth, 1, 10),
      marketShare: rawResult.newPlayerMarketShare,
      intelPoints: clamp(player.intelPoints - draft.intelAllocation + 1, 0, 20),
      brandPerception: clamp(player.brandPerception + rawResult.brandChange, 0, 100),
      ecotech: player.ecotech + rawResult.ecotechEarned,
    };

    // === v4.0: Dark Tactics Risk Rolls ===
    let newTradeBanActive = false;   // reset from previous quarter
    let newPrDisasterActive = false; // reset from previous quarter
    let darkTacticsCaught = false;
    let darkTacticsLabel: string | null = null;

    // Planned Obsolescence: 15% chance of getting caught
    if (boardDirective === "planned_obsolescence" && Math.random() < 0.15) {
      darkTacticsCaught = true;
      darkTacticsLabel = "summaries.planned_obs_caught";
      // Immediate penalties
      newPlayer = {
        ...newPlayer,
        capital:     clamp(newPlayer.capital - 10_000_000, 0, Infinity),
        marketShare: clamp(newPlayer.marketShare - 20, 0, 100),
        morale:      clamp(newPlayer.morale - 30, 0, 100),
      };
    }

    // Industrial Espionage: 20% chance of trade ban next quarter
    if (boardDirective === "industrial_espionage" && Math.random() < 0.20) {
      darkTacticsCaught = true;
      newTradeBanActive = true;
      darkTacticsLabel = "summaries.espionage_banned";
    }

    // Apply PR Disaster fine if it was active this quarter
    if (prDisasterActive) {
      newPlayer = {
        ...newPlayer,
        capital: clamp(newPlayer.capital - 10_000_000, 0, Infinity),
      };
    }

    // === v4.0: Hype Campaign Check ===
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
        newPrDisasterActive = true; // next quarter gets PR disaster
        newHypeCampaign = null;
      }
    }

    // === v4.0: Green Initiative free battery upgrade ===
    let newComponents = { ...components };
    if (boardDirective === "green_initiative" && components.battery < 2) {
      newComponents = { ...newComponents, battery: 2 };
    }

    // === Capital History ===
    const newHistory: CapitalHistoryEntry[] = [
      ...capitalHistory,
      { quarter, playerCapital: newPlayer.capital, botCapital: newBotCapital },
    ];

    // === Summary Override ===
    let finalSummaryKey = rawResult.summaryKey;
    if (antitrustFine > 0)         finalSummaryKey = "summaries.antitrust";
    else if (darkTacticsLabel)     finalSummaryKey = darkTacticsLabel;
    else if (hypeFulfilled)        finalSummaryKey = "summaries.hype_fulfilled";
    else if (prDisasterActive)     finalSummaryKey = "summaries.hype_disaster";

    const finalResult: ResolutionResult = {
      ...rawResult,
      botEventLabel,
      summaryKey: finalSummaryKey,
      darkTacticsCaught,
      darkTacticsLabel,
      tradeBanApplied: tradeBanActive,
      prDisasterApplied: prDisasterActive,
      hypeFulfilled,
    };

    // === Win Check ===
    let gameResult: GameResult = "playing";
    if (newPlayer.capital <= 0) gameResult = "bankrupt";
    else if (newPlayer.capital >= INSTANT_WIN_CAPITAL) gameResult = "won_instant";

    set({
      phase: "resolution",
      player: newPlayer,
      bot: newBot,
      loans: newLoans,
      antitrust: newAntitrust,
      capitalHistory: newHistory,
      lastResolution: finalResult,
      gameResult,
      components: newComponents,
      sabotage: { ...get().sabotage, ddosPending: false, prPending: false },
      tradeBanActive: newTradeBanActive,
      prDisasterActive: newPrDisasterActive,
      hypeCampaign: newHypeCampaign,
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
      boardDirective: null,
      sabotage: { ddosPending: false, prPending: false, cooldown: false },
    });
  },

  toggleLanguage: () => set((s) => ({ language: s.language === "en" ? "th" : "en" })),

  hireExecutive: (type) => {
    const { player, executives, phase, antitrust } = get();
    if (phase === "action") return;
    if (antitrust.playerBlocked) return;
    if (executives[type]) return;
    const cost = 40_000_000;
    if (player.capital < cost) return;
    set({ player: { ...player, capital: player.capital - cost }, executives: { ...executives, [type]: true } });
  },

  purchaseUpgrade: (type) => {
    const { player, upgrades, phase, antitrust } = get();
    if (phase === "action") return;
    if (upgrades[type]) return;
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
    if (phase === "action") return;
    if (loans.quartersRemaining > 0) return;
    if (loans.totalLoansEver >= 3) return;
    const repayment = executives.cfo ? 25_000_000 : 30_000_000;
    set({
      player: { ...player, capital: player.capital + 100_000_000 },
      loans: {
        outstanding: 100_000_000,
        quartersRemaining: 4,
        repaymentPerQuarter: repayment,
        totalLoansEver: loans.totalLoansEver + 1,
      },
    });
  },

  acceptBiddingWar: () => {
    const { player, upgrades } = get();
    const extra = 20_000_000;
    if (player.capital < extra) {
      set({ biddingWar: { active: false, engineerSigned: false } });
      return;
    }
    set({
      player: { ...player, capital: player.capital - extra },
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
    if (phase === "action" || sabotage.cooldown) return;
    if (antitrust.playerBlocked) return;
    if (type === "ddos") {
      if (player.capital < 10_000_000 || player.intelPoints < 3) return;
      set({ player: { ...player, capital: player.capital - 10_000_000, intelPoints: player.intelPoints - 3 }, sabotage: { ...sabotage, ddosPending: true, cooldown: true } });
    } else {
      if (player.capital < 5_000_000 || player.intelPoints < 2) return;
      set({ player: { ...player, capital: player.capital - 5_000_000, intelPoints: player.intelPoints - 2 }, sabotage: { ...sabotage, prPending: true, cooldown: true } });
    }
  },

  // v4.0: Apply ecotechCostModifier to upgrade costs
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
    set({
      components: { ...components, [comp]: currentLevel + 1 },
      player: { ...player, ecotech: player.ecotech - actualCost },
    });
  },

  // v4.0: Hype Campaign — costs $5M, boosts demand +40%, must upgrade tech by deadline
  launchHypeCampaign: () => {
    const { player, quarter, components, hypeCampaign, phase } = get();
    if (phase !== "action") return;
    if (hypeCampaign?.active && !hypeCampaign.fulfilled) return;
    if (player.capital < 5_000_000) return;
    const compTotal = components.chip + components.battery + components.display + components.memory;
    set({
      player: { ...player, capital: player.capital - 5_000_000 },
      hypeCampaign: {
        active: true,
        deadline: quarter + 2,
        techLevelAtLaunch: player.techLevel,
        componentTotalAtLaunch: compTotal,
        fulfilled: false,
      },
    });
  },

  resetGame: () => {
    set({
      phase: "ceoselect",
      quarter: 1,
      gameResult: "playing",
      player: { ...INIT_PLAYER },
      draft: { ...INIT_DRAFT },
      ceoBackground: null,
      botPersona: null,
      bot: { ...INIT_BOT },
      quarterTimer: QUARTER_DURATION,
      timerRunning: false,
      playerReady: false,
      botLocked: false,
      botLockTime: 20,
      currentEvent: null,
      marketIntel: generateMarketIntel(INIT_PLAYER),
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
      capitalHistory: [{ quarter: 0, playerCapital: INIT_PLAYER.capital, botCapital: INIT_BOT.capital }],
      lastResolution: null,
      hypeCampaign: null,
      tradeBanActive: false,
      prDisasterActive: false,
    });
  },
}));

export { COMPONENT_UPGRADE_COSTS };
