import { Trophy, Crown } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function RewardModal() {
  const { rewardShown, setRewardShown } = useApp();

  if (!rewardShown) return null;

  return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6" onClick={() => setRewardShown(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm c-bg-surface-solid rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full flame-grad flex items-center justify-center mx-auto mb-5 floaty">
              <Trophy size={36} className="text-white" />
            </div>
            <h3 className="font-display font-700 text-2xl c-text-text-1 mb-2">Reward Unlocked!</h3>
            <p className="c-text-text-2 text-sm mb-6">
              You hit 10,000 points and unlocked the <span className="font-600">Legendary Roaster</span> badge 🏆
            </p>
            <button
              onClick={() => setRewardShown(false)}
              className="w-full flex items-center justify-center gap-2 font-display font-600 py-3.5 rounded-2xl flame-grad text-white glow-pink"
            >
              <Crown size={17} /> Claim Reward
            </button>
          </div>
        </div>
  );
}
