import { en, type Messages } from "./messages/en";
import { es } from "./messages/es";
import { fr } from "./messages/fr";
import { ja } from "./messages/ja";

export type Locale = "en" | "es" | "fr" | "ja";

export const defaultLocale: Locale = "en";

export const locales: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "ja", label: "日本語" },
];

const catalogs: Record<Locale, Messages> = { en, es, fr, ja };

export function isLocale(value: string): value is Locale {
  return value in catalogs;
}

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? catalogs[defaultLocale];
}

type NestedKeyOf<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? NestedKeyOf<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

export type MessageKey = NestedKeyOf<Messages>;

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string>,
): string {
  const parts = key.split(".");
  let value: unknown = getMessages(locale);
  for (const part of parts) {
    if (value && typeof value === "object" && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  if (typeof value !== "string") return key;
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, name: string) => vars[name] ?? `{${name}}`);
}
