// ==========================================
// 📋 EVENTS DATA — ข้อมูล Event ทั้งหมดของเกม
// ==========================================
//
// ไฟล์นี้แบ่งออกเป็น 3 ส่วน:
//   1. EVENTS             — Event ประจำไตรมาส (เลือก choice ก่อนเล่น)
//   2. TIME_FREEZE_EVENTS — Event ฉุกเฉิน (หยุดนาฬิการะหว่าง Action Phase!)
//   3. BOT_EVENTS         — Event ที่กระทบ Bot (สุ่มทุกไตรมาส)
//
// ============================================================
// ✅ วิธีเพิ่ม QUARTERLY EVENT ใหม่ (ไม่ต้องรู้โค้ด):
// ============================================================
//
// คัดลอก Object ด้านล่างไปต่อท้าย EVENTS array แล้วแก้ข้อมูล:
//
// {
//   id: "my_event",          ← ต้องไม่ซ้ำกับ id อื่น (ใช้ภาษาอังกฤษ, ขีดล่าง)
//   type: "market",          ← เลือกได้: "supply" | "market" | "tech" | "regulation" | "research"
//   en: {
//     title: "Event Title",
//     description: "What happened? Describe the situation here.",
//   },
//   th: {
//     title: "ชื่อ Event ภาษาไทย",
//     description: "อธิบายสถานการณ์ที่เกิดขึ้น",
//   },
//   choices: [
//     {
//       id: "choice_a",      ← ต้องไม่ซ้ำใน event เดียวกัน
//       effect: {
//         capital: -5_000_000,   ← เงิน (-/+ ล้านบาท)
//         morale: 10,            ← ขวัญกำลังใจ (-100 ถึง +100)
//         techLevel: 1,          ← ระดับเทค (+/-)
//         marketShare: 5,        ← ส่วนแบ่งตลาด (+/-)
//         intelBonus: 2,         ← Intel Points (+)
//         ecotechBonus: 3,       ← EcoTech Points (+)
//       },
//       en: { label: "Button text", description: "Short explanation" },
//       th: { label: "ข้อความปุ่ม", description: "คำอธิบายสั้นๆ" },
//     },
//     // เพิ่ม choice ได้ถึง 3 อัน
//   ],
// }
//
// 💡 Effect ไหนไม่ต้องการ ลบออกหรือใส่ 0 ได้เลย
//
// ============================================================
// ✅ วิธีเพิ่ม TIME-FREEZE EVENT ใหม่ (Event หยุดเวลา):
// ============================================================
//
// คัดลอก Object ด้านล่างไปต่อท้าย TIME_FREEZE_EVENTS array:
//
// {
//   id: "my_freeze_event",
//   icon: "⚡",                  ← emoji ที่แสดงใน popup
//   urgency: "high",             ← "low" | "medium" | "high" (สีของ popup)
//   en: { title: "...", description: "..." },
//   th: { title: "...", description: "..." },
//   choices: [
//     {
//       id: "pay",
//       en: { label: "Pay $5M" },
//       th: { label: "จ่าย $5M" },
//       effect: { capital: -5_000_000 },
//     },
//     {
//       id: "refuse",
//       en: { label: "Refuse" },
//       th: { label: "ปฏิเสธ" },
//       effect: { morale: -15, techLevel: -1 },
//     },
//   ],
// }

import type { QuarterEvent } from "@/store/types";

// ============================================================
// TIME-FREEZE EVENT TYPE (นิยาม type ใหม่สำหรับ event หยุดเวลา)
// ============================================================
export interface TimeFreezeChoice {
  id: string;
  en: { label: string; desc?: string };
  th: { label: string; desc?: string };
  effect: {
    capital?: number;
    techLevel?: number;
    morale?: number;
    brandPerception?: number;
    playerDemandMult?: number; // คูณกับ demand ไตรมาสนี้ เช่น 0.85 = ลด 15%
  };
}

export interface TimeFreezeEventData {
  id: string;
  icon: string;
  urgency: "low" | "medium" | "high";
  en: { title: string; description: string };
  th: { title: string; description: string };
  choices: TimeFreezeChoice[];
}

