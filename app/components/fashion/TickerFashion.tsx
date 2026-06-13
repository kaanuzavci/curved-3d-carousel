"use client";

import { motion } from "framer-motion";

const ITEMS = [
  "NEW COLLECTION",
  "SS 2026",
  "MINIMAL LUXURY",
  "WEAR THE FUTURE",
  "BOLD IS NEW",
  "URBAN CHIC",
  "FREE SHIPPING",
  "LIMITED PIECES",
];

function TickerContent() {
  return (
    <div className="flex items-center gap-0 shrink-0">
      {ITEMS.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="text-[11px] tracking-[0.3em] uppercase font-[family-name:var(--font-barlow)] font-600 px-6">
            {item}
          </span>
          <span className="text-white/30 text-xs">·</span>
        </span>
      ))}
    </div>
  );
}

export default function TickerFashion({ inverted = false }: { inverted?: boolean }) {
  return (
    <div
      className={`h-10 overflow-hidden flex items-center border-y ${
        inverted
          ? "bg-white text-black border-black/10"
          : "bg-black text-white border-white/10"
      }`}
    >
      <motion.div
        className="flex"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <TickerContent />
        <TickerContent />
      </motion.div>
    </div>
  );
}
