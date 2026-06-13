"use client";

import { useEffect, useRef } from "react";
import lottie, { type AnimationItem } from "lottie-web";

/* ═══════════════════════════════════════════════════════════════
   LOTTIE — thin imperative wrapper around lottie-web.
   ─────────────────────────────────────────────────────────────
   Loads a Bodymovin JSON, autoplays on a loop and tears the
   instance down on unmount. `play` lets a parent freeze the frames
   while the animation is parked off-screen (cheap when idle).
   `fit` maps to the SVG preserveAspectRatio: "meet" letterboxes,
   "slice" fills the box like background-size: cover.
═══════════════════════════════════════════════════════════════ */
export default function Lottie({
  path,
  className,
  style,
  loop = true,
  fit = "meet",
  play = true,
  speed = 1,
  onComplete,
}: {
  path: string;
  className?: string;
  style?: React.CSSProperties;
  loop?: boolean;
  fit?: "meet" | "slice";
  play?: boolean;
  speed?: number;
  onComplete?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);
  // keep the latest callback without re-creating the animation
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useEffect(() => {
    if (!hostRef.current) return;
    const anim = lottie.loadAnimation({
      container: hostRef.current,
      renderer: "svg",
      loop,
      autoplay: true,
      path,
      rendererSettings: { preserveAspectRatio: `xMidYMid ${fit}` },
    });
    anim.setSpeed(speed);
    const onDone = () => completeRef.current?.();
    anim.addEventListener("complete", onDone);
    animRef.current = anim;
    return () => {
      anim.removeEventListener("complete", onDone);
      anim.destroy();
      animRef.current = null;
    };
  }, [path, loop, fit, speed]);

  useEffect(() => {
    const anim = animRef.current;
    if (!anim) return;
    if (play) anim.play();
    else anim.pause();
  }, [play]);

  return <div ref={hostRef} className={className} style={style} />;
}
