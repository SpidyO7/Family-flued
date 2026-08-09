# Live audience setup (free)

1. In Supabase, open **SQL Editor**, paste and run `supabase-setup.sql`.
2. Deploy this folder to a free static host such as Netlify or GitHub Pages.
3. Optionally set `audienceUrl` to the deployed `contestant.html` URL. Leave it blank to use the automatic same-site URL.
4. Open `index.html` as the admin page and `contestant.html` as the display page from that same deployed site.

The audience scans the QR code on the contestant display. It opens the same `contestant.html` file in mobile answer mode, submits answers, and the admin can refresh, sort the board by votes, or rewrite the board from top audience suggestions.
