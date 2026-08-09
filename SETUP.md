# Live audience setup (free)

1. In Supabase, open **SQL Editor**, paste and run `supabase-setup.sql`.
2. Deploy this folder to a free static host such as Netlify or GitHub Pages.
3. In `supabase-config.js`, set `audienceUrl` to the deployed `audience.html` URL.
4. Open `index.html` as the admin page and `contestant.html` as the display page from that same deployed site.

The audience scans the QR code on the contestant display, submits answers, and the admin can refresh, sort the board by votes, or rewrite the board from top audience suggestions.
