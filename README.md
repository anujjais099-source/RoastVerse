# RoastVerse

AI-powered "roast your friend" app — upload a photo, get a savage/funny AI-generated
roast, battle friends, earn points, and build a profile. Built with React + Vite +
Tailwind, using **Supabase** for real accounts/database and **Google Gemini** for
the AI roasts (proxied through a Supabase Edge Function so the key never reaches
the browser).

## 1. Create a Supabase project

Go to **supabase.com** → New Project (free tier is fine). Note your project's
**Project URL** and **anon public key** — Dashboard → Settings → API. You'll need
both in step 3.

## 2. Set up the database

Dashboard → **SQL Editor** → New query → paste the entire contents of
`supabase/schema.sql` → **Run**.

This creates the `profiles` table (points, roast count, etc.), sets up the
security rules so people can only edit their own data but everyone can read
the public leaderboard, and adds a trigger that auto-creates a profile row
whenever someone signs up.

## 3. Configure the client

```bash
npm install
cp .env.example .env
```

Open `.env` and fill in your Project URL and anon key from step 1:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

## 4. Deploy the Edge Functions

These run the Gemini API call and account deletion server-side, where your
secrets are safe. You'll need the Supabase CLI:

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
```

(`your-project-ref` is the short id in your project's URL, e.g. `abcdefgh`.)

Deploy both functions:
```bash
supabase functions deploy roast
supabase functions deploy delete-account
```

Set your Gemini key as a server-side secret (get one free at
**aistudio.google.com/apikey**):
```bash
supabase secrets set GEMINI_API_KEY=your_real_gemini_key_here
```

## 5. Turn off email confirmation (optional, for easier testing)

By default Supabase requires people to click a confirmation link in their
email before they can log in. For quick local testing you can disable this:
Dashboard → **Authentication** → **Providers** → **Email** → turn off
"Confirm email". Leave it ON if you want real email verification in
production.

## 6. Run it

```bash
npm run dev
```

## 7. Build for production

```bash
npm run build
npm run preview
```

When deploying (Vercel, Netlify, etc.), set the same two `VITE_SUPABASE_*`
environment variables in your host's dashboard — same as before, just two
variables now instead of one, and no Gemini key needed there at all since
that lives in Supabase.

---

## What changed from the old localStorage version

- **Real cross-device accounts.** Sign up on your phone, log in on your
  laptop — it's an actual database now, not per-browser `localStorage`.
- **Real password security.** Supabase Auth hashes passwords properly
  server-side (not in the browser at all anymore).
- **Real duplicate-email prevention**, enforced by the database across every
  device — not just "within this browser" like before.
- **Your Gemini API key is no longer in the browser bundle.** It's a
  Supabase Edge Function secret now — nobody can extract it by inspecting
  your site's JS.
- **Real leaderboard**, pulling actual top scores from the database instead
  of hardcoded names.
- **Real account deletion**, via a secure Edge Function (deleting an auth
  user requires elevated privileges the browser can never safely hold).

## Project structure

```
src/
  main.jsx / App.jsx / index.css        same as before
  context/AppContext.jsx                 all state and logic; now talks to Supabase
  lib/
    supabase.js                           Supabase client setup
    gemini.js                              calls the "roast" Edge Function
    roasts.js, i18n.js, constants.js       unchanged
  components/, pages/                     unchanged
supabase/
  schema.sql                              run once in the SQL Editor
  functions/
    roast/index.ts                        Gemini proxy (keeps your key server-side)
    delete-account/index.ts                secure account deletion
```

## Customizing

- **Roast prompts / offline fallback jokes:** `src/lib/roasts.js`
- **Gemini model:** `GEMINI_MODEL` constant in `supabase/functions/roast/index.ts`
  (redeploy the function after changing it: `supabase functions deploy roast`)
- **Database fields:** add columns to `profiles` in `supabase/schema.sql`,
  then re-run the relevant `alter table` statement in the SQL Editor
- **Colors/theme:** CSS variables in `src/index.css`

## Troubleshooting

- **"Missing VITE_SUPABASE_URL"** in the console → check `.env` exists (not
  just `.env.example`) and restart `npm run dev` after editing it.
- **Roasts always fall back to "Generated offline"** → check the Edge
  Function deployed correctly (`supabase functions list`) and that the
  `GEMINI_API_KEY` secret is set (`supabase secrets list`).
- **Signup says "check your email" but you never get one** → check your
  spam folder, or disable email confirmation for testing (see step 5).
- **Can't delete account** → make sure `delete-account` was deployed
  (`supabase functions deploy delete-account`) — it needs no extra secrets,
  Supabase provides the service role key to it automatically.
