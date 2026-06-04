// ===== GAME PAGE v5.0 =====
import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { MetricsHeader } from "@/components/MetricsHeader";
import { CEOSelectionPhase } from "@/components/CEOSelectionPhase";
import { IntelPhase } from "@/components/IntelPhase";
import { BoardMeetingPhase } from "@/components/BoardMeetingPhase";
import { BlackMarketPhase } from "@/components/BlackMarketPhase";
import { EventPhase } from "@/components/EventPhase";
import { ActionPhase } from "@/components/ActionPhase";
import { ResolutionPhase } from "@/components/ResolutionPhase";
import { GameOver } from "@/components/GameOver";
import { CommandCenter } from "@/components/CommandCenter";
import { Building2, Lock } from "lucide-react";

// v5.0: Persona badge data sourced from botPersonas.ts values
const PERSONA_BADGES: Record<string, { label: string; color: string; icon: string }> = {
  discount_king: { label: "Discount King", color: "text-red-400 border-red-400/40 bg-red-900/20",     icon: "🔻" },
  tech_premium:  { label: "Tech Premium",  color: "text-blue-400 border-blue-400/40 bg-blue-900/20",  icon: "🔬" },
  copycat:       { label: "The Copycat",   color: "text-yellow-400 border-yellow-400/40 bg-yellow-900/20", icon: "🐱" },
};

function PhaseTicker() {
  const { phase, quarter, botPersona } = useGameStore();
  const { t } = useT();

  const labels = [
    { key: "intel",       label: t("phases.intel") },
    { key: "boardmeeting",label: t("phases.boardmeeting") },
    { key: "blackmarket", label: t("phases.blackmarket") },
    { key: "event",       label: t("phases.event") },
    { key: "action",      label: t("phases.action") },
    { key: "resolution",  label: t("phases.resolution") },
  ];
  const phaseIndex = labels.findIndex((l) => l.key === phase);
  const persona = botPersona ? PERSONA_BADGES[botPersona] : null;

  return (
    <div className="border-b border-border bg-sidebar/50 px-4 py-2 flex items-center gap-3 overflow-x-auto">
      <div className="flex items-center gap-1 shrink-0 mr-2">
        {labels.map((p, i) => (
          <div key={p.key} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] uppercase tracking-wider font-semibold transition-all whitespace-nowrap ${
              p.key === phase ? "bg-primary/15 text-primary border border-primary/30"
              : p.key === "blackmarket" && phase !== "blackmarket"
                ? i < phaseIndex ? "text-muted-foreground/40 line-through" : "text-red-400/60"
              : i < phaseIndex ? "text-muted-foreground/40 line-through"
              : "text-muted-foreground/60"
            }`}>
              <span className="font-mono text-[9px]">0{i + 1}</span>
              {p.label}
            </div>
            {i < labels.length - 1 && <div className={`w-3 h-px ${i < phaseIndex ? "bg-primary/40" : "bg-border"}`} />}
          </div>
        ))}
      </div>
      {persona && (
        <div className={`shrink-0 ml-1 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${persona.color}`}>
          <span>{persona.icon}</span>
          <span className="hidden sm:inline">{persona.label}</span>
        </div>
      )}
      <div className="ml-auto shrink-0 overflow-hidden w-40 relative">
        <div className="ticker-text whitespace-nowrap text-[10px] text-muted-foreground font-mono">
          SILICON EMPIRE · Q{quarter}/16 · MARKET LIVE
        </div>
      </div>
    </div>
  );
}

export default function Game() {
  const { phase } = useGameStore();
  const { t } = useT();
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);

  if (phase === "ceoselect") return <CEOSelectionPhase />;
  if (phase === "gameover")  return <GameOver />;

  const isActionPhase = phase === "action";
  const isBlackMarket = phase === "blackmarket";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MetricsHeader />
      <PhaseTicker />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto">
          {phase === "intel"        && <IntelPhase />}
          {phase === "boardmeeting" && <BoardMeetingPhase />}
          {phase === "blackmarket"  && <BlackMarketPhase />}
          {phase === "event"        && <EventPhase />}
          {phase === "action"       && <ActionPhase />}
          {phase === "resolution"   && <ResolutionPhase />}
        </div>
      </main>

      {/* Command Center FAB — hidden during black market and action */}
      {!isBlackMarket && (
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
      )}

      {commandCenterOpen && <CommandCenter onClose={() => setCommandCenterOpen(false)} />}
    </div>
  );
}
