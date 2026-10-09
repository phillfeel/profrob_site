import type { Metadata } from "next";
import meta from "@/content/legacy-meta.json";
import pages from "@/content/legacy-pages.json";

export type LegacyMeta = { title: string|null; description: string|null; robots: string; canonical: string|null; og: Record<string,string>; jsonLd: string[] };
export function getLegacyMeta(route: string): LegacyMeta {
  const item = (meta as Record<string, LegacyMeta>)[route.replace(/\/$/, "")] ?? (meta as Record<string, LegacyMeta>)[route] ?? (meta as Record<string, LegacyMeta>)["/"];
  return item;
}

const SITE_NAME = { ru: "Профессиональная Робототехника", en: "Professional Robotics" } as const;
const OG_LOCALE = { ru: "ru_RU", en: "en_US" } as const;

/**
 * title, description and canonical as the legacy page has them (the legacy EN runtime leaves the relative RU
 * canonical alone, so both locales share it). Robots, Open Graph and Twitter are the owner SEO decision of
 * 2026-10-09, not parity: legacy is noindex everywhere, now RU pages are "index, follow" while EN pages stay
 * noindex (spec §10 p. 3); every page gets og:* + twitter:card for share previews with the /assets/og-<locale>.png
 * card, made absolute by metadataBase of the root layout. `og` overrides title/description where the legacy page
 * has its own og copy (only roi); it replaces the hand-rendered LegacyOg tags of the earlier parity phase.
 */
export function legacyMetadata(route: string, title: string, description: string, locale: "ru" | "en", og?: { title?: string; description?: string }): Metadata {
  const item = getLegacyMeta(route);
  return {
    title,
    description,
    robots: locale === "ru" ? "index, follow" : "noindex",
    alternates: item.canonical ? { canonical: item.canonical } : undefined,
    openGraph: {
      title: og?.title ?? title,
      description: og?.description ?? description,
      url: item.canonical ?? route,
      siteName: SITE_NAME[locale],
      locale: OG_LOCALE[locale],
      type: "website",
      images: [{ url: `/assets/og-${locale}.png`, width: 1200, height: 630, alt: SITE_NAME[locale] }],
    },
    twitter: { card: "summary_large_image" },
  };
}

const routeKeys = new Set(["", ...Object.keys(pages as Record<string, unknown>)]); // "" is the home route

/**
 * The English bodies were made for the legacy site, where both languages lived at one address and links carried no
 * language; in the Next site the English pages live under /en/, so at render time hrefs of known routes get the
 * prefix. Assets, anchors, external addresses and unknown paths stay as they are.
 */
export function localizeBodyLinks(html: string): string {
  return html.replace(/ href="(\/[^"]*)"/g, (match, href: string) => {
    const path = href.replace(/[?#].*$/, "").replace(/^\/+|\/+$/g, "");
    return routeKeys.has(path) ? ` href="/en${href}"` : match;
  });
}
