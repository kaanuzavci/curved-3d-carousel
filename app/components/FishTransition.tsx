"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Lottie from "./Lottie";

/* ═══════════════════════════════════════════════════════════════
   FISH TRANSITION — the self-running underwater stretch that, as you
   scroll, surfaces from gloom into a lit reef.
   ─────────────────────────────────────────────────────────────
   · The fish live on their own (NOT scroll-driven): schools drift
     across both ways carrying firefly-soft glows, masked to that
     glow so the comp's weeds stay hidden; a jumping fish breaches at
     random spots and drops a surface ripple where it dives.
   · SCROLL reveals the world: the full water scene (background_water)
     fades in behind everything and the tunnel opens up, so the lit
     fish and the colourful foreground corals are seen in ever more
     light. A custom bubble cursor belongs to this environment.
═══════════════════════════════════════════════════════════════ */

// underwater bubble cursor (hotspot at its centre)
const BUBBLE_CURSOR =
  "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='34'%20height='34'%20viewBox='0%200%2034%2034'%3E%3Ccircle%20cx='17'%20cy='17'%20r='11'%20fill='%237bd7f5'%20fill-opacity='0.16'%20stroke='%23a5ebff'%20stroke-opacity='0.92'%20stroke-width='2'/%3E%3Ccircle%20cx='17'%20cy='17'%20r='15'%20fill='none'%20stroke='%2396e1ff'%20stroke-opacity='0.32'%20stroke-width='1'/%3E%3Ccircle%20cx='12.5'%20cy='12'%20r='3'%20fill='%23ffffff'%20fill-opacity='0.9'/%3E%3C/svg%3E\") 17 17, auto";

// soft ellipse that both lights the water and clips a fish comp
const BUBBLE_MASK =
  "radial-gradient(ellipse 50% 58% at 50% 50%, #000 0%, #000 32%, rgba(0,0,0,0.35) 58%, transparent 74%)";

// drifting glow motes — fixed values so SSR and client agree
const MOTES = [
  { x: 18, y: 30, d: 9, delay: 0, dx: "6vw", dy: "-7vh" },
  { x: 72, y: 22, d: 12, delay: 2, dx: "-5vw", dy: "8vh" },
  { x: 40, y: 64, d: 10, delay: 4, dx: "7vw", dy: "5vh" },
  { x: 85, y: 55, d: 13, delay: 1, dx: "-6vw", dy: "-6vh" },
  { x: 9, y: 70, d: 11, delay: 3, dx: "5vw", dy: "-5vh" },
  { x: 58, y: 38, d: 14, delay: 5, dx: "-7vw", dy: "6vh" },
];

type FishUnit = { dir: "Right" | "Left"; top: string; width: string; dur: number; delay: number };
const SCHOOLS: FishUnit[] = [
  { dir: "Right", top: "26%", width: "min(880px,72vw)", dur: 34, delay: 0 },
  { dir: "Left", top: "54%", width: "min(960px,80vw)", dur: 42, delay: 6 },
  { dir: "Right", top: "70%", width: "min(700px,58vw)", dur: 48, delay: 16 },
];

function School({ unit, active }: { unit: FishUnit; active: boolean }) {
  return (
    <div
      className="absolute inset-x-0 pointer-events-none"
      style={{ top: unit.top, animation: `swim${unit.dir} ${unit.dur}s linear infinite`, animationDelay: `${unit.delay}s` }}
    >
      <div className="relative mx-auto" style={{ width: unit.width, aspectRatio: "1600 / 615" }}>
        {/* the firefly-soft light the shoal carries */}
        <div
          className="ft-glow absolute inset-[-24%]"
          style={{
            background:
              "radial-gradient(ellipse 48% 54% at 50% 50%, rgba(80,185,215,0.42) 0%, rgba(45,130,170,0.18) 42%, transparent 72%)",
            filter: "blur(10px)",
            animationDelay: `${unit.delay * 0.7}s`,
          }}
        />
        <Lottie
          path="/cards/fishes.json"
          play={active}
          speed={1}
          className="absolute inset-0 w-full h-full"
          style={{
            WebkitMaskImage: BUBBLE_MASK,
            maskImage: BUBBLE_MASK,
            transform: unit.dir === "Left" ? "scaleX(-1)" : undefined,
          }}
        />
      </div>
    </div>
  );
}

