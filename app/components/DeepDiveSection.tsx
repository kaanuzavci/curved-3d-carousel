"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from "framer-motion";
import CardPrism from "./CardPrism";
import ForestScene from "./ForestScene";
import AmbientSound from "./AmbientSound";

/* ═══════════════════════════════════════════════════════════════
   DEEP DIVE — one-viewport scroll section below the hero
   ─────────────────────────────────────────────────────────────
   · Background: a WebGL water shader (fbm waves + caustics) that
     ripples around the pointer and zooms in with scroll progress,
     selling the "sinking into the page" feeling.
   · Foreground: design cards stream in alternately from the left
     and right edges as you scroll deeper, each on its own
     staggered progress window.
   Rendering pauses entirely while the section is off-screen.
═══════════════════════════════════════════════════════════════ */

/* Each card crosses the screen one at a time on its own diagonal:
   from → to are start/end offsets (vw, vh) measured from screen centre,
   so the card flies in from one edge and exits the opposite one.        */
const DIVE_CARDS = [
  { img: "/cards/otherside.jpg", title: "OTHERSIDE", cat: "GAMES", from: [-70, -46], to: [70, 46] }, // top-left → bottom-right
  { img: "/cards/nexus.jpg", title: "NEXUS", cat: "MARKETPLACE", from: [70, -46], to: [-70, 46] }, // top-right → bottom-left
  { img: "/cards/forge.jpg", title: "FORGE", cat: "STUDIO", from: [0, -52], to: [0, 52] }, // top-centre → bottom-centre
  { img: "/cards/void.jpg", title: "VOID", cat: "DEFI", from: [-70, 46], to: [70, -46] }, // bottom-left → top-right
  { img: "/cards/surge.jpg", title: "SURGE", cat: "LAUNCHPAD", from: [70, 46], to: [-70, -46] }, // bottom-right → top-left
  { img: "/cards/arc.jpg", title: "ARC", cat: "BRIDGE", from: [-74, 0], to: [74, 0] }, // left → right across centre
] as const;

const NCLICK = 6; // max simultaneous click ripples (must match the shader #define)