// ============================================================
// 📅 QUARTERLY EVENTS — เพิ่ม/แก้ไขได้ที่นี่
// ============================================================
export const EVENTS: QuarterEvent[] = [
  {
    id: "supply_crunch",
    type: "supply",
    en: {
      title: "Supply Chain Disruption",
      description: "A major chip supplier faces shortages. Production costs will spike unless you act now.",
    },
    th: {
      title: "ปัญหาซัพพลายเชน",
      description: "ผู้จัดจำหน่ายชิพรายสำคัญขาดแคลน ต้นทุนการผลิตจะพุ่งสูงหากคุณไม่ดำเนินการ",
    },
    choices: [
      {
        id: "stockpile",
        effect: { capital: -5_000_000, morale: 5 },
        en: { label: "Pre-buy Components (−$5M)", description: "Lock in current pricing" },
        th: { label: "ซื้อชิ้นส่วนล่วงหน้า (−$5M)", description: "ล็อคราคาก่อนที่จะแพงขึ้น" },
      },
      {
        id: "pivot",
        effect: { techLevel: -1, morale: -5 },
        en: { label: "Use Alternative Supplier", description: "Slower components, stable supply" },
        th: { label: "เปลี่ยนซัพพลายเออร์", description: "ชิ้นส่วนช้าลงแต่ซัพพลายมั่นคง" },
      },
      {
        id: "absorb",
        effect: { capital: -2_000_000, morale: -10 },
        en: { label: "Absorb the Cost (−$2M)", description: "Pay the premium, hope it resolves" },
        th: { label: "รับต้นทุนเพิ่ม (−$2M)", description: "จ่ายส่วนต่าง หวังว่าจะผ่านเร็วๆ" },
      },
    ],
  },
  {
    id: "viral_buzz",
    type: "market",
    en: {
      title: "Viral Product Leak",
      description: "An unannounced feature leaked online and is trending. Consumer demand is surging.",
    },
    th: {
      title: "ผลิตภัณฑ์รั่วไหลเป็นไวรัล",
      description: "ฟีเจอร์ที่ยังไม่ประกาศรั่วไหลและกำลังเป็นกระแส ความต้องการพุ่งสูง",
    },
    choices: [
      {
        id: "capitalize",
        effect: { morale: 15, marketShare: 3 },
        en: { label: "Launch Teaser Campaign", description: "Ride the hype wave (+Brand)" },
        th: { label: "เปิดตัวแคมเปญทีเซอร์", description: "ขี่กระแสความฮือฮา (+แบรนด์)" },
      },
      {
        id: "deny",
        effect: { morale: -5, capital: -1_000_000 },
        en: { label: "Issue Denial (−$1M)", description: "Protect the surprise" },
        th: { label: "ออกแถลงการณ์ปฏิเสธ (−$1M)", description: "ปกป้องความเซอร์ไพรส์" },
      },
    ],
  },
  {
    id: "hire_researcher",
    type: "research",
    en: {
      title: "Top Researcher Available",
      description: "A senior AI researcher from a failing startup wants to join your R&D team. Cost: $8M. Grants +6 EcoTech.",
    },
    th: {
      title: "นักวิจัยชั้นนำพร้อมรับสมัคร",
      description: "นักวิจัย AI อาวุโสจาก startup ที่กำลังล้มต้องการเข้าร่วม R&D ค่าจ้าง $8M รับ +6 EcoTech",
    },
    choices: [
      {
        id: "hire",
        effect: { capital: -8_000_000, ecotechBonus: 6 },
        en: { label: "Hire Researcher (−$8M, +6 EcoTech)", description: "Long-term R&D investment" },
        th: { label: "จ้างนักวิจัย (−$8M, +6 EcoTech)", description: "การลงทุน R&D ระยะยาว" },
      },
      {
        id: "poach_for_less",
        effect: { capital: -4_000_000, ecotechBonus: 2 },
        en: { label: "Hire as Contractor (−$4M, +2 EcoTech)", description: "Partial benefit, lower commitment" },
        th: { label: "จ้างแบบ Contract (−$4M, +2 EcoTech)", description: "ได้ประโยชน์บางส่วน ลงทุนน้อยกว่า" },
      },
      {
        id: "pass",
        effect: { morale: -3 },
        en: { label: "Pass on this Opportunity", description: "Miss the chance, team morale drops" },
        th: { label: "ปฏิเสธโอกาสนี้", description: "พลาดโอกาส ขวัญกำลังใจลดลง" },
      },
    ],
  },
  {
    id: "regulation_warning",
    type: "regulation",
    en: {
      title: "Data Privacy Regulation Incoming",
      description: "Government signals upcoming privacy laws. Early compliance costs capital but avoids future penalties.",
    },
    th: {
      title: "กฎระเบียบความเป็นส่วนตัวกำลังมา",
      description: "รัฐบาลส่งสัญญาณกฎหมาย privacy ที่กำลังจะมา ปฏิบัติตามเนิ่นๆ เสียเงินแต่หลีกเลี่ยงค่าปรับ",
    },
    choices: [
      {
        id: "early_comply",
        effect: { capital: -3_000_000, morale: 15 },
        en: { label: "Comply Early (−$3M, +Morale)", description: "Show leadership in responsibility" },
        th: { label: "ปฏิบัติตามเนิ่นๆ (−$3M, +ขวัญกำลังใจ)", description: "แสดงความเป็นผู้นำด้านความรับผิดชอบ" },
      },
      {
        id: "wait_watch",
        effect: { morale: -5 },
        en: { label: "Monitor & Wait", description: "Defer until law passes" },
        th: { label: "ติดตามและรอ", description: "รอจนกฎหมายผ่าน" },
      },
      {
        id: "lobby",
        effect: { capital: -1_500_000, morale: -10 },
        en: { label: "Lobby Against It (−$1.5M)", description: "Fight the regulation, reputational risk" },
        th: { label: "ล็อบบี้คัดค้าน (−$1.5M)", description: "ต่อสู้กับกฎระเบียบ เสี่ยงด้านชื่อเสียง" },
      },
    ],
  },
  {
    id: "tech_breakthrough_event",
    type: "tech",
    en: {
      title: "R&D Breakthrough Opportunity",
      description: "Your team discovered a new battery chemistry. Invest heavily to commercialize it.",
    },
    th: {
      title: "โอกาสก้าวหน้าทาง R&D",
      description: "ทีมของคุณค้นพบเคมีแบตเตอรี่ใหม่ ลงทุนเพื่อนำมาใช้เชิงพาณิชย์",
    },
    choices: [
      {
        id: "invest_heavy",
        effect: { capital: -10_000_000, ecotechBonus: 5, techLevel: 1 },
        en: { label: "Full Investment (−$10M, +5 EcoTech, +1 Tech)", description: "Fast-track to market, high cost" },
        th: { label: "ลงทุนเต็มที่ (−$10M, +5 EcoTech, +1 Tech)", description: "รีบนำสู่ตลาด ต้นทุนสูง" },
      },
      {
        id: "invest_modest",
        effect: { capital: -4_000_000, ecotechBonus: 2 },
        en: { label: "Modest Investment (−$4M, +2 EcoTech)", description: "Slower but sustainable" },
        th: { label: "ลงทุนพอประมาณ (−$4M, +2 EcoTech)", description: "ช้ากว่าแต่ยั่งยืนกว่า" },
      },
      {
        id: "license_out",
        effect: { capital: 3_000_000 },
        en: { label: "License the Patent (+$3M)", description: "Sell the rights, don't build in-house" },
        th: { label: "อนุญาตสิทธิบัตร (+$3M)", description: "ขายสิทธิ์ ไม่พัฒนาภายใน" },
      },
    ],
  },
  {
    id: "talent_war",
    type: "market",
    en: {
      title: "Talent War",
      description: "A competitor is poaching your senior engineers with 60% salary bumps.",
    },
    th: {
      title: "สงครามแย่งชิงความสามารถ",
      description: "คู่แข่งดึงวิศวกรอาวุโสของคุณด้วยการขึ้นเงินเดือน 60%",
    },
    choices: [
      {
        id: "counter_offer",
        effect: { capital: -6_000_000, morale: 20 },
        en: { label: "Counter-Offer Team (−$6M)", description: "Match competitor packages" },
        th: { label: "เสนอค่าตอบแทนสูงกว่า (−$6M)", description: "แข่งกับแพ็คเกจคู่แข่ง" },
      },
      {
        id: "let_go",
        effect: { morale: -20, ecotechBonus: -2 },
        en: { label: "Let Some Engineers Go", description: "Lose talent, lose research speed" },
        th: { label: "ปล่อยวิศวกรบางส่วนไป", description: "สูญเสียความสามารถและความเร็ว R&D" },
      },
      {
        id: "culture_fix",
        effect: { capital: -2_000_000, morale: 12 },
        en: { label: "Invest in Culture (−$2M, +Morale)", description: "Long-term retention strategy" },
        th: { label: "ลงทุนในวัฒนธรรมองค์กร (−$2M, +ขวัญกำลังใจ)", description: "กลยุทธ์ retention ระยะยาว" },
      },
    ],
  },
  {
    id: "market_bubble",
    type: "market",
    en: {
      title: "Speculative Market Bubble",
      description: "Analyst predictions show a 30% demand surge for premium devices. Ramp up or stay cautious?",
    },
    th: {
      title: "ฟองสบู่ตลาดแบบ speculative",
      description: "นักวิเคราะห์คาดการณ์ความต้องการ premium device เพิ่ม 30% คุณจะเพิ่มหรือรอดู?",
    },
    choices: [
      {
        id: "ramp_up",
        effect: { capital: -8_000_000, morale: 10, marketShare: 5 },
        en: { label: "Aggressively Ramp Production (−$8M)", description: "High risk, high reward" },
        th: { label: "เพิ่มการผลิตเชิงรุก (−$8M)", description: "ความเสี่ยงสูง ผลตอบแทนสูง" },
      },
      {
        id: "stay_cautious",
        effect: { capital: 2_000_000 },
        en: { label: "Stay Conservative (+$2M from efficiency)", description: "No risk, moderate reward" },
        th: { label: "รอดูสถานการณ์ (+$2M จากประสิทธิภาพ)", description: "ไม่เสี่ยง ผลตอบแทนพอควร" },
      },
    ],
  },
  {
    id: "patent_war",
    type: "regulation",
    en: {
      title: "Patent Infringement Claim",
      description: "A tech giant is threatening a lawsuit over your display technology. Settle or fight.",
    },
    th: {
      title: "คดีละเมิดสิทธิบัตร",
      description: "บริษัทเทคยักษ์ใหญ่กำลังขู่ฟ้องเกี่ยวกับเทคโนโลยีหน้าจอของคุณ จะยอมความหรือสู้?",
    },
    choices: [
      {
        id: "settle",
        effect: { capital: -12_000_000 },
        en: { label: "Settle Out of Court (−$12M)", description: "Expensive but quick resolution" },
        th: { label: "ยอมความนอกศาล (−$12M)", description: "แพงแต่จบเร็ว" },
      },
      {
        id: "fight",
        effect: { capital: -5_000_000, morale: -15 },
        en: { label: "Fight in Court (−$5M upfront, risky)", description: "Cheaper if you win" },
        th: { label: "สู้ในศาล (−$5M ล่วงหน้า เสี่ยง)", description: "ถูกกว่าถ้าชนะ แต่หายนะถ้าแพ้" },
      },
      {
        id: "pivot_tech",
        effect: { capital: -3_000_000, techLevel: -1 },
        en: { label: "Redesign to Avoid Patent (−$3M, −1 Tech)", description: "Safe but sets you back" },
        th: { label: "ออกแบบใหม่หลีกเลี่ยงสิทธิบัตร (−$3M, −1 Tech)", description: "ปลอดภัย แต่ถดถอยเชิงเทค" },
      },
    ],
  },
];

