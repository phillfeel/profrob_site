import { getLocale } from "next-intl/server";
import NotFoundView from "@/components/NotFoundView";

// Reached only when notFound() is thrown (an invalid [locale] segment such as /x.html); the proxy handles unknown pages.
export default async function NotFound() {
  const locale = (await getLocale()) === "en" ? "en" : "ru";
  return <NotFoundView locale={locale} />;
}
