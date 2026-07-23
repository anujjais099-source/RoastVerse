import { Settings, Moon, Sun, ChevronDown } from "lucide-react";
import { useApp } from "../context/AppContext";
import { LANGUAGES } from "../lib/i18n";

export default function SettingsPage() {
  const { darkMode, setDarkMode, lang, setLang, t, roastCount, bestScore, points } = useApp();

  return (
        <section className="max-w-5xl mx-auto px-6 pt-10 pb-28">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <Settings size={20} className="text-[#FF4D8D]" />
              <h2 className="font-display font-700 text-2xl c-text-text-1">Settings</h2>
            </div>
            <p className="c-text-text-2 text-sm mb-6">Make RoastVerse yours ⚙️</p>

            <div className="card-surface border c-border-border-10 rounded-3xl divide-y divide-[var(--border-10)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <span className="flex items-center gap-2.5 text-sm font-600 c-text-text-1">
                  {darkMode ? <Moon size={17} /> : <Sun size={17} />} {t("darkMode")}
                </span>
                <button
                  onClick={() => setDarkMode((d) => !d)}
                  className={`w-11 h-6 rounded-full flex items-center px-0.5 transition ${darkMode ? "bg-[#7C3AED] justify-end" : "c-bg-border-25 justify-start"}`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow" />
                </button>
              </div>
              <div className="px-5 py-4">
                <label className="block text-xs font-600 c-text-text-2 mb-2">{t("language")}</label>
                <div className="relative">
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="w-full appearance-none c-bg-surface2 border c-border-border-10 rounded-xl px-4 py-3 text-sm outline-none c-text-text-1"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 c-text-text-2-50 pointer-events-none" />
                </div>
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <span className="text-sm font-600 c-text-text-1">Roasts this session</span>
                <span className="text-sm c-text-text-2">{roastCount}</span>
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <span className="text-sm font-600 c-text-text-1">Best Friendship Score</span>
                <span className="text-sm c-text-text-2">{bestScore || "—"}</span>
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <span className="text-sm font-600 c-text-text-1">Total Points</span>
                <span className="text-sm font-700 text-[#FF4D8D]">{points.toLocaleString()} / 10,000</span>
              </div>
            </div>
          </div>
        </section>
  );
}
