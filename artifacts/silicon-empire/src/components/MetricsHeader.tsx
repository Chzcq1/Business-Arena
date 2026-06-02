import { useGameStore } from "@/store/gameStore";
import { TrendingUp, Zap, Cpu, Globe, Brain } from "lucide-react";

const formatCapital = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
};

export function MetricsHeader() {
  const { player, quarter, language, toggleLanguage } = useGameStore();

  const t = language === "en"
    ? { capital: "Capital", morale: "Morale", tech: "Tech Lvl", share: "Market Share", intel: "Intel Pts", q: "Q" }
    : { capital: "ทุน", morale: "ขวัญกำลังใจ", tech: "ระดับเทค", share: "ส่วนแบ่งตลาด", intel: "แต้มข่าวกรอง", q: "ไตรมาส" };

  const metrics = [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: t.capital,
      value: formatCapital(player.capital),
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: t.morale,
      value: `${player.morale}%`,
      color: player.morale >= 60 ? "text-blue-400" : player.morale >= 40 ? "text-yellow-400" : "text-red-400",
      bg: player.morale >= 60 ? "bg-blue-400/10" : player.morale >= 40 ? "bg-yellow-400/10" : "bg-red-400/10",
    },
    {
      icon: <Cpu className="w-4 h-4" />,
      label: t.tech,
      value: `${player.techLevel}`,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
    {
      icon: <Globe className="w-4 h-4" />,
      label: t.share,
      value: `${player.marketShare.toFixed(1)}%`,
      color: player.marketShare > 50 ? "text-cyan-400" : "text-orange-400",
      bg: player.marketShare > 50 ? "bg-cyan-400/10" : "bg-orange-400/10",
    },
    {
      icon: <Brain className="w-4 h-4" />,
      label: t.intel,
      value: `${player.intelPoints}`,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2 gap-3">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary/20 border border-primary/40 flex items-center justify-center">
              <span className="text-primary font-bold text-xs">SE</span>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground leading-none">SILICON EMPIRE</p>
              <p className="text-[10px] text-muted-foreground">GUFUTON INC.</p>
            </div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {t.q}
            </p>
            <p className="text-lg font-mono font-bold text-primary leading-none">{quarter}<span className="text-xs text-muted-foreground">/16</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-center flex-wrap">
          {metrics.map((m) => (
            <div
              key={m.label}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${m.bg} border border-white/5`}
            >
              <span className={m.color}>{m.icon}</span>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider leading-none mb-0.5">{m.label}</p>
                <p className={`text-sm font-mono font-bold leading-none ${m.color}`}>{m.value}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={toggleLanguage}
          className="shrink-0 px-3 py-1.5 rounded-md bg-secondary border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
        >
          {language === "en" ? "TH" : "EN"}
        </button>
      </div>
    </header>
  );
}
