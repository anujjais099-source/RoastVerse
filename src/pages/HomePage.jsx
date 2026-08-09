import { Sparkles, Flame, Users, Star, Laugh, Smile, ArrowUpRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import TiltCard from "../components/TiltCard";

const SPARK_PATHS = [
  "M2,34 L14,30 L26,32 L38,24 L50,27 L62,17 L74,20 L86,10 L98,13",
  "M2,30 L14,26 L26,29 L38,20 L50,24 L62,14 L74,18 L86,8 L98,12",
  "M2,32 L14,29 L26,31 L38,23 L50,26 L62,16 L74,19 L86,9 L98,6",
  "M2,33 L14,31 L26,33 L38,25 L50,28 L62,18 L74,21 L86,11 L98,4",
];

function Sparkline({ color, path }) {
  const gradId = `spark-${color.replace("#", "")}`;
  return (
    <svg viewBox="0 0 100 40" className="w-full h-9" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L98,40 L2,40 Z`} fill={`url(#${gradId})`} stroke="none" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeroSphere({ darkMode }) {
  return (
    <div className="absolute -top-4 -right-10 sm:right-0 w-64 h-64 sm:w-80 sm:h-80 pointer-events-none select-none z-0">
      <div
        className="absolute w-[26rem] h-[10rem] top-1/2 left-1/2 hero-ring orb-float-b"
        style={{ transform: "translate(-50%, -50%) rotate(-16deg)" }}
      />
      <div className={`absolute inset-2 rounded-full ${darkMode ? "hero-sphere-dark" : "hero-sphere"} orb-float-a`} />
      <div className="absolute w-14 h-14 -bottom-2 -right-2 rounded-full hero-moon orb-float-c" />

      <Star size={16} className="absolute top-6 left-2 text-[#F59E0B] fill-[#F59E0B] twinkle" />
      <Star size={11} className="absolute top-24 -left-4 text-[#8B5CF6] fill-[#8B5CF6] twinkle-slow" />
      <Star size={13} className="absolute bottom-10 right-2 text-[#3B82F6] fill-[#3B82F6] twinkle-slower" />
      <Star size={9} className="absolute top-2 right-16 text-[#EC4899] fill-[#EC4899] twinkle-slow" />
    </div>
  );
}

export default function HomePage() {
  const { t, goPage, darkMode } = useApp();

  return (
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-20 relative">
          <HeroSphere darkMode={darkMode} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full c-bg-surface-a70 border border-[#3B82F6]/25 text-[#3B82F6] mb-6">
              <Sparkles size={13} /> AI POWERED
            </div>
            <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] font-700 tracking-tight max-w-2xl c-text-text-1">
              {t("heroTitle1")}
              <br />
              <span className="bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F97316] bg-clip-text text-transparent grad-text-anim">{t("heroTitle2")}</span>
            </h1>
            <p className="mt-5 c-text-text-2 max-w-md text-[15px] leading-relaxed">
              {t("heroSub")}
            </p>
            <svg width="140" height="14" viewBox="0 0 140 14" className="mt-1 ml-1 text-[#8B5CF6]" fill="none">
              <path d="M2,8 Q20,2 38,8 T74,8 T110,8 T138,6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            </svg>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => goPage("roast")} className="shine-btn flex items-center gap-2 font-display font-600 px-6 py-3.5 rounded-2xl flame-grad text-white glow-pink hover:scale-[1.02] active:scale-[0.98] transition">
                <Flame size={18} fill="white" /> {t("roastMe")}
              </button>
              <button onClick={() => goPage("roast")} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-[#8B5CF6]/30 c-bg-surface-a60 hv-surface-solid-hover font-600 transition c-text-text-1">
                <Smile size={18} className="text-[#8B5CF6]" /> {t("surpriseMe")}
              </button>
            </div>

            {/* stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 max-w-2xl">
              {[
                { icon: <Flame size={16} className="text-white" fill="white" />, color: "#8B5CF6", val: "12,842", label: "Roasts today" },
                { icon: <Users size={16} className="text-white" />, color: "#3B82F6", val: "4,281", label: "Online now" },
                { icon: <Star size={16} className="text-white" fill="white" />, color: "#F59E0B", val: "4.9", label: "Avg rating" },
                { icon: <Laugh size={16} className="text-white" />, color: "#EC4899", val: "98%", label: "Laugh rate" },
              ].map((s, i) => (
                <TiltCard key={i} glow className="tilt-glow relative overflow-hidden rounded-2xl border c-border-border-10 card-surface px-4 py-3.5 depth-shadow">
                  <div
                    className="absolute -bottom-6 -left-4 w-28 h-20 rounded-full blur-2xl opacity-25 pointer-events-none"
                    style={{ backgroundColor: s.color }}
                  />
                  <div className="relative flex items-start justify-between mb-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}CC)` }}
                    >
                      {s.icon}
                    </div>
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${s.color}22`, color: s.color }}
                    >
                      <ArrowUpRight size={11} />
                    </span>
                  </div>
                  <div className="relative font-display font-700 text-xl c-text-text-1">{s.val}</div>
                  <div className="relative text-[11px] c-text-text-2-80 mt-0.5 mb-2">{s.label}</div>
                  <Sparkline color={s.color} path={SPARK_PATHS[i]} />
                </TiltCard>
              ))}
            </div>
          </div>
        </div>
      </section>
  );
}
