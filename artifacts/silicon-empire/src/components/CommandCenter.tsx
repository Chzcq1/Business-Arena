import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { formatCapital, formatMoney } from "@/utils/format";
import { Award, Wrench, Factory, Zap, Shield, Radio, CreditCard, TrendingUp, AlertTriangle, CheckCircle, X } from "lucide-react";

type Tab = "executives" | "upgrades" | "sabotage" | "bank";

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"}`}>
      {label}
    </button>
  );
}

function UpgradeCard({ icon, title, description, cost, costLabel, onAction, actionLabel, done, disabled, disabledReason }: {
  icon: React.ReactNode; title: string; description: string; cost: number;
  costLabel: string; onAction: () => void; actionLabel: string;
  done?: boolean; disabled?: boolean; disabledReason?: string;
}) {
  return (
    <div className={`bg-secondary/40 border rounded-xl p-4 transition-all ${done ? "border-emerald-500/30" : disabled ? "border-border opacity-60" : "border-card-border hover:border-primary/30"}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${done ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-primary/10 border border-primary/20"}`}>
          {done ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <span className={`text-xs font-mono font-bold shrink-0 ${done ? "text-emerald-400" : "text-primary"}`}>{costLabel}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug mb-3">{description}</p>
          {done ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
              <CheckCircle className="w-3 h-3" /> Active
            </span>
          ) : (
            <div className="flex items-center justify-between gap-2">
              {disabledReason && <span className="text-[10px] text-yellow-500">{disabledReason}</span>}
              <button onClick={onAction} disabled={disabled}
                className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  disabled ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}>
                {actionLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommandCenter({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("executives");
  const { player, executives, upgrades, loans, sabotage, phase, hireExecutive, purchaseUpgrade, takeOutLoan, launchSabotage } = useGameStore();
  const { t } = useT();

  const isActionPhase = phase === "action";
  const notAvailableLabel = isActionPhase ? t("upgrades.notAvailable") : "";

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-card border border-card-border rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-sm font-bold text-foreground">{t("upgrades.title")}</p>
            <p className="text-xs text-muted-foreground">{formatCapital(player.capital)} available</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 p-3 border-b border-border">
          <TabBtn label={t("upgrades.tabExecutives")} active={tab === "executives"} onClick={() => setTab("executives")} />
          <TabBtn label={t("upgrades.tabUpgrades")} active={tab === "upgrades"} onClick={() => setTab("upgrades")} />
          <TabBtn label={t("upgrades.tabSabotage")} active={tab === "sabotage"} onClick={() => setTab("sabotage")} />
          <TabBtn label={t("bank.title")} active={tab === "bank"} onClick={() => setTab("bank")} />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {tab === "executives" && (
            <>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("upgrades.executivesHint")}</p>
              <UpgradeCard
                icon={<Award className="w-4 h-4 text-emerald-400" />}
                title={t("upgrades.cfoTitle")} description={t("upgrades.cfoDesc")}
                cost={40_000_000} costLabel={t("upgrades.cfoCost")}
                done={executives.cfo}
                disabled={isActionPhase || player.capital < 40_000_000 || executives.cfo}
                disabledReason={player.capital < 40_000_000 && !executives.cfo ? t("upgrades.insufficientCapital") : notAvailableLabel}
                onAction={() => hireExecutive("cfo")} actionLabel={t("upgrades.hire")}
              />
              <UpgradeCard
                icon={<Wrench className="w-4 h-4 text-blue-400" />}
                title={t("upgrades.cooTitle")} description={t("upgrades.cooDesc")}
                cost={40_000_000} costLabel={t("upgrades.cooCost")}
                done={executives.coo}
                disabled={isActionPhase || player.capital < 40_000_000 || executives.coo}
                disabledReason={player.capital < 40_000_000 && !executives.coo ? t("upgrades.insufficientCapital") : notAvailableLabel}
                onAction={() => hireExecutive("coo")} actionLabel={t("upgrades.hire")}
              />
            </>
          )}

          {tab === "upgrades" && (
            <>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("upgrades.permanentUpgrades")}</p>
              <UpgradeCard
                icon={<Factory className="w-4 h-4 text-violet-400" />}
                title={t("upgrades.maTitle")} description={t("upgrades.maDesc")}
                cost={150_000_000} costLabel={t("upgrades.maCost")}
                done={upgrades.componentFactory}
                disabled={isActionPhase || player.capital < 150_000_000 || upgrades.componentFactory}
                disabledReason={player.capital < 150_000_000 && !upgrades.componentFactory ? t("upgrades.insufficientCapital") : notAvailableLabel}
                onAction={() => purchaseUpgrade("componentFactory")} actionLabel={t("upgrades.acquire")}
              />
              <UpgradeCard
                icon={<Zap className="w-4 h-4 text-cyan-400" />}
                title={t("upgrades.engineerTitle")} description={t("upgrades.engineerDesc")}
                cost={80_000_000} costLabel={t("upgrades.engineerCost")}
                done={upgrades.legendaryEngineer}
                disabled={isActionPhase || player.capital < 80_000_000 || upgrades.legendaryEngineer}
                disabledReason={player.capital < 80_000_000 && !upgrades.legendaryEngineer ? t("upgrades.insufficientCapital") : notAvailableLabel}
                onAction={() => { purchaseUpgrade("legendaryEngineer"); onClose(); }} actionLabel={t("upgrades.poach")}
              />
            </>
          )}

          {tab === "sabotage" && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("upgrades.sabotageHint")}</p>
                {sabotage.cooldown && <span className="text-[10px] text-orange-400 font-bold uppercase">{t("upgrades.onCooldown")}</span>}
              </div>
              <UpgradeCard
                icon={<Shield className="w-4 h-4 text-red-400" />}
                title={t("upgrades.ddosTitle")} description={t("upgrades.ddosDesc")}
                cost={10_000_000} costLabel={t("upgrades.ddosCost")}
                done={sabotage.ddosPending}
                disabled={isActionPhase || sabotage.cooldown || player.capital < 10_000_000 || player.intelPoints < 3}
                disabledReason={player.intelPoints < 3 ? t("upgrades.insufficientIntel") : player.capital < 10_000_000 ? t("upgrades.insufficientCapital") : notAvailableLabel}
                onAction={() => { launchSabotage("ddos"); }}
                actionLabel={t("upgrades.launch")}
              />
              <UpgradeCard
                icon={<Radio className="w-4 h-4 text-pink-400" />}
                title={t("upgrades.prTitle")} description={t("upgrades.prDesc")}
                cost={5_000_000} costLabel={t("upgrades.prCost")}
                done={sabotage.prPending}
                disabled={isActionPhase || sabotage.cooldown || player.capital < 5_000_000 || player.intelPoints < 2}
                disabledReason={player.intelPoints < 2 ? t("upgrades.insufficientIntel") : player.capital < 5_000_000 ? t("upgrades.insufficientCapital") : notAvailableLabel}
                onAction={() => { launchSabotage("pr"); }}
                actionLabel={t("upgrades.launch")}
              />
              {(sabotage.ddosPending || sabotage.prPending) && (
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-400">
                  ⚡ Operation active — effects apply at resolution.
                </div>
              )}
            </>
          )}

          {tab === "bank" && (
            <>
              <div className="bg-secondary/40 border border-card-border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t("bank.emergency")}</p>
                    <p className="text-[11px] text-muted-foreground">{t("bank.emergencyDesc")}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 mb-3 pl-12">
                  <p>{executives.cfo ? t("bank.repayWithCFO") : t("bank.repayStandard")}</p>
                </div>
                <button onClick={() => { takeOutLoan(); }}
                  disabled={isActionPhase}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActionPhase ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30"}`}>
                  {isActionPhase ? t("upgrades.notAvailable") : t("bank.takeLoan")} (+$100M)
                </button>
              </div>

              {loans.quartersRemaining > 0 ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-bold text-red-400">{t("bank.debtActive")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: t("bank.repaymentInfo"), value: formatMoney(loans.repaymentPerQuarter) + "/Q" },
                      { label: t("bank.quartersLeft"), value: `${loans.quartersRemaining}Q` },
                      { label: t("bank.totalOwed"), value: formatCapital(loans.outstanding) },
                    ].map((r) => (
                      <div key={r.label} className="bg-red-500/10 rounded-lg p-2">
                        <p className="text-[10px] text-red-300/70 mb-0.5">{r.label}</p>
                        <p className="font-mono font-bold text-red-300">{r.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-red-400/70 mt-2">{t("bank.loanWarning")}</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-secondary/40 border border-border text-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs text-emerald-400 font-semibold">{t("bank.noDebt")}</p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-secondary/40 border border-border">
                <p className="text-[10px] text-muted-foreground mb-2">{t("bank.capitalProgress")}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((player.capital / 1_000_000_000) * 100, 100)}%` }} />
                  </div>
                  <span className="text-xs font-mono text-yellow-400 shrink-0">{(player.capital / 1_000_000_000 * 100).toFixed(1)}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{formatCapital(player.capital)} / $1B</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
