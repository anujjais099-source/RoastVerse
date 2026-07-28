import { useApp } from "../context/AppContext";

// The movable background: fire photo pans/rotates least, color glows drift
// more, and TiltCard content on top of it reacts most — a layered parallax
// that reads clearly as depth rather than everything moving in lockstep.
export default function BackgroundLayers() {
  const { parallax } = useApp();

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 page-bg" />

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
    </div>
  );
}
