# The Budget Book Hunter

A Next.js (App Router) + TypeScript app for finding a book across cheap/free
sources (Libby, Hoopla, Amazon, Audible, YouTube, Google Play, PDF).

## Commands

- Install: `npm install`
- Dev server: `npm run dev` (http://localhost:9002)
- Type check: `npm run typecheck`
- Production build: `npm run build`
- Lint: `npm run lint`

**Always run `npm run typecheck` and `npm run build` before committing.**

## Architecture

- **Search** (`src/lib/google-books.ts`): a single Google Books API call returns
  results in <1s; falls back to OpenLibrary when Google Books is unavailable or
  rate-limited. Source links are built deterministically in `src/lib/sources.ts`.
  **No LLM is used in the search path.**
- **AI recommender** (`src/ai/flows/suggest-similar-books.ts`): the only LLM
  feature ("Find Similar Books"). It is lazy-loaded so search never depends on it.
- **Server actions**: `src/app/actions.ts` (`getBooks`, `getSuggestions`).
- **UI**: `src/app/page.tsx`, `src/components/book-card.tsx`, and shadcn/Radix
  primitives in `src/components/ui/*` (reused as-is — don't rewrite these).
- **State**: watchlist + settings persist in `localStorage` via React context
  providers; there is no backend database.

## Environment variables (all optional — see `.env.example`)

- `GOOGLE_BOOKS_API_KEY` — richer/faster search; without it, the keyless quota is
  shared and often exhausted, so the app falls back to OpenLibrary.
- `ANTHROPIC_API_KEY` — required only for the "Find Similar Books" recommender.

Set these in Vercel project settings for deployed environments.

## Git workflow

- Default branch: `worked`. Never commit directly to it — branch first.
- Branch names: `claude/<short-description>`.
- Commit messages: imperative summary line + a short body explaining *why*.
- Open pull requests as **drafts** against `worked`; CI (`.github/workflows/ci.yml`)
  runs typecheck + build on every PR.
- The `/ship` command runs the full gate (typecheck → build → commit → push →
  draft PR) in one step.
