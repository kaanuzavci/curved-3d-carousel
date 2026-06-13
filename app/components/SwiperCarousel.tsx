"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import { EffectCoverflow, Autoplay, Keyboard } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper/types";
import { motion, AnimatePresence } from "framer-motion";

import "swiper/swiper-bundle.css";

/* ── card data ── */
const CARDS = [
  {
    id: "nexus",
    title: "NEXUS",
    label: "MARKETPLACE",
    sub: "Trade, collect and discover digital assets on ApeChain.",
    cta: "LAUNCH APP",
    bg: "radial-gradient(ellipse 80% 70% at 30% 40%, #0a2868 0%, #020c1e 55%, #000510 100%)",
    accent: "#2060d8",
    orb: "#1040b0",
  },
  {
    id: "forge",
    title: "FORGE",
    label: "STUDIO",
    sub: "Create, deploy and manage your NFT collections effortlessly.",
    cta: "START BUILDING",
    bg: "radial-gradient(ellipse 80% 70% at 30% 40%, #083820 0%, #020d08 55%, #000500 100%)",
    accent: "#20b840",
    orb: "#0a5020",
  },
  {
    id: "slab",
    title: "SLAB CASH",
    label: "COLLECTIBLES",
    sub: "Physical collectibles backed by blockchain authentication.",
    cta: "EXPLORE",
    bg: "radial-gradient(ellipse 80% 70% at 30% 40%, #4a1800 0%, #150500 55%, #050000 100%)",
    accent: "#e05010",
    orb: "#802800",
  },
  {
    id: "void",
    title: "VOID",
    label: "DEFI",
    sub: "Next-generation DeFi primitives built for the ape economy.",
    cta: "ENTER VOID",
    bg: "radial-gradient(ellipse 80% 70% at 30% 40%, #2a0660 0%, #0a0020 55%, #020008 100%)",
    accent: "#9030e0",
    orb: "#500090",
  },
  {
    id: "surge",
    title: "SURGE",
    label: "LAUNCHPAD",
    sub: "Discover and invest in the next wave of ApeChain projects.",
    cta: "VIEW LAUNCHES",
    bg: "radial-gradient(ellipse 80% 70% at 30% 40%, #003838 0%, #001414 55%, #000505 100%)",
    accent: "#00c0b0",
    orb: "#007060",
  },
  {
    id: "arc",
    title: "ARC",
    label: "BRIDGE",
    sub: "Seamlessly move assets across chains with zero compromise.",
    cta: "BRIDGE ASSETS",
    bg: "radial-gradient(ellipse 80% 70% at 30% 40%, #3c2400 0%, #120800 55%, #050200 100%)",
    accent: "#d08828",
    orb: "#784400",
  },
] as const;

type Card = (typeof CARDS)[number];

/* ── glow orb inside card ── */
function CardOrb({ color }: { color: string }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        inset: 0,
        background: `radial-gradient(circle 280px at 35% 42%, ${color}88 0%, transparent 65%)`,
      }}
    />
  );
}

/* ── concentric ring decoration ── */
function Rings({ accent }: { accent: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
      viewBox="0 0 800 520"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      {[80, 160, 260, 380, 520].map((r) => (
        <circle
          key={r}
          cx="320"
          cy="240"
          r={r}
          stroke={accent}
          strokeWidth="1"
          opacity={0.5 - r * 0.0008}
        />
      ))}
    </svg>
  );
}

/* ── individual slide card ── */
function CardContent({ card, active }: { card: Card; active: boolean }) {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: card.bg,
        borderRadius: 16,
        border: `1px solid ${card.accent}22`,
      }}
    >
      {/* layered background visuals */}
      <CardOrb color={card.orb} />
      <Rings accent={card.accent} />

      {/* grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)`,
          opacity: active ? 0.9 : 0.35,
          transition: "opacity 0.5s",
        }}
      />

      {/* label chip */}
      <div className="absolute top-7 left-8">
        <span
          className="text-[10px] tracking-[0.3em] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: `${card.accent}22`,
            border: `1px solid ${card.accent}55`,
            color: card.accent,
            fontFamily: "var(--font-barlow), system-ui, sans-serif",
          }}
        >
          {card.label}
        </span>
      </div>

      {/* title + sub + cta — bottom left */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pt-16"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
        }}
      >
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h2
                className="text-5xl font-black tracking-tight text-white mb-2 leading-none"
                style={{ fontFamily: "var(--font-anton), sans-serif" }}
              >
                {card.title}
              </h2>
              <p
                className="text-sm text-white/55 mb-5 max-w-[340px] leading-relaxed"
                style={{ fontFamily: "var(--font-barlow), system-ui, sans-serif" }}
              >
                {card.sub}
              </p>
              <button
                className="text-[11px] tracking-[0.25em] font-bold px-6 py-3 transition-all duration-200"
                style={{
                  background: card.accent,
                  color: "#000",
                  fontFamily: "var(--font-barlow), system-ui, sans-serif",
                  borderRadius: 4,
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.2)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.filter = "none")
                }
              >
                {card.cta}
              </button>
            </motion.div>
          )}
          {!active && (
            <motion.div
              key={`${card.id}-inactive`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className="text-3xl font-black tracking-tight text-white/70 leading-none"
                style={{ fontFamily: "var(--font-anton), sans-serif" }}
              >
                {card.title}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── main export ── */
export default function SwiperCarousel({ onActiveChange }: { onActiveChange?: (i: number) => void }) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="absolute inset-0 pt-14 flex items-center justify-center z-10">
      <Swiper
        modules={[EffectCoverflow, Autoplay, Keyboard]}
        effect="coverflow"
        grabCursor
        centeredSlides
        loop
        slidesPerView={1.45}
        coverflowEffect={{
          rotate: 32,
          stretch: 0,
          depth: 200,
          scale: 0.82,
          slideShadows: true,
        }}
        autoplay={{ delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }}
        keyboard={{ enabled: true }}
        speed={680}
        onSwiper={(s) => { swiperRef.current = s; }}
        onSlideChange={(s) => { setActiveIdx(s.realIndex); onActiveChange?.(s.realIndex); }}
        style={{ width: "100%", paddingBlock: "20px" }}
      >
        {CARDS.map((card, i) => (
          <SwiperSlide
            key={card.id}
            style={{ height: "clamp(300px, 52vh, 480px)" }}
          >
            <CardContent card={card} active={activeIdx === i} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {CARDS.map((card, i) => (
          <button
            key={card.id}
            onClick={() => swiperRef.current?.slideToLoop(i)}
            className="transition-all duration-300"
            style={{
              width: activeIdx === i ? 24 : 7,
              height: 7,
              borderRadius: 4,
              background: activeIdx === i ? card.accent : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
