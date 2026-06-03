// ===== SILICON EMPIRE v3 — Type Definitions =====
// ประเภทข้อมูลหลักของเกม Silicon Empire

export type GamePhase =
  | "ceoselect"     // เฟสเลือก CEO Career (ก่อนเริ่มเกม)
  | "intel"         // เฟสข่าวกรองตลาด
  | "boardmeeting"  // เฟสประชุมบอร์ด (เลือก Directive + ดู Component Status)
  | "event"         // เฟสเหตุการณ์สุ่ม
  | "action"        // เฟสดำเนินการ (ตั้งราคา + กำลังผลิต)
  | "resolution"    // เฟสสรุปผลไตรมาส
  | "gameover";     // จบเกม

export type GameResult =
  | "playing"          // กำลังเล่น
  | "won_instant"      // ชนะทันที (ถึง $1B)
  | "won_timeout"      // ชนะหมดเวลา (ทุนสูงกว่า Q16)
  | "won_timeout_lost" // แพ้หมดเวลา (ทุนน้อยกว่า Q16)
  | "bankrupt";        // ล้มละลาย

export type BoardDirective =
  | "aggressive_rd"    // R&D เชิงรุก: +2 EcoTech, +10% ต้นทุน
  | "austerity"        // มาตรการรัดเข็มขัด: -15% fixed cost, -5 morale
  | "market_expansion" // ขยายตลาด: +10% demand, margin ลดลง
  | "brand_campaign"   // แคมเปญแบรนด์: +15 brand, -$5M
  | "cost_cutting"     // ลดต้นทุน: -15% unit cost, -5 brand
  | "talent_retention" // รักษาพนักงาน: +10 morale, -$3M
  | "premium_focus"    // โฟกัส premium: price ceiling +15%
  | "volume_play";     // เน้นปริมาณ: budget demand +15%, tech demand -5%

// ระดับของแต่ละ component (0=ไม่มี, 1-5=ระดับ 1-5)
export interface ComponentsState {
  chip: number;    // Processor: ส่งผลต่อ Tech Enthusiast segment
  battery: number; // Battery: milestone requirement + brand
  display: number; // Display: ส่งผลต่อ price ceiling + Brand Loyalist
  memory: number;  // Memory: ส่งผลต่อ Budget Buyer segment + unit cost
}

export type CEOBackgroundType = "visionary" | "marketer" | "operator";

export interface CEOBackground {
  type: CEOBackgroundType;
  productionCostModifier: number;  // คูณกับต้นทุนการผลิต base
  ecotechModifier: number;         // คูณกับ EcoTech earned per quarter
  brandLoyalistBonus: number;      // คูณกับ brand segment demand
  eWastePenaltyReduction: number;  // ลดค่าปรับ E-Waste (เป็น %)
  priceCeilingModifier: number;    // คูณกับ price ceiling
}

export interface PlayerMetrics {
  capital: number;          // ทุนรวม (เงิน)
  morale: number;           // ขวัญกำลังใจทีม (0-100)
  techLevel: number;        // ระดับเทคโนโลยีรวม (1-10)
  marketShare: number;      // ส่วนแบ่งตลาด (%)
  intelPoints: number;      // แต้มข่าวกรอง
  brandPerception: number;  // ความนิยมของแบรนด์ (0-100) — ใหม่ v3
  ecotech: number;          // แต้ม EcoTech สำหรับ upgrade components — ใหม่ v3
}

export interface PlayerDraft {
  price: number;            // ราคาต่อหน่วย
  productionBudget: number; // งบประมาณการผลิต (เพิ่มสเกลเป็น $1M-$20M ใน v3)
  intelAllocation: number;  // จำนวน Intel Points ที่จัดสรร
}

