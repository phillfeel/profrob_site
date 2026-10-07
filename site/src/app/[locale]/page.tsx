import { getTranslations } from "next-intl/server";

export const dynamic = "force-static";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return (
    <main>
      <h1>{t("hero.title")}</h1>
    </main>
  );
}
