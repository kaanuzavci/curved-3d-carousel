"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "./FadeIn";

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", date: "", time: "", guests: "2", note: "" });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const inputClass = (name: string) =>
    `w-full bg-transparent border-b py-3 text-[#f5f0e8] text-sm placeholder:text-[#d4c9b0]/25 outline-none transition-colors duration-300 ${
      focused === name ? "border-[#c9a84c]" : "border-[#2a241c]"
    }`;

  return (
    <section id="contact" className="py-32 px-6 bg-[#0a0805] relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#c9a84c]/4 blur-[100px] rounded-full" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10">
        {/* Left */}
        <div className="flex flex-col gap-8">
          <FadeIn>
            <p className="text-[#c9a84c] text-xs tracking-[0.5em] uppercase">Bize Ulaşın</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-light leading-tight tracking-[-0.02em] text-[#f5f0e8]">
              Masanızı
              <br />
              <span className="gold-gradient">Ayırtın</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-[#d4c9b0]/50 leading-relaxed max-w-sm">
              Özel günler, iş toplantıları veya sadece kendinize ayırdığınız bir öğleden sonra için
              yerinizi garantileyin.
            </p>
          </FadeIn>

          <FadeIn delay={0.3} className="flex flex-col gap-6 pt-4">
            {[
              { label: "Adres", value: "Karaköy, Galata Cd. No:12\nBeşiktaş, Istanbul" },
              { label: "Telefon", value: "+90 212 000 00 00" },
              { label: "E-posta", value: "merhaba@karakahve.com" },
              { label: "Çalışma Saatleri", value: "Her gün 08:00 — 21:00" },
            ].map((item) => (
              <div key={item.label} className="flex gap-6 items-start">
                <span className="text-[10px] tracking-widest uppercase text-[#c9a84c]/60 pt-0.5 min-w-[80px]">
                  {item.label}
                </span>
                <span className="text-[#d4c9b0]/70 text-sm leading-relaxed whitespace-pre-line">
                  {item.value}
                </span>
              </div>
            ))}
          </FadeIn>
        </div>

        {/* Right — form */}
        <FadeIn direction="left" delay={0.2}>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full gap-6 py-16 text-center"
              >
                <div className="w-16 h-16 border border-[#c9a84c]/40 rounded-full flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l4.5 4.5L16 6" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase">Alındı</p>
                <p className="text-[#f5f0e8] text-xl font-light">Rezervasyonunuz için teşekkürler</p>
                <p className="text-[#d4c9b0]/50 text-sm max-w-xs leading-relaxed">
                  24 saat içinde e-posta ile onay gönderilecek.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs tracking-widest uppercase text-[#c9a84c]/60 hover:text-[#c9a84c] transition-colors duration-200"
                >
                  Yeni Rezervasyon
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-8"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      onFocus={() => setFocused("name")}
                      onBlur={() => setFocused(null)}
                      placeholder="Adınız"
                      required
                      className={inputClass("name")}
                    />
                  </div>
                  <div>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      placeholder="E-posta"
                      required
                      className={inputClass("email")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <input
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      onFocus={() => setFocused("date")}
                      onBlur={() => setFocused(null)}
                      required
                      className={`${inputClass("date")} [color-scheme:dark]`}
                    />
                  </div>
                  <div>
                    <select
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      onFocus={() => setFocused("time")}
                      onBlur={() => setFocused(null)}
                      required
                      className={`${inputClass("time")} [&>option]:bg-[#1a1610]`}
                    >
                      <option value="" disabled>Saat seçin</option>
                      {timeSlots.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <select
                    name="guests"
                    value={form.guests}
                    onChange={handleChange}
                    onFocus={() => setFocused("guests")}
                    onBlur={() => setFocused(null)}
                    className={`${inputClass("guests")} [&>option]:bg-[#1a1610]`}
                  >
                    {[1,2,3,4,5,6].map((n) => (
                      <option key={n} value={n}>{n} kişi</option>
                    ))}
                  </select>
                </div>

                <div>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    onFocus={() => setFocused("note")}
                    onBlur={() => setFocused(null)}
                    placeholder="Notunuz (opsiyonel)"
                    rows={3}
                    className={`${inputClass("note")} resize-none`}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="relative group w-full py-4 bg-[#c9a84c] text-[#0a0805] text-sm tracking-widest uppercase font-medium overflow-hidden"
                >
                  <span className="relative z-10">Rezervasyonu Tamamla</span>
                  <div className="absolute inset-0 bg-[#e8c97a] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </FadeIn>
      </div>
    </section>
  );
}
