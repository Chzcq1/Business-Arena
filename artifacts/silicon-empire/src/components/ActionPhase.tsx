// ===== ACTION PHASE v5.0 =====
// v5.0: เพิ่ม Equipped Cards panel + Time-Freeze Event overlay modal

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { formatMoney } from "@/utils/format";
import { DollarSign, Factory, Eye, Clock, Lock, Wifi, WifiOff, CheckCircle, Circle, AlertTriangle, Swords, Zap, Snowflake } from "lucide-react";

// ===== TIMER RING =====
function TimerRing({ value, max, paused }: { value: number; max: number; paused?: boolean }) {
  const pct = value / max;
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const dash = pct * circ;
  const color = paused ? "#8b5cf6" : value > 20 ? "#3b82f6" : value > 10 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="110" height="110" className="rotate-[-90deg]">
      <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle cx="55" cy="55" r={radius} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: paused ? "none" : "stroke-dasharray 0.9s linear, stroke 0.3s" }} />
    </svg>
  );
}

// ===== BIDDING WAR MODAL =====
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
          <button onClick={acceptBiddingWar} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
            {t("bidding.increaseBid")}
          </button>
          <button onClick={withdrawBiddingWar} className="w-full py-2 rounded-xl bg-secondary border border-border text-muted-foreground text-sm hover:text-foreground transition-colors">
            {t("bidding.withdraw")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== v5.0: TIME-FREEZE EVENT MODAL =====
// ปรากฎแบบสุ่มระหว่าง Action Phase — นาฬิกาหยุด ผู้เล่นต้องตัดสินใจก่อน
function TimeFreezeModal() {
  const { timeFreezeEvent, resolveTimeFreezeEvent, quarterTimer, language } = useGameStore();
  const { t } = useT();
  if (!timeFreezeEvent) return null;

  const lang = language === "th" ? "th" : "en";
  const locale = timeFreezeEvent[lang];

  const URGENCY_STYLES: Record<string, string> = {
    high:   "text-red-400 bg-red-900/30 border-red-500/40",
    medium: "text-yellow-400 bg-yellow-900/30 border-yellow-500/40",
    low:    "text-cyan-400 bg-cyan-900/30 border-cyan-500/40",
  };
  const urgencyStyle = URGENCY_STYLES[timeFreezeEvent.urgency] ?? URGENCY_STYLES.medium;
  const urgencyLabel = t(`time_freeze.urgency${timeFreezeEvent.urgency.charAt(0).toUpperCase() + timeFreezeEvent.urgency.slice(1)}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-lg mx-4 bg-card border-2 border-violet-500/60 rounded-2xl p-6 shadow-2xl flash-alert">

        {/* Paused header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/40">
            <Snowflake className="w-4 h-4 text-violet-400 animate-spin" style={{ animationDuration: "3s" }} />
            <span className="text-xs font-bold text-violet-300 uppercase tracking-widest">{t("time_freeze.paused")}</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground">Timer paused at</div>
            <div className="text-lg font-mono font-bold text-violet-400">{String(quarterTimer).padStart(2, "0")}s</div>
          </div>
        </div>

        {/* Event card */}
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl shrink-0">{timeFreezeEvent.icon}</div>
          <div className="flex-1">
            <div className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border mb-1.5 ${urgencyStyle}`}>
              {urgencyLabel}
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">{locale.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{locale.description}</p>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/70 italic mb-4">{t("time_freeze.choose")}</p>

        {/* Choices */}
        <div className="flex flex-col gap-2.5">
          {timeFreezeEvent.choices.map((choice) => {
            const choiceLocale = choice[lang];
            return (
              <button
                key={choice.id}
                onClick={() => resolveTimeFreezeEvent(choice.id)}
                className="w-full text-left flex items-start gap-3 p-3.5 rounded-xl bg-secondary/50 border border-border hover:border-primary/50 hover:bg-primary/10 transition-all cursor-pointer group"
              >
                <div className="w-5 h-5 rounded-full border border-muted-foreground/40 group-hover:border-primary/60 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-primary transition-colors" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-0.5">
                    {choiceLocale.label}
                  </div>
                  {choiceLocale.desc && (
                    <div className="text-[11px] text-muted-foreground/80 font-mono">{choiceLocale.desc}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== v5.0: ACTIVE CARDS PANEL =====
// แสดงไพ่ที่ติดมา ผู้เล่นกดใช้ระหว่าง phase
function ActiveCardsPanel() {
  const { equippedCards, activeCardEffects, useActionCard, timerRunning, timerPaused, language } = useGameStore();
  const { t } = useT();

  if (equippedCards.length === 0) return null;

  const isBotFrozen = activeCardEffects.botFrozenSecondsLeft > 0;
  const isActive = timerRunning && !timerPaused;

  return (
    <div className="bg-card border border-card-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("black_market.activeCardsLabel")}</p>
        {isBotFrozen && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-cyan-900/30 border border-cyan-500/40 animate-pulse">
            <Snowflake className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-300">
              {t("black_market.botFrozen")} {activeCardEffects.botFrozenSecondsLeft}s
            </span>
          </div>
        )}
        {activeCardEffects.cyberShield && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-900/30 border border-blue-500/40">
            <span className="text-[10px] font-bold text-blue-300">🛡 Shield Active</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {equippedCards.map((card) => {
          const locale = language === "th" ? card.th : card.en;
          const isUsed = card.usedAt !== null;
          return (
            <div
              key={card.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                ${isUsed
                  ? "border-emerald-500/30 bg-emerald-900/10 opacity-60"
                  : "border-primary/40 bg-primary/5"
                }`}
            >
              <span className="text-2xl shrink-0">{card.icon}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold truncate ${isUsed ? "text-emerald-400" : "text-foreground"}`}>
                  {locale.title}
                </div>
                <div className="text-[10px] text-muted-foreground leading-snug truncate">
                  {locale.effectDesc}
                </div>
              </div>
              <button
                onClick={() => useActionCard(card.id)}
                disabled={isUsed || !isActive}
                className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all
                  ${isUsed
                    ? "bg-emerald-900/20 text-emerald-500 border border-emerald-500/20 cursor-default"
                    : !isActive
                      ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-50 border border-border"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer border border-primary/60 pulse-glow"
                  }`}
              >
                {isUsed ? <CheckCircle className="w-3 h-3" /> : t("black_market.useCard")}
              </button>
            </div>
          );
        })}
      </div>

      {/* Active effects summary */}
      {(activeCardEffects.playerDemandMult !== 1.0 || activeCardEffects.botBrandDelta !== 0 || activeCardEffects.playerTechBonus !== 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {activeCardEffects.playerDemandMult !== 1.0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/30 border border-green-500/30 text-green-400 font-mono">
              Demand ×{activeCardEffects.playerDemandMult.toFixed(2)}
            </span>
          )}
          {activeCardEffects.playerTechBonus !== 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 font-mono">
              Tech +{activeCardEffects.playerTechBonus}
            </span>
          )}
          {activeCardEffects.botBrandDelta !== 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/30 border border-red-500/30 text-red-400 font-mono">
              Bot Brand {activeCardEffects.botBrandDelta > 0 ? "+" : ""}{activeCardEffects.botBrandDelta}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ===== MAIN ACTION PHASE =====
export function ActionPhase() {
  const {
    quarterTimer, timerRunning, timerPaused, draft, updateDraft, bot, intelAlerts,
    dismissIntelAlert, quarter, player, playerReady, botLocked, upgrades,
    submitReady, biddingWar, components, executives,
    tradeBanActive, hypeCampaign, launchHypeCampaign,
    activeCardEffects, equippedCards,
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
  const isCritical = quarterTimer <= 10 && quarterTimer > 0 && !timerPaused;
  const isBotFrozen = activeCardEffects.botFrozenSecondsLeft > 0;

  // Unit cost formula (matches gameStore resolveQuarter)
  const factoryDiscount = upgrades.componentFactory ? 0.75 : 1.0;
  const memoryDiscount = [1.0, 1.0, 1.0, 0.97, 0.95, 0.93][Math.min(components.memory, 5)];
  const baseCost = Math.round(200 * factoryDiscount * memoryDiscount);
  const prodRatio = draft.productionBudget / 10_000_000;
  let costMult = 1 + Math.pow(prodRatio, 2) * 0.4;
  if (executives.coo) costMult = Math.min(costMult, 1.5);
  const effectiveUnitCost = Math.round(baseCost * costMult);

  const displayMaxMults = [1.0, 1.0, 1.15, 1.35, 1.60, 2.00];
  const maxPriceSlider = Math.round(1499 * displayMaxMults[Math.min(components.display, 5)]);

  const displayCeilMult = [1.0, 1.0, 1.15, 1.35, 1.60, 2.00][Math.min(components.display, 5)];
  const maxViablePrice = player.techLevel * 200 * displayCeilMult;
  const priceOverCeiling = draft.price > maxViablePrice;

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

  const estCapacity = Math.floor(draft.productionBudget * 0.8 / effectiveUnitCost);
  const highBudgetWarning = draft.productionBudget > 8_000_000;

  return (
    <>
      <BiddingWarModal />
      <TimeFreezeModal />

      {biddingWar && !biddingWar.active && biddingWar.engineerSigned !== null && (
        <div className={`mb-4 p-3 rounded-xl border text-xs font-mono text-center ${biddingWar.engineerSigned ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
          {biddingWar.engineerSigned ? t("bidding.winMsg") : t("bidding.lostMsg")}
        </div>
      )}

      <div className="flex flex-col gap-5 max-w-3xl mx-auto">

        {/* Header + Timer */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
              timerPaused
                ? "bg-violet-500/10 border border-violet-500/20 text-violet-400"
                : "bg-blue-500/10 border border-blue-500/20 text-blue-400"
            }`}>
              <Clock className="w-3 h-3" />
              Q{quarter} — {timerPaused ? t("time_freeze.paused") : t("action_phase.phaseLabel")}
            </div>
            <h1 className="text-xl font-bold text-foreground">{t("action_phase.title")}</h1>
            <p className="text-muted-foreground text-xs">{t("action_phase.subtitle")}</p>
          </div>

          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative">
              <TimerRing value={quarterTimer} max={60} paused={timerPaused} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-mono font-bold text-2xl leading-none ${
                  timerPaused ? "text-violet-400" :
                  isCritical ? "text-red-400 timer-critical" :
                  quarterTimer > 20 ? "text-primary" : "text-yellow-400"
                }`}>
                  {timerPaused ? "⏸" : String(quarterTimer).padStart(2, "0")}
                </span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                  {isLocked ? <Lock className="w-3 h-3" /> : timerPaused ? "PAUSED" : t("action_phase.sec")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              <span className={`flex items-center gap-1 ${playerReady ? "text-emerald-400" : "text-muted-foreground"}`}>
                {playerReady ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                {t("action_phase.youAreReady")}
              </span>
              <span className={`flex items-center gap-1 ${
                isBotFrozen ? "text-cyan-400" :
                botLocked ? "text-red-400" : "text-muted-foreground"
              }`}>
                {isBotFrozen ? <Snowflake className="w-3 h-3" /> : botLocked ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                {isBotFrozen
                  ? `${t("black_market.botFrozen")} ${activeCardEffects.botFrozenSecondsLeft}s`
                  : botLocked ? t("action_phase.botLocked") : t("action_phase.botDeciding")
                }
              </span>
            </div>
          </div>
        </div>

        {/* v5.0: Equipped cards panel (shown when player has cards) */}
        {equippedCards.length > 0 && <ActiveCardsPanel />}

        {/* Warnings */}
        {(priceOverCeiling || highBudgetWarning || tradeBanActive) && (
          <div className="flex flex-col gap-1.5">
            {tradeBanActive && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/30 border border-red-500/50 text-xs text-red-300 font-semibold">
                <AlertTriangle className="w-3 h-3 shrink-0" />{t("action_phase.tradeBanWarning")}
              </div>
            )}
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

        {/* Hype Campaign */}
        {(() => {
          const hypeActive = hypeCampaign?.active && !hypeCampaign.fulfilled;
          const canLaunch = !hypeActive && player.capital >= 5_000_000 && !isLocked;
          return (
            <div className="bg-card border border-card-border rounded-xl p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{t("action_phase.hypeTactics")}</p>
              {hypeActive ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-violet-400 animate-pulse">🚀 {t("action_phase.hypeActive")}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{t("action_phase.hypeDeadline")} {hypeCampaign!.deadline} · Demand +40% active</p>
                    <p className="text-[10px] text-orange-300/80 mt-0.5">{t("hype_campaign.pr_disaster_warning")}</p>
                  </div>
                  <div className="text-2xl">🔥</div>
                </div>
              ) : hypeCampaign?.fulfilled ? (
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {t("hype_campaign.fulfilled")}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground mb-0.5">{t("action_phase.hypeButton")}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{t("action_phase.hypeDesc")}</p>
                  </div>
                  <button
                    onClick={launchHypeCampaign}
                    disabled={!canLaunch}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      canLaunch
                        ? "bg-violet-600/80 text-white hover:bg-violet-600 border border-violet-500/50"
                        : "bg-secondary/50 text-muted-foreground cursor-not-allowed opacity-50 border border-border"
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    {t("action_phase.hypeCost")}
                  </button>
                </div>
              )}
            </div>
          );
        })()}

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
                      {t("action_phase.priceHint")} · max ${maxPriceSlider} {components.display >= 2 ? `(Display L${components.display})` : ""}
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

            {/* Production Budget Slider */}
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
                disabled={playerReady || timerPaused}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  playerReady
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-default"
                    : timerPaused
                      ? "bg-secondary border border-border text-muted-foreground cursor-not-allowed opacity-60"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 pulse-glow"
                }`}
              >
                {playerReady ? <><CheckCircle className="w-4 h-4" />{t("action_phase.youAreReady")}</> : t("action_phase.submitReady")}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* Competitor status */}
            <div className={`bg-card border border-card-border rounded-xl p-5 transition-all ${isBotFrozen ? "border-cyan-500/30" : ""}`}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("action_phase.competitorStatus")}</p>
                {isBotFrozen && (
                  <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold animate-pulse">
                    <Snowflake className="w-3 h-3" />
                    FROZEN
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">{t("action_phase.botPrice")}</span>
                    <span className={`text-sm font-mono font-bold ${showIntel ? "text-foreground" : "text-muted-foreground"}`}>
                      {showIntel ? fuzzPrice(bot.price) : "???"}
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    {showIntel && <div className={`h-full rounded-full transition-all duration-500 ${isBotFrozen ? "bg-cyan-400" : "bg-red-400"}`} style={{ width: `${((bot.price - 299) / (maxPriceSlider - 299)) * 100}%` }} />}
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
                    {showIntel && <div className={`h-full rounded-full transition-all duration-500 ${isBotFrozen ? "bg-cyan-400" : "bg-red-400"}`} style={{ width: `${((bot.productionBudget - 1_000_000) / (20_000_000 - 1_000_000)) * 100}%` }} />}
                  </div>
                </div>
                {bot.lastMoveLabel && showIntel && !isBotFrozen && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flash-alert">
                    <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">{t("action_phase.lastMove")}</p>
                    <p className="text-xs text-red-300 font-mono">{bot.lastMoveLabel}</p>
                  </div>
                )}
                {isBotFrozen && (
                  <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-xs text-cyan-300 font-mono flex items-center gap-2">
                      <Snowflake className="w-3 h-3" />
                      Bot strategy locked — {activeCardEffects.botFrozenSecondsLeft}s remaining
                    </p>
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
