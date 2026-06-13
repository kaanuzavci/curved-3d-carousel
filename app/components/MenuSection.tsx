"use client";

import { motion } from "framer-motion";
import FadeIn from "./FadeIn";

const coffees = [
  {
    name: "Kalita Wave",
    origin: "Etiyopya · Yirgacheffe",
    notes: "Yasemin · Şeftali · Hafif asidite",
    price: "₺120",
    description:
      "Nazik bir demleme yöntemiyle hazırlanan, çiçeksi aroması ve temiz bitişiyle öne çıkan filtre kahvemiz.",
    badge: "Şef Seçimi",
  },
  {
    name: "Cortado",
    origin: "Kolombiya · Huila",
    notes: "Karamel · Fındık · Tatlı kakao",
    price: "₺95",
    description:
      "Eşit oranda espresso ve buharda ısıtılmış süt. Güçlü ama dengeli, günün her saatine uygun.",
    badge: null,
  },
  {
    name: "Cold Brew",
    origin: "Guatemala · Antigua",
    notes: "Bitter çikolata · Derin · Hafif tatlı",
    price: "₺110",
    description:
      "24 saat soğuk su ile demlenmiş, pürüzsüz dokusuyla yaz aylarının favorisi.",
    badge: "Sezonluk",
  },
  {
    name: "Türk Kahvesi",
    origin: "Özel harman",
    notes: "Yoğun · Köpüklü · Geleneksel",
    price: "₺85",
    description:
      "Kum üzerinde, geleneksel yöntemle hazırlanan, ihmal edilmez dibek aromasıyla.",
    badge: null,
  },
  {
    name: "AeroPress",
    origin: "Kenya · Kirinyaga",
    notes: "Siyah frenk üzümü · Domates · Canlı",
    price: "₺130",
    description:
      "Asitliği yüksek, meyvemsi tonlarıyla Kenya çekirdeğinin AeroPress yöntemiyle en parlak hali.",
    badge: "Yeni",
  },
  {
    name: "Cappuccino",
    origin: "Brezilya · Cerrado",
    notes: "Fındık · Tatlı · Kremsi",
    price: "₺90",
    description:
      "Kalın bir süt köpüğü altında, orta kavruluşun tatlı sıcaklığıyla klasik bir Cappuccino.",
    badge: null,
  },
];

function CoffeeCard({ coffee, index }: { coffee: (typeof coffees)[0]; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover="hover"
      className="group relative flex flex-col bg-[#12100a] border border-[#2a241c] overflow-hidden cursor-default"
    >
      {/* Gold top border — grows on hover */}
      <motion.div
        variants={{ hover: { scaleX: 1 } }}
        initial={{ scaleX: 0 }}
        className="absolute top-0 left-0 right-0 h-px bg-[#c9a84c] origin-left transition-transform duration-500"
        style={{ transformOrigin: "left" }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/0 to-transparent group-hover:via-[#c9a84c]/60 transition-all duration-500" />

      <div className="p-6 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[#f5f0e8] text-lg font-medium tracking-tight">{coffee.name}</h3>
              {coffee.badge && (
                <span className="text-[9px] tracking-widest uppercase px-2 py-0.5 border border-[#c9a84c]/40 text-[#c9a84c]">
                  {coffee.badge}
                </span>
              )}
            </div>
            <p className="text-[#8a6e2f] text-xs tracking-wider">{coffee.origin}</p>
          </div>
          <span className="text-[#c9a84c] text-lg font-light shrink-0">{coffee.price}</span>
        </div>

        {/* Tasting notes */}
        <div className="flex gap-2 flex-wrap">
          {coffee.notes.split(" · ").map((note) => (
            <span
              key={note}
              className="text-[10px] tracking-widest uppercase text-[#d4c9b0]/50 bg-[#2a241c]/60 px-2 py-1"
            >
              {note}
            </span>
          ))}
        </div>

        {/* Description — reveals slightly on hover */}
        <p className="text-[#d4c9b0]/50 text-sm leading-relaxed group-hover:text-[#d4c9b0]/75 transition-colors duration-400 flex-1">
          {coffee.description}
        </p>
      </div>

      {/* Bottom action */}
      <div className="px-6 pb-5">
        <motion.div
          variants={{ hover: { opacity: 1, y: 0 } }}
          initial={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.25 }}
          className="w-full text-center py-2.5 text-xs tracking-widest uppercase text-[#c9a84c] border border-[#c9a84c]/20 hover:bg-[#c9a84c]/8 transition-colors duration-200 cursor-pointer"
        >
          Sipariş Ver
        </motion.div>
      </div>

      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#c9a84c]/0 to-[#c9a84c]/0 group-hover:from-[#c9a84c]/3 transition-all duration-700 pointer-events-none" />
    </motion.article>
  );
}

export default function MenuSection() {
  return (
    <section id="menu" className="py-32 px-6 bg-[#0a0805]">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-20">
          <p className="text-[#c9a84c] text-xs tracking-[0.5em] uppercase mb-4">Seçkimiz</p>
          <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light tracking-[-0.02em] text-[#f5f0e8] leading-tight">
            Ustalıkla Hazırlanan
            <br />
            <span className="gold-gradient">Her Bir Fincan</span>
          </h2>
          <div className="w-16 h-px bg-[#c9a84c]/40 mx-auto mt-8" />
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#2a241c]/30">
          {coffees.map((coffee, i) => (
            <CoffeeCard key={coffee.name} coffee={coffee} index={i} />
          ))}
        </div>

        <FadeIn delay={0.3} className="text-center mt-16">
          <a
            href="#contact"
            className="inline-flex items-center gap-3 text-sm tracking-widest uppercase text-[#d4c9b0]/60 hover:text-[#c9a84c] transition-colors duration-300 group"
          >
            <span className="w-8 h-px bg-current transition-all duration-300 group-hover:w-12" />
            Tüm menüyü görmek için bize ulaşın
            <span className="w-8 h-px bg-current transition-all duration-300 group-hover:w-12" />
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
