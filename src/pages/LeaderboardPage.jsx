import { useState, useEffect } from "react";
import { Trophy, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import TiltCard from "../components/TiltCard";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const { account, roastCount, points } = useApp();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("username, points, roast_count")
        .order("points", { ascending: false })
        .limit(10);
      if (!cancelled) {
        setRows(data || []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [points]); // refetch after you roast, so your own new score shows up

  const youInTop10 = account && rows.some((r) => r.username === account.username);

  return (
    <section className="max-w-5xl mx-auto px-6 pt-10 pb-28">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={20} className="text-[#FF6A00]" />
          <h2 className="font-display font-700 text-2xl c-text-text-1">Leaderboard</h2>
        </div>
        <p className="c-text-text-2 text-sm mb-6">Top roasters, ranked by points 🏆</p>

        {loading ? (
          <div className="flex items-center justify-center py-16 c-text-text-2">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="c-text-text-2 text-sm text-center py-10">No roasters yet — be the first!</p>
        ) : (
          <div className="space-y-2">
            {rows.map((u, i) => {
              const isYou = account && u.username === account.username;
              return (
                <TiltCard
                  key={u.username}
                  glow
                  className={`tilt-glow flex items-center gap-3 rounded-2xl px-4 py-3 border ${
                    isYou ? "border-[#FF6A00]/40 c-bg-surface2 depth-shadow" : "c-border-border-10 card-surface"
                  }`}
                >
                  <span className="w-6 text-center font-display font-700 text-sm c-text-text-2">{MEDALS[i] || `#${i + 1}`}</span>
                  <span className="w-9 h-9 rounded-full flame-grad flex items-center justify-center text-white font-display font-700 text-sm">
                    {u.username.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex-1 text-sm font-600 c-text-text-1">
                    {u.username}
                    {isYou ? " (you)" : ""}
                  </span>
                  <span className="text-xs c-text-text-2">{(u.points || 0).toLocaleString()} pts</span>
                </TiltCard>
              );
            })}

            {account && !youInTop10 && (
              <TiltCard glow className="tilt-glow flex items-center gap-3 rounded-2xl px-4 py-3 border border-[#FF6A00]/40 c-bg-surface2 depth-shadow mt-4">
                <span className="w-6 text-center font-display font-700 text-sm c-text-text-2">—</span>
                <span className="w-9 h-9 rounded-full flame-grad flex items-center justify-center text-white font-display font-700 text-sm">
                  {account.username.charAt(0).toUpperCase()}
                </span>
                <span className="flex-1 text-sm font-600 c-text-text-1">{account.username} (you)</span>
                <span className="text-xs c-text-text-2">{points.toLocaleString()} pts</span>
              </TiltCard>
            )}

            {!account && (
              <p className="text-center text-xs c-text-text-2 mt-4">
                You've made {roastCount} roast{roastCount === 1 ? "" : "s"} as a guest — sign up to appear on the board.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
