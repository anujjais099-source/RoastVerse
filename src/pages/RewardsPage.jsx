import { Gift, Sparkles, Flame, Gem, Image as ImageIcon, Swords, Crown, Trophy, Lock, Check } from "lucide-react";
import { useApp } from "../context/AppContext";
import TiltCard from "../components/TiltCard";

export default function RewardsPage() {
  const { claimedDays, setClaimedDays } = useApp();

  return (
        <section className="max-w-5xl mx-auto px-6 pt-10 pb-28">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <Gift size={20} className="text-[#FF4D8D]" />
              <h2 className="font-display font-700 text-2xl c-text-text-1">Weekly Rewards</h2>
            </div>
            <p className="c-text-text-2 text-sm mb-6">Check in daily to unlock roast perks 🎁</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { day: "Day 1", reward: "Mild pack", icon: <Sparkles size={16} /> },
                { day: "Day 2", reward: "1 Extra Roast", icon: <Flame size={16} /> },
                { day: "Day 3", reward: "Savage unlock", icon: <Gem size={16} /> },
                { day: "Day 4", reward: "Custom card", icon: <ImageIcon size={16} /> },
                { day: "Day 5", reward: "Battle boost", icon: <Swords size={16} /> },
                { day: "Day 6", reward: "Gold frame", icon: <Crown size={16} /> },
                { day: "Day 7", reward: "Legendary roast", icon: <Trophy size={16} /> },
              ].map((r, i) => {
                const claimed = claimedDays.includes(i);
                const locked = i > claimedDays.length;
                const card = (
                  <button
                    disabled={locked}
                    onClick={() => !claimed && setClaimedDays((d) => [...d, i])}
                    className={`w-full rounded-2xl p-4 text-left border transition ${
                      claimed
                        ? "flame-grad text-white border-transparent"
                        : locked
                        ? "c-border-border-10 card-surface opacity-50"
                        : "c-border-border-15 card-surface hover:border-[#FF4D8D]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={claimed ? "text-white" : "text-[#FF4D8D]"}>{locked ? <Lock size={16} /> : r.icon}</span>
                      {claimed && <Check size={14} />}
                    </div>
                    <p className={`text-xs font-600 ${claimed ? "text-white/85" : "c-text-text-2"}`}>{r.day}</p>
                    <p className={`font-display font-700 text-sm ${claimed ? "text-white" : "c-text-text-1"}`}>{r.reward}</p>
                  </button>
                );
                return locked ? (
                  <div key={i}>{card}</div>
                ) : (
                  <TiltCard key={i} glow className="tilt-glow rounded-2xl">
                    {card}
                  </TiltCard>
                );
              })}
            </div>
          </div>
        </section>
  );
}
