"use client";

import { useEffect, useRef, useState } from "react";

/* Synthesized forest ambience (no audio asset needed): filtered noise
   becomes flowing water + soft wind; sparse oscillator blips become
   distant birdsong. Starts only on the user's tap (autoplay-safe). */
export default function AmbientSound() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const birdTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (birdTimer.current) clearTimeout(birdTimer.current);
    ctxRef.current?.close();
  }, []);

  const start = () => {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterRef.current = master;

    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05; b1 = 0.96 * b1 + white * 0.08; b2 = 0.90 * b2 + white * 0.10;
      data[i] = (b0 + b1 + b2 + white * 0.1) * 0.4;
    }
    const mkNoise = () => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; };

    const water = mkNoise();
    const wf = ctx.createBiquadFilter(); wf.type = "bandpass"; wf.frequency.value = 1100; wf.Q.value = 0.7;
    const wg = ctx.createGain(); wg.gain.value = 0.5;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.25;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.18; lfo.connect(lfoG); lfoG.connect(wg.gain); lfo.start();
    water.connect(wf); wf.connect(wg); wg.connect(master);

    const wind = mkNoise();
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 380;
    const windG = ctx.createGain(); windG.gain.value = 0.3;
    wind.connect(lp); lp.connect(windG); windG.connect(master);

    const chirp = () => {
      if (!ctxRef.current) return;
      const now = ctx.currentTime;
      const notes = 1 + Math.floor(Math.random() * 3);
      for (let n = 0; n < notes; n++) {
        const o = ctx.createOscillator(); o.type = "sine";
        const g = ctx.createGain();
        const f = 1900 + Math.random() * 1500;
        const tt = now + n * 0.1;
        o.frequency.setValueAtTime(f, tt);
        o.frequency.exponentialRampToValueAtTime(f * 1.35, tt + 0.06);
        g.gain.setValueAtTime(0, tt);
        g.gain.linearRampToValueAtTime(0.06, tt + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.13);
        o.connect(g); g.connect(master); o.start(tt); o.stop(tt + 0.16);
      }
      birdTimer.current = window.setTimeout(chirp, 2500 + Math.random() * 6000);
    };
    birdTimer.current = window.setTimeout(chirp, 1500);

    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5);
  };

  const toggle = () => {
    if (!on) { start(); setOn(true); }
    else {
      const m = masterRef.current, c = ctxRef.current;
      if (m && c) m.gain.linearRampToValueAtTime(0, c.currentTime + 0.6);
      if (birdTimer.current) { clearTimeout(birdTimer.current); birdTimer.current = null; }
      setTimeout(() => { ctxRef.current?.close(); ctxRef.current = null; }, 700);
      setOn(false);
    }
  };

  return (
    <button onClick={toggle}
      className="pointer-events-auto flex items-center gap-3 rounded-full px-5 py-2.5 text-[10px] tracking-[0.34em] text-[#eafbe6] transition-colors"
      style={{
        fontFamily: "var(--font-oxanium),sans-serif", fontWeight: 600,
        background: "rgba(10,30,22,0.32)", border: "1px solid rgba(234,251,230,0.28)", backdropFilter: "blur(8px)",
      }}>
      <span className="relative flex h-3 items-end gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="w-[2px] rounded-full bg-current"
            style={{ height: on ? `${4 + ((i % 2) ? 8 : 5)}px` : "3px", animation: on ? `eq 0.9s ease-in-out ${i * 0.12}s infinite` : "none", opacity: on ? 1 : 0.5 }} />
        ))}
      </span>
      {on ? "SOUND ON" : "TURN ON SOUND"}
      <style>{`@keyframes eq{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}`}</style>
    </button>
  );
}
