export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-[#2a241c] bg-[#0a0805]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-[#c9a84c] text-sm tracking-[0.2em] uppercase">Kara Kahve</p>
        <p className="text-[#d4c9b0]/25 text-xs">
          © 2026 Kara Kahve. Tüm hakları saklıdır.
        </p>
        <div className="flex gap-6">
          {["Instagram", "Twitter", "Facebook"].map((s) => (
            <a
              key={s}
              href="#"
              className="text-[10px] tracking-widest uppercase text-[#d4c9b0]/30 hover:text-[#c9a84c] transition-colors duration-300"
            >
              {s}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
