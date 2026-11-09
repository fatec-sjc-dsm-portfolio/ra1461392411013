import { ptBR } from "./pt-BR";
import { enUS } from "./en-US";
import type { Locale } from "./locales";
import type { UiDictionary } from "./index";

export const dictionaries: Record<Locale, UiDictionary> = {
  pt: ptBR,
  en: enUS,
};
