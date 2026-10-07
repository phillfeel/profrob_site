"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { initMain } from "@/behaviors/main-legacy";

export default function HomeBehavior({locale}:{locale:"ru"|"en"}) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const cleanup = initMain({ gsap, ScrollTrigger, Lenis, locale });
    return () => { if (typeof cleanup === "function") cleanup(); };
  }, [locale]);
  return null;
}
