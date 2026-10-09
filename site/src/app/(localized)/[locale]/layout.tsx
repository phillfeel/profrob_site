import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import LangSwitch from "@/components/LangSwitch";
import "@/app/globals.css";

export function generateStaticParams(){return routing.locales.map((locale)=>({locale}));}

/** metadataBase turns the relative canonical, og:url and og:image into absolute URLs. The production host is
 * профробот.рф (punycode below); robotpro.pro serves the same copy, so absolute URLs always point at the primary
 * domain. NEXT_PUBLIC_SITE_URL overrides the base per environment (staging, preview). Owner decision, 2026-10-09. */
export const metadata: Metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://xn--90azabbgbtn.xn--p1ai") };
export default async function LocaleRootLayout({children,params}:{children:ReactNode;params:Promise<{locale:string}>}){
  const {locale}=await params;
  if(!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();
  setRequestLocale(locale);
  const messages=(await import(`@/messages/${locale}.json`)).default;
  // Google Fonts exactly as in the legacy <head> (next/font is not allowed before parity, spec 1 and phase 9).
  return <html lang={locale}><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    {/* eslint-disable-next-line @next/next/no-page-custom-font -- identical to the legacy <head>; next/font is forbidden until parity (spec 1, phase 9) */}
    <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
  </head><body><NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider><LangSwitch locale={locale as "ru" | "en"}/></body></html>
}
