import { useGameStore } from "@/store/gameStore";
import { TrendingUp, TrendingDown, Minus, Eye, EyeOff, AlertTriangle, ArrowRight } from "lucide-react";
import type { MarketIntel } from "@/store/types";

function DemandBadge({ trend }: { trend: MarketIntel["demandTrend"] }) {
  if (trend === "rising") return (
    <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
      <TrendingUp className="w-3 h-3" /> RISING
    </span>
  );
  if (trend === "falling") return (
    <span className="flex items-center gap-1 text-red-400 text-xs font-semibold">
      <TrendingDown className="w-3 h-3" /> FALLING
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
      <Minus className="w-3 h-3" /> STABLE
    </span>
  );
}

function CompetitorBadge({ activity }: { activity: MarketIntel["competitorActivity"] }) {
  if (activity === "aggressive") return (
    <span className="flex items-center gap-1 text-red-400 text-xs font-semibold">
      <AlertTriangle className="w-3 h-3" /> AGGRESSIVE
    </span>
  );
  if (activity === "passive") return (
    <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
      <Minus className="w-3 h-3" /> PASSIVE
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-muted-foreground text-xs font-semibold">
      <EyeOff className="w-3 h-3" /> UNKNOWN
    </span>
  );
}

export function IntelPhase() {
  const { marketIntel, quarter, player, advanceToEvent, language } = useGameStore();

  const t = language === "en"
    ? {
        title: "Intelligence Briefing",
        subtitle: "Market conditions & competitive intelligence",
        demand: "Consumer Demand Trend",
        competitor: "Competitor Activity",
        analysis: "Analyst Note",
        intel: "Intercepted Signal",
        noIntel: "Insufficient intel points — competitor activity unknown",
        proceed: "Proceed to Event Phase",
        q: "Q"
      }
    : {
        title: "รายงานข่าวกรอง",
        subtitle: "สภาวะตลาดและข่าวกรองคู่แข่ง",
        demand: "แนวโน้มความต้องการ",
        competitor: "กิจกรรมคู่แข่ง",
        analysis: "หมายเหตุนักวิเคราะห์",
        intel: "สัญญาณที่ดักจับได้",
        noIntel: "แต้มข่าวกรองไม่พอ — ไม่ทราบกิจกรรมคู่แข่ง",
        proceed: "ดำเนินไปยังเหตุการณ์",
        q: "Q"
      };

  if (!marketIntel) return null;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
          <Eye className="w-3 h-3" />
          {t.q}{quarter} — INTELLIGENCE PHASE
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-card-border rounded-xl p-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t.demand}</p>
          <DemandBadge trend={marketIntel.demandTrend} />
          <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                marketIntel.demandTrend === "rising" ? "w-4/5 bg-emerald-400" :
                marketIntel.demandTrend === "falling" ? "w-1/4 bg-red-400" : "w-1/2 bg-yellow-400"
              }`}
            />
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t.competitor}</p>
          <CompetitorBadge activity={marketIntel.competitorActivity} />
          <p className="text-[10px] text-muted-foreground mt-3">
            {marketIntel.competitorActivity === "unknown" ? t.noIntel : ""}
          </p>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t.analysis}</p>
        <p className="text-sm text-foreground leading-relaxed">{marketIntel.hint}</p>
      </div>

      {marketIntel.botHint && player.intelPoints > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
          <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Eye className="w-3 h-3" /> {t.intel}
          </p>
          <p className="text-sm text-amber-100 leading-relaxed font-mono">{marketIntel.botHint}</p>
        </div>
      )}

      <button
        onClick={advanceToEvent}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors pulse-glow"
      >
        {t.proceed}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
