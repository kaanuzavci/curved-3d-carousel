"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

const links = [
  { label: "Menü", href: "#menu" },
  { label: "Hikayemiz", href: "#story" },
  { label: "Rezervasyon", href: "#contact" },
];

export default function Navbar() {
  const { scrollY } = useScroll();
  const bg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(10,8,5,0)", "rgba(10,8,5,0.92)"]
  );
  const blur = useTransform(scrollY, [0, 80], ["blur(0px)", "blur(12px)"]);

  return (
    <motion.header
      style={{ backgroundColor: bg, backdropFilter: blur }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-transparent"
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-medium tracking-[0.2em] uppercase text-[#c9a84c]">
          Kara Kahve
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm tracking-widest uppercase text-[#d4c9b0] hover:text-[#c9a84c] transition-colors duration-300"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase px-5 py-2.5 border border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0805] transition-all duration-300"
        >
          Rezervasyon
        </a>
      </nav>
    </motion.header>
  );
}
