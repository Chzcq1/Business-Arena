// ===== BLACK MARKET PHASE v5.0 =====
// ผู้เล่นซื้อ Action Cards เพื่อใช้ระหว่าง 60-second Action Phase

import { useGameStore } from "@/store/gameStore";
import { useT } from "@/hooks/useT";
import { MAX_EQUIPPED_CARDS } from "@/game-data/actionCards";
import type { ActionCard } from "@/game-data/actionCards";

const RARITY_STYLES: Record<string, { badge: string; border: string; glow: string }> = {
  common:    { badge: "text-slate-400 bg-slate-800/60 border-slate-600/40",   border: "border-slate-600/40 hover:border-slate-400/60",   glow: "" },
  rare:      { badge: "text-blue-400 bg-blue-900/40 border-blue-500/40",       border: "border-blue-500/40 hover:border-blue-400/70",       glow: "shadow-blue-900/20" },
  legendary: { badge: "text-amber-400 bg-amber-900/40 border-amber-500/40",   border: "border-amber-500/50 hover:border-amber-400/80",   glow: "shadow-amber-900/30 shadow-lg" },
};

function CardShop({ card, onEquip, isEquipped, canEquip, hasEnoughCapital }: {
  card: ActionCard;
  onEquip: () => void;
  isEquipped: boolean;
  canEquip: boolean;
  hasEnoughCapital: boolean;
}) {
  const { t } = useT();
  const lang = useGameStore((s) => s.language);
  const styles = RARITY_STYLES[card.rarity];
  const locale = lang === "th" ? card.th : card.en;
  const rarityKey = `black_market.rarity${card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}`;

  const btnDisabled = isEquipped || !canEquip || !hasEnoughCapital;
  const btnLabel = isEquipped ? t("black_market.equipped")
    : !canEquip ? t("black_market.maxReached")
    : !hasEnoughCapital ? `${t("black_market.insufficientFunds")} $${(card.cost / 1_000_000).toFixed(0)}M`
    : t("black_market.equip");

  return (
    <div className={`relative flex flex-col bg-card border-2 rounded-xl p-4 transition-all ${styles.border} ${styles.glow} ${isEquipped ? "ring-2 ring-green-500/40" : ""}`}>
      {/* Rarity badge */}
      <div className={`absolute top-3 right-3 text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded border ${styles.badge}`}>
        {t(rarityKey)}
      </div>

      {/* Card header */}
      <div className="text-3xl mb-2">{card.icon}</div>
      <div className="font-bold text-sm text-foreground mb-0.5 pr-14">{locale.title}</div>
      <div className="text-[11px] text-muted-foreground mb-3 leading-relaxed">{locale.desc}</div>

      {/* Effect */}
      <div className="mt-auto">
        <div className="text-[10px] text-emerald-400 font-mono bg-emerald-900/20 rounded px-2 py-1.5 border border-emerald-500/20 mb-3 leading-relaxed">
          {locale.effectDesc}
        </div>

        {/* Cost + Equip button */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-bold text-red-400">
            −${(card.cost / 1_000_000).toFixed(0)}M
          </div>
          <button
            onClick={onEquip}
            disabled={btnDisabled}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${isEquipped
                ? "bg-green-900/30 text-green-400 border border-green-500/30 cursor-default"
                : btnDisabled
                  ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
                  : "bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 cursor-pointer"
              }`}
          >
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BlackMarketPhase() {
  const { t } = useT();
  const lang = useGameStore((s) => s.language);
  const {
    quarter, player, blackMarketCards, equippedCards,
    buyActionCard, proceedFromBlackMarket,
  } = useGameStore();

  function handleEquip(cardId: string) {
    buyActionCard(cardId);
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/20 border border-red-500/30 text-red-400 text-xs font-semibold mb-2">
            🏴‍☠️ Q{quarter} — {t("black_market.phaseLabel")}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("black_market.title")}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t("black_market.subtitle")}</p>
        </div>
        <div className="text-right bg-secondary/50 rounded-lg px-4 py-2 border border-border shrink-0">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Capital</div>
          <div className="text-xl font-bold text-green-400">
            ${(player.capital / 1_000_000).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* Equipped Slots */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
          {t("black_market.equippedLabel")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: MAX_EQUIPPED_CARDS }).map((_, i) => {
            const card = equippedCards[i];
            const locale = card ? (lang === "th" ? card.th : card.en) : null;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all
                  ${card
                    ? "border-green-500/50 bg-green-900/10"
                    : "border-dashed border-border/50 bg-secondary/20"
                  }`}
              >
                {card ? (
                  <>
                    <span className="text-2xl">{card.icon}</span>
                    <div>
                      <div className="text-xs font-semibold text-green-400">{locale?.title}</div>
                      <div className="text-[10px] text-muted-foreground">{locale?.effectDesc}</div>
                    </div>
                    <span className="ml-auto text-green-500 text-sm">✓</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl opacity-30">⬜</span>
                    <div>
                      <div className="text-xs text-muted-foreground/60">{t("black_market.slotEmpty")}</div>
                      <div className="text-[10px] text-muted-foreground/40">{t("black_market.slotHint")}</div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Shop */}
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">
          {t("black_market.shopLabel")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {blackMarketCards.map((card) => (
            <CardShop
              key={card.id}
              card={card}
              onEquip={() => handleEquip(card.id)}
              isEquipped={!!equippedCards.find((c) => c.id === card.id)}
              canEquip={equippedCards.length < MAX_EQUIPPED_CARDS}
              hasEnoughCapital={player.capital >= card.cost}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={proceedFromBlackMarket}
          className="flex-none px-5 py-3 rounded-xl border border-border text-muted-foreground text-sm hover:text-foreground hover:border-border/80 transition-all cursor-pointer"
        >
          {t("black_market.skip")}
        </button>
        <button
          onClick={proceedFromBlackMarket}
          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all cursor-pointer pulse-glow"
        >
          {equippedCards.length > 0
            ? `🃏 ${equippedCards.length} card${equippedCards.length > 1 ? "s" : ""} equipped — ${t("black_market.proceed")}`
            : t("black_market.proceed")
          }
        </button>
      </div>
    </div>
  );
}
