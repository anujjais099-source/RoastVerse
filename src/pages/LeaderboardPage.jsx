import { Trophy } from "lucide-react";
import { useApp } from "../context/AppContext";
import TiltCard from "../components/TiltCard";

export default function LeaderboardPage() {
  const { roastCount } = useApp();

  return (
        <section className="max-w-5xl mx-auto px-6 pt-10 pb-28">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={20} className="text-[#FF4D8D]" />
              <h2 className="font-display font-700 text-2xl c-text-text-1">Leaderboard</h2>
            </div>
            <p className="c-text-text-2 text-sm mb-6">Top roasters this week 🏆</p>

            <div className="space-y-2">
              {[
                { name: "Rahul", roasts: 214, medal: "🥇" },
                { name: "Priya", roasts: 198, medal: "🥈" },
                { name: "Kabir", roasts: 176, medal: "🥉" },
                { name: "Ananya", roasts: 152 },
                { name: "Zaid", roasts: 140 },
                { name: "You", roasts: roastCount, you: true },
              ].map((u, i) => (
                <TiltCard key={i} glow className={`tilt-glow flex items-center gap-3 rounded-2xl px-4 py-3 border ${u.you ? "border-[#FF4D8D]/40 c-bg-surface2 depth-shadow" : "c-border-border-10 card-surface"}`}>
                  <span className="w-6 text-center font-display font-700 text-sm c-text-text-2">{u.medal || `#${i + 1}`}</span>
                  <span className="w-9 h-9 rounded-full flame-grad flex items-center justify-center text-white font-display font-700 text-sm">
                    {u.name.charAt(0)}
                  </span>
                  <span className="flex-1 text-sm font-600 c-text-text-1">{u.name}{u.you ? " (you)" : ""}</span>
                  <span className="text-xs c-text-text-2">{u.roasts} roasts</span>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>
  );
}
