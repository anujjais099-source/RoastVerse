# RoastVerse

AI-powered "roast your friend" app — upload a photo, get a savage/funny AI-generated
roast, battle friends, earn points, and build a profile. Built with React + Vite +
Tailwind, using Google's Gemini API for the AI roasts.

## 1. Install dependencies

```bash
npm install
```

## 2. Add your Gemini API key

Get a free key from **https://aistudio.google.com/apikey**, then:

```bash
cp .env.example .env
```

Open `.env` and paste your key:

```
VITE_GEMINI_API_KEY=your_real_key_here
```

`.env` is already in `.gitignore` — never commit it.

## 3. Run it

```bash
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

## 4. Build for production

```bash
npm run build
npm run preview   # to test the production build locally
```

---

## Project structure

```
src/
  main.jsx              entry point
  App.jsx                top-level layout: nav, drawer, page router, modals
  index.css               all theming/animation CSS (+ Tailwind directives)
  context/
    AppContext.jsx        ALL app state and logic lives here (roasting, battle,
                           auth, points, challenges). Every page/component reads
                           from it via the `useApp()` hook.
  lib/
    gemini.js              Gemini API wrapper (the AI calls)
    storage.js              localStorage-backed persistence (see limitation below)
    roasts.js                roast levels/relations + offline fallback jokes
    i18n.js                   translations (9 languages) 
    constants.js               country list + nav items
    auth.js                     password hashing helper
  components/
    Nav.jsx, Drawer.jsx, Toasts.jsx, Footer.jsx, TiltCard.jsx
    modals/
      AuthModal.jsx, DeleteConfirmModal.jsx, RewardModal.jsx, ShareModal.jsx
  pages/
    HomePage.jsx, RoastPage.jsx, BattlePage.jsx, ChallengesPage.jsx,
    LeaderboardPage.jsx, RewardsPage.jsx, ProfilePage.jsx, SettingsPage.jsx
```

## Important limitations (read before you ship this anywhere real)

**Accounts are per-browser, not per-user.** `src/lib/storage.js` uses
`localStorage` as a stand-in for a real backend. That means:
- Signing up on your laptop creates an account only your laptop's browser
  can log into. There is no real server, so someone can't create an account
  on their phone and log into it on their desktop.
- Anyone with access to the browser's dev tools can read/edit the stored
  data (including the password hash).

For a real product, replace `src/lib/storage.js` with calls to an actual
backend (Supabase, Firebase, or your own Node/Express + Postgres API) that
implements the same `get/set/delete(key, shared)` function signatures —
nothing else in the app needs to change if you keep that shape.

**Password hashing is not secure.** `src/lib/auth.js` uses a small
non-cryptographic hash purely so the password isn't stored in plaintext in
localStorage. This is fine for a demo, but real auth should hash passwords
server-side with bcrypt/argon2, never in the client.

**The Gemini API key is exposed in the browser.** Because this is a
client-only app (`VITE_GEMINI_API_KEY` gets bundled into the JS that ships
to the browser), anyone can extract your key from the built app and use
your quota. That's fine for local development/testing, but before putting
this in front of real users, move the Gemini call behind your own small
backend endpoint that holds the key server-side.

## Customizing

- **Roast prompts / offline fallback jokes:** `src/lib/roasts.js`
- **Languages:** `src/lib/i18n.js` — add a new key to `TRANSLATIONS` and to
  the `LANGUAGES` array in the same file.
- **Colors/theme:** CSS variables in `src/index.css` under
  `[data-theme="light"]` / `[data-theme="dark"]`.
- **Gemini model:** `GEMINI_MODEL` constant at the top of `src/lib/gemini.js`.
