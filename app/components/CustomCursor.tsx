"use client";

import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   CUSTOM CURSOR — gold core + trailing glow ring
   ─────────────────────────────────────────────────────────────
   Three layers, all driven by transforms from a rAF loop (no React
   state, no layout work):
     dot  — pinned to the exact pointer position
     ring — eases after the dot; grows over interactive elements,
            squeezes while the mouse is held down
     halo — large soft glow that lags lazily behind, lighting the
            backdrop the way the card glows do
   Skipped entirely on touch devices; the native cursor is hidden
   via CSS only for fine pointers.
═══════════════════════════════════════════════════════════════ */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const dot = dotRef.current, ring = ringRef.current, halo = haloRef.current;
    if (!dot || !ring || !halo) return;

    let x = innerWidth / 2, y = innerHeight / 2;
    let rx = x, ry = y, hx = x, hy = y;
    let hover = false, down = false, shown = false;
    let raf = 0, last = performance.now();

    const setShown = (v: boolean) => {
      if (shown === v) return;
      shown = v;
      const o = v ? "1" : "0";
      dot.style.opacity = o; ring.style.opacity = o; halo.style.opacity = o;
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY;
      setShown(true);
    };
    const onOver = (e: MouseEvent) => {
      hover = !!(e.target as Element | null)?.closest?.(
        "a, button, [role='button'], input, select, textarea, [data-cursor='hover']"
      );
      ring.classList.toggle("is-hover", hover);
    };
    const onDown = () => { down = true; };
    const onUp = () => { down = false; };
    const onLeave = () => setShown(false);
    const onEnter = () => setShown(true);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 50); last = now;
      const fRing = 1 - Math.exp(-0.018 * dt);  // ring chases the dot
      const fHalo = 1 - Math.exp(-0.007 * dt);  // halo drifts lazily after
      rx += (x - rx) * fRing; ry += (y - ry) * fRing;
      hx += (x - hx) * fHalo; hy += (y - hy) * fHalo;
      const ringScale = (hover ? 1.55 : 1) * (down ? 0.78 : 1);
      const dotScale = down ? 0.65 : 1;
      dot.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${dotScale})`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%) scale(${ringScale})`;
      halo.style.transform = `translate3d(${hx}px,${hy}px,0) translate(-50%,-50%)`;
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <div aria-hidden>
      <div ref={haloRef} className="cursor-halo fixed top-0 left-0 z-[198] pointer-events-none" />
      <div ref={ringRef} className="cursor-ring fixed top-0 left-0 z-[199] pointer-events-none" />
      <div ref={dotRef} className="cursor-dot fixed top-0 left-0 z-[200] pointer-events-none" />
    </div>
  );
}
