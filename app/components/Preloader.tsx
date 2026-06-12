"use client";

import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   PRELOADER — self-drawing bear emblem
   ─────────────────────────────────────────────────────────────
   Every path carries pathLength={1}, so dasharray/dashoffset run
   on a normalized 0→1 scale regardless of real geometry length.
   The `bear-path` CSS animation draws the stroke, holds it, fades
   it and rewinds — looping until the page is ready. `--i` staggers
   each path so the emblem appears to be sketched line by line.
═══════════════════════════════════════════════════════════════ */

const GRAD = "url(#bearGrad)";
const SOFT = "rgba(255,255,255,0.45)";

/* d: path data · s: stroke · w: width · i: stagger index */
const PATHS: { d: string; s: string; w: number; i: number }[] = [
  // Hex frame (echoes the navbar monogram)
  { d: "M100 12 L174 55 L174 145 L100 188 L26 145 L26 55 Z", s: "rgba(255,255,255,0.16)", w: 1.2, i: 0 },
  // Head outline
  { d: "M78 52 C64 56 52 70 50 88 C47 116 60 142 84 150 C94 153 106 153 116 150 C140 142 153 116 150 88 C148 70 136 56 122 52 C108 48 92 48 78 52 Z", s: GRAD, w: 2.4, i: 1 },
  // Ears
  { d: "M62 58 C52 48 52 34 64 30 C74 27 82 34 82 44", s: GRAD, w: 2.2, i: 2 },
  { d: "M138 58 C148 48 148 34 136 30 C126 27 118 34 118 44", s: GRAD, w: 2.2, i: 2 },
  // Inner ears
  { d: "M67 47 C64 41 66 36 71 35", s: SOFT, w: 1.6, i: 3 },
  { d: "M133 47 C136 41 134 36 129 35", s: SOFT, w: 1.6, i: 3 },
  // Muzzle
  { d: "M72 120 C72 106 84 100 100 100 C116 100 128 106 128 120 C128 134 116 142 100 142 C84 142 72 134 72 120 Z", s: SOFT, w: 1.8, i: 4 },
  // Nose
  { d: "M91 112 L109 112 L100 122 Z", s: GRAD, w: 2.2, i: 5 },
  // Mouth
  { d: "M100 122 L100 130 M100 130 C96 136 88 136 86 131 M100 130 C104 136 112 136 114 131", s: "rgba(255,255,255,0.55)", w: 1.8, i: 6 },
];

export default function Preloader({ progress }: { progress: number }) {
  const pct = Math.round(progress * 100);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center select-none"
      style={{
        background:
          "radial-gradient(circle at 50% 42%, rgba(255,138,64,0.09) 0%, transparent 52%), #04050e",
      }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      aria-label="Loading"
      role="status"
    >
      {/* Faint contour rings, matching the home backdrop */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900"
        fill="none" preserveAspectRatio="xMidYMid slice">
        {[140, 300, 500, 760].map(r => (
          <circle key={r} cx={720} cy={420} r={r} stroke="rgba(255,255,255,0.022)" strokeWidth="1" />
        ))}
      </svg>

      <motion.div
        className="flex flex-col items-center"
        exit={{ y: -24, opacity: 0, transition: { duration: 0.6, ease: "easeIn" } }}
      >
        {/* Self-drawing bear */}
        <svg width="210" height="210" viewBox="0 0 200 200" fill="none"
          style={{ filter: "drop-shadow(0 0 22px rgba(255,138,64,0.22))" }}>
          <defs>
            <linearGradient id="bearGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffd76a" />
              <stop offset="55%" stopColor="#ff8a40" />
              <stop offset="100%" stopColor="#d85a10" />
            </linearGradient>
          </defs>
          {PATHS.map((p, k) => (
            <path key={k} d={p.d} stroke={p.s} strokeWidth={p.w} pathLength={1}
              strokeLinecap="round" strokeLinejoin="round"
              className="bear-path" style={{ "--i": p.i } as React.CSSProperties} />
          ))}
          {/* Eyes pop in once their lines are drawn */}
          <circle cx="76" cy="86" r="3.2" fill="#ffb060" className="bear-dot"
            style={{ "--i": 5 } as React.CSSProperties} />
          <circle cx="124" cy="86" r="3.2" fill="#ffb060" className="bear-dot"
            style={{ "--i": 5 } as React.CSSProperties} />
        </svg>

        {/* Wordmark */}
        <div className="mt-7 text-[15px] tracking-[0.22em]"
          style={{ fontFamily: "var(--font-anton),sans-serif" }}>
          <span className="logo-grad">CURVED</span>
          <span className="logo-outline">3D</span>
        </div>

        {/* Real progress */}
        <div className="mt-6 flex flex-col items-center gap-2.5">
          <div className="w-[190px] h-[2px] rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.10)" }}>
            <div className="h-full origin-left transition-transform duration-500 ease-out"
              style={{
                transform: `scaleX(${progress})`,
                background: "linear-gradient(90deg, #ffd76a, #ff8a40)",
              }} />
          </div>
          <div className="flex items-center gap-3 text-[9px] tracking-[0.42em] text-white/40"
            style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>
            <span className="loading-dots">LOADING EXPERIENCE</span>
            <span className="text-white/65 tabular-nums">{pct}%</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
