import { Flame, X, Home, Swords, Target, Trophy, Gift, Settings, User, ChevronDown, Moon, Sun } from "lucide-react";
import { useApp } from "../context/AppContext";
import { NAV_ITEMS } from "../lib/constants";
import { LANGUAGES } from "../lib/i18n";

export default function Drawer() {
  const { drawerOpen, setDrawerOpen, page, goPage, t, lang, setLang, darkMode, setDarkMode } = useApp();

  if (!drawerOpen) return null;

  return (
        <div className="fixed inset-0 z-40 flex" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="drawer-in relative w-72 max-w-[80vw] h-full c-bg-surface-solid flex flex-col shadow-2xl"
          >
            <div className="flex items-center gap-2.5 px-5 py-5 border-b c-border-border-10">
              <div className="w-9 h-9 rounded-xl flame-grad flex items-center justify-center">
                <Flame size={18} className="text-white" fill="white" />
              </div>
              <div>
                <p className="font-display font-700 text-base leading-tight">RoastVerse</p>
                <p className="text-[10px] c-text-text-2-70">AI Roasts. Real Savage.</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="ml-auto w-8 h-8 rounded-full hv-surface2 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3">
              {NAV_ITEMS.map((item) => {
                const Icon = { home: Home, flame: Flame, swords: Swords, target: Target, trophy: Trophy, gift: Gift, settings: Settings, user: User }[item.icon];
                const active = page === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => goPage(item.key)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-600 transition ${
                      active ? "c-bg-surface2 text-[#E11D74]" : "c-text-text-1 hv-surface2"
                    }`}
                  >
                    <Icon size={17} className={active ? "text-[#FF4D8D]" : "c-text-text-2"} />
                    {t(item.labelKey)}
                  </button>
                );
              })}
            </div>

            <div className="border-t c-border-border-10 px-5 py-4 space-y-4">
              <div>
                <label className="block text-[11px] font-600 c-text-text-2 mb-1.5">{t("language")}</label>
                <div className="relative">
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="w-full appearance-none c-bg-surface2 border c-border-border-10 rounded-lg px-3 py-2 text-sm outline-none c-text-text-1"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 c-text-text-2-50 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-600 c-text-text-1">
                  {darkMode ? <Moon size={16} /> : <Sun size={16} />} {t("darkMode")}
                </span>
                <button
                  onClick={() => setDarkMode((d) => !d)}
                  className={`w-11 h-6 rounded-full flex items-center px-0.5 transition ${darkMode ? "bg-[#7C3AED] justify-end" : "c-bg-border-25 justify-start"}`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow" />
                </button>
              </div>
            </div>
          </div>
        </div>
  );
}
