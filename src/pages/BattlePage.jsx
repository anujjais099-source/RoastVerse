import { Swords, Camera, Crown, RotateCcw } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function BattlePage() {
  const {
    battleName1, setBattleName1, battleName2, setBattleName2,
    battlePhoto1, setBattlePhoto1, battlePhoto2, setBattlePhoto2,
    battleStage, battleResult, runBattle, resetBattle, processPhotoFile,
  } = useApp();

  return (
        <section className="max-w-5xl mx-auto px-6 pt-10 pb-28">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <Swords size={20} className="text-[#FF4D8D]" />
              <h2 className="font-display font-700 text-2xl c-text-text-1">Roast Battle</h2>
            </div>
            <p className="c-text-text-2 text-sm mb-6">Two names enter. One roast wins. 😈</p>

            {battleStage === "form" && (
              <div className="card-surface border c-border-border-10 rounded-3xl p-6 shadow-xl shadow-[#7C3AED]/5 space-y-4">
                <div>
                  <label className="block text-xs font-600 c-text-text-2 mb-2">Fighter 1</label>
                  <div className="flex items-center gap-3 mb-2">
                    <label
                      htmlFor="battle-photo-1"
                      className="w-14 h-14 rounded-2xl border-2 border-dashed c-border-border-25 hover:border-[#FF4D8D]/60 flex items-center justify-center overflow-hidden c-bg-surface2 cursor-pointer flex-shrink-0 transition"
                    >
                      {battlePhoto1 ? (
                        <img src={battlePhoto1} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={18} className="c-text-text-2" />
                      )}
                    </label>
                    <input
                      id="battle-photo-1"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processPhotoFile(file, setBattlePhoto1);
                      }}
                    />
                    <input value={battleName1} onChange={(e) => setBattleName1(e.target.value)} placeholder="Enter name" className="flex-1 c-bg-surface-solid border c-border-border-15 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF4D8D]/60 c-text-text-1" />
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-9 h-9 rounded-full flame-grad flex items-center justify-center font-display font-700 text-xs text-white">VS</span>
                </div>
                <div>
                  <label className="block text-xs font-600 c-text-text-2 mb-2">Fighter 2</label>
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="battle-photo-2"
                      className="w-14 h-14 rounded-2xl border-2 border-dashed c-border-border-25 hover:border-[#FF4D8D]/60 flex items-center justify-center overflow-hidden c-bg-surface2 cursor-pointer flex-shrink-0 transition"
                    >
                      {battlePhoto2 ? (
                        <img src={battlePhoto2} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={18} className="c-text-text-2" />
                      )}
                    </label>
                    <input
                      id="battle-photo-2"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processPhotoFile(file, setBattlePhoto2);
                      }}
                    />
                    <input value={battleName2} onChange={(e) => setBattleName2(e.target.value)} placeholder="Enter name" className="flex-1 c-bg-surface-solid border c-border-border-15 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF4D8D]/60 c-text-text-1" />
                  </div>
                </div>
                <button
                  onClick={runBattle}
                  disabled={!battleName1.trim() || !battleName2.trim()}
                  className="w-full flex items-center justify-center gap-2 font-display font-600 py-3.5 rounded-2xl flame-grad text-white glow-pink disabled:opacity-40 transition"
                >
                  <Swords size={17} /> Start Battle
                </button>
              </div>
            )}

            {battleStage === "cooking" && (
              <div className="card-surface border c-border-border-10 rounded-3xl p-10 flex flex-col items-center text-center shadow-xl shadow-[#7C3AED]/5">
                <div className="w-20 h-20 rounded-full flame-grad flex items-center justify-center floaty mb-5">
                  <Swords size={32} className="text-white" />
                </div>
                <h3 className="font-display font-700 text-lg c-text-text-1">Battle in progress…</h3>
                <p className="c-text-text-2 text-sm mt-1">AI is loading both roasts 🔥</p>
              </div>
            )}

            {battleStage === "result" && battleResult && (
              <div className="space-y-4">
                {[
                  { n: battleName1, r: battleResult.r1, s: battleResult.s1, photo: battlePhoto1, src: battleResult.src1 },
                  { n: battleName2, r: battleResult.r2, s: battleResult.s2, photo: battlePhoto2, src: battleResult.src2 },
                ].map((f, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border c-border-border-10 shadow-lg">
                    <div className="flame-grad px-5 py-4 text-white relative flex items-start gap-3">
                      {battleResult.winner === f.n && (
                        <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-700 bg-white/20 px-2 py-1 rounded-full">
                          <Crown size={11} /> WINNER
                        </span>
                      )}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/40">
                        {f.photo ? (
                          <img src={f.photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-display font-700 text-sm">{f.n.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-600 text-white/80 mb-1">{f.n}</p>
                        <p className="font-display font-600 text-base leading-snug">"{f.r}"</p>
                        <p className="text-[9px] text-white/55 mt-1.5">{f.src === "ai" ? "✨ AI generated" : "⚡ Offline"}</p>
                      </div>
                    </div>
                    <div className="card-surface px-5 py-3 flex items-center justify-between">
                      <span className="text-xs c-text-text-2">Savage Score</span>
                      <span className="font-display font-700 text-lg c-text-text-1">{f.s}%</span>
                    </div>
                  </div>
                ))}
                {battleResult.winner === "tie" && (
                  <p className="text-center text-sm font-600 c-text-text-2">It's a tie — both equally savage 🤝</p>
                )}
                <button onClick={resetBattle} className="w-full flex items-center justify-center gap-2 font-600 py-3.5 rounded-2xl flame-grad text-white mt-2">
                  <RotateCcw size={16} /> New Battle
                </button>
              </div>
            )}
          </div>
        </section>
  );
}
