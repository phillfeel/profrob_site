"use client";

import { useEffect } from "react";

type Props = { locale: "ru" | "en"; scripts: string[]; runtimeKey: string };
type I18nRuntime = { lang: "ru" | "en"; t: (...args: unknown[]) => unknown; ready: Promise<void>; done: () => void; __profrobotRuntime?: boolean };

const load = (src: string) => new Promise<void>((resolve, reject) => {
  const el = document.createElement("script");
  el.src = src; el.async = false;
  el.onload = () => resolve(); el.onerror = () => reject(new Error(`Failed to load ${src}`));
  document.body.appendChild(el);
});

export default function LegacyRuntime({ locale, scripts, runtimeKey }: Props) {
  useEffect(() => {
    document.documentElement.classList.add("js");
    let cancelled = false;
    const win = window as typeof window & { i18n?: I18nRuntime };
    const run = async () => {
      if (!win.i18n) {
        // Same contract as the inline boot of the legacy pages (i18n/boot.js): in English the page scripts wait for
        // i18n.ready, which the runtime resolves with done() once en.json is loaded (3 s at most), so they format
        // numbers and units in English instead of falling back to the Russian text built into them.
        let resolveReady: () => void = () => {};
        const ready = locale === "en" ? new Promise<void>((resolve) => { resolveReady = resolve; setTimeout(resolve, 3000); }) : Promise.resolve();
        win.i18n = { lang: locale, t: () => undefined, ready, done: () => resolveReady() };
      }
      const runtime = win.i18n;
      if (!cancelled && !runtime.__profrobotRuntime) await load(locale === "ru" ? "/legacy/i18n-runtime-ru.js" : "/legacy/i18n-runtime.js");
      for (const src of scripts) { if (cancelled) return; await load(`/legacy/${src}`); }
    };
    void run().catch((error) => console.error(`ProfRobot runtime ${runtimeKey} failed`, error));
    return () => { cancelled = true; };
  }, [locale, runtimeKey, scripts]);
  return null;
}
