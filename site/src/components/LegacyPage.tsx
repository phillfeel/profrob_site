import type { ReactNode } from "react";

/** `bodyClass` is the class of the legacy <body> (sol-page, ind-page, …): Next owns <body>, so the page body markup carries it. */
export default function LegacyPage({ html, bodyClass, jsonLd = [], children }: { html: string; bodyClass?: string; jsonLd?: string[]; children?: ReactNode }) {
  return <>
    {children}
    <div className={bodyClass} dangerouslySetInnerHTML={{ __html: html }} />
    {jsonLd.map((item, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: item }} />)}
  </>;
}
