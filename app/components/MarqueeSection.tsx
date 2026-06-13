"use client";

/* ═══════════════════════════════════════════════════════════════
   MARQUEE — the band that sits right after the cube.
   ─────────────────────────────────────────────────────────────
   Two stacked rows of heavy uppercase words, each word trailed by a
   small rounded thumbnail. The top row drifts left, the bottom row
   drifts right, both looping forever. Each row's track holds the
   word list twice, so translating it exactly one copy-width and
   restarting reads as one endless ribbon (no visible seam).
═══════════════════════════════════════════════════════════════ */

type Item = { word: string; img: string };

const ROW_TOP: Item[] = [
  { word: "PROPERTY", img: "/cards/otherside.jpg" },
  { word: "COLLECTIBLES", img: "/cards/bayc.jpg" },
  { word: "FINANCE", img: "/cards/void.jpg" },
  { word: "INTANGIBLES", img: "/cards/arc.jpg" },
  { word: "MARKETPLACE", img: "/cards/nexus.jpg" },
];

const ROW_BOTTOM: Item[] = [
  { word: "INFRASTRUCTURE", img: "/cards/surge.jpg" },
  { word: "GAMES", img: "/cards/forge.jpg" },
  { word: "IDENTITY", img: "/cards/ape.jpg" },
  { word: "REWARDS", img: "/cards/background.jpg" },
];

function Cell({ word, img, reverse }: Item & { reverse?: boolean }) {
  return (
    <span className="mq-cell inline-flex items-center gap-[clamp(18px,2.4vw,44px)] pr-[clamp(18px,2.4vw,44px)]">
      <span
        className={`mq-word leading-none whitespace-nowrap${reverse ? " mq-word-rev" : ""}`}
        style={{
          fontFamily: "var(--font-anton),sans-serif",
          fontSize: "clamp(48px,9vw,128px)",
          letterSpacing: "0.01em",
        }}
      >
        {word}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img}
        alt=""
        draggable={false}
        className="block object-cover rounded-[18px]"
        style={{
          width: "clamp(64px,8vw,116px)",
          height: "clamp(64px,8vw,116px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
        }}
      />
    </span>
  );
}

function Row({ items, dir, speed, reverse }: { items: Item[]; dir: "left" | "right"; speed: number; reverse?: boolean }) {
  // Two back-to-back copies → a track exactly 2× the content wide; sliding it
  // by one copy (−50% for left, +50% for right) and looping is seamless.
  const doubled = [...items, ...items];
  return (
    <div className="relative flex w-max" style={{ animation: `mq-${dir} ${speed}s linear infinite` }}>
      {doubled.map((it, i) => (
        <Cell key={`${it.word}-${i}`} {...it} reverse={reverse} />
      ))}
    </div>
  );
}

export default function MarqueeSection() {
  return (
    <section className="relative overflow-hidden bg-[#dce8fb] py-[clamp(28px,5vw,72px)]">
      <div className="flex flex-col gap-[clamp(14px,2vw,34px)]">
        <Row items={ROW_TOP} dir="left" speed={42} />
        <Row items={ROW_BOTTOM} dir="right" speed={48} reverse />
      </div>

      <style>{`
        /* red sweeps in horizontally on hover (gradient clipped to the text) */
        .mq-word {
          background: linear-gradient(90deg, #e01a1a 0%, #e01a1a 50%, #000 50%, #000 100%);
          background-size: 200% 100%;
          background-position: 100% 0;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          transition: background-position 0.5s ease;
        }
        .mq-word:hover { background-position: 0% 0; }
        /* 2nd row: the exact opposite — red sweeps in from the right.
           Override only the image + position so the text-clip from .mq-word
           survives (the background shorthand would reset background-clip). */
        .mq-word-rev {
          background-image: linear-gradient(90deg, #000 0%, #000 50%, #e01a1a 50%, #e01a1a 100%);
          background-position: 0% 0;
        }
        .mq-word-rev:hover { background-position: 100% 0; }
        @keyframes mq-left  { from { transform: translate3d(0,0,0) }   to { transform: translate3d(-50%,0,0) } }
        @keyframes mq-right { from { transform: translate3d(-50%,0,0) } to { transform: translate3d(0,0,0) } }
        @media (prefers-reduced-motion: reduce){
          .mq-cell { }
          section [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
