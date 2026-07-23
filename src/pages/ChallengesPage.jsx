import { Target, Gem, Check } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ChallengesPage() {
  const { points, getChallenges } = useApp();

  return (
        <section className="max-w-5xl mx-auto px-6 pt-10 pb-28">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Target size={20} className="text-[#FF4D8D]" />
                <h2 className="font-display font-700 text-2xl c-text-text-1">Challenges</h2>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-700 px-3 py-1.5 rounded-full flame-grad text-white">
                <Gem size={12} /> {points.toLocaleString()} pts
              </span>
            </div>
            <p className="c-text-text-2 text-sm mb-6">Complete these this session — each roast is +10 pts, each challenge is +20 pts 🎯</p>

            <div className="space-y-3">
              {getChallenges().map((c) => {
                const complete = c.done >= c.total;
                return (
                  <div key={c.id} className={`card-surface border rounded-2xl p-4 shadow-sm ${complete ? "border-[#FF4D8D]/30" : "c-border-border-10"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-600 c-text-text-1">{c.label}</span>
                      {complete ? (
                        <span className="flex items-center gap-1 text-[10px] font-700 px-2 py-1 rounded-full flame-grad text-white">
                          <Check size={12} /> +20 pts
                        </span>
                      ) : (
                        <span className="text-xs c-text-text-2">{c.done}/{c.total}</span>
                      )}
                    </div>
                    <div className="w-full h-1.5 rounded-full c-bg-border-10 overflow-hidden">
                      <div className="h-full flame-grad" style={{ width: `${Math.min(100, (c.done / c.total) * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 card-surface border c-border-border-10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-600 c-text-text-2">Progress to 10,000 pt reward</span>
                <span className="text-xs font-700 c-text-text-1">{Math.min(points, 10000).toLocaleString()} / 10,000</span>
              </div>
              <div className="w-full h-2 rounded-full c-bg-border-10 overflow-hidden">
                <div className="h-full flame-grad" style={{ width: `${Math.min(100, (points / 10000) * 100)}%` }} />
              </div>
            </div>
          </div>
        </section>
  );
}