// ============================================================
// ⚡ TIME-FREEZE EVENTS — เพิ่ม/แก้ไขได้ที่นี่
// Event เหล่านี้จะปรากฏแบบสุ่มระหว่าง Action Phase 60 วินาที
// เวลาจะหยุดและผู้เล่นต้องตัดสินใจก่อนที่นาฬิกาจะเดินต่อ!
// ============================================================
export const TIME_FREEZE_EVENTS: TimeFreezeEventData[] = [
  {
    id: "star_engineer_poach",
    icon: "🎯",
    urgency: "high",
    en: {
      title: "STAR ENGINEER POACHING!",
      description: "Your Lead Engineer just received a 3× salary offer from a competitor. The offer expires NOW.",
    },
    th: {
      title: "วิศวกรหัวหน้าถูกดึงตัว!",
      description: "วิศวกรหัวหน้าของคุณเพิ่งได้รับข้อเสนอเงินเดือน 3 เท่าจากคู่แข่ง ข้อเสนอหมดเวลา ตอนนี้!",
    },
    choices: [
      {
        id: "match_offer",
        effect: { capital: -8_000_000, morale: 5 },
        en: { label: "Match the Offer (−$8M)", desc: "Keep your star, expensive but worth it" },
        th: { label: "เสนอตาม (−$8M)", desc: "รักษาวิศวกรไว้ แพงแต่คุ้ม" },
      },
      {
        id: "let_leave",
        effect: { techLevel: -1, morale: -20 },
        en: { label: "Let Them Leave", desc: "Tech level drops, team morale tanks" },
        th: { label: "ปล่อยให้ไป", desc: "Tech Level ลด, ขวัญกำลังใจตก" },
      },
    ],
  },
  {
    id: "supply_shortage",
    icon: "🚨",
    urgency: "high",
    en: {
      title: "CRITICAL SUPPLY SHORTAGE!",
      description: "Your main component supplier just announced a 40% production cut. Your inventory is at risk.",
    },
    th: {
      title: "ขาดแคลนชิ้นส่วนวิกฤต!",
      description: "ซัพพลายเออร์หลักประกาศลดการผลิต 40% สต็อกของคุณกำลังตกอยู่ในความเสี่ยง",
    },
    choices: [
      {
        id: "emergency_buy",
        effect: { capital: -6_000_000 },
        en: { label: "Emergency Stock Buy (−$6M)", desc: "Secure supply at premium price" },
        th: { label: "ซื้อสต็อกฉุกเฉิน (−$6M)", desc: "ได้ชิ้นส่วนในราคาแพง" },
      },
      {
        id: "scramble",
        effect: { morale: -10, playerDemandMult: 0.80 },
        en: { label: "Scramble Alternatives", desc: "Capacity reduced −20% this quarter" },
        th: { label: "หาทางเลือกสำรอง", desc: "กำลังการผลิตลด −20% ไตรมาสนี้" },
      },
    ],
  },
  {
    id: "government_inspection",
    icon: "🏛️",
    urgency: "medium",
    en: {
      title: "SURPRISE GOVERNMENT AUDIT!",
      description: "Regulators just walked in for an unannounced compliance inspection. How do you handle it?",
    },
    th: {
      title: "หน่วยงานรัฐบาลตรวจสอบกะทันหัน!",
      description: "หน่วยงานกำกับดูแลเดินเข้ามาตรวจสอบโดยไม่แจ้งล่วงหน้า คุณจะรับมืออย่างไร?",
    },
    choices: [
      {
        id: "full_compliance",
        effect: { capital: -4_000_000, morale: 8 },
        en: { label: "Pay Fine & Comply (−$4M)", desc: "Clean record, morale boost" },
        th: { label: "จ่ายค่าปรับและปฏิบัติตาม (−$4M)", desc: "ประวัติสะอาด ขวัญกำลังใจดีขึ้น" },
      },
      {
        id: "stall",
        effect: { brandPerception: -25, morale: -5 },
        en: { label: "Stall Inspectors", desc: "Brand hit −25, bad press coming" },
        th: { label: "ประวิงเวลาผู้ตรวจ", desc: "Brand ตก −25 มีข่าวลบตามมา" },
      },
    ],
  },
  {
    id: "viral_controversy",
    icon: "🔥",
    urgency: "high",
    en: {
      title: "VIRAL FIRE TWEET!",
      description: "A tweet claiming your device catches fire is going viral. 500K likes. Media is calling.",
    },
    th: {
      title: "ทวีตไฟไหม้เป็นไวรัล!",
      description: "ทวีตอ้างว่าอุปกรณ์ของคุณไฟไหม้กำลังแพร่ระบาด 500K likes สื่อกำลังโทรมา",
    },
    choices: [
      {
        id: "crisis_pr",
        effect: { capital: -6_000_000, brandPerception: 5 },
        en: { label: "Crisis PR Blitz (−$6M)", desc: "Contain the damage, slight brand recovery" },
        th: { label: "ระดมพลประชาสัมพันธ์ (−$6M)", desc: "ควบคุมความเสียหาย brand ฟื้นตัวนิดหน่อย" },
      },
      {
        id: "ignore",
        effect: { brandPerception: -30, playerDemandMult: 0.82 },
        en: { label: "Say Nothing", desc: "Brand −30, demand collapses −18% this quarter" },
        th: { label: "ไม่พูดอะไร", desc: "Brand −30 demand ลด −18% ไตรมาสนี้" },
      },
    ],
  },
  {
    id: "investor_ultimatum",
    icon: "💼",
    urgency: "medium",
    en: {
      title: "INVESTOR ULTIMATUM!",
      description: "Your lead investor demands a strategic pivot or threatens to pull $20M funding immediately.",
    },
    th: {
      title: "นักลงทุนออกคำขาด!",
      description: "นักลงทุนหลักเรียกร้องให้เปลี่ยนทิศทางกลยุทธ์ หรือขู่จะถอนเงิน $20M ทันที",
    },
    choices: [
      {
        id: "concede",
        effect: { capital: -10_000_000, morale: 5 },
        en: { label: "Concede Ground (−$10M equity)", desc: "Lose capital but keep momentum" },
        th: { label: "ยอมเปลี่ยนทิศทาง (−$10M)", desc: "เสียเงิน แต่รักษาโมเมนตัมไว้" },
      },
      {
        id: "stand_firm",
        effect: { morale: -20 },
        en: { label: "Stand Your Ground", desc: "Keep capital, morale takes a major hit" },
        th: { label: "ยึดมั่นในจุดยืน", desc: "รักษาเงินทุนไว้ แต่ขวัญกำลังใจตกหนัก" },
      },
    ],
  },
  {
    id: "factory_fire",
    icon: "🏭",
    urgency: "high",
    en: {
      title: "FACTORY INCIDENT!",
      description: "A small fire in your assembly facility. No injuries, but production line stopped for assessment.",
    },
    th: {
      title: "เหตุการณ์ในโรงงาน!",
      description: "เพลิงไหม้เล็กน้อยในสายการประกอบ ไม่มีผู้บาดเจ็บ แต่สายการผลิตหยุดเพื่อประเมิน",
    },
    choices: [
      {
        id: "repair_fast",
        effect: { capital: -7_000_000, morale: 3 },
        en: { label: "Emergency Repair (−$7M)", desc: "Back online fast, expensive" },
        th: { label: "ซ่อมแซมฉุกเฉิน (−$7M)", desc: "กลับมาเร็ว แต่แพง" },
      },
      {
        id: "careful_assess",
        effect: { playerDemandMult: 0.75, morale: -5 },
        en: { label: "Full Assessment", desc: "Capacity −25% this quarter, safer long-term" },
        th: { label: "ประเมินอย่างรอบคอบ", desc: "กำลังผลิต −25% ไตรมาสนี้ แต่ปลอดภัยระยะยาว" },
      },
    ],
  },
];

