"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   ABOUT — what this thing actually is.
   A site-styled overlay explaining that CURVED 3D is a hobby build:
   a real-time 3D showcase of favourite characters and dream worlds,
   made for the love of it. Portalled to <body> so it sits above the
   WebGL canvas regardless of stacking context.
═══════════════════════════════════════════════════════════════ */

const JUMPS = [
  { label: "CAROUSEL", href: "#top" },
  { label: "THE DIVE", href: "#dive" },
  { label: "THE DECK", href: "#deck" },
  { label: "THE DEEP", href: "#deep" },
];

const FEATURES = [
  { k: "3D CAROUSEL", v: "A draggable WebGL cylinder of hand-picked characters, spun with Three.js." },
  { k: "THE DIVE", v: "A scroll-pinned descent — cards streaming past and a grab-to-spin 3D cube." },
  { k: "THE DECK", v: "An endless two-way marquee of the full roster." },
  { k: "THE DEEP", v: "A living underwater scene: glowing shoals, a breaching fish and a reef, all in Lottie." },
];

export default function AboutOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9995] flex items-center justify-center overflow-y-auto p-5 sm:p-8"
          style={{ background: "rgba(2,4,9,0.95)", backdropFilter: "blur(16px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="relative my-auto w-full max-w-2xl"
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 130, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* header row — title left, close right, clearly separated */}
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[11px] tracking-[0.5em] text-white/45"
                  style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>ABOUT</p>
                <h2 className="mt-2.5 text-white leading-[0.95]"
                  style={{ fontFamily: "var(--font-anton),sans-serif", fontSize: "clamp(36px,7vw,66px)", letterSpacing: "0.03em" }}>
                  CURVED 3D
                </h2>
              </div>
              <button
                aria-label="Close"
                onClick={onClose}
                className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors duration-300 hover:border-white/80 hover:text-white"
                style={{ fontSize: 22, lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <p className="mt-6 max-w-xl text-white/65"
              style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 300, fontSize: "clamp(13px,1.9vw,16px)", lineHeight: 1.8 }}>
              No product, no roadmap, no tokens — just a hobby. A real-time
              playground for my favourite anime &amp; game characters and a few
              dreamlike scenes, built with Three.js shaders and Framer Motion
              purely for the joy of making things move.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.k} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-[14px] tracking-[0.14em] text-white"
                    style={{ fontFamily: "var(--font-anton),sans-serif" }}>{f.k}</div>
                  <div className="mt-2 text-[13px] leading-relaxed text-white/55"
                    style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 300 }}>{f.v}</div>
                </div>
              ))}
            </div>

            {/* main website + quick-jump */}
            <div className="mt-8 flex flex-col gap-6 border-t border-white/12 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <a
                href="https://kaanuzavci.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-fit items-center gap-3 rounded-full border border-white/30 px-7 py-3.5 text-white transition-colors duration-300 hover:border-white/80"
                style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600, letterSpacing: "0.2em", fontSize: 12 }}
              >
                VISIT MAIN WEBSITE
                <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden>↗</span>
              </a>
              <div>
                <p className="text-[10px] tracking-[0.4em] text-white/40"
                  style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>JUMP TO</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {JUMPS.map((j) => (
                    <a key={j.href} href={j.href} onClick={onClose}
                      className="rounded-full border border-white/20 px-3.5 py-1.5 text-[11px] tracking-[0.16em] text-white/70 transition-colors duration-300 hover:border-white/70 hover:text-white"
                      style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>{j.label}</a>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-7 text-[10px] tracking-[0.22em] text-white/30"
              style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>
              BUILT WITH THREE.JS · FRAMER MOTION · LOTTIE · NEXT.JS
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
