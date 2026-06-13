"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function StatementFashion() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const line1Y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const line2Y = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const line3Y = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <section ref={ref} className="relative bg-white overflow-hidden py-32 md:py-48">
      <motion.div
        style={{ scale: bgScale }}
        className="absolute inset-0 bg-white"
      />

      {/* Grid lines decoration */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, #000 0px, #000 1px, transparent 1px, transparent 120px)"
        }}
      />

      <div className="relative z-10 px-8 md:px-16 overflow-hidden">
        <motion.div style={{ y: line1Y }} className="overflow-hidden">
          <h2 className="font-[family-name:var(--font-anton)] text-[clamp(3rem,13vw,14rem)] text-black leading-[0.85] tracking-[-0.01em] whitespace-nowrap">
            WEAR YOUR
          </h2>
        </motion.div>
        <motion.div style={{ y: line2Y }} className="overflow-hidden md:pl-[10vw]">
          <h2 className="font-[family-name:var(--font-anton)] text-[clamp(3rem,13vw,14rem)] leading-[0.85] tracking-[-0.01em] whitespace-nowrap" style={{ color: "transparent", WebkitTextStroke: "2px #000" }}>
            STORY
          </h2>
        </motion.div>
        <motion.div style={{ y: line3Y }} className="overflow-hidden md:pl-[20vw]">
          <h2 className="font-[family-name:var(--font-anton)] text-[clamp(2rem,9vw,10rem)] text-black/15 leading-[0.85] tracking-[-0.01em] whitespace-nowrap">
            BOLDLY
          </h2>
        </motion.div>
      </div>

      {/* Bottom row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mt-16 px-8 md:px-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <p className="text-xs tracking-[0.3em] uppercase text-black/40 font-[family-name:var(--font-barlow)] max-w-xs leading-relaxed">
          Each piece tells the story of its wearer. No two stories are the same.
          This is fashion as identity.
        </p>
        <a
          href="#contact"
          className="text-xs tracking-[0.4em] uppercase font-[family-name:var(--font-barlow)] font-600 text-black border border-black px-7 py-3.5 hover:bg-black hover:text-white transition-all duration-300 shrink-0"
        >
          Shop Now
        </a>
      </motion.div>
    </section>
  );
}
