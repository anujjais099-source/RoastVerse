import { useApp } from "../context/AppContext";

export default function Toasts() {
  const { toasts } = useApp();

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((tst) => (
        <div key={tst.id} className="flame-grad text-white text-xs font-600 px-4 py-2 rounded-full shadow-lg animate-[slideIn_0.2s_ease-out]">
          🔥 {tst.text}
        </div>
      ))}
    </div>
  );
}
