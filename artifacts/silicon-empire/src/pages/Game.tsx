import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { MetricsHeader } from "@/components/MetricsHeader";
import { IntelPhase } from "@/components/IntelPhase";
import { EventPhase } from "@/components/EventPhase";
import { ActionPhase } from "@/components/ActionPhase";
import { ResolutionPhase } from "@/components/ResolutionPhase";
import { GameOver } from "@/components/GameOver";
import { CommandCenter } from "@/components/CommandCenter";
import { Building2, Lock } from "lucide-react";

function PhaseTicker() {
  const { phase, quarter } = useGameStore();
  const { t } = useT();
  const labels: Array<{ key: string; label: string }> = [
    { key: "intel", label: t("phases.intel") },
    { key: "event", label: t("phases.event") },
    { key: "action", label: t("phases.action") },
    { key: "resolution", label: t("phases.resolution") },
  ];
  const phaseIndex = labels.findIndex((l) => l.key === phase);

  return (
    <div className="border-b border-border bg-sidebar/50 px-4 py-2 flex items-center gap-3 overflow-x-auto">
      <div className="flex items-center gap-1 shrink-0 mr-2">
        {labels.map((p, i) => (
          <div key={p.key} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] uppercase tracking-wider font-semibold transition-all ${
              p.key === phase ? "bg-primary/15 text-primary border border-primary/30"
              : i < phaseIndex ? "text-muted-foreground/40 line-through"
              : "text-muted-foreground/60"
            }`}>
              <span className="font-mono text-[9px]">0{i + 1}</span>
              {p.label}
            </div>
            {i < labels.length - 1 && <div className={`w-4 h-px ${i < phaseIndex ? "bg-primary/40" : "bg-border"}`} />}
          </div>
        ))}
      </div>
      <div className="ml-auto shrink-0 overflow-hidden w-64 relative">
        <div className="ticker-text whitespace-nowrap text-[10px] text-muted-foreground font-mono">
          SILICON EMPIRE · GUFUTON INC. · Q{quarter}/16 · ACTIVE SESSION · MARKET LIVE
        </div>
      </div>
    </div>
  );
}

export default function Game() {
  const { phase, startGame } = useGameStore();
  const { t } = useT();
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);

  useEffect(() => { startGame(); }, []);

  if (phase === "gameover") return <GameOver />;

  const isActionPhase = phase === "action";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MetricsHeader />
      <PhaseTicker />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto">
          {phase === "intel" && <IntelPhase />}
          {phase === "event" && <EventPhase />}
          {phase === "action" && <ActionPhase />}
          {phase === "resolution" && <ResolutionPhase />}
        </div>
      </main>

      <div className="fixed bottom-4 right-4 z-30">
        <button
          onClick={() => setCommandCenterOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all duration-200 ${
            isActionPhase
              ? "bg-secondary border border-border text-muted-foreground"
              : "bg-card border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 pulse-glow"
          }`}
        >
          {isActionPhase ? <Lock className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
          {t("upgrades.title")}
          {isActionPhase && <span className="text-[10px] text-muted-foreground ml-1">(locked)</span>}
        </button>
      </div>

      {commandCenterOpen && <CommandCenter onClose={() => setCommandCenterOpen(false)} />}
    </div>
  );
}
