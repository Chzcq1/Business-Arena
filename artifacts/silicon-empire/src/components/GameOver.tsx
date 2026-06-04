// ===== GAME OVER v2.0 — Run History =====
import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { formatCapital } from "@/utils/format";
import { Trophy, TrendingDown, BarChart2, RotateCcw, Star, Clock, History } from "lucide-react";
import type { RunRecord } from "@/store/gameStore";

function getRatingLabel(r: RunRecord): string {
  if (r.gameResult === "won_instant") return "🏆 Silicon Emperor";
  if (r.gameResult === "won_timeout") return "✓ CEO of the Year";
  if (r.gameResult === "bankrupt") return "💀 Bankrupt";
  return "⚡ Runner-up";
}

function getResultColor(result: string): string {
  if (result === "won_instant") return "text-yellow-400";
  if (result === "won_timeout") return "text-emerald-400";
  if (result === "bankrupt") return "text-red-400";
  return "text-orange-400";
}

function RunHistoryPanel({ history, isTh }: { history: RunRecord[]; isTh: boolean }) {
  if (history.length === 0) return null;

  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {isTh ? "ประวัติการเล่น" : "Run History"}
        </p>
      </div>
      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {history.map((run, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/40 border ${
              i === 0 ? "border-primary/30" : "border-border/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`text-[10px] font-bold w-5 text-center ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                {i === 0 ? "✦" : `#${i + 1}`}
              </div>
              <div>
                <p className={`text-xs font-semibold ${getResultColor(run.gameResult)}`}>
                  {getRatingLabel(run)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {run.date} · Q{run.quartersSurvived}/16 · {run.ceoType}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-mono font-bold ${getResultColor(run.gameResult)}`}>
                {formatCapital(run.finalCapital)}
              </p>
              <p className="text-[10px] text-muted-foreground">{run.marketShare.toFixed(1)}% share</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GameOver() {
  const { player, bot, quarter, gameResult, resetGame, runHistory, language } = useGameStore();
  const { t } = useT();
  const isTh = language === "th";

  const isBankrupt = gameResult === "bankrupt";
  const isInstantWin = gameResult === "won_instant";
  const isTimeoutWin = gameResult === "won_timeout";
  const isTimeoutLoss = gameResult === "won_timeout_lost";
  const isAnyWin = isInstantWin || isTimeoutWin;

  const title = isBankrupt ? t("game_over.bankruptTitle")
    : isInstantWin ? t("game_over.winInstantTitle")
    : isTimeoutWin ? t("game_over.winTimeoutTitle")
    : isTimeoutLoss ? t("game_over.winTimeoutTitle")
    : t("game_over.bankruptTitle");

  const sub = isBankrupt ? t("game_over.bankruptSub")
    : isInstantWin ? t("game_over.winInstantSub")
    : isTimeoutWin ? t("game_over.winTimeoutWonSub")
    : t("game_over.winTimeoutLostSub");

  const rating =
    isInstantWin ? t("game_over.ratingVisionary")
    : player.capital > 200_000_000 ? t("game_over.ratingTitan")
    : player.capital > 50_000_000 ? t("game_over.ratingSolid")
    : player.capital > 10_000_000 ? t("game_over.ratingStruggling")
    : t("game_over.ratingBankrupt");

  const iconEl = isBankrupt ? <TrendingDown className="w-10 h-10 text-red-400" />
    : isInstantWin ? <Star className="w-10 h-10 text-yellow-400" />
    : isAnyWin ? <Trophy className="w-10 h-10 text-emerald-400" />
    : <BarChart2 className="w-10 h-10 text-orange-400" />;

  const ringColor = isBankrupt ? "bg-red-500/10 border-red-500/40"
    : isInstantWin ? "bg-yellow-500/10 border-yellow-500/40"
    : isAnyWin ? "bg-emerald-500/10 border-emerald-500/40"
    : "bg-orange-500/10 border-orange-500/40";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-lg w-full flex flex-col gap-6 text-center">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center border-2 ${ringColor}`}>
          {iconEl}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{sub}</p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t("game_over.finalRating")}</p>
          <p className="text-2xl font-bold text-primary mb-4">{rating}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: t("game_over.finalCapital"), value: formatCapital(player.capital), color: isAnyWin ? "text-emerald-400" : isBankrupt ? "text-red-400" : "text-foreground" },
              { label: t("game_over.botCapital"), value: formatCapital(bot.capital), color: "text-red-400" },
              { label: t("game_over.morale"), value: `${player.morale}%`, color: player.morale >= 50 ? "text-blue-400" : "text-red-400" },
              { label: t("game_over.finalShare"), value: `${player.marketShare.toFixed(1)}%`, color: player.marketShare > 50 ? "text-cyan-400" : "text-orange-400" },
              { label: t("game_over.quartersSurvived"), value: `${quarter - 1}/16`, color: "text-violet-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-secondary/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground mb-1">{stat.label}</p>
                <p className={`font-mono font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{t("game_over.victoryConditions")}</p>
          <div className="space-y-1.5 text-xs text-left">
            {[
              { label: t("game_over.instantWin"), active: isInstantWin, color: "text-yellow-400" },
              { label: t("game_over.timeoutWin"), active: isTimeoutWin, color: "text-emerald-400" },
              { label: t("game_over.bankrupt"), active: isBankrupt, color: "text-red-400" },
            ].map((cond) => (
              <div key={cond.label} className={`flex items-center gap-2 ${cond.active ? cond.color : "text-muted-foreground"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${cond.active ? "bg-current" : "bg-muted"}`} />
                {cond.label}
                {cond.active && <span className="ml-auto font-semibold text-[10px] uppercase tracking-wider">← {isTimeoutLoss && cond.color === "text-red-400" ? "RESULT" : "ACHIEVED"}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* v2.0: Run History */}
        <RunHistoryPanel history={runHistory} isTh={isTh} />

        <button onClick={resetGame}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
          <RotateCcw className="w-4 h-4" />
          {t("game_over.restart")}
        </button>
      </div>
    </div>
  );
}
