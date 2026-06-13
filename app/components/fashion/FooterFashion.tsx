"use client";

import { motion } from "framer-motion";

const LINKS = {
  Shop: ["New Arrivals", "Women", "Men", "Accessories", "Sale"],
  Info: ["About", "Sustainability", "Careers", "Press"],
  Help: ["Sizing Guide", "Returns", "Shipping", "Contact"],
};

export default function FooterFashion() {
  return (
    <footer id="contact" className="bg-black border-t border-white/[0.06]">
      {/* Top — newsletter */}
      <div className="border-b border-white/[0.06] px-8 md:px-16 py-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h3 className="font-[family-name:var(--font-anton)] text-[clamp(2rem,5vw,4rem)] text-white leading-none">
              STAY IN THE LOOP
            </h3>
            <p className="text-xs text-white/30 tracking-wider uppercase font-[family-name:var(--font-barlow)] mt-2">
              Early access to new drops. No spam.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full md:w-auto md:min-w-[360px] border border-white/20 group focus-within:border-white/50 transition-colors duration-300"
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-transparent px-5 py-4 text-sm text-white placeholder:text-white/25 outline-none font-[family-name:var(--font-barlow)] tracking-wider"
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              className="px-6 text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-barlow)] font-600 text-black bg-white hover:bg-white/90 transition-colors duration-200"
            >
              Join
            </motion.button>
          </form>
        </div>
      </div>

      {/* Middle — links */}
      <div className="px-8 md:px-16 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <p className="font-[family-name:var(--font-anton)] text-2xl text-white mb-6 tracking-wider">
              URBAN<br />CHIC
            </p>
            <p className="text-[10px] tracking-wider text-white/25 uppercase font-[family-name:var(--font-barlow)] leading-relaxed max-w-[160px]">
              Fashion that speaks before you do.
            </p>
          </div>
          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category}>
              <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 font-[family-name:var(--font-barlow)] mb-5">
                {category}
              </p>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-xs tracking-wider text-white/50 hover:text-white transition-colors duration-200 font-[family-name:var(--font-barlow)] uppercase"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/[0.06] px-8 md:px-16 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[9px] tracking-[0.3em] uppercase text-white/20 font-[family-name:var(--font-barlow)]">
            © 2026 Urban Chic. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["IG", "TT", "TW", "PH"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-[9px] tracking-[0.3em] uppercase text-white/20 hover:text-white/60 transition-colors duration-200 font-[family-name:var(--font-barlow)]"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
