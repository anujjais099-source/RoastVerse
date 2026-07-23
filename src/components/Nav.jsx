import { Menu, Flame, Gem } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Nav() {
  const { setDrawerOpen, goPage, points, account, openAuth, t } = useApp();

  return (
      <nav className="sticky top-0 z-30 backdrop-blur-md c-bg-surface-a60 border-b c-border-border-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="w-9 h-9 rounded-xl flex items-center justify-center hv-surface2 transition c-text-text-1"
            >
              <Menu size={20} />
            </button>
            <button onClick={() => goPage("home")} className="flex items-center gap-2.5">
              <div style={{ perspective: "300px" }}>
                <div className="w-9 h-9 rounded-xl flame-grad flex items-center justify-center logo-3d">
                  <Flame size={18} className="text-white" fill="white" />
                </div>
              </div>
              <span className="font-display font-700 text-lg tracking-tight">Roast<span className="text-[#FF4D8D]">Verse</span></span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => goPage("challenges")} className="hidden sm:flex items-center gap-1.5 text-xs font-700 px-3 py-2 rounded-full c-bg-surface2 c-text-text-1">
              <Gem size={13} className="text-[#7C3AED]" /> {points.toLocaleString()}
            </button>
            {account ? (
              <button onClick={() => goPage("profile")} className="w-9 h-9 rounded-full overflow-hidden flame-grad flex items-center justify-center border-2 border-white/40 flex-shrink-0">
                {account.profilePic ? (
                  <img src={account.profilePic} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display font-700 text-xs text-white">{account.username.charAt(0).toUpperCase()}</span>
                )}
              </button>
            ) : (
              <button onClick={() => openAuth("signup")} className="hidden sm:block text-xs font-700 px-3 py-2 rounded-full border border-[#FF4D8D]/30 c-text-text-1 hv-surface2 transition">
                Sign Up
              </button>
            )}
            <button
              onClick={() => goPage("roast")}
              className="text-sm font-semibold px-4 py-2 rounded-full flame-grad text-white hover:opacity-90 transition"
            >
              {t("roastMe")} 🔥
            </button>
          </div>
        </div>
      </nav>
  );
}
