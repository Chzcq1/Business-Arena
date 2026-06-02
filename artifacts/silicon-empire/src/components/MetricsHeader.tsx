import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { TrendingUp, Zap, Cpu, Globe, Brain, AlertTriangle, Award, Wrench } from "lucide-react";
import { formatCapital } from "@/utils/format";

export function MetricsHeader() {
  const { player, quarter, language, toggleLanguage, executives, upgrades, loans } = useGameStore();
  const { t } = useT();

  const metrics = [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: t("header.capital"),
      value: formatCapital(player.capital),
      color: player.capital >= 1_000_000_000 ? "text-yellow-300" : player.capital >= 50_000_000 ? "text-emerald-400" : player.capital < 5_000_000 ? "text-red-400" : "text-emerald-400",
      bg: player.capital >= 50_000_000 ? "bg-emerald-400/10" : player.capital < 5_000_000 ? "bg-red-400/10" : "bg-emerald-400/10",
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: t("header.morale"),
      value: `${player.morale}%`,
      color: player.morale >= 60 ? "text-blue-400" : player.morale >= 40 ? "text-yellow-400" : "text-red-400",
      bg: player.morale >= 60 ? "bg-blue-400/10" : player.morale >= 40 ? "bg-yellow-400/10" : "bg-red-400/10",
    },
    {
      icon: <Cpu className="w-4 h-4" />,
      label: t("header.techLevel"),
      value: `${player.techLevel}`,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
    {
      icon: <Globe className="w-4 h-4" />,
      label: t("header.marketShare"),
      value: `${player.marketShare.toFixed(1)}%`,
      color: player.marketShare > 50 ? "text-cyan-400" : "text-orange-400",
      bg: player.marketShare > 50 ? "bg-cyan-400/10" : "bg-orange-400/10",
    },
    {
      icon: <Brain className="w-4 h-4" />,
      label: t("header.intelPoints"),
      value: `${player.intelPoints}`,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

  const badges = [
    executives.cfo && { label: t("header.cfo"), color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", icon: <Award className="w-3 h-3" /> },
    executives.coo && { label: t("header.coo"), color: "text-blue-400 bg-blue-400/10 border-blue-400/30", icon: <Wrench className="w-3 h-3" /> },
    upgrades.componentFactory && { label: t("header.factory"), color: "text-violet-400 bg-violet-400/10 border-violet-400/30", icon: <Cpu className="w-3 h-3" /> },
    upgrades.legendaryEngineer && { label: t("header.engineer"), color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30", icon: <Zap className="w-3 h-3" /> },
    loans.quartersRemaining > 0 && { label: `${t("header.debt")} (${loans.quartersRemaining}Q)`, color: "text-red-400 bg-red-400/10 border-red-400/30", icon: <AlertTriangle className="w-3 h-3" /> },
  ].filter(Boolean) as { label: string; color: string; icon: React.ReactNode }[];

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2 gap-2 flex-wrap">
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
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("header.quarter")}</p>
            <p className="text-lg font-mono font-bold text-primary leading-none">{quarter}<span className="text-xs text-muted-foreground">/16</span></p>
          </div>
          {badges.length > 0 && (
            <>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                {badges.map((b) => (
                  <span key={b.label} className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border ${b.color}`}>
                    {b.icon}{b.label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-1 justify-center flex-wrap">
          {metrics.map((m) => (
            <div key={m.label} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md ${m.bg} border border-white/5`}>
              <span className={m.color}>{m.icon}</span>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider leading-none mb-0.5">{m.label}</p>
                <p className={`text-sm font-mono font-bold leading-none ${m.color}`}>{m.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] text-muted-foreground">{t("header.winTarget")}</p>
            <div className="w-20 h-1 bg-secondary rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${Math.min((player.capital / 1_000_000_000) * 100, 100)}%` }} />
            </div>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-md bg-secondary border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
          >
            {language === "en" ? "TH" : "EN"}
          </button>
        </div>
      </div>
    </header>
  );
}
