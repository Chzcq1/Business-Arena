import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
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

const effectLabel = (effect: Record<string, number>, lang: "en" | "th") => {
  const labels: string[] = [];
  if (effect.capital) labels.push(`${effect.capital > 0 ? "+" : ""}$${(Math.abs(effect.capital) / 1_000_000).toFixed(1)}M Capital`);
  if (effect.morale) labels.push(`${effect.morale > 0 ? "+" : ""}${effect.morale} Morale`);
  if (effect.techLevel) labels.push(`${effect.techLevel > 0 ? "+" : ""}${effect.techLevel} Tech`);
  if (effect.marketShare) labels.push(`${effect.marketShare > 0 ? "+" : ""}${effect.marketShare}% Share`);
  if (effect.intelBonus) labels.push(`+${effect.intelBonus} Intel Pts`);
  return labels.join(" · ");
};

export function EventPhase() {
  const { currentEvent, resolveEvent, startActionPhase, quarter, language } = useGameStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  const t = language === "en"
    ? {
        title: "Dynamic Event",
        sub: "A critical situation demands your attention",
        decision: "YOUR DECISION",
        effect: "OUTCOME",
        confirm: "Commit & Start Quarter",
        q: "Q",
      }
    : {
        title: "เหตุการณ์พิเศษ",
        sub: "สถานการณ์สำคัญต้องการความสนใจ",
        decision: "การตัดสินใจของคุณ",
        effect: "ผลลัพธ์",
        confirm: "ยืนยันและเริ่มไตรมาส",
        q: "ไตรมาส",
      };

  if (!currentEvent) return (
    <div className="text-center text-muted-foreground py-10">No event loaded.</div>
  );

  const handleSelect = (id: string) => {
    if (resolved) return;
    setSelected(id);
  };

  const handleConfirm = () => {
    if (!selected) return;
    resolveEvent(selected);
    setResolved(true);
    setTimeout(() => {
      startActionPhase();
      setSelected(null);
      setResolved(false);
    }, 400);
  };

  const colorClass = TYPE_COLORS[currentEvent.type];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-3 ${colorClass}`}>
          {TYPE_ICONS[currentEvent.type]}
          {t.q}{quarter} — EVENT PHASE
        </div>
        <h1 className="text-2xl font-bold text-foreground">{currentEvent.title}</h1>
        <p className="text-muted-foreground text-sm mt-2 leading-relaxed max-w-lg mx-auto">{currentEvent.description}</p>
      </div>

      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{t.decision}</p>
        <div className="flex flex-col gap-3">
          {currentEvent.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                selected === choice.id
                  ? "bg-primary/10 border-primary/50 shadow-md"
                  : "bg-card border-card-border hover:border-primary/30 hover:bg-card/80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selected === choice.id ? "border-primary bg-primary" : "border-border"
                    }`}>
                      {selected === choice.id && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{choice.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">{choice.description}</p>
                </div>
              </div>
              {selected === choice.id && (
                <div className="mt-3 pt-3 border-t border-primary/20 pl-6">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t.effect}</p>
                  <p className="text-xs font-mono text-primary">{effectLabel(choice.effect as Record<string, number>, language) || "No immediate effect"}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selected}
        className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
          selected
            ? "bg-primary text-primary-foreground hover:bg-primary/90 pulse-glow"
            : "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
        }`}
      >
        {t.confirm}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
