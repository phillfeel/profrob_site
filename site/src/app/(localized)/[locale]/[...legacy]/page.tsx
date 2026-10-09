import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegacyPage from "@/components/LegacyPage";
import LegacyRuntime from "@/components/LegacyRuntime";
import { getLegacyMeta, legacyMetadata, localizeBodyLinks } from "@/lib/legacy";
import pages from "@/content/legacy-pages.json";

export const dynamic = "force-static";
type Props = { params: Promise<{ locale: "ru" | "en"; legacy?: string[] }> };
type Config = { ns: string; scripts: string[]; css: string[]; content: string; bodyClass?: string };

export function generateStaticParams() { return Object.keys(pages).flatMap((route) => ["ru", "en"].map((locale) => ({ locale, legacy: route.split("/") }))); }
function configFor(slug?: string[]) { const route = slug?.join("/") ?? ""; const config=(pages as Record<string,Config>)[route]; if (!config) notFound(); return { route: "/"+route, config }; }
const isDirect = (config: Config) => config.ns.startsWith("industries.") || config.ns.startsWith("solutions.");
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { locale, legacy } = await params; const { route, config }=configFor(legacy); const t=await getTranslations({locale,namespace:config.ns}); const prefix=isDirect(config) ? "" : "meta."; const og=getLegacyMeta(route).og; return legacyMetadata(route, t(`${prefix}title`), t(`${prefix}description`), locale, { title: og["og:title"] ? t(`${prefix}ogTitle`) : undefined, description: og["og:description"] ? t(`${prefix}ogDescription`) : undefined }); }
export default async function LegacyRoute({ params }: Props) { const { locale, legacy }=await params; const { route, config }=configFor(legacy); const file=config.content.replace(/-body\.html$/, locale === "en" ? "-body-en.html" : "-body.html"); const raw=await readFile(join(process.cwd(),"src/content",file),"utf8");const html=locale==="en"?localizeBodyLinks(raw):raw; const item=getLegacyMeta(route); return <> {config.css.map((css)=><link key={css} rel="stylesheet" href={`/legacy/${css}`} />)} <LegacyPage html={html} bodyClass={config.bodyClass} jsonLd={item.jsonLd}><LegacyRuntime locale={locale} scripts={config.scripts} runtimeKey={route}/></LegacyPage></>; }
