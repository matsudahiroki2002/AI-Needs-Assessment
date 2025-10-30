/**
 * @file Minimal dictionary helper for routing UI strings through a translation key.
 * @remarks Replace this lightweight lookup with a full i18n provider when locales are expanded beyond Japanese.
 */
import dictionary from "@/locales/ja.json";

const FLATTENED = flattenDictionary(dictionary);

export type TranslationKey = keyof typeof FLATTENED;

export const t = (
  key: TranslationKey | string,
  fallback?: string,
  values?: Record<string, string | number>
) => {
  if (key in FLATTENED) {
    const template = FLATTENED[key as TranslationKey];
    return values ? interpolate(template, values) : template;
  }
  // TODO(i18n): Replace with logger once multi-locale support is added.
  const resolved = fallback ?? key;
  return values ? interpolate(resolved, values) : resolved;
};

function flattenDictionary(
  nested: Record<string, unknown>,
  parentKey = ""
): Record<string, string> {
  return Object.entries(nested).reduce<Record<string, string>>(
    (acc, [currentKey, value]) => {
      const newKey = parentKey ? `${parentKey}.${currentKey}` : currentKey;
      if (typeof value === "object" && value !== null) {
        Object.assign(acc, flattenDictionary(value as Record<string, unknown>, newKey));
      } else if (typeof value === "string") {
        acc[newKey] = value;
      }
      return acc;
    },
    {}
  );
}

function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) =>
    Object.prototype.hasOwnProperty.call(values, token) ? String(values[token]) : ""
  );
}
