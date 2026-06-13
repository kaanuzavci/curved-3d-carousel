"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import * as THREE from "three";

/* ── kart verisi ── */
const CARDS = [
  { title: "NEXUS",     cat: "MARKETPLACE",  bg: "#020c1e", accent: "#2060c8", glow: "#0a2060" },
  { title: "FORGE",     cat: "STUDIO",       bg: "#020d02", accent: "#20a840", glow: "#082010" },
  { title: "SLAB CASH", cat: "COLLECTIBLES", bg: "#100504", accent: "#d04000", glow: "#401000" },
  { title: "VOID",      cat: "DEFI",         bg: "#08001a", accent: "#9020d0", glow: "#280050" },
  { title: "SURGE",     cat: "LAUNCHPAD",    bg: "#020c0c", accent: "#00b0b0", glow: "#003838" },
  { title: "ARC",       cat: "BRIDGE",       bg: "#0c0800", accent: "#d08020", glow: "#403008" },
] as const;

const N       = CARDS.length;                  // 6
const STEP    = (Math.PI * 2) / N;             // 60°
const RADIUS  = 480;                           // silindir yarıçapı
const CARD_W  = 530;
const CARD_H  = 355;
/*
 * CAM_Z > 2 * RADIUS koşulu kritik:
 * θ_critical = arccos(R/Z) > 60° olmalı ki
 * ±60°'deki kartlar FrontSide ile görünür kalsın.
 * 480 / 1200 = 0.4 → arccos(0.4) ≈ 66° > 60° ✓
 */
const CAM_Z   = 1200;
/*
 * Görsel tilt çarpanı: 1 = tam silindir (yan kartlar çok ince),
 * 0.55 = ApeChain benzeri geniş yüz görünümü.
 * Backface riski: n·(cam-pos) = sin(θ*T)*(-R*sinθ) + cos(θ*T)*(Z-R*cosθ)
 * θ=60°,T=0.55,R=480,Z=1200 → ≈+578 > 0 ✓ FrontSide güvenli.
 */
const TILT    = 0.55;

/* ── hex rengi RGB'ye ── */
function h2rgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

/* ── Canvas dokusu ── */
function buildTexture(card: (typeof CARDS)[number]): THREE.CanvasTexture {
  const W = 640, H = 436;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d")!;

  /* arka plan */
  c.fillStyle = card.bg;
  c.fillRect(0, 0, W, H);

  /* arka ışıma */
  const { r, g, b } = h2rgb(card.glow);
  const grd = c.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, W * 0.54);
  grd.addColorStop(0,   `rgba(${r},${g},${b},0.65)`);
  grd.addColorStop(0.5, `rgba(${r},${g},${b},0.22)`);
  grd.addColorStop(1,   "rgba(0,0,0,0)");
  c.fillStyle = grd;
  c.fillRect(0, 0, W, H);

  /* halka görseli */
  const { r: ar, g: ag, b: ab } = h2rgb(card.accent);
  for (let i = 1; i <= 4; i++) {
    c.beginPath();
    c.ellipse(W / 2, H * 0.41, i * 62, i * 48, 0, 0, Math.PI * 2);
    c.strokeStyle = `rgba(${ar},${ag},${ab},${0.28 - i * 0.05})`;
    c.lineWidth   = 1.5;
    c.stroke();
  }

  /* merkez orb */
  const orb = c.createRadialGradient(W / 2, H * 0.41, 0, W / 2, H * 0.41, 56);
  orb.addColorStop(0,   `rgba(${ar},${ag},${ab},0.92)`);
  orb.addColorStop(0.5, `rgba(${ar},${ag},${ab},0.30)`);
  orb.addColorStop(1,   "rgba(0,0,0,0)");
  c.fillStyle = orb;
  c.beginPath();
  c.ellipse(W / 2, H * 0.41, 56, 44, 0, 0, Math.PI * 2);
  c.fill();

  /* alt solma */
  const fade = c.createLinearGradient(0, H * 0.46, 0, H);
  fade.addColorStop(0, "rgba(0,0,0,0)");
  fade.addColorStop(1, "rgba(0,0,0,0.96)");
  c.fillStyle = fade;
  c.fillRect(0, H * 0.46, W, H * 0.54);

  /* kategori rozeti */
  const bw = card.cat.length * 8.2 + 22;
  c.fillStyle   = "rgba(255,255,255,0.10)";
  c.strokeStyle = "rgba(255,255,255,0.22)";
  c.lineWidth   = 1;
  c.fillRect(28, H - 126, bw, 24);
  c.strokeRect(28, H - 126, bw, 24);
  c.fillStyle = "rgba(255,255,255,0.72)";
  c.font      = "600 11px Arial, sans-serif";
  c.fillText(card.cat, 36, H - 109);

  /* başlık */
  c.fillStyle = "#ffffff";
  const fs = card.title.length > 8 ? 44 : card.title.length > 5 ? 52 : 62;
  c.font = `900 ${fs}px 'Arial Black', Arial, sans-serif`;
  c.fillText(card.title, 28, H - 68);

  /* CTA düğme */
  c.fillStyle = "#ffffff";
  c.fillRect(28, H - 52, 92, 34);
  c.fillStyle = "#000000";
  c.font      = "700 11px Arial, sans-serif";
  c.fillText("LAUNCH", 46, H - 29);

  return new THREE.CanvasTexture(cv);
}

