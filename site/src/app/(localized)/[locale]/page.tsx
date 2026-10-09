import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import LegacyPage from "@/components/LegacyPage";
import HomeBehavior from "@/components/HomeBehavior";
import { getTranslations } from "next-intl/server";
import { getLegacyMeta, legacyMetadata, localizeBodyLinks } from "@/lib/legacy";

export const dynamic = "force-static";
type Props={params:Promise<{locale:"ru"|"en"}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const {locale}=await params;const t=await getTranslations({locale,namespace:"home.meta"});return legacyMetadata("/",t("title"),t("description"),locale);}
export default async function HomePage({params}:Props){const {locale}=await params;const file=locale==="en"?"home-body-en.html":"home-body.html";const raw=await readFile(join(process.cwd(),"src/content",file),"utf8");const html=locale==="en"?localizeBodyLinks(raw):raw;const item=getLegacyMeta("/");return <><link rel="stylesheet" href="/legacy/styles.css"/><LegacyPage html={html} jsonLd={item.jsonLd}><HomeBehavior locale={locale}/></LegacyPage></>;}
