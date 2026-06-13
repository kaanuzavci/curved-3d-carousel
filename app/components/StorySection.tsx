import FadeIn from "./FadeIn";

const stats = [
  { value: "7", label: "Yıllık Deneyim" },
  { value: "12", label: "Tek Köken Çekirdeği" },
  { value: "3", label: "Ödül" },
];

export default function StorySection() {
  return (
    <section id="story" className="py-32 px-6 bg-[#0d0b07] relative overflow-hidden">
      {/* Background detail */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c9a84c]/3 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/4" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left — visual */}
        <FadeIn direction="right">
          <div className="relative">
            {/* Abstract coffee art */}
            <div className="aspect-[4/5] bg-[#1a0f05] relative overflow-hidden">
              {/* Concentric rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[90%] h-[90%] rounded-full border border-[#c9a84c]/8" />
                <div className="absolute w-[65%] h-[65%] rounded-full border border-[#c9a84c]/12" />
                <div className="absolute w-[40%] h-[40%] rounded-full border border-[#c9a84c]/16" />
                <div className="absolute w-[18%] h-[18%] rounded-full bg-[#c9a84c]/8 blur-sm" />
              </div>
              {/* Grain overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#3d1a0a]/20 to-[#0a0805]/60" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-[#c9a84c]/80 text-xs tracking-[0.4em] uppercase">
                  Specialty Coffee
                </p>
                <p className="text-[#f5f0e8]/30 text-xs mt-1">SCA Score 87+</p>
              </div>
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-6 -right-6 bg-[#c9a84c] text-[#0a0805] p-6 w-36">
              <p className="text-4xl font-light leading-none">19</p>
              <p className="text-[9px] tracking-[0.3em] uppercase mt-1 opacity-70">
                Farklı demleme yöntemi
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Right — text */}
        <div className="flex flex-col gap-8">
          <FadeIn delay={0.1}>
            <p className="text-[#c9a84c] text-xs tracking-[0.5em] uppercase">Hikayemiz</p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-light leading-tight tracking-[-0.02em] text-[#f5f0e8]">
              Kahve sadece<br />bir içecek değil,
              <br />
              <em className="gold-gradient not-italic">bir ritüel.</em>
            </h2>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="text-[#d4c9b0]/60 leading-relaxed text-base max-w-md">
              2019'da küçük bir dükkanda başlayan yolculuğumuz, bugün Istanbul'un en seçkin kahve
              mekanlarından biri olmaya evrildi. Her çekirdeği biz seçiyor, her fincanı biz
              hazırlıyoruz.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-[#d4c9b0]/50 leading-relaxed text-base max-w-md">
              Etiyopya yaylalarından Kolombiya vadilerine uzanan tedarik zinciriyle,
              specialty coffee dünyasının en iyilerini sizinle buluşturuyoruz.
            </p>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.5}>
            <div className="flex gap-10 pt-4 border-t border-[#2a241c]">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-light text-[#c9a84c] leading-none">{s.value}</p>
                  <p className="text-[10px] tracking-wider uppercase text-[#d4c9b0]/40 mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
