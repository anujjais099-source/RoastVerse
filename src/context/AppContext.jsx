import { createContext, useContext, useState, useRef, useEffect } from "react";
import { callGemini, dataUrlToImageBlock } from "../lib/gemini";
import { storage } from "../lib/storage";
import { simpleHash } from "../lib/auth";
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

  // ---- Account / auth logic ----
  // Uses window.storage: accounts are shared (so the same username/password
  // can log in from any session), the "which account am I" pointer is personal.
  useEffect(() => {
    (async () => {
      try {
        const session = await storage.get("session", false);
        if (session?.value) {
          const uname = JSON.parse(session.value).username;
          const acc = await storage.get(`account:${uname}`, true);
          if (acc?.value) {
            const data = JSON.parse(acc.value);
            skipNextSyncRef.current = true;
            setAccount({ username: data.username, email: data.email || "", country: data.country || "", passwordHash: data.passwordHash, profilePic: data.profilePic || null, createdAt: data.createdAt });
            setPoints(data.points || 0);
            setRoastCount(data.roastCount || 0);
            setBestScore(data.bestScore || 0);
            setUsedSavage(!!data.usedSavage);
          }
        }
      } catch (e) {
        // no saved session — that's fine, stay logged out
      } finally {
        setSessionChecked(true);
      }
    })();
  }, []);

  // write-through: whenever stats change while logged in, persist to the account record
  useEffect(() => {
    if (!account) return;
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    (async () => {
      try {
        // preserve fields we don't keep in local state (like passwordHash)
        let passwordHash = account.passwordHash;
        if (!passwordHash) {
          try {
            const existing = await storage.get(`account:${account.username}`, true);
            if (existing?.value) passwordHash = JSON.parse(existing.value).passwordHash;
          } catch (e) {
            /* ignore */
          }
        }
        await storage.set(
          `account:${account.username}`,
          JSON.stringify({
            username: account.username,
            email: account.email || "",
            country: account.country || "",
            passwordHash,
            profilePic: account.profilePic || null,
            createdAt: account.createdAt,
            points,
            roastCount,
            bestScore,
            usedSavage,
          }),
          true
        );
      } catch (e) {
        console.warn("RoastVerse: failed to sync account", e);
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
      try {
        const existing = await storage.get(`account:${uname}`, true);
        if (usernameCheckRef.current !== myCheck) return; // a newer check superseded this one
        setUsernameStatus(existing?.value ? "taken" : "available");
      } catch (e) {
        if (usernameCheckRef.current !== myCheck) return;
        setUsernameStatus("available"); // key doesn't exist — available
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [authUsername, authMode, authOpen]);

  const handleSignup = async () => {
    const uname = normalizeUsername(authUsername);
    if (!isValidEmail(authEmail.trim())) return setAuthError("Enter a valid email address.");
    if (!authCountry) return setAuthError("Select your country.");
    if (uname.length < 3) return setAuthError("Username needs at least 3 characters.");
    if (usernameStatus === "taken") return setAuthError("That username is taken.");
    if (authPassword.length < 4) return setAuthError("Password needs at least 4 characters.");
    if (authPassword !== authConfirm) return setAuthError("Passwords don't match.");
    setAuthLoading(true);
    setAuthError("");
    try {
      let taken = false;
      try {
        const existing = await storage.get(`account:${uname}`, true);
        taken = !!existing?.value;
      } catch (e) {
        taken = false; // key doesn't exist — available
      }
      if (taken) {
        setAuthLoading(false);
        setUsernameStatus("taken");
        return setAuthError("That username is taken.");
      }
      const record = {
        username: uname,
        email: authEmail.trim(),
        country: authCountry,
        passwordHash: simpleHash(authPassword),
        profilePic: null,
        createdAt: new Date().toISOString(),
        points,
        roastCount,
        bestScore,
        usedSavage,
      };
      await storage.set(`account:${uname}`, JSON.stringify(record), true);
      await storage.set("session", JSON.stringify({ username: uname }), false);
      skipNextSyncRef.current = true;
      setAccount({
        username: uname,
        email: record.email,
        country: record.country,
        passwordHash: record.passwordHash,
        profilePic: null,
        createdAt: record.createdAt,
      });
      setAuthLoading(false);
      setAuthSuccess(true);
      showToast(`Welcome, ${uname}! Your points are now saved 🎉`);
      setTimeout(() => setAuthOpen(false), 1100);
      return;
    } catch (e) {
      setAuthError("Couldn't create your account — try again.");
    }
    setAuthLoading(false);
  };

  const handleLogin = async () => {
    const uname = normalizeUsername(authUsername);
    if (!uname || !authPassword) return setAuthError("Enter your username and password.");
    setAuthLoading(true);
    setAuthError("");
    try {
      const existing = await storage.get(`account:${uname}`, true);
      if (!existing?.value) {
        setAuthLoading(false);
        return setAuthError("No account with that username.");
      }
      const data = JSON.parse(existing.value);
      if (data.passwordHash !== simpleHash(authPassword)) {
        setAuthLoading(false);
        return setAuthError("Wrong password.");
      }
      await storage.set("session", JSON.stringify({ username: uname }), false);
      skipNextSyncRef.current = true;
      setAccount({ username: data.username, email: data.email || "", country: data.country || "", passwordHash: data.passwordHash, profilePic: data.profilePic || null, createdAt: data.createdAt });
      setPoints(data.points || 0);
      setRoastCount(data.roastCount || 0);
      setBestScore(data.bestScore || 0);
      setUsedSavage(!!data.usedSavage);
      setAuthLoading(false);
      setAuthSuccess(true);
      showToast(`Welcome back, ${uname}! 🔥`);
      setTimeout(() => setAuthOpen(false), 1100);
      return;
    } catch (e) {
      setAuthError("No account with that username.");
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    try {
      await storage.delete("session", false);
    } catch (e) {
      /* ignore */
    }
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
      await storage.delete(`account:${account.username}`, true);
      await storage.delete("session", false);
    } catch (e) {
      /* ignore */
    }
    setAccount(null);
    setPoints(0);
    setRoastCount(0);
    setBestScore(0);
    setUsedSavage(false);
    awardedChallengesRef.current = new Set();
    setDeleteConfirmOpen(false);
    goPage("home");
    showToast("Account deleted");
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

  const generateCard = async () => {
    setGeneratingCard(true);
    const W = 1080, H = 1920;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#FFEFF6");
    bgGrad.addColorStop(0.5, "#FBEAF9");
    bgGrad.addColorStop(1, "#EDE3FA");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#7C3AED";
    ctx.beginPath();
    ctx.arc(90, 160, 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FF4D8D";
    ctx.beginPath();
    ctx.arc(W - 90, H - 200, 280, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // top brand mark
    ctx.textAlign = "center";
    ctx.fillStyle = "#241533";
    ctx.font = "700 46px Fredoka, sans-serif";
    ctx.fillText("🔥 RoastVerse", W / 2, 150);

    const pad = 100;
    const cardW = W - pad * 2, cardH = 1120;
    const cardX = pad, cardY = 240;
    const headerH = cardH * 0.56;

    ctx.save();
    roundRect(ctx, cardX, cardY, cardW, cardH, 44);
    ctx.clip();

    const headerGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + headerH);
    headerGrad.addColorStop(0, "#FF4D8D");
    headerGrad.addColorStop(0.5, "#C026D3");
    headerGrad.addColorStop(1, "#7C3AED");
    ctx.fillStyle = headerGrad;
    ctx.fillRect(cardX, cardY, cardW, headerH);
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.fillRect(cardX, cardY + headerH, cardW, cardH - headerH);

    const avR = 72, avX = cardX + cardW / 2, avY = cardY + 110;
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
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(avX - avR, avY - avR, avR * 2, avR * 2);
      }
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(avX - avR, avY - avR, avR * 2, avR * 2);
    }
    ctx.restore();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.beginPath();
    ctx.arc(avX, avY, avR, 0, Math.PI * 2);
    ctx.stroke();

    if (!photoUrl) {
      ctx.fillStyle = "white";
      ctx.font = "700 54px Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((name || "?").charAt(0).toUpperCase(), avX, avY + 4);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "600 26px Manrope, sans-serif";
    ctx.fillText(`Roast for ${name}`, cardX + cardW / 2, avY + avR + 48);

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 38px Fredoka, sans-serif";
    wrapText(ctx, `"${roast}"`, cardX + cardW / 2, avY + avR + 135, cardW - 150, 48);

    const scoreY = cardY + headerH + 85;
    ctx.fillStyle = "#5B4B6B";
    ctx.font = "600 24px Manrope, sans-serif";
    ctx.fillText("Friendship Score", cardX + cardW / 2, scoreY);

    ctx.fillStyle = "#241533";
    ctx.font = "700 76px Fredoka, sans-serif";
    ctx.fillText(`${score}%`, cardX + cardW / 2, scoreY + 80);

    const barW = cardW - 140, barH = 16, barX = cardX + 70, barY = scoreY + 115;
    ctx.fillStyle = "rgba(124,58,237,0.12)";
    roundRect(ctx, barX, barY, barW, barH, 8);
    ctx.fill();
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    fillGrad.addColorStop(0, "#FF4D8D");
    fillGrad.addColorStop(1, "#7C3AED");
    ctx.fillStyle = fillGrad;
    roundRect(ctx, barX, barY, barW * (score / 100), barH, 8);
    ctx.fill();

    ctx.fillStyle = "#C0268F";
    ctx.font = "600 24px Manrope, sans-serif";
    ctx.fillText("Strong bond 🤝", cardX + cardW / 2, barY + 58);

    ctx.restore();

    roundRect(ctx, cardX, cardY, cardW, cardH, 44);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(124,58,237,0.15)";
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#5B4B6B";
    ctx.font = "600 32px Manrope, sans-serif";
    ctx.fillText("#RoastVerse — Roast responsibly", W / 2, cardY + cardH + 90);

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
    authError, authLoading, authSuccess, usernameStatus, deleteConfirmOpen, setDeleteConfirmOpen,
    openAuth, normalizeUsername, passwordStrength, isValidEmail,
    handleSignup, handleLogin, handleLogout, handleDeleteAccount,
    updateProfilePic, copyProfileLink,
    // shared constants exposed for convenience
    LEVELS, RELATIONS, COUNTRIES, NAV_ITEMS, LANGUAGES,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
