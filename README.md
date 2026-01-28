<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1BWvHfq185sB4mHUV2UXfK3aZY6SCc5I7

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set:
   - `GEMINI_API_KEY` – for the Ring Builder AI (Gemini)
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` – for persistence and auth (optional; app uses localStorage and skips auth if unset)
   - `VITE_JEWELER_EMAIL` – email of the jeweler account that can access Operations Hub (optional; if set, that user must sign in to open the Jeweler portal)
3. **Supabase (optional):** Create a project at [supabase.com](https://supabase.com), then:
   - Run the SQL in `supabase/migrations/20260128000000_initial.sql` in the SQL Editor.
   - In Authentication → Providers, enable Email and Google. Under URL Configuration, set Site URL and add `http://localhost:3000` (and your production URL) to Redirect URLs.
   - Enable Realtime for the `designs` table in Database → Replication so the client Vault updates when the jeweler approves a quote.
4. **Jeweler account (optional):** To protect the Operations Hub with a predefined jeweler login, create the user once:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_service_role_key JEWELER_EMAIL=jeweler@thediamondguy.co.za node scripts/create-jeweler-user.cjs
   ```
   Set `VITE_JEWELER_EMAIL` to that email. Omit `JEWELER_INITIAL_PASSWORD` to have the script generate a strong password (it will print it once). Change the password later in Supabase Dashboard → Authentication → Users.
5. Run the app:
   `npm run dev`
