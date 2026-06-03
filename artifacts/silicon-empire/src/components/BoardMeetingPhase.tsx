// ===== BOARD MEETING PHASE =====
// หน้าประชุมบอร์ด — ผู้เล่นเลือก Directive และตรวจสอบสถานะ Component

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import type { BoardDirective } from "@/store/types";

// ไอคอน Directive แต่ละประเภท
const DIRECTIVE_ICONS: Record<BoardDirective, string> = {
  aggressive_rd:    "🔬",
  austerity:        "💹",
  market_expansion: "📈",
  brand_campaign:   "📣",
  cost_cutting:     "⚙️",
  talent_retention: "🤝",
  premium_focus:    "💎",
  volume_play:      "📦",
};

const DIRECTIVE_COLORS: Record<BoardDirective, string> = {
  aggressive_rd:    "border-blue-500/50 hover:border-blue-400",
  austerity:        "border-orange-500/50 hover:border-orange-400",
  market_expansion: "border-green-500/50 hover:border-green-400",
  brand_campaign:   "border-purple-500/50 hover:border-purple-400",
  cost_cutting:     "border-yellow-500/50 hover:border-yellow-400",
  talent_retention: "border-cyan-500/50 hover:border-cyan-400",
  premium_focus:    "border-pink-500/50 hover:border-pink-400",
  volume_play:      "border-indigo-500/50 hover:border-indigo-400",
};

const DIRECTIVE_SELECTED: Record<BoardDirective, string> = {
  aggressive_rd:    "border-blue-400 bg-blue-900/30",
  austerity:        "border-orange-400 bg-orange-900/30",
  market_expansion: "border-green-400 bg-green-900/30",
  brand_campaign:   "border-purple-400 bg-purple-900/30",
  cost_cutting:     "border-yellow-400 bg-yellow-900/30",
  talent_retention: "border-cyan-400 bg-cyan-900/30",
  premium_focus:    "border-pink-400 bg-pink-900/30",
  volume_play:      "border-indigo-400 bg-indigo-900/30",
};

function ComponentLevelBar({ level, max = 5 }: { level: number; max?: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-4 rounded-sm transition-all ${i < level ? "bg-emerald-400" : "bg-white/10"}`}
        />
      ))}
    </div>
  );
}

export function BoardMeetingPhase() {
  const { t } = useT();
  const { quarter, pendingDirectives, components, player, chooseBoardDirective } = useGameStore();
  const [selected, setSelected] = useState<BoardDirective | null>(null);

  function handleCommit() {
    if (!selected) return;
    chooseBoardDirective(selected);
  }

  // Milestone warnings
  const warnings: string[] = [];
  if (quarter >= 2 && components.battery < 2)
    warnings.push("⚠ Battery below L2 — Q3 brings −20% revenue penalty unless upgraded.");
  if (quarter >= 7 && components.chip < 3)
    warnings.push("⚠ Chip below L3 — falling behind on Tech Enthusiast segment.");
  if (quarter >= 9 && components.display < 3)
    warnings.push("⚠ Display below L3 — price ceiling too low for late-game revenue.");

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-2">
            🏢 Q{quarter} — {t("board_meeting.phaseLabel")}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("board_meeting.title")}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t("board_meeting.subtitle")}</p>
        </div>
        <div className="text-right bg-secondary/50 rounded-lg px-4 py-2 border border-border shrink-0">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("board_meeting.ecotechBalance")}</div>
          <div className="text-2xl font-bold text-emerald-400">⚗ {player.ecotech}</div>
        </div>
      </div>

      {/* Milestone Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1.5">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Directive Selection */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t("board_meeting.directiveLabel")}</p>
        <p className="text-xs text-muted-foreground mb-3">{t("board_meeting.directiveHint")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {pendingDirectives.map((directive) => {
            const isSelected = selected === directive;
            return (
              <button
                key={directive}
                onClick={() => setSelected(directive)}
                className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer
                  ${isSelected ? DIRECTIVE_SELECTED[directive] : `bg-card ${DIRECTIVE_COLORS[directive]}`}`}
              >
                <div className="text-2xl mb-2">{DIRECTIVE_ICONS[directive]}</div>
                <div className="font-semibold text-sm text-foreground mb-1">
                  {t(`directives.${directive}`)}
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {t(`directives.${directive}_desc`)}
                </div>
                {isSelected && (
                  <div className="mt-2 text-xs font-mono text-primary">✓ Selected</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Component Status */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{t("board_meeting.componentStatus")}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["chip", "battery", "display", "memory"] as const).map((comp) => {
            const level = components[comp];
            const COMP_ICONS: Record<string, string> = { chip: "🔬", battery: "🔋", display: "🖥️", memory: "💾" };
            return (
              <div key={comp} className="bg-card border border-card-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{COMP_ICONS[comp]}</span>
                  <div>
                    <div className="text-xs font-semibold text-foreground">{t(`components.${comp}`)}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">L{level}/5</div>
                  </div>
                </div>
                <ComponentLevelBar level={level} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Commit Button */}
      <button
        onClick={handleCommit}
        disabled={!selected}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm tracking-wider transition-all
          ${selected
            ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer pulse-glow"
            : "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
          }`}
      >
        {selected ? `${DIRECTIVE_ICONS[selected]} ${t("board_meeting.proceed")}` : t("board_meeting.proceed")}
      </button>
    </div>
  );
}
