# The Budget Book Hunter

Discover books, keep a personal watchlist, and jump to library and store searches from one place. The app uses Google Books for primary search and automatically falls back to Open Library when Google Books is unavailable.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

`GOOGLE_BOOKS_API_KEY` is optional but recommended. It gives the Google Books search API a dedicated quota. Without it, the app tries the shared keyless quota and then falls back to Open Library.

```bash
GOOGLE_BOOKS_API_KEY=
```

Set the same variable in the deployment environment. Never expose it through a `NEXT_PUBLIC_` variable.

## How it works

- Search returns book metadata from Google Books or Open Library.
- Format filters only use metadata the providers can verify: print and eBook.
- The Libby link opens Libby itself (and the installed app when the device supports it); users can then search their linked library. Libby and Hoopla links do **not** assert that a title is available now.
- Other source buttons open searches at the selected services. Verify price, format, and rights at the destination.
- Watchlists and preferences are stored locally in the browser. They are not synced across devices.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

GitHub Actions runs these checks on pull requests and pushes to the default branch.
