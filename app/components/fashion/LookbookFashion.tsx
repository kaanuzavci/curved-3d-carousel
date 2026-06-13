"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const LOOKS = [
  { num: "01", title: "NIGHT RITUAL", desc: "For the hours between midnight and dawn", bg: "#0d0d0d", accent: "#2a2a2a" },
  { num: "02", title: "BONE STRUCTURE", desc: "Architecture of the everyday", bg: "#e8e4de", accent: "#d4cdc5", dark: true },
  { num: "03", title: "GREY MATTER", desc: "The space between black and white", bg: "#5a5550", accent: "#4a4540" },
];

export default function LookbookFashion() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section id="editorial" ref={ref} className="bg-black py-28 px-8 md:px-16 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-20 overflow-hidden">
          <motion.div style={{ y: titleY }}>
            <p className="text-[9px] tracking-[0.5em] uppercase text-white/25 font-[family-name:var(--font-barlow)] mb-3">
              Lookbook 2026
            </p>
            <h2 className="font-[family-name:var(--font-anton)] text-[clamp(3rem,9vw,8rem)] text-white leading-[0.9]">
              THREE<br />LOOKS
            </h2>
          </motion.div>
          <p className="text-xs tracking-wider text-white/25 font-[family-name:var(--font-barlow)] max-w-[160px] text-right leading-relaxed hidden md:block">
            A visual story told in three acts, each a world unto itself.
          </p>
        </div>

        {/* Looks row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LOOKS.map((look, i) => (
            <motion.div
              key={look.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{ marginTop: i === 1 ? 60 : 0 }}
              className="group cursor-pointer"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative aspect-[2/3] overflow-hidden"
                style={{ background: look.bg }}
              >
                {/* Inner accent block */}
                <div
                  className="absolute top-8 left-8 right-8 bottom-16"
                  style={{ background: look.accent }}
                />

                {/* Text overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <span
                    className="text-[9px] tracking-[0.4em] uppercase font-[family-name:var(--font-barlow)] opacity-50"
                    style={{ color: look.dark ? "#000" : "#fff" }}
                  >
                    Look {look.num}
                  </span>
                  <div>
                    <h3
                      className="font-[family-name:var(--font-anton)] text-2xl tracking-wide leading-tight mb-2"
                      style={{ color: look.dark ? "#000" : "#fff" }}
                    >
                      {look.title}
                    </h3>
                    <p
                      className="text-[10px] tracking-wider uppercase font-[family-name:var(--font-barlow)] opacity-50"
                      style={{ color: look.dark ? "#000" : "#fff" }}
                    >
                      {look.desc}
                    </p>
                  </div>
                </div>

                {/* Hover overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 border-2"
                  style={{ borderColor: look.dark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)" }}
                />
              </motion.div>

              {/* Number */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-white/20 font-[family-name:var(--font-anton)] text-3xl leading-none">
                  {look.num}
                </span>
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-white/50 font-[family-name:var(--font-barlow)]">
                    {look.title}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
