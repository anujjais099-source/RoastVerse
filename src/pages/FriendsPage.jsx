import { useEffect, useState } from "react";
import { UserPlus, Search, Check, X, MessageCircle, Users } from "lucide-react";
import { useApp } from "../context/AppContext";
import TiltCard from "../components/TiltCard";

function AvatarCircle({ profilePic, username, size = 40 }) {
  return (
    <span
      className="rounded-full overflow-hidden flame-grad flex items-center justify-center text-white font-display font-700 flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {profilePic ? (
        <img src={profilePic} alt="" className="w-full h-full object-cover" />
      ) : (
        (username || "?").charAt(0).toUpperCase()
      )}
    </span>
  );
}

export default function FriendsPage() {
  const {
    account, openAuth,
    searchResults, searching, searchUsers, searchQuery,
    friends, incomingRequests, outgoingRequestIds, friendsLoading,
    sendFriendRequest, respondToRequest, openChat,
  } = useApp();

  const [localQuery, setLocalQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => searchUsers(localQuery), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQuery]);

  if (!account) {
    return (
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-28">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#3B82F6]/12">
              <UserPlus size={18} className="text-[#3B82F6]" />
            </div>
            <h2 className="font-display font-700 text-2xl c-text-text-1">Friends</h2>
          </div>
          <div className="card-surface border c-border-border-10 rounded-3xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 rounded-full flame-grad flex items-center justify-center mx-auto mb-4">
              <Users size={26} className="text-white" />
            </div>
            <h3 className="font-display font-700 text-lg c-text-text-1 mb-1">Sign in to add friends</h3>
            <p className="c-text-text-2 text-sm mb-5">Search for people by username, send friend requests, and chat once you're connected.</p>
            <button onClick={() => openAuth("signup")} className="w-full flex items-center justify-center gap-2 font-display font-600 py-3.5 rounded-2xl flame-grad text-white glow-pink">
              Create Account
            </button>
          </div>
        </div>
      </section>
    );
  }

  const friendIds = new Set(friends.map((f) => f.id));
  const incomingByUserId = new Map(incomingRequests.map((r) => [r.id, r]));

  return (
    <section className="max-w-5xl mx-auto px-6 pt-10 pb-28">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#3B82F6]/12">
            <UserPlus size={18} className="text-[#3B82F6]" />
          </div>
          <h2 className="font-display font-700 text-2xl c-text-text-1">Friends</h2>
        </div>
        <p className="c-text-text-2 text-sm mb-6">Find people, send requests, and start chatting 💬</p>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 c-text-text-2-50" />
          <input
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search by username"
            className="w-full c-bg-surface-solid border c-border-border-15 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#3B82F6]/60 placeholder:c-text-text-2-40 c-text-text-1"
          />
        </div>

        {localQuery.trim().length >= 2 && (
          <div className="mb-8">
            <p className="text-xs font-700 c-text-text-2-70 uppercase tracking-wide mb-2.5">
              {searching ? "Searching…" : `Results for "${localQuery.trim()}"`}
            </p>
            {!searching && searchResults.length === 0 && (
              <p className="text-sm c-text-text-2 py-3">No one found with that username.</p>
            )}
            <div className="space-y-2">
              {searchResults.map((r) => {
                const isFriend = friendIds.has(r.id);
                const requested = outgoingRequestIds.has(r.id);
                const incoming = incomingByUserId.get(r.id);
                return (
                  <TiltCard key={r.id} glow className="tilt-glow flex items-center gap-3 rounded-2xl px-4 py-3 border c-border-border-10 card-surface">
                    <AvatarCircle profilePic={r.profile_pic} username={r.username} />
                    <span className="flex-1 text-sm font-600 c-text-text-1">{r.username}</span>
                    {isFriend ? (
                      <button onClick={() => openChat({ id: r.id, username: r.username, profilePic: r.profile_pic })} className="flex items-center gap-1.5 text-xs font-700 px-3 py-2 rounded-full bg-[#3B82F6]/12 text-[#3B82F6]">
                        <MessageCircle size={13} /> Chat
                      </button>
                    ) : incoming ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => respondToRequest(incoming.friendshipId, true)} className="w-8 h-8 rounded-full flex items-center justify-center bg-[#8B5CF6]/12 text-[#8B5CF6]">
                          <Check size={14} />
                        </button>
                        <button onClick={() => respondToRequest(incoming.friendshipId, false)} className="w-8 h-8 rounded-full flex items-center justify-center c-bg-surface2 c-text-text-2">
                          <X size={14} />
                        </button>
                      </div>
                    ) : requested ? (
                      <span className="text-xs font-700 px-3 py-2 rounded-full c-bg-surface2 c-text-text-2">Requested</span>
                    ) : (
                      <button onClick={() => sendFriendRequest(r.id)} className="flex items-center gap-1.5 text-xs font-700 px-3 py-2 rounded-full flame-grad text-white">
                        <UserPlus size={13} /> Add
                      </button>
                    )}
                  </TiltCard>
                );
              })}
            </div>
          </div>
        )}

        {incomingRequests.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-700 c-text-text-2-70 uppercase tracking-wide mb-2.5">Friend Requests</p>
            <div className="space-y-2">
              {incomingRequests.map((r) => (
                <TiltCard key={r.friendshipId} glow className="tilt-glow flex items-center gap-3 rounded-2xl px-4 py-3 border border-[#8B5CF6]/30 c-bg-surface2 depth-shadow">
                  <AvatarCircle profilePic={r.profilePic} username={r.username} />
                  <span className="flex-1 text-sm font-600 c-text-text-1">{r.username}</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => respondToRequest(r.friendshipId, true)} className="flex items-center gap-1 text-xs font-700 px-3 py-2 rounded-full flame-grad text-white">
                      <Check size={13} /> Accept
                    </button>
                    <button onClick={() => respondToRequest(r.friendshipId, false)} className="w-8 h-8 rounded-full flex items-center justify-center c-bg-surface2 c-text-text-2">
                      <X size={14} />
                    </button>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-700 c-text-text-2-70 uppercase tracking-wide mb-2.5">
            My Friends {friends.length > 0 && `(${friends.length})`}
          </p>
          {friendsLoading ? (
            <p className="text-sm c-text-text-2 py-3">Loading…</p>
          ) : friends.length === 0 ? (
            <p className="text-sm c-text-text-2 py-3">No friends yet — search for someone above to get started.</p>
          ) : (
            <div className="space-y-2">
              {friends.map((f) => (
                <TiltCard key={f.id} glow className="tilt-glow flex items-center gap-3 rounded-2xl px-4 py-3 border c-border-border-10 card-surface">
                  <AvatarCircle profilePic={f.profilePic} username={f.username} />
                  <span className="flex-1 text-sm font-600 c-text-text-1">{f.username}</span>
                  <button onClick={() => openChat(f)} className="flex items-center gap-1.5 text-xs font-700 px-3 py-2 rounded-full bg-[#3B82F6]/12 text-[#3B82F6]">
                    <MessageCircle size={13} /> Chat
                  </button>
                </TiltCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
