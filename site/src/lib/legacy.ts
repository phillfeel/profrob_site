import type { Metadata } from "next";
import meta from "@/content/legacy-meta.json";

export type LegacyMeta = { title: string|null; description: string|null; robots: string; canonical: string|null; og: Record<string,string>; jsonLd: string[] };
/** Looks a message up in the page namespace (next-intl translator of getTranslations). */
export type Translate = (key: string) => string;

export function getLegacyMeta(route: string): LegacyMeta {
  const item = (meta as Record<string, LegacyMeta>)[route.replace(/\/$/, "")] ?? (meta as Record<string, LegacyMeta>)[route] ?? (meta as Record<string, LegacyMeta>)["/"];
  return item;
}

/**
 * title, description, robots and canonical exactly as the legacy page has them. The legacy EN runtime translates
 * title and description but leaves robots and canonical (a relative RU address) alone, so both locales get the same ones.
 * Open Graph is not part of this: Next derives twitter:* tags from it, which legacy does not have, see legacyOgTags.
 */
export function legacyMetadata(route: string, title: string, description: string): Metadata {
  const item = getLegacyMeta(route);
  return { title, description, robots: item.robots, alternates: item.canonical ? { canonical: item.canonical } : undefined };
}

/**
 * The og:* tags legacy has on the page (only roi has them), as [property, content] pairs. og:title and og:description
 * come from the dictionary (keys ogTitle/ogDescription next to the page title), anything else is copied.
 * `prefix` is the dictionary path of those keys inside the page namespace ("meta." or "").
 */
export function legacyOgTags(route: string, t: Translate, prefix: string): [string, string][] {
  return Object.entries(getLegacyMeta(route).og).map(([property, content]) =>
    [property, property === "og:title" ? t(`${prefix}ogTitle`) : property === "og:description" ? t(`${prefix}ogDescription`) : content]);
}
