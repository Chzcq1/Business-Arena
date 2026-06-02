import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { formatMoney } from "@/utils/format";
import { DollarSign, Factory, Eye, Clock, Lock, Wifi, WifiOff, CheckCircle, Circle, AlertTriangle, Swords } from "lucide-react";

function TimerRing({ value, max }: { value: number; max: number }) {
  const pct = value / max;
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const dash = pct * circ;
  const color = value > 20 ? "#3b82f6" : value > 10 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="110" height="110" className="rotate-[-90deg]">
      <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle cx="55" cy="55" r={radius} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.3s" }} />
    </svg>
  );
}

function BiddingWarModal() {
  const { biddingWar, acceptBiddingWar, withdrawBiddingWar } = useGameStore();
  const { t } = useT();
  if (!biddingWar?.active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-card border-2 border-red-500/50 rounded-2xl p-6 shadow-2xl flash-alert">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
            <Swords className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider">{t("bidding.title")}</p>
            <p className="text-sm font-semibold text-foreground">{t("bidding.subtitle")}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{t("bidding.detail")}</p>
        <div className="grid grid-cols-2 gap-3 mb-4 text-center">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground mb-1">{t("bidding.yourBid")}</p>
            <p className="text-lg font-mono font-bold text-primary">$80M</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-[10px] text-red-400 mb-1">{t("bidding.counterOfferLabel")}</p>
            <p className="text-lg font-mono font-bold text-red-400">$80M</p>
          </div>
        </div>
        <p className="text-[10px] text-yellow-400 font-semibold mb-4 text-center">{t("bidding.timerWarning")}</p>
        <div className="flex flex-col gap-2">
          <button onClick={acceptBiddingWar}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
            {t("bidding.increaseBid")}
          </button>
          <button onClick={withdrawBiddingWar}
            className="w-full py-2 rounded-xl bg-secondary border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">
            {t("bidding.withdraw")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ActionPhase() {
  const { quarterTimer, timerRunning, draft, updateDraft, bot, intelAlerts, dismissIntelAlert, quarter, player, playerReady, botLocked, upgrades, submitReady, biddingWar } = useGameStore();
  const tickTimer = useGameStore((s) => s.tickTimer);
  const { t } = useT();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => tickTimer(), 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning, tickTimer]);

  const isLocked = !timerRunning && quarterTimer === 0;
  const isCritical = quarterTimer <= 10 && quarterTimer > 0;
  const maxViablePrice = player.techLevel * 200;
  const priceOverCeiling = draft.price > maxViablePrice;
  const dimReturnsActive = draft.productionBudget > 100_000;
  const effectiveUnitCost = dimReturnsActive
    ? Math.round(200 * (upgrades.componentFactory ? 0.75 : 1.0) * Math.min(1 + Math.pow((draft.productionBudget - 100_000) / 100_000, 1.5) * 0.6, 3))
    : Math.round(200 * (upgrades.componentFactory ? 0.75 : 1.0));

  return (
    <>
      <BiddingWarModal />
      {biddingWar && !biddingWar.active && biddingWar.engineerSigned !== null && (
        <div className={`mb-4 p-3 rounded-xl border text-xs font-mono text-center ${biddingWar.engineerSigned ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
          {biddingWar.engineerSigned ? t("bidding.winMsg") : t("bidding.lostMsg")}
        </div>
      )}

      <div className="flex flex-col gap-5 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
              <Clock className="w-3 h-3" />
              Q{quarter} — {t("action_phase.phaseLabel")}
            </div>
            <h1 className="text-xl font-bold text-foreground">{t("action_phase.title")}</h1>
            <p className="text-muted-foreground text-xs">{t("action_phase.subtitle")}</p>
          </div>

          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative">
              <TimerRing value={quarterTimer} max={60} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-mono font-bold text-2xl leading-none ${isCritical ? "text-red-400 timer-critical" : quarterTimer > 20 ? "text-primary" : "text-yellow-400"}`}>
                  {String(quarterTimer).padStart(2, "0")}
                </span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                  {isLocked ? <Lock className="w-3 h-3" /> : t("action_phase.sec")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className={`flex items-center gap-1 ${playerReady ? "text-emerald-400" : "text-muted-foreground"}`}>
                {playerReady ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                {t("action_phase.youAreReady")}
              </span>
              <span className={`flex items-center gap-1 ${botLocked ? "text-red-400" : "text-muted-foreground"}`}>
                {botLocked ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                {botLocked ? t("action_phase.botLocked") : t("action_phase.botDeciding")}
              </span>
            </div>
          </div>
        </div>

        {(priceOverCeiling || dimReturnsActive) && (
          <div className="flex flex-col gap-1.5">
            {priceOverCeiling && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                <AlertTriangle className="w-3 h-3 shrink-0" />{t("action_phase.elasticityWarning")}
              </div>
            )}
            {dimReturnsActive && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-400">
                <AlertTriangle className="w-3 h-3 shrink-0" />{t("action_phase.diminishingWarning")} (${effectiveUnitCost}/unit)
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            {[
              {
                icon: <DollarSign className="w-4 h-4 text-emerald-400" />, bg: "bg-emerald-500/10 border-emerald-500/20",
                label: t("action_phase.price"), hint: t("action_phase.priceHint"),
                value: `$${draft.price}`, sub: t("action_phase.minPrice"),
                color: priceOverCeiling ? "text-red-400" : "text-emerald-400",
                min: 299, max: 1499, step: 10, current: draft.price,
                onChange: (v: number) => updateDraft({ price: v }),
                trackColor: priceOverCeiling ? "hsl(0 84% 60%)" : "hsl(142 76% 46%)",
                pct: ((draft.price - 299) / (1499 - 299)) * 100,
                minLabel: t("action_phase.priceMin"), maxLabel: t("action_phase.priceMax"),
              },
              {
                icon: <Factory className="w-4 h-4 text-blue-400" />, bg: "bg-blue-500/10 border-blue-500/20",
                label: t("action_phase.production"), hint: t("action_phase.productionHint"),
                value: formatMoney(draft.productionBudget),
                sub: `≈ ${Math.floor(draft.productionBudget * 0.8 / effectiveUnitCost).toLocaleString()} ${t("action_phase.units")}`,
                color: dimReturnsActive ? "text-yellow-400" : "text-blue-400",
                min: 20000, max: 200000, step: 5000, current: draft.productionBudget,
                onChange: (v: number) => updateDraft({ productionBudget: v }),
                trackColor: dimReturnsActive ? "hsl(39 100% 57%)" : "hsl(217 91% 60%)",
                pct: ((draft.productionBudget - 20000) / (200000 - 20000)) * 100,
                minLabel: t("action_phase.prodMin"), maxLabel: t("action_phase.prodMax"),
              },
              {
                icon: <Eye className="w-4 h-4 text-amber-400" />, bg: "bg-amber-500/10 border-amber-500/20",
                label: t("action_phase.intel"), hint: `${player.intelPoints} ${t("action_phase.intelHintAvail")}`,
                value: `${draft.intelAllocation} pts`,
                sub: draft.intelAllocation > 0 ? t("action_phase.intelActive") : t("action_phase.intelOff"),
                color: "text-amber-400",
                min: 0, max: Math.min(player.intelPoints, 5), step: 1, current: draft.intelAllocation,
                onChange: (v: number) => updateDraft({ intelAllocation: v }),
                trackColor: "hsl(39 100% 57%)",
                pct: (draft.intelAllocation / Math.max(Math.min(player.intelPoints, 5), 1)) * 100,
                minLabel: t("action_phase.intelInfo"), maxLabel: "",
              },
            ].map((s) => (
              <div key={s.label} className={`bg-card border rounded-xl p-4 transition-all ${isLocked ? "opacity-60 pointer-events-none border-border" : "border-card-border"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${s.bg}`}>{s.icon}</div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground">{s.hint}</p>
                    </div>
                  </div>
                  <p className={`text-lg font-mono font-bold ${s.color}`}>{s.value}</p>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.current} disabled={isLocked}
                  onChange={(e) => s.onChange(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, ${s.trackColor} ${s.pct}%, hsl(var(--secondary)) ${s.pct}%)` }}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{s.minLabel}</span><span>{s.maxLabel}</span>
                </div>
              </div>
            ))}

            {!isLocked && (
              <button
                onClick={submitReady}
                disabled={playerReady}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  playerReady
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-default"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 pulse-glow"
                }`}
              >
                {playerReady ? <><CheckCircle className="w-4 h-4" />{t("action_phase.youAreReady")}</> : t("action_phase.submitReady")}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-card border border-card-border rounded-xl p-5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">{t("action_phase.competitorStatus")}</p>
              <div className="space-y-4">
                {[
                  { label: t("action_phase.botPrice"), value: draft.intelAllocation > 0 ? `$${bot.price}` : "???", pct: ((bot.price - 299) / (1499 - 299)) * 100 },
                  { label: t("action_phase.botProd"), value: draft.intelAllocation > 0 ? formatMoney(bot.productionBudget) : "???", pct: ((bot.productionBudget - 20000) / (200000 - 20000)) * 100 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">{row.label}</span>
                      <span className={`text-sm font-mono font-bold ${draft.intelAllocation > 0 ? "text-foreground" : "text-muted-foreground"}`}>{row.value}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      {draft.intelAllocation > 0 && <div className="h-full bg-red-400 rounded-full transition-all duration-500" style={{ width: `${row.pct}%` }} />}
                    </div>
                  </div>
                ))}
                {bot.lastMoveLabel && draft.intelAllocation > 0 && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flash-alert">
                    <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">{t("action_phase.lastMove")}</p>
                    <p className="text-xs text-red-300 font-mono">{bot.lastMoveLabel}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-5 flex-1">
              <div className="flex items-center gap-2 mb-3">
                {draft.intelAllocation > 0 ? <Wifi className="w-3 h-3 text-amber-400" /> : <WifiOff className="w-3 h-3 text-muted-foreground" />}
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("action_phase.liveFeed")}</p>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {intelAlerts.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    {draft.intelAllocation > 0 ? t("action_phase.monitoringText") : t("action_phase.enableIntel")}
                  </p>
                ) : (
                  [...intelAlerts].reverse().map((alert) => (
                    <div key={alert.id} className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs slide-in-right ${
                      alert.type === "price" ? "bg-red-500/10 border-red-500/20 text-red-300"
                      : alert.type === "production" ? "bg-orange-500/10 border-orange-500/20 text-orange-300"
                      : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mt-0.5 shrink-0 ${alert.type === "price" ? "bg-red-400" : alert.type === "production" ? "bg-orange-400" : "bg-cyan-400"}`} />
                      <span className="font-mono leading-snug">{alert.message}</span>
                      <button onClick={() => dismissIntelAlert(alert.id)} className="ml-auto text-[10px] opacity-50 hover:opacity-100 shrink-0">✕</button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{t("action_phase.yourPosition")}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-[10px] text-muted-foreground mb-1">{t("action_phase.estRevenue")}</p>
                  <p className="text-sm font-mono font-bold text-emerald-400">
                    {formatMoney(Math.floor(draft.productionBudget * 0.8 / effectiveUnitCost) * draft.price * 0.6)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-[10px] text-muted-foreground mb-1">{t("action_phase.estMargin")}</p>
                  <p className={`text-sm font-mono font-bold ${priceOverCeiling ? "text-red-400" : "text-blue-400"}`}>
                    {priceOverCeiling ? "~0%" : `${(((draft.price - effectiveUnitCost) / draft.price) * 100).toFixed(0)}%`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isLocked && (
          <div className="flex items-center justify-center gap-3 py-4 rounded-xl bg-primary/10 border border-primary/30">
            <Lock className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-primary font-semibold text-sm">{t("action_phase.locking")}</span>
          </div>
        )}
      </div>
    </>
  );
}
