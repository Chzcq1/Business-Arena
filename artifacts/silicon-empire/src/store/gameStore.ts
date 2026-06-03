// ===== SILICON EMPIRE v3 — Game Store =====
// Zustand store หลักของเกม ควบคุมทุก state และ action

import { create } from "zustand";
import type {
  GamePhase, GameResult, PlayerMetrics, PlayerDraft, BotState,
  Executives, Upgrades, LoanState, BiddingWar, SabotageState,
  AntitrustState, ComponentsState, BoardDirective, QuarterEvent,
  IntelAlert, ResolutionResult, MarketIntel, BotScheduledAction,
  CapitalHistoryEntry, CEOBackgroundType, CEOBackground,
} from "./types";

// ===== CONSTANTS =====
const QUARTER_DURATION = 60;              // เวลาต่อไตรมาส (วินาที)
const MAX_QUARTERS = 16;                  // จำนวนไตรมาสทั้งหมด
const INSTANT_WIN_CAPITAL = 1_000_000_000; // เงื่อนไขชนะทันที: $1B
const BASE_UNIT_COST = 200;               // ต้นทุนฐานต่อหน่วย $200
const TOTAL_MARKET = 5_000_000;           // ตลาดรวม 5 ล้านหน่วย (v3: เพิ่มสเกล)

// ===== CEO BACKGROUND DEFINITIONS =====
const CEO_BACKGROUNDS: Record<CEOBackgroundType, CEOBackground> = {
  visionary: {
    type: "visionary",
    productionCostModifier: 1.0,   // ต้นทุนปกติ
    ecotechModifier: 1.25,         // EcoTech +25% (เน้น R&D)
    brandLoyalistBonus: 1.15,      // Brand segment +15%
    eWastePenaltyReduction: 0.85,  // E-Waste penalty −15%
    priceCeilingModifier: 1.1,     // Price ceiling +10%
  },
  marketer: {
    type: "marketer",
    productionCostModifier: 0.9,   // ต้นทุน −10%
    ecotechModifier: 1.0,          // EcoTech ปกติ
    brandLoyalistBonus: 1.3,       // Brand segment +30% (เน้นแบรนด์มากที่สุด)
    eWastePenaltyReduction: 1.0,   // E-Waste penalty ปกติ
    priceCeilingModifier: 1.0,     // Price ceiling ปกติ
  },
  operator: {
    type: "operator",
    productionCostModifier: 0.85,  // ต้นทุน −15% (เน้นประสิทธิภาพ)
    ecotechModifier: 1.0,          // EcoTech ปกติ
    brandLoyalistBonus: 1.0,       // Brand segment ปกติ
    eWastePenaltyReduction: 0.7,   // E-Waste penalty −30% (ลดมากที่สุด)
    priceCeilingModifier: 0.95,    // Price ceiling −5% (ต้องให้ราคาน้อยกว่า)
  },
};

// ต้นทุน EcoTech สำหรับ upgrade component แต่ละระดับ
// index = ระดับที่จะ upgrade ไป (L1→L2=index 2, L2→L3=index 3, ฯลฯ)
const COMPONENT_UPGRADE_COSTS: Record<keyof ComponentsState, number[]> = {
  chip:    [0, 0, 3, 5, 8, 12],  // โปรเซสเซอร์
  battery: [0, 0, 2, 4, 6, 9],   // แบตเตอรี่
  display: [0, 0, 3, 5, 8, 11],  // หน้าจอ
  memory:  [0, 0, 2, 3, 5, 8],   // หน่วยความจำ
};

// pool ของ Board Directives ทั้งหมด — สุ่ม 3 ตัวต่อไตรมาส
const ALL_DIRECTIVES: BoardDirective[] = [
  "aggressive_rd", "austerity", "market_expansion",
  "brand_campaign", "cost_cutting", "talent_retention",
  "premium_focus", "volume_play",
];

