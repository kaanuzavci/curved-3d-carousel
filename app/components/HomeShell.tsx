"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import CylinderCarousel from "./CylinderCarousel";
import Preloader from "./Preloader";

/* Everything the first screen needs. The carousel itself is mounted
   behind the preloader from the very first frame, so the WebGL scene,
   shaders and textures all warm up while the bear is drawing — by the
   time the overlay fades there is nothing left to stutter. */
const ASSETS = [
  "/cards/background.jpg",
  "/cards/otherside.jpg",
  "/cards/nexus.jpg",
  "/cards/forge.jpg",
  "/cards/void.jpg",
  "/cards/surge.jpg",
  "/cards/arc.jpg",
  "/cards/bayc.jpg",
  "/cards/ape.jpg",
];

/* Keep the loader up at least this long so the draw loop is actually
   seen, even on a warm cache. */
const MIN_SHOW_MS = 3200;

export default function HomeShell() {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let done = 0;
    const t0 = performance.now();

    const one = (src: string) =>
      new Promise<void>(resolve => {
        const img = new Image();
        img.onload = img.onerror = () => {
          done++;
          if (!cancelled) setProgress(done / ASSETS.length);
          resolve();
        };
        img.src = src;
      });

    Promise.all([Promise.all(ASSETS.map(one)), document.fonts.ready]).then(() => {
      const wait = Math.max(0, MIN_SHOW_MS - (performance.now() - t0));
      setTimeout(() => { if (!cancelled) setReady(true); }, wait);
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <CylinderCarousel />
      <AnimatePresence>{!ready && <Preloader progress={progress} />}</AnimatePresence>
    </>
  );
}
