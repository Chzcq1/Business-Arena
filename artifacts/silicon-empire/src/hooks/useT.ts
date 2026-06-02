import enLocale from "@/locales/en.json";
import thLocale from "@/locales/th.json";
import { useGameStore } from "@/store/gameStore";

type LocaleData = typeof enLocale;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : path;
}

export function useT() {
  const language = useGameStore((s) => s.language);
  const locale: LocaleData = language === "th" ? (thLocale as LocaleData) : enLocale;

  const t = (key: string): string =>
    getNestedValue(locale as unknown as Record<string, unknown>, key);

  return { t, lang: language };
}
