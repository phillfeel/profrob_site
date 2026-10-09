"use client";

import { useEffect } from "react";

type Props = { locale: "ru" | "en" };

/**
 * The legacy boot (i18n/boot.js) switched the language on a click on [data-lang] by storing the choice and
 * reloading the page with ?lang=. In the Next site every language has its own address, so the click opens the
 * same page of the other language (/about/ <-> /en/about/, query and hash kept). A full load, as in the legacy
 * site: the legacy page scripts initialize once per load.
 */
export default function LangSwitch({ locale }: Props) {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const button = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-lang]") : null;
      const target = button?.getAttribute("data-lang");
      if (button === null || (target !== "ru" && target !== "en") || target === locale) return;
      const { pathname, search, hash } = window.location;
      const next = target === "en" ? `/en${pathname}` : pathname.replace(/^\/en(?=\/|$)/, "") || "/";
      window.location.replace(next + search + hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [locale]);
  return null;
}
