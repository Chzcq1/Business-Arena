// ===== ACTION PHASE v7.0 — WAR ROOM =====
// v7.0: Full War Room redesign — CEO Active Skills (3 charges/game), live Bot Intel Panel,
//        price gap feedback, market pulse. Modals preserved from v5.0.

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { formatMoney } from "@/utils/format";
import {
  DollarSign, Factory, Eye, Clock, Lock, Wifi, WifiOff,
  CheckCircle, Circle, AlertTriangle, Swords, Zap, Snowflake,
  TrendingUp, TrendingDown, Minus, Target, Shield, Flame, Cpu,
} from "lucide-react";

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

// ===== BIDDING WAR MODAL (unchanged from v5) =====
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

// ===== TIME-FREEZE MODAL (unchanged from v5) =====
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
        <div className="flex flex-col gap-2.5">
          {timeFreezeEvent.choices.map((choice) => {
            const choiceLocale = choice[lang];
            return (
              <button key={choice.id} onClick={() => resolveTimeFreezeEvent(choice.id)}
                className="w-full text-left flex items-start gap-3 p-3.5 rounded-xl bg-secondary/50 border border-border hover:border-primary/50 hover:bg-primary/10 transition-all cursor-pointer group">
                <div className="w-5 h-5 rounded-full border border-muted-foreground/40 group-hover:border-primary/60 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-primary transition-colors" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-0.5">{choiceLocale.label}</div>
                  {choiceLocale.desc && <div className="text-[11px] text-muted-foreground/80 font-mono">{choiceLocale.desc}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== CEO ACTIVE SKILL PANEL (v7.0 — NEW) =====
function CEOSkillPanel() {
  const { ceoBackground, ceoActiveSkill, useCEOSkill, timerRunning, timerPaused } = useGameStore();
  const { t } = useT();
  if (!ceoBackground) return null;

  const { chargesLeft, usedThisQuarter } = ceoActiveSkill;
  const type = ceoBackground.type;

  const SKILL_META: Record<string, { icon: React.ReactNode; color: string; border: string; glow: string }> = {
    visionary: {
      icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
      color: "text-blue-400",
      border: "border-blue-500/40",
      glow: "bg-blue-500/10",
    },
    marketer: {
      icon: <Flame className="w-5 h-5 text-pink-400" />,
      color: "text-pink-400",
      border: "border-pink-500/40",
      glow: "bg-pink-500/10",
    },
    operator: {
      icon: <Cpu className="w-5 h-5 text-emerald-400" />,
      color: "text-emerald-400",
      border: "border-emerald-500/40",
      glow: "bg-emerald-500/10",
    },
  };

  const meta = SKILL_META[type];
  const skillName = t(`ceo_skill.${type}_name`);
  const skillDesc = t(`ceo_skill.${type}_desc`);

  const canActivate = timerRunning && !timerPaused && !usedThisQuarter && chargesLeft > 0;

  return (
    <div className={`rounded-xl border p-4 ${meta.border} ${meta.glow} transition-all ${canActivate ? "ring-1 ring-offset-0" : ""}`}
      style={canActivate ? { boxShadow: "0 0 16px rgba(59,130,246,0.12)" } : {}}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${meta.border} ${meta.glow}`}>
            {meta.icon}
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("ceo_skill.sectionLabel")}</p>
            <p className={`text-sm font-bold ${meta.color}`}>{skillName}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full border transition-all ${
              i < chargesLeft
                ? `${meta.color.replace("text-", "bg-")} border-transparent`
                : "bg-transparent border-muted-foreground/30"
            }`} />
          ))}
          <span className={`text-[10px] font-mono ml-1 ${meta.color}`}>{chargesLeft}/3</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{skillDesc}</p>

      <div className="flex items-center justify-between gap-3">
        {usedThisQuarter && (
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            {t("ceo_skill.usedThisQuarter")} ✓
          </div>
        )}
        {!usedThisQuarter && chargesLeft === 0 && (
          <div className="text-[10px] text-muted-foreground font-mono">{t("ceo_skill.noCharges")}</div>
        )}
        {!usedThisQuarter && chargesLeft > 0 && !timerRunning && (
          <div className="text-[10px] text-muted-foreground font-mono">Waiting for phase...</div>
        )}
        <div className="flex-1" />
        <button
          onClick={useCEOSkill}
          disabled={!canActivate}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            canActivate
              ? `${meta.glow} ${meta.border} border ${meta.color} hover:scale-105 pulse-glow cursor-pointer`
              : "bg-secondary/30 border border-border text-muted-foreground cursor-not-allowed opacity-50"
          }`}
        >
          <Zap className="w-3 h-3" />
          {t("ceo_skill.activate")}
        </button>
      </div>
    </div>
  );
}

// ===== BOT INTEL PANEL (v7.0 — NEW) =====
function BotIntelPanel({ showIntel }: { showIntel: boolean }) {
  const { bot, lastResolution, activeCardEffects, intelAlerts, dismissIntelAlert, quarter } = useGameStore();
  const { t } = useT();
  const isBotFrozen = activeCardEffects.botFrozenSecondsLeft > 0;
  const revealExact = activeCardEffects.revealBotExact;
  const canSee = showIntel || revealExact;

  const lastBotProfit = lastResolution?.botProfit ?? null;
  const profitTrend = lastBotProfit === null ? null : lastBotProfit > 0 ? "up" : "down";

  function fuzzVal(v: number, pct: number = 0.10) {
    if (!canSee) return null;
    if (revealExact) return v;
    return Math.round(v * (1 + (Math.random() * pct * 2 - pct)));
  }

  const botCapitalFuzz = fuzzVal(bot.capital);
  const botPriceFuzz = fuzzVal(bot.price, 0.06);
  const botProdFuzz = fuzzVal(bot.productionBudget, 0.12);
  const botProfitFuzz = lastBotProfit !== null ? fuzzVal(lastBotProfit, 0.15) : null;

  return (
    <div className={`bg-card rounded-xl border p-4 flex flex-col gap-3 transition-all ${
      isBotFrozen ? "border-cyan-500/30" : "border-card-border"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-red-400" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("war_room.botIntelLabel")}</p>
        </div>
        <div className="flex items-center gap-2">
          {isBotFrozen && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-900/30 border border-cyan-500/40 animate-pulse">
              <Snowflake className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] font-bold text-cyan-300">FROZEN {activeCardEffects.botFrozenSecondsLeft}s</span>
            </div>
          )}
          {canSee
            ? <div className="flex items-center gap-1 text-[10px] text-amber-400"><Wifi className="w-3 h-3" />{revealExact ? "EXACT" : "EST"}</div>
            : <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><WifiOff className="w-3 h-3" />BLIND</div>
          }
        </div>
      </div>

      {/* Bot stat grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Capital */}
        <div className="bg-secondary/40 rounded-lg p-2.5">
          <p className="text-[9px] text-muted-foreground uppercase mb-0.5">{t("war_room.botCapital")}</p>
          <p className={`text-sm font-mono font-bold ${canSee ? "text-red-300" : "text-muted-foreground/40"}`}>
            {canSee && botCapitalFuzz !== null ? formatMoney(botCapitalFuzz) : "???"}
          </p>
        </div>

        {/* Last Profit */}
        <div className="bg-secondary/40 rounded-lg p-2.5">
          <p className="text-[9px] text-muted-foreground uppercase mb-0.5">{t("war_room.botLastProfit")}</p>
          <div className={`flex items-center gap-1 text-sm font-mono font-bold ${
            !canSee ? "text-muted-foreground/40"
            : profitTrend === "up" ? "text-emerald-400"
            : profitTrend === "down" ? "text-red-400"
            : "text-muted-foreground"
          }`}>
            {canSee && botProfitFuzz !== null ? (
              <>
                {profitTrend === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : profitTrend === "down" ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                {formatMoney(botProfitFuzz)}
              </>
            ) : quarter === 1 ? <span className="text-[10px]">Q1 — no data</span> : "???"}
          </div>
        </div>

        {/* Tech */}
        <div className="bg-secondary/40 rounded-lg p-2.5">
          <p className="text-[9px] text-muted-foreground uppercase mb-0.5">{t("war_room.botTech")}</p>
          <p className={`text-sm font-mono font-bold ${canSee ? "text-blue-300" : "text-muted-foreground/40"}`}>
            {canSee ? `Lv ${bot.techLevel}` : "???"}
          </p>
        </div>

        {/* Brand */}
        <div className="bg-secondary/40 rounded-lg p-2.5">
          <p className="text-[9px] text-muted-foreground uppercase mb-0.5">{t("war_room.botBrand")}</p>
          <p className={`text-sm font-mono font-bold ${canSee ? "text-pink-300" : "text-muted-foreground/40"}`}>
            {canSee ? bot.brandPerception.toFixed(0) : "???"}
          </p>
        </div>
      </div>

      {/* Bot Price bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">{t("action_phase.botPrice")}</span>
          <span className={`text-xs font-mono font-bold ${canSee ? "text-red-300" : "text-muted-foreground/40"}`}>
            {canSee && botPriceFuzz !== null ? `~$${botPriceFuzz}` : "???"}
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          {canSee && <div className={`h-full rounded-full transition-all duration-700 ${isBotFrozen ? "bg-cyan-400" : "bg-red-400"}`}
            style={{ width: `${Math.max(2, ((bot.price - 299) / (1499 - 299)) * 100)}%` }} />}
        </div>
      </div>

      {/* Bot Production bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">{t("action_phase.botProd")}</span>
          <span className={`text-xs font-mono font-bold ${canSee ? "text-orange-300" : "text-muted-foreground/40"}`}>
            {canSee && botProdFuzz !== null ? `~${formatMoney(botProdFuzz)}` : "???"}
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          {canSee && <div className={`h-full rounded-full transition-all duration-700 ${isBotFrozen ? "bg-cyan-400" : "bg-orange-400"}`}
            style={{ width: `${Math.max(2, ((bot.productionBudget - 1_000_000) / (20_000_000 - 1_000_000)) * 100)}%` }} />}
        </div>
      </div>

      {/* Bot Last Move */}
      {bot.lastMoveLabel && canSee && !isBotFrozen && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flash-alert">
          <p className="text-[9px] text-red-400 uppercase tracking-wider mb-0.5">{t("action_phase.lastMove")}</p>
          <p className="text-xs text-red-300 font-mono">{bot.lastMoveLabel}</p>
        </div>
      )}

      {/* Intel feed */}
      {intelAlerts.length > 0 && (
        <div className="space-y-1.5 max-h-24 overflow-y-auto">
          {[...intelAlerts].reverse().map((alert) => (
            <div key={alert.id} className={`flex items-start gap-2 p-2 rounded-lg border text-[11px] slide-in-right ${
              alert.type === "price" ? "bg-red-500/10 border-red-500/20 text-red-300"
              : alert.type === "production" ? "bg-orange-500/10 border-orange-500/20 text-orange-300"
              : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"}`}>
              <div className={`w-1.5 h-1.5 rounded-full mt-0.5 shrink-0 ${alert.type === "price" ? "bg-red-400" : alert.type === "production" ? "bg-orange-400" : "bg-cyan-400"}`} />
              <span className="font-mono leading-snug">{alert.message}</span>
              <button onClick={() => dismissIntelAlert(alert.id)} className="ml-auto text-[10px] opacity-50 hover:opacity-100 shrink-0">✕</button>
            </div>
          ))}
        </div>
      )}

      {!canSee && (
        <p className="text-[10px] text-muted-foreground/60 italic text-center">{t("action_phase.enableIntel")}</p>
      )}
    </div>
  );
}

