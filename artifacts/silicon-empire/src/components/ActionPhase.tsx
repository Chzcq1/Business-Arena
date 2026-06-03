// ===== ACTION PHASE v3 =====
// เฟสดำเนินการ — อัพเดต: สเกลงบ $1M-$20M, fog of war intel, dynamic price ceiling

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { formatMoney } from "@/utils/format";
import { DollarSign, Factory, Eye, Clock, Lock, Wifi, WifiOff, CheckCircle, Circle, AlertTriangle, Swords, Zap } from "lucide-react";

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
  const {
    quarterTimer, timerRunning, draft, updateDraft, bot, intelAlerts,
    dismissIntelAlert, quarter, player, playerReady, botLocked, upgrades,
    submitReady, biddingWar, components, executives,
  } = useGameStore();
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

  // v3: สูตรใหม่ที่ตรงกับ gameStore (exponential bottleneck)
  const factoryDiscount = upgrades.componentFactory ? 0.75 : 1.0;
  const memoryDiscount = [1.0, 1.0, 1.0, 0.97, 0.95, 0.93][Math.min(components.memory, 5)];
  const baseCost = Math.round(200 * factoryDiscount * memoryDiscount);
  const prodRatio = draft.productionBudget / 10_000_000;
  let costMult = 1 + Math.pow(prodRatio, 2) * 0.4;
  if (executives.coo) costMult = Math.min(costMult, 1.5);
  const effectiveUnitCost = Math.round(baseCost * costMult);

  // v3: max price slider ขยายตาม Display level
  const displayMaxMults = [1.0, 1.0, 1.15, 1.35, 1.60, 2.00];
  const maxPriceSlider = Math.round(1499 * displayMaxMults[Math.min(components.display, 5)]);

  // Price elasticity warning
  const displayCeilMult = [1.0, 1.0, 1.15, 1.35, 1.60, 2.00][Math.min(components.display, 5)];
  const maxViablePrice = player.techLevel * 200 * displayCeilMult;
  const priceOverCeiling = draft.price > maxViablePrice;

  // v3: fog of war — intel แสดงแค่ช่วงประมาณ (±10-15%)
  const showIntel = draft.intelAllocation > 0;
  const fuzzPrice = (v: number) => {
    if (!showIntel) return "???";
    const fuzz = Math.round((Math.random() * 0.12 - 0.06) * v / 10) * 10;
    return `~$${v + fuzz}`;
  };
  const fuzzProd = (v: number) => {
    if (!showIntel) return "???";
    const fuzz = Math.round((Math.random() * 0.15 - 0.07) * v / 500_000) * 500_000;
    return `~${formatMoney(v + fuzz)}`;
  };

  // Estimated capacity
  const estCapacity = Math.floor(draft.productionBudget * 0.8 / effectiveUnitCost);

  // Bottleneck warning (>$8M budget)
  const highBudgetWarning = draft.productionBudget > 8_000_000;

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

        {/* Warnings */}
        {(priceOverCeiling || highBudgetWarning) && (
          <div className="flex flex-col gap-1.5">
            {priceOverCeiling && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                <AlertTriangle className="w-3 h-3 shrink-0" />{t("action_phase.elasticityWarning")} (ceiling: ~${Math.round(maxViablePrice)})
              </div>
            )}
            {highBudgetWarning && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-400">
                <AlertTriangle className="w-3 h-3 shrink-0" />{t("action_phase.diminishingWarning")} (${effectiveUnitCost}/unit)
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            {/* Price Slider */}
            <div className={`bg-card border rounded-xl p-4 transition-all ${isLocked ? "opacity-60 pointer-events-none border-border" : priceOverCeiling ? "border-red-500/30" : "border-card-border"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border bg-emerald-500/10 border-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t("action_phase.price")}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {t("action_phase.priceHint")} · max ${ maxPriceSlider} {components.display >= 2 ? `(Display L${components.display})` : ""}
                    </p>
                  </div>
                </div>
                <p className={`text-lg font-mono font-bold ${priceOverCeiling ? "text-red-400" : "text-emerald-400"}`}>${draft.price}</p>
              </div>
              <input type="range" min={299} max={maxPriceSlider} step={10} value={draft.price} disabled={isLocked}
                onChange={(e) => updateDraft({ price: Number(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, ${priceOverCeiling ? "hsl(0 84% 60%)" : "hsl(142 76% 46%)"} ${((draft.price - 299) / (maxPriceSlider - 299)) * 100}%, hsl(var(--secondary)) ${((draft.price - 299) / (maxPriceSlider - 299)) * 100}%)` }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{t("action_phase.priceMin")}</span><span>{t("action_phase.priceMax")}</span>
              </div>
            </div>

            {/* Production Budget Slider — v3: $1M-$20M */}
            <div className={`bg-card border rounded-xl p-4 transition-all ${isLocked ? "opacity-60 pointer-events-none border-border" : highBudgetWarning ? "border-yellow-500/30" : "border-card-border"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border bg-blue-500/10 border-blue-500/20 flex items-center justify-center">
                    <Factory className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t("action_phase.production")}</p>
                    <p className="text-[10px] text-muted-foreground">{t("action_phase.productionHint")}</p>
                  </div>
                </div>
                <p className={`text-lg font-mono font-bold ${highBudgetWarning ? "text-yellow-400" : "text-blue-400"}`}>{formatMoney(draft.productionBudget)}</p>
              </div>
              <input type="range" min={1_000_000} max={20_000_000} step={500_000} value={draft.productionBudget} disabled={isLocked}
                onChange={(e) => updateDraft({ productionBudget: Number(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, ${highBudgetWarning ? "hsl(39 100% 57%)" : "hsl(217 91% 60%)"} ${((draft.productionBudget - 1_000_000) / (20_000_000 - 1_000_000)) * 100}%, hsl(var(--secondary)) ${((draft.productionBudget - 1_000_000) / (20_000_000 - 1_000_000)) * 100}%)` }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{t("action_phase.prodMin")}</span>
                <span className="text-yellow-400/70 font-mono">≈ {estCapacity.toLocaleString()} {t("action_phase.units")} @ ${effectiveUnitCost}/u</span>
                <span>{t("action_phase.prodMax")}</span>
              </div>
            </div>

            {/* Intel Allocation */}
            <div className={`bg-card border rounded-xl p-4 transition-all ${isLocked ? "opacity-60 pointer-events-none border-border" : "border-card-border"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border bg-amber-500/10 border-amber-500/20 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t("action_phase.intel")}</p>
                    <p className="text-[10px] text-muted-foreground">{player.intelPoints} {t("action_phase.intelHintAvail")} — {t("action_phase.intelInfo")}</p>
                  </div>
                </div>
                <p className="text-lg font-mono font-bold text-amber-400">{draft.intelAllocation} pts</p>
              </div>
              <input type="range" min={0} max={Math.min(player.intelPoints, 5)} step={1} value={draft.intelAllocation} disabled={isLocked}
                onChange={(e) => updateDraft({ intelAllocation: Number(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, hsl(39 100% 57%) ${(draft.intelAllocation / Math.max(Math.min(player.intelPoints, 5), 1)) * 100}%, hsl(var(--secondary)) ${(draft.intelAllocation / Math.max(Math.min(player.intelPoints, 5), 1)) * 100}%)` }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{draft.intelAllocation > 0 ? t("action_phase.intelActive") : t("action_phase.intelOff")}</span>
              </div>
            </div>

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
            {/* Competitor status — v3: fog of war */}
            <div className="bg-card border border-card-border rounded-xl p-5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">{t("action_phase.competitorStatus")}</p>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">{t("action_phase.botPrice")}</span>
                    <span className={`text-sm font-mono font-bold ${showIntel ? "text-foreground" : "text-muted-foreground"}`}>
                      {showIntel ? fuzzPrice(bot.price) : "???"}
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    {showIntel && <div className="h-full bg-red-400 rounded-full transition-all duration-500" style={{ width: `${((bot.price - 299) / (maxPriceSlider - 299)) * 100}%` }} />}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">{t("action_phase.botProd")}</span>
                    <span className={`text-sm font-mono font-bold ${showIntel ? "text-foreground" : "text-muted-foreground"}`}>
                      {showIntel ? fuzzProd(bot.productionBudget) : "???"}
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    {showIntel && <div className="h-full bg-red-400 rounded-full transition-all duration-500" style={{ width: `${((bot.productionBudget - 1_000_000) / (20_000_000 - 1_000_000)) * 100}%` }} />}
                  </div>
                </div>
                {bot.lastMoveLabel && showIntel && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flash-alert">
                    <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">{t("action_phase.lastMove")}</p>
                    <p className="text-xs text-red-300 font-mono">{bot.lastMoveLabel}</p>
                  </div>
                )}
                {!showIntel && (
                  <p className="text-xs text-muted-foreground italic">{t("action_phase.enableIntel")}</p>
                )}
              </div>
            </div>

            {/* Intel feed */}
            <div className="bg-card border border-card-border rounded-xl p-5 flex-1">
              <div className="flex items-center gap-2 mb-3">
                {showIntel ? <Wifi className="w-3 h-3 text-amber-400" /> : <WifiOff className="w-3 h-3 text-muted-foreground" />}
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("action_phase.liveFeed")}</p>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {intelAlerts.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    {showIntel ? t("action_phase.monitoringText") : t("action_phase.enableIntel")}
                  </p>
                ) : (
                  [...intelAlerts].reverse().map((alert) => (
                    <div key={alert.id} className={`flex items-start gap-2 p-2 rounded-lg border text-xs slide-in-right ${
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

            {/* Your position estimate */}
            <div className="bg-card border border-card-border rounded-xl p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{t("action_phase.yourPosition")}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-[10px] text-muted-foreground mb-1">{t("action_phase.estRevenue")}</p>
                  <p className="text-sm font-mono font-bold text-emerald-400">
                    {formatMoney(Math.floor(estCapacity * draft.price * 0.55))}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">±15% est.</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-[10px] text-muted-foreground mb-1">{t("action_phase.estMargin")}</p>
                  <p className={`text-sm font-mono font-bold ${priceOverCeiling ? "text-red-400" : "text-blue-400"}`}>
                    {priceOverCeiling ? "~0%" : `${(((draft.price - effectiveUnitCost) / Math.max(draft.price, 1)) * 100).toFixed(0)}%`}
                  </p>
                </div>
              </div>
              {/* Component quick-stats */}
              <div className="mt-3 flex gap-2 flex-wrap">
                {(["chip", "battery", "display", "memory"] as const).map((c) => {
                  const ICONS: Record<string, string> = { chip: "🔬", battery: "🔋", display: "🖥️", memory: "💾" };
                  return (
                    <span key={c} className="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-white/50">
                      {ICONS[c]} L{components[c]}
                    </span>
                  );
                })}
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
