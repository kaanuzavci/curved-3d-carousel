"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════
   CARD PRISM — a physical, grab-and-spin 3D cube.
   ─────────────────────────────────────────────────────────────
   A square prism with a different card image on each of its six
   faces. Drag to tumble it on both axes; it carries momentum and
   eases to a stop, with a slow idle drift so it always feels alive.
   Same hands-on spirit as the hero cylinder, but free-tumbling.
═══════════════════════════════════════════════════════════════ */

const FACE_IMAGES = [
  "/cards/bayc.jpg",   // +X
  "/cards/ape.jpg",    // -X
  "/cards/forge.jpg",  // +Y
  "/cards/void.jpg",   // -Y
  "/cards/surge.jpg",  // +Z (front)
  "/cards/arc.jpg",    // -Z
];

export default function CardPrism() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let W = el.clientWidth, H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Pulled far enough back that the cube's full space-diagonal stays inside
    // the frustum at every rotation — so corners never clip top/bottom.
    const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9fd0ff, 0.85);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    const loader = new THREE.TextureLoader();
    const mats = FACE_IMAGES.map((src) => {
      // emissive lifts the (often dark) artwork so every face stays bright and
      // legible no matter how it's lit by the moving directional lights.
      const m = new THREE.MeshStandardMaterial({
        color: 0x11161f, roughness: 0.55, metalness: 0.08,
        emissive: 0xffffff, emissiveIntensity: 0,
      });
      loader.load(src, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        m.map = t;
        m.emissiveMap = t;
        m.emissiveIntensity = 0.95;
        m.color.set(0xffffff);
        m.needsUpdate = true;
      });
      return m;
    });

    // square prism (cube); face order matches BoxGeometry: px, nx, py, ny, pz, nz
    const cube = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 2.5), mats);
    scene.add(cube);
    // a glowing wireframe along the edges so the form reads even on dark faces
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(cube.geometry),
      new THREE.LineBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.25 }),
    );
    cube.add(edges);

    // a pleasing starting pose so three faces are visible
    cube.rotation.set(-0.34, 0.6, 0);

    let dragging = false, lastX = 0, lastY = 0;
    let velX = 0, velY = 0;                 // angular velocity around X / Y axes
    let raf = 0, last = performance.now();
    const q = new THREE.Quaternion();
    const eu = new THREE.Euler();

    // world-axis (trackball) rotation so dragging always feels intuitive
    const rotate = (rx: number, ry: number) => {
      eu.set(rx, ry, 0);
      q.setFromEuler(eu);
      cube.quaternion.premultiply(q);
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 50); last = now;
      if (!dragging) {
        rotate(velX, velY);
        velX *= 0.94; velY *= 0.94;         // momentum easing to a stop
        rotate(0, 0.00018 * dt);            // gentle idle drift, keeps it alive
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    const onDown = (e: PointerEvent) => {
      dragging = true; lastX = e.clientX; lastY = e.clientY; velX = 0; velY = 0;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      const ry = dx * 0.01, rx = dy * 0.01;
      rotate(rx, ry);
      velX = rx; velY = ry;                 // hand off the last delta as momentum
    };
    const onUp = () => { dragging = false; };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    const onResize = () => {
      W = el.clientWidth; H = el.clientHeight;
      camera.aspect = W / H; camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      cube.geometry.dispose();
      mats.forEach((m) => { m.map?.dispose(); m.dispose(); });
      (edges.geometry as THREE.BufferGeometry).dispose();
      (edges.material as THREE.Material).dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />;
}