export default function FishTransition() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  // SCROLL surfaces the world (the fish themselves stay autonomous).
  // We compute the pinned-progress ourselves from the section's position —
  // monotonic 0→1 over the sticky range — instead of useScroll, which misread
  // this last, sticky-tall section as a 0→1→0 bell.
  const p = useMotionValue(0);
  const bgOpacity = useTransform(p, [0.16, 0.58], [0, 1]);
  const bgScale = useTransform(p, [0.16, 1], [1.18, 1]);
  const lightOpacity = useTransform(p, [0.3, 0.78], [0, 0.5]);
  const coralOpacity = useTransform(p, [0.24, 0.68], [0.45, 1]);
  const vignetteOpacity = useTransform(p, [0.2, 0.64], [1, 0.42]);
  const edgeBlurOpacity = useTransform(p, [0.2, 0.6], [1, 0.45]);
  // the closing words rise up OVER the lit reef at the end — the scene never
  // goes back to darkness and the page doesn't grow a separate footer
  const closeOpacity = useTransform(p, [0.76, 0.94], [0, 1]);
  const closeY = useTransform(p, [0.76, 1], ["56px", "0px"]);
  const closeScrim = useTransform(p, [0.72, 0.96], [0, 1]);

  // a single jumping fish that relocates between breaches
  const [jump, setJump] = useState({ key: 0, x: 50, y: 34 });
  const jumpRef = useRef(jump);
  jumpRef.current = jump;
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // drive the reveal from the section's own pinned-progress
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const span = rect.height - window.innerHeight; // scroll distance while pinned
      const prog = span > 0 ? -rect.top / span : 0;
      p.set(Math.max(0, Math.min(1, prog)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [p]);

  // when a breach finishes: drop a ripple where it dove, then breach again
  // somewhere else after a short, random pause
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onBreachDone = () => {
    const { x, y } = jumpRef.current;
    const id = Date.now() + Math.random();
    setRipples((r) => [...r, { id, x, y: y + 16 }]);
    setTimeout(() => setRipples((r) => r.filter((p) => p.id !== id)), 2300);
    timeoutRef.current = setTimeout(() => {
      setJump((j) => ({ key: j.key + 1, x: 14 + Math.random() * 72, y: 24 + Math.random() * 24 }));
    }, 2400 + Math.random() * 3400);
  };
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  return (
    <section id="deep" ref={sectionRef} className="relative h-[320dvh]">
      <div className="ft-env sticky top-0 h-dvh overflow-hidden bg-[#02060c]">
        {/* full water scene — surfaces from the dark as you scroll */}
        <motion.div className="absolute inset-0" style={{ opacity: bgOpacity, scale: bgScale }}>
          <Lottie path="/cards/background_water.json" fit="slice" play={active} className="w-full h-full" />
        </motion.div>

        {/* growing ambient light from above as the world opens up */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: lightOpacity,
            mixBlendMode: "screen",
            background: "radial-gradient(120% 80% at 50% -6%, rgba(120,205,235,0.55) 0%, rgba(60,140,180,0.16) 38%, transparent 70%)",
          }}
        />

        {/* colourful foreground corals — in front of the scene, lit ever more */}
        <motion.svg
          className="absolute bottom-0 inset-x-0 w-full pointer-events-none"
          viewBox="0 0 1440 320"
          preserveAspectRatio="xMidYMax slice"
          style={{ height: "46%", opacity: coralOpacity, filter: "blur(0.3px)" }}
        >
          <g>
            {/* orange fan */}
            <path d="M180 320 C150 230 120 210 150 150 C175 195 185 150 200 130 C205 175 230 150 250 175 C235 215 250 240 235 320 Z" fill="#e06a2e" opacity="0.82" />
            {/* teal branching */}
            <path d="M470 320 C470 250 440 240 455 190 M470 250 C500 235 505 205 520 200 M470 280 C445 270 430 250 415 252" stroke="#23b3b3" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.8" />
            {/* purple polyps */}
            <g fill="#9a55d8" opacity="0.78">
              <ellipse cx="760" cy="300" rx="14" ry="34" />
              <ellipse cx="790" cy="305" rx="11" ry="26" />
              <ellipse cx="730" cy="306" rx="10" ry="22" />
            </g>
            {/* magenta fan */}
            <path d="M1010 320 C985 245 1015 215 1000 165 C1030 190 1035 160 1055 150 C1055 195 1085 175 1100 200 C1080 240 1095 270 1085 320 Z" fill="#d8447f" opacity="0.78" />
            {/* gold sea-grass */}
            <path d="M1270 320 C1265 250 1280 230 1272 180 M1295 320 C1300 255 1288 235 1300 185 M1248 320 C1245 260 1255 245 1248 205" stroke="#e6b048" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.78" />
          </g>
        </motion.svg>

        {/* firefly-like motes drifting in the gloom */}
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="ft-mote absolute rounded-full pointer-events-none"
            style={{
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: 4,
              height: 4,
              background: "radial-gradient(circle, rgba(150,230,255,0.95) 0%, rgba(90,190,225,0) 70%)",
              ["--dx" as string]: m.dx,
              ["--dy" as string]: m.dy,
              animationDuration: `${m.d}s`,
              animationDelay: `${m.delay}s`,
            }}
          />
        ))}

        {/* schools swimming both ways, each lit by its own glow */}
        {SCHOOLS.map((u, i) => (
          <School key={i} unit={u} active={active} />
        ))}

        {/* the breaching jumping fish (lit), relocating between jumps */}
        <div
          className="absolute pointer-events-none"
          style={{ left: `${jump.x}%`, top: `${jump.y}%`, transform: "translate(-50%,-50%)" }}
        >
          <div className="relative" style={{ width: "min(260px,40vw)", aspectRatio: "1 / 1" }}>
            <div
              key={`g${jump.key}`}
              className="ft-jump-glow absolute inset-[-30%]"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(95,200,230,0.5) 0%, rgba(50,140,180,0.2) 45%, transparent 72%)",
                filter: "blur(8px)",
              }}
            />
            <Lottie
              key={jump.key}
              path="/cards/jumping_fish.json"
              loop={false}
              play={active}
              onComplete={onBreachDone}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>

        {/* surface ripples left where the fish dove back in */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="ft-ripple absolute pointer-events-none"
            style={{ left: `${r.x}%`, top: `${r.y}%` }}
          />
        ))}

        {/* blurred tunnel edges — relax as the world opens up */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: edgeBlurOpacity,
            backdropFilter: "blur(9px)",
            WebkitBackdropFilter: "blur(9px)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 64% at 50% 50%, transparent 32%, #000 78%)",
            maskImage: "radial-gradient(ellipse 60% 64% at 50% 50%, transparent 32%, #000 78%)",
          }}
        />
        {/* dark vignette closing the tunnel in — lightens as you descend */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: vignetteOpacity,
            background:
              "radial-gradient(ellipse 72% 78% at 50% 50%, transparent 28%, rgba(2,6,12,0.72) 64%, #010409 100%)",
          }}
        />

        {/* ── Closing — rises up OVER the lit reef, no extra page, no fade to black ── */}
        <motion.div className="absolute inset-0 flex flex-col justify-end" style={{ opacity: closeOpacity }}>
          {/* gentle deep-blue scrim (NOT black) so the words read while the reef stays visible */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: closeScrim,
              background: "linear-gradient(180deg, transparent 34%, rgba(3,18,34,0.42) 72%, rgba(3,18,34,0.72) 100%)",
            }}
          />
          <motion.div className="relative w-full px-6 pb-[clamp(40px,8vh,96px)] text-center" style={{ y: closeY }}>
            <h2
              className="text-white leading-[0.95]"
              style={{
                fontSize: "clamp(40px,7vw,104px)",
                fontFamily: "var(--font-anton),sans-serif",
                letterSpacing: "0.04em",
                textShadow: "0 6px 40px rgba(0,0,0,0.55)",
              }}
            >
              DIVE<br />BACK IN
            </h2>
            <p
              className="mx-auto mt-6 max-w-xl text-white/75"
              style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 300, fontSize: "clamp(13px,1.6vw,17px)", textShadow: "0 2px 18px rgba(0,0,0,0.6)" }}
            >
              A passion-built playground of favourite characters and dreamlike worlds — rendered in real-time 3D, just for the love of it.
            </p>
            <a
              href="#top"
              className="group pointer-events-auto mt-9 inline-flex items-center gap-3 rounded-full border border-white/30 px-9 py-4 text-white transition-colors duration-300 hover:border-white/80"
              style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600, letterSpacing: "0.22em", fontSize: 12, backdropFilter: "blur(2px)" }}
            >
              BACK TO TOP
              <span className="transition-transform duration-300 group-hover:-translate-y-1">↑</span>
            </a>
            <div className="mx-auto mt-10 flex max-w-5xl flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 md:flex-row">
              <p className="text-white/80" style={{ fontFamily: "var(--font-anton),sans-serif", letterSpacing: "0.18em", fontSize: 14 }}>CURVED 3D</p>
              <p className="text-[11px] tracking-[0.18em] text-white/45">© 2026 — A HOBBY BUILD, MADE FOR FUN</p>
              <div className="flex gap-7">
                {["X", "INSTAGRAM", "ARTSTATION"].map((s) => (
                  <a key={s} href="#" className="text-[10px] tracking-[0.22em] text-white/45 transition-colors duration-300 hover:text-white" style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>{s}</a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .ft-env, .ft-env * { cursor: ${BUBBLE_CURSOR} !important; }
        @keyframes swimRight { from { transform: translateX(-74vw) } to { transform: translateX(74vw) } }
        @keyframes swimLeft  { from { transform: translateX(74vw) }  to { transform: translateX(-74vw) } }
        @keyframes ftGlow { 0%,100% { opacity: .8; transform: scale(1) } 50% { opacity: 1; transform: scale(1.05) } }
        .ft-glow { animation: ftGlow 3.4s ease-in-out infinite; }
        @keyframes ftMote { 0% { transform: translate(0,0); opacity: 0 } 18% { opacity: 1 } 82% { opacity: 1 } 100% { transform: translate(var(--dx), var(--dy)); opacity: 0 } }
        .ft-mote { animation-name: ftMote; animation-timing-function: ease-in-out; animation-iteration-count: infinite; filter: drop-shadow(0 0 6px rgba(150,230,255,0.8)); }
        @keyframes ftJumpGlow { 0% { opacity: 0; transform: scale(.7) } 30% { opacity: 1 } 70% { opacity: .9 } 100% { opacity: 0; transform: scale(1.1) } }
        .ft-jump-glow { animation: ftJumpGlow 1.7s ease-out; }
        @keyframes ftRipple { from { width: 8px; height: 5px; opacity: .55 } to { width: 150px; height: 84px; opacity: 0 } }
        .ft-ripple { transform: translate(-50%,-50%); border-radius: 50%; border: 1.5px solid rgba(150,225,245,0.5); box-shadow: 0 0 14px rgba(120,210,240,0.35); animation: ftRipple 2.2s ease-out forwards; }
        @media (prefers-reduced-motion: reduce){
          .ft-glow, .ft-mote, .ft-jump-glow { animation: none }
          [style*="swimRight"], [style*="swimLeft"] { animation: none !important }
        }
      `}</style>
    </section>
  );
}
