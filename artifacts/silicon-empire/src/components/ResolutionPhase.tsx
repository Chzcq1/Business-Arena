import { useGameStore } from "@/store/gameStore";
import { TrendingUp, TrendingDown, Package, DollarSign, BarChart2, ArrowRight, Trophy, Skull } from "lucide-react";

function formatMoney(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${n >= 0 ? "+" : "-"}$${(Math.abs(n) / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `${n >= 0 ? "+" : "-"}$${(Math.abs(n) / 1_000).toFixed(0)}K`;
  return `${n >= 0 ? "+" : ""}$${n}`;
}

function Stat({ label, player, bot, unit = "", isMoney = false, higherIsBetter = true }: {
  label: string; player: number; bot: number; unit?: string; isMoney?: boolean; higherIsBetter?: boolean;
}) {
  const playerWins = higherIsBetter ? player > bot : player < bot;
  const tie = Math.abs(player - bot) < (isMoney ? 100 : 0.5);

  const fmt = (n: number) =>
    isMoney
      ? `$${Math.abs(n) >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : `${(n / 1_000).toFixed(0)}K`}`
      : `${n.toLocaleString()}${unit}`;

  return (
    <div className="grid grid-cols-3 items-center py-3 border-b border-border/50 last:border-0">
      <div className={`text-right font-mono text-sm font-bold ${tie ? "text-muted-foreground" : playerWins ? "text-emerald-400" : "text-red-400"}`}>
        {fmt(player)}
        {!tie && playerWins && <TrendingUp className="w-3 h-3 inline ml-1" />}
        {!tie && !playerWins && <TrendingDown className="w-3 h-3 inline ml-1" />}
      </div>
      <div className="text-center text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-left font-mono text-sm font-bold ${tie ? "text-muted-foreground" : !playerWins ? "text-red-300" : "text-muted-foreground"}`}>
        {fmt(bot)}
        {!tie && !playerWins && <TrendingUp className="w-3 h-3 inline ml-1 text-red-400" />}
      </div>
    </div>
  );
}

export function ResolutionPhase() {
  const { lastResolution, quarter, nextQuarter, player, bot, language } = useGameStore();

  const t = language === "en"
    ? {
        title: "Quarter Resolution",
        sub: "Final results locked in",
        you: "YOU",
        competitor: "COMPETITOR",
        units: "Units Sold",
        revenue: "Revenue",
        profit: "Net Profit",
        share: "Market Share",
        summary: "ANALYSIS",
        next: "Begin Next Quarter",
        q: "Q",
      }
    : {
        title: "สรุปผลไตรมาส",
        sub: "ผลลัพธ์สุดท้ายถูกล็อคแล้ว",
        you: "คุณ",
        competitor: "คู่แข่ง",
        units: "หน่วยที่ขายได้",
        revenue: "รายได้",
        profit: "กำไรสุทธิ",
        share: "ส่วนแบ่งตลาด",
        summary: "การวิเคราะห์",
        next: "เริ่มไตรมาสถัดไป",
        q: "ไตรมาส",
      };

  if (!lastResolution) return null;

  const playerWon = lastResolution.playerSalesUnits > lastResolution.botSalesUnits;
  const tie = Math.abs(lastResolution.playerSalesUnits - lastResolution.botSalesUnits) < 10;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="text-center">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-3 ${
          playerWon ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : tie ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
          : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          {playerWon ? <Trophy className="w-3 h-3" /> : tie ? <BarChart2 className="w-3 h-3" /> : <Skull className="w-3 h-3" />}
          {t.q}{quarter} — {playerWon ? "VICTORY" : tie ? "DRAW" : "DEFEAT"}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.sub}</p>
      </div>

      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 py-2 px-4 bg-secondary/50 border-b border-border">
          <div className="text-right text-xs font-bold text-primary">{t.you}</div>
          <div className="text-center text-[10px] text-muted-foreground uppercase tracking-wider">vs</div>
          <div className="text-left text-xs font-bold text-red-400">{t.competitor}</div>
        </div>
        <div className="px-4 py-1">
          <Stat label={t.units} player={lastResolution.playerSalesUnits} bot={lastResolution.botSalesUnits} />
          <Stat label={t.revenue} player={lastResolution.playerRevenue} bot={lastResolution.botRevenue} isMoney={true} />
          <Stat label={t.profit} player={lastResolution.playerProfit} bot={lastResolution.botProfit} isMoney={true} />
          <Stat label={t.share} player={lastResolution.newPlayerMarketShare} bot={lastResolution.newBotMarketShare} unit="%" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <Package className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Units Shipped</p>
          <p className="text-lg font-mono font-bold text-blue-400">{lastResolution.playerSalesUnits.toLocaleString()}</p>
        </div>
        <div className={`bg-card border rounded-xl p-4 text-center ${lastResolution.capitalChange >= 0 ? "border-emerald-500/30" : "border-red-500/30"}`}>
          <DollarSign className={`w-5 h-5 mx-auto mb-2 ${lastResolution.capitalChange >= 0 ? "text-emerald-400" : "text-red-400"}`} />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Capital Δ</p>
          <p className={`text-lg font-mono font-bold ${lastResolution.capitalChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatMoney(lastResolution.capitalChange)}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <BarChart2 className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Market Share</p>
          <p className="text-lg font-mono font-bold text-cyan-400">{lastResolution.newPlayerMarketShare.toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t.summary}</p>
        <p className="text-sm text-foreground leading-relaxed">{lastResolution.summary}</p>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span>Total Capital: <span className="text-foreground font-mono">${(player.capital / 1_000_000).toFixed(2)}M</span></span>
          <span>Morale: <span className={`font-mono ${player.morale >= 60 ? "text-blue-400" : "text-red-400"}`}>{player.morale}%</span></span>
          <span>Intel: <span className="text-amber-400 font-mono">{player.intelPoints} pts</span></span>
        </div>
      </div>

      {quarter < 16 && player.capital > 0 ? (
        <button
          onClick={nextQuarter}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          {t.next} (Q{quarter + 1}/16)
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={nextQuarter}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm hover:bg-destructive/90 transition-colors"
        >
          View Final Results
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
