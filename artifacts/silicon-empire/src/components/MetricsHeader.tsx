// ===== METRICS HEADER v3 =====
// Header แสดงสถิติหลัก — เพิ่ม EcoTech, Brand, 5-phase tracker

import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { formatCapital } from "@/utils/format";
import { TrendingUp, Zap, Cpu, Globe, Brain, AlertTriangle, Award, Wrench, Sprout, Smile } from "lucide-react";

const WIN_TARGET = 1_000_000_000;

export function MetricsHeader() {
  const { player, quarter, language, toggleLanguage, executives, upgrades, loans, antitrust } = useGameStore();
  const { t } = useT();

  const metrics = [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: t("header.capital"),
      value: formatCapital(player.capital),
      color: player.capital >= WIN_TARGET ? "text-yellow-300"
        : player.capital >= 50_000_000 ? "text-emerald-400"
        : player.capital < 5_000_000 ? "text-red-400" : "text-emerald-400",
      bg: player.capital < 5_000_000 ? "bg-red-400/10" : "bg-emerald-400/10",
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
      value: `T${player.techLevel}`,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
    {
      icon: <Globe className="w-4 h-4" />,
      label: t("header.marketShare"),
      value: `${player.marketShare.toFixed(1)}%`,
      color: player.marketShare > 60 ? "text-amber-400" : player.marketShare > 50 ? "text-cyan-400" : "text-orange-400",
      bg: player.marketShare > 50 ? "bg-cyan-400/10" : "bg-orange-400/10",
    },
    {
      icon: <Brain className="w-4 h-4" />,
      label: t("header.intelPoints"),
      value: `${player.intelPoints}`,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    // v3: EcoTech badge
    {
      icon: <Sprout className="w-4 h-4" />,
      label: t("header.ecotech"),
      value: `⚗${player.ecotech}`,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    // v3: Brand badge
    {
      icon: <Smile className="w-4 h-4" />,
      label: t("header.brand"),
      value: `${player.brandPerception}`,
      color: player.brandPerception >= 60 ? "text-purple-400" : "text-purple-300",
      bg: "bg-purple-400/10",
    },
  ];

  const badges = [
    executives.cfo && { label: t("header.cfo"), color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", icon: <Award className="w-3 h-3" /> },
    executives.coo && { label: t("header.coo"), color: "text-blue-400 bg-blue-400/10 border-blue-400/30", icon: <Wrench className="w-3 h-3" /> },
    upgrades.componentFactory && { label: t("header.factory"), color: "text-violet-400 bg-violet-400/10 border-violet-400/30", icon: <Cpu className="w-3 h-3" /> },
    upgrades.legendaryEngineer && { label: t("header.engineer"), color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30", icon: <Zap className="w-3 h-3" /> },
    loans.quartersRemaining > 0 && { label: `${t("header.debt")} (${loans.quartersRemaining}Q)`, color: "text-red-400 bg-red-400/10 border-red-400/30", icon: <AlertTriangle className="w-3 h-3" /> },
    antitrust.playerBlocked && { label: "ANTITRUST", color: "text-red-400 bg-red-400/10 border-red-400/30 animate-pulse", icon: <AlertTriangle className="w-3 h-3" /> },
  ].filter(Boolean) as { label: string; color: string; icon: React.ReactNode }[];

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      {/* Metrics row */}
      <div className="flex items-center px-4 py-2 gap-1.5 flex-wrap overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-7 h-7 rounded bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="text-primary font-bold text-xs">SE</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] font-bold text-foreground leading-none">SILICON EMPIRE</p>
            <p className="text-[9px] text-muted-foreground">GUFUTON INC.</p>
          </div>
        </div>

        <div className="h-8 w-px bg-border shrink-0" />

        {/* Quarter */}
        <div className="text-center shrink-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-none">{t("header.quarter")}</p>
          <p className="text-lg font-mono font-bold text-primary leading-none">{quarter}<span className="text-xs text-muted-foreground">/16</span></p>
        </div>

        <div className="h-8 w-px bg-border shrink-0" />

        {/* All metrics */}
        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          {metrics.map((m) => (
            <div key={m.label} className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${m.bg} border border-white/5 shrink-0`}>
              <span className={m.color}>{m.icon}</span>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider leading-none mb-0.5">{m.label}</p>
                <p className={`text-xs font-mono font-bold leading-none ${m.color}`}>{m.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="hidden lg:flex items-center gap-1 shrink-0">
            {badges.map((b) => (
              <span key={b.label} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${b.color}`}>
                {b.icon}{b.label}
              </span>
            ))}
          </div>
        )}

        {/* Win progress + language toggle */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <div className="text-right hidden md:block">
            <p className="text-[9px] text-muted-foreground">{t("header.winTarget")}</p>
            <div className="w-20 h-1 bg-secondary rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((player.capital / WIN_TARGET) * 100, 100)}%`,
                  background: player.capital >= WIN_TARGET * 0.8 ? "#fbbf24" : "#3b82f6",
                }}
              />
            </div>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 rounded bg-secondary border border-border text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            {language === "en" ? "TH" : "EN"}
          </button>
        </div>
      </div>
    </header>
  );
}
