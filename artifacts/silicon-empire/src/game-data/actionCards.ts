// ==========================================
// 🃏 ACTION CARDS — ไพ่ยุทธวิธีสำหรับ Black Market
// ==========================================
//
// ไฟล์นี้กำหนดไพ่ทั้งหมดที่ผู้เล่นซื้อได้ใน Black Market Phase
// (หลัง Board Meeting ก่อน Event Phase)
//
// ============================================================
// ✅ วิธีเพิ่มไพ่ใหม่ (ง่ายมาก ไม่ต้องรู้โค้ด):
// ============================================================
//
// คัดลอก Object ตัวอย่างด้านล่าง วางต่อท้าย ACTION_CARDS array
// แล้วแก้ข้อมูลตามต้องการ:
//
// {
//   id: "my_card",            ← ID ต้องไม่ซ้ำ (ภาษาอังกฤษ ขีดล่าง)
//   icon: "🎲",               ← emoji ที่แสดงบนไพ่
//   cost: 5_000_000,          ← ราคา (หน่วย: ดอลลาร์, 5_000_000 = $5M)
//   rarity: "common",         ← "common" | "rare" | "legendary"
//   en: {
//     title: "Card Name",
//     desc: "Short description",
//     effectDesc: "Effect: +30% demand this quarter",
//   },
//   th: {
//     title: "ชื่อไพ่ภาษาไทย",
//     desc: "คำอธิบายสั้นๆ",
//     effectDesc: "ผล: เพิ่ม demand +30% ไตรมาสนี้",
//   },
//   effect: {
//     // เลือก effect ที่ต้องการ (ลบบรรทัดที่ไม่ใช้ออกได้)
//     botCapacityMult: 0.70,         ← กำลังผลิต Bot × 0.70 (ลด 30%)
//     botBrandDelta: -25,            ← Brand ของ Bot −25 คะแนน
//     playerDemandMult: 1.30,        ← Demand ผู้เล่น × 1.30 (+30%)
//     playerTechBonus: 2,            ← Tech Level ผู้เล่น +2 ไตรมาสนี้
//     playerBrandBonus: 25,          ← Brand Perception ผู้เล่น +25
//     revealBotExact: true,          ← เห็นราคาและ Budget จริงของ Bot ใน Action Phase
//     botFreezeSeconds: 15,          ← แสดงป้าย "BOT FROZEN" 15 วินาที (visual only)
//     cyberShield: true,             ← ป้องกัน Trade Ban และ PR Disaster ไตรมาสนี้
//   },
// }
//
// 💡 Tips:
//   - "common" = ราคาถูก, effect เบา
//   - "rare" = ราคากลาง, effect ดี
//   - "legendary" = ราคาแพง, effect แรง
//   - ใส่หลาย effect ในไพ่เดียวกันได้
//   - ราคาแนะนำ: common $3-6M | rare $7-10M | legendary $11-15M
//
// ============================================================

export interface ActionCardEffect {
  botCapacityMult?: number;     // คูณกำลังผลิต Bot ใน resolution (< 1.0 = ลด)
  botBrandDelta?: number;       // เปลี่ยน brand ของ Bot (ค่าลบ = ลด)
  playerDemandMult?: number;    // คูณ demand ของผู้เล่น (> 1.0 = เพิ่ม)
  playerTechBonus?: number;     // เพิ่ม tech level ผู้เล่นชั่วคราว
  playerBrandBonus?: number;    // เพิ่ม brand ผู้เล่นถาวร ณ ไตรมาสนี้
  revealBotExact?: boolean;     // เปิดเผยตัวเลขจริงของ Bot ใน Action Phase
  botFreezeSeconds?: number;    // วินาทีที่แสดง "BOT FROZEN" animation
  cyberShield?: boolean;        // ป้องกัน Trade Ban / PR Disaster ไตรมาสนี้
}

export interface ActionCard {
  id: string;
  icon: string;
  cost: number;
  rarity: "common" | "rare" | "legendary";
  en: { title: string; desc: string; effectDesc: string };
  th: { title: string; desc: string; effectDesc: string };
  effect: ActionCardEffect;
}

