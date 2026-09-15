# ARNIE.md

Arnas Goldberg's site with an AI stand-in. Visitors chat with "Arnie", a Claude-backed interface over a single public document, `public/arnie.md`.

## How it works

- `public/arnie.md` is the only source of truth. It is served publicly at `/arnie.md`.
- `scripts/gen-arnie.mjs` (runs before `dev` and `build`) copies it into `lib/arnie.generated.ts` for the API route.
- `app/api/chat/route.ts` streams responses from the Claude API with the file as a cached system prompt, an in-memory per-IP rate limit, and caps on turns, input and output length.
- `components/Chat.tsx` renders the stream and expands `[[project:slug]]` and `[[media:/path|caption]]` markers into cards and inline media.
- Case studies live under `/archive/` (noindex) and carry a page-aware chat.

## Run locally

```bash
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm install
npm run dev
```

## Deploy

Import the repo in Vercel, add `ANTHROPIC_API_KEY` (and optionally `ARNIE_MODEL`, `NEXT_PUBLIC_SITE_URL`) under Environment Variables, deploy.
