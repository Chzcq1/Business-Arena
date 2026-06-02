import { useGameStore } from "@/store/gameStore";
import { Trophy, TrendingDown, BarChart2, RotateCcw } from "lucide-react";

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function GameOver() {
  const { player, quarter, language, startGame } = useGameStore();

  const isWinner = player.capital > 10_000_000;
  const isBankrupt = player.capital <= 0;

  const rating =
    player.capital > 50_000_000 ? "Visionary CEO"
    : player.capital > 30_000_000 ? "Industry Titan"
    : player.capital > 15_000_000 ? "Solid Executive"
    : player.capital > 5_000_000 ? "Struggling Leader"
    : "Chapter 11";

  const t = language === "en"
    ? {
        title: isBankrupt ? "Bankruptcy" : isWinner ? "Game Complete" : "Game Over",
        sub: isBankrupt
          ? "Gufuton Inc. has filed for bankruptcy. The board has voted you out."
          : `${quarter - 1} quarters completed. The market has rendered its verdict.`,
        rating: "FINAL RATING",
        capital: "Final Capital",
        morale: "Company Morale",
        share: "Final Market Share",
        quarters: "Quarters Survived",
        restart: "New Game",
      }
    : {
        title: isBankrupt ? "ล้มละลาย" : "เกมจบแล้ว",
        sub: isBankrupt ? "Gufuton Inc. ยื่นขอล้มละลาย คณะกรรมการลงมติปลดคุณ" : `ผ่านไป ${quarter - 1} ไตรมาส ตลาดได้ตัดสินแล้ว`,
        rating: "คะแนนสุดท้าย",
        capital: "ทุนสุดท้าย",
        morale: "ขวัญกำลังใจบริษัท",
        share: "ส่วนแบ่งตลาดสุดท้าย",
        quarters: "ไตรมาสที่ผ่าน",
        restart: "เริ่มเกมใหม่",
      };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full flex flex-col gap-6 text-center">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center border-2 ${
          isBankrupt ? "bg-red-500/10 border-red-500/40" : isWinner ? "bg-emerald-500/10 border-emerald-500/40" : "bg-yellow-500/10 border-yellow-500/40"
        }`}>
          {isBankrupt ? <TrendingDown className="w-10 h-10 text-red-400" /> : isWinner ? <Trophy className="w-10 h-10 text-emerald-400" /> : <BarChart2 className="w-10 h-10 text-yellow-400" />}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t.title}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{t.sub}</p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{t.rating}</p>
          <p className="text-2xl font-bold text-primary mb-4">{rating}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: t.capital, value: formatMoney(player.capital), color: player.capital > 10_000_000 ? "text-emerald-400" : "text-red-400" },
              { label: t.morale, value: `${player.morale}%`, color: player.morale >= 50 ? "text-blue-400" : "text-red-400" },
              { label: t.share, value: `${player.marketShare.toFixed(1)}%`, color: player.marketShare > 50 ? "text-cyan-400" : "text-orange-400" },
              { label: t.quarters, value: `${quarter - 1}/16`, color: "text-violet-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-secondary/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground mb-1">{stat.label}</p>
                <p className={`font-mono font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            useGameStore.setState({
              phase: "intel",
              quarter: 1,
              player: { capital: 10000000, morale: 65, techLevel: 3, marketShare: 45, intelPoints: 3 },
              draft: { price: 699, productionBudget: 80000, intelAllocation: 0 },
              bot: { price: 749, productionBudget: 75000, capital: 10000000, marketShare: 55, lastMoveLabel: null, lastMoveTime: null },
              quarterTimer: 60,
              timerRunning: false,
              currentEvent: null,
              lastResolution: null,
              intelAlerts: [],
            });
            startGame();
          }}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {t.restart}
        </button>
      </div>
    </div>
  );
}