export interface BotState {
  price: number;
  productionBudget: number;
  capital: number;
  marketShare: number;
  techLevel: number;           // ระดับเทค bot (เพิ่มขึ้นตามเวลา) — ใหม่ v3
  brandPerception: number;     // Bot ก็มี brand perception ด้วย — ใหม่ v3
  ecotech: number;             // Bot R&D equivalent
  components: ComponentsState; // Bot ก็ upgrade components ได้ — ใหม่ v3
  lastMoveLabel: string | null;
  lastMoveTime: number | null;
  hasFactory: boolean;
}

export interface Executives {
  cfo: boolean; // CFO: ลดดอกเบี้ยกู้ + ลด E-Waste penalty
  coo: boolean; // COO: จำกัด cost multiplier
}

export interface Upgrades {
  componentFactory: boolean;  // ลดต้นทุนชิ้นส่วน 25%
  legendaryEngineer: boolean; // +2 EcoTech/quarter + tech growth
}

// สถานะเงินกู้ธนาคาร — แก้บัก: ใช้ได้ 1 ครั้งต่อเกมหรือหลังชำระหมด
export interface LoanState {
  outstanding: number;         // ยอดหนี้คงค้าง
  quartersRemaining: number;   // ไตรมาสที่เหลือต้องชำระ
  repaymentPerQuarter: number; // ยอดชำระต่อไตรมาส
  totalLoansEver: number;      // จำนวนครั้งที่กู้ทั้งหมด (limit: max 3 ครั้ง)
}

export interface BiddingWar {
  active: boolean;
  engineerSigned: boolean | null;
}

export interface SabotageState {
  ddosPending: boolean; // โจมตี DDOS bot ไตรมาสนี้
  prPending: boolean;   // PR warfare bot ไตรมาสนี้
  cooldown: boolean;    // ใช้ไปแล้วไตรมาสนี้
}

// สถานะ Antitrust — เมื่อครองตลาด >60% ติดต่อกัน 2 ไตรมาส
export interface AntitrustState {
  playerHighShareStreak: number;  // ไตรมาสที่ผู้เล่นครอง >60% ติดกัน
  playerBlocked: boolean;         // ถูกระงับ M&A + Sabotage
  playerBlockedQuartersLeft: number; // เหลืออีกกี่ไตรมาส
}

// ประวัติทุนสำหรับแสดงกราฟ — ใหม่ v3
export interface CapitalHistoryEntry {
  quarter: number;
  playerCapital: number;
  botCapital: number;
}

// Bilingual text สำหรับ events
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
    intelBonus?: number;   // +Intel Points
    ecotechBonus?: number; // +EcoTech Points — ใหม่ v3
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

// ผลลัพธ์การสรุปผลไตรมาส — ขยายใน v3
export interface ResolutionResult {
  // ยอดขาย
  playerSalesUnits: number;
  botSalesUnits: number;
  // รายได้
  playerRevenue: number;
  botRevenue: number;
  grossProfit: number;
  playerProfit: number;
  botProfit: number;
  // ส่วนแบ่งตลาด
  newPlayerMarketShare: number;
  newBotMarketShare: number;
  // การเปลี่ยนแปลง
  capitalChange: number;
  moraleChange: number;
  brandChange: number;         // การเปลี่ยนแปลง brand perception
  ecotechEarned: number;       // EcoTech ที่ได้รับไตรมาสนี้
  // ค่าปรับและหนี้
  eWastePenalty: number;
  eWasteUnits: number;
  debtRepayment: number;
  // เทค
  techGrowth: number;
  // ข้อมูลเพิ่มเติมสำหรับ UI
  effectiveUnitCost: number;
  playerCapacity: number;
  playerRawDemand: number;
  demandFactor: number;
  // 3-segment breakdown — ใหม่ v3
  segmentBudget: number;      // player sales from Budget Buyers
  segmentTech: number;        // player sales from Tech Enthusiasts
  segmentBrand: number;       // player sales from Brand Loyalists
  // Component milestone violations
  batteryPenaltyApplied: boolean;
  // Bot events this quarter
  botEventLabel: string | null;
  // Summary
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
