"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-screen min-h-[640px] flex items-center justify-center overflow-hidden noise-overlay"
    >
      {/* Atmospheric background */}
      <motion.div style={{ y }} className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0805] via-[#1a0f05] to-[#0a0805]" />
        {/* Coffee stain rings — decorative */}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full border border-[#c9a84c]/6 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full border border-[#c9a84c]/8 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/4 left-1/3 w-[200px] h-[200px] rounded-full bg-[#c9a84c]/4 -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        {/* Right side glow */}
        <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] rounded-full bg-[#3d1a0a]/60 blur-[80px]" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.4em" }}
          animate={{ opacity: 1, letterSpacing: "0.5em" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-[#c9a84c] text-xs uppercase tracking-[0.5em] mb-8"
        >
          Est. 2019 — Istanbul
        </motion.p>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[clamp(3.5rem,10vw,8rem)] font-light leading-[0.9] tracking-[-0.02em] text-[#f5f0e8] mb-2"
        >
          Her Yudum
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[clamp(3.5rem,10vw,8rem)] font-light leading-[0.9] tracking-[-0.02em] gold-gradient mb-10"
        >
          Bir Hikaye
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="text-[#d4c9b0]/70 text-lg font-light max-w-md mx-auto mb-12 leading-relaxed"
        >
          Tek kökenli çekirdeklerden, ustaca demlenmiş kahveler.
          Şehrin gürültüsünden bir nefes.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#menu"
            className="group relative px-8 py-4 bg-[#c9a84c] text-[#0a0805] text-sm tracking-widest uppercase font-medium overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(201,168,76,0.35)]"
          >
            <span className="relative z-10">Menüyü Keşfet</span>
            <div className="absolute inset-0 bg-[#e8c97a] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </a>
          <a
            href="#contact"
            className="px-8 py-4 border border-[#f5f0e8]/20 text-[#f5f0e8]/70 text-sm tracking-widest uppercase hover:border-[#f5f0e8]/50 hover:text-[#f5f0e8] transition-all duration-300"
          >
            Rezervasyon
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="text-[#c9a84c]/50 text-[10px] tracking-[0.4em] uppercase">Kaydır</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-[#c9a84c]/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}
