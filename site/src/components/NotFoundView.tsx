import { readFile } from "node:fs/promises";
import { join } from "node:path";
import LegacyPage from "@/components/LegacyPage";
import { localizeBodyLinks } from "@/lib/legacy";

/** Body of the legacy 404 page in the given language, with the stylesheets that page used. */
export default async function NotFoundView({ locale }: { locale: "ru" | "en" }) {
  const html = await readFile(join(process.cwd(), "src/content", locale === "en" ? "404-body-en.html" : "404-body.html"), "utf8");
  const body = locale === "en" ? localizeBodyLinks(html) : html;
  return <>
    <link rel="stylesheet" href="/legacy/styles.css" />
    <link rel="stylesheet" href="/legacy/solutions.css" />
    <link rel="stylesheet" href="/legacy/legal.css" />
    <LegacyPage html={body} bodyClass="sol-page" />
  </>;
}
