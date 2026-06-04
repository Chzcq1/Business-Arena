// ==========================================
// 👤 CEO CLASSES v6.0 — Rebalanced
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
// ⚙️ CEO_BACKGROUNDS v6.0 — Rebalanced for adaptive play
// ============================================================
export const CEO_BACKGROUNDS: Record<CEOBackgroundType, CEOBackground> = {
  visionary: {
    type: "visionary",
    productionCostModifier: 1.15,  // ต้นทุนผลิต +15% (ต้องจ่ายแพงกว่าเพื่อ R&D)
    ecotechModifier: 1.25,         // v6.0: ได้ EcoTech +25% ทุกไตรมาส (was 1.0)
    ecotechCostModifier: 0.65,     // v6.0: อัปเกรดถูกลง 35% (was 20%) — fix functional bug
    brandLoyalistBonus: 1.0,
    eWastePenaltyReduction: 1.0,
    priceCeilingModifier: 1.10,    // v6.0: เพดานราคา +10% (นวัตกรรมตั้งราคาสูงได้กว่า)
  },
  marketer: {
    type: "marketer",
    productionCostModifier: 1.0,
    ecotechModifier: 1.0,
    ecotechCostModifier: 1.20,     // อัปเกรด EcoTech แพงขึ้น 20% (ไม่ถนัด tech)
    brandLoyalistBonus: 1.20,      // v6.0: Brand Loyalist +20% (was 15%)
    eWastePenaltyReduction: 1.0,
    priceCeilingModifier: 1.15,    // v6.0: เพดานราคา +15% (brand ทำให้ขายแพงได้)
  },
  operator: {
    type: "operator",
    productionCostModifier: 0.82,  // v6.0: ต้นทุนผลิต −18% (was −15%) — lean ops
    ecotechModifier: 1.0,
    ecotechCostModifier: 1.0,
    brandLoyalistBonus: 0.90,      // v6.0: Brand −10% (mass market, no premium image)
    eWastePenaltyReduction: 0.25,  // v6.0: restore advantage — 3.0×0.25=0.75× (was 1.5×0.5=0.75× in v5)
    priceCeilingModifier: 0.90,    // เพดานราคาต่ำ 10% (efficiency ≠ premium)
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
