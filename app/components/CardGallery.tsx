"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   CARD GALLERY — the full deck, opened from "SEE ALL CARDS".
   ─────────────────────────────────────────────────────────────
   A full-screen, site-styled overlay: every card image in a
   responsive grid (including the ones the rest of the page never
   shows), each tile lifting on hover. Click a tile to blow the
   image up full-screen; click again (or ✕ / Esc) to step back.
═══════════════════════════════════════════════════════════════ */

type Card = { img: string; title: string; cat: string };

// every jpg in /public/cards — the staples plus the ones we don't otherwise use
const ALL_CARDS: Card[] = [
  { img: "/cards/otherside.jpg", title: "RENGOKU", cat: "FLAME HASHIRA" },
  { img: "/cards/nexus.jpg", title: "GOJO", cat: "JUJUTSU SORCERER" },
  { img: "/cards/forge.jpg", title: "ASHE", cat: "FROST ARCHER" },
  { img: "/cards/void.jpg", title: "VINCENT", cat: "GUNSLINGER" },
  { img: "/cards/surge.jpg", title: "AURELIA", cat: "CELESTIAL" },
  { img: "/cards/arc.jpg", title: "AKARI", cat: "IDOL" },
  { img: "/cards/eva.jpg", title: "EVA", cat: "DIVA" },
  { img: "/cards/dani.jpg", title: "DANI", cat: "SOUL REAPER" },
  { img: "/cards/ariel.jpg", title: "ARIEL", cat: "PILOT" },
  { img: "/cards/bayc.jpg", title: "KAKASHI", cat: "SHINOBI" },
  { img: "/cards/ape.jpg", title: "KIRA", cat: "NETRUNNER" },
  { img: "/cards/background.jpg", title: "THE DRIFT", cat: "SCENE" },
  { img: "/cards/card1.jpg", title: "LEON", cat: "AGENT" },
  { img: "/cards/card2.jpg", title: "NEO", cat: "THE ONE" },
  { img: "/cards/card3.jpg", title: "MANDO", cat: "BOUNTY HUNTER" },
  { img: "/cards/card4.jpg", title: "NOIR", cat: "VIGILANTE" },
  { img: "/cards/card5.jpg", title: "HORIZON", cat: "VISTA" },
  { img: "/cards/card6.jpg", title: "FUJI", cat: "SCENERY" },
];

export default function CardGallery({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [zoom, setZoom] = useState<Card | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Esc closes the zoom first, then the gallery; lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setZoom((z) => (z ? null : (onClose(), null)));
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // reset the zoom whenever the gallery is closed
  useEffect(() => { if (!open) setZoom(null); }, [open]);

  return (
    <>
      <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9990] overflow-y-auto"
          style={{ background: "rgba(2,4,9,0.97)", backdropFilter: "blur(14px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* sticky header */}
          <div className="sticky top-0 z-10 flex items-end justify-between gap-6 px-[clamp(20px,5vw,72px)] pt-[clamp(28px,5vh,56px)] pb-6"
            style={{ background: "linear-gradient(180deg, rgba(2,4,9,0.96) 60%, transparent)" }}>
            <div>
              <p className="text-[11px] tracking-[0.5em] text-white/45"
                style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>THE FULL DECK</p>
              <h2 className="mt-2 text-white leading-none"
                style={{ fontFamily: "var(--font-anton),sans-serif", fontSize: "clamp(34px,6vw,72px)", letterSpacing: "0.04em" }}>
                ALL CARDS
                <span className="ml-3 align-super text-[0.34em] text-white/40">{ALL_CARDS.length}</span>
              </h2>
            </div>
            <button
              aria-label="Close gallery"
              onClick={onClose}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors duration-300 hover:border-white/80 hover:text-white"
              style={{ fontSize: 24, lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          {/* grid */}
          <div className="grid grid-cols-2 gap-[clamp(12px,1.6vw,22px)] px-[clamp(20px,5vw,72px)] pb-[clamp(48px,10vh,120px)] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {ALL_CARDS.map((c, i) => (
              <motion.button
                key={c.img}
                className="group relative block overflow-hidden rounded-2xl text-left"
                style={{ border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 18px 50px rgba(0,0,0,0.5)" }}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.035, 0.5), ease: "easeOut" }}
                onClick={() => setZoom(c)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.img}
                  alt={c.title}
                  draggable={false}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4 pt-12"
                  style={{ background: "linear-gradient(0deg, rgba(2,4,9,0.92), transparent)" }}>
                  <div className="text-[10px] tracking-[0.3em] text-white/55"
                    style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>{c.cat}</div>
                  <div className="text-[22px] leading-tight tracking-[0.06em] text-white"
                    style={{ fontFamily: "var(--font-anton),sans-serif" }}>{c.title}</div>
                </div>
                <div className="pointer-events-none absolute inset-0 ring-0 ring-inset ring-white/0 transition-all duration-300 group-hover:ring-2 group-hover:ring-white/30" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* zoomed image — portalled to <body> so the gallery's backdrop-filter
          (a containing block) can't pin it to the scrolled content top */}
      {mounted && createPortal(
        <AnimatePresence>
          {open && zoom && (
            <motion.div
              className="fixed inset-0 z-[9999] flex cursor-pointer items-center justify-center p-6"
              style={{ background: "rgba(2,4,9,0.94)", backdropFilter: "blur(8px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setZoom(null)}
            >
              <button
                aria-label="Close image"
                onClick={() => setZoom(null)}
                className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white/80 transition-colors duration-300 hover:border-white/80 hover:text-white"
                style={{ fontSize: 22, lineHeight: 1 }}
              >
                ×
              </button>
              <motion.figure
                className="relative flex max-h-[90vh] max-w-[94vw] flex-col items-center"
                initial={{ scale: 0.92, y: 14 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 14 }}
                transition={{ type: "spring", stiffness: 150, damping: 18 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={zoom.img}
                  alt={zoom.title}
                  draggable={false}
                  className="max-h-[82vh] max-w-[94vw] rounded-2xl object-contain"
                  style={{ boxShadow: "0 40px 120px rgba(0,0,0,0.7)" }}
                />
                <figcaption className="mt-5 text-center">
                  <div className="text-[11px] tracking-[0.34em] text-white/55"
                    style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>{zoom.cat}</div>
                  <div className="text-[30px] tracking-[0.08em] text-white"
                    style={{ fontFamily: "var(--font-anton),sans-serif" }}>{zoom.title}</div>
                </figcaption>
              </motion.figure>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
