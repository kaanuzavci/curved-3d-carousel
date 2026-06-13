"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import AboutOverlay from "./AboutOverlay";
import CardGallery from "./CardGallery";

/* Quick-jump targets for the navbar — each "dimension" you scroll into */
const NAV_LINKS = [
  { label: "CAROUSEL", href: "#top" },
  { label: "THE DIVE", href: "#dive" },
  { label: "THE DECK", href: "#deck" },
  { label: "THE DEEP", href: "#deep" },
] as const;

/* ═══════════════════════════════════════════════════════════════
   CARD DATA
═══════════════════════════════════════════════════════════════ */
const CARDS = [
  {
    id: "otherside", title: "RENGOKU", cat: "FLAME HASHIRA", hot: true, badge: "FIRE",
    desc: "Set your heart ablaze — the Flame Hashira never yields", cta: "VIEW",
    sky: "#090200", hor: "#3c1400", acc: "#d85a10", glow: "#7a2800", hi: "#ff8a40", fl: "#1c0800", scn: 0,
    img: "/cards/otherside.jpg",
  },
  {
    id: "nexus", title: "GOJO", cat: "JUJUTSU SORCERER", hot: false, badge: null,
    desc: "Throughout heaven and earth, he alone is honored", cta: "VIEW",
    sky: "#010510", hor: "#071840", acc: "#2868e8", glow: "#0820a0", hi: "#60a0ff", fl: "#020c20", scn: 1,
    img: "/cards/nexus.jpg",
  },
  {
    id: "forge", title: "ASHE", cat: "FROST ARCHER", hot: false, badge: null,
    desc: "A crystal arrow loosed across the frozen dark", cta: "VIEW",
    sky: "#010803", hor: "#083020", acc: "#18c050", glow: "#054020", hi: "#50ee80", fl: "#021405", scn: 2,
    img: "/cards/forge.jpg",
  },
  {
    id: "void", title: "VINCENT", cat: "GUNSLINGER", hot: false, badge: null,
    desc: "A cloaked specter bound to an undying past", cta: "VIEW",
    sky: "#040010", hor: "#180060", acc: "#9030e0", glow: "#400090", hi: "#c878ff", fl: "#080025", scn: 3,
    img: "/cards/void.jpg",
  },
  {
    id: "surge", title: "AURELIA", cat: "CELESTIAL", hot: false, badge: null,
    desc: "Starlight gathers in her open palms", cta: "VIEW",
    sky: "#001010", hor: "#003840", acc: "#08c8b8", glow: "#005850", hi: "#50eedf", fl: "#001820", scn: 4,
    img: "/cards/surge.jpg",
  },
  {
    id: "arc", title: "AKARI", cat: "IDOL", hot: false, badge: null,
    desc: "Neon-bright, heart-sign ready, impossible to ignore", cta: "VIEW",
    sky: "#080400", hor: "#302000", acc: "#d08828", glow: "#704800", hi: "#ffcc60", fl: "#180e00", scn: 5,
    img: "/cards/arc.jpg",
  },
  {
    id: "bayc", title: "KAKASHI", cat: "SHINOBI", hot: true, badge: "HOT",
    desc: "Lightning in his palm, a thousand jutsu in his eye", cta: "VIEW",
    sky: "#080000", hor: "#3a0800", acc: "#e82818", glow: "#880808", hi: "#ff6050", fl: "#180000", scn: 6,
    img: "/cards/bayc.jpg",
  },
  {
    id: "ape", title: "KIRA", cat: "NETRUNNER", hot: false, badge: null,
    desc: "Jacked into the neon sprawl, dancing through ICE", cta: "VIEW",
    sky: "#000510", hor: "#051030", acc: "#3858d8", glow: "#102880", hi: "#8ab0ff", fl: "#01081e", scn: 7,
    img: "/cards/ape.jpg",
  },
] as const;
type Card = (typeof CARDS)[number];

/* ═══════════════════════════════════════════════════════════════
   GEOMETRY
   ─────────────────────────────────────────────────────────────
   CAM_Z = RADIUS + 300  →  depth-multiplier ≈ 3.4×
   This makes the front card fill ~90% of screen width.

   GAP = 0.22 rad (≈12.6°): intentionally large so you see
   through to back cards and understand the full cylinder.
═══════════════════════════════════════════════════════════════ */
const N = CARDS.length;
const THETA = (Math.PI * 2) / N;   // 45°
const GAP = 0.13;                // ~11.5° — moderate gaps, narrower cards
const ACT_THETA = THETA - GAP;         // ~33.5° per card
const RADIUS = 460;
const CARD_H = 170;
const CAM_Z = RADIUS + 200;        // 960 — very close for large projected cards
const CAM_Y = 0;
const FOV = 56;                  // narrower FOV = larger cards on screen

/* ─── Diagonal tilt ──────────────────────────────────────── */
/* TILT_Z only: rotates the spin-axis so left cards are lower, right cards higher.
   TILT_X was causing the front face to point downward, dropping cards off-screen. */
const TILT_Z = 0.13;                  // 12.6° — left-low / right-high (/) diagonal
const TILT_X = 0.00;                  // must be 0: any X-tilt pushes front face below viewport
/* Hover pitch: max dynamic X-tilt driven by pointer height. Kept well below
   the level where the front face starts dropping out of the viewport. */
const HOVER_PITCH = 0.015;            // ~3.2° — subtle hand-held wobble

/* ─── Texture — full atmospheric scene, NO text panel ─────
   Ratio: arc / CARD_H = (720 × 0.565) / 300 ≈ 1.356
   Using 1400 × 1000 (1.40:1, close enough)              ─── */
const TEX_W = 1400;
const TEX_H = 1000;

