import { useEffect } from "react";
import { Image as ImageIcon, Camera, Plus, Send, MessageSquareText } from "lucide-react";
import { useApp } from "../context/AppContext";
import TiltCard from "../components/TiltCard";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function FeedPage() {
  const {
    account, openAuth, processPhotoFile,
    stories, storiesLoading, storyPhoto, setStoryPhoto, postingStory, createStory, openStoryGroup,
    postCaption, setPostCaption, postPhoto, setPostPhoto, posting, createPost,
    posts, postsLoading,
  } = useApp();

  useEffect(() => {
    if (storyPhoto) createStory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyPhoto]);

  const handleStoryFile = (e) => {
    const file = e.target.files?.[0];
    if (file) processPhotoFile(file, setStoryPhoto);
    e.target.value = "";
  };

  const handlePostFile = (e) => {
    const file = e.target.files?.[0];
    if (file) processPhotoFile(file, setPostPhoto);
    e.target.value = "";
  };

  if (!account) {
    return (
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-28">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#EC4899]/12">
              <ImageIcon size={18} className="text-[#EC4899]" />
            </div>
            <h2 className="font-display font-700 text-2xl c-text-text-1">Feed</h2>
          </div>
          <div className="card-surface border c-border-border-10 rounded-3xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 rounded-full flame-grad flex items-center justify-center mx-auto mb-4">
              <ImageIcon size={26} className="text-white" />
            </div>
            <h3 className="font-display font-700 text-lg c-text-text-1 mb-1">Sign in to see your feed</h3>
            <p className="c-text-text-2 text-sm mb-5">Post updates and stories, and see what your friends are up to.</p>
            <button onClick={() => openAuth("signup")} className="w-full flex items-center justify-center gap-2 font-display font-600 py-3.5 rounded-2xl flame-grad text-white glow-pink">
              Create Account
            </button>
          </div>
        </div>
      </section>
    );
  }

  const myStoryGroup = stories.find((g) => g.authorId === account.id);

  return (
    <section className="max-w-5xl mx-auto px-6 pt-10 pb-28">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#EC4899]/12">
            <ImageIcon size={18} className="text-[#EC4899]" />
          </div>
          <h2 className="font-display font-700 text-2xl c-text-text-1">Feed</h2>
        </div>

        {/* stories bar */}
        <div className="flex gap-4 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <label htmlFor="story-file-input" className="relative w-16 h-16 rounded-full cursor-pointer">
              {myStoryGroup ? (
                <span onClick={(e) => { e.preventDefault(); openStoryGroup(myStoryGroup); }} className="block w-16 h-16 rounded-full p-[2.5px] flame-grad">
                  <span className="block w-full h-full rounded-full overflow-hidden border-2 c-border-border-10">
                    {account.profilePic ? (
                      <img src={account.profilePic} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center flame-grad text-white font-display font-700">
                        {account.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                </span>
              ) : (
                <span className="block w-16 h-16 rounded-full overflow-hidden c-bg-surface2 border-2 border-dashed c-border-border-25 flex items-center justify-center">
                  {account.profilePic ? (
                    <img src={account.profilePic} alt="" className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <Camera size={18} className="c-text-text-2" />
                  )}
                </span>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flame-grad flex items-center justify-center border-2 c-border-border-10">
                <Plus size={11} className="text-white" />
              </span>
            </label>
            <input id="story-file-input" type="file" accept="image/*" className="hidden" onChange={handleStoryFile} disabled={postingStory} />
            <span className="text-[10px] c-text-text-2 max-w-[64px] truncate">Your Story</span>
          </div>

          {stories.filter((g) => g.authorId !== account.id).map((g) => (
            <button key={g.authorId} onClick={() => openStoryGroup(g)} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <span className="block w-16 h-16 rounded-full p-[2.5px] flame-grad">
                <span className="block w-full h-full rounded-full overflow-hidden border-2 c-border-border-10">
                  {g.profilePic ? (
                    <img src={g.profilePic} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center flame-grad text-white font-display font-700">
                      {(g.username || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
              </span>
              <span className="text-[10px] c-text-text-2 max-w-[64px] truncate">{g.username}</span>
            </button>
          ))}

          {!storiesLoading && stories.filter((g) => g.authorId !== account.id).length === 0 && (
            <div className="flex items-center text-[11px] c-text-text-2-60 flex-shrink-0 pl-1">Add friends to see their stories</div>
          )}
        </div>

        {/* composer */}
        <TiltCard glow className="tilt-glow card-surface border c-border-border-10 rounded-2xl p-4 mb-6 depth-shadow">
          <textarea
            value={postCaption}
            onChange={(e) => setPostCaption(e.target.value)}
            placeholder="What's roasting?"
            rows={2}
            className="w-full resize-none bg-transparent outline-none text-sm c-text-text-1 placeholder:c-text-text-2-40"
          />
          {postPhoto && (
            <div className="relative mt-2 rounded-xl overflow-hidden">
              <img src={postPhoto} alt="" className="w-full max-h-56 object-cover" />
              <button onClick={() => setPostPhoto(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-xs flex items-center justify-center">✕</button>
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t c-border-border-10">
            <label htmlFor="post-file-input" className="flex items-center gap-1.5 text-xs font-600 c-text-text-2 cursor-pointer hv-surface2 px-2.5 py-1.5 rounded-lg transition">
              <Camera size={15} /> Photo
            </label>
            <input id="post-file-input" type="file" accept="image/*" className="hidden" onChange={handlePostFile} />
            <button
              onClick={createPost}
              disabled={posting || (!postCaption.trim() && !postPhoto)}
              className="flex items-center gap-1.5 text-xs font-700 px-4 py-2 rounded-full flame-grad text-white disabled:opacity-40 transition"
            >
              <Send size={12} /> {posting ? "Posting…" : "Post"}
            </button>
          </div>
        </TiltCard>

        {/* feed */}
        {postsLoading ? (
          <p className="text-center text-sm c-text-text-2 py-8">Loading feed…</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 c-text-text-2">
            <MessageSquareText size={26} className="mx-auto mb-2 c-text-text-2-50" />
            <p className="text-sm">No posts yet — be the first to share something.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <TiltCard key={p.id} glow className="tilt-glow card-surface border c-border-border-10 rounded-2xl overflow-hidden depth-shadow">
                <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2">
                  <span className="w-8 h-8 rounded-full overflow-hidden flame-grad flex items-center justify-center text-white font-display font-700 text-xs flex-shrink-0">
                    {p.author?.profile_pic ? (
                      <img src={p.author.profile_pic} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (p.author?.username || "?").charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="text-sm font-600 c-text-text-1">{p.author?.username}</span>
                  <span className="text-[11px] c-text-text-2-50 ml-auto">{timeAgo(p.created_at)}</span>
                </div>
                {p.caption && <p className="text-sm c-text-text-1 px-4 pb-3 leading-relaxed">{p.caption}</p>}
                {p.photo && <img src={p.photo} alt="" className="w-full max-h-80 object-cover" />}
                {!p.caption && !p.photo && <div className="h-2" />}
                <div className="h-3" />
              </TiltCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
