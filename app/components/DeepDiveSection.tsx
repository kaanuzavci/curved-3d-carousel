"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

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

const DIVE_CARDS = [
  { img: "/cards/otherside.jpg", title: "OTHERSIDE", cat: "GAMES", side: -1, top: 9 },
  { img: "/cards/nexus.jpg", title: "NEXUS", cat: "MARKETPLACE", side: 1, top: 19 },
  { img: "/cards/forge.jpg", title: "FORGE", cat: "STUDIO", side: -1, top: 37 },
  { img: "/cards/void.jpg", title: "VOID", cat: "DEFI", side: 1, top: 47 },
  { img: "/cards/surge.jpg", title: "SURGE", cat: "LAUNCHPAD", side: -1, top: 64 },
  { img: "/cards/arc.jpg", title: "ARC", cat: "BRIDGE", side: 1, top: 74 },
] as const;

const VERT = `varying vec2 vUv;
void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;

const FRAG = `precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;   // 0..1, smoothed in JS
uniform float uZoom;   // scroll progress 0..1
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

  // Pointer ripple — expanding rings decaying with distance
  float d = length(p-m);
  float rip = sin(d*42. - uTime*4.5) * exp(-d*5.5);

  // Layered flowing waves
  float t = uTime*0.12;
  float w1 = fbm(p*2.6 + vec2(t, t*0.7) + rip*0.25);
  float w2 = fbm(p*4.2 - vec2(t*0.8, -t*0.5) + w1*0.9);
  vec2 q = p + vec2(w1-.5, w2-.5)*0.22 + rip*0.02;

  // Caustic light webs
  float c1 = abs(sin((q.x+q.y)*7.0 + uTime*0.55));
  float c2 = abs(sin((q.x-q.y)*6.3 - uTime*0.42));
  float caustic = pow(c1*c2, 4.0);

  vec3 deep = vec3(0.012,0.018,0.05);
  vec3 mid  = vec3(0.015,0.07,0.11);
  vec3 col = mix(deep, mid, smoothstep(0.2,0.9,w2));
  col += vec3(0.10,0.55,0.62) * caustic * 0.38;                 // teal caustics
  col += vec3(1.0,0.55,0.25) * caustic * exp(-d*3.5) * 0.35;    // warm light pool at cursor
  col += vec3(1.0,0.62,0.30) * exp(-d*7.0) * 0.10;              // cursor glint
  col += vec3(0.5,0.8,1.0) * max(rip,0.) * exp(-d*4.0) * 0.06;  // ripple sheen

  // Edges darken further the deeper you go
  float r2 = dot(p*zoom, p*zoom);
  col *= 1.0 - r2*(0.50 + uZoom*0.35);
  gl_FragColor = vec4(col, 1.0);
}`;

function DiveCard({ prog, img, title, cat, side, top, i }: {
  prog: MotionValue<number>; img: string; title: string; cat: string;
  side: 1 | -1; top: number; i: number;
}) {
  const start = 0.08 + i * 0.13;
  const end = Math.min(start + 0.40, 1);
  const x = useTransform(prog, [start, end], [`${side * 72}vw`, "0vw"]);
  const rotate = useTransform(prog, [start, end], [side * 12, 0]);
  const opacity = useTransform(prog, [start, Math.min(start + 0.14, 1)], [0, 1]);
  const scale = useTransform(prog, [start, end], [0.78, 1]);

  return (
    <motion.div className="absolute w-[min(240px,38vw)] pointer-events-none"
      style={{
        top: `${top}%`,
        left: side < 0 ? "6%" : undefined,
        right: side > 0 ? "6%" : undefined,
        x, rotate, opacity, scale,
      }}>
      <div className="relative overflow-hidden rounded-xl"
        style={{ border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 18px 50px rgba(0,0,0,0.55)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={title} draggable={false} className="w-full h-[150px] object-cover" />
        <div className="absolute inset-x-0 bottom-0 px-3.5 pb-2.5 pt-6"
          style={{ background: "linear-gradient(0deg, rgba(2,4,9,0.88), transparent)" }}>
          <div className="text-[8px] tracking-[0.30em] text-white/55"
            style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>{cat}</div>
          <div className="text-[16px] tracking-[0.08em] text-white"
            style={{ fontFamily: "var(--font-anton),sans-serif" }}>{title}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DeepDiveSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const waterRef = useRef<HTMLDivElement>(null);

  /* The wrapper is 2 viewports tall with a sticky 1-viewport child:
     the section first slides in untouched; once it fully covers the
     screen it PINS, and this progress runs 0 → 1 over the extra
     viewport of scroll — that pinned phase is the dive. */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const titleOpacity = useTransform(scrollYProgress, [0.02, 0.22], [0, 1]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [0.85, 1.3]);

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
        uZoom: { value: 0 },
        uRes: { value: new THREE.Vector2(el.clientWidth, el.clientHeight) },
      },
      vertexShader: VERT, fragmentShader: FRAG,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    let mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5;
    let visible = false, raf = 0, last = performance.now();

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(sec);

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
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
      mat.uniforms.uTime.value += dt * 0.001;
      (mat.uniforms.uMouse.value as THREE.Vector2).set(smx, smy);
      mat.uniforms.uZoom.value = scrollYProgress.get();
      renderer.render(scene, cam);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      mat.dispose(); renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [scrollYProgress]);

  return (
    <section ref={sectionRef} className="relative h-[200dvh]">
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
          <DiveCard key={c.title} prog={scrollYProgress} i={i}
            img={c.img} title={c.title} cat={c.cat} side={c.side} top={c.top} />
        ))}
      </motion.div>
      </div>
    </section>
  );
}
