import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { formatDelta, formatMoney } from "@/utils/format";
import { TrendingUp, TrendingDown, Package, DollarSign, BarChart2, ArrowRight, Trophy, Skull, AlertTriangle, CreditCard, Leaf, Zap } from "lucide-react";

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

export function ResolutionPhase() {
  const { lastResolution, quarter, nextQuarter, player, bot, loans, language } = useGameStore();
  const { t } = useT();

  if (!lastResolution) return null;

  const playerWon = lastResolution.playerSalesUnits > lastResolution.botSalesUnits;
  const tie = Math.abs(lastResolution.playerSalesUnits - lastResolution.botSalesUnits) < 10;
  const hasPenalties = lastResolution.eWastePenalty > 0 || lastResolution.debtRepayment > 0;

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      <div className="text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-3 ${
          playerWon ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : tie ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
          : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          {playerWon ? <Trophy className="w-3 h-3" /> : tie ? <BarChart2 className="w-3 h-3" /> : <Skull className="w-3 h-3" />}
          Q{quarter} — {playerWon ? t("resolution_phase.victory") : tie ? t("resolution_phase.draw") : t("resolution_phase.defeat")}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t("resolution_phase.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("resolution_phase.subtitle")}</p>
      </div>

      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 py-2 px-4 bg-secondary/50 border-b border-border">
          <div className="text-right text-xs font-bold text-primary">{t("resolution_phase.you")}</div>
          <div className="text-center text-[10px] text-muted-foreground uppercase tracking-wider">vs</div>
          <div className="text-left text-xs font-bold text-red-400">{t("resolution_phase.competitor")}</div>
        </div>
        <div className="px-4 py-1">
          <StatRow label={t("resolution_phase.units")} player={lastResolution.playerSalesUnits} bot={lastResolution.botSalesUnits} />
          <StatRow label={t("resolution_phase.revenue")} player={lastResolution.playerRevenue} bot={lastResolution.botRevenue} isMoney={true} />
          <StatRow label={t("resolution_phase.profit")} player={lastResolution.playerProfit} bot={lastResolution.botProfit} isMoney={true} />
          <StatRow label={t("resolution_phase.marketShare")} player={lastResolution.newPlayerMarketShare} bot={lastResolution.newBotMarketShare} unit="%" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <Package className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <p className="text-[10px] text-muted-foreground mb-1">{t("resolution_phase.unitsShipped")}</p>
          <p className="text-lg font-mono font-bold text-blue-400">{lastResolution.playerSalesUnits.toLocaleString()}</p>
        </div>
        <div className={`bg-card border rounded-xl p-4 text-center ${lastResolution.capitalChange >= 0 ? "border-emerald-500/30" : "border-red-500/30"}`}>
          <DollarSign className={`w-5 h-5 mx-auto mb-2 ${lastResolution.capitalChange >= 0 ? "text-emerald-400" : "text-red-400"}`} />
          <p className="text-[10px] text-muted-foreground mb-1">{t("resolution_phase.capitalDelta")}</p>
          <p className={`text-lg font-mono font-bold ${lastResolution.capitalChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatDelta(lastResolution.capitalChange)}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <BarChart2 className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
          <p className="text-[10px] text-muted-foreground mb-1">{t("resolution_phase.marketShare")}</p>
          <p className="text-lg font-mono font-bold text-cyan-400">{lastResolution.newPlayerMarketShare.toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{t("resolution_phase.breakdown")}</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t("resolution_phase.grossProfit")}</span>
            <span className={`font-mono font-bold ${lastResolution.grossProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatDelta(lastResolution.grossProfit)}</span>
          </div>
          {lastResolution.eWastePenalty > 0 && (
            <div className="flex justify-between items-center text-orange-400">
              <span className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5" />{t("resolution_phase.eWaste")} ({lastResolution.eWasteUnits.toLocaleString()} {t("resolution_phase.eWasteUnits")})</span>
              <span className="font-mono font-bold">-{formatMoney(lastResolution.eWastePenalty)}</span>
            </div>
          )}
          {lastResolution.debtRepayment > 0 && (
            <div className="flex justify-between items-center text-red-400">
              <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" />{t("resolution_phase.debtRepayment")} ({loans.quartersRemaining}Q left)</span>
              <span className="font-mono font-bold">-{formatMoney(lastResolution.debtRepayment)}</span>
            </div>
          )}
          {lastResolution.techGrowth > 0 && (
            <div className="flex justify-between items-center text-violet-400">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" />{t("resolution_phase.techGrowth")}</span>
              <span className="font-mono font-bold">+{lastResolution.techGrowth}</span>
            </div>
          )}
          {lastResolution.demandFactor < 0.5 && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 pt-1">
              <AlertTriangle className="w-3 h-3" />Price elasticity warning: demand at {(lastResolution.demandFactor * 100).toFixed(0)}%
            </div>
          )}
          {!hasPenalties && !lastResolution.techGrowth && (
            <p className="text-xs text-muted-foreground italic">{t("resolution_phase.noPenalties")}</p>
          )}
          <div className="border-t border-border pt-2 flex justify-between items-center font-semibold">
            <span className="text-foreground">{t("resolution_phase.capitalDelta")}</span>
            <span className={`font-mono ${lastResolution.capitalChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatDelta(lastResolution.capitalChange)}</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t("resolution_phase.analysis")}</p>
        <p className="text-sm text-foreground leading-relaxed">{t(lastResolution.summaryKey)}</p>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span>{t("resolution_phase.totalCapital")}: <span className="text-foreground font-mono">{formatMoney(player.capital)}</span></span>
          <span>{t("resolution_phase.morale")}: <span className={`font-mono ${player.morale >= 60 ? "text-blue-400" : "text-red-400"}`}>{player.morale}%</span></span>
          <span>{t("resolution_phase.intelPts")}: <span className="text-amber-400 font-mono">{player.intelPoints}</span></span>
        </div>
      </div>

      {quarter < 16 && player.capital > 0 ? (
        <button onClick={nextQuarter} className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
          {t("resolution_phase.next")} (Q{quarter + 1}/16)<ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <button onClick={nextQuarter} className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm hover:bg-destructive/90 transition-colors">
          {t("resolution_phase.viewFinal")}<ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
