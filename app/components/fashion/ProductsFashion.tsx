"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

const PRODUCTS = [
  { num: "#001", name: "NOIR OVERSIZED JACKET", material: "Merino Wool Blend", price: "₺3.890", color: "#1a1a1a", textColor: "#fff", offset: 0 },
  { num: "#002", name: "IVORY COLUMN DRESS", material: "Japanese Silk", price: "₺2.450", color: "#ede9e3", textColor: "#000", offset: 40 },
  { num: "#003", name: "CHROME WIDE TROUSERS", material: "Technical Fabric", price: "₺1.890", color: "#8a8580", textColor: "#fff", offset: -20 },
  { num: "#004", name: "VOID TURTLENECK", material: "Cashmere", price: "₺1.650", color: "#2a2620", textColor: "#fff", offset: 60 },
  { num: "#005", name: "BONE CARGO TRENCH", material: "Cotton Gabardine", price: "₺4.200", color: "#d4cdc5", textColor: "#000", offset: -10 },
  { num: "#006", name: "SMOKE MIDI SKIRT", material: "Recycled Polyester", price: "₺1.290", color: "#5a5550", textColor: "#fff", offset: 30 },
];

function ProductCard({ product, index }: { product: (typeof PRODUCTS)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6]);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 30 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ marginTop: product.offset }}
    >
      <motion.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX: springRotateX, rotateY: springRotateY, transformPerspective: 1000 }}
        whileHover={{ y: -16, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="group cursor-pointer"
      >
        {/* Color block image area */}
        <div
          className="relative aspect-[3/4] w-full overflow-hidden mb-4"
          style={{ background: product.color }}
        >
          {/* Subtle texture */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 30% 40%, rgba(255,255,255,0.06) 0%, transparent 60%)",
            }}
          />

          {/* Product number — huge background */}
          <div
            className="absolute bottom-0 right-0 font-[family-name:var(--font-anton)] text-[10rem] leading-none opacity-[0.07] select-none translate-x-4 translate-y-4"
            style={{ color: product.textColor }}
          >
            {product.num.replace("#0", "")}
          </div>

          {/* Product number badge */}
          <div
            className="absolute top-4 left-4 text-[9px] tracking-[0.35em] uppercase opacity-50 font-[family-name:var(--font-barlow)]"
            style={{ color: product.textColor }}
          >
            {product.num}
          </div>

          {/* Hover overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.3)" }}
          >
            <span
              className="text-[10px] tracking-[0.4em] uppercase font-[family-name:var(--font-barlow)] font-600 border border-white/60 text-white px-5 py-2.5"
            >
              Quick View
            </span>
          </motion.div>
        </div>

        {/* Info */}
        <div className="px-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm tracking-[0.15em] uppercase font-[family-name:var(--font-barlow)] font-700 text-white leading-tight">
                {product.name}
              </p>
              <p className="text-xs text-white/35 font-[family-name:var(--font-barlow)] mt-1 tracking-wider">
                {product.material}
              </p>
            </div>
            <span className="text-sm font-[family-name:var(--font-barlow)] text-white/70 shrink-0">
              {product.price}
            </span>
          </div>

          {/* Color dots */}
          <div className="flex gap-1.5 mt-3">
            {["#1a1a1a", "#ede9e3", "#8a8580"].map((c) => (
              <div key={c} className="w-3 h-3 rounded-full border border-white/20" style={{ background: c }} />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProductsFashion() {
  return (
    <section id="collection" className="py-28 px-8 md:px-16 bg-[#080808]">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[10px] tracking-[0.5em] uppercase text-white/30 font-[family-name:var(--font-barlow)] mb-3"
            >
              The Collection
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-[family-name:var(--font-anton)] text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-tight text-white"
            >
              SS 2026
              <br />
              <span className="text-white/20">PIECES</span>
            </motion.h2>
          </div>
          <motion.a
            href="#"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="self-start md:self-end text-[10px] tracking-[0.4em] uppercase text-white/40 hover:text-white border-b border-white/20 hover:border-white pb-0.5 transition-all duration-200 font-[family-name:var(--font-barlow)]"
          >
            View All 42 Pieces →
          </motion.a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 items-start">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.num} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
