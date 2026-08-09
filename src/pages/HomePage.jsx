import { Sparkles, Flame, Users, Star, Laugh } from "lucide-react";
import { useApp } from "../context/AppContext";
import TiltCard from "../components/TiltCard";

export default function HomePage() {
  const { t, goPage } = useApp();

  return (
      <section className="relative">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-20 relative">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full c-bg-surface-a70 border border-[#7C3AED]/25 text-[#7C3AED] mb-6">
            <Sparkles size={13} /> AI POWERED
          </div>
          <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] font-700 tracking-tight max-w-2xl c-text-text-1">
            {t("heroTitle1")}
            <br />
            <span className="bg-gradient-to-r from-[#FF6A00] via-[#FF3D1F] to-[#B91C1C] bg-clip-text text-transparent grad-text-anim">{t("heroTitle2")}</span>
          </h1>
          <p className="mt-5 c-text-text-2 max-w-md text-[15px] leading-relaxed">
            {t("heroSub")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => goPage("roast")} className="shine-btn flex items-center gap-2 font-display font-600 px-6 py-3.5 rounded-2xl flame-grad text-white glow-pink hover:scale-[1.02] active:scale-[0.98] transition">
              <Flame size={18} fill="white" /> {t("roastMe")}
            </button>
            <button onClick={() => goPage("roast")} className="px-6 py-3.5 rounded-2xl border c-border-border-20 c-bg-surface-a60 hv-surface-solid-hover font-600 transition c-text-text-1">
              😄 {t("surpriseMe")}
            </button>
          </div>

          {/* stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 max-w-2xl">
            {[
              { icon: <Flame size={16} className="text-[#FF6A00]" fill="#FF6A00" />, chip: "bg-[#FF6A00]/12", val: "12,842", label: "Roasts today" },
              { icon: <Users size={16} className="text-[#7C3AED]" />, chip: "bg-[#7C3AED]/12", val: "4,281", label: "Online now" },
              { icon: <Star size={16} className="text-[#F59E0B]" fill="#F59E0B" />, chip: "bg-[#F59E0B]/14", val: "4.9", label: "Avg rating" },
              { icon: <Laugh size={16} className="text-[#FF3D1F]" />, chip: "bg-[#FF3D1F]/12", val: "98%", label: "Laugh rate" },
            ].map((s, i) => (
              <TiltCard key={i} glow className="tilt-glow rounded-2xl border c-border-border-10 card-surface px-4 py-3.5 depth-shadow">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.chip}`}>{s.icon}</div>
                <div className="font-display font-700 text-xl c-text-text-1">{s.val}</div>
                <div className="text-[11px] c-text-text-2-80 mt-0.5">{s.label}</div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>
  );
}