// ============================================================
// 🤖 BOT EVENTS — กระทบ Bot ทุกไตรมาส
// ============================================================
// วิธีเพิ่ม Bot Event ใหม่: คัดลอก Object ไปต่อท้าย array ด้านล่าง
// capitalDelta = เงินที่ bot ได้รับ/เสีย (+ บวก / - ลบ)
// label = ข้อความที่แสดงใน Resolution Phase

export const BOT_POSITIVE_EVENTS = [
  { label: "Bot received $20M investor injection", capitalDelta: 20_000_000 },
  { label: "Bot supply deal locked in — costs −10%", capitalDelta: 8_000_000 },
  { label: "Bot brand partnership — market share +2%", capitalDelta: 5_000_000 },
  { label: "Bot government contract secured: +$15M", capitalDelta: 15_000_000 },
  { label: "Bot IPO announcement — capital surge +$25M", capitalDelta: 25_000_000 },
];

export const BOT_NEGATIVE_EVENTS = [
  { label: "Bot hit with $12M regulatory fine", capitalDelta: -12_000_000 },
  { label: "Bot supply crisis — revenue impact −$8M", capitalDelta: -8_000_000 },
  { label: "Bot executive scandal — capital penalty −$15M", capitalDelta: -15_000_000 },
  { label: "Bot product recall — $10M liability", capitalDelta: -10_000_000 },
  { label: "Bot data breach — $18M emergency response", capitalDelta: -18_000_000 },
];
