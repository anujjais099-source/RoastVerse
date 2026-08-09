import { useApp } from "../context/AppContext";

// The movable background: free-floating gradient orbs that never stop
// drifting, plus blinking colored dot grids. Same system in light and
// dark mode — only the big sphere swaps from a pale glass look to a
// glowing dark-glass look so it still reads against a dark backdrop.
export default function BackgroundLayers() {
  const { parallax, darkMode } = useApp();
  const bigOrbClass = darkMode ? "orb-dark-glass" : "orb-white";

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 page-bg" />

      <div
        className={`absolute w-[30rem] h-[30rem] -top-28 -right-24 rounded-full ${bigOrbClass} orb-float-a parallax-drift`}
        style={{ translate: `${parallax.x * 20}px ${parallax.y * 14}px` }}
      />
      <div
        className="absolute w-24 h-24 top-[30%] right-[6%] rounded-full orb-purple orb-float-b parallax-drift"
        style={{ translate: `${parallax.x * -30}px ${parallax.y * 22}px` }}
      />
      <div
        className="absolute w-9 h-9 top-[38%] right-[26%] rounded-full orb-purple orb-float-a parallax-drift"
        style={{ translate: `${parallax.x * 34}px ${parallax.y * -18}px`, animationDelay: "1.4s" }}
      />
      <div
        className="absolute w-4 h-4 top-[13%] right-[35%] rounded-full orb-pink orb-float-c parallax-drift"
        style={{ translate: `${parallax.x * -24}px ${parallax.y * 16}px` }}
      />
      <div
        className="absolute w-6 h-6 bottom-[24%] left-[4%] rounded-full orb-purple orb-float-c parallax-drift"
        style={{ translate: `${parallax.x * 26}px ${parallax.y * -20}px`, animationDelay: "2s" }}
      />

      {/* blinking colored dot grids */}
      <div className="absolute w-40 h-32 top-[12%] right-[10%] dot-grid-purple dot-blink" />
      <div className="absolute w-44 h-40 bottom-[4%] right-[1%] dot-grid-orange dot-blink-slow" />

      {darkMode && <div className="absolute inset-0 grain opacity-10" />}
    </div>
  );
}
