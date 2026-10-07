import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import NotFoundView from "@/components/NotFoundView";
import { routing } from "@/i18n/routing";

// Served by src/proxy.ts with status 404 for every address that is not a page of the site.
type Props = { params: Promise<{ locale: "ru" | "en" }> };

export function generateStaticParams() { return routing.locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "notFound.meta" });
  return { title: t("title"), description: t("description"), robots: "noindex" };
}

export default async function NotFoundPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NotFoundView locale={locale} />;
}
