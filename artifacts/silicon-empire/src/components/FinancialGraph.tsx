// ===== FINANCIAL GRAPH =====
// กราฟ SVG แสดงประวัติทุนของผู้เล่นและบอท
// ใช้ใน CommandCenter tab "Analytics"

import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { formatCapital } from "@/utils/format";

function shortLabel(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function FinancialGraph() {
  const { t } = useT();
  const { capitalHistory, player, bot, quarter } = useGameStore();

  const W = 340; const H = 160; const PL = 44; const PR = 12; const PT = 12; const PB = 24;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;

  if (capitalHistory.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-36 text-muted-foreground text-sm">
        <span className="text-3xl mb-2">📊</span>
        <span className="text-xs">{t("analytics.noData")}</span>
      </div>
    );
  }

  const allVals = capitalHistory.flatMap((h) => [h.playerCapital, h.botCapital]);
  const maxVal = Math.max(...allVals, 10_000_000);
  const minVal = Math.min(...allVals, 0);
  const range = Math.max(maxVal - minVal, 1);
  const n = capitalHistory.length;

  const px = (i: number) => PL + (i / Math.max(n - 1, 1)) * innerW;
  const py = (v: number) => PT + innerH - ((v - minVal) / range) * innerH;

  const playerPts = capitalHistory.map((h, i) => `${px(i)},${py(h.playerCapital)}`).join(" ");
  const botPts    = capitalHistory.map((h, i) => `${px(i)},${py(h.botCapital)}`).join(" ");

  const yTicks = [minVal, minVal + range * 0.5, maxVal];
  const winTargetY = py(1_000_000_000);
  const showWinLine = winTargetY >= PT && winTargetY <= PT + innerH;

  const diff = player.capital - bot.capital;
  const li = n - 1;
  const last = capitalHistory[li];

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-blue-400 rounded" />
            <span className="text-muted-foreground">{t("analytics.you")}</span>
            <span className="text-blue-400 font-mono font-semibold">{formatCapital(player.capital)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-red-400 rounded" />
            <span className="text-muted-foreground">{t("analytics.bot")}</span>
            <span className="text-red-400 font-mono font-semibold">{formatCapital(bot.capital)}</span>
          </div>
        </div>
        <div className={`text-[10px] font-mono px-2 py-0.5 rounded ${diff > 0 ? "text-blue-400 bg-blue-500/10" : diff < 0 ? "text-red-400 bg-red-500/10" : "text-muted-foreground"}`}>
          {diff > 0 ? `+${shortLabel(diff)} lead` : diff < 0 ? `${shortLabel(Math.abs(diff))} behind` : "Tied"}
        </div>
      </div>

      {/* SVG */}
      <div className="bg-secondary/30 rounded-xl border border-border overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: `${H}px` }}>
          {/* Grid */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={PL} y1={py(v)} x2={W - PR} y2={py(v)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={PL - 4} y={py(v) + 3} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end">{shortLabel(v)}</text>
            </g>
          ))}

          {/* $1B win line */}
          {showWinLine && (
            <>
              <line x1={PL} y1={winTargetY} x2={W - PR} y2={winTargetY} stroke="rgba(251,191,36,0.4)" strokeWidth="1" strokeDasharray="4,3" />
              <text x={W - PR - 2} y={winTargetY - 3} fill="rgba(251,191,36,0.6)" fontSize="7" textAnchor="end">$1B WIN</text>
            </>
          )}

          {/* X labels */}
          {capitalHistory
            .filter((_, i) => i === 0 || i === n - 1 || i % Math.max(1, Math.floor(n / 4)) === 0)
            .map((h, i, arr) => {
              const origIdx = capitalHistory.indexOf(h);
              return (
                <text key={i} x={px(origIdx)} y={H - 5} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle">
                  Q{h.quarter}
                </text>
              );
            })}

          {/* Bot line */}
          <polyline points={botPts} fill="none" stroke="rgb(248,113,113)" strokeWidth="1.5" strokeLinejoin="round" />
          {/* Player line */}
          <polyline points={playerPts} fill="none" stroke="rgb(96,165,250)" strokeWidth="2" strokeLinejoin="round" />

          {/* End dots */}
          <circle cx={px(li)} cy={py(last.playerCapital)} r="3" fill="rgb(96,165,250)" />
          <circle cx={px(li)} cy={py(last.botCapital)} r="3" fill="rgb(248,113,113)" />
        </svg>
      </div>

      <div className="text-[10px] text-center text-muted-foreground font-mono">
        {t("analytics.quarter")}{quarter} / 16
      </div>
    </div>
  );
}
