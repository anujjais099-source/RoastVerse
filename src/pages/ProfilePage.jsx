import { User, Camera, Link as LinkIcon, LogOut, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import TiltCard from "../components/TiltCard";

export default function ProfilePage() {
  const {
    account, points, roastCount, bestScore, openAuth, processPhotoFile,
    updateProfilePic, copyProfileLink, handleLogout, setDeleteConfirmOpen,
  } = useApp();

  return (
        <section className="max-w-5xl mx-auto px-6 pt-10 pb-28">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <User size={20} className="text-[#FF4D8D]" />
              <h2 className="font-display font-700 text-2xl c-text-text-1">Profile</h2>
            </div>

            {!account ? (
              <div className="card-surface border c-border-border-10 rounded-3xl p-8 text-center shadow-xl shadow-[#7C3AED]/5">
                <div className="w-16 h-16 rounded-full flame-grad flex items-center justify-center mx-auto mb-4">
                  <User size={26} className="text-white" />
                </div>
                <h3 className="font-display font-700 text-lg c-text-text-1 mb-1">No account yet</h3>
                <p className="c-text-text-2 text-sm mb-5">Create an account to save your points and get a profile link.</p>
                <button onClick={() => openAuth("signup")} className="w-full flex items-center justify-center gap-2 font-display font-600 py-3.5 rounded-2xl flame-grad text-white glow-pink mb-2">
                  Create Account
                </button>
                <button onClick={() => openAuth("login")} className="w-full py-3 text-sm font-600 c-text-text-2">
                  Already have one? Log in
                </button>
              </div>
            ) : (
              <>
                <TiltCard glow className="tilt-glow rounded-3xl overflow-hidden border c-border-border-10 shadow-xl mb-4">
                  <div className="flame-grad px-6 pt-8 pb-6 text-center text-white relative">
                    <label htmlFor="profile-pic-input" className="w-24 h-24 rounded-full mx-auto mb-3 overflow-hidden border-4 border-white/50 bg-white/15 flex items-center justify-center cursor-pointer relative group">
                      {account.profilePic ? (
                        <img src={account.profilePic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-display font-700 text-3xl">{account.username.charAt(0).toUpperCase()}</span>
                      )}
                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Camera size={20} className="text-white" />
                      </span>
                    </label>
                    <input
                      id="profile-pic-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processPhotoFile(file, updateProfilePic);
                      }}
                    />
                    <p className="font-display font-700 text-xl">@{account.username}</p>
                    <p className="text-xs text-white/70 mt-1">{account.country || ""}</p>
                  </div>
                  <div className="card-surface px-6 py-5 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="font-display font-700 text-lg c-text-text-1">{points.toLocaleString()}</p>
                      <p className="text-[10px] c-text-text-2">Points</p>
                    </div>
                    <div>
                      <p className="font-display font-700 text-lg c-text-text-1">{roastCount}</p>
                      <p className="text-[10px] c-text-text-2">Roasts</p>
                    </div>
                    <div>
                      <p className="font-display font-700 text-lg c-text-text-1">{bestScore || "—"}</p>
                      <p className="text-[10px] c-text-text-2">Best Score</p>
                    </div>
                  </div>
                </TiltCard>

                <div className="card-surface border c-border-border-10 rounded-2xl overflow-hidden mb-3">
                  <div className="px-5 py-3.5 flex items-center justify-between border-b c-border-border-10">
                    <span className="text-xs c-text-text-2">Email</span>
                    <span className="text-xs font-600 c-text-text-1">{account.email || "—"}</span>
                  </div>
                  <div className="px-5 py-3.5 flex items-center justify-between border-b c-border-border-10">
                    <span className="text-xs c-text-text-2">Country</span>
                    <span className="text-xs font-600 c-text-text-1">{account.country || "—"}</span>
                  </div>
                  <div className="px-5 py-3.5 flex items-center justify-between">
                    <span className="text-xs c-text-text-2">Member since</span>
                    <span className="text-xs font-600 c-text-text-1">{new Date(account.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button onClick={copyProfileLink} className="w-full flex items-center justify-center gap-2 font-600 py-3.5 rounded-2xl c-bg-surface-solid border c-border-border-15 hv-surface2 transition c-text-text-1 shadow-sm mb-3">
                  <LinkIcon size={16} /> Copy Profile Link
                </button>

                <div className="card-surface border c-border-border-10 rounded-2xl overflow-hidden">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 text-sm font-600 c-text-text-1 hv-surface2 transition border-b c-border-border-10">
                    <LogOut size={16} /> Log Out
                  </button>
                  <button onClick={() => setDeleteConfirmOpen(true)} className="w-full flex items-center gap-3 px-5 py-4 text-sm font-600 text-red-500 hv-surface2 transition">
                    <Trash2 size={16} /> Delete Account
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
  );
}
