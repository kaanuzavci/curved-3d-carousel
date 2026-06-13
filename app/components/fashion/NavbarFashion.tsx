"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const NAV = ["Collection", "Editorial", "About", "Contact"];

export default function NavbarFashion() {
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 60], [0, 1]);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        style={{ borderBottomColor: `rgba(255,255,255,${borderOpacity})` }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 border-b border-transparent mix-blend-difference"
      >
        <Link
          href="/"
          className="font-[family-name:var(--font-anton)] text-xl tracking-[0.15em] text-white uppercase"
        >
          Urban Chic
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {NAV.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs tracking-[0.25em] uppercase text-white/80 hover:text-white transition-colors duration-200 font-[family-name:var(--font-barlow)] font-600"
            >
              {item}
            </a>
          ))}
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-1"
          aria-label="Menu"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block w-6 h-px bg-white"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-6 h-px bg-white"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block w-6 h-px bg-white"
          />
        </button>
      </motion.header>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-8 md:hidden pointer-events-none"
        style={{ pointerEvents: menuOpen ? "auto" : "none" }}
      >
        {NAV.map((item, i) => (
          <motion.a
            key={item}
            href={`#${item.toLowerCase()}`}
            onClick={() => setMenuOpen(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={menuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: i * 0.06 }}
            className="font-[family-name:var(--font-anton)] text-5xl text-white tracking-wider uppercase"
          >
            {item}
          </motion.a>
        ))}
      </motion.div>
    </>
  );
}
