import { useApp } from "../context/AppContext";

// The movable background: fire photo pans/rotates least, color glows drift
// more, and TiltCard content on top of it reacts most — a layered parallax
// that reads clearly as depth rather than everything moving in lockstep.
export default function BackgroundLayers() {
  const { parallax, darkMode } = useApp();

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 page-bg" />

      {darkMode ? (
        <>
          <div
            className="absolute -inset-[3%] bg-photo bg-breathe"
            style={{
              translate: `${parallax.x * -22}px ${parallax.y * -16}px`,
              rotate: `${parallax.x * 1.1}deg`,
            }}
          />

          <div className="absolute inset-0 bg-wash" />

          <div
            className="absolute w-[26rem] h-[26rem] -top-32 -left-24 rounded-full bg-[#B91C1C]/14 blur-[110px] drift-1 parallax-drift"
            style={{ translate: `${parallax.x * 55}px ${parallax.y * 40}px` }}
          />
          <div
            className="absolute w-[24rem] h-[24rem] -bottom-28 -right-16 rounded-full bg-[#FF6A00]/12 blur-[100px] drift-2 parallax-drift"
            style={{ translate: `${parallax.x * -65}px ${parallax.y * -45}px` }}
          />

          <div className="absolute inset-0 grain opacity-10" />
        </>
      ) : (
        <>
          {/* free-floating gradient orbs, always drifting on their own */}
          <div
            className="absolute w-[30rem] h-[30rem] -top-28 -right-24 rounded-full orb-white orb-float-a parallax-drift"
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
        </>
      )}
    </div>
  );
}