// Events ที่สุ่มเกิดขึ้นในแต่ละไตรมาส
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
      { id: "let_go", effect: { morale: -20, ecotechBonus: -2 }, en: { label: "Let Some Engineers Go (−Morale, −EcoTech)", description: "Lose talent, lose research speed" }, th: { label: "ปล่อยวิศวกรบางส่วนไป (−ขวัญกำลังใจ, −EcoTech)", description: "สูญเสียความสามารถและความเร็ว R&D" } },
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

// Bot events ที่สุ่มเกิดขึ้น — ทำให้บอทมีความไม่แน่นอนเหมือนกัน
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

// ===== HELPER FUNCTIONS =====
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// สุ่ม 3 Directives จาก pool
function pickDirectives(): BoardDirective[] {
  return [...ALL_DIRECTIVES].sort(() => Math.random() - 0.5).slice(0, 3);
}

// สร้าง Market Intel สำหรับ intel phase
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

// สร้าง Bot schedule actions สำหรับ action phase
function generateBotSchedule(bot: BotState, quarter: number): BotScheduledAction[] {
  const actions: BotScheduledAction[] = [];
  const aggression = Math.min(0.3 + quarter * 0.04, 0.85);

  if (Math.random() < 0.8) {
    const priceChange = (Math.random() < aggression ? -1 : 1) * (Math.floor(Math.random() * 6) + 2) * 10;
    actions.push({
      triggerAtSecond: Math.floor(Math.random() * 25) + 20,
      executed: false,
      label: priceChange < 0 ? `Bot cut price by $${Math.abs(priceChange)}!` : `Bot raised price $${Math.abs(priceChange)}`,
      type: "price",
      delta: { price: clamp(bot.price + priceChange, 299, 3000) },
    });
  }

  if (Math.random() < 0.7) {
    const shift = (Math.random() < 0.55 ? -1 : 1) * Math.floor(Math.random() * 3 + 1) * 1_000_000;
    actions.push({
      triggerAtSecond: Math.floor(Math.random() * 20) + 5,
      executed: false,
      label: shift > 0 ? "Bot ramped up production!" : "Bot trimmed production budget.",
      type: "production",
      delta: { productionBudget: clamp(bot.productionBudget + shift, 1_000_000, 20_000_000) },
    });
  }

  return actions.sort((a, b) => a.triggerAtSecond - b.triggerAtSecond);
}

