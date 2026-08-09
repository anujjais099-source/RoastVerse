import { createContext, useContext, useState, useRef, useEffect } from "react";
import { callGemini, dataUrlToImageBlock } from "../lib/gemini";
import { supabase } from "../lib/supabase";
import { LEVELS, RELATIONS, getLocalRoast } from "../lib/roasts";
import { TRANSLATIONS, LANGUAGES } from "../lib/i18n";
import { COUNTRIES, NAV_ITEMS } from "../lib/constants";

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}

export function AppProvider({ children }) {
  const [page, setPage] = useState("home"); // home | roast | battle | challenges | leaderboard | rewards | settings
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState("en");
  const [stage, setStage] = useState("home"); // home | form | cooking | result
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Friend");
  const [level, setLevel] = useState("Savage 😈");
  const [photoUrl, setPhotoUrl] = useState(null);
  const [roast, setRoast] = useState("");
  const [roastSource, setRoastSource] = useState("ai"); // "ai" | "local"
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [cardImg, setCardImg] = useState(null);
  const [cardBlob, setCardBlob] = useState(null);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [copied, setCopied] = useState(false);
  const [roastCount, setRoastCount] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [usedSavage, setUsedSavage] = useState(false);
  const [claimedDays, setClaimedDays] = useState([]);
  const [points, setPoints] = useState(0);
  const [rewardShown, setRewardShown] = useState(false);
  const [toasts, setToasts] = useState([]);
  const awardedChallengesRef = useRef(new Set());
  const formRef = useRef(null);

  // ---- Account / auth ----
  const [account, setAccount] = useState(null); // { username, email, name, country, profilePic, createdAt }
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup"); // "signup" | "login"
  const [authUsername, setAuthUsername] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authCountry, setAuthCountry] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirm, setAuthConfirm] = useState("");
  const [authShowPw, setAuthShowPw] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState("idle"); // idle | checking | available | taken
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const skipNextSyncRef = useRef(false);
  const usernameCheckRef = useRef(0);

  // pointer parallax for the "4D" background depth effect
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const handlePagePointerMove = (e) => {
    const px = (e.clientX / window.innerWidth - 0.5) * 2;
    const py = (e.clientY / window.innerHeight - 0.5) * 2;
    setParallax({ x: px, y: py });
  };

  const showToast = (text) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  };

  const awardPoints = (amount, reason) => {
    setPoints((p) => p + amount);
    showToast(`+${amount} pts — ${reason}`);
  };

  const t = (key) => (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;

  const goPage = (p) => {
    setPage(p);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const MAX_DIM = 768;

  const processPhotoFile = (file, onDone) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height >= width && height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        onDone(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = () => {
        setError("Couldn't read that photo — try a JPEG or PNG.");
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processPhotoFile(file, setPhotoUrl);
  };

  const cookRoast = async () => {
    if (!name.trim()) {
      setError("This roast needs a target. Enter a name.");
      return;
    }
    if (!account && roastCount >= 3) {
      openAuth("signup");
      return;
    }
    setError("");
    setStage("cooking");

    const imageBlock = photoUrl ? dataUrlToImageBlock(photoUrl) : null;
    const textPrompt = imageBlock
      ? `Look closely at this photo and write ONE short, funny, ${level.split(" ")[0].toLowerCase()}-intensity roast (max 2 sentences, playful not cruel, no slurs, no real harm, no comments on race/body/disability) about a ${relation.toLowerCase()} named ${name}. Reference something specific and visible in the photo — expression, outfit, pose, background, vibe — woven into the joke. Mix in a little casual Hinglish flavor like a witty Indian friend group chat would use (e.g. "bhai", "yaar", "bas", "abhi bhi"), only if it fits naturally — otherwise pure playful English is fine. Return ONLY the roast line, no preamble, no quotes around it.`
      : `Write ONE short, funny, ${level.split(" ")[0].toLowerCase()}-intensity roast (max 2 sentences, playful not cruel, no slurs, no real harm) about a ${relation.toLowerCase()} named ${name}. Mix in a little casual Hinglish flavor like a witty Indian friend group chat would use (e.g. "bhai", "yaar", "bas", "abhi bhi") woven naturally into otherwise English text, only if it fits naturally — otherwise pure playful English is fine. Return ONLY the roast line, no preamble, no quotes around it.`;

    const content = imageBlock ? [imageBlock, { type: "text", text: textPrompt }] : textPrompt;

    const attempt = async (useImage) => {
      const c = useImage ? content : textPrompt;
      return callGemini(c);
    };

    try {
      let text;
      try {
        text = await attempt(true);
      } catch (firstErr) {
        console.warn("RoastVerse first attempt failed, retrying:", firstErr.message);
        await new Promise((r) => setTimeout(r, 900));
        try {
          text = await attempt(true);
        } catch (secondErr) {
          // if it still fails and we had an image, try once more without the image
          // so a photo-specific issue doesn't block the whole feature
          if (imageBlock) {
            console.warn("RoastVerse retrying without image after repeated failure:", secondErr.message);
            text = await attempt(false);
          } else {
            throw secondErr;
          }
        }
      }
      const finalScore = Math.floor(Math.random() * 21) + 78;
      setRoast(text.replace(/^["']|["']$/g, ""));
      setRoastSource("ai");
      setScore(finalScore);
      setRoastCount((c) => c + 1);
      setBestScore((b) => Math.max(b, finalScore));
      if (level.startsWith("Savage")) setUsedSavage(true);
      awardPoints(10, "roast complete");
      setTimeout(() => setStage("result"), 900);
    } catch (err) {
      console.error("RoastVerse AI call failed, using local fallback:", err);
      const finalScore = Math.floor(Math.random() * 21) + 78;
      setRoast(getLocalRoast(name, relation, level).text);
      setRoastSource("local");
      setScore(finalScore);
      setRoastCount((c) => c + 1);
      setBestScore((b) => Math.max(b, finalScore));
      if (level.startsWith("Savage")) setUsedSavage(true);
      awardPoints(10, "roast complete");
      setTimeout(() => setStage("result"), 600);
    }
  };

  const reset = () => {
    setName("");
    setPhotoUrl(null);
    setRoast("");
    setCardImg(null);
    setCardBlob(null);
    setStage("form");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  // ---- Battle mode ----
  const [battleName1, setBattleName1] = useState("");
  const [battleName2, setBattleName2] = useState("");
  const [battlePhoto1, setBattlePhoto1] = useState(null);
  const [battlePhoto2, setBattlePhoto2] = useState(null);
  const [battleStage, setBattleStage] = useState("form"); // form | cooking | result
  const [battleResult, setBattleResult] = useState(null); // { r1, r2, s1, s2, winner }

  const battleRoastPrompt = (n, opponent, hasPhoto) =>
    hasPhoto
      ? `Look at this photo and write ONE short, savage, funny roast (max 1 sentence, playful not cruel, no slurs, no real harm, no comments on race/body/disability) aimed at someone named ${n} who is in a friendly roast battle against ${opponent}. Reference something specific and visible in the photo. Mix in a little casual Hinglish flavor (e.g. "bhai", "yaar", "bas") only if it fits naturally. Return ONLY the roast line, no preamble, no quotes.`
      : `Write ONE short, savage, funny roast (max 1 sentence, playful not cruel, no slurs, no real harm) aimed at someone named ${n} who is in a friendly roast battle against ${opponent}. Mix in a little casual Hinglish flavor (e.g. "bhai", "yaar", "bas") only if it fits naturally. Return ONLY the roast line, no preamble, no quotes.`;

  const runBattle = async () => {
    if (!battleName1.trim() || !battleName2.trim()) return;
    setBattleStage("cooking");

    const img1 = battlePhoto1 ? dataUrlToImageBlock(battlePhoto1) : null;
    const img2 = battlePhoto2 ? dataUrlToImageBlock(battlePhoto2) : null;
    const content1 = img1 ? [img1, { type: "text", text: battleRoastPrompt(battleName1, battleName2, true) }] : battleRoastPrompt(battleName1, battleName2, false);
    const content2 = img2 ? [img2, { type: "text", text: battleRoastPrompt(battleName2, battleName1, true) }] : battleRoastPrompt(battleName2, battleName1, false);

    let r1, r2, src1 = "ai", src2 = "ai", localTemplate1 = null;

    try {
      r1 = await callGemini(content1);
    } catch (e) {
      console.warn("RoastVerse battle AI failed for fighter 1, using local fallback:", e.message);
      const local = getLocalRoast(battleName1, "rival", "Savage 😈");
      r1 = local.text;
      localTemplate1 = local.template;
      src1 = "local";
    }

    try {
      r2 = await callGemini(content2);
    } catch (e) {
      console.warn("RoastVerse battle AI failed for fighter 2, using local fallback:", e.message);
      const local = getLocalRoast(battleName2, "rival", "Savage 😈", localTemplate1);
      r2 = local.text;
      src2 = "local";
    }

    const s1 = Math.floor(Math.random() * 26) + 70;
    const s2 = Math.floor(Math.random() * 26) + 70;
    setBattleResult({
      r1: r1.replace(/^["']|["']$/g, ""),
      r2: r2.replace(/^["']|["']$/g, ""),
      src1,
      src2,
      s1,
      s2,
      winner: s1 === s2 ? "tie" : s1 > s2 ? battleName1 : battleName2,
    });
    setTimeout(() => setBattleStage("result"), 700);
  };

  const resetBattle = () => {
    setBattleName1("");
    setBattleName2("");
    setBattlePhoto1(null);
    setBattlePhoto2(null);
    setBattleResult(null);
    setBattleStage("form");
  };

  // ---- Challenges & points ----
  const getChallenges = () => [
    { id: "roast3", label: "Roast 3 friends", done: Math.min(roastCount, 3), total: 3 },
    { id: "score90", label: "Hit a 90%+ Friendship Score", done: bestScore >= 90 ? 1 : 0, total: 1 },
    { id: "savage", label: "Try Savage level once", done: usedSavage ? 1 : 0, total: 1 },
    { id: "roast5", label: "Roast 5 friends", done: Math.min(roastCount, 5), total: 5 },
  ];

  useEffect(() => {
    getChallenges().forEach((c) => {
      if (c.done >= c.total && !awardedChallengesRef.current.has(c.id)) {
        awardedChallengesRef.current.add(c.id);
        awardPoints(20, c.label);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roastCount, bestScore, usedSavage]);

  useEffect(() => {
    if (points >= 10000 && !rewardShown) {
      setRewardShown(true);
    }
  }, [points, rewardShown]);

  // ---- Account / auth logic (Supabase) ----
  // Supabase Auth handles password hashing, sessions, and email verification
  // server-side — the "profiles" table (see supabase/schema.sql) holds the
  // app-specific data (points, roast count, etc.) linked to each auth user.

  const loadProfile = async (userId) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error || !data) return null;
    return data;
  };

  const applyProfile = (profile) => {
    setAccount({
      id: profile.id,
      username: profile.username,
      email: profile.email || "",
      country: profile.country || "",
      profilePic: profile.profile_pic || null,
      createdAt: profile.created_at,
    });
    setPoints(profile.points || 0);
    setRoastCount(profile.roast_count || 0);
    setBestScore(profile.best_score || 0);
    setUsedSavage(!!profile.used_savage);
  };

  // restore session on load, and stay in sync with login/logout in other tabs
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && !cancelled) {
        const profile = await loadProfile(session.user.id);
        if (profile) {
          skipNextSyncRef.current = true;
          applyProfile(profile);
        }
      }
      if (!cancelled) setSessionChecked(true);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setAccount(null);
        setPoints(0);
        setRoastCount(0);
        setBestScore(0);
        setUsedSavage(false);
        awardedChallengesRef.current = new Set();
      }
    });

    return () => {
      cancelled = true;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // write-through: whenever stats change while logged in, persist to the profile row
  useEffect(() => {
    if (!account?.id) return;
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    (async () => {
      try {
        await supabase
          .from("profiles")
          .update({
            country: account.country || "",
            profile_pic: account.profilePic || null,
            points,
            roast_count: roastCount,
            best_score: bestScore,
            used_savage: usedSavage,
          })
          .eq("id", account.id);
      } catch (e) {
        console.warn("RoastVerse: failed to sync profile", e);
      }
    })();
  }, [account, points, roastCount, bestScore, usedSavage]);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthUsername("");
    setAuthEmail("");
    setAuthCountry("");
    setAuthPassword("");
    setAuthConfirm("");
    setAuthError("");
    setAuthSuccess(false);
    setUsernameStatus("idle");
    setAuthOpen(true);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const normalizeUsername = (u) => u.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

  const normalizeEmail = (e) => e.trim().toLowerCase();

  const passwordStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 4) s++;
    if (pw.length >= 8) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw) || /[A-Z]/.test(pw)) s++;
    return Math.min(s, 4);
  };

  // debounced, real-time "is this username taken" check while signing up
  useEffect(() => {
    if (authMode !== "signup" || !authOpen) return;
    const uname = normalizeUsername(authUsername);
    if (uname.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    const myCheck = ++usernameCheckRef.current;
    const timer = setTimeout(async () => {
      const { data } = await supabase.from("profiles").select("username").eq("username", uname).maybeSingle();
      if (usernameCheckRef.current !== myCheck) return; // a newer check superseded this one
      setUsernameStatus(data ? "taken" : "available");
    }, 400);
    return () => clearTimeout(timer);
  }, [authUsername, authMode, authOpen]);

  const handleSignup = async () => {
    const uname = normalizeUsername(authUsername);
    if (!isValidEmail(authEmail.trim())) return setAuthError("Enter a valid email address.");
    if (!authCountry) return setAuthError("Select your country.");
    if (uname.length < 3) return setAuthError("Username needs at least 3 characters.");
    if (usernameStatus === "taken") return setAuthError("That username is taken.");
    if (authPassword.length < 6) return setAuthError("Password needs at least 6 characters.");
    if (!/[a-zA-Z]/.test(authPassword) || !/[0-9]/.test(authPassword)) {
      return setAuthError("Password needs at least one letter and one number.");
    }
    if (authPassword !== authConfirm) return setAuthError("Passwords don't match.");
    setAuthLoading(true);
    setAuthError("");
    try {
      const { data: existingUsername } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", uname)
        .maybeSingle();
      if (existingUsername) {
        setAuthLoading(false);
        setUsernameStatus("taken");
        return setAuthError("That username is taken.");
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: authEmail.trim(),
        password: authPassword,
        options: {
          data: { username: uname, country: authCountry },
        },
      });

      if (signUpError) {
        setAuthLoading(false);
        if (signUpError.message?.toLowerCase().includes("already registered")) {
          return setAuthError("An account with that email already exists.");
        }
        return setAuthError(signUpError.message || "Couldn't create your account — try again.");
      }

       // Supabase deliberately doesn't always throw a clear error when the
      // email is already registered (to prevent attackers from being able
      // to guess which emails have accounts) — instead it returns success
      // with an empty identities array. Without checking for this, the
      // app would show a fake "Welcome!" without actually creating a new
      // account, silently reusing the existing one instead.
      if (signUpData?.user && Array.isArray(signUpData.user.identities) && signUpData.user.identities.length === 0) {
        setAuthLoading(false);
        return setAuthError("An account with that email already exists. Try logging in instead.");
      }
      
      // if email confirmation is required, there's no session yet — tell the
      // person to check their inbox instead of pretending they're logged in
      if (!signUpData.session) {
        setAuthLoading(false);
        setAuthSuccess(true);
        showToast("Check your email to confirm your account, then log in.");
        setTimeout(() => setAuthOpen(false), 1600);
        return;
      }

      const profile = await loadProfile(signUpData.user.id);
      skipNextSyncRef.current = true;
      if (profile) applyProfile(profile);
      setAuthLoading(false);
      setAuthSuccess(true);
      showToast(`Welcome, ${uname}! Your points are now saved 🎉`);
      setTimeout(() => setAuthOpen(false), 1100);
    } catch (e) {
      setAuthError("Couldn't create your account — try again.");
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    const raw = authUsername.trim();
    if (!raw || !authPassword) return setAuthError("Enter your username or email, and password.");
    setAuthLoading(true);
    setAuthError("");
    try {
      let email = raw;

      // if it looks like a username rather than an email, resolve it via the profiles table
      if (!raw.includes("@")) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", normalizeUsername(raw))
          .maybeSingle();
        if (!profile) {
          setAuthLoading(false);
          return setAuthError("No account with that username.");
        }
        email = profile.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password: authPassword });

      if (error) {
        setAuthLoading(false);
        return setAuthError(error.message?.toLowerCase().includes("invalid") ? "Wrong username/email or password." : error.message);
      }

      const profile = await loadProfile(data.user.id);
      skipNextSyncRef.current = true;
      if (profile) applyProfile(profile);
      setAuthLoading(false);
      setAuthSuccess(true);
      showToast(`Welcome back! 🔥`);
      setTimeout(() => setAuthOpen(false), 1100);
    } catch (e) {
      setAuthError("Something went wrong — try again.");
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAccount(null);
    setPoints(0);
    setRoastCount(0);
    setBestScore(0);
    setUsedSavage(false);
    awardedChallengesRef.current = new Set();
    showToast("Logged out — starting fresh as a guest");
  };

 const handleDeleteAccount = async () => {
    if (!account) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showToast("Couldn't verify your session — try logging in again first.");
        return;
      }

      const { data, error } = await supabase.functions.invoke("delete-account", {
        headers: { Authorization: "Bearer " + session.access_token },
      });

      if (error || data?.error) {
        console.error("RoastVerse: delete-account failed", error || data.error);
        showToast("Couldn't delete your account — try again in a moment.");
        return; // don't clear local state — the account still exists
      }

      await supabase.auth.signOut();
      setAccount(null);
      setPoints(0);
      setRoastCount(0);
      setBestScore(0);
      setUsedSavage(false);
      awardedChallengesRef.current = new Set();
      setDeleteConfirmOpen(false);
      goPage("home");
      showToast("Account deleted");
    } catch (e) {
      console.error("RoastVerse: failed to delete account", e);
      showToast("Couldn't delete your account — try again in a moment.");
    }
 };

  const updateProfilePic = (dataUrl) => {
    setAccount((a) => (a ? { ...a, profilePic: dataUrl } : a));
  };

  const copyProfileLink = async () => {
    if (!account) return;
    const link = `https://roastverse.app/u/${account.username}`;
    try {
      await navigator.clipboard.writeText(`🔥 Check out my RoastVerse profile — ${points.toLocaleString()} points! ${link}`);
      showToast("Profile link copied");
    } catch (e) {
      /* clipboard unavailable */
    }
  };


  // ---- Social: search, friend requests, chat, posts, stories ----
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState([]); // [{ friendshipId, id, username, profilePic }]
  const [incomingRequests, setIncomingRequests] = useState([]); // same shape, pending & addressed to me
  const [outgoingRequestIds, setOutgoingRequestIds] = useState(new Set());
  const [friendsLoading, setFriendsLoading] = useState(false);

  const [chatFriend, setChatFriend] = useState(null); // { id, username, profilePic }
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postCaption, setPostCaption] = useState("");
  const [postPhoto, setPostPhoto] = useState(null);
  const [posting, setPosting] = useState(false);

  const [stories, setStories] = useState([]); // grouped by author: [{ authorId, username, profilePic, items }]
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storyPhoto, setStoryPhoto] = useState(null);
  const [postingStory, setPostingStory] = useState(false);
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  const loadFriendsData = async () => {
    if (!account?.id) {
      setFriends([]);
      setIncomingRequests([]);
      setOutgoingRequestIds(new Set());
      return;
    }
    setFriendsLoading(true);
    try {
      const { data, error } = await supabase
        .from("friendships")
        .select("id, requester_id, recipient_id, status, requester:requester_id(id, username, profile_pic), recipient:recipient_id(id, username, profile_pic)")
        .or(`requester_id.eq.${account.id},recipient_id.eq.${account.id}`);
      if (!error && data) {
        const accepted = [];
        const incoming = [];
        const outgoing = new Set();
        data.forEach((row) => {
          const iAmRequester = row.requester_id === account.id;
          const other = iAmRequester ? row.recipient : row.requester;
          if (!other) return;
          const otherEntry = { friendshipId: row.id, id: other.id, username: other.username, profilePic: other.profile_pic };
          if (row.status === "accepted") accepted.push(otherEntry);
          else if (row.status === "pending") {
            if (iAmRequester) outgoing.add(row.recipient_id);
            else incoming.push(otherEntry);
          }
        });
        setFriends(accepted);
        setIncomingRequests(incoming);
        setOutgoingRequestIds(outgoing);
      }
    } catch (e) {
      console.warn("RoastVerse: failed to load friends", e);
    } finally {
      setFriendsLoading(false);
    }
  };

  useEffect(() => {
    loadFriendsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id]);

  const searchUsers = async (query) => {
    setSearchQuery(query);
    const q = normalizeUsername(query);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      let req = supabase.from("profiles").select("id, username, profile_pic").ilike("username", `%${q}%`).limit(20);
      if (account?.id) req = req.neq("id", account.id);
      const { data } = await req;
      setSearchResults(data || []);
    } catch (e) {
      console.warn("RoastVerse: search failed", e);
      showToast("Search failed — check your connection");
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    if (!account?.id) return openAuth("signup");
    try {
      const { error } = await supabase.from("friendships").insert({ requester_id: account.id, recipient_id: userId });
      if (error) throw error;
      setOutgoingRequestIds((s) => new Set(s).add(userId));
      showToast("Friend request sent");
    } catch (e) {
      console.warn("RoastVerse: failed to send friend request", e);
      showToast("Couldn't send request — try again");
    }
  };

  const respondToRequest = async (friendshipId, accept) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: accept ? "accepted" : "declined" })
        .eq("id", friendshipId);
      if (error) throw error;
      showToast(accept ? "Friend request accepted 🎉" : "Request declined");
      loadFriendsData();
    } catch (e) {
      console.warn("RoastVerse: failed to respond to friend request", e);
      showToast("Something went wrong — try again");
    }
  };

  const openChat = (friend) => {
    setChatFriend(friend);
    goPage("chat");
  };

  const loadChatMessages = async () => {
    if (!account?.id || !chatFriend?.id) return;
    setChatLoading(true);
    try {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${account.id},recipient_id.eq.${chatFriend.id}),and(sender_id.eq.${chatFriend.id},recipient_id.eq.${account.id})`)
        .order("created_at", { ascending: true });
      setChatMessages(data || []);
    } catch (e) {
      console.warn("RoastVerse: failed to load messages", e);
      showToast("Couldn't load messages — check your connection");
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (!chatFriend?.id || !account?.id) return;
    loadChatMessages();
    const channel = supabase
      .channel(`chat-${[account.id, chatFriend.id].sort().join("-")}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new;
        const isThisConvo =
          (m.sender_id === account.id && m.recipient_id === chatFriend.id) ||
          (m.sender_id === chatFriend.id && m.recipient_id === account.id);
        if (isThisConvo) setChatMessages((prev) => [...prev, m]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatFriend?.id, account?.id]);

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || !account?.id || !chatFriend?.id) return;
    setChatInput("");
    try {
      const { error } = await supabase.from("messages").insert({ sender_id: account.id, recipient_id: chatFriend.id, content: text });
      if (error) throw error;
    } catch (e) {
      console.warn("RoastVerse: failed to send message", e);
      showToast("Message failed to send");
    }
  };

  const loadFeed = async () => {
    if (!account?.id) {
      setPosts([]);
      return;
    }
    setPostsLoading(true);
    try {
      const ids = [account.id, ...friends.map((f) => f.id)];
      const { data } = await supabase
        .from("posts")
        .select("*, author:author_id(username, profile_pic)")
        .in("author_id", ids)
        .order("created_at", { ascending: false })
        .limit(50);
      setPosts(data || []);
    } catch (e) {
      console.warn("RoastVerse: failed to load feed", e);
      showToast("Couldn't load feed — check your connection");
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (account?.id) loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id, friends.length]);

  const createPost = async () => {
    if (!account?.id) return openAuth("signup");
    if (!postCaption.trim() && !postPhoto) return;
    setPosting(true);
    try {
      const { error } = await supabase
        .from("posts")
        .insert({ author_id: account.id, caption: postCaption.trim() || null, photo: postPhoto || null });
      if (error) throw error;
      setPostCaption("");
      setPostPhoto(null);
      showToast("Posted!");
      loadFeed();
    } catch (e) {
      console.warn("RoastVerse: failed to create post", e);
      showToast("Couldn't post — try again");
    } finally {
      setPosting(false);
    }
  };

  const loadStories = async () => {
    if (!account?.id) {
      setStories([]);
      return;
    }
    setStoriesLoading(true);
    try {
      const ids = [account.id, ...friends.map((f) => f.id)];
      const { data } = await supabase
        .from("stories")
        .select("*, author:author_id(username, profile_pic)")
        .in("author_id", ids)
        .order("created_at", { ascending: true });
      const groups = {};
      (data || []).forEach((s) => {
        if (!groups[s.author_id]) {
          groups[s.author_id] = { authorId: s.author_id, username: s.author?.username, profilePic: s.author?.profile_pic, items: [] };
        }
        groups[s.author_id].items.push(s);
      });
      const ordered = Object.values(groups).sort((a, b) => (a.authorId === account.id ? -1 : b.authorId === account.id ? 1 : 0));
      setStories(ordered);
    } catch (e) {
      console.warn("RoastVerse: failed to load stories", e);
      showToast("Couldn't load stories — check your connection");
    } finally {
      setStoriesLoading(false);
    }
  };

  useEffect(() => {
    if (account?.id) loadStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.id, friends.length]);

  const createStory = async () => {
    if (!account?.id) return openAuth("signup");
    if (!storyPhoto) return;
    setPostingStory(true);
    try {
      const { error } = await supabase.from("stories").insert({ author_id: account.id, photo: storyPhoto });
      if (error) throw error;
      showToast("Story added — visible for 24h");
      loadStories();
    } catch (e) {
      console.warn("RoastVerse: failed to add story", e);
      showToast("Couldn't add story — try again");
    } finally {
      setStoryPhoto(null);
      setPostingStory(false);
    }
  };

  const openStoryGroup = (group) => {
    setActiveStoryGroup(group);
    setActiveStoryIndex(0);
  };
  const closeStoryViewer = () => setActiveStoryGroup(null);
  const nextStory = () => {
    if (!activeStoryGroup) return;
    if (activeStoryIndex < activeStoryGroup.items.length - 1) setActiveStoryIndex((i) => i + 1);
    else closeStoryViewer();
  };
  const prevStory = () => {
    if (activeStoryIndex > 0) setActiveStoryIndex((i) => i - 1);
  };

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      if (!src.startsWith("blob:") && !src.startsWith("data:")) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(" ");
    let line = "";
    const lines = [];
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
    return lines.length;
  };

  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const softCircle = (ctx, x, y, r, color, alpha) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`);
    g.addColorStop(1, `${color}00`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  const marble = (ctx, x, y, r, c1, c2, c3) => {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, c1);
    g.addColorStop(0.6, c2);
    g.addColorStop(1, c3);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  const purpleMarble = (ctx, x, y, r) => marble(ctx, x, y, r, "#E9D8FD", "#B794F6", "#8B5CF6");
  const blueMarble = (ctx, x, y, r) => marble(ctx, x, y, r, "#DBEAFE", "#93C5FD", "#3B82F6");

  const dotGrid = (ctx, x, y, cols, rows, gap, color) => {
    ctx.fillStyle = color;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        ctx.beginPath();
        ctx.arc(x + i * gap, y + j * gap, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const generateCard = async () => {
    setGeneratingCard(true);
    const W = 1080, H = 1920;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#F8F7FC");
    bgGrad.addColorStop(0.5, "#F4F2F9");
    bgGrad.addColorStop(1, "#F7F5FB");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // decorative background blobs (behind the card)
    softCircle(ctx, 40, 60, 340, "#8B5CF6", 0.32);
    softCircle(ctx, W - 30, H * 0.62, 260, "#3B82F6", 0.14);
    purpleMarble(ctx, 305, 400, 26);
    blueMarble(ctx, W - 155, 375, 22);
    purpleMarble(ctx, 45, 445, 16);

    const pad = 105;
    const cardW = W - pad * 2, cardH = 1130;
    const cardX = pad, cardY = 90;

    ctx.save();
    ctx.shadowColor = "rgba(139,92,246,0.28)";
    ctx.shadowBlur = 90;
    ctx.shadowOffsetY = 30;
    roundRect(ctx, cardX, cardY, cardW, cardH, 44);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRect(ctx, cardX, cardY, cardW, cardH, 44);
    ctx.clip();

    // dotted grid decoration, top-right of the card
    dotGrid(ctx, cardX + cardW - 210, cardY + 55, 6, 6, 26, "rgba(139,92,246,0.35)");

    // brand mark
    const logoR = 34, logoX = cardX + cardW / 2 - 150, logoY = cardY + 78;
    roundRect(ctx, logoX - logoR, logoY - logoR, logoR * 2, logoR * 2, logoR * 0.34);
    const logoGrad = ctx.createLinearGradient(logoX - logoR, logoY - logoR, logoX + logoR, logoY + logoR);
    logoGrad.addColorStop(0, "#8B5CF6");
    logoGrad.addColorStop(1, "#EC4899");
    ctx.fillStyle = logoGrad;
    ctx.fill();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "38px sans-serif";
    ctx.fillText("🔥", logoX, logoY + 3);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = "700 44px Fredoka, sans-serif";
    ctx.fillStyle = "#15121C";
    const roastW = ctx.measureText("Roast").width;
    ctx.fillText("Roast", logoX + logoR + 20, logoY + 14);
    ctx.fillStyle = "#8B5CF6";
    ctx.fillText("Verse", logoX + logoR + 20 + roastW, logoY + 14);

    const avR = 72, avX = cardX + cardW / 2, avY = cardY + 210;
    ctx.save();
    ctx.beginPath();
    ctx.arc(avX, avY, avR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    if (photoUrl) {
      try {
        const img = await loadImage(photoUrl);
        const scale = Math.max((avR * 2) / img.width, (avR * 2) / img.height);
        const iw = img.width * scale, ih = img.height * scale;
        ctx.drawImage(img, avX - iw / 2, avY - ih / 2, iw, ih);
      } catch (e) {
        ctx.fillStyle = "rgba(139,92,246,0.18)";
        ctx.fillRect(avX - avR, avY - avR, avR * 2, avR * 2);
      }
    } else {
      ctx.fillStyle = "rgba(139,92,246,0.18)";
      ctx.fillRect(avX - avR, avY - avR, avR * 2, avR * 2);
    }
    ctx.restore();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(139,92,246,0.45)";
    ctx.beginPath();
    ctx.arc(avX, avY, avR, 0, Math.PI * 2);
    ctx.stroke();

    if (!photoUrl) {
      ctx.fillStyle = "#8B5CF6";
      ctx.font = "700 54px Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((name || "?").charAt(0).toUpperCase(), avX, avY + 4);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = "600 28px Manrope, sans-serif";
    const prefix = "Roast for ";
    const prefixW = ctx.measureText(prefix).width;
    const nameW = (() => { ctx.font = "700 28px Manrope, sans-serif"; return ctx.measureText(name).width; })();
    const lineY = avY + avR + 56;
    ctx.font = "600 28px Manrope, sans-serif";
    ctx.fillStyle = "#4B4558";
    ctx.textAlign = "left";
    ctx.fillText(prefix, cardX + cardW / 2 - (prefixW + nameW) / 2, lineY);
    ctx.font = "700 28px Manrope, sans-serif";
    ctx.fillStyle = "#8B5CF6";
    ctx.fillText(name, cardX + cardW / 2 - (prefixW + nameW) / 2 + prefixW, lineY);
    ctx.textAlign = "center";

    ctx.fillStyle = "#15121C";
    ctx.font = "700 42px Fredoka, sans-serif";
    wrapText(ctx, `"${roast}"`, cardX + cardW / 2, avY + avR + 150, cardW - 150, 54);

    const dividerY = cardY + 640;
    ctx.strokeStyle = "rgba(21,18,28,0.10)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 70, dividerY);
    ctx.lineTo(cardX + cardW - 70, dividerY);
    ctx.stroke();

    const scoreY = dividerY + 85;
    ctx.fillStyle = "#6B6478";
    ctx.font = "600 28px Manrope, sans-serif";
    ctx.fillText("Friendship Score", cardX + cardW / 2, scoreY);

    ctx.font = "700 108px Fredoka, sans-serif";
    const scoreText = `${score}%`;
    const scoreTextW = ctx.measureText(scoreText).width;
    const scoreGrad = ctx.createLinearGradient(
      cardX + cardW / 2 - scoreTextW / 2, 0,
      cardX + cardW / 2 + scoreTextW / 2, 0
    );
    scoreGrad.addColorStop(0, "#8B5CF6");
    scoreGrad.addColorStop(1, "#3B82F6");
    ctx.fillStyle = scoreGrad;
    ctx.fillText(scoreText, cardX + cardW / 2, scoreY + 105);

    const barW = cardW - 140, barH = 18, barX = cardX + 70, barY = scoreY + 150;
    ctx.fillStyle = "rgba(21,18,28,0.08)";
    roundRect(ctx, barX, barY, barW, barH, 9);
    ctx.fill();
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    fillGrad.addColorStop(0, "#8B5CF6");
    fillGrad.addColorStop(1, "#3B82F6");
    ctx.fillStyle = fillGrad;
    roundRect(ctx, barX, barY, barW * (score / 100), barH, 9);
    ctx.fill();

    ctx.fillStyle = "#8B5CF6";
    ctx.font = "600 28px Manrope, sans-serif";
    ctx.fillText("Strong bond 💜", cardX + cardW / 2, barY + 66);

    ctx.restore();

    // marbles overlapping the card edges (drawn in front)
    purpleMarble(ctx, cardX + cardW - 25, cardY + cardH - 40, 68);
    purpleMarble(ctx, cardX - 20, cardY + cardH - 175, 20);

    ctx.textAlign = "center";
    ctx.fillStyle = "#6B6478";
    ctx.font = "600 30px Manrope, sans-serif";
    ctx.fillText("#RoastVerse — Roast responsibly", W / 2, cardY + cardH + 70);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setCardImg(url);
        setCardBlob(blob);
        setGeneratingCard(false);
        resolve(blob);
      }, "image/png");
    });
  };

  const openShare = async () => {
    setShareOpen(true);
    if (!cardImg) await generateCard();
  };

  const downloadCard = () => {
    if (!cardImg) return;
    const a = document.createElement("a");
    a.href = cardImg;
    a.download = `roastverse-${(name || "roast").replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const shareNative = async () => {
    let blob = cardBlob;
    if (!blob) blob = await generateCard();
    try {
      const file = new File([blob], `roastverse-${(name || "roast").replace(/\s+/g, "-").toLowerCase()}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "RoastVerse", text: `Roast for ${name}: "${roast}" #RoastVerse` });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: "RoastVerse", text: `Roast for ${name}: "${roast}" #RoastVerse` });
        return;
      }
    } catch (e) {
      /* user cancelled or unsupported — fall through to download */
    }
    downloadCard();
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`🔥 Roast for ${name}: "${roast}"\nFriendship Score: ${score}% — #RoastVerse`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    downloadCard();
  };

  const copyRoastText = async () => {
    try {
      await navigator.clipboard.writeText(`🔥 Roast for ${name}: "${roast}" — Friendship Score ${score}% #RoastVerse`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      /* clipboard unavailable */
    }
  };


  const value = {
    // navigation
    page, setPage, drawerOpen, setDrawerOpen, goPage,
    // theme / language
    darkMode, setDarkMode, lang, setLang, t, parallax, handlePagePointerMove,
    // roast flow
    stage, setStage, name, setName, relation, setRelation, level, setLevel,
    photoUrl, setPhotoUrl, roast, roastSource, score, error, setError,
    cookRoast, reset, processPhotoFile, handlePhoto, formRef,
    // share
    shareOpen, setShareOpen, cardImg, cardBlob, generatingCard, copied,
    openShare, downloadCard, shareNative, shareWhatsApp, copyRoastText,
    // battle
    battleName1, setBattleName1, battleName2, setBattleName2,
    battlePhoto1, setBattlePhoto1, battlePhoto2, setBattlePhoto2,
    battleStage, battleResult, runBattle, resetBattle,
    // points / challenges / rewards
    roastCount, bestScore, usedSavage, claimedDays, setClaimedDays,
    points, rewardShown, setRewardShown, toasts, getChallenges,
    // account / auth
    account, sessionChecked, authOpen, setAuthOpen, authMode, setAuthMode,
    authUsername, setAuthUsername, authEmail, setAuthEmail, authCountry, setAuthCountry,
    authPassword, setAuthPassword, authConfirm, setAuthConfirm, authShowPw, setAuthShowPw,
    authError, setAuthError, authLoading, authSuccess, usernameStatus, deleteConfirmOpen, setDeleteConfirmOpen,
    openAuth, normalizeUsername, passwordStrength, isValidEmail,
    handleSignup, handleLogin, handleLogout, handleDeleteAccount,
    updateProfilePic, copyProfileLink,
    // social: search, friend requests
    searchQuery, searchResults, searching, searchUsers,
    friends, incomingRequests, outgoingRequestIds, friendsLoading,
    sendFriendRequest, respondToRequest,
    // chat
    chatFriend, setChatFriend, chatMessages, chatInput, setChatInput, chatLoading,
    openChat, sendMessage,
    // feed / posts
    posts, postsLoading, postCaption, setPostCaption, postPhoto, setPostPhoto, posting, createPost, loadFeed,
    // stories
    stories, storiesLoading, storyPhoto, setStoryPhoto, postingStory, createStory,
    activeStoryGroup, activeStoryIndex, openStoryGroup, closeStoryViewer, nextStory, prevStory,
    // shared constants exposed for convenience
    LEVELS, RELATIONS, COUNTRIES, NAV_ITEMS, LANGUAGES,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
