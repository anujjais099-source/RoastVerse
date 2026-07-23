import { X, Flame, Eye, EyeOff, Check } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { COUNTRIES } from "../../lib/constants";

export default function AuthModal() {
  const {
    authOpen, setAuthOpen, authMode, setAuthMode,
    authUsername, setAuthUsername, authEmail, setAuthEmail,
    authCountry, setAuthCountry, authPassword, setAuthPassword,
    authConfirm, setAuthConfirm, authShowPw, setAuthShowPw,
    authError, authLoading, authSuccess, usernameStatus,
    normalizeUsername, passwordStrength, handleSignup, handleLogin,
  } = useApp();

  if (!authOpen) return null;

  return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6" onClick={() => !authLoading && setAuthOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="auth-modal-in w-full max-w-sm c-bg-surface-solid rounded-3xl overflow-hidden shadow-2xl">
            {authSuccess ? (
              <div className="px-8 py-14 text-center">
                <div className="w-20 h-20 rounded-full flame-grad flex items-center justify-center mx-auto mb-5 success-pop">
                  <Check size={34} className="text-white" strokeWidth={3} />
                </div>
                <h3 className="font-display font-700 text-xl c-text-text-1 mb-1">
                  {authMode === "signup" ? "Account created!" : "Logged in!"}
                </h3>
                <p className="c-text-text-2 text-sm">@{normalizeUsername(authUsername)}</p>
              </div>
            ) : (
              <>
                <div className="flame-grad px-6 pt-7 pb-6 text-center text-white relative">
                  <button onClick={() => setAuthOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center">
                    <X size={15} />
                  </button>
                  <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-3">
                    <Flame size={26} fill="white" />
                  </div>
                  <h3 className="font-display font-700 text-xl">
                    {authMode === "signup" ? "Save your points" : "Welcome back"}
                  </h3>
                  <p className="text-xs text-white/75 mt-1">
                    {authMode === "signup" ? "You've used your 3 free roasts — create an account to keep going." : "Log in to load your saved points."}
                  </p>
                </div>

                <form
                  className="px-6 py-6 max-h-[60vh] overflow-y-auto"
                  onSubmit={(e) => {
                    e.preventDefault();
                    authMode === "signup" ? handleSignup() : handleLogin();
                  }}
                >
                  {authMode === "signup" && (
                    <>
                      <label className="block text-xs font-600 c-text-text-2 mb-2">Email</label>
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        autoComplete="email"
                        autoCapitalize="none"
                        className="w-full c-bg-surface2 border c-border-border-15 rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-[#FF4D8D]/60 c-text-text-1"
                      />

                      <label className="block text-xs font-600 c-text-text-2 mb-2">Country</label>
                      <div className="relative mb-4">
                        <select
                          value={authCountry}
                          onChange={(e) => setAuthCountry(e.target.value)}
                          className="w-full appearance-none c-bg-surface2 border c-border-border-15 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF4D8D]/60 c-text-text-1"
                        >
                          <option value="">Select country</option>
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 c-text-text-2-50 pointer-events-none" />
                      </div>
                    </>
                  )}

                  <label className="block text-xs font-600 c-text-text-2 mb-2">Username</label>
                  <div className="relative mb-4">
                    <input
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      placeholder="e.g. roast_king"
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      className="w-full c-bg-surface2 border c-border-border-15 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-[#FF4D8D]/60 c-text-text-1"
                    />
                    {authMode === "signup" && authUsername.length >= 3 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameStatus === "checking" && <span className="block w-4 h-4 rounded-full border-2 border-[#FF4D8D]/30 border-t-[#FF4D8D] spin" />}
                        {usernameStatus === "available" && <Check size={16} className="text-green-500" />}
                        {usernameStatus === "taken" && <X size={16} className="text-red-500" />}
                      </span>
                    )}
                  </div>
                  {authMode === "signup" && usernameStatus === "taken" && (
                    <p className="text-[11px] text-red-500 -mt-3 mb-3">@{normalizeUsername(authUsername)} is already taken</p>
                  )}
                  {authMode === "signup" && usernameStatus === "available" && (
                    <p className="text-[11px] text-green-500 -mt-3 mb-3">@{normalizeUsername(authUsername)} is available</p>
                  )}

                  <label className="block text-xs font-600 c-text-text-2 mb-2">Password</label>
                  <div className="relative mb-1.5">
                    <input
                      type={authShowPw ? "text" : "password"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                      className="w-full c-bg-surface2 border c-border-border-15 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-[#FF4D8D]/60 c-text-text-1"
                    />
                    <button type="button" onClick={() => setAuthShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 c-text-text-2">
                      {authShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {authMode === "signup" && authPassword && (
                    <div className="flex gap-1 mb-4">
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} className={`h-1 flex-1 rounded-full ${i < passwordStrength(authPassword) ? "flame-grad" : "c-bg-border-10"}`} />
                      ))}
                    </div>
                  )}
                  {!(authMode === "signup" && authPassword) && <div className="mb-4" />}

                  {authMode === "signup" && (
                    <>
                      <label className="block text-xs font-600 c-text-text-2 mb-2">Confirm Password</label>
                      <input
                        type={authShowPw ? "text" : "password"}
                        value={authConfirm}
                        onChange={(e) => setAuthConfirm(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full c-bg-surface2 border c-border-border-15 rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-[#FF4D8D]/60 c-text-text-1"
                      />
                    </>
                  )}

                  {authError && <p className="text-red-500 text-xs mb-3">{authError}</p>}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-2 font-display font-600 py-3.5 rounded-2xl flame-grad text-white glow-pink disabled:opacity-60 transition"
                  >
                    {authLoading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white spin" />
                        {authMode === "signup" ? "Creating account…" : "Logging in…"}
                      </>
                    ) : authMode === "signup" ? (
                      "Create Account"
                    ) : (
                      "Log In"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode((m) => (m === "signup" ? "login" : "signup"));
                      setAuthError("");
                    }}
                    className="w-full mt-3 text-xs font-600 c-text-text-2"
                  >
                    {authMode === "signup" ? "Already have an account? Log in" : "New here? Create an account"}
                  </button>

                  <p className="text-[10px] c-text-text-2-50 text-center mt-4">Demo account system — don't reuse a real password here.</p>
                </form>
              </>
            )}
          </div>
        </div>
  );
}