/* ── GLSL: gaussian blur + opaklık ── */
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D map;
  uniform float     uBlur;
  uniform float     uOpacity;
  varying vec2      vUv;

  void main() {
    vec4  col  = vec4(0.0);
    float wSum = 0.0;

    for (float x = -3.0; x <= 3.0; x += 1.0) {
      for (float y = -2.0; y <= 2.0; y += 1.0) {
        float w  = (4.0 - abs(x)) * (3.0 - abs(y));
        vec2  uv = clamp(vUv + vec2(x, y) * uBlur * 0.0024, 0.001, 0.999);
        col  += texture2D(map, uv) * w;
        wSum += w;
      }
    }

    col /= wSum;
    col.a *= uOpacity;
    gl_FragColor = col;
  }
`;

/* ── Dışarıdan erişilen metotlar ── */
export interface CarouselHandle {
  prev: () => void;
  next: () => void;
}

interface Props {
  onActiveChange?: (index: number) => void;
}

const ThreeCarousel = forwardRef<CarouselHandle, Props>(({ onActiveChange }, ref) => {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const targetRotRef  = useRef(0);
  const groupRotRef   = useRef(0);
  const autoTimerRef  = useRef(0);   /* burada tutulunca useImperativeHandle da erişebilir */
  const onChangeCbRef = useRef(onActiveChange);

  useEffect(() => { onChangeCbRef.current = onActiveChange; }, [onActiveChange]);

  useImperativeHandle(ref, () => ({
    prev: () => { autoTimerRef.current = 0; targetRotRef.current += STEP; },
    next: () => { autoTimerRef.current = 0; targetRotRef.current -= STEP; },
  }));

  useEffect(() => {
    const canvas = canvasRef.current!;
    let W = canvas.clientWidth  || window.innerWidth;
    let H = canvas.clientHeight || window.innerHeight;

    /* ── renderer ── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);

    /* ── sahne / kamera ── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 1, 8000);
    camera.position.z = CAM_Z;

    /* ── arka plan halkaları ── */
    const ringMat = new THREE.LineBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.028,
    });
    [160, 300, 480, 700, 980, 1340].forEach(r => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 80; i++) {
        const a = (i / 80) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, -750));
      }
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat));
    });

    /* ── kart mesh'leri ── */
    const geom = new THREE.PlaneGeometry(CARD_W, CARD_H);

    const meshes = CARDS.map((card) => {
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          map:      { value: buildTexture(card) },
          uBlur:    { value: 0.0 },
          uOpacity: { value: 1.0 },
        },
        vertexShader:   VERT,
        fragmentShader: FRAG,
        transparent:    true,
        depthWrite:     false,
        side:           THREE.FrontSide,
      });
      const mesh = new THREE.Mesh(geom, mat);
      scene.add(mesh);
      return mesh;
    });

    /* ── animasyon durumu ── */
    let isDragging   = false;
    let dragStartX   = 0;
    let dragStartRot = 0;
    let lastX        = 0;
    let velocity     = 0;
    let lastActive   = -1;
    autoTimerRef.current = 0;

    function snap(rot: number): number {
      return Math.round(rot / STEP) * STEP;
    }

    function getActive(rot: number): number {
      let best = 0, bestCos = -Infinity;
      for (let i = 0; i < N; i++) {
        const f = Math.cos(i * STEP + rot);
        if (f > bestCos) { bestCos = f; best = i; }
      }
      return best;
    }

    /* ── etkileşim yöneticileri ── */
    const onDown = (cx: number) => {
      isDragging             = true;
      autoTimerRef.current   = 0;
      dragStartX   = cx;
      dragStartRot = targetRotRef.current;
      lastX        = cx;
      velocity     = 0;
    };
    const onMove = (cx: number) => {
      if (!isDragging) return;
      velocity             = cx - lastX;
      lastX                = cx;
      const d              = (cx - dragStartX) / W;
      targetRotRef.current = dragStartRot + d * Math.PI * 2.5;
      groupRotRef.current  = targetRotRef.current;
    };
    const onUp = () => {
      if (!isDragging) return;
      isDragging           = false;
      targetRotRef.current = snap(targetRotRef.current + velocity * 0.016);
    };

    const onMD = (e: MouseEvent) => onDown(e.clientX);
    const onMM = (e: MouseEvent) => onMove(e.clientX);
    const onTS = (e: TouchEvent) => onDown(e.touches[0].clientX);
    const onTM = (e: TouchEvent) => onMove(e.touches[0].clientX);

    canvas.addEventListener("mousedown",  onMD);
    window.addEventListener("mousemove",  onMM);
    window.addEventListener("mouseup",    onUp);
    canvas.addEventListener("touchstart", onTS, { passive: true });
    window.addEventListener("touchmove",  onTM, { passive: true });
    window.addEventListener("touchend",   onUp);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { autoTimerRef.current = 0; targetRotRef.current = snap(targetRotRef.current - STEP); }
      if (e.key === "ArrowLeft")  { autoTimerRef.current = 0; targetRotRef.current = snap(targetRotRef.current + STEP); }
    };
    window.addEventListener("keydown", onKey);

    const onResize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    /* ── animasyon döngüsü ── */
    let rafId: number;

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      /* otomatik ilerleme: drag/klavye/düğme sonrası 220 kare (~3.7s) beklenir */
      if (!isDragging) {
        autoTimerRef.current++;
        if (autoTimerRef.current >= 220) {
          autoTimerRef.current = 0;
          targetRotRef.current = snap(targetRotRef.current - STEP);
        }
      } else {
        autoTimerRef.current = 0;
      }

      /* yumuşak geçiş */
      groupRotRef.current += (targetRotRef.current - groupRotRef.current) * 0.065;
      const gr = groupRotRef.current;

      /* her kartı güncelle */
      meshes.forEach((mesh, i) => {
        const worldAngle = i * STEP + gr;

        /*
         * Kart pozisyonu silindir yüzeyinde.
         * Rotasyon: her kart doğrudan kameraya bakar (lookAt yerine atan2).
         * Bu, silindirin içinden dışa bakan yüzeyi kameranın her zaman görmesini sağlar.
         */
        const px = RADIUS * Math.sin(worldAngle);
        const pz = RADIUS * Math.cos(worldAngle);
        mesh.position.set(px, 0, pz);

        /*
         * Kısmi tilt: kart, silindir açısının TILT kadar katını döner.
         * TILT=1 → tam silindir (yan kartlar çok ince, cos60°=%50).
         * TILT=0.55 → ~33° dönüş, cos33°=%84 genişlik → ApeChain görünümü.
         */
        mesh.rotation.y = worldAngle * TILT;

        /* kart ne kadar "öne" baktığı (1=tam ön, -1=tam arka) */
        const facing = Math.cos(worldAngle);

        const mat = mesh.material as THREE.ShaderMaterial;

        /* blur: önde sıfır, kenara döndükçe artar */
        mat.uniforms.uBlur.value    = Math.max(0, (1 - Math.max(0, facing)) * 1.8);
        /* opaklık: önde tam, arkada sıfır */
        mat.uniforms.uOpacity.value = Math.max(0, facing * 0.70 + 0.36);
        /* ölçek: öndeki kart hafif büyük */
        mesh.scale.setScalar(0.84 + Math.max(0, facing) * 0.18);

        /* arkaya dönmüş kartlar tamamen gizle */
        mesh.visible = facing > -0.15;
      });

      /* aktif kart bildirimi */
      const active = getActive(gr);
      if (active !== lastActive) {
        lastActive = active;
        onChangeCbRef.current?.(active);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("mousedown",  onMD);
      window.removeEventListener("mousemove",  onMM);
      window.removeEventListener("mouseup",    onUp);
      canvas.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchmove",  onTM);
      window.removeEventListener("touchend",   onUp);
      window.removeEventListener("keydown",    onKey);
      window.removeEventListener("resize",     onResize);
      meshes.forEach(m => {
        (m.material as THREE.ShaderMaterial).uniforms.map.value?.dispose();
        (m.material as THREE.ShaderMaterial).dispose();
      });
      geom.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ cursor: "grab" }}
    />
  );
});

ThreeCarousel.displayName = "ThreeCarousel";
export default ThreeCarousel;
