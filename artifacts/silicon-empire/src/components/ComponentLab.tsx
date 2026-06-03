// ===== COMPONENT LAB =====
// แสดงสถานะและปุ่ม upgrade Component ทั้ง 4 ตัว
// ใช้ใน CommandCenter tab "Tech Lab"

import { useGameStore, COMPONENT_UPGRADE_COSTS } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import type { ComponentsState } from "@/store/types";

const COMPONENT_BONUSES: Record<keyof ComponentsState, string[]> = {
  chip: [
    "Base",
    "Base performance",
    "Tech segment ×1.12",
    "Tech segment ×1.25",
    "Tech segment ×1.40 · +1 EcoTech/Q",
    "Tech segment ×1.60 · +1 EcoTech/Q",
  ],
  battery: [
    "⚠ No protection!",
    "Q3+ protected (no −20% penalty)",
    "Q3+ · +3 Brand/Q",
    "+3 Brand/Q · Budget demand ×1.08",
    "+3 Brand/Q · Budget ×1.08 · event immunity",
    "+3 Brand/Q · Budget ×1.08 · full immunity",
  ],
  display: [
    "Price ceiling: Tech×$200",
    "Max price $1,499",
    "Max price $1,724 · ceiling ×1.15",
    "Max price $2,023 · ceiling ×1.35",
    "Max price $2,398 · ceiling ×1.60 · Brand seg ×1.10",
    "Max price $2,998 · ceiling ×2.00 · Brand seg ×1.20",
  ],
  memory: [
    "Base",
    "Base",
    "Budget demand ×1.06",
    "Budget ×1.12 · Unit cost −3%",
    "Budget ×1.18 · Unit cost −5%",
    "Budget ×1.25 · Unit cost −7%",
  ],
};

const COMP_ICONS: Record<string, string> = { chip: "🔬", battery: "🔋", display: "🖥️", memory: "💾" };

const COMP_COLORS: Record<keyof ComponentsState, { bar: string; border: string }> = {
  chip:    { bar: "bg-blue-400",   border: "border-blue-500/40" },
  battery: { bar: "bg-green-400",  border: "border-green-500/40" },
  display: { bar: "bg-purple-400", border: "border-purple-500/40" },
  memory:  { bar: "bg-orange-400", border: "border-orange-500/40" },
};

function LevelBar({ level, colorClass }: { level: number; colorClass: string }) {
  return (
    <div className="flex gap-1 my-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`h-2 flex-1 rounded-sm transition-all duration-300 ${i < level ? colorClass : "bg-secondary"}`} />
      ))}
    </div>
  );
}

export function ComponentLab() {
  const { t } = useT();
  const { player, components, phase, upgradeComponent } = useGameStore();
  const locked = phase === "action";

  const comps: (keyof ComponentsState)[] = ["chip", "battery", "display", "memory"];

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground leading-relaxed">{t("components.subtitle")}</p>

      {/* EcoTech balance */}
      <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
        <span className="text-xs text-muted-foreground">{t("board_meeting.ecotechBalance")}</span>
        <span className="text-base font-bold text-emerald-400">⚗ {player.ecotech} EcoTech</span>
      </div>

      {comps.map((comp) => {
        const level = components[comp];
        const isMax = level >= 5;
        const nextCost = isMax ? 0 : (COMPONENT_UPGRADE_COSTS[comp][level + 1] ?? 0);
        const canAfford = player.ecotech >= nextCost;
        const colors = COMP_COLORS[comp];

        return (
          <div
            key={comp}
            className={`rounded-xl border bg-secondary/30 p-4 transition-all ${locked ? "opacity-60" : colors.border}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{COMP_ICONS[comp]}</span>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t(`components.${comp}`)}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Level {level} {isMax ? "· MAX" : ""}
                  </div>
                </div>
              </div>

              {!isMax ? (
                <button
                  disabled={!canAfford || locked}
                  onClick={() => upgradeComponent(comp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1
                    ${canAfford && !locked
                      ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 cursor-pointer"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                    }`}
                >
                  ⚗ {nextCost} → L{level + 1}
                </button>
              ) : (
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                  ✓ MAX
                </span>
              )}
            </div>

            <LevelBar level={level} colorClass={colors.bar} />

            <div className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              <span className="text-muted-foreground/60 mr-1">Now:</span>
              {COMPONENT_BONUSES[comp][level]}
            </div>
            {!isMax && (
              <div className="mt-0.5 text-[10px] text-muted-foreground/50 leading-relaxed">
                <span className="mr-1">→ L{level + 1}:</span>
                {COMPONENT_BONUSES[comp][level + 1]}
              </div>
            )}
          </div>
        );
      })}

      {locked && (
        <p className="text-xs text-center text-muted-foreground italic pt-1">
          {t("upgrades.notAvailable")}
        </p>
      )}
    </div>
  );
}
