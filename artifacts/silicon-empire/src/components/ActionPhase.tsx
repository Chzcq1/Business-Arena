import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { DollarSign, Factory, Eye, Clock, Lock, Wifi, WifiOff } from "lucide-react";

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

function TimerRing({ value, max }: { value: number; max: number }) {
  const pct = value / max;
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const dash = pct * circ;
  const color = value > 20 ? "#3b82f6" : value > 10 ? "#f59e0b" : "#ef4444";

  return (
    <svg width="110" height="110" className="rotate-[-90deg]">
      <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle
        cx="55" cy="55" r={radius} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.9s linear, stroke 0.3s" }}
      />
    </svg>
  );
}

export function ActionPhase() {
  const {
    quarterTimer, timerRunning, draft, updateDraft,
    bot, intelAlerts, dismissIntelAlert, quarter, language, player
  } = useGameStore();

  const tickTimer = useGameStore((s) => s.tickTimer);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, tickTimer]);

  const t = language === "en"
    ? {
        title: "Action Phase — Live Trading",
        sub: "Adjust your strategy before the clock hits zero",
        price: "Unit Price",
        prod: "Production Budget",
        intel: "Intel Allocation",
        botPrice: "Competitor Price",
        botProd: "Est. Production",
        intelActive: "INTEL ACTIVE",
        intelOff: "INTEL OFFLINE",
        lock: "LOCKING IN...",
        q: "Q",
      }
    : {
        title: "เฟสการดำเนินงาน — การซื้อขายสด",
        sub: "ปรับกลยุทธ์ก่อนนาฬิกาจะถึงศูนย์",
        price: "ราคาต่อหน่วย",
        prod: "งบประมาณการผลิต",
        intel: "การจัดสรรข่าวกรอง",
        botPrice: "ราคาคู่แข่ง",
        botProd: "การผลิตโดยประมาณ",
        intelActive: "ข่าวกรองเปิดใช้งาน",
        intelOff: "ข่าวกรองออฟไลน์",
        lock: "กำลังล็อก...",
        q: "ไตรมาส",
      };

  const isLocked = !timerRunning && quarterTimer === 0;
  const isCritical = quarterTimer <= 10 && quarterTimer > 0;

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <Clock className="w-3 h-3" />
            {t.q}{quarter} — ACTION PHASE
          </div>
          <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground text-xs">{t.sub}</p>
        </div>

        <div className="relative shrink-0">
          <TimerRing value={quarterTimer} max={60} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-mono font-bold text-2xl leading-none ${
              isCritical ? "text-red-400 timer-critical" : quarterTimer > 20 ? "text-primary" : "text-yellow-400"
            }`}>
              {String(quarterTimer).padStart(2, "0")}
            </span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
              {isLocked ? <Lock className="w-3 h-3" /> : "SEC"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <div className={`bg-card border rounded-xl p-5 transition-all ${isLocked ? "opacity-60 pointer-events-none border-border" : "border-card-border"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{t.price}</p>
                  <p className="text-[10px] text-muted-foreground">Per unit sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-mono font-bold text-emerald-400">${draft.price}</p>
                <p className="text-[10px] text-muted-foreground">Min $299</p>
              </div>
            </div>
            <input
              type="range"
              min={299} max={1499} step={10}
              value={draft.price}
              disabled={isLocked}
              onChange={(e) => updateDraft({ price: Number(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(142 76% 46%) ${((draft.price - 299) / (1499 - 299)) * 100}%, hsl(var(--secondary)) ${((draft.price - 299) / (1499 - 299)) * 100}%)`
              }}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>$299 Volume</span>
              <span>$1,499 Premium</span>
            </div>
          </div>

          <div className={`bg-card border rounded-xl p-5 transition-all ${isLocked ? "opacity-60 pointer-events-none border-border" : "border-card-border"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Factory className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{t.prod}</p>
                  <p className="text-[10px] text-muted-foreground">Components + Assembly</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-mono font-bold text-blue-400">{formatMoney(draft.productionBudget)}</p>
                <p className="text-[10px] text-muted-foreground">≈ {Math.floor(draft.productionBudget * 0.8 / 200).toLocaleString()} units</p>
              </div>
            </div>
            <input
              type="range"
              min={20000} max={200000} step={5000}
              value={draft.productionBudget}
              disabled={isLocked}
              onChange={(e) => updateDraft({ productionBudget: Number(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(217 91% 60%) ${((draft.productionBudget - 20000) / (200000 - 20000)) * 100}%, hsl(var(--secondary)) ${((draft.productionBudget - 20000) / (200000 - 20000)) * 100}%)`
              }}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>$20K Lean</span>
              <span>$200K Full Ramp</span>
            </div>
          </div>

          <div className={`bg-card border rounded-xl p-5 transition-all ${isLocked ? "opacity-60 pointer-events-none border-border" : "border-card-border"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{t.intel}</p>
                  <p className="text-[10px] text-muted-foreground">{player.intelPoints} pts available</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-mono font-bold text-amber-400">{draft.intelAllocation} pts</p>
                <div className="flex items-center gap-1 justify-end">
                  {draft.intelAllocation > 0
                    ? <><Wifi className="w-3 h-3 text-amber-400" /><span className="text-[10px] text-amber-400">{t.intelActive}</span></>
                    : <><WifiOff className="w-3 h-3 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">{t.intelOff}</span></>
                  }
                </div>
              </div>
            </div>
            <input
              type="range"
              min={0} max={Math.min(player.intelPoints, 5)} step={1}
              value={draft.intelAllocation}
              disabled={isLocked}
              onChange={(e) => updateDraft({ intelAllocation: Number(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(39 100% 57%) ${(draft.intelAllocation / Math.max(Math.min(player.intelPoints, 5), 1)) * 100}%, hsl(var(--secondary)) ${(draft.intelAllocation / Math.max(Math.min(player.intelPoints, 5), 1)) * 100}%)`
              }}
            />
            <p className="text-[10px] text-muted-foreground mt-1">Allocate to see competitor moves in real-time</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-card border border-card-border rounded-xl p-5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">Competitor Status</p>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">{t.botPrice}</span>
                  <span className={`text-sm font-mono font-bold ${draft.intelAllocation > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {draft.intelAllocation > 0 ? `$${bot.price}` : "???"}
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  {draft.intelAllocation > 0 && (
                    <div
                      className="h-full bg-red-400 rounded-full transition-all duration-500"
                      style={{ width: `${((bot.price - 299) / (1499 - 299)) * 100}%` }}
                    />
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">{t.botProd}</span>
                  <span className={`text-sm font-mono font-bold ${draft.intelAllocation > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {draft.intelAllocation > 0 ? formatMoney(bot.productionBudget) : "???"}
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  {draft.intelAllocation > 0 && (
                    <div
                      className="h-full bg-red-400 rounded-full transition-all duration-500"
                      style={{ width: `${((bot.productionBudget - 20000) / (200000 - 20000)) * 100}%` }}
                    />
                  )}
                </div>
              </div>

              {bot.lastMoveLabel && draft.intelAllocation > 0 && (
                <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flash-alert">
                  <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">Last Move Detected</p>
                  <p className="text-xs text-red-300 font-mono">{bot.lastMoveLabel}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-5 flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Live Intel Feed</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {intelAlerts.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  {draft.intelAllocation > 0 ? "Monitoring competitor activity..." : "Enable intel to receive alerts"}
                </p>
              ) : (
                [...intelAlerts].reverse().map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs slide-in-right ${
                      alert.type === "price"
                        ? "bg-red-500/10 border-red-500/20 text-red-300"
                        : alert.type === "production"
                        ? "bg-orange-500/10 border-orange-500/20 text-orange-300"
                        : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 shrink-0 ${
                      alert.type === "price" ? "bg-red-400" : alert.type === "production" ? "bg-orange-400" : "bg-cyan-400"
                    }`} />
                    <span className="font-mono leading-snug">{alert.message}</span>
                    <button
                      onClick={() => dismissIntelAlert(alert.id)}
                      className="ml-auto text-[10px] opacity-50 hover:opacity-100 shrink-0"
                    >✕</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Your Position</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <p className="text-[10px] text-muted-foreground mb-1">Est. Revenue</p>
                <p className="text-sm font-mono font-bold text-emerald-400">
                  {formatMoney(Math.floor(draft.productionBudget * 0.8 / 200) * draft.price * 0.6)}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <p className="text-[10px] text-muted-foreground mb-1">Est. Margin</p>
                <p className="text-sm font-mono font-bold text-blue-400">
                  {(((draft.price - 200) / draft.price) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLocked && (
        <div className="flex items-center justify-center gap-3 py-4 rounded-xl bg-primary/10 border border-primary/30">
          <Lock className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-primary font-semibold text-sm">{t.lock} Calculating resolution...</span>
        </div>
      )}
    </div>
  );
}
