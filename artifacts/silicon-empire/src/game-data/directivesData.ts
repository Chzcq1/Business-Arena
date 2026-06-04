// ==========================================
// 📋 DIRECTIVES DATA — ข้อมูล UI ของ Directive ทั้งหมด
// ==========================================
//
// ไฟล์นี้ควบคุม:
//   - ไอคอน (icon) และสี (color) ของแต่ละ Directive
//   - กำหนดว่า Directive ไหนเป็น "Dark Tactic" (มีตราแดง)
//   - รายการ Directive ทั้งหมดสำหรับใช้ใน Board Meeting
//
// ============================================================
// ✅ วิธีเพิ่ม DIRECTIVE ใหม่:
// ============================================================
//
// 1. เพิ่ม id ใหม่ใน BoardDirective type ใน src/store/types.ts
//    เช่น: | "my_new_directive"
//
// 2. เพิ่ม metadata ใน DIRECTIVE_META object ด้านล่าง:
//    my_new_directive: {
//      icon: "🎲",          ← emoji ที่แสดงใน Board Meeting
//      isDark: false,       ← true = Dark Tactic (มีตราแดง + warning)
//      color: "border-teal-500/50 hover:border-teal-400",  ← สีขอบการ์ด
//      selectedColor: "border-teal-400 bg-teal-900/30",    ← สีเมื่อเลือก
//    }
//
// 3. เพิ่มข้อความใน src/locales/en.json และ th.json:
//    "my_new_directive": "Display Name",
//    "my_new_directive_desc": "Short description of what it does."
//
// 4. เพิ่ม id ใน ALL_DIRECTIVES array ด้านล่าง
//
// 5. เพิ่ม game effect logic ใน src/store/gameStore.ts
//    ใน function resolveQuarter() ค้นหา "boardDirective ==="
//
// 💡 สีที่ใช้ได้ (Tailwind CSS):
//    blue, green, purple, orange, yellow, cyan, pink, indigo,
//    amber, violet, teal, emerald, red (dark tactics เท่านั้น)
//
// ============================================================

import type { BoardDirective } from "@/store/types";

export interface DirectiveMeta {
  icon: string;
  isDark: boolean;
  color: string;         // border color when not selected
  selectedColor: string; // border + bg when selected
}

// ============================================================
// 🎨 DIRECTIVE_META — แก้ icon และ color ได้ที่นี่
// ============================================================
export const DIRECTIVE_META: Record<BoardDirective, DirectiveMeta> = {
  // ── Standard Directives ──────────────────────────────────
  aggressive_rd: {
    icon: "🔬",
    isDark: false,
    color: "border-blue-500/50 hover:border-blue-400",
    selectedColor: "border-blue-400 bg-blue-900/30",
  },
  austerity: {
    icon: "💹",
    isDark: false,
    color: "border-orange-500/50 hover:border-orange-400",
    selectedColor: "border-orange-400 bg-orange-900/30",
  },
  market_expansion: {
    icon: "📈",
    isDark: false,
    color: "border-green-500/50 hover:border-green-400",
    selectedColor: "border-green-400 bg-green-900/30",
  },
  brand_campaign: {
    icon: "📣",
    isDark: false,
    color: "border-purple-500/50 hover:border-purple-400",
    selectedColor: "border-purple-400 bg-purple-900/30",
  },
  cost_cutting: {
    icon: "⚙️",
    isDark: false,
    color: "border-yellow-500/50 hover:border-yellow-400",
    selectedColor: "border-yellow-400 bg-yellow-900/30",
  },
  talent_retention: {
    icon: "🤝",
    isDark: false,
    color: "border-cyan-500/50 hover:border-cyan-400",
    selectedColor: "border-cyan-400 bg-cyan-900/30",
  },
  premium_focus: {
    icon: "💎",
    isDark: false,
    color: "border-pink-500/50 hover:border-pink-400",
    selectedColor: "border-pink-400 bg-pink-900/30",
  },
  volume_play: {
    icon: "📦",
    isDark: false,
    color: "border-indigo-500/50 hover:border-indigo-400",
    selectedColor: "border-indigo-400 bg-indigo-900/30",
  },
  flash_sale: {
    icon: "⚡",
    isDark: false,
    color: "border-amber-500/50 hover:border-amber-400",
    selectedColor: "border-amber-400 bg-amber-900/30",
  },
  viral_launch: {
    icon: "🚀",
    isDark: false,
    color: "border-violet-500/50 hover:border-violet-400",
    selectedColor: "border-violet-400 bg-violet-900/30",
  },
  headcount_freeze: {
    icon: "🧊",
    isDark: false,
    color: "border-slate-500/50 hover:border-slate-400",
    selectedColor: "border-slate-400 bg-slate-900/30",
  },
  supply_chain_deal: {
    icon: "🔗",
    isDark: false,
    color: "border-teal-500/50 hover:border-teal-400",
    selectedColor: "border-teal-400 bg-teal-900/30",
  },
  green_initiative: {
    icon: "🌿",
    isDark: false,
    color: "border-emerald-500/50 hover:border-emerald-400",
    selectedColor: "border-emerald-400 bg-emerald-900/30",
  },
  // ── Dark Tactics ─────────────────────────────────────────
  planned_obsolescence: {
    icon: "☠️",
    isDark: true,
    color: "border-red-600/70 hover:border-red-500",
    selectedColor: "border-red-500 bg-red-950/50",
  },
  industrial_espionage: {
    icon: "🕵️",
    isDark: true,
    color: "border-red-600/70 hover:border-red-500",
    selectedColor: "border-red-500 bg-red-950/50",
  },
};

// ============================================================
// รายการ Directive ทั้งหมดที่อาจสุ่มออกมาใน Board Meeting
// ถ้าต้องการ "ปิด" Directive ใด ให้ลบออกจาก array นี้
// ============================================================
export const ALL_DIRECTIVES: BoardDirective[] = [
  "aggressive_rd", "austerity", "market_expansion",
  "brand_campaign", "cost_cutting", "talent_retention",
  "premium_focus", "volume_play",
  "planned_obsolescence", "industrial_espionage",
  "flash_sale", "viral_launch", "headcount_freeze",
  "supply_chain_deal", "green_initiative",
];

// รายการ Dark Tactics (ใช้สำหรับ warning banner)
export const DARK_TACTICS: BoardDirective[] = ["planned_obsolescence", "industrial_espionage"];

// ฟังก์ชันสุ่ม 3 Directive สำหรับ Board Meeting
// แก้ตัวเลขในนี้เพื่อเปลี่ยนจำนวนที่แสดง (ตอนนี้แสดง 3)
export function pickDirectives(): BoardDirective[] {
  const darkTactics = DARK_TACTICS;
  const normal = ALL_DIRECTIVES.filter((d) => !darkTactics.includes(d));
  const shuffled = [...normal].sort(() => Math.random() - 0.5).slice(0, 3);
  // 30% โอกาสสับเปลี่ยนหนึ่ง slot เป็น Dark Tactic
  if (Math.random() < 0.30) {
    shuffled[Math.floor(Math.random() * 3)] = darkTactics[Math.floor(Math.random() * darkTactics.length)];
  }
  return shuffled;
}