const VERT = `varying vec2 vUv;
void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;

const FRAG = `precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;     // 0..1, smoothed in JS
uniform vec2 uMouseDir;  // normalized pointer travel direction
uniform float uMouseSpeed; // 0..1 smoothed pointer speed
#define NCLICK 6
uniform vec2 uClickPos[NCLICK]; // recent click positions 0..1
uniform float uClickAge[NCLICK]; // seconds since each click
uniform float uZoom;     // scroll progress 0..1
uniform vec2 uRes;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),
             mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);
}
float fbm(vec2 p){
  float v=0., a=.5;
  for(int k=0;k<4;k++){ v+=a*noise(p); p=p*2.03+vec2(17.0); a*=.5; }
  return v;
}
void main(){
  float aspect = uRes.x/uRes.y;
  float zoom = 1. + uZoom*0.9;            // scroll dives into the water
  vec2 p = (vUv-.5)*vec2(aspect,1.)/zoom;
  vec2 m = (uMouse-.5)*vec2(aspect,1.)/zoom;

  // Pointer disturbance — a soft swell that sits ON the cursor and tapers
  // into a short tail that both narrows and shrinks behind the travel
  // direction (a teardrop / comet). It only refracts the water, no bands.
  // At rest it is a small round dimple; moving stretches the tail out.
  vec2 rel = p - m;
  float d = length(rel);
  vec2 nrel = rel / (d + 1e-4);
  vec2 dir = uMouseDir;
  vec2 perpDir = vec2(-dir.y, dir.x);
  float along = dot(rel, dir);                       // + ahead of motion
  float perp  = dot(rel, perpDir);                   // sideways from the path
  float front = max(along, 0.0), back = max(-along, 0.0);
  float widthK = 240.0 + back*back*2600.0;           // a soft, gooey blob; tail not too thin
  float backReach = 30.0 + (1.0 - uMouseSpeed)*230.0;// stretches a little longer behind when fast
  float env = exp(-perp*perp*widthK) * exp(-front*front*300.0) * exp(-back*back*backReach);
  // One cohesive slime bulge — no rings, no detached tail. It DRAGS the water
  // it passes through along the travel direction (stretching the pattern like
  // goo) and releases it behind, plus a small radial bulge. Fades when still.
  float slime = env * uMouseSpeed;
  vec2 refr = (-dir*0.85 + nrel*0.30) * slime * 0.13;

  // Click ripples — each left-click drops onto the surface and sends a
  // few concentric rings expanding outward, fading over ~2s. Several can
  // run at once, so new clicks don't cancel earlier ripples.
  float drop = 0.0;
  for (int i = 0; i < NCLICK; i++) {
    float age = uClickAge[i];
    vec2 cpos = (uClickPos[i]-.5)*vec2(aspect,1.)/zoom;
    float dc = length(p - cpos);
    vec2 ncl = (p - cpos) / (dc + 1e-4);
    float cfront = age * 0.4;                          // smaller rings: slower wavefront growth
    float ring = sin(dc*34.0 - age*9.0);               // crests
    float band = exp(-pow(dc - cfront, 2.0) * 16.0);   // tighter → a few small rings near the front
    float cdecay = exp(-age*1.5) * smoothstep(0.0, 0.14, age); // gentle ease-in, not an instant pop
    float dd = ring * band * cdecay;
    drop += dd;
    refr += ncl * dd * 0.05;
  }

  // ── Living water surface ─────────────────────────────────────────────
  // Sample the wave field THROUGH the pointer/click refraction so the whole
  // surface (not only the bright caustics) bends, shades and shimmers.
  float t = uTime*0.12;
  vec2 fp = p + refr;
  float h  = fbm(fp*2.6 + vec2(t, t*0.7));
  float h2 = fbm(fp*4.2 - vec2(t*0.8, -t*0.5) + h*0.9);
  float surf = h*0.6 + h2*0.4;

  // cheap surface normal → glossy, jelly-like shading that lives everywhere
  float e = 0.02;
  float hx = fbm((fp+vec2(e,0.))*2.6 + vec2(t, t*0.7));
  float hy = fbm((fp+vec2(0.,e))*2.6 + vec2(t, t*0.7));
  vec3 nrm = normalize(vec3((h-hx)/e*0.5, (h-hy)/e*0.5, 1.0));
  vec3 L  = normalize(vec3(0.35, 0.45, 0.82));
  float diff = clamp(dot(nrm, L), 0.0, 1.0);
  vec3 Hv = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(nrm, Hv), 0.0), 26.0);

  // Caustic light webs (sampled through the same refracted/wavy coords)
  vec2 q = fp + vec2(h-.5, h2-.5)*0.22;
  float c1 = abs(sin((q.x+q.y)*7.0 + uTime*0.55));
  float c2 = abs(sin((q.x-q.y)*6.3 - uTime*0.42));
  float caustic = pow(c1*c2, 4.0);

  // broad, slow jelly sheen + a finer drifting detail layer so the calm
  // surface reads as deep, wet water rather than a flat dark panel.
  float jelly = fbm(fp*1.5 - vec2(uTime*0.05, uTime*0.035));
  float fine  = fbm(fp*6.0 + vec2(uTime*0.09, -uTime*0.07));

  vec3 deep = vec3(0.012,0.035,0.075);
  vec3 mid  = vec3(0.025,0.11,0.17);
  vec3 col = mix(deep, mid, smoothstep(0.05,0.95,surf));
  col *= 0.55 + 0.5*diff;                                        // waves shade the WHOLE surface (calmer)
  col += vec3(0.02,0.07,0.11) * smoothstep(0.35,0.95,jelly);     // slow jelly glow
  col += vec3(0.02,0.06,0.09) * (fine - 0.5);                    // fine watery detail / depth
  col += vec3(0.45,0.80,1.0) * spec * 0.22;                      // glossy highlights (toned down)
  col += vec3(0.10,0.55,0.62) * caustic * 0.36;                  // teal caustics
  col += vec3(0.4,0.72,0.88) * slime * 0.10;                    // faint wet sheen on the slime bulge
  col += vec3(0.55,0.82,1.0) * abs(drop) * 0.30;                 // light on the click ripple rings

  // Edges darken further the deeper you go
  float r2 = dot(p*zoom, p*zoom);
  col *= 1.0 - r2*(0.50 + uZoom*0.35);
  gl_FragColor = vec4(col, 1.0);
}`;

function DiveCard({ prog, img, title, cat, from, to, i, total }: {
  prog: MotionValue<number>; img: string; title: string; cat: string;
  from: readonly [number, number]; to: readonly [number, number];
  i: number; total: number;
}) {
  /* The title holds the screen alone through the intro, then cards cross
     ONE AT A TIME: each gets its own sequential slot with only a little
     overlap, so a fresh card appears as the previous one slides out. */
  const intro = 0.08;                       // title-only stretch first
  const cardsEnd = 0.38;                     // cards clear out, then the cube takes the stage
  const slot = (cardsEnd - intro) / total;   // each card's exclusive turn
  const span = slot * 1.85;                  // longer crossing so cards drift across slowly
  const start = intro + i * slot;
  const end = Math.min(start + span, 1);

  const dir = (to[0] - from[0]) >= 0 ? 1 : -1;
  const x = useTransform(prog, [start, end], [`${from[0]}vw`, `${to[0]}vw`]);
  const y = useTransform(prog, [start, end], [`${from[1]}vh`, `${to[1]}vh`]);
  const rotate = useTransform(prog, [start, end], [dir * 9, -dir * 7]);
  const opacity = useTransform(prog,
    [start, start + span * 0.20, end - span * 0.28, end],
    [0, 1, 1, 0]);
  const scale = useTransform(prog, [start, end], [0.86, 1.06]);

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <motion.div className="w-[min(560px,90vw)]"
        style={{ x, y, rotate, opacity, scale }}>
        <div className="relative overflow-hidden rounded-2xl"
          style={{ border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={title} draggable={false} className="w-full h-[360px] object-cover" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-5 pt-12"
            style={{ background: "linear-gradient(0deg, rgba(2,4,9,0.88), transparent)" }}>
            <div className="text-[12px] tracking-[0.32em] text-white/55"
              style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>{cat}</div>
            <div className="text-[34px] tracking-[0.08em] text-white"
              style={{ fontFamily: "var(--font-anton),sans-serif" }}>{title}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* The two framed cards resting in the bottom-right. They overlap and sit at
   slight angles; hovering one doesn't just snap it on top — it turns toward
   the viewer (rotateY) and lifts as it comes forward, on a spring. */
const PAIR_CARDS = [
  { img: "/cards/bayc.jpg", title: "BAYC", cat: "COLLECTION", rot: -7, right: "21%", bottom: "15%" },
  { img: "/cards/ape.jpg",  title: "APE",  cat: "TOKEN",      rot: 6,  right: "5%",  bottom: "5%"  },
] as const;

function WallPair() {
  const [front, setFront] = useState<number | null>(null);
  return (
    <>
      {PAIR_CARDS.map((c, i) => (
        <motion.div
          key={c.title}
          className="absolute w-[min(330px,54vw)] cursor-pointer"
          style={{ right: c.right, bottom: c.bottom, transformPerspective: 1100, zIndex: front === i ? 40 : 20 - i }}
          initial={false}
          animate={front === i
            ? { rotateY: -16, rotate: c.rot * 0.3, scale: 1.07, y: -16 }
            : { rotateY: 0, rotate: c.rot, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 15 }}
          onHoverStart={() => setFront(i)}
        >
          <div className="relative overflow-hidden rounded-2xl select-none"
            style={{ border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 30px 75px rgba(0,0,0,0.62)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.img} alt={c.title} draggable={false} className="w-full h-[260px] object-cover" />
            <div className="absolute inset-x-0 bottom-0 px-5 pb-4 pt-10"
              style={{ background: "linear-gradient(0deg, rgba(2,4,9,0.9), transparent)" }}>
              <div className="text-[11px] tracking-[0.32em] text-white/55"
                style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>{c.cat}</div>
              <div className="text-[26px] tracking-[0.08em] text-white"
                style={{ fontFamily: "var(--font-anton),sans-serif" }}>{c.title}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}

export default function DeepDiveSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const waterRef = useRef<HTMLDivElement>(null);
  // portal → forest layers (driven imperatively from scroll)
  const forestRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const raysRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  /* The wrapper is 2 viewports tall with a sticky 1-viewport child:
     the section first slides in untouched; once it fully covers the
     screen it PINS, and this progress runs 0 → 1 over the extra
     viewport of scroll — that pinned phase is the dive. */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const titleOpacity = useTransform(scrollYProgress, [0.02, 0.1, 0.28, 0.36], [0, 1, 1, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 0.36], [0.85, 1.2]);
  // The framed cube + frames surface once the streaming cards clear, hold
  // while you take them in, then bow out as the light swallows the scene.
  // React state + CSS transition (framer skips DOM opacity flushes on a
  // transform-less layer).
  const [galleryShown, setGalleryShown] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => setGalleryShown(v > 0.4 && v < 0.6));

  /* The dive doesn't hand off to a new page — the SAME pinned screen keeps
     going deeper: the scene darkens, a pin-prick of light opens where the
     cube was, swells into a portal, floods white, and we step through it
     into the forest. All driven imperatively from one scroll value. */
  useEffect(() => {
    const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const smooth = (e0: number, e1: number, x: number) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
    const bell = (c: number, w: number, x: number) => Math.exp(-((x - c) * (x - c)) / (2 * w * w));
    const apply = (p: number) => {
      const veilIn = smooth(0.50, 0.60, p);            // scene darkens — going deeper
      const grow = smooth(0.60, 0.86, p);              // the hole swells open
      const holeR = 1.5 + grow * grow * 172;
      const feather = 4 + (1 - grow) * 10;
      if (veilRef.current) {
        const mask = `radial-gradient(circle at 50% 47%, transparent ${holeR}vmax, #000 ${holeR + feather}vmax)`;
        veilRef.current.style.webkitMaskImage = mask;
        veilRef.current.style.maskImage = mask;
        veilRef.current.style.opacity = String(veilIn);
      }
      if (forestRef.current) {
        forestRef.current.style.opacity = String(smooth(0.58, 0.62, p));   // appears under cover of the dark veil
        forestRef.current.style.transform = `scale(${1.2 - smooth(0.62, 0.9, p) * 0.2})`;
        forestRef.current.style.filter = `brightness(${0.72 + smooth(0.62, 0.86, p) * 0.28})`;
      }
      if (ringRef.current) {
        const inner = Math.max(holeR - 5, 0);
        ringRef.current.style.background = `radial-gradient(circle at 50% 47%, transparent ${inner}vmax, rgba(255,252,235,0.95) ${holeR}vmax, rgba(255,239,196,0.35) ${holeR + 5}vmax, transparent ${holeR + 16}vmax)`;
        ringRef.current.style.opacity = String(clamp(bell(0.70, 0.11, p)) * (p < 0.9 ? 1 : 0));
      }
      if (raysRef.current) raysRef.current.style.opacity = String(clamp(smooth(0.58, 0.68, p) - smooth(0.84, 0.92, p)) * 0.85);
      if (bloomRef.current) bloomRef.current.style.opacity = String(clamp(bell(0.76, 0.06, p)) * 0.95);
      if (hintRef.current) hintRef.current.style.opacity = String(clamp(smooth(0.9, 0.98, p)));
    };
    apply(scrollYProgress.get());
    const unsub = scrollYProgress.on("change", apply);
    return () => unsub();
  }, [scrollYProgress]);

  useEffect(() => {
    const el = waterRef.current, sec = sectionRef.current;
    if (!el || !sec) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uMouseDir: { value: new THREE.Vector2(1, 0) },
        uMouseSpeed: { value: 0 },
        uClickPos: { value: Array.from({ length: NCLICK }, () => new THREE.Vector2(0.5, 0.5)) },
        uClickAge: { value: Array.from({ length: NCLICK }, () => 100) },
        uZoom: { value: 0 },
        uRes: { value: new THREE.Vector2(el.clientWidth, el.clientHeight) },
      },
      vertexShader: VERT, fragmentShader: FRAG,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    let mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5;
    let pmx = 0.5, pmy = 0.5;          // previous smoothed pos → velocity
    let dirx = 1, diry = 0, speed = 0; // smoothed travel direction & speed
    let clickSlot = 0;                 // ring buffer index for click ripples
    let visible = false, raf = 0, last = performance.now();

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(sec);

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;                 // left-click only
      const r = el.getBoundingClientRect();
      const pos = mat.uniforms.uClickPos.value as THREE.Vector2[];
      const ages = mat.uniforms.uClickAge.value as number[];
      pos[clickSlot].set(
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height,
      );
      ages[clickSlot] = 0;                        // start a fresh drop ripple in this slot
      clickSlot = (clickSlot + 1) % NCLICK;       // next click uses a new slot → they coexist
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h);
      (mat.uniforms.uRes.value as THREE.Vector2).set(w, h);
    };
    window.addEventListener("resize", onResize);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 50); last = now;
      if (!visible) return;                       // free while off-screen
      const f = 1 - Math.exp(-0.008 * dt);        // pointer smoothing
      smx += (mx - smx) * f; smy += (my - smy) * f;

      // pointer velocity → direction the ripple wake should lean
      const vx = smx - pmx, vy = smy - pmy;
      pmx = smx; pmy = smy;
      const mag = Math.hypot(vx, vy);
      if (mag > 1e-4) {
        const nx = vx / mag, ny = vy / mag;
        dirx += (nx - dirx) * 0.25; diry += (ny - diry) * 0.25;
      }
      speed += (Math.min(mag * 150, 1) - speed) * 0.12;
      const dl = Math.hypot(dirx, diry) || 1;

      mat.uniforms.uTime.value += dt * 0.001;
      (mat.uniforms.uMouse.value as THREE.Vector2).set(smx, smy);
      (mat.uniforms.uMouseDir.value as THREE.Vector2).set(dirx / dl, diry / dl);
      mat.uniforms.uMouseSpeed.value = speed;
      const ages = mat.uniforms.uClickAge.value as number[];
      for (let i = 0; i < NCLICK; i++) ages[i] += dt * 0.001;
      mat.uniforms.uZoom.value = scrollYProgress.get();
      renderer.render(scene, cam);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onResize);
      mat.dispose(); renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [scrollYProgress]);

  return (
    <section ref={sectionRef} className="relative h-[1000dvh]">
      <div className="sticky top-0 h-dvh overflow-hidden bg-[#020409]">
        {/* Water shader canvas */}
        <div ref={waterRef} className="absolute inset-0" />

        {/* Blend seam with the hero above */}
        <div className="absolute top-0 inset-x-0 h-28 pointer-events-none"
          style={{ background: "linear-gradient(180deg, #04050e 0%, transparent 100%)" }} />

        {/* Everything below scales up while pinned — the dive */}
        <motion.div className="absolute inset-0" style={{ scale: contentScale }}>
          <motion.div
            className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
            style={{ opacity: titleOpacity, scale: titleScale }}>
            <h2 className="text-white leading-none"
              style={{
                fontSize: "clamp(40px,6vw,92px)", fontFamily: "var(--font-anton),sans-serif",
                letterSpacing: "0.06em", textShadow: "0 0 60px rgba(16,120,140,0.55)",
              }}>
              DIVE DEEPER
            </h2>
            <p className="mt-4 text-[10px] tracking-[0.48em] text-white/55"
              style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>
              EXPLORE THE COLLECTION
            </p>
          </motion.div>

          {DIVE_CARDS.map((c, i) => (
            <DiveCard key={c.title} prog={scrollYProgress} i={i} total={DIVE_CARDS.length}
              img={c.img} title={c.title} cat={c.cat} from={c.from} to={c.to} />
          ))}
        </motion.div>

        {/* Framed gallery at the bottom of the dive: a grab-and-spin 3D prism
            in the top-left, two turning frames overlapping in the bottom-right */}
        <div className="absolute inset-0 transition-opacity duration-[800ms] ease-out"
          style={{ opacity: galleryShown ? 1 : 0, pointerEvents: galleryShown ? "auto" : "none" }}>
          <div className="absolute"
            style={{ top: "7%", left: "4%", width: "min(500px,52vw)", height: "min(500px,52vw)" }}>
            <CardPrism />
          </div>
          <p className="absolute left-[6%] text-[10px] tracking-[0.4em] text-white/45"
            style={{ top: "4%", fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>
            DRAG TO SPIN
          </p>
          <WallPair />
        </div>

        {/* ── In-place portal: the same screen pushes deeper, light opens here,
              and we step through it into the forest (no separate section) ── */}
        {/* Forest, revealed through the growing hole (hidden behind the veil until then) */}
        <div ref={forestRef} className="absolute inset-0 pointer-events-none will-change-transform"
          style={{ opacity: 0, transform: "scale(1.2)" }}>
          <ForestScene />
        </div>
        {/* Dark veil with a hole punched through it — going deeper into the dark */}
        <div ref={veilRef} className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0, background: "radial-gradient(120% 120% at 50% 47%, #06121e 0%, #02040a 70%)" }} />
        {/* Light shafts fanning out of the opening */}
        <div ref={raysRef} className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: "screen", opacity: 0 }}>
          <div className="dd-portal-rays absolute left-1/2 top-[47%] h-[260vmax] w-[260vmax] -translate-x-1/2 -translate-y-1/2"
            style={{
              background: "repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,251,232,0) 0deg, rgba(255,251,232,0.5) 2.2deg, rgba(255,251,232,0) 5deg)",
              WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 0%, transparent 62%)",
              maskImage: "radial-gradient(circle at 50% 50%, #000 0%, transparent 62%)",
            }} />
        </div>
        {/* Hot glowing rim around the hole */}
        <div ref={ringRef} className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: "screen", opacity: 0 }} />
        {/* White bloom — the moment of passing through the light */}
        <div ref={bloomRef} className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(60% 60% at 50% 47%, #fffef8 0%, rgba(255,250,235,0.6) 40%, rgba(255,250,235,0) 75%)",
          mixBlendMode: "screen", opacity: 0,
        }} />
        {/* Arrival word + ambient sound toggle */}
        <div ref={hintRef} className="absolute inset-x-0 bottom-[12%] flex flex-col items-center gap-5 pointer-events-none" style={{ opacity: 0 }}>
          <p className="text-[clamp(13px,2vw,20px)] tracking-[0.62em] text-[#eafbe6]"
            style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 300, textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}>
            BREATHE
          </p>
          <AmbientSound />
        </div>
      </div>

      <style>{`
        @keyframes ddPortalSpin { to { transform: translate(-50%,-50%) rotate(360deg) } }
        .dd-portal-rays{ animation: ddPortalSpin 60s linear infinite; }
        @media (prefers-reduced-motion: reduce){ .dd-portal-rays{ animation: none } }
      `}</style>
    </section>
  );
}