// ===== ACTIVE CARDS PANEL =====
function ActiveCardsPanel() {
  const { equippedCards, activeCardEffects, useActionCard, timerRunning, timerPaused, language } = useGameStore();
  const { t } = useT();
  if (equippedCards.length === 0) return null;
  const isActive = timerRunning && !timerPaused;
  return (
    <div className="bg-card border border-card-border rounded-xl p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t("black_market.activeCardsLabel")}</p>
      <div className="flex gap-2 flex-wrap">
        {equippedCards.map((card) => {
          const locale = language === "th" ? card.th : card.en;
          const isUsed = card.usedAt !== null;
          return (
            <div key={card.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              isUsed ? "border-emerald-500/20 bg-emerald-900/10 opacity-60" : "border-primary/30 bg-primary/5"}`}>
              <span className="text-lg">{card.icon}</span>
              <div>
                <div className={`text-[10px] font-semibold ${isUsed ? "text-emerald-400" : "text-foreground"}`}>{locale.title}</div>
              </div>
              <button onClick={() => useActionCard(card.id)} disabled={isUsed || !isActive}
                className={`ml-1 px-2 py-1 rounded text-[9px] font-bold transition-all ${
                  isUsed ? "bg-emerald-900/20 text-emerald-500 cursor-default"
                  : !isActive ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer pulse-glow"}`}>
                {isUsed ? "✓" : t("black_market.useCard")}
              </button>
            </div>
          );
        })}
        {activeCardEffects.botFrozenSecondsLeft > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-cyan-900/30 border border-cyan-500/40 animate-pulse">
            <Snowflake className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-300">BOT FROZEN {activeCardEffects.botFrozenSecondsLeft}s</span>
          </div>
        )}
        {activeCardEffects.cyberShield && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-900/30 border border-blue-500/40">
            <Shield className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-300">Shield Active</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== MAIN ACTION PHASE — WAR ROOM =====
export function ActionPhase() {
  const {
    quarterTimer, timerRunning, timerPaused, draft, updateDraft, bot, intelAlerts,
    dismissIntelAlert, quarter, player, playerReady, botLocked, upgrades,
    submitReady, biddingWar, components, executives,
    tradeBanActive, hypeCampaign, launchHypeCampaign,
    activeCardEffects, equippedCards, ceoBackground, ceoActiveSkill,
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
  const showIntel = draft.intelAllocation > 0;

  const factoryDiscount = upgrades.componentFactory ? 0.75 : 1.0;
  const memoryDiscount = [1.0, 1.0, 1.0, 0.97, 0.95, 0.93][Math.min(components.memory, 5)];
  const ceoMod = ceoBackground?.productionCostModifier ?? 1.0;
  const baseCost = Math.round(200 * factoryDiscount * memoryDiscount * ceoMod);
  const prodRatio = draft.productionBudget / 10_000_000;
  let costMult = 1 + Math.pow(prodRatio, 2) * 0.4;
  if (executives.coo) costMult = Math.min(costMult, 1.5);
  const skillCostMod = ceoActiveSkill.usedThisQuarter && ceoActiveSkill.effectType === "emergency_cut" ? 0.80 : 1.0;
  const effectiveUnitCost = Math.round(baseCost * costMult * skillCostMod);

  const displayMaxMults = [1.0, 1.0, 1.15, 1.35, 1.60, 2.00];
  const maxPriceSlider = Math.round(1499 * displayMaxMults[Math.min(components.display, 5)]);
  const displayCeilMult = [1.0, 1.0, 1.15, 1.35, 1.60, 2.00][Math.min(components.display, 5)];
  const ceoCeilMod = ceoBackground?.priceCeilingModifier ?? 1.0;
  const maxViablePrice = player.techLevel * 200 * displayCeilMult * ceoCeilMod;
  const priceOverCeiling = draft.price > maxViablePrice;

  const estCapacity = Math.floor(draft.productionBudget * 0.8 / effectiveUnitCost);
  const highBudgetWarning = draft.productionBudget > 8_000_000;

  // Price gap vs bot — real-time danger meter
  const priceRatio = bot.price > 0 ? draft.price / bot.price : 1;
  const priceDiffPct = Math.round((priceRatio - 1) * 100);
  const priceGapDanger = priceRatio > 1.25;
  const priceGapWarn = priceRatio > 1.10 && !priceGapDanger;

  const hypeActive = hypeCampaign?.active && !hypeCampaign.fulfilled;
  const canLaunch = !hypeActive && player.capital >= 5_000_000 && !isLocked;

  // Active skill visual effect hint
  const skillDemandBonus = ceoActiveSkill.usedThisQuarter
    ? (ceoActiveSkill.effectType === "tech_surge" ? 1.20 : ceoActiveSkill.effectType === "flash_pr" ? 1.15 : 1.0)
    : 1.0;
  const estRevBase = Math.floor(estCapacity * draft.price * 0.55);
  const estRev = Math.floor(estRevBase * skillDemandBonus);

  return (
    <>
      <BiddingWarModal />
      <TimeFreezeModal />

      {biddingWar && !biddingWar.active && biddingWar.engineerSigned !== null && (
        <div className={`mb-4 p-3 rounded-xl border text-xs font-mono text-center ${biddingWar.engineerSigned ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
          {biddingWar.engineerSigned ? t("bidding.winMsg") : t("bidding.lostMsg")}
        </div>
      )}

      <div className="flex flex-col gap-4 max-w-4xl mx-auto">

        {/* ===== WAR ROOM HEADER ===== */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
              timerPaused ? "bg-violet-500/10 border border-violet-500/20 text-violet-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
              <Target className="w-3 h-3" />
              Q{quarter} — {timerPaused ? t("time_freeze.paused") : t("war_room.title")}
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{t("war_room.title")}</h1>
            <p className="text-muted-foreground text-xs">{t("war_room.subtitle").replace("{{q}}", String(quarter))}</p>
          </div>

          {/* Timer + status */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative">
              <TimerRing value={quarterTimer} max={60} paused={timerPaused} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-mono font-bold text-2xl leading-none ${
                  timerPaused ? "text-violet-400"
                  : isCritical ? "text-red-400 timer-critical"
                  : quarterTimer > 20 ? "text-primary" : "text-yellow-400"}`}>
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
                isBotFrozen ? "text-cyan-400" : botLocked ? "text-red-400" : "text-muted-foreground"}`}>
                {isBotFrozen ? <Snowflake className="w-3 h-3" /> : botLocked ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                {isBotFrozen ? `BOT FROZEN ${activeCardEffects.botFrozenSecondsLeft}s`
                  : botLocked ? t("action_phase.botLocked") : t("action_phase.botDeciding")}
              </span>
            </div>
          </div>
        </div>

        {/* ===== ACTION CARDS (compact) ===== */}
        {equippedCards.length > 0 && <ActiveCardsPanel />}

        {/* ===== MAIN GRID: LEFT = CONTROLS, RIGHT = BOT INTEL ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* ===== LEFT COLUMN ===== */}
          <div className="flex flex-col gap-4">

            {/* Warnings */}
            {(priceOverCeiling || highBudgetWarning || tradeBanActive || priceGapDanger || priceGapWarn) && (
              <div className="flex flex-col gap-1.5">
                {tradeBanActive && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/30 border border-red-500/50 text-xs text-red-300 font-semibold">
                    <AlertTriangle className="w-3 h-3 shrink-0" />{t("action_phase.tradeBanWarning")}
                  </div>
                )}
                {priceOverCeiling && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                    <AlertTriangle className="w-3 h-3 shrink-0" />{t("action_phase.elasticityWarning")} (~${Math.round(maxViablePrice)})
                  </div>
                )}
                {priceGapDanger && !tradeBanActive && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/40 border border-red-600/60 text-xs text-red-300 font-semibold flash-alert">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {t("war_room.priceGapDanger").replace("{{pct}}", String(priceDiffPct))}
                  </div>
                )}
                {priceGapWarn && !priceGapDanger && showIntel && !tradeBanActive && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-400">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {t("war_room.priceGapOk").replace("{{pct}}", String(priceDiffPct))}
                  </div>
                )}
                {highBudgetWarning && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-400">
                    <AlertTriangle className="w-3 h-3 shrink-0" />{t("action_phase.diminishingWarning")} (${effectiveUnitCost}/unit)
                  </div>
                )}
              </div>
            )}

            {/* PRICE SLIDER */}
            <div className={`bg-card border rounded-xl p-4 transition-all ${
              isLocked ? "opacity-60 pointer-events-none border-border"
              : priceOverCeiling || priceGapDanger ? "border-red-500/40"
              : priceGapWarn ? "border-yellow-500/30"
              : "border-card-border"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border bg-emerald-500/10 border-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t("action_phase.price")}</p>
                    {showIntel && bot.price > 0 && (
                      <p className={`text-[10px] font-mono ${priceGapDanger ? "text-red-400" : priceGapWarn ? "text-yellow-400" : "text-muted-foreground"}`}>
                        {priceDiffPct >= 0
                          ? t("war_room.priceGapOk").replace("{{pct}}", String(Math.abs(priceDiffPct)))
                          : t("war_room.priceGapUnder").replace("{{pct}}", String(Math.abs(priceDiffPct)))}
                      </p>
                    )}
                  </div>
                </div>
                <p className={`text-lg font-mono font-bold ${priceOverCeiling || priceGapDanger ? "text-red-400" : "text-emerald-400"}`}>${draft.price}</p>
              </div>
              <input type="range" min={299} max={maxPriceSlider} step={10} value={draft.price} disabled={isLocked}
                onChange={(e) => updateDraft({ price: Number(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, ${priceOverCeiling || priceGapDanger ? "hsl(0 84% 60%)" : priceGapWarn ? "hsl(39 100% 57%)" : "hsl(142 76% 46%)"} ${((draft.price - 299) / (maxPriceSlider - 299)) * 100}%, hsl(var(--secondary)) ${((draft.price - 299) / (maxPriceSlider - 299)) * 100}%)` }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{t("action_phase.priceMin")}</span><span>{t("action_phase.priceMax")}</span>
              </div>
            </div>

            {/* PRODUCTION SLIDER */}
            <div className={`bg-card border rounded-xl p-4 transition-all ${
              isLocked ? "opacity-60 pointer-events-none border-border"
              : highBudgetWarning ? "border-yellow-500/30" : "border-card-border"}`}>
              <div className="flex items-center justify-between mb-2">
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
                <span className={`font-mono ${skillCostMod < 1 ? "text-emerald-400" : "text-yellow-400/70"}`}>
                  {skillCostMod < 1 && "⚡ "}{estCapacity.toLocaleString()} {t("action_phase.units")} @ ${effectiveUnitCost}/u
                </span>
                <span>{t("action_phase.prodMax")}</span>
              </div>
            </div>

            {/* INTEL SLIDER */}
            <div className={`bg-card border rounded-xl p-4 transition-all ${isLocked ? "opacity-60 pointer-events-none border-border" : "border-card-border"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border bg-amber-500/10 border-amber-500/20 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t("action_phase.intel")}</p>
                    <p className="text-[10px] text-muted-foreground">{player.intelPoints} {t("action_phase.intelHintAvail")}</p>
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
                <span className="italic">{t("action_phase.intelInfo")}</span>
              </div>
            </div>

            {/* EST OUTCOME */}
            <div className="bg-card border border-card-border rounded-xl p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">{t("action_phase.yourPosition")}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-[10px] text-muted-foreground mb-1">{t("action_phase.estRevenue")}</p>
                  <p className={`text-sm font-mono font-bold ${skillDemandBonus > 1 ? "text-emerald-300" : "text-emerald-400"}`}>
                    {formatMoney(estRev)}
                    {skillDemandBonus > 1 && <span className="text-[9px] text-emerald-300 ml-1">⚡×{skillDemandBonus.toFixed(2)}</span>}
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
              <div className="mt-2 flex gap-1.5 flex-wrap">
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

            {/* HYPE CAMPAIGN */}
            {(() => {
              return (
                <div className="bg-card border border-card-border rounded-xl p-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t("action_phase.hypeTactics")}</p>
                  {hypeActive ? (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-violet-400 animate-pulse">🚀 {t("action_phase.hypeActive")}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{t("action_phase.hypeDeadline")} {hypeCampaign!.deadline} · Demand +40%</p>
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
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{t("action_phase.hypeDesc")}</p>
                      </div>
                      <button onClick={launchHypeCampaign} disabled={!canLaunch}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                          canLaunch ? "bg-violet-600/80 text-white hover:bg-violet-600 border border-violet-500/50"
                          : "bg-secondary/50 text-muted-foreground cursor-not-allowed opacity-50 border border-border"}`}>
                        <Zap className="w-3 h-3" />
                        {t("action_phase.hypeCost")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* SUBMIT BUTTON */}
            {!isLocked && (
              <button onClick={submitReady} disabled={playerReady || timerPaused}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  playerReady
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-default"
                    : timerPaused
                      ? "bg-secondary border border-border text-muted-foreground cursor-not-allowed opacity-60"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 pulse-glow text-base"}`}>
                {playerReady ? <><CheckCircle className="w-4 h-4" />{t("action_phase.youAreReady")}</> : t("action_phase.submitReady")}
              </button>
            )}
          </div>

          {/* ===== RIGHT COLUMN — BOT INTEL + CEO SKILL ===== */}
          <div className="flex flex-col gap-4">
            <BotIntelPanel showIntel={showIntel} />
            <CEOSkillPanel />
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
