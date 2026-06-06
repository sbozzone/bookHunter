# Welcome to Antigravity!

Welcome to your new developer home! Your Firebase Studio project has been successfully migrated to Antigravity.

Antigravity is our next-generation, agent-first IDE designed for high-velocity, autonomous development. Because Antigravity runs locally on your machine, you now have access to powerful local workflows and fully integrated AI editing capabilities that go beyond a cloud-based web IDE.

## Getting Started
- **Run Locally**: Use the **Run and Debug** menu on the left sidebar to start your local development server.
  - Or in a terminal run `npm run dev` and visit `http://localhost:9002`.
- **Deploy**: You can deploy your changes to Firebase App Hosting by using the integrated terminal and standard Firebase CLI commands, just as you did in Firebase Studio.
- **Cleanup**: Cleanup unused artifacts with the @cleanup workflow.

Enjoy the next era of AI-driven development!

File any bugs at https://github.com/firebase/firebase-tools/issues

## Configuration

Copy `.env.example` to `.env` and fill in values as needed. Every key is
**optional** — the app runs without them, but features degrade as described.

| Variable | Purpose | Without it |
| --- | --- | --- |
| `GOOGLE_BOOKS_API_KEY` | Fast book search via the Google Books API. | Falls back to the shared keyless quota (often exhausted), then to OpenLibrary (works, but weaker descriptions/covers). **Recommended.** |
| `ANTHROPIC_API_KEY` | The optional "suggest similar books" AI recommender. | Search still works; only the recommender returns an error. |

Set the same variables in your hosting provider (e.g. Vercel project settings)
for deployed environments.

### How search works

Book search calls the **Google Books API** — a single request returns titles,
authors, descriptions, cover images and ISBNs in well under a second. Source
links (Amazon, Libby, Hoopla, Audible, etc.) are generated deterministically.
If Google Books is unavailable or rate-limited, the app transparently falls
back to the **OpenLibrary API** (no key required). The LLM is used only for the
optional similar-books recommender, never for search.

**Firebase Studio Export Date:** 2026-06-05


---

## Previous README.md contents:

i# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
