// ===== CEO SELECTION PHASE v4.0 =====
import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { HowToPlay } from "@/components/HowToPlay";
import type { CEOBackgroundType } from "@/store/types";

const CEO_STYLES: Record<CEOBackgroundType, {
  icon: string; color: string; border: string; bg: string; glow: string;
}> = {
  visionary: { icon: "🔭", color: "text-blue-400",   border: "border-blue-400",   bg: "bg-blue-900/25",   glow: "shadow-blue-500/20"   },
  marketer:  { icon: "📣", color: "text-purple-400", border: "border-purple-400", bg: "bg-purple-900/25", glow: "shadow-purple-500/20" },
  operator:  { icon: "⚙️", color: "text-emerald-400",border: "border-emerald-400",bg: "bg-emerald-900/25",glow: "shadow-emerald-500/20"},
};

const CLASSES: CEOBackgroundType[] = ["visionary", "marketer", "operator"];

export function CEOSelectionPhase() {
  const { selectCEOBackground, toggleLanguage, language, showHowToPlay, setShowHowToPlay } = useGameStore();
  const { t } = useT();
  const [selected, setSelected] = useState<CEOBackgroundType | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showHowToPlay && <HowToPlay />}
      <div className="border-b border-border bg-sidebar/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-sm">💻</div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Gufuton Inc.</p>
            <p className="text-sm font-bold text-foreground">Silicon Empire</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowHowToPlay(true)} className="text-[10px] px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors font-semibold">
            {language === "th" ? "วิธีเล่น ?" : "How to Play ?"}
          </button>
          <span className="text-[10px] text-muted-foreground font-mono">v8.0 · 16Q</span>
          <button onClick={toggleLanguage} className="text-[10px] px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors font-mono uppercase">
            {language === "en" ? "TH" : "EN"}
          </button>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold mb-4 uppercase tracking-wider">
              🏆 Board of Directors · Pre-Game Selection
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("ceo_selection.title")}</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">{t("ceo_selection.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {CLASSES.map((type) => {
              const s = CEO_STYLES[type];
              const isSelected = selected === type;
              return (
                <button key={type} onClick={() => setSelected(type)}
                  className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer group
                    ${isSelected ? `${s.border} ${s.bg} shadow-xl ${s.glow}` : "border-border bg-card hover:border-border/70 hover:bg-secondary/30"}`}>
                  <div className="flex items-start justify-between mb-4">
                    <span className={`text-3xl transition-transform ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>{s.icon}</span>
                    {isSelected && (
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${s.border} ${s.color}`}>
                        ✓ CHOSEN
                      </span>
                    )}
                  </div>
                  <h2 className={`text-sm font-bold mb-1.5 transition-colors ${isSelected ? s.color : "text-foreground"}`}>
                    {t(`ceo_classes.${type}.title`)}
                  </h2>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                    {t(`ceo_classes.${type}.desc`)}
                  </p>
                  <div className="space-y-1.5 pt-3 border-t border-border/40">
                    <div className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                      <span className="text-emerald-300/90">{t(`ceo_classes.${type}.pro`)}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-red-400 font-bold shrink-0 mt-0.5">✗</span>
                      <span className="text-red-300/80">{t(`ceo_classes.${type}.con`)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-[11px] text-muted-foreground mb-5">{t("ceo_selection.info")}</p>

          <button
            onClick={() => selected && selectCEOBackground(selected)}
            disabled={!selected}
            className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wider transition-all uppercase
              ${selected
                ? "bg-primary text-primary-foreground hover:bg-primary/90 pulse-glow shadow-lg"
                : "bg-secondary/50 text-muted-foreground cursor-not-allowed opacity-50"}`}>
            {selected
              ? `🚀 ${t("ceo_selection.select")} — ${t(`ceo_classes.${selected}.title`)}`
              : t("ceo_selection.select")}
          </button>
        </div>
      </main>
    </div>
  );
}