// ============================================================
// 🃏 ACTION_CARDS — เพิ่ม/แก้ไขไพ่ได้ที่นี่
// ============================================================
export const ACTION_CARDS: ActionCard[] = [
  // ── Common Cards ($3–6M) ───────────────────────────────
  {
    id: "flash_discount",
    icon: "⚡",
    cost: 4_000_000,
    rarity: "common",
    en: {
      title: "Flash Discount",
      desc: "Flood the market with a limited-time deal",
      effectDesc: "Player demand ×1.35 this quarter",
    },
    th: {
      title: "ลดราคาแฟลช",
      desc: "ทุ่มตลาดด้วยดีลราคาพิเศษระยะสั้น",
      effectDesc: "Demand ผู้เล่น ×1.35 ไตรมาสนี้",
    },
    effect: { playerDemandMult: 1.35 },
  },
  {
    id: "media_blitz",
    icon: "📣",
    cost: 5_000_000,
    rarity: "common",
    en: {
      title: "Media Blitz",
      desc: "Flood every channel with your brand story",
      effectDesc: "Brand Perception +30 this quarter",
    },
    th: {
      title: "ระดมสื่อ",
      desc: "ทุ่มโฆษณาทุกช่องทางด้วยแบรนด์คุณ",
      effectDesc: "Brand Perception +30 ไตรมาสนี้",
    },
    effect: { playerBrandBonus: 30 },
  },
  {
    id: "pr_smear",
    icon: "📰",
    cost: 6_000_000,
    rarity: "common",
    en: {
      title: "PR Smear",
      desc: "Leak damaging stories about the competition",
      effectDesc: "Bot Brand −30 this quarter",
    },
    th: {
      title: "ป้ายสีคู่แข่ง",
      desc: "ปล่อยข่าวลบเกี่ยวกับคู่แข่ง",
      effectDesc: "Brand ของ Bot −30 ไตรมาสนี้",
    },
    effect: { botBrandDelta: -30 },
  },
  // ── Rare Cards ($7–10M) ────────────────────────────────
  {
    id: "talent_raid",
    icon: "🎯",
    cost: 8_000_000,
    rarity: "rare",
    en: {
      title: "Talent Raid",
      desc: "Poach two of the bot's best engineers",
      effectDesc: "Your Tech Level +2 this quarter",
    },
    th: {
      title: "ดึงตัววิศวกร",
      desc: "ดึงตัววิศวกรที่ดีที่สุดของ Bot มา 2 คน",
      effectDesc: "Tech Level ของคุณ +2 ไตรมาสนี้",
    },
    effect: { playerTechBonus: 2 },
  },
  {
    id: "ransomware",
    icon: "🦠",
    cost: 8_000_000,
    rarity: "rare",
    en: {
      title: "Ransomware Attack",
      desc: "Deploy a targeted cyberattack on bot's factory systems",
      effectDesc: "Bot capacity −35% · Bot Frozen visual 15s",
    },
    th: {
      title: "โจมตี Ransomware",
      desc: "ส่ง ransomware ไปยังระบบโรงงานของ Bot",
      effectDesc: "กำลังผลิต Bot −35% · แสดง BOT FROZEN 15 วินาที",
    },
    effect: { botCapacityMult: 0.65, botFreezeSeconds: 15 },
  },
  {
    id: "insider_info",
    icon: "🕶️",
    cost: 9_000_000,
    rarity: "rare",
    en: {
      title: "Insider Information",
      desc: "Bribe a bot executive for classified intel",
      effectDesc: "See bot's exact price & budget during action phase",
    },
    th: {
      title: "ข้อมูลภายใน",
      desc: "จ่ายสินบนผู้บริหาร Bot เพื่อข้อมูลลับ",
      effectDesc: "เห็นราคาและ Budget จริงของ Bot ในช่วง Action Phase",
    },
    effect: { revealBotExact: true },
  },
  // ── Legendary Cards ($11–15M) ─────────────────────────
  {
    id: "supply_sabotage",
    icon: "⛓️",
    cost: 11_000_000,
    rarity: "legendary",
    en: {
      title: "Supply Chain Sabotage",
      desc: "Corrupt bot's logistics network at the source",
      effectDesc: "Bot capacity −40% + Bot Brand −20 this quarter",
    },
    th: {
      title: "ทำลายซัพพลายเชน",
      desc: "ทำลายเครือข่ายโลจิสติกส์ของ Bot ที่ต้นทาง",
      effectDesc: "กำลังผลิต Bot −40% + Brand Bot −20 ไตรมาสนี้",
    },
    effect: { botCapacityMult: 0.60, botBrandDelta: -20 },
  },
  {
    id: "cyber_shield",
    icon: "🛡️",
    cost: 7_000_000,
    rarity: "rare",
    en: {
      title: "Cyber Shield",
      desc: "Deploy full-spectrum digital and legal defense",
      effectDesc: "Blocks Trade Ban and PR Disaster this quarter",
    },
    th: {
      title: "โล่ไซเบอร์",
      desc: "ติดตั้งระบบป้องกันดิจิทัลและกฎหมายครบวงจร",
      effectDesc: "ป้องกัน Trade Ban และ PR Disaster ไตรมาสนี้",
    },
    effect: { cyberShield: true },
  },
  {
    id: "demand_surge",
    icon: "📊",
    cost: 12_000_000,
    rarity: "legendary",
    en: {
      title: "Demand Surge Protocol",
      desc: "Artificial scarcity + influencer wave = explosive demand",
      effectDesc: "Player demand ×1.50 + Brand +20 this quarter",
    },
    th: {
      title: "โปรโตคอลดีมานด์พุ่ง",
      desc: "สร้างความขาดแคลนเทียม + กระแส influencer = ดีมานด์ระเบิด",
      effectDesc: "Demand ผู้เล่น ×1.50 + Brand +20 ไตรมาสนี้",
    },
    effect: { playerDemandMult: 1.50, playerBrandBonus: 20 },
  },
];

// EquippedCard = ไพ่ที่ผู้เล่นซื้อแล้ว + ติดตาม usedAt (null = ยังไม่ได้ใช้)
export interface EquippedCard extends ActionCard {
  usedAt: number | null; // ค่า quarterTimer ตอนที่ใช้ไพ่ (null = ยังไม่ได้ใช้)
}

// จำนวนไพ่ที่แสดงใน Black Market ต่อไตรมาส (สุ่มจาก pool)
// แก้ตัวเลขนี้เพื่อเปลี่ยนจำนวนตัวเลือก
export const BLACK_MARKET_CARD_COUNT = 4;

// จำนวนสูงสุดที่ผู้เล่นถือได้พร้อมกัน
export const MAX_EQUIPPED_CARDS = 2;
