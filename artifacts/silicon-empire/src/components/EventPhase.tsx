import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { AlertTriangle, Zap, Factory, Scale, ArrowRight } from "lucide-react";
import type { QuarterEvent } from "@/store/types";

const TYPE_ICONS: Record<QuarterEvent["type"], React.ReactNode> = {
  supply: <Factory className="w-5 h-5" />,
  regulation: <Scale className="w-5 h-5" />,
  market: <Zap className="w-5 h-5" />,
  tech: <AlertTriangle className="w-5 h-5" />,
};

const TYPE_COLORS: Record<QuarterEvent["type"], string> = {
  supply: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  regulation: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  market: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  tech: "text-violet-400 bg-violet-400/10 border-violet-400/30",
};

const effectLabel = (effect: Record<string, number>) => {
  const labels: string[] = [];
  if (effect.capital) labels.push(`${effect.capital > 0 ? "+" : ""}$${(Math.abs(effect.capital) / 1_000_000).toFixed(1)}M`);
  if (effect.morale) labels.push(`${effect.morale > 0 ? "+" : ""}${effect.morale} Morale`);
  if (effect.techLevel) labels.push(`${effect.techLevel > 0 ? "+" : ""}${effect.techLevel} Tech`);
  if (effect.marketShare) labels.push(`${effect.marketShare > 0 ? "+" : ""}${effect.marketShare}% Share`);
  if (effect.intelBonus) labels.push(`+${effect.intelBonus} Intel`);
  return labels.join(" · ");
};

export function EventPhase() {
  const { currentEvent, resolveEvent, startActionPhase, quarter, language } = useGameStore();
  const { t } = useT();
  const [selected, setSelected] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  if (!currentEvent) return <div className="text-center text-muted-foreground py-10">No event loaded.</div>;

  const lang = language === "th" ? currentEvent.th : currentEvent.en;
  const colorClass = TYPE_COLORS[currentEvent.type];

  const handleConfirm = () => {
    if (!selected || resolved) return;
    resolveEvent(selected);
    setResolved(true);
    setTimeout(() => { startActionPhase(); setSelected(null); setResolved(false); }, 400);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-3 ${colorClass}`}>
          {TYPE_ICONS[currentEvent.type]}
          Q{quarter} — {t("event_phase.phaseLabel")}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{lang.title}</h1>
        <p className="text-muted-foreground text-sm mt-2 leading-relaxed max-w-lg mx-auto">{lang.description}</p>
      </div>

      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{t("event_phase.decision")}</p>
        <div className="flex flex-col gap-3">
          {currentEvent.choices.map((choice) => {
            const choiceLang = language === "th" ? choice.th : choice.en;
            const isSelected = selected === choice.id;
            return (
              <button key={choice.id} onClick={() => !resolved && setSelected(choice.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  isSelected ? "bg-primary/10 border-primary/50 shadow-md" : "bg-card border-card-border hover:border-primary/30 hover:bg-card/80"
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? "border-primary bg-primary" : "border-border"}`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground mb-0.5">{choiceLang.label}</p>
                    <p className="text-xs text-muted-foreground">{choiceLang.description}</p>
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-primary/20">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t("event_phase.outcome")}</p>
                        <p className="text-xs font-mono text-primary">{effectLabel(choice.effect as Record<string, number>) || t("event_phase.noEffect")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={handleConfirm} disabled={!selected}
        className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
          selected ? "bg-primary text-primary-foreground hover:bg-primary/90 pulse-glow" : "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
        }`}>
        {t("event_phase.confirm")}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