/* ═══════════════════════════════════════════════════════════════
   SHADERS
═══════════════════════════════════════════════════════════════ */
const VERT = `varying vec2 vUv;
void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;

const FRAG = `uniform sampler2D map; uniform float uB; uniform float uO;
varying vec2 vUv;
void main(){
  vec4 c=vec4(0.); float w=0.;
  for(float x=-3.;x<=3.;x+=1.)for(float y=-2.;y<=2.;y+=1.){
    float wt=(4.-abs(x))*(3.-abs(y));
    c+=texture2D(map,clamp(vUv+vec2(x,y)*uB*0.0022,0.001,0.999))*wt; w+=wt;
  }
  c/=w;
  // Saturation boost — makes colours pop
  float luma=dot(c.rgb,vec3(0.299,0.587,0.114));
  c.rgb=mix(vec3(luma),c.rgb,1.45);
  // Gentle gamma lift — lifts midtones for a glowing feel
  c.rgb=pow(max(c.rgb,0.0),vec3(0.88));
  // Vignette — subtle darkening toward card edges
  vec2 uv2=vUv*2.0-1.0;
  float vig=1.0-dot(uv2*vec2(0.55,0.75),uv2*vec2(0.55,0.75));
  c.rgb*=clamp(vig*1.4+0.35,0.0,1.0);
  c.a*=uO; gl_FragColor=c;
}`;

/* ═══════════════════════════════════════════════════════════════
   CANVAS TEXTURE — pure atmospheric scene (NO text)
   Text is shown via the HTML overlay outside the canvas.
═══════════════════════════════════════════════════════════════ */
function buildTexture(card: Card): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = TEX_W; cv.height = TEX_H;
  const c = cv.getContext("2d")!;

  /* ── Background gradient ── */
  const bg = c.createLinearGradient(0, 0, 0, TEX_H);
  bg.addColorStop(0.0, card.sky);
  bg.addColorStop(0.5, card.hor);
  bg.addColorStop(1.0, card.fl);
  c.fillStyle = bg; c.fillRect(0, 0, TEX_W, TEX_H);

  /* ── Primary hero glow (large ambient orb) ── */
  const ox = TEX_W * 0.50, oy = TEX_H * 0.44;
  const orb = c.createRadialGradient(ox, oy, 0, ox, oy, TEX_H * 0.78);
  orb.addColorStop(0.00, card.glow + "dd");
  orb.addColorStop(0.22, card.glow + "88");
  orb.addColorStop(0.55, card.glow + "28");
  orb.addColorStop(1.00, "rgba(0,0,0,0)");
  c.fillStyle = orb; c.fillRect(0, 0, TEX_W, TEX_H);

  /* ── Perspective grid (floor plane) ── */
  const vpy = TEX_H * 0.54, vpx = TEX_W * 0.50;
  c.save(); c.strokeStyle = card.acc + "22"; c.lineWidth = 1;
  for (let i = -10; i <= 10; i++) {
    const bx = vpx + i * (TEX_W / 8);
    c.beginPath(); c.moveTo(bx, TEX_H); c.lineTo(vpx, vpy); c.stroke();
  }
  for (let j = 0; j <= 5; j++) {
    const t = (j + 1) / 6, yy = vpy + (TEX_H - vpy) * t, hw = TEX_W * 0.5 * t;
    c.beginPath(); c.moveTo(vpx - hw, yy); c.lineTo(vpx + hw, yy); c.stroke();
  }
  c.restore();

  /* ── Stars ── */
  for (let i = 0; i < 90; i++) {
    const sx = Math.random() * TEX_W, sy = Math.random() * TEX_H * 0.6;
    c.fillStyle = `rgba(255,255,255,${0.07 + Math.random() * 0.40})`;
    c.beginPath(); c.arc(sx, sy, Math.random() * 1.3, 0, Math.PI * 2); c.fill();
  }

  /* ── Card-specific hero scene ── */
  drawScene(c, card, TEX_W, TEX_H, ox, oy);

  /* ── Scan lines ── */
  for (let y = 0; y < TEX_H; y += 4) {
    c.fillStyle = "rgba(0,0,0,0.038)"; c.fillRect(0, y, TEX_W, 1.5);
  }

  /* ── Bottom fog (ground level atmosphere) ── */
  const fog = c.createLinearGradient(0, TEX_H * 0.72, 0, TEX_H);
  fog.addColorStop(0, "rgba(0,0,0,0)"); fog.addColorStop(1, "rgba(0,0,0,0.70)");
  c.fillStyle = fog; c.fillRect(0, TEX_H * 0.72, TEX_W, TEX_H * 0.28);

  /* ── Left accent bar ── */
  const lb = c.createLinearGradient(0, 0, 0, TEX_H);
  lb.addColorStop(0, "rgba(0,0,0,0)");
  lb.addColorStop(0.5, card.acc + "77"); lb.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = lb; c.fillRect(0, 0, 2.5, TEX_H);

  /* ── Top accent line ── */
  const tl = c.createLinearGradient(0, 0, TEX_W, 0);
  tl.addColorStop(0, "rgba(0,0,0,0)");
  tl.addColorStop(0.15, card.acc + "cc"); tl.addColorStop(0.85, card.acc + "cc");
  tl.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = tl; c.fillRect(0, 0, TEX_W, 2);

  const tex = new THREE.CanvasTexture(cv);
  tex.needsUpdate = true;
  return tex;
}

function drawScene(
  c: CanvasRenderingContext2D,
  card: Card, W: number, H: number, cx: number, cy: number
) {
  c.save();

  if (card.scn === 0) {
    /* OTHERSIDE — warm bar / BAYC venue */
    // Buildings (background)
    const buildings = [
      { x: 0.08, w: 0.15, h: 0.48 }, { x: 0.22, w: 0.12, h: 0.38 },
      { x: 0.68, w: 0.14, h: 0.44 }, { x: 0.80, w: 0.10, h: 0.35 },
      { x: 0.88, w: 0.13, h: 0.50 },
    ];
    buildings.forEach(b => {
      c.fillStyle = "rgba(14,6,2,0.90)";
      c.fillRect(W * b.x - W * b.w / 2, H - H * b.h, W * b.w, H * b.h);
      // Windows
      for (let wy = 0; wy < 4; wy++) for (let wx = 0; wx < 2; wx++) {
        if (Math.random() > 0.30) {
          c.fillStyle = card.acc + (Math.random() > 0.5 ? "cc" : "88");
          c.fillRect(W * b.x - W * b.w / 2 + 7 + wx * 16, H - H * b.h + 18 + wy * 22, 10, 14);
        }
      }
    });
    // Central large building / arch
    c.fillStyle = "rgba(10,4,1,0.95)";
    c.fillRect(W * 0.30, H * 0.20, W * 0.40, H * 0.80);
    // Arch entrance
    c.fillStyle = card.acc + "44";
    c.beginPath(); c.arc(W * 0.50, H * 0.58, W * 0.10, Math.PI, 0); c.fill();
    c.fillStyle = "rgba(5,2,0,0.95)"; c.fillRect(W * 0.40, H * 0.58, W * 0.20, H * 0.42);
    // "BAYC" neon text
    c.font = `bold ${W * 0.085}px Impact, Arial Black, sans-serif`;
    c.textAlign = "center";
    c.fillStyle = card.hi + "e8";
    c.shadowColor = card.hi; c.shadowBlur = 18;
    c.fillText("BAYC", W * 0.50, H * 0.34);
    c.shadowBlur = 0;
    // Warm glow above entrance
    const eg = c.createRadialGradient(cx, H * 0.56, 0, cx, H * 0.56, 130);
    eg.addColorStop(0, card.acc + "60"); eg.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = eg; c.fillRect(0, 0, W, H);
    // String lights
    c.strokeStyle = "rgba(255,240,180,0.70)"; c.lineWidth = 1;
    c.beginPath();
    const lx0 = W * 0.15, lx1 = W * 0.85, ly = H * 0.14;
    c.moveTo(lx0, ly); c.quadraticCurveTo(W * 0.50, ly + 18, lx1, ly); c.stroke();
    for (let li = 0; li <= 12; li++) {
      const t = li / 12, lsx = lx0 + t * (lx1 - lx0);
      const lsy = ly + Math.sin(t * Math.PI) * 18;
      c.fillStyle = "rgba(255,255,200,0.85)";
      c.beginPath(); c.arc(lsx, lsy, 2.5, 0, Math.PI * 2); c.fill();
    }
    // "Fomo" neon sign
    c.font = `italic bold ${W * 0.055}px Georgia, serif`;
    c.fillStyle = "#ff60a0cc"; c.shadowColor = "#ff60a0"; c.shadowBlur = 12;
    c.fillText("fomo", W * 0.24, H * 0.50); c.shadowBlur = 0;

  } else if (card.scn === 1) {
    /* NEXUS — cool tech marketplace portal */
    // Concentric rings
    const rings = [55, 110, 180, 265, 368, 490];
    rings.forEach((r, i) => {
      const alpha = ["66", "48", "32", "22", "14", "0a"][i];
      c.strokeStyle = card.acc + alpha; c.lineWidth = i < 2 ? 1.5 : 1;
      c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
    });
    // Radial spokes
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      c.strokeStyle = card.acc + "18"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * 480, cy + Math.sin(a) * 480); c.stroke();
    }
    // Central glowing portal
    const pg = c.createRadialGradient(cx, cy, 20, cx, cy, 160);
    pg.addColorStop(0, card.acc + "70"); pg.addColorStop(0.5, card.acc + "28"); pg.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = pg; c.fillRect(0, 0, W, H);
    // Grid
    c.strokeStyle = card.acc + "15"; c.lineWidth = 1;
    for (let x = 0; x < W; x += 58) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
    for (let y = 0; y < H; y += 58) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    // Floating hex data nodes
    const nodes = [[cx - 220, cy - 80], [cx + 200, cy - 120], [cx - 160, cy + 140], [cx + 180, cy + 100]];
    nodes.forEach(([nx, ny]) => {
      c.strokeStyle = card.hi + "70"; c.lineWidth = 1.5;
      c.beginPath();
      for (let a = 0; a < 6; a++) {
        const hx = nx + Math.cos(a * Math.PI / 3) * 20, hy = ny + Math.sin(a * Math.PI / 3) * 20;
        if (a === 0) c.moveTo(hx, hy); else c.lineTo(hx, hy);
      }
      c.closePath(); c.stroke();
    });

  } else if (card.scn === 2) {
    /* FORGE — diamond gem + forge fire */
    const gx = cx, gy = cy * 0.96;
    // Green atmospheric
    const gg = c.createRadialGradient(gx, gy, 0, gx, gy, 340);
    gg.addColorStop(0, card.acc + "55"); gg.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = gg; c.fillRect(0, 0, W, H);
    // Diamond (multi-facet)
    const dm = 160;
    const facets: [number, number][][] = [
      [[gx, gy - dm], [gx + dm * 0.75, gy], [gx, gy + dm * 0.45]],
      [[gx, gy - dm], [gx - dm * 0.75, gy], [gx, gy + dm * 0.45]],
      [[gx - dm * 0.75, gy], [gx, gy - dm], [gx, gy + dm * 0.45]],
      [[gx + dm * 0.75, gy], [gx, gy + dm * 0.45], [gx, gy - dm]],
    ];
    const shades = [card.acc + "55", card.hi + "44", card.acc + "33", card.hi + "22"];
    facets.forEach((pts, fi) => {
      c.fillStyle = shades[fi];
      c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
      pts.forEach(p => c.lineTo(p[0], p[1])); c.closePath(); c.fill();
    });
    c.strokeStyle = card.hi + "99"; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(gx, gy - dm); c.lineTo(gx + dm * 0.75, gy);
    c.lineTo(gx, gy + dm * 0.45); c.lineTo(gx - dm * 0.75, gy); c.closePath(); c.stroke();
    // Sparks
    for (let i = 0; i < 28; i++) {
      const a = Math.random() * Math.PI * 2, r = dm * 0.6 + Math.random() * dm * 1.2;
      c.fillStyle = card.hi + (Math.random() > 0.5 ? "99" : "55");
      c.beginPath(); c.arc(gx + Math.cos(a) * r, gy + Math.sin(a) * r, Math.random() * 2.2, 0, Math.PI * 2); c.fill();
    }
    // Forge fire at base
    const fire = c.createRadialGradient(cx, H * 0.88, 0, cx, H * 0.88, 120);
    fire.addColorStop(0, "#ff9010cc"); fire.addColorStop(0.4, card.acc + "80"); fire.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = fire; c.fillRect(0, 0, W, H);

  } else if (card.scn === 3) {
    /* VOID — deep purple vortex */
    // Spiral arms
    c.strokeStyle = card.acc + "70"; c.lineWidth = 2;
    c.beginPath();
    for (let a = 0, first = true; a < Math.PI * 7; a += 0.06) {
      const r = a * 16, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a) * 0.60;
      if (first) { c.moveTo(x, y); first = false; } else c.lineTo(x, y);
    } c.stroke();
    c.strokeStyle = card.acc + "30"; c.lineWidth = 1;
    c.beginPath();
    for (let a = Math.PI, first = true; a < Math.PI * 8; a += 0.06) {
      const r = a * 16, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a) * 0.60;
      if (first) { c.moveTo(x, y); first = false; } else c.lineTo(x, y);
    } c.stroke();
    // Core glow
    const vg = c.createRadialGradient(cx, cy, 0, cx, cy, 200);
    vg.addColorStop(0, card.acc + "80"); vg.addColorStop(0.4, card.acc + "38"); vg.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
    // Tendrils
    for (let t = 0; t < 8; t++) {
      const ta = (t / 8) * Math.PI * 2;
      c.strokeStyle = card.hi + "28"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(cx, cy);
      c.bezierCurveTo(
        cx + Math.cos(ta + 0.5) * 200, cy + Math.sin(ta + 0.5) * 120,
        cx + Math.cos(ta + 1.0) * 340, cy + Math.sin(ta + 1.0) * 200,
        cx + Math.cos(ta + 1.5) * 460, cy + Math.sin(ta + 1.5) * 280
      );
      c.stroke();
    }

  } else if (card.scn === 4) {
    /* SURGE — rocket launch */
    const rx = cx, ry = cy * 1.05;
    // Rocket body
    c.fillStyle = card.acc + "cc";
    c.beginPath(); c.moveTo(rx, ry - 140); c.lineTo(rx + 32, ry + 55); c.lineTo(rx - 32, ry + 55); c.closePath(); c.fill();
    // Nose cone highlight
    c.fillStyle = card.hi + "aa";
    c.beginPath(); c.moveTo(rx, ry - 140); c.lineTo(rx + 10, ry - 88); c.lineTo(rx - 10, ry - 88); c.closePath(); c.fill();
    // Fins
    c.fillStyle = card.acc + "99";
    c.beginPath(); c.moveTo(rx - 32, ry + 40); c.lineTo(rx - 60, ry + 75); c.lineTo(rx - 32, ry + 55); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(rx + 32, ry + 40); c.lineTo(rx + 60, ry + 75); c.lineTo(rx + 32, ry + 55); c.closePath(); c.fill();
    // Exhaust cone
    const ex = c.createRadialGradient(rx, ry + 75, 0, rx, ry + 90, 100);
    ex.addColorStop(0, "#ffffff99"); ex.addColorStop(0.2, card.hi + "dd"); ex.addColorStop(0.5, card.acc + "88"); ex.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = ex; c.fillRect(0, 0, W, H);
    // Orbit rings
    const rings2 = [[220, 72, -0.28], [300, 96, -0.28], [390, 124, -0.28]];
    rings2.forEach(([a, b, rot], ri) => {
      c.strokeStyle = card.acc + (["38", "24", "14"][ri]); c.lineWidth = 1;
      c.save(); c.translate(cx, cy); c.rotate(rot);
      c.beginPath(); c.ellipse(0, 0, a, b, 0, 0, Math.PI * 2); c.stroke();
      c.restore();
    });

  } else if (card.scn === 5) {
    /* ARC — golden bridge */
    const by = H * 0.68;
    // Water/abyss glow
    const wg = c.createLinearGradient(0, by + 100, 0, H);
    wg.addColorStop(0, card.glow + "40"); wg.addColorStop(1, card.glow + "15");
    c.fillStyle = wg; c.fillRect(0, by + 100, W, H - by - 100);
    // Main arch
    c.strokeStyle = card.acc + "cc"; c.lineWidth = 4;
    c.beginPath(); c.arc(cx, by + 110, 230, Math.PI, 0); c.stroke();
    // Secondary arches
    c.strokeStyle = card.acc + "44"; c.lineWidth = 1.5;
    c.beginPath(); c.arc(cx, by + 110, 290, Math.PI, 0); c.stroke();
    c.beginPath(); c.arc(cx, by + 110, 360, Math.PI, 0); c.stroke();
    // Suspension cables
    for (let i = 0; i < 14; i++) {
      const bx = cx - 230 + i * 32;
      const dist = bx - cx;
      if (Math.abs(dist) > 230) continue;
      const caY = by + 110 - Math.sqrt(230 * 230 - dist * dist);
      c.strokeStyle = card.acc + "55"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(bx, caY); c.lineTo(bx, by + 110); c.stroke();
    }
    // Bridge deck
    c.strokeStyle = card.hi + "88"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 240, by); c.lineTo(cx + 240, by); c.stroke();
    // Golden glow at arch top
    const ag = c.createRadialGradient(cx, by - 120, 0, cx, by - 120, 250);
    ag.addColorStop(0, card.acc + "50"); ag.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = ag; c.fillRect(0, 0, W, H);

  } else if (card.scn === 6) {
    /* BAYC — dramatic ape silhouette */
    const hx = cx, hy = cy * 0.86;
    // Dark smoke/atmosphere
    for (let s = 0; s < 8; s++) {
      const sx = cx + (Math.random() - 0.5) * 300, sy = cy + (Math.random() - 0.5) * 200;
      const sr = 80 + Math.random() * 100;
      const sg = c.createRadialGradient(sx, sy, 0, sx, sy, sr);
      sg.addColorStop(0, "rgba(40,5,5,0.30)"); sg.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = sg; c.fillRect(0, 0, W, H);
    }
    // Ape head silhouette
    c.fillStyle = "rgba(15,3,3,0.94)";
    c.beginPath(); c.arc(hx, hy, 120, 0, Math.PI * 2); c.fill();
    c.fillRect(hx - 90, hy, 180, 100);
    // Ears
    c.beginPath(); c.arc(hx - 115, hy - 30, 28, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(hx + 115, hy - 30, 28, 0, Math.PI * 2); c.fill();
    // Rim lighting
    const rl = c.createRadialGradient(hx, hy, 100, hx, hy, 145);
    rl.addColorStop(0, "rgba(0,0,0,0)"); rl.addColorStop(0.6, card.acc + "50"); rl.addColorStop(1, card.acc + "28");
    c.fillStyle = rl;
    c.beginPath(); c.arc(hx, hy, 145, 0, Math.PI * 2); c.fill();
    // Atmospheric glow
    const rg = c.createRadialGradient(hx, hy, 120, hx, hy, 320);
    rg.addColorStop(0, card.acc + "40"); rg.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = rg; c.fillRect(0, 0, W, H);

  } else {
    /* APE TOKEN — cosmos + coin */
    // Nebula
    for (let n = 0; n < 5; n++) {
      const nx = cx + (Math.random() - 0.5) * 500, ny = cy + (Math.random() - 0.5) * 300;
      const nr = 80 + Math.random() * 180;
      const ng = c.createRadialGradient(nx, ny, 0, nx, ny, nr);
      ng.addColorStop(0, card.glow + "38"); ng.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = ng; c.fillRect(0, 0, W, H);
    }
    // Coin outer rings
    c.strokeStyle = card.acc + "44"; c.lineWidth = 1;
    [175, 205, 240].forEach(r => {
      c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
    });
    // Coin body
    const cg = c.createRadialGradient(cx, cy, 0, cx, cy, 140);
    cg.addColorStop(0, card.glow + "90"); cg.addColorStop(0.6, card.glow + "40"); cg.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = cg; c.fillRect(0, 0, W, H);
    // Coin border
    c.strokeStyle = card.acc + "dd"; c.lineWidth = 6;
    c.beginPath(); c.arc(cx, cy, 138, 0, Math.PI * 2); c.stroke();
    // APE text
    c.font = `bold ${W * 0.065}px Impact, Arial Black, sans-serif`;
    c.textAlign = "center"; c.fillStyle = card.acc + "f0";
    c.shadowColor = card.hi; c.shadowBlur = 14;
    c.fillText("APE", cx, cy + 22); c.shadowBlur = 0;
    // Rotating tick marks
    for (let t = 0; t < 24; t++) {
      const a = (t / 24) * Math.PI * 2;
      const r0 = 148, r1 = t % 6 === 0 ? 164 : 156;
      c.strokeStyle = card.acc + (t % 6 === 0 ? "cc" : "55"); c.lineWidth = t % 6 === 0 ? 2 : 1;
      c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.stroke();
    }
  }

  c.restore();
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function CylinderCarousel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const velRef = useRef(0);
  const isDragRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  /* Per-thumbnail progress bars, driven directly from the render loop
     (no React state → no re-render churn at 60fps) */
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const goTo = (idx: number) => {
    const cur = ((-Math.round(targetRef.current / THETA)) % N + N) % N;
    let d = idx - cur; if (d > N / 2) d -= N; if (d < -N / 2) d += N;
    targetRef.current -= d * THETA;
    targetRef.current = Math.round(targetRef.current / THETA) * THETA;
  };
  const goNext = () => { targetRef.current -= THETA; targetRef.current = Math.round(targetRef.current / THETA) * THETA; };
  const goPrev = () => { targetRef.current += THETA; targetRef.current = Math.round(targetRef.current / THETA) * THETA; };

  useEffect(() => {
    const el = mountRef.current; if (!el) return;
    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H); renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, W / H, 1, 8000);
    camera.position.set(0, CAM_Y, CAM_Z); camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.PointLight(0x8090ff, 2.2, 5000);
    key.position.set(0, 260, CAM_Z - 240); scene.add(key);

    // Stars
    const PC = 650, pP = new Float32Array(PC * 3), pC = new Float32Array(PC * 3);
    for (let i = 0; i < PC; i++) {
      pP[i * 3] = (Math.random() - 0.5) * 9000; pP[i * 3 + 1] = (Math.random() - 0.5) * 4200; pP[i * 3 + 2] = (Math.random() - 0.5) * 6000;
      const t = Math.random(); pC[i * 3] = 0.3 + t * 0.4; pC[i * 3 + 1] = 0.4 + t * 0.2; pC[i * 3 + 2] = 0.7 + t * 0.3;
    }
    const pG = new THREE.BufferGeometry();
    pG.setAttribute("position", new THREE.BufferAttribute(pP, 3));
    pG.setAttribute("color", new THREE.BufferAttribute(pC, 3));
    scene.add(new THREE.Points(pG, new THREE.PointsMaterial({ size: 2, vertexColors: true, transparent: true, opacity: 0.40, sizeAttenuation: true })));

    /* ══════════════════════════════════════════════════
       TWO-GROUP ARCHITECTURE (fixes wobble/drift)
       ─────────────────────────────────────────────────
       tiltGroup  → FIXED, defines the diagonal axis
       spinGroup  → ONLY rotation.y, spins around tiltGroup's local Y
    ══════════════════════════════════════════════════ */
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.order = "ZXY";
    tiltGroup.rotation.z = TILT_Z;
    tiltGroup.rotation.x = TILT_X;
    scene.add(tiltGroup);

    const spinGroup = new THREE.Group();
    tiltGroup.add(spinGroup);

    // Rings
    const RM = new THREE.MeshBasicMaterial({ color: 0x3060b0, transparent: true, opacity: 0.018 });
    const rT = new THREE.Mesh(new THREE.TorusGeometry(RADIUS + 3, 1, 4, 100), RM);
    rT.rotation.x = Math.PI / 2; rT.position.y = CARD_H / 2 + 6;
    const rB = rT.clone(); rB.position.y = -(CARD_H / 2 + 6);
    spinGroup.add(rT, rB);

    /* ── Curved card sectors ── */
    const loader = new THREE.TextureLoader();
    const meshes = CARDS.map((card, i) => {
      const thetaCenter = i * THETA;
      const thetaStart = thetaCenter - ACT_THETA / 2;
      const geo = new THREE.CylinderGeometry(RADIUS, RADIUS, CARD_H, 44, 1, true, thetaStart, ACT_THETA);
      // Use image from /public/cards/ if it exists, fall back to canvas texture
      const initialTex = buildTexture(card);
      const mat = new THREE.ShaderMaterial({
        uniforms: { map: { value: initialTex }, uB: { value: 0 }, uO: { value: 1 } },
        vertexShader: VERT, fragmentShader: FRAG,
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      spinGroup.add(mesh);
      // Swap to real image once loaded; canvas texture stays until then
      loader.load(card.img, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        mat.uniforms.map.value = tex;
        initialTex.dispose();
      });
      return mesh;
    });

    /* ── Tick ── */
    let spinRot = 0, curActive = 0, raf = 0, glideT = 0;
    let pitch = 0, pitchTarget = 0;   // pointer-driven cylinder pitch
    const AUTO_SPD = 0.00004;        // slow creep between cards
    const SNAP_AT = THETA * 0.30;   // past this point, commit & glide to the next card
    const MAX_SPIN = 0.00075;        // rad/ms speed cap — keeps the card-to-card glide gradual
    let last = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 50); last = now;
      /* The auto creep is PAUSED while a card change is in flight, so the
         target stays pinned to the snap point and the new card starts
         exactly from its resting position. */
      const settled = Math.abs(targetRef.current - spinRot) <= 0.02;
      if (!isDragRef.current) {
        if (settled) targetRef.current -= AUTO_SPD * dt;
        velRef.current *= 0.88; targetRef.current += velRef.current;
        /* Threshold snap: drift slowly away from the resting card; once the
           creep crosses SNAP_AT, jump the target to the next snap point so the
           lerp below speeds up and glides onto the new card, then creep again. */
        const nearest = Math.round(targetRef.current / THETA) * THETA;
        const over = nearest - targetRef.current;
        if (over > SNAP_AT) targetRef.current = nearest - THETA;
        else if (over < -SNAP_AT) targetRef.current = nearest + THETA;
      }

      /* Glide state — evaluated AFTER the snap so the cap already applies on
         the commit frame. The 0.02 settle threshold keeps the whole
         deceleration inside the glide: at handoff the follow speed is already
         near creep speed, so the new card continues at its slow pace with no
         leftover fast tail. */
      const gliding = Math.abs(targetRef.current - spinRot) > 0.02;
      glideT = gliding ? glideT + dt : 0;

      /* Frame-rate-independent eased follow (≈ the old 0.074/frame at 60fps),
         with a ramped speed cap during glides only: the cap rises from ~15%
         to 100% over the first ~500ms (smoothstep) so the transition
         accelerates from slow, peaks, then the lerp lands it softly. */
      const follow = 1 - Math.exp(-0.0046 * dt);
      let step = (targetRef.current - spinRot) * follow;
      if (!isDragRef.current && gliding) {
        const r = Math.min(glideT / 500, 1);
        const eased = r * r * (3 - 2 * r);
        const max = MAX_SPIN * (0.15 + 0.85 * eased) * dt;
        if (step > max) step = max; else if (step < -max) step = -max;
      }
      spinRot += step;
      spinGroup.rotation.y = spinRot;

      /* Hand-held wobble: ease the pitch toward the pointer-driven target.
         Applied to tiltGroup so it composes with the fixed diagonal tilt. */
      pitch += (pitchTarget - pitch) * (1 - Math.exp(-0.005 * dt));
      tiltGroup.rotation.x = TILT_X + pitch;

      let newActive = 0, maxF = -Infinity;
      meshes.forEach((mesh, i) => {
        const mat = mesh.material as THREE.ShaderMaterial;
        const wt = i * THETA + spinRot, f = Math.cos(wt);
        if (f > maxF) { maxF = f; newActive = i; }
        const ff = Math.max(0, f), fb = Math.max(0, -f);
        mesh.scale.setScalar(0.86 + ff * 0.16);
        mat.uniforms.uB.value = (1 - ff) * 2.8 + fb * 2.2;
        mat.uniforms.uO.value = ff * 0.78 + 0.22 + fb * 0.08;
      });
      if (newActive !== curActive) { curActive = newActive; setActiveIdx(newActive); }

      /* ── Thumbnail progress bars ──
         Driven by the same angles as the rotation, so the bar, the spin and
         the active highlight can never drift out of sync:
         - creep phase  → bar fills as the drift approaches SNAP_AT
         - glide phase  → outgoing card's bar pinned full, incoming stays empty */
      const nearestSnap = Math.round(targetRef.current / THETA) * THETA;
      const prog = Math.min(Math.abs(nearestSnap - targetRef.current) / SNAP_AT, 1);
      const dest = ((-Math.round(targetRef.current / THETA)) % N + N) % N;
      barRefs.current.forEach((bar, i) => {
        if (!bar) return;
        let fill = 0;
        if (i === dest) fill = gliding ? 0 : prog;
        else if (i === curActive && gliding) fill = 1;
        bar.style.transform = `scaleX(${fill})`;
      });

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => { const w = el.clientWidth, h = el.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); };
    window.addEventListener("resize", onResize);
    const onDown = (e: PointerEvent) => { isDragRef.current = true; lastXRef.current = e.clientX; lastTRef.current = performance.now(); velRef.current = 0; el.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      // Pointer height → pitch target (top of the cards = lean toward viewer)
      const r = el.getBoundingClientRect();
      const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      pitchTarget = -ny * HOVER_PITCH;
      if (!isDragRef.current) return;
      const dx = e.clientX - lastXRef.current, dt2 = performance.now() - lastTRef.current + 1;
      targetRef.current += dx * 0.0038; velRef.current = dx * 0.0038 / dt2 * 16;
      lastXRef.current = e.clientX; lastTRef.current = performance.now();
    };
    const onUp = () => { isDragRef.current = false; };
    const onLeave = () => { pitchTarget = 0; };
    el.addEventListener("pointerdown", onDown); el.addEventListener("pointermove", onMove); el.addEventListener("pointerup", onUp); el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowLeft") goPrev(); if (e.key === "ArrowRight") goNext(); };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize); window.removeEventListener("keydown", onKey);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerup", onUp); el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
      renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card = CARDS[activeIdx];

  return (
    <div id="top" className="relative w-full h-dvh overflow-hidden select-none">
      {/* Background image */}
      <div className="absolute inset-0" style={{
        backgroundImage: "url('/cards/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }} />
      {/* Dark overlay so carousel stays legible */}
      <div className="absolute inset-0" style={{ background: "rgba(4,5,14,0.62)" }} />

      {/* Ambient glow per card */}
      <AnimatePresence mode="wait">
        <motion.div key={activeIdx} className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}
          style={{ background: `radial-gradient(ellipse 85% 90% at 58% 55%, ${card.glow}65 0%, transparent 60%)` }} />
      </AnimatePresence>

      {/* Contour lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice">
        {[110, 240, 400, 600, 840, 1120].map(r => (
          <circle key={r} cx={720} cy={450} r={r} stroke="rgba(255,255,255,0.016)" strokeWidth="1" />
        ))}
      </svg>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 115% 115% at 50% 50%, transparent 28%, rgba(0,0,0,0.78) 100%)" }} />

      {/* Canvas — spans only the content area between navbar and bottom bar */}
      <div ref={mountRef} className="absolute left-0 right-0 z-10 cursor-grab active:cursor-grabbing"
        style={{ top: 72, bottom: 60 }} />

      {/* NAVBAR — transparent glass, background visible through empty areas */}
      <nav className="absolute top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-6 sm:px-10 md:px-16"
        style={{
          background: "linear-gradient(180deg, rgba(4,5,14,0.42) 0%, rgba(4,5,14,0.12) 65%, rgba(4,5,14,0) 100%)",
          backdropFilter: "blur(9px)",
          WebkitBackdropFilter: "blur(9px)",
        }}>
        {/* Separator line — bright in the middle, fading at the edges */}
        <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.30) 20%, rgba(255,176,96,0.45) 50%, rgba(255,255,255,0.30) 80%, transparent 100%)" }} />

        {/* LOGO — hex monogram + dual-treatment wordmark */}
        <a href="#" className="flex items-center gap-3">
          <svg className="logo-mark" width="34" height="34" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffd76a" />
                <stop offset="55%" stopColor="#ff8a40" />
                <stop offset="100%" stopColor="#d85a10" />
              </linearGradient>
            </defs>
            {/* Outer hex */}
            <polygon points="20,2 36,11 36,29 20,38 4,29 4,11"
              stroke="url(#logoGrad)" strokeWidth="1.8" fill="rgba(255,138,64,0.05)" />
            {/* Inner hex */}
            <polygon points="20,9 30,14.5 30,25.5 20,31 10,25.5 10,14.5"
              stroke="rgba(255,255,255,0.30)" strokeWidth="1" fill="none" />
            {/* Curved "C" with a 3D depth echo */}
            <path d="M25.8 14.6 A7.6 7.6 0 1 0 25.8 25.4"
              stroke="url(#logoGrad)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M28.2 17.2 A7.6 7.6 0 0 1 28.2 22.8"
              stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
          <span className="flex flex-col leading-none">
            <span className="text-[17px] tracking-[0.18em]" style={{ fontFamily: "var(--font-anton),sans-serif" }}>
              <span className="logo-grad">CURVED</span>
              <span className="logo-outline">3D</span>
            </span>
            <span className="mt-1.5 text-[9px] tracking-[0.40em] text-white/65"
              style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>
              CAROUSEL EXPERIENCE
            </span>
          </span>
        </a>

        {/* CENTER NAV — quick-jump to each scroll dimension */}
        <div className="hidden md:flex items-center gap-12 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} className="nav-link text-[11px] tracking-[0.30em]"
              style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600 }}>{l.label}</a>
          ))}
        </div>

        {/* RIGHT — about */}
        <button onClick={() => setAboutOpen(true)}
          className="nav-link text-[11px] tracking-[0.30em]"
          style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600, background: "none", border: "none" }}>
          ABOUT
        </button>
      </nav>
      <AboutOverlay open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <CardGallery open={galleryOpen} onClose={() => setGalleryOpen(false)} />

      {/* LEFT INFO */}
      <div className="absolute left-10 z-40 pointer-events-none"
        style={{ bottom: "clamp(60px,10vh,110px)", maxWidth: 400 }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeIdx}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: "easeOut" }}>
            {/* Pill badges */}
            <div className="flex items-center gap-2.5 mb-4">
              {card.hot && (
                <span className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] px-3.5 py-1.5 rounded-full text-white"
                  style={{
                    background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.16)",
                    backdropFilter: "blur(8px)", fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600,
                  }}>
                  🔥 HOT
                </span>
              )}
              <span className="text-[10px] tracking-[0.26em] px-3.5 py-1.5 rounded-full text-white/70"
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(8px)", fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600,
                }}>
                {card.cat}
              </span>
            </div>
            {/* Title */}
            <h1 className="font-black leading-none text-white mb-3"
              style={{ fontSize: "clamp(44px,5vw,76px)", fontFamily: "var(--font-anton),sans-serif", textShadow: `0 0 56px ${card.glow}90, 0 2px 24px rgba(0,0,0,0.6)` }}>
              {card.title}
            </h1>
            {/* Description — uppercase, letterspaced */}
            <p className="text-[11.5px] uppercase tracking-[0.20em] leading-relaxed text-white/55 mb-7 max-w-[340px]"
              style={{ fontFamily: "var(--font-barlow),sans-serif", fontWeight: 500 }}>
              {card.desc}
            </p>
            {/* CTA — white pill inside a per-card gradient ring */}
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="pointer-events-auto inline-block rounded-full p-[2px]"
              style={{ background: `linear-gradient(115deg, ${card.hi} 0%, ${card.acc} 45%, rgba(255,255,255,0.55) 100%)`, boxShadow: `0 0 28px ${card.glow}70` }}>
              <button className="rounded-full bg-white text-black text-[11px] tracking-[0.30em] font-bold px-10 py-3.5 hover:bg-white/92 transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-oxanium),sans-serif" }}>
                {card.cta}
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ARROWS */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3">
        <motion.button onClick={goNext} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-11 h-11 rounded-full flex items-center justify-center border border-white/18 hover:border-white/48 hover:bg-white/09 transition-all"
          style={{ backdropFilter: "blur(8px)" }}>
          <svg width="12" height="12" viewBox="0 0 12 12"><polygon points="2,1 11,6 2,11" fill="rgba(255,255,255,0.70)" /></svg>
        </motion.button>
        <motion.button onClick={goPrev} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-full flex items-center justify-center border border-white/12 hover:border-white/36 transition-all"
          style={{ backdropFilter: "blur(8px)" }}>
          <svg width="10" height="10" viewBox="0 0 12 12"><polygon points="10,1 1,6 10,11" fill="rgba(255,255,255,0.52)" /></svg>
        </motion.button>
      </div>

      {/* BOTTOM RIGHT — card thumbnails */}
      <div className="absolute bottom-7 right-8 z-40 flex items-center gap-5">
        <button onClick={() => setGalleryOpen(true)}
          className="text-[9px] tracking-[0.32em] text-white/45 hover:text-white/80 transition-colors cursor-pointer"
          style={{ fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600, background: "none", border: "none" }}>SEE ALL CARDS ▶</button>
        <div className="flex items-center gap-2">
          {CARDS.map((cd, i) => {
            const active = i === activeIdx;
            return (
              /* Fixed 48px box + constant 2px border: nothing in the row can
                 shift or jump when the active card changes */
              <button key={cd.id} onClick={() => goTo(i)}
                className="relative overflow-hidden rounded-lg cursor-pointer transition-[border-color,box-shadow] duration-300"
                style={{
                  width: 48, height: 48,
                  border: active ? "2px solid rgba(255,255,255,0.95)" : "2px solid rgba(255,255,255,0.10)",
                  boxShadow: active ? `0 0 20px ${card.glow}80, 0 4px 12px rgba(0,0,0,0.5)` : "none",
                }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cd.img} alt={cd.title} draggable={false}
                  className="absolute inset-0 w-full h-full object-cover transition-[filter] duration-300"
                  style={{ filter: active ? "none" : "brightness(0.42) saturate(0.75)" }} />
                {/* Progress: track + fill (fill is animated from the render loop) */}
                <span className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: "rgba(0,0,0,0.45)" }} />
                <span ref={el => { barRefs.current[i] = el; }}
                  className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-white"
                  style={{ transform: "scaleX(0)" }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* DOTS — fixed size, scale via transform so neighbours never shift */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5">
        {CARDS.map((cd, i) => (
          <button key={cd.id} onClick={() => goTo(i)}
            className="rounded-full cursor-pointer transition-[background,transform,box-shadow] duration-300"
            style={{
              width: 7, height: 7,
              background: i === activeIdx ? card.acc : "rgba(255,255,255,0.18)",
              transform: i === activeIdx ? "scale(1.45)" : "scale(1)",
              boxShadow: i === activeIdx ? `0 0 10px ${card.acc}` : "none",
            }} />
        ))}
      </div>
    </div>
  );
}
