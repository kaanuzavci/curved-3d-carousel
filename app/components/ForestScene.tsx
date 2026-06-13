"use client";

import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   FOREST SCENE — the calm place you surface into after the light.
   ─────────────────────────────────────────────────────────────
   Layered, breathing forest: warm misty sky, drifting god-rays, a
   vine-framed waterfall pouring into a shimmering pool, rising mist,
   floating pollen, and birds that wheel across the canopy — one
   settling onto a branch. Canvas drives the water + particles; SVG
   and CSS carry the foliage, light shafts and birds.
   The render loop sleeps while the scene is off-screen.
═══════════════════════════════════════════════════════════════ */

export default function ForestScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2);

    type Streak = { x: number; y: number; len: number; sp: number; w: number; a: number };
    type Pollen = { x: number; y: number; r: number; sp: number; ph: number; amp: number };
    type Mist = { x: number; y: number; r: number; vy: number; a: number; life: number };
    let streaks: Streak[] = [], pollen: Pollen[] = [], mist: Mist[] = [];

    // waterfall band (fractions of width/height)
    const fallX0 = 0.43, fallX1 = 0.57, fallTop = 0.06, poolY = 0.74;

    const build = () => {
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fw = (fallX1 - fallX0) * W;
      streaks = Array.from({ length: 150 }, () => ({
        x: fallX0 * W + Math.random() * fw,
        y: fallTop * H + Math.random() * (poolY - fallTop) * H,
        len: 40 + Math.random() * 130,
        sp: 620 + Math.random() * 900,
        w: 0.6 + Math.random() * 1.8,
        a: 0.05 + Math.random() * 0.22,
      }));
      pollen = Array.from({ length: 70 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: 0.6 + Math.random() * 2.2, sp: 4 + Math.random() * 14,
        ph: Math.random() * Math.PI * 2, amp: 8 + Math.random() * 26,
      }));
      mist = [];
    };
    build();
    window.addEventListener("resize", build);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(cv);

    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      if (!visible || W === 0) return;
      const t = now / 1000;
      ctx.clearRect(0, 0, W, H);
      const py = poolY * H;

      // ── Waterfall — bright soft band + falling streaks ──
      const fx0 = fallX0 * W, fx1 = fallX1 * W;
      const band = ctx.createLinearGradient(fx0, 0, fx1, 0);
      band.addColorStop(0, "rgba(180,225,230,0)");
      band.addColorStop(0.5, "rgba(220,247,250,0.42)");
      band.addColorStop(1, "rgba(180,225,230,0)");
      ctx.fillStyle = band;
      ctx.fillRect(fx0, fallTop * H, fx1 - fx0, py - fallTop * H);
      // brighter vertical sheet down the middle so it reads as a sheet of water
      const sheet = ctx.createLinearGradient(0, fallTop * H, 0, py);
      sheet.addColorStop(0, "rgba(236,253,255,0.20)");
      sheet.addColorStop(1, "rgba(236,253,255,0.05)");
      ctx.fillStyle = sheet;
      ctx.fillRect((fallX0 + 0.035) * W, fallTop * H, (fallX1 - fallX0 - 0.07) * W, py - fallTop * H);

      ctx.lineCap = "round";
      for (const s of streaks) {
        s.y += s.sp * dt;
        if (s.y - s.len > py) { s.y = fallTop * H - s.len; s.x = fx0 + Math.random() * (fx1 - fx0); }
        const g = ctx.createLinearGradient(0, s.y - s.len, 0, s.y);
        g.addColorStop(0, "rgba(235,252,255,0)");
        g.addColorStop(1, `rgba(240,255,255,${s.a})`);
        ctx.strokeStyle = g; ctx.lineWidth = s.w;
        ctx.beginPath(); ctx.moveTo(s.x, s.y - s.len); ctx.lineTo(s.x + Math.sin(t + s.y) * 1.5, s.y); ctx.stroke();
      }

      // ── Mist at the base of the fall — a soft drifting veil, not a blob ──
      if (mist.length < 55) {
        for (let i = 0; i < 2; i++) mist.push({
          x: fx0 + Math.random() * (fx1 - fx0), y: py + (Math.random() - 0.5) * 30,
          r: 22 + Math.random() * 46, vy: -10 - Math.random() * 22, a: 0, life: 0,
        });
      }
      ctx.globalCompositeOperation = "screen";
      for (let i = mist.length - 1; i >= 0; i--) {
        const m = mist[i];
        m.life += dt; m.y += m.vy * dt; m.x += Math.sin(t * 0.5 + i) * 9 * dt; m.r += 20 * dt;
        m.a = Math.sin(Math.min(m.life / 2.6, 1) * Math.PI) * 0.09;
        if (m.life > 2.6) { mist.splice(i, 1); continue; }
        const mg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
        mg.addColorStop(0, `rgba(220,240,238,${m.a})`);
        mg.addColorStop(1, "rgba(220,240,238,0)");
        ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // ── Pool — shimmering horizontal light ──
      const pool = ctx.createLinearGradient(0, py, 0, H);
      pool.addColorStop(0, "rgba(40,80,72,0.0)");
      pool.addColorStop(0.25, "rgba(28,66,60,0.55)");
      pool.addColorStop(1, "rgba(8,26,24,0.85)");
      ctx.fillStyle = pool; ctx.fillRect(0, py, W, H - py);
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 7; i++) {
        const yy = py + 12 + i * ((H - py) / 8);
        const a = 0.05 + 0.05 * Math.sin(t * 1.3 + i);
        ctx.strokeStyle = `rgba(190,240,235,${Math.max(a, 0)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 14) {
          const yo = Math.sin(x * 0.02 + t * 1.6 + i) * (2 + i);
          x === 0 ? ctx.moveTo(x, yy + yo) : ctx.lineTo(x, yy + yo);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";

      // ── Floating pollen / dust motes ──
      ctx.globalCompositeOperation = "screen";
      for (const p of pollen) {
        p.y -= p.sp * dt;
        const x = p.x + Math.sin(t * 0.5 + p.ph) * p.amp;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        const a = 0.25 + 0.35 * Math.sin(t * 1.5 + p.ph);
        ctx.fillStyle = `rgba(255,238,180,${Math.max(a, 0) * 0.5})`;
        ctx.beginPath(); ctx.arc(x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(tick);

    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", build); };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky — warm canopy light fading to mossy depth */}
      <div className="absolute inset-0" style={{
        background:
          "linear-gradient(180deg,#cfe6b8 0%,#9fce93 14%,#5fa377 34%,#2f7459 55%,#16493c 78%,#08251f 100%)",
      }} />
      {/* Distant haze glow behind the fall */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(60% 55% at 50% 30%, rgba(255,247,205,0.55) 0%, rgba(255,247,205,0) 60%)",
      }} />

      {/* God-ray light shafts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ mixBlendMode: "screen" }}>
        <div className="forest-rays absolute -top-1/4 left-1/2 h-[150%] w-[140%] -translate-x-1/2" style={{
          background:
            "repeating-linear-gradient(102deg, rgba(255,248,210,0) 0px, rgba(255,248,210,0) 46px, rgba(255,248,210,0.10) 60px, rgba(255,248,210,0.16) 70px, rgba(255,248,210,0) 96px)",
        }} />
        <div className="forest-rays-2 absolute -top-1/4 left-1/2 h-[150%] w-[140%] -translate-x-1/2" style={{
          background:
            "repeating-linear-gradient(96deg, rgba(210,255,220,0) 0px, rgba(210,255,220,0) 80px, rgba(210,255,220,0.08) 96px, rgba(210,255,220,0) 130px)",
        }} />
      </div>

      {/* Distant tree-line silhouette */}
      <svg className="absolute inset-x-0 top-0 w-full h-[62%] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1200 600" fill="none">
        <g fill="rgba(10,40,30,0.5)">
          <path d="M0 600 V300 q40-70 90-40 q20-90 70-70 q30-80 80-30 q40-50 90 10 V600Z" />
          <path d="M1200 600 V320 q-50-80-100-40 q-30-90-90-50 q-40-70-100-10 V600Z" />
        </g>
      </svg>

      {/* Water canvas (waterfall, mist, pool, pollen) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Wet rock walls framing the fall — soft, mossy edges */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[34%] pointer-events-none" style={{
        background: "linear-gradient(90deg, rgba(6,30,22,0.55) 0%, rgba(6,30,22,0) 26%, rgba(6,30,22,0) 74%, rgba(6,30,22,0.55) 100%)",
        filter: "blur(2px)",
      }} />

      {/* Flying birds wheeling across the canopy */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="bird bird-1"><Wing /></span>
        <span className="bird bird-2"><Wing /></span>
        <span className="bird bird-3"><Wing /></span>
      </div>

      {/* Hanging vines + a foreground branch with a perched bird */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1200 700" fill="none">
        {/* left vines */}
        <g stroke="rgba(8,38,26,0.92)" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M40 -20 C 80 120, 20 220, 70 360 S 30 520, 90 700" />
          <path d="M120 -20 C 150 90, 110 200, 150 320" />
        </g>
        {/* right vines */}
        <g stroke="rgba(8,38,26,0.92)" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M1160 -20 C 1120 110, 1180 230, 1130 380 S 1170 540, 1110 700" />
          <path d="M1075 -20 C 1050 100, 1090 210, 1055 330" />
        </g>
        {/* foreground top branch */}
        <path d="M-10 70 C 220 40, 420 96, 560 70" stroke="rgba(6,30,20,0.96)" strokeWidth="11" strokeLinecap="round" fill="none" />
        {/* leaves on vines */}
        <g fill="rgba(20,70,44,0.95)">
          {LEAVES.map((l, i) => (
            <ellipse key={i} cx={l.x} cy={l.y} rx={l.r} ry={l.r * 0.5} transform={`rotate(${l.a} ${l.x} ${l.y})`} />
          ))}
        </g>
        {/* perched bird on the branch */}
        <g className="perched" transform="translate(470 70)">
          <ellipse cx="0" cy="-7" rx="9" ry="6" fill="#10221b" />
          <circle cx="7" cy="-12" r="4" fill="#10221b" />
          <path d="M10 -13 l6 -1 l-5 3 Z" fill="#caa23a" />
          <path d="M-7 -6 l-12 4 l11 -1 Z" fill="#0a1813" />
        </g>
      </svg>

      {/* Edge vignette + bottom moss for depth */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(120% 100% at 50% 42%, transparent 52%, rgba(2,14,10,0.66) 100%)",
      }} />

      <style>{`
        @keyframes rayDrift { 0%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-48%) translateY(-12px)} 100%{transform:translateX(-50%) translateY(0)} }
        .forest-rays{ animation: rayDrift 13s ease-in-out infinite; opacity:.9 }
        .forest-rays-2{ animation: rayDrift 19s ease-in-out infinite reverse; opacity:.7 }
        @keyframes flap { 0%,100%{ transform: scaleY(1) } 50%{ transform: scaleY(0.35) } }
        .bird{ position:absolute; top:0; left:0; color:#13261d; line-height:0; will-change: transform; }
        .bird .wing{ animation: flap .42s ease-in-out infinite; transform-origin:center; }
        @keyframes fly1 { 0%{transform:translate(-8vw,26vh) scale(.7)} 50%{transform:translate(52vw,12vh) scale(1)} 100%{transform:translate(112vw,22vh) scale(.8)} }
        @keyframes fly2 { 0%{transform:translate(110vw,18vh) scale(.55)} 100%{transform:translate(-10vw,30vh) scale(.85)} }
        @keyframes fly3 { 0%{transform:translate(-10vw,40vh) scale(.5)} 100%{transform:translate(114vw,30vh) scale(.7)} }
        .bird-1{ animation: fly1 17s linear infinite; }
        .bird-2{ animation: fly2 23s linear infinite 4s; }
        .bird-3{ animation: fly3 29s linear infinite 9s; }
        @keyframes twitch { 0%,92%,100%{ transform: rotate(0) } 95%{ transform: rotate(-6deg) } }
        .perched{ transform-box: fill-box; transform-origin: 50% 100%; animation: twitch 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .bird,.forest-rays,.forest-rays-2,.perched{ animation: none } }
      `}</style>
    </div>
  );
}

function Wing() {
  return (
    <svg width="30" height="14" viewBox="0 0 30 14" fill="none">
      <g className="wing">
        <path d="M1 12 C 8 2, 12 2, 15 7 C 18 2, 22 2, 29 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

const LEAVES = [
  { x: 64, y: 150, r: 16, a: 30 }, { x: 84, y: 250, r: 18, a: -20 }, { x: 70, y: 360, r: 15, a: 40 },
  { x: 150, y: 200, r: 14, a: -35 }, { x: 132, y: 300, r: 13, a: 25 },
  { x: 1132, y: 170, r: 16, a: -30 }, { x: 1118, y: 280, r: 18, a: 22 }, { x: 1140, y: 380, r: 15, a: -40 },
  { x: 1058, y: 220, r: 14, a: 35 }, { x: 1075, y: 320, r: 13, a: -22 },
  { x: 180, y: 78, r: 15, a: 14 }, { x: 320, y: 70, r: 17, a: -10 }, { x: 460, y: 80, r: 15, a: 18 },
];
