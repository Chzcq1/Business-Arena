// ===== HOW TO PLAY v1.0 =====
import { X, DollarSign, Factory, TrendingUp, Shield, Trophy, Layers, Zap } from "lucide-react";
import { useGameStore } from "@/store/gameStore";

interface Section {
  icon: React.ReactNode;
  titleTh: string;
  titleEn: string;
  items: { th: string; en: string }[];
}

const SECTIONS: Section[] = [
  {
    icon: <Layers className="w-5 h-5 text-blue-400" />,
    titleTh: "โครงสร้างเกม",
    titleEn: "Game Structure",
    items: [
      { th: "เกมมี 16 ไตรมาส (4 ปี) คุณแข่งกับ AI ว่าใครมีทุนมากกว่า", en: "16 quarters total (4 years). Compete against AI for highest capital." },
      { th: "ชนะทันทีถ้าทุนถึง $1B, หรือชนะตอน Q16 ถ้ามีทุนมากกว่า AI", en: "Instant win at $1B capital, or highest capital at Q16 wins." },
      { th: "แพ้ถ้าทุนหมด (ล้มละลาย)", en: "Bankrupt if capital hits $0 — game over." },
    ],
  },
  {
    icon: <Layers className="w-5 h-5 text-violet-400" />,
    titleTh: "ลำดับ Phase ต่อไตรมาส",
    titleEn: "Phase Order Each Quarter",
    items: [
      { th: "1. ข่าวกรอง — ดูแนวโน้มตลาดและกิจกรรม AI", en: "1. Intel — View market trends and competitor activity." },
      { th: "2. ประชุมบอร์ด — เลือก Directive กลยุทธ์ประจำไตรมาส", en: "2. Board Meeting — Pick your quarterly strategic directive." },
      { th: "3. ตลาดมืด — ซื้อไพ่ยุทธวิธีพิเศษ (สูงสุด 2 ใบ)", en: "3. Black Market — Buy tactical cards (max 2 equipped)." },
      { th: "4. เหตุการณ์ — ตอบสนองต่อเหตุการณ์สุ่มที่ส่งผลต่อตลาด", en: "4. Event — Respond to random market events." },
      { th: "5. ดำเนินการ — 60 วินาที ตั้งราคา + งบผลิต ก่อนล็อคผล", en: "5. Action Phase — 60 seconds: set price & production budget." },
      { th: "6. สรุปผล — ดูผลยอดขาย กำไร และสถิติ", en: "6. Resolution — See sales, profit, and stats." },
    ],
  },
  {
    icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
    titleTh: "ระบบ Market Tier",
    titleEn: "Market Tier System",
    items: [
      { th: "ราคา $299–$699 = ตลาด Mass (80,000 unit) เน้นปริมาณ กำไรบาง", en: "Price $299–$699 = Mass Market (80k units). High volume, thin margin." },
      { th: "ราคา $700–$1,099 = ตลาด Mid (55,000 unit) สมดุลดี", en: "Price $700–$1,099 = Mid Market (55k units). Balanced." },
      { th: "ราคา $1,100+ = ตลาด Premium (25,000 unit) กำไรหนา แต่ต้องการ Tech สูง", en: "Price $1,100+ = Premium Market (25k units). High margin, needs Tech." },
      { th: "คุณและ AI แย่งชิงตลาดเดียวกัน ถ้าราคาต่างกัน tier ใครไม่เจอกัน", en: "You and AI compete in the SAME tier. Different tiers = no direct conflict." },
      { th: "ราคาสูงกว่า AI เกิน 25% → demand พัง 90%", en: "Price >25% above AI → demand collapses 90%." },
    ],
  },
  {
    icon: <Factory className="w-5 h-5 text-blue-400" />,
    titleTh: "งบผลิตและ Capacity",
    titleEn: "Production & Capacity",
    items: [
      { th: "งบผลิต $1M–$20M กำหนดว่าจะผลิตได้กี่ unit", en: "Production budget $1M–$20M determines how many units you can make." },
      { th: "ต้นทุนต่อ unit ~$200 (ลดได้ด้วย Factory M&A, Memory upgrade, CEO Operator)", en: "Unit cost ~$200 base. Reduce via Factory M&A, Memory upgrade, Operator CEO." },
      { th: "ผลิตมากเกินดีมานด์ → ต้องจ่ายค่า E-Waste สินค้าค้างสต็อก", en: "Overproduction → E-Waste penalty on unsold units." },
      { th: "ผลิตน้อยเกินไป → demand เหลือ คุณขายได้แค่ capacity", en: "Under-capacity → you miss demand. Sell only what you can make." },
    ],
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-cyan-400" />,
    titleTh: "Tech และ EcoTech",
    titleEn: "Tech & EcoTech",
    items: [
      { th: "Tech Level กำหนดเพดานราคาที่ตลาดยอมรับ", en: "Tech Level sets the max price market will accept." },
      { th: "EcoTech ใช้ upgrade Chip, Battery, Display, Memory (Level 1–5)", en: "EcoTech is currency for upgrading components (Chip/Battery/Display/Memory)." },
      { th: "Chip → ดีมานด์ Tech segment; Battery → ป้องกัน Q3 penalty; Display → เพิ่ม price ceiling; Memory → ลดต้นทุน", en: "Chip=Tech demand; Battery=avoid Q3 penalty; Display=price ceiling; Memory=cost reduction." },
      { th: "Legendary Engineer = +2 EcoTech/ไตรมาส ถาวร ($80M)", en: "Legendary Engineer = +2 EcoTech/quarter permanently ($80M)." },
    ],
  },
  {
    icon: <Shield className="w-5 h-5 text-orange-400" />,
    titleTh: "Directives และ Dark Tactics",
    titleEn: "Directives & Dark Tactics",
    items: [
      { th: "เลือก Directive 1 อย่าง/ไตรมาส เช่น R&D เชิงรุก, ขยายตลาด, ลดต้นทุน", en: "Choose 1 directive per quarter (R&D, expansion, cost-cut, etc.)." },
      { th: "กลยุทธ์เทา: 'วางยาสินค้า' และ 'จารกรรมอุตสาหกรรม' — ผลตอบแทนสูงแต่เสี่ยงถูกจับ", en: "Dark Tactics (Planned Obsolescence & Espionage) = huge upside but risk penalties if caught." },
      { th: "ถูกจับจาก Espionage → Trade Ban ขายของไม่ได้ไตรมาสหน้า", en: "Caught espionage → Trade Ban: zero sales next quarter." },
    ],
  },
  {
    icon: <Zap className="w-5 h-5 text-violet-400" />,
    titleTh: "สกิล CEO และไพ่ยุทธวิธี",
    titleEn: "CEO Skills & Tactical Cards",
    items: [
      { th: "สกิล CEO ใช้ได้ 3 ครั้งต่อเกม กดใช้ระหว่าง Action Phase (60 วินาที)", en: "CEO Skill: 3 charges per game. Activate during Action Phase." },
      { th: "Visionary: +20% demand; Marketer: +8 Brand +15% demand; Operator: ต้นทุน −20%", en: "Visionary=+20% demand; Marketer=+8 Brand+15% demand; Operator=cost −20%." },
      { th: "ไพ่ยุทธวิธีซื้อได้จาก Black Market ใช้ได้ระหว่าง Action Phase", en: "Tactical cards bought at Black Market, activated during Action Phase." },
      { th: "Time-Freeze Event: นาฬิกาหยุด ต้องตัดสินใจก่อน timer เดินต่อ", en: "Time-Freeze: timer pauses mid-phase, choose response to continue." },
    ],
  },
  {
    icon: <Trophy className="w-5 h-5 text-yellow-400" />,
    titleTh: "เคล็ดลับชนะ",
    titleEn: "Tips to Win",
    items: [
      { th: "เลือก tier ที่คุณถนัด แล้วอยู่ใน tier นั้นตลอด อย่าตั้งราคาสูงกว่า AI มากเกิน", en: "Pick a tier and stay in it. Never price >25% above AI." },
      { th: "อัปเกรด Battery ก่อน Q3 ไม่งั้นถูกหักรายได้ 20%", en: "Upgrade Battery before Q3 or lose 20% revenue every quarter after." },
      { th: "ดูตลาด — ถ้า AI อยู่ tier เดียวกัน ราคาต้องแข่งขันได้", en: "Watch AI's tier. If they match your price range, compete aggressively." },
      { th: "อย่าผลิตเกิน demand — ค่า E-Waste ทำลายกำไร", en: "Don't overproduce — E-Waste penalty will kill your margins." },
      { th: "ใช้สกิล CEO ในไตรมาสสำคัญ ไม่ใช่เก็บไว้จนจบเกม", en: "Use CEO skill in critical quarters, not just at the end." },
    ],
  },
];

export function HowToPlay() {
  const { setShowHowToPlay, language } = useGameStore();
  const isTh = language === "th";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-md overflow-y-auto py-6 px-4">
      <div className="w-full max-w-2xl bg-card border border-card-border rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isTh ? "วิธีเล่น Silicon Empire" : "How to Play Silicon Empire"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isTh ? "คู่มืออ้างอิงฉบับย่อ" : "Quick Reference Guide"}
            </p>
          </div>
          <button
            onClick={() => setShowHowToPlay(false)}
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {SECTIONS.map((section, i) => (
            <div key={i} className="bg-secondary/30 border border-border/50 rounded-xl p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center">
                  {section.icon}
                </div>
                <h2 className="text-sm font-bold text-foreground">
                  {isTh ? section.titleTh : section.titleEn}
                </h2>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                    <span className="text-primary mt-0.5 shrink-0">▸</span>
                    <span>{isTh ? item.th : item.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end">
          <button
            onClick={() => setShowHowToPlay(false)}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            {isTh ? "เข้าใจแล้ว เล่นเลย →" : "Got it, let's play →"}
          </button>
        </div>
      </div>
    </div>
  );
}