// ===== RESOLUTION ENGINE (หัวใจหลักของเกม) =====
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
): Omit<ResolutionResult, "botEventLabel"> {

  // === ต้นทุนต่อหน่วย (สูตร Exponential Bottleneck v3 + CEO modifier) ===
  const factoryDiscount = upgrades.componentFactory ? 0.75 : 1.0;
  // Memory L3+ ลดต้นทุนการผลิต
  const memoryDiscount = [1.0, 1.0, 1.0, 0.97, 0.95, 0.93][clamp(components.memory, 0, 5)];
  const baseCost = BASE_UNIT_COST * factoryDiscount * memoryDiscount * ceoBackground.productionCostModifier;

  // Bottleneck formula: ยิ่งผลิตมาก ยิ่งแพง (anti-exploit)
  // $5M → 1.1×, $10M → 1.4×, $15M → 1.9×, $20M → 2.6×
  const prodRatio = draft.productionBudget / 10_000_000;
  let costMultiplier = 1 + Math.pow(prodRatio, 2) * 0.4;
  if (executives.coo) costMultiplier = Math.min(costMultiplier, 1.5); // COO cap ที่ 1.5×
  if (boardDirective === "aggressive_rd") costMultiplier *= 1.10;     // R&D เชิงรุก: +10% cost
  if (boardDirective === "cost_cutting") costMultiplier *= 0.85;      // ปรับต้นทุน: −15% cost

  const effectiveUnitCost = Math.round(baseCost * costMultiplier);

  // === กำลังการผลิต ===
  const playerCapacity = Math.floor(draft.productionBudget * 0.8 / effectiveUnitCost);

  // Bot capacity
  const botBaseCost = bot.hasFactory ? BASE_UNIT_COST * 0.75 : BASE_UNIT_COST;
  const botCapacityRaw = Math.floor(bot.productionBudget * 0.8 / botBaseCost);
  const botCapacity = sabotage.ddosPending ? Math.floor(botCapacityRaw * 0.70) : botCapacityRaw;

  // === 3-Segment Market (ตลาดแบ่งเป็น 3 กลุ่ม) ===
  const BUDGET_SEG = TOTAL_MARKET * 0.40;   // Budget Buyers: เน้นราคา
  const TECH_SEG   = TOTAL_MARKET * 0.30;   // Tech Enthusiasts: เน้น tech level
  const BRAND_SEG  = TOTAL_MARKET * 0.30;   // Brand Loyalists: เน้น brand

  // Budget Buyers: ราคาถูกกว่า = ได้ส่วนแบ่งมากกว่า
  const budgetShare = clamp(0.5 + (bot.price - draft.price) / 300, 0.05, 0.95);

  // Tech Enthusiasts: tech level + chip upgrade
  const chipMultiplier = [1.0, 1.0, 1.12, 1.25, 1.40, 1.60][clamp(components.chip, 0, 5)];
  const rawTechShare = 0.5 + (player.techLevel - (bot.techLevel + (bot.components?.chip ?? 1) * 0.2)) * 0.10;
  const techShare = clamp(rawTechShare * chipMultiplier, 0.05, 0.97);

  // Brand Loyalists: brand perception + display + CEO modifier
  const displayBrandBonus = components.display >= 5 ? 1.20 : components.display >= 4 ? 1.10 : 1.0;
  const brandShare = clamp((0.5 + (player.brandPerception - bot.brandPerception) * 0.008) * displayBrandBonus * ceoBackground.brandLoyalistBonus, 0.05, 0.95);

  // Price elasticity: ราคาเกิน tech ceiling → demand ลด + CEO modifier
  const displayCeilingMult = [1.0, 1.0, 1.15, 1.35, 1.60, 2.00][clamp(components.display, 0, 5)];
  const maxViablePrice = player.techLevel * 200 * displayCeilingMult * ceoBackground.priceCeilingModifier;
  let demandFactor = 1.0;
  if (draft.price > maxViablePrice) {
    demandFactor = Math.max(0.02, 1 - (draft.price - maxViablePrice) / 700);
  }

  // Battery milestone: Q3+ ต้องมี battery L2 มิฉะนั้น revenue -20%
  const batteryPenaltyApplied = quarter >= 3 && components.battery < 2;
  const revenueMultiplier = batteryPenaltyApplied ? 0.80 : 1.0;

  // Memory bonus ใน budget segment
  const memBudgetBonus = [1.0, 1.0, 1.06, 1.12, 1.18, 1.25][clamp(components.memory, 0, 5)];
  // Battery L4+ ช่วย budget demand
  const batteryBudgetBonus = components.battery >= 4 ? 1.08 : 1.0;

  // Directive adjustments
  const demandMult = boardDirective === "market_expansion" ? 1.12 : 1.0;
  const budgetVolumeMult = boardDirective === "volume_play" ? 1.15 : 1.0;
  const techVolumePenalty = boardDirective === "volume_play" ? 0.95 : 1.0;

  // Raw demand ต่อ segment
  const playerBudgetDemand = BUDGET_SEG * budgetShare * memBudgetBonus * batteryBudgetBonus * budgetVolumeMult * demandMult;
  const playerTechDemand   = TECH_SEG   * techShare   * demandFactor * techVolumePenalty * demandMult;
  const playerBrandDemand  = BRAND_SEG  * brandShare  * demandMult;
  const playerRawDemand = Math.floor(playerBudgetDemand + playerTechDemand + playerBrandDemand);

  // Bot demand (inverse + sabotage)
  const botBrandMod = sabotage.prPending ? 0.93 : 1.0;
  const botRawDemand = Math.floor(
    BUDGET_SEG * (1 - budgetShare) +
    TECH_SEG   * (1 - techShare) +
    BRAND_SEG  * (1 - brandShare) * botBrandMod
  );

  // === ยอดขายจริง = min(กำลังผลิต, ความต้องการ) ===
  const playerSales = Math.min(playerCapacity, playerRawDemand);
  const botSales    = Math.min(botCapacity, botRawDemand);

  // Segment breakdown (เพื่อแสดงใน UI)
  const demandTotal = Math.max(playerRawDemand, 1);
  const segBudget = Math.floor(playerSales * (playerBudgetDemand / demandTotal));
  const segTech   = Math.floor(playerSales * (playerTechDemand   / demandTotal));
  const segBrand  = Math.max(0, playerSales - segBudget - segTech);

  // === ค่าปรับ E-Waste: สูตร SEVERE v3 + CEO reduction ===
  // Capital Deduction = UnsoldInventory × UnitCost × 1.5 × (1 - CEO reduction)
  // (บน: ทำให้การผลิตสูงสุดโดยไม่ดูตลาดเป็นหายนะ)
  const playerUnsold = Math.max(0, playerCapacity - playerRawDemand);
  const baseEWaste = playerUnsold * effectiveUnitCost * 1.5;
  const eWastePenalty = Math.floor(baseEWaste * ceoBackground.eWastePenaltyReduction);

  // === รายได้และกำไร ===
  const playerRevenue = Math.floor(playerSales * draft.price * revenueMultiplier);
  const playerVariableCost = playerSales * effectiveUnitCost;
  let playerFixedCost = draft.productionBudget * 0.2;
  if (boardDirective === "austerity") playerFixedCost *= 0.85;        // Austerity ลด fixed cost
  const grossProfit = playerRevenue - playerVariableCost - playerFixedCost;
  const playerProfit = grossProfit - eWastePenalty;

  // Board directive direct capital costs (จ่ายใน lockAndResolve)
  const directiveCost = boardDirective === "brand_campaign" ? 5_000_000
    : boardDirective === "talent_retention" ? 3_000_000 : 0;

  // หนี้สิน
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

  // === Metrics changes ===
  const techGrowth = upgrades.legendaryEngineer ? 2
    : boardDirective === "aggressive_rd" ? 1 : 0;

  let brandChange = playerSales > botSales ? 4 : playerSales < botSales ? -3 : 0;
  if (boardDirective === "brand_campaign") brandChange += 15;
  if (boardDirective === "cost_cutting") brandChange -= 5;
  if (components.battery >= 3) brandChange += 3; // Battery L3+ passive brand gain

  let moraleChange = playerSales > botSales * 1.1 ? 8 : playerSales < botSales * 0.9 ? -8 : 0;
  if (boardDirective === "austerity") moraleChange -= 5;
  if (boardDirective === "talent_retention") moraleChange += 10;

  // EcoTech earned ไตรมาสนี้ + CEO modifier
  let ecotechEarned = 2; // base
  if (upgrades.legendaryEngineer) ecotechEarned += 2;
  if (components.chip >= 4) ecotechEarned += 1;
  if (boardDirective === "aggressive_rd") ecotechEarned += 3;
  ecotechEarned = Math.round(ecotechEarned * ceoBackground.ecotechModifier);

  // Summary key
  let summaryKey = "summaries.default";
  if (batteryPenaltyApplied) summaryKey = "summaries.battery_penalty";
  else if (demandFactor < 0.3) summaryKey = "summaries.elasticity";
  else if (eWastePenalty > 0 && eWastePenalty > playerRevenue * 0.20) summaryKey = "summaries.ewaste";
  else if (playerSales > botSales * 1.35) summaryKey = "summaries.dominant";
  else if (playerSales < botSales * 0.65) summaryKey = "summaries.rough";
  else if (capitalChange < 0) summaryKey = "summaries.burning";
  else if (playerSales > botSales && capitalChange > 2_000_000) summaryKey = "summaries.strong";
  else summaryKey = "summaries.neckAndNeck";

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
// เพิ่มทุนเริ่มต้นเป็น $50M (v3: economy rebalance)
const INIT_PLAYER: PlayerMetrics = {
  capital: 50_000_000, morale: 65, techLevel: 3,
  marketShare: 45, intelPoints: 3, brandPerception: 50, ecotech: 5,
};
// งบการผลิตใหม่: $5M (v3: จาก $80K เดิม × 100 เพื่อให้รายได้สมเหตุสมผล)
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
  // Core state
  phase: GamePhase;
  quarter: number;
  gameResult: GameResult;
  language: "en" | "th";

  // Player
  player: PlayerMetrics;
  draft: PlayerDraft;
  ceoBackground: CEOBackground | null;  // ใหม่: ท่าที CEO

  // Bot
  bot: BotState;

  // Timer (Action Phase)
  quarterTimer: number;
  timerRunning: boolean;
  playerReady: boolean;
  botLocked: boolean;
  botLockTime: number;

  // Intel & Events
  currentEvent: QuarterEvent | null;
  marketIntel: MarketIntel | null;
  intelAlerts: IntelAlert[];
  midQuarterEventKey: string | null;
  botSchedule: BotScheduledAction[];

  // Upgrades
  executives: Executives;
  upgrades: Upgrades;
  loans: LoanState;
  biddingWar: BiddingWar | null;
  sabotage: SabotageState;

  // v3 systems
  components: ComponentsState;           // Component tech tree
  boardDirective: BoardDirective | null;  // Directive ที่เลือกไตรมาสนี้
  pendingDirectives: BoardDirective[];    // 3 choices สำหรับ board meeting
  antitrust: AntitrustState;             // Anti-trust watchdog
  capitalHistory: CapitalHistoryEntry[]; // ประวัติทุนสำหรับกราฟ

  // Resolution
  lastResolution: ResolutionResult | null;

  // ===== ACTIONS =====
  startGame: () => void;
  selectCEOBackground: (type: CEOBackgroundType) => void;  // ใหม่: เลือก CEO class
  advanceToBoardMeeting: () => void;   // intel → board meeting
  chooseBoardDirective: (d: BoardDirective) => void; // board meeting → event
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

  // Corporate upgrades
  hireExecutive: (type: "cfo" | "coo") => void;
  purchaseUpgrade: (type: "componentFactory" | "legendaryEngineer") => void;
  // แก้บัก loan: ใช้ได้เมื่อไม่มีหนี้ค้างอยู่ + สูงสุด 3 ครั้ง
  takeOutLoan: () => void;
  acceptBiddingWar: () => void;
  withdrawBiddingWar: () => void;
  launchSabotage: (type: "ddos" | "pr") => void;

  // v3 actions
  upgradeComponent: (comp: keyof ComponentsState) => void;

  resetGame: () => void;
}

