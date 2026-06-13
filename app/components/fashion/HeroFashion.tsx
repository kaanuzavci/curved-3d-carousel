"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const FLOATING_CARDS = [
  { color: "#1c1c1c", label: "NOIR JACKET", num: "#001", price: "₺3.890", top: "12%", right: "6%", rotate: 3 },
  { color: "#e8e4de", label: "IVORY TEE", num: "#002", price: "₺890", top: "48%", right: "2%", rotate: -2 },
];

export default function HeroFashion() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const urbanY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const chicY = useTransform(scrollYProgress, [0, 1], ["0%", "-32%"]);
  const subtitleY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const cardsY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen min-h-[700px] bg-black overflow-hidden flex flex-col justify-center">
      {/* Vertical label left */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-center z-10">
        <span className="text-[9px] tracking-[0.5em] uppercase text-white/30 font-[family-name:var(--font-barlow)]">
          Collection SS 2026
        </span>
      </div>

      {/* Vertical label right */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 origin-center z-10">
        <span className="text-[9px] tracking-[0.5em] uppercase text-white/30 font-[family-name:var(--font-barlow)]">
          Est. 2019 · Istanbul
        </span>
      </div>

      {/* Floating product cards */}
      <motion.div style={{ y: cardsY, opacity }} className="absolute inset-0 z-20 pointer-events-none">
        {FLOATING_CARDS.map((card, i) => (
          <motion.div
            key={card.num}
            initial={{ opacity: 0, y: 30, rotate: card.rotate }}
            animate={{ opacity: 1, y: 0, rotate: card.rotate }}
            transition={{ delay: 0.8 + i * 0.2, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ top: card.top, right: card.right }}
            className="absolute w-[180px] md:w-[220px]"
          >
            <div
              className="w-full aspect-[3/4] mb-3 relative overflow-hidden"
              style={{ background: card.color }}
            >
              {/* Texture overlay */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)"
                }}
              />
              <div className="absolute top-3 left-3 text-[8px] tracking-[0.3em] uppercase opacity-40 font-[family-name:var(--font-barlow)]"
                style={{ color: card.color === "#e8e4de" ? "#000" : "#fff" }}
              >
                {card.num}
              </div>
            </div>
            <div className={`px-1 ${card.color === "#e8e4de" ? "" : ""}`}>
              <p className="text-xs tracking-[0.25em] uppercase text-white/80 font-[family-name:var(--font-barlow)] font-600">
                {card.label}
              </p>
              <p className="text-sm text-white/50 font-[family-name:var(--font-barlow)] mt-0.5">
                {card.price}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main typography */}
      <motion.div style={{ opacity }} className="relative z-10 px-12 md:px-20 select-none">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[10px] tracking-[0.6em] uppercase text-white/40 font-[family-name:var(--font-barlow)] mb-4"
        >
          New Season · SS 2026
        </motion.p>

        {/* URBAN */}
        <div className="overflow-hidden mb-[-0.08em]">
          <motion.h1
            style={{ y: urbanY }}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-[family-name:var(--font-anton)] text-[22vw] leading-[0.85] tracking-[-0.01em] text-white block"
          >
            URBAN
          </motion.h1>
        </div>

        {/* CHIC — offset right, slightly different parallax */}
        <div className="overflow-hidden">
          <motion.h1
            style={{ y: chicY }}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="font-[family-name:var(--font-anton)] text-[22vw] leading-[0.85] tracking-[-0.01em] text-white block md:ml-[8vw]"
          >
            CHIC
          </motion.h1>
        </div>

        {/* Bottom row */}
        <motion.div
          style={{ y: subtitleY }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-10"
        >
          <a
            href="#collection"
            className="group flex items-center gap-3 text-xs tracking-[0.35em] uppercase font-[family-name:var(--font-barlow)] font-600 text-white border border-white/30 px-7 py-3.5 hover:bg-white hover:text-black transition-all duration-300"
          >
            Explore Collection
            <motion.span
              className="inline-block"
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </a>
          <a
            href="#editorial"
            className="text-xs tracking-[0.35em] uppercase text-white/40 hover:text-white transition-colors duration-300 font-[family-name:var(--font-barlow)]"
          >
            The Editorial
          </a>
        </motion.div>
      </motion.div>

      {/* Bottom edge — scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"
        />
        <span className="text-[9px] tracking-[0.4em] uppercase text-white/25 font-[family-name:var(--font-barlow)]">
          Scroll
        </span>
      </motion.div>

      {/* Huge background number */}
      <div className="absolute bottom-0 right-0 font-[family-name:var(--font-anton)] text-[30vw] leading-none text-white/[0.03] select-none pointer-events-none translate-y-[20%]">
        26
      </div>
    </section>
  );
}
