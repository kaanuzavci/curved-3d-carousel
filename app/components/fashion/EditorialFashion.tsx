"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function EditorialFashion() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const leftTextY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const rightTextY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const leftBlockY = useTransform(scrollYProgress, [0, 1], ["0%", "-5%"]);
  const rightBlockY = useTransform(scrollYProgress, [0, 1], ["0%", "5%"]);

  return (
    <section id="editorial" ref={ref} className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left — black */}
      <motion.div
        style={{ y: leftBlockY }}
        className="relative flex-1 bg-black flex flex-col items-start justify-end p-10 md:p-16 min-h-[60vh] md:min-h-screen overflow-hidden"
      >
        {/* Big color block */}
        <div className="absolute top-16 left-10 right-10 h-[50vh] bg-[#111] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#000]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)"
            }}
          />
          <span className="relative font-[family-name:var(--font-anton)] text-[clamp(4rem,14vw,12rem)] text-white/[0.06] select-none leading-none">
            THE
          </span>
        </div>

        <motion.div style={{ y: leftTextY }} className="relative z-10">
          <p className="text-[9px] tracking-[0.5em] uppercase text-white/30 font-[family-name:var(--font-barlow)] mb-4">
            Chapter One
          </p>
          <h2 className="font-[family-name:var(--font-anton)] text-[clamp(3rem,8vw,6rem)] text-white leading-[0.9] mb-6">
            THE<br />VOID<br />WITHIN
          </h2>
          <p className="text-xs tracking-widest uppercase text-white/40 font-[family-name:var(--font-barlow)] max-w-[200px] leading-relaxed">
            A collection born from absence. The power of what is not there.
          </p>
          <motion.a
            href="#"
            whileHover={{ x: 6 }}
            className="inline-flex items-center gap-2 mt-8 text-[10px] tracking-[0.4em] uppercase text-white/50 hover:text-white transition-colors duration-200 font-[family-name:var(--font-barlow)]"
          >
            Read Story <span>→</span>
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Right — white */}
      <motion.div
        style={{ y: rightBlockY }}
        className="relative flex-1 bg-white flex flex-col items-start justify-start p-10 md:p-16 min-h-[60vh] md:min-h-screen overflow-hidden"
      >
        {/* Big color block */}
        <div className="absolute bottom-16 left-10 right-10 h-[50vh] bg-[#f0ece6] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tl from-[#e8e4de] to-[#f8f5f0]" />
          <span className="relative font-[family-name:var(--font-anton)] text-[clamp(4rem,14vw,12rem)] text-black/[0.06] select-none leading-none">
            NEW
          </span>
        </div>

        <motion.div style={{ y: rightTextY }} className="relative z-10">
          <p className="text-[9px] tracking-[0.5em] uppercase text-black/30 font-[family-name:var(--font-barlow)] mb-4">
            Chapter Two
          </p>
          <h2 className="font-[family-name:var(--font-anton)] text-[clamp(3rem,8vw,6rem)] text-black leading-[0.9] mb-6">
            LIGHT<br />FINDS<br />FORM
          </h2>
          <p className="text-xs tracking-widest uppercase text-black/40 font-[family-name:var(--font-barlow)] max-w-[200px] leading-relaxed">
            Ivory, bone, chalk. The spectrum of nothing holds everything.
          </p>
          <motion.a
            href="#"
            whileHover={{ x: 6 }}
            className="inline-flex items-center gap-2 mt-8 text-[10px] tracking-[0.4em] uppercase text-black/50 hover:text-black transition-colors duration-200 font-[family-name:var(--font-barlow)]"
          >
            Read Story <span>→</span>
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}
