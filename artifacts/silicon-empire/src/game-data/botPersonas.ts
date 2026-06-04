// ==========================================
// 🤖 BOT PERSONAS — พฤติกรรมและ UI ของคู่แข่ง Bot
// ==========================================
//
// ไฟล์นี้กำหนดบุคลิกภาพของ Bot ที่ผู้เล่นจะพบ
// Bot ถูกสุ่มเลือกหนึ่ง Persona ตอนเริ่มเกม
//
// ============================================================
// ✅ วิธีเพิ่ม Bot Persona ใหม่:
// ============================================================
//
// 1. เพิ่ม type ใน BotPersonaType ใน src/store/types.ts
//    เช่น: export type BotPersonaType = "discount_king" | "tech_premium" | "copycat" | "berserker";
//
// 2. เพิ่ม Object ใน BOT_PERSONA_META ด้านล่าง:
//    berserker: {
//      type: "berserker",
//      icon: "💥",
//      badgeColor: "text-red-500 border-red-500/40 bg-red-900/20",
//      en: { label: "The Berserker", hint: "Bot goes all-in every quarter" },
//      th: { label: "นักรบฆ่าตัดตอน", hint: "Bot ลงทุนสูงสุดทุกไตรมาส" },
//      behavior: {
//        priceBehavior: "fixed",         ← "undercut" | "premium" | "mirror" | "fixed"
//        priceOffset: 0,                 ← ราคาต่างจากผู้เล่น (ใช้กับ "fixed" mode)
//        prodAggressionMultiplier: 2.0,  ← คูณ production budget
//        maxUpgradesPerQuarter: 1,
//        techGrowthInterval: 2,          ← อัพ tech ทุก N ไตรมาส
//      }
//    }
//
// 3. เพิ่ม persona ใน PERSONA_TYPES array ด้านล่าง
//
// ============================================================

import type { BotPersonaType } from "@/store/types";

export interface BotPersonaBehavior {
  // กลยุทธ์การตั้งราคา
  priceBehavior: "undercut" | "premium" | "mirror";
  priceUndercutRange?: [number, number];  // [min%, max%] ต่ำกว่าผู้เล่น
  pricePremiumRange?: [number, number];   // [min%, max%] สูงกว่าผู้เล่น
  priceMirrorNoise?: number;              // ± ดอลลาร์ (สำหรับ mirror)
  // กลยุทธ์การผลิต
  prodChangeRange: [number, number];      // [min, max] ล้านดอลลาร์ต่อการเปลี่ยน
  prodIncreaseChance: number;             // 0-1 โอกาสเพิ่ม (vs ลด) production
  // การอัพเกรด
  maxUpgradesPerQuarter: number;          // จำนวน component upgrade สูงสุดต่อไตรมาส
  techGrowthInterval: number;             // อัพ tech ทุก N ไตรมาส (เลขน้อย = เร็วกว่า)
}

export interface BotPersonaMeta {
  type: BotPersonaType;
  icon: string;
  badgeColor: string;  // Tailwind classes
  en: { label: string; hint: string };
  th: { label: string; hint: string };
  behavior: BotPersonaBehavior;
}

// ============================================================
// 🤖 BOT_PERSONA_META — แก้พฤติกรรม Bot ได้ที่นี่
// ============================================================
export const BOT_PERSONA_META: Record<BotPersonaType, BotPersonaMeta> = {
  discount_king: {
    type: "discount_king",
    icon: "🔻",
    badgeColor: "text-red-400 border-red-400/40 bg-red-900/20",
    en: {
      label: "Discount King",
      hint: "Bot undercuts your price by 15–25% every quarter",
    },
    th: {
      label: "จ้าวราคาถูก",
      hint: "Bot ตั้งราคาต่ำกว่าคุณ 15–25% ทุกไตรมาส",
    },
    behavior: {
      priceBehavior: "undercut",
      priceUndercutRange: [0.15, 0.25],  // ลด 15-25% จากราคาผู้เล่น
      prodChangeRange: [1, 3],            // เพิ่ม/ลด 1-3 ล้าน
      prodIncreaseChance: 0.7,            // 70% โอกาสเพิ่ม production
      maxUpgradesPerQuarter: 1,
      techGrowthInterval: 4,
    },
  },
  tech_premium: {
    type: "tech_premium",
    icon: "🔬",
    badgeColor: "text-blue-400 border-blue-400/40 bg-blue-900/20",
    en: {
      label: "Tech Premium",
      hint: "Bot invests heavily in R&D and charges 15–25% premium",
    },
    th: {
      label: "พรีเมียมเทค",
      hint: "Bot ลงทุน R&D หนักมากและตั้งราคาสูงกว่า 15–25%",
    },
    behavior: {
      priceBehavior: "premium",
      pricePremiumRange: [0.15, 0.25],   // แพงกว่า 15-25%
      prodChangeRange: [0.5, 2],
      prodIncreaseChance: 0.35,           // ไม่ค่อยเพิ่ม production (เน้น quality)
      maxUpgradesPerQuarter: 2,           // อัพเกรดได้ 2 อันต่อไตรมาส!
      techGrowthInterval: 2,              // tech โตเร็วกว่า
    },
  },
  copycat: {
    type: "copycat",
    icon: "🐱",
    badgeColor: "text-yellow-400 border-yellow-400/40 bg-yellow-900/20",
    en: {
      label: "The Copycat",
      hint: "Bot mirrors your price within ±$20. Predict yourself to predict the bot.",
    },
    th: {
      label: "ตัวเลียนแบบ",
      hint: "Bot ลอกราคาคุณ ±$20 เดาตัวเองแล้วรู้ว่า Bot จะทำอะไร",
    },
    behavior: {
      priceBehavior: "mirror",
      priceMirrorNoise: 20,               // ± $20 จากราคาผู้เล่น
      prodChangeRange: [1, 2],
      prodIncreaseChance: 0.5,            // 50/50
      maxUpgradesPerQuarter: 1,
      techGrowthInterval: 4,
    },
  },
};

// รายการ Persona ทั้งหมดสำหรับสุ่ม
export const PERSONA_TYPES: BotPersonaType[] = ["discount_king", "tech_premium", "copycat"];
