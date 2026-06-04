// ===== RESOLUTION PHASE v6.0 =====
// v6.0: staff salary display, hard price cap warning, brand burn alert, bankruptcy modal

import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { formatDelta, formatMoney } from "@/utils/format";
import {
  TrendingUp, TrendingDown, Package, DollarSign, BarChart2, ArrowRight,
  Trophy, Skull, AlertTriangle, CreditCard, Leaf, Zap, Smile, AlertCircle,
  Users, RotateCcw, Flame,
} from "lucide-react";

function StatRow({ label, player, bot, unit = "", isMoney = false }: {
  label: string; player: number; bot: number; unit?: string; isMoney?: boolean;
}) {
  const playerWins = player > bot;
  const tie = Math.abs(player - bot) < (isMoney ? 5000 : 0.5);
  const fmt = (n: number) => isMoney ? formatMoney(n) : `${n.toLocaleString()}${unit}`;
  return (
    <div className="grid grid-cols-3 items-center py-3 border-b border-border/40 last:border-0">
      <div className={`text-right font-mono text-sm font-bold ${tie ? "text-muted-foreground" : playerWins ? "text-emerald-400" : "text-red-400"}`}>
        {fmt(player)}{!tie && playerWins && <TrendingUp className="w-3 h-3 inline ml-1" />}{!tie && !playerWins && <TrendingDown className="w-3 h-3 inline ml-1" />}
      </div>
      <div className="text-center text-[10px] text-muted-foreground uppercase tracking-wider px-1">{label}</div>
      <div className={`text-left font-mono text-sm font-bold ${tie ? "text-muted-foreground" : !playerWins ? "text-red-300" : "text-muted-foreground"}`}>
        {fmt(bot)}{!tie && !playerWins && <TrendingUp className="w-3 h-3 inline ml-1 text-red-400" />}
      </div>
    </div>
  );
}

// v6.0: Bankruptcy Modal — shown as overlay when company goes bankrupt
function BankruptcyModal() {
  const { gameResult, resetGame } = useGameStore();
  if (gameResult !== "bankrupt") return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-sm mx-4 bg-card border-2 border-red-500/60 rounded-2xl p-8 shadow-2xl text-center flex flex-col gap-5">
        <div className="w-16 h-16 rounded-full bg-red-500/15 border-2 border-red-500/40 flex items-center justify-center mx-auto">
          <Skull className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">GAME OVER</p>
          <h2 className="text-2xl font-bold text-foreground mb-2">Bankrupt</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your company has gone bankrupt. Capital fell below $0 after all expenses, fines, and staff salaries were deducted.
          </p>
        </div>
        <button
          onClick={resetGame}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Restart Company
        </button>
      </div>
    </div>
  );
}

