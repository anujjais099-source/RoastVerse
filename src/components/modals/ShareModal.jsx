import { X, Flame, Image as ImageIcon, MessageCircle, Share2, Download, Copy, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function ShareModal() {
  const {
    shareOpen, setShareOpen, generatingCard, cardImg, shareNative,
    shareWhatsApp, downloadCard, copyRoastText, copied,
  } = useApp();

  if (!shareOpen) return null;

  return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6" onClick={() => setShareOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm c-bg-surface-solid rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
              <div>
                <p className="font-display font-700 text-base c-text-text-1">Share Your Roast</p>
                <p className="text-[11px] c-text-text-2-70">Let the world laugh 😄</p>
              </div>
              <button onClick={() => setShareOpen(false)} className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center">
                <X size={16} className="c-text-text-1" />
              </button>
            </div>

            <div className="px-5 py-4 overflow-y-auto">
              <div className="rounded-2xl overflow-hidden border c-border-border-10 c-bg-surface2 aspect-[9/16] max-h-[52vh] mx-auto flex items-center justify-center">
                {generatingCard && (
                  <div className="flex flex-col items-center gap-2 c-text-text-2">
                    <Flame size={26} className="text-[#FF4D8D] pulse-slow" fill="#FF4D8D" />
                    <span className="text-xs">Rendering card…</span>
                  </div>
                )}
                {!generatingCard && cardImg && (
                  <img src={cardImg} alt="Roast card" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5">
                <button onClick={shareNative} className="flex flex-col items-center gap-1.5 group">
                  <span className="w-12 h-12 rounded-full flex items-center justify-center flame-grad group-active:scale-95 transition">
                    <ImageIcon size={18} className="text-white" />
                  </span>
                  <span className="text-[11px] font-600 c-text-text-1 text-center leading-tight">Instagram<br />Stories</span>
                </button>
                <button onClick={shareWhatsApp} className="flex flex-col items-center gap-1.5 group">
                  <span className="w-12 h-12 rounded-full flex items-center justify-center bg-[#25D366] group-active:scale-95 transition">
                    <MessageCircle size={18} className="text-white" />
                  </span>
                  <span className="text-[11px] font-600 c-text-text-1 text-center leading-tight">WhatsApp</span>
                </button>
                <button onClick={shareNative} className="flex flex-col items-center gap-1.5 group">
                  <span className="w-12 h-12 rounded-full flex items-center justify-center bg-[#7C3AED]/10 border c-border-border-15 group-active:scale-95 transition">
                    <Share2 size={18} className="text-[#7C3AED]" />
                  </span>
                  <span className="text-[11px] font-600 c-text-text-1 text-center leading-tight">More<br />Options</span>
                </button>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={downloadCard} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border c-border-border-15 text-sm font-600 c-text-text-1 hv-surface2 transition">
                  <Download size={15} /> Download
                </button>
                <button onClick={copyRoastText} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border c-border-border-15 text-sm font-600 c-text-text-1 hv-surface2 transition">
                  {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
                  {copied ? "Copied" : "Copy text"}
                </button>
              </div>
            </div>
          </div>
        </div>
  );
}