// ===== STORE =====
export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  phase: "ceoselect",
  quarter: 1,
  gameResult: "playing",
  language: "en",

  player: { ...INIT_PLAYER },
  draft: { ...INIT_DRAFT },
  ceoBackground: null,
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

  // ===== ACTIONS =====

  startGame: () => {
    const intel = generateMarketIntel(INIT_PLAYER);
    set({
      phase: "intel",
      quarter: 1,
      gameResult: "playing",
      marketIntel: intel,
      capitalHistory: [{ quarter: 0, playerCapital: INIT_PLAYER.capital, botCapital: INIT_BOT.capital }],
    });
  },

  // ใหม่: เลือก CEO Background แล้วไปยัง intel phase
  selectCEOBackground: (type) => {
    const ceoBackground = CEO_BACKGROUNDS[type];
    const intel = generateMarketIntel(INIT_PLAYER);
    set({
      ceoBackground,
      phase: "intel",
      quarter: 1,
      gameResult: "playing",
      marketIntel: intel,
      capitalHistory: [{ quarter: 0, playerCapital: INIT_PLAYER.capital, botCapital: INIT_BOT.capital }],
    });
  },

  // intel → board meeting (v3: เพิ่ม board meeting phase)
  advanceToBoardMeeting: () => {
    set({ phase: "boardmeeting", pendingDirectives: pickDirectives() });
  },

  // เลือก directive แล้วไปยัง event phase
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
        capital:          clamp(player.capital + (e.capital || 0), 0, Infinity),
        morale:           clamp(player.morale + (e.morale || 0), 0, 100),
        techLevel:        clamp(player.techLevel + (e.techLevel || 0), 1, 10),
        marketShare:      clamp(player.marketShare + (e.marketShare || 0), 0, 100),
        intelPoints:      clamp(player.intelPoints + (e.intelBonus || 0), 0, 20),
        brandPerception:  clamp(player.brandPerception, 0, 100),
        ecotech:          clamp(player.ecotech + (e.ecotechBonus || 0), 0, 99),
      },
      currentEvent: null,
    });
  },

  startActionPhase: () => {
    const { bot, quarter } = get();
    const schedule = generateBotSchedule(bot, quarter);
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

    // ตรวจสอบ bot lock
    let newBotLocked = state.botLocked;
    if (!state.botLocked && elapsed >= state.botLockTime) {
      newBotLocked = true;
      if (state.playerReady) {
        set({ quarterTimer: 0, timerRunning: false, playerReady: false, botLocked: false });
        get().lockAndResolve();
        return;
      }
    }

    // Execute bot scheduled actions
    const pendingActions = state.botSchedule.filter((a) => !a.executed && a.triggerAtSecond <= elapsed);
    let newBot = { ...state.bot };
    let newSchedule = [...state.botSchedule];
    const newAlerts: IntelAlert[] = [];

    for (const action of pendingActions) {
      newBot = { ...newBot, ...action.delta, lastMoveLabel: action.label, lastMoveTime: elapsed };
      newSchedule = newSchedule.map((a) =>
        a.triggerAtSecond === action.triggerAtSecond ? { ...a, executed: true } : a
      );
      // แสดง alert เฉพาะเมื่อผู้เล่นจัดสรร intel (v3: fog of war — แสดงช่วง ไม่ใช่ค่าตรง)
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

  lockAndResolve: () => {
    const { player, draft, bot, executives, upgrades, loans, sabotage, components, boardDirective, quarter, antitrust, capitalHistory, ceoBackground } = get();

    // ตรวจสอบว่า CEO Background มีการเลือกแล้ว
    if (!ceoBackground) return;

    // คำนวณผลลัพธ์ (pure function)
    const rawResult = resolveQuarter(
      player, draft, bot, executives, upgrades, loans, sabotage,
      components, boardDirective, quarter, ceoBackground
    );

    // === Bot Events (v3: บอทมีเหตุการณ์ด้วย) ===
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

    // === Bot Component Auto-Upgrade (v3: บอทพัฒนา components ด้วย) ===
    const newBotEcotech = (bot.ecotech || 0) + 2 + Math.floor(bot.techLevel / 3);
    const botComponents = { ...bot.components };
    let spentEco = newBotEcotech;
    // บอท priority: chip → display → memory → battery
    for (const comp of ["chip", "display", "memory", "battery"] as (keyof ComponentsState)[]) {
      const lvl = botComponents[comp];
      if (lvl < 5) {
        const cost = COMPONENT_UPGRADE_COSTS[comp][lvl + 1] ?? 99;
        if (spentEco >= cost) {
          (botComponents as Record<string, number>)[comp] = lvl + 1;
          spentEco -= cost;
          break; // อัพเกรดทีละ 1 ต่อไตรมาส
        }
      }
    }

    // === Bot State Update ===
    const newBotCapital = clamp(bot.capital + rawResult.botProfit + botCapitalDelta, 0, Infinity);
    const newBot: BotState = {
      ...bot,
      capital: newBotCapital,
      marketShare: rawResult.newBotMarketShare,
      components: botComponents,
      ecotech: spentEco,
      // Bot ปรับ tech level ช้าๆ
      ...(quarter % 4 === 0 ? { techLevel: Math.min(bot.techLevel + 1, 10) } : {}),
    } as BotState & { techLevel?: number };

    // === Antitrust Check (v3) ===
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

    // === Player State Update ===
    const newCapital = clamp(
      player.capital + rawResult.capitalChange - antitrustFine,
      0, Infinity
    );
    const newPlayer: PlayerMetrics = {
      capital: newCapital,
      morale: clamp(player.morale + rawResult.moraleChange, 0, 100),
      techLevel: clamp(player.techLevel + rawResult.techGrowth, 1, 10),
      marketShare: rawResult.newPlayerMarketShare,
      intelPoints: clamp(player.intelPoints - draft.intelAllocation + 1, 0, 20),
      brandPerception: clamp(player.brandPerception + rawResult.brandChange, 0, 100),
      ecotech: player.ecotech + rawResult.ecotechEarned,
    };

    // === Capital History ===
    const newHistory: CapitalHistoryEntry[] = [
      ...capitalHistory,
      { quarter, playerCapital: newCapital, botCapital: newBotCapital },
    ];

    // === Summary override if antitrust ===
    const finalResult: ResolutionResult = {
      ...rawResult,
      botEventLabel,
      summaryKey: antitrustFine > 0 ? "summaries.antitrust" : rawResult.summaryKey,
    };

    // === Win Condition Check ===
    let gameResult: GameResult = "playing";
    if (newCapital <= 0) gameResult = "bankrupt";
    else if (newCapital >= INSTANT_WIN_CAPITAL) gameResult = "won_instant";

    // === Sabotage Reset ===
    set({
      phase: "resolution",
      player: newPlayer,
      bot: newBot,
      loans: newLoans,
      antitrust: newAntitrust,
      capitalHistory: newHistory,
      lastResolution: finalResult,
      gameResult,
      sabotage: { ...get().sabotage, ddosPending: false, prPending: false },
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
    if (antitrust.playerBlocked) return; // Antitrust block
    if (executives[type]) return;
    const cost = 40_000_000;
    if (player.capital < cost) return;
    set({ player: { ...player, capital: player.capital - cost }, executives: { ...executives, [type]: true } });
  },

  purchaseUpgrade: (type) => {
    const { player, upgrades, executives, phase, antitrust } = get();
    if (phase === "action") return;
    if (upgrades[type]) return;
    // M&A blocked by antitrust
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

  // แก้บัก: ห้ามกู้ซ้ำถ้ายังมีหนี้ค้างอยู่ และสูงสุด 3 ครั้งตลอดเกม
  takeOutLoan: () => {
    const { player, loans, executives, phase } = get();
    if (phase === "action") return;
    // ตรวจสอบว่ามีหนี้อยู่แล้วหรือไม่
    if (loans.quartersRemaining > 0) return; // มีหนี้อยู่ ห้ามกู้ใหม่
    // ตรวจสอบ limit สูงสุด 3 ครั้ง
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
    if (antitrust.playerBlocked) return; // Antitrust block
    if (type === "ddos") {
      if (player.capital < 10_000_000 || player.intelPoints < 3) return;
      set({ player: { ...player, capital: player.capital - 10_000_000, intelPoints: player.intelPoints - 3 }, sabotage: { ...sabotage, ddosPending: true, cooldown: true } });
    } else {
      if (player.capital < 5_000_000 || player.intelPoints < 2) return;
      set({ player: { ...player, capital: player.capital - 5_000_000, intelPoints: player.intelPoints - 2 }, sabotage: { ...sabotage, prPending: true, cooldown: true } });
    }
  },

  // v3: อัพเกรด Component ด้วย EcoTech Points
  upgradeComponent: (comp) => {
    const { player, components, phase } = get();
    if (phase === "action") return;
    const currentLevel = components[comp];
    if (currentLevel >= 5) return; // ถึงระดับสูงสุดแล้ว
    const cost = COMPONENT_UPGRADE_COSTS[comp][currentLevel + 1];
    if (!cost || player.ecotech < cost) return;
    set({
      components: { ...components, [comp]: currentLevel + 1 },
      player: { ...player, ecotech: player.ecotech - cost },
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
    });
  },
}));

// Export upgrade costs for UI
export { COMPONENT_UPGRADE_COSTS };
