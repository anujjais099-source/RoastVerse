import { X } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function StoryViewer() {
  const { activeStoryGroup, activeStoryIndex, closeStoryViewer, nextStory, prevStory } = useApp();

  if (!activeStoryGroup) return null;
  const item = activeStoryGroup.items[activeStoryIndex];
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 px-4 py-6" onClick={closeStoryViewer}>
      <div onClick={(e) => e.stopPropagation()} className="pop-in relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-black">
        <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex gap-1">
          {activeStoryGroup.items.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white" style={{ width: i < activeStoryIndex ? "100%" : i === activeStoryIndex ? "100%" : "0%" }} />
            </div>
          ))}
        </div>

        <div className="absolute top-6 left-3 right-3 z-10 flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full overflow-hidden flame-grad flex items-center justify-center text-white font-display font-700 text-xs flex-shrink-0 border-2 border-white/60">
            {activeStoryGroup.profilePic ? (
              <img src={activeStoryGroup.profilePic} alt="" className="w-full h-full object-cover" />
            ) : (
              (activeStoryGroup.username || "?").charAt(0).toUpperCase()
            )}
          </span>
          <span className="text-white text-sm font-600 drop-shadow">{activeStoryGroup.username}</span>
          <button onClick={closeStoryViewer} className="ml-auto w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white">
            <X size={16} />
          </button>
        </div>

        {item.photo ? (
          <img src={item.photo} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flame-grad flex items-center justify-center px-8">
            <p className="text-white text-xl font-display font-700 text-center">{item.caption}</p>
          </div>
        )}

        {item.photo && item.caption && (
          <p className="absolute bottom-5 left-4 right-4 text-white text-sm font-600 drop-shadow">{item.caption}</p>
        )}

        <button className="absolute left-0 top-0 w-1/3 h-full" onClick={prevStory} aria-label="Previous story" />
        <button className="absolute right-0 top-0 w-2/3 h-full" onClick={nextStory} aria-label="Next story" />
      </div>
    </div>
  );
}
