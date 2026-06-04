// ==========================================
// 👤 CEO CLASSES — ข้อมูล CEO Class ทั้งหมด
// ==========================================
//
// ไฟล์นี้กำหนดคุณสมบัติของ CEO แต่ละ Class ที่กระทบการเล่น
//
// ============================================================
// ✅ วิธีเพิ่ม CEO Class ใหม่:
// ============================================================
//
// 1. เพิ่ม type ใหม่ใน CEOBackgroundType ใน src/store/types.ts
//    เช่น: export type CEOBackgroundType = "visionary" | "marketer" | "operator" | "hacker";
//
// 2. เพิ่ม Object ใน CEO_BACKGROUNDS ด้านล่าง:
//    hacker: {
//      type: "hacker",
//      productionCostModifier: 0.90,  ← คูณต้นทุนการผลิต (0.9 = ถูกลง 10%)
//      ecotechModifier: 1.2,          ← คูณ EcoTech ที่ได้รับทุกไตรมาส
//      ecotechCostModifier: 0.75,     ← คูณราคา EcoTech Upgrade (0.75 = ถูกลง 25%)
//      brandLoyalistBonus: 0.9,       ← คูณ Brand Loyalist segment
//      eWastePenaltyReduction: 0.8,   ← คูณค่าปรับ E-Waste (0.8 = ลด 20%)
//      priceCeilingModifier: 1.1,     ← คูณ price ceiling ที่ยอมรับได้
//    }
//
// 3. เพิ่มข้อความใน src/locales/en.json และ th.json:
//    "ceo_classes": {
//      "hacker": {
//        "title": "The Hacker",
//        "desc": "...",
//        "pro": "EcoTech +20%, Upgrade costs −25%",
//        "con": "Brand Loyalists −10%"
//      }
//    }
//
// 4. เพิ่มข้อมูลใน CEO_DISPLAY_META ด้านล่าง (icon + locale key)
//
// 💡 ค่าที่ใส่ได้:
//    > 1.0 = เพิ่มขึ้น  |  < 1.0 = ลดลง  |  1.0 = ไม่เปลี่ยน
//
// ============================================================

import type { CEOBackground, CEOBackgroundType } from "@/store/types";

// ============================================================
// ⚙️ CEO_BACKGROUNDS — แก้ตัวเลขได้ที่นี่
// ============================================================
export const CEO_BACKGROUNDS: Record<CEOBackgroundType, CEOBackground> = {
  visionary: {
    type: "visionary",
    productionCostModifier: 1.15,  // ต้นทุนการผลิต +15% (แพงกว่า)
    ecotechModifier: 1.0,
    ecotechCostModifier: 0.80,     // อัพเกรด EcoTech ถูกลง 20%
    brandLoyalistBonus: 1.0,
    eWastePenaltyReduction: 1.0,
    priceCeilingModifier: 1.0,
  },
  marketer: {
    type: "marketer",
    productionCostModifier: 1.0,
    ecotechModifier: 1.0,
    ecotechCostModifier: 1.20,     // อัพเกรด EcoTech แพงขึ้น 20%
    brandLoyalistBonus: 1.15,      // Brand Loyalist segment +15%
    eWastePenaltyReduction: 1.0,
    priceCeilingModifier: 1.0,
  },
  operator: {
    type: "operator",
    productionCostModifier: 0.85,  // ต้นทุนการผลิต -15% (ถูกกว่า)
    ecotechModifier: 1.0,
    ecotechCostModifier: 1.0,
    brandLoyalistBonus: 1.0,
    eWastePenaltyReduction: 0.50,  // ค่าปรับ E-Waste ลด 50%
    priceCeilingModifier: 0.90,    // price ceiling ต่ำกว่า 10%
  },
};

// ============================================================
// 🎨 CEO_DISPLAY_META — ข้อมูลสำหรับแสดง UI ใน CEOSelectionPhase
// ============================================================
// icon = emoji ที่แสดงบนการ์ด CEO
// localeKey = ชื่อ key ใน locales ที่ใช้ดึงข้อความ
export const CEO_DISPLAY_META: Record<CEOBackgroundType, { icon: string; localeKey: string }> = {
  visionary: { icon: "🔭", localeKey: "ceo_classes.visionary" },
  marketer:  { icon: "📣", localeKey: "ceo_classes.marketer" },
  operator:  { icon: "⚙️", localeKey: "ceo_classes.operator" },
};
