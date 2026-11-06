# Subtrack (React + Vite)

## Run it
1. `npm install`
2. `npm run dev`
3. Open the address it prints (usually http://localhost:5173)

Other commands: `npm run build` (production build into `dist/`), `npm run preview`.

## What works
- Overview: monthly and yearly totals, budget ring, upcoming renewals, overlap tip
- Cards: search, filter, sort, add, edit, pause, cancel, delete
- Settings (gear icon): currency, monthly budget, reminder timing
- "Load sample data" on the empty screen for a quick demo
- Data is saved in your browser (localStorage), per address

## Where things are
- `src/lib/store.js`: the only file that touches storage. The backend phase swaps this for API calls.
- `src/lib/utils.js`: dates, money, renewal math. `src/lib/data.js`: popular services and categories.
- `src/pages.jsx`: Overview and Cards. `src/components.jsx`: card, tile, menu. `src/Dialogs.jsx`: add/edit and settings.
- `public/logos/`: drop logo files here (e.g. `netflix.svg`, `youtube-premium.svg`) to replace the colored initials.

## Next phases
4: cancel guide + in-app reminders - 5: bank CSV import - 6: Node + MongoDB backend - 7: login - 8: email notifications
