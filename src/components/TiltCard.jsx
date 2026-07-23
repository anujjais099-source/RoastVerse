import { useRef } from "react";

// Lightweight 3D tilt wrapper — rotates on pointer move for a "gen-z" interactive feel.
export default function TiltCard({ children, className, glow }) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const point = e.touches ? e.touches[0] : e;
    const rect = el.getBoundingClientRect();
    const px = (point.clientX - rect.left) / rect.width;
    const py = (point.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 12;
    const rotateX = -(py - 0.5) * 12;
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015,1.015,1.015)`;
    if (glow) {
      el.style.setProperty("--glow-x", `${px * 100}%`);
      el.style.setProperty("--glow-y", `${py * 100}%`);
    }
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onTouchMove={handleMove}
      onTouchEnd={reset}
      className={`tilt-card ${className || ""}`}
    >
      {children}
    </div>
  );
}
