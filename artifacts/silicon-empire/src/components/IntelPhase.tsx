import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { TrendingUp, TrendingDown, Minus, Eye, EyeOff, AlertTriangle, ArrowRight } from "lucide-react";
import type { MarketIntel } from "@/store/types";

function DemandBadge({ trend, t }: { trend: MarketIntel["demandTrend"]; t: (k: string) => string }) {
  if (trend === "rising") return <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold"><TrendingUp className="w-3 h-3" />{t("intel_phase.rising")}</span>;
  if (trend === "falling") return <span className="flex items-center gap-1 text-red-400 text-xs font-semibold"><TrendingDown className="w-3 h-3" />{t("intel_phase.falling")}</span>;
  return <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold"><Minus className="w-3 h-3" />{t("intel_phase.stable")}</span>;
}

function CompetitorBadge({ activity, t }: { activity: MarketIntel["competitorActivity"]; t: (k: string) => string }) {
  if (activity === "aggressive") return <span className="flex items-center gap-1 text-red-400 text-xs font-semibold"><AlertTriangle className="w-3 h-3" />{t("intel_phase.aggressive")}</span>;
  if (activity === "passive") return <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold"><Minus className="w-3 h-3" />{t("intel_phase.passive")}</span>;
  return <span className="flex items-center gap-1 text-muted-foreground text-xs font-semibold"><EyeOff className="w-3 h-3" />{t("intel_phase.unknown")}</span>;
}

export function IntelPhase() {
  const { marketIntel, quarter, player, advanceToEvent } = useGameStore();
  const { t } = useT();

  if (!marketIntel) return null;

  const hintText = t(marketIntel.hintKey);
  const botHintText = marketIntel.botHintKey ? t(marketIntel.botHintKey) : null;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
          <Eye className="w-3 h-3" />
          Q{quarter} — {t("intel_phase.phaseLabel")}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t("intel_phase.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("intel_phase.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-card-border rounded-xl p-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t("intel_phase.demandTrend")}</p>
          <DemandBadge trend={marketIntel.demandTrend} t={t} />
          <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${
              marketIntel.demandTrend === "rising" ? "w-4/5 bg-emerald-400"
              : marketIntel.demandTrend === "falling" ? "w-1/4 bg-red-400" : "w-1/2 bg-yellow-400"
            }`} />
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t("intel_phase.competitorActivity")}</p>
          <CompetitorBadge activity={marketIntel.competitorActivity} t={t} />
          {marketIntel.competitorActivity === "unknown" && (
            <p className="text-[10px] text-muted-foreground mt-3">{t("intel_phase.noIntel")}</p>
          )}
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t("intel_phase.analystNote")}</p>
        <p className="text-sm text-foreground leading-relaxed">{hintText}</p>
      </div>

      {botHintText && player.intelPoints > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
          <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Eye className="w-3 h-3" />{t("intel_phase.interceptedSignal")}
          </p>
          <p className="text-sm text-amber-100 leading-relaxed font-mono">{botHintText}</p>
        </div>
      )}

      <button onClick={advanceToEvent}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors pulse-glow">
        {t("intel_phase.proceed")}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
