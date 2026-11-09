export const locales = ["pt", "en"] as const;

export type Locale = (typeof locales)[number];

export const localeMeta: Record<Locale, { bcp47: string; ogLocale: string; htmlLang: string }> = {
  pt: { bcp47: "pt-BR", ogLocale: "pt_BR", htmlLang: "pt-BR" },
  en: { bcp47: "en-US", ogLocale: "en_US", htmlLang: "en-US" },
};

export function otherLocale(locale: Locale): Locale {
  return locale === "pt" ? "en" : "pt";
}