export function ResolutionPhase() {
  const { lastResolution, quarter, nextQuarter, player, bot, loans, gameResult } = useGameStore();
  const { t } = useT();

  if (!lastResolution) return null;

  const r = lastResolution;
  const playerWon = r.playerSalesUnits > r.botSalesUnits;
  const tie = Math.abs(r.playerSalesUnits - r.botSalesUnits) < 10;
  const hasPenalties = r.eWastePenalty > 0 || r.debtRepayment > 0;

  const totalPlayerSales = Math.max(r.playerSalesUnits, 1);
  const segBudgetPct = Math.round((r.segmentBudget / totalPlayerSales) * 100);
  const segTechPct = Math.round((r.segmentTech / totalPlayerSales) * 100);
  const segBrandPct = Math.round((r.segmentBrand / totalPlayerSales) * 100);

  const isBankrupt = gameResult === "bankrupt";

  return (
    <>
      {/* v6.0: Bankruptcy modal overlay */}
      <BankruptcyModal />

      <div className="flex flex-col gap-5 max-w-2xl mx-auto">
        {/* Header badge */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-3 ${
            isBankrupt ? "bg-red-500/10 border-red-500/30 text-red-400"
            : playerWon ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : tie ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            {isBankrupt ? <Skull className="w-3 h-3" /> : playerWon ? <Trophy className="w-3 h-3" /> : tie ? <BarChart2 className="w-3 h-3" /> : <Skull className="w-3 h-3" />}
            Q{quarter} — {isBankrupt ? "BANKRUPT" : playerWon ? t("resolution_phase.victory") : tie ? t("resolution_phase.draw") : t("resolution_phase.defeat")}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("resolution_phase.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("resolution_phase.subtitle")}</p>
        </div>

        {/* v6.0: Hard Price Cap Warning */}
        {r.hardPricePenaltyApplied && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/40 rounded-xl text-sm text-red-300">
            <Flame className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              <p className="font-semibold text-red-400">Hard Price Cap Triggered!</p>
              <p className="text-xs">Your price was &gt;25% above the competitor — demand collapsed to 10%. {r.brandBurnApplied ? "Brand also burned −30 pts (price gouging)." : ""}</p>
            </div>
          </div>
        )}

        {/* v6.0: Brand Burn standalone warning (if >30% but show here if price penalty didn't show) */}
        {r.brandBurnApplied && !r.hardPricePenaltyApplied && (
          <div className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 border border-orange-500/40 rounded-xl text-sm text-orange-300">
            <Flame className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <p className="font-semibold text-orange-400">Brand Burn Penalty</p>
              <p className="text-xs">Price was &gt;30% above competitor — Brand −30 pts for price gouging.</p>
            </div>
          </div>
        )}

        {/* Battery penalty warning */}
        {r.batteryPenaltyApplied && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/40 rounded-xl text-sm text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              <p className="font-semibold text-red-400">Battery Milestone Penalty</p>
              <p className="text-xs">Revenue −20% (Q3+ requires Battery L2 or higher). Upgrade immediately in Tech Lab!</p>
            </div>
          </div>
        )}

        {/* Bot event label */}
        {r.botEventLabel && (
          <div className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-sm text-orange-300">
            <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <p className="text-[10px] text-orange-400/70 uppercase tracking-wider mb-0.5">Competitor Intel</p>
              <p className="font-mono text-xs">{r.botEventLabel}</p>
            </div>
          </div>
        )}

        {/* Head-to-head table */}
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-3 py-2 px-4 bg-secondary/50 border-b border-border">
            <div className="text-right text-xs font-bold text-primary">{t("resolution_phase.you")}</div>
            <div className="text-center text-[10px] text-muted-foreground uppercase tracking-wider">vs</div>
            <div className="text-left text-xs font-bold text-red-400">{t("resolution_phase.competitor")}</div>
          </div>
          <div className="px-4 py-1">
            <StatRow label={t("resolution_phase.units")} player={r.playerSalesUnits} bot={r.botSalesUnits} />
            <StatRow label={t("resolution_phase.revenue")} player={r.playerRevenue} bot={r.botRevenue} isMoney={true} />
            <StatRow label={t("resolution_phase.profit")} player={r.playerProfit} bot={r.botProfit} isMoney={true} />
            <StatRow label={t("resolution_phase.marketShare")} player={r.newPlayerMarketShare} bot={r.newBotMarketShare} unit="%" />
          </div>
        </div>

        {/* 3 summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-card-border rounded-xl p-4 text-center">
            <Package className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground mb-1">{t("resolution_phase.unitsShipped")}</p>
            <p className="text-lg font-mono font-bold text-blue-400">{r.playerSalesUnits.toLocaleString()}</p>
          </div>
          <div className={`bg-card border rounded-xl p-4 text-center ${r.capitalChange >= 0 ? "border-emerald-500/30" : "border-red-500/30"}`}>
            <DollarSign className={`w-5 h-5 mx-auto mb-2 ${r.capitalChange >= 0 ? "text-emerald-400" : "text-red-400"}`} />
            <p className="text-[10px] text-muted-foreground mb-1">{t("resolution_phase.capitalDelta")}</p>
            <p className={`text-lg font-mono font-bold ${r.capitalChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatDelta(r.capitalChange)}
            </p>
          </div>
          <div className="bg-card border border-card-border rounded-xl p-4 text-center">
            <BarChart2 className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground mb-1">{t("resolution_phase.marketShare")}</p>
            <p className="text-lg font-mono font-bold text-cyan-400">{r.newPlayerMarketShare.toFixed(1)}%</p>
          </div>
        </div>

        {/* v3: 3-Segment breakdown */}
        {r.playerSalesUnits > 0 && (
          <div className="bg-card border border-card-border rounded-xl p-5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{t("resolution_phase.segmentBreakdown")}</p>
            <div className="space-y-2">
              {[
                { label: t("resolution_phase.segBudget"), count: r.segmentBudget, pct: segBudgetPct, color: "bg-orange-400", textColor: "text-orange-400" },
                { label: t("resolution_phase.segTech"), count: r.segmentTech, pct: segTechPct, color: "bg-blue-400", textColor: "text-blue-400" },
                { label: t("resolution_phase.segBrand"), count: r.segmentBrand, pct: segBrandPct, color: "bg-purple-400", textColor: "text-purple-400" },
              ].map((seg) => (
                <div key={seg.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{seg.label}</span>
                    <span className={`font-mono font-bold ${seg.textColor}`}>{seg.count.toLocaleString()} ({seg.pct}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${seg.color}`} style={{ width: `${seg.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial breakdown */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{t("resolution_phase.breakdown")}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("resolution_phase.grossProfit")}</span>
              <span className={`font-mono font-bold ${r.grossProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatDelta(r.grossProfit)}</span>
            </div>
            {r.eWastePenalty > 0 && (
              <div className="flex justify-between items-center text-orange-400">
                <span className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5" />{t("resolution_phase.eWaste")} ({r.eWasteUnits.toLocaleString()} {t("resolution_phase.eWasteUnits")})</span>
                <span className="font-mono font-bold">−{formatMoney(r.eWastePenalty)}</span>
              </div>
            )}
            {r.debtRepayment > 0 && (
              <div className="flex justify-between items-center text-red-400">
                <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" />{t("resolution_phase.debtRepayment")} ({loans.quartersRemaining}Q left)</span>
                <span className="font-mono font-bold">−{formatMoney(r.debtRepayment)}</span>
              </div>
            )}
            {/* v6.0: Staff Salary */}
            {r.staffSalaryDeducted > 0 && (
              <div className="flex justify-between items-center text-yellow-400">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Staff Salaries (recurring)</span>
                <span className="font-mono font-bold">−{formatMoney(r.staffSalaryDeducted)}</span>
              </div>
            )}
            {r.techGrowth > 0 && (
              <div className="flex justify-between items-center text-violet-400">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" />{t("resolution_phase.techGrowth")}</span>
                <span className="font-mono font-bold">+{r.techGrowth}</span>
              </div>
            )}
            {r.ecotechEarned > 0 && (
              <div className="flex justify-between items-center text-emerald-400">
                <span className="flex items-center gap-1.5">⚗ EcoTech earned</span>
                <span className="font-mono font-bold">+{r.ecotechEarned} EcoTech</span>
              </div>
            )}
            {r.brandChange !== 0 && (
              <div className={`flex justify-between items-center ${r.brandChange > 0 ? "text-purple-400" : "text-red-400"}`}>
                <span className="flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5" />Brand Perception
                  {r.brandBurnApplied && <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/30 rounded px-1 ml-1">BURNED</span>}
                </span>
                <span className="font-mono font-bold">{r.brandChange > 0 ? "+" : ""}{r.brandChange}</span>
              </div>
            )}
            {r.hardPricePenaltyApplied && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 pt-1">
                <Flame className="w-3 h-3" />Price cap: demand at {(r.playerSalesUnits / Math.max(1, r.playerCapacity) * 100).toFixed(0)}% of capacity — price was too high vs competitor!
              </div>
            )}
            {!r.hardPricePenaltyApplied && r.demandFactor < 0.5 && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 pt-1">
                <AlertTriangle className="w-3 h-3" />Price elasticity: demand at {(r.demandFactor * 100).toFixed(0)}% — lower your price!
              </div>
            )}
            {!hasPenalties && !r.techGrowth && !r.staffSalaryDeducted && (
              <p className="text-xs text-muted-foreground italic">{t("resolution_phase.noPenalties")}</p>
            )}
            <div className="border-t border-border pt-2 flex justify-between items-center font-semibold">
              <span className="text-foreground">{t("resolution_phase.capitalDelta")}</span>
              <span className={`font-mono ${r.capitalChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatDelta(r.capitalChange)}</span>
            </div>
          </div>
        </div>

        {/* Summary + stats */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t("resolution_phase.analysis")}</p>
          <p className="text-sm text-foreground leading-relaxed">{t(r.summaryKey)}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span>{t("resolution_phase.totalCapital")}: <span className="text-foreground font-mono">{formatMoney(player.capital)}</span></span>
            <span>{t("resolution_phase.morale")}: <span className={`font-mono ${player.morale >= 60 ? "text-blue-400" : "text-red-400"}`}>{player.morale}%</span></span>
            <span>Brand: <span className="text-purple-400 font-mono">{player.brandPerception}</span></span>
            <span>⚗ <span className="text-emerald-400 font-mono">{player.ecotech}</span> EcoTech</span>
          </div>
        </div>

        {/* Next quarter / end game button */}
        {!isBankrupt && (
          quarter < 16 && player.capital > 0 ? (
            <button onClick={nextQuarter} className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
              {t("resolution_phase.next")} (Q{quarter + 1}/16)<ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={nextQuarter} className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm hover:bg-destructive/90 transition-colors">
              {t("resolution_phase.viewFinal")}<ArrowRight className="w-4 h-4" />
            </button>
          )
        )}
      </div>
    </>
  );
}
