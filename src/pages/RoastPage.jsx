import { Camera, ChevronDown, Flame, Share2, RotateCcw } from "lucide-react";
import { useApp } from "../context/AppContext";
import TiltCard from "../components/TiltCard";
import { LEVELS, RELATIONS } from "../lib/roasts";

export default function RoastPage() {
  const {
    formRef, stage, name, setName, relation, setRelation, level, setLevel,
    photoUrl, error, cookRoast, roast, roastSource, score, openShare, reset,
    handlePhoto,
  } = useApp();

  return (
      <section ref={formRef} className="max-w-5xl mx-auto px-6 pb-28 pt-4 scroll-mt-20">
        <div className="max-w-md mx-auto">
          {stage !== "result" && (
            <>
              <div className="flex items-center justify-center gap-2 mb-8">
                {["form", "cooking", "result"].map((s, i) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      stage === s ? "w-8 bg-[#FF4D8D]" : i === 0 ? "w-1.5 bg-white/20" : "w-1.5 bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {(stage === "home" || stage === "form") && (
            <div className="card-surface border c-border-border-10 rounded-3xl p-6 sm:p-7 shadow-xl shadow-[#7C3AED]/5">
              <h2 className="font-display font-700 text-2xl mb-1 c-text-text-1">Roast your friend</h2>
              <p className="c-text-text-2 text-sm mb-6">Let the AI cook something savage 😈</p>

              <label
                htmlFor="friend-photo-input"
                className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed c-border-border-25 hover:border-[#FF4D8D]/60 flex flex-col items-center justify-center gap-3 mb-6 transition overflow-hidden c-bg-surface2-60 cursor-pointer"
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-11 h-11 rounded-full flame-grad flex items-center justify-center">
                      <Camera size={20} className="text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-600 text-sm c-text-text-1">Upload friend photo</div>
                      <div className="c-text-text-2-70 text-xs mt-0.5">Drag & drop or click to upload</div>
                    </div>
                  </>
                )}
              </label>
              <input id="friend-photo-input" type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

              <label className="block text-xs font-600 c-text-text-2 mb-2">Friend name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter friend name"
                className="w-full c-bg-surface-solid border c-border-border-15 rounded-xl px-4 py-3 text-sm mb-5 outline-none focus:border-[#FF4D8D]/60 placeholder:c-text-text-2-40 c-text-text-1"
              />

              <label className="block text-xs font-600 c-text-text-2 mb-2">Relationship</label>
              <div className="relative mb-5">
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full appearance-none c-bg-surface-solid border c-border-border-15 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF4D8D]/60 c-text-text-1"
                >
                  {RELATIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 c-text-text-2-50 pointer-events-none" />
              </div>

              <label className="block text-xs font-600 c-text-text-2 mb-2">Roast level</label>
              <div className="relative mb-2">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full appearance-none c-bg-surface-solid border c-border-border-15 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF4D8D]/60 c-text-text-1"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 c-text-text-2-50 pointer-events-none" />
              </div>

              {error && <p className="text-[#E11D74] text-xs mt-3">{error}</p>}

              <button
                onClick={cookRoast}
                className="shine-btn w-full mt-6 flex items-center justify-center gap-2 font-display font-600 py-3.5 rounded-2xl flame-grad text-white glow-pink hover:scale-[1.01] active:scale-[0.98] transition"
              >
                <Flame size={17} fill="white" /> Roast Now
              </button>
            </div>
          )}

          {stage === "cooking" && (
            <div className="card-surface border c-border-border-10 rounded-3xl p-10 flex flex-col items-center text-center shadow-xl shadow-[#7C3AED]/5">
              <div className="w-24 h-24 rounded-full flame-grad flex items-center justify-center floaty mb-6">
                <Flame size={40} className="text-white pulse-slow" fill="white" />
              </div>
              <h3 className="font-display font-700 text-xl mb-1 c-text-text-1">Cooking roast...</h3>
              <p className="c-text-text-2 text-sm mb-8">AI is preparing something spicy 🌶️</p>
              <div className="w-full space-y-3 text-left text-sm">
                <div className="flex items-center gap-3 c-bg-surface2-70 rounded-xl px-4 py-3 c-text-text-1">
                  <span className="w-4 h-4 rounded-full bg-[#FF4D8D]/40 flex-shrink-0" /> Studying the photo…
                </div>
                <div className="flex items-center gap-3 c-bg-surface2-70 rounded-xl px-4 py-3 c-text-text-1">
                  <span className="w-4 h-4 rounded-full bg-[#FF4D8D]/40 flex-shrink-0" /> Finding the perfect roast…
                </div>
                <div className="flex items-center gap-3 c-bg-surface2-70 rounded-xl px-4 py-3 c-text-text-1">
                  <span className="w-4 h-4 rounded-full bg-[#FF4D8D]/70 flex-shrink-0 pulse-slow" /> Adding maximum savage power…
                </div>
              </div>
            </div>
          )}

          {stage === "result" && (
            <div className="pop-in">
              <TiltCard glow className="tilt-glow rounded-3xl overflow-hidden border c-border-border-10 depth-shadow">
                <div className="flame-grad px-7 pt-8 pb-7 text-center relative text-white">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden border-2 border-white/50 bg-black/10 flex items-center justify-center">
                    {photoUrl ? (
                      <img src={photoUrl} className="w-full h-full object-cover" alt={name} />
                    ) : (
                      <span className="font-display font-700 text-xl">{name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <p className="text-xs font-600 text-white/85 mb-2">Roast for {name}</p>
                  <p className="font-display font-600 text-lg leading-snug">"{roast}"</p>
                  <p className="text-[10px] text-white/60 mt-3">
                    {roastSource === "ai" ? "✨ AI generated" : "⚡ Generated offline (AI unreachable)"}
                  </p>
                </div>
                <div className="card-surface px-7 py-6">
                  <p className="text-center text-xs c-text-text-2 mb-2">Friendship Score</p>
                  <p className="text-center font-display font-700 text-3xl mb-3 c-text-text-1">{score}%</p>
                  <div className="w-full h-2 rounded-full bg-[#7C3AED]/10 overflow-hidden mb-2">
                    <div className="h-full flame-grad" style={{ width: `${score}%` }} />
                  </div>
                  <p className="text-center text-xs text-[#C0268F]">Strong bond 🤝</p>
                </div>
              </TiltCard>

              <div className="flex flex-col gap-3 mt-5">
                <button onClick={openShare} className="flex items-center justify-center gap-2 font-600 py-3.5 rounded-2xl c-bg-surface-solid border c-border-border-15 hv-surface2 transition c-text-text-1 shadow-sm">
                  <Share2 size={16} /> Share Roast
                </button>
                <button onClick={reset} className="flex items-center justify-center gap-2 font-600 py-3.5 rounded-2xl flame-grad text-white">
                  <RotateCcw size={16} /> Roast Another
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
  );
}
